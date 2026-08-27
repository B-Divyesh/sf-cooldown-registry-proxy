//! Network-enforced dependency cooldowns for npm, PyPI, and Cargo.
//!
//! The executable is the supported interface. This crate exposes policy types so
//! documented policy examples can be verified without starting a listener.

use anyhow::{anyhow, bail, Context, Result};
use chrono::{DateTime, Utc};
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::collections::{HashMap, HashSet};
use std::fs::{self, File, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::str::FromStr;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex, RwLock};
use std::thread;
use std::time::{Duration, SystemTime};
use tiny_http::{Header, Method, Request, Response, Server, StatusCode};

#[derive(Debug, Clone)]
pub struct ServerConfig {
    pub listen: String,
    pub public_url: Option<String>,
    pub cooldown: Duration,
    pub cache_dir: PathBuf,
    pub exclusions: Option<PathBuf>,
    pub advisories: Option<PathBuf>,
    pub advisory_urls: Vec<String>,
    pub advisory_refresh: Duration,
    pub audit_log: PathBuf,
    pub offline: bool,
    pub cache_ttl: Duration,
    pub npm_upstream: String,
    pub pypi_upstream: String,
    pub cargo_index_upstream: String,
    pub crates_api_upstream: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Ecosystem {
    Npm,
    Pypi,
    Cargo,
}

impl std::fmt::Display for Ecosystem {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Npm => f.write_str("npm"),
            Self::Pypi => f.write_str("pypi"),
            Self::Cargo => f.write_str("cargo"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Exclusion {
    pub ecosystem: Ecosystem,
    pub package: String,
    pub version: String,
    pub expires: DateTime<Utc>,
    pub reason: String,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ExclusionsFile {
    #[serde(default)]
    pub exclusions: Vec<Exclusion>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct BlockedVersion {
    pub ecosystem: Ecosystem,
    pub package: String,
    pub version: String,
    pub id: String,
    pub reason: String,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdvisoryFile {
    #[serde(default)]
    pub blocked: Vec<BlockedVersion>,
}

#[derive(Debug, Serialize)]
pub struct ValidationSummary {
    pub valid: bool,
    pub exclusions: usize,
    pub blocked: usize,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Decision {
    Allowed,
    Excluded {
        reason: String,
        expires: DateTime<Utc>,
    },
    Cooldown {
        available_at: DateTime<Utc>,
    },
    HardBlocked {
        id: String,
        reason: String,
    },
}

impl Decision {
    fn is_allowed(&self) -> bool {
        matches!(self, Self::Allowed | Self::Excluded { .. })
    }
}

/// Parse an operator duration (`30s`, `15m`, `6h`, or `7d`).
pub fn parse_duration(input: &str) -> Result<Duration> {
    if input.len() < 2 {
        bail!("duration must include a unit: s, m, h, or d");
    }
    let (number, unit) = input.split_at(input.len() - 1);
    let value = u64::from_str(number).context("duration number is not an integer")?;
    if value == 0 {
        bail!("duration must be greater than zero");
    }
    let seconds = match unit {
        "s" => Some(value),
        "m" => value.checked_mul(60),
        "h" => value.checked_mul(3600),
        "d" => value.checked_mul(86400),
        _ => None,
    }
    .ok_or_else(|| anyhow!("duration is too large or has an unsupported unit"))?;
    Ok(Duration::from_secs(seconds))
}

pub fn validate_policy_files(
    exclusions_path: Option<&Path>,
    advisories_path: Option<&Path>,
) -> Result<ValidationSummary> {
    let exclusions = read_exclusions(exclusions_path)?;
    let advisories = read_advisories(advisories_path)?;
    let mut seen = HashSet::new();
    for item in &exclusions.exclusions {
        validate_coordinate(item.ecosystem, &item.package, &item.version)?;
        if item.reason.trim().is_empty() {
            bail!(
                "exclusion reason cannot be empty for {}@{}",
                item.package,
                item.version
            );
        }
        let key = (
            item.ecosystem,
            item.package.to_lowercase(),
            item.version.clone(),
        );
        if !seen.insert(key) {
            bail!("duplicate exclusion for {}@{}", item.package, item.version);
        }
    }
    seen.clear();
    for item in &advisories.blocked {
        validate_coordinate(item.ecosystem, &item.package, &item.version)?;
        if item.id.trim().is_empty() || item.reason.trim().is_empty() {
            bail!(
                "advisory id and reason cannot be empty for {}@{}",
                item.package,
                item.version
            );
        }
        let key = (
            item.ecosystem,
            item.package.to_lowercase(),
            item.version.clone(),
        );
        if !seen.insert(key) {
            bail!(
                "duplicate advisory block for {}@{}",
                item.package,
                item.version
            );
        }
    }
    Ok(ValidationSummary {
        valid: true,
        exclusions: exclusions.exclusions.len(),
        blocked: advisories.blocked.len(),
    })
}

fn validate_coordinate(ecosystem: Ecosystem, package: &str, version: &str) -> Result<()> {
    if package.trim().is_empty() || version.trim().is_empty() {
        bail!("{ecosystem} package and version cannot be empty");
    }
    Ok(())
}

fn read_json<T: for<'de> Deserialize<'de> + Default>(path: Option<&Path>) -> Result<T> {
    let Some(path) = path else {
        return Ok(T::default());
    };
    let file = File::open(path).with_context(|| format!("open {}", path.display()))?;
    serde_json::from_reader(file).with_context(|| format!("parse {}", path.display()))
}

fn read_exclusions(path: Option<&Path>) -> Result<ExclusionsFile> {
    read_json(path)
}

fn read_advisories(path: Option<&Path>) -> Result<AdvisoryFile> {
    read_json(path)
}

struct PolicyStore {
    cooldown: Duration,
    exclusions_path: Option<PathBuf>,
    advisories_path: Option<PathBuf>,
    remote: RwLock<Vec<BlockedVersion>>,
}

impl PolicyStore {
    fn decide(
        &self,
        ecosystem: Ecosystem,
        package: &str,
        version: &str,
        published: DateTime<Utc>,
    ) -> Decision {
        let package_key = package.to_lowercase();
        let mut blocks = match read_advisories(self.advisories_path.as_deref()) {
            Ok(file) => file.blocked,
            Err(error) => {
                return Decision::HardBlocked {
                    id: "POLICY-READ-ERROR".into(),
                    reason: format!("advisory policy could not be read: {error}"),
                }
            }
        };
        blocks.extend(self.remote.read().map(|v| v.clone()).unwrap_or_default());
        if let Some(block) = blocks.iter().find(|item| {
            item.ecosystem == ecosystem
                && item.package.to_lowercase() == package_key
                && item.version == version
        }) {
            return Decision::HardBlocked {
                id: block.id.clone(),
                reason: block.reason.clone(),
            };
        }

        let now = Utc::now();
        let exclusions = match read_exclusions(self.exclusions_path.as_deref()) {
            Ok(file) => file.exclusions,
            Err(error) => {
                return Decision::HardBlocked {
                    id: "POLICY-READ-ERROR".into(),
                    reason: format!("exclusion policy could not be read: {error}"),
                }
            }
        };
        if let Some(exclusion) = exclusions.into_iter().find(|item| {
            item.ecosystem == ecosystem
                && item.package.to_lowercase() == package_key
                && item.version == version
                && item.expires > now
        }) {
            return Decision::Excluded {
                reason: exclusion.reason,
                expires: exclusion.expires,
            };
        }

        let available_at =
            published + chrono::Duration::from_std(self.cooldown).unwrap_or(chrono::Duration::MAX);
        if available_at > now {
            Decision::Cooldown { available_at }
        } else {
            Decision::Allowed
        }
    }
}

struct Cache {
    root: PathBuf,
    ttl: Duration,
    offline: bool,
    client: Client,
    writes: AtomicU64,
}

impl Cache {
    fn new(root: PathBuf, ttl: Duration, offline: bool) -> Result<Self> {
        fs::create_dir_all(root.join("metadata"))?;
        fs::create_dir_all(root.join("artifacts"))?;
        Ok(Self {
            root,
            ttl,
            offline,
            client: Client::builder()
                .user_agent(concat!(
                    "cooldown-registry-proxy/",
                    env!("CARGO_PKG_VERSION")
                ))
                .timeout(Duration::from_secs(30))
                .redirect(reqwest::redirect::Policy::limited(8))
                .build()?,
            writes: AtomicU64::new(1),
        })
    }

    fn get(&self, url: &str, immutable: bool) -> Result<(Vec<u8>, &'static str)> {
        let bucket = if immutable { "artifacts" } else { "metadata" };
        let key = hex::encode(Sha256::digest(url.as_bytes()));
        let path = self.root.join(bucket).join(key);
        let cached = fs::read(&path).ok();
        let fresh = immutable
            || fs::metadata(&path)
                .and_then(|m| m.modified())
                .ok()
                .and_then(|t| SystemTime::now().duration_since(t).ok())
                .map(|age| age <= self.ttl)
                .unwrap_or(false);
        if fresh {
            if let Some(body) = cached {
                return Ok((body, "hit"));
            }
        }
        if self.offline {
            return cached
                .map(|body| (body, "stale"))
                .ok_or_else(|| anyhow!("offline cache miss for {url}"));
        }
        let result = self
            .client
            .get(url)
            .header(
                "Accept",
                "application/json, application/vnd.pypi.simple.v1+json, */*",
            )
            .send()
            .and_then(|response| response.error_for_status())
            .and_then(|response| response.bytes())
            .map(|bytes| bytes.to_vec());
        match result {
            Ok(body) => {
                let temp = path.with_extension(format!(
                    "tmp-{}-{}",
                    std::process::id(),
                    self.writes.fetch_add(1, Ordering::Relaxed)
                ));
                fs::write(&temp, &body)?;
                fs::rename(temp, path)?;
                Ok((body, "miss"))
            }
            Err(error) => cached
                .map(|body| (body, "stale"))
                .ok_or_else(|| anyhow!("upstream request failed for {url}: {error}")),
        }
    }
}

#[derive(Serialize)]
struct AuditEvent<'a> {
    timestamp: DateTime<Utc>,
    request_id: &'a str,
    ecosystem: Ecosystem,
    package: &'a str,
    version: &'a str,
    action: &'a str,
    reason: String,
    available_at: Option<DateTime<Utc>>,
}

struct App {
    config: ServerConfig,
    cache: Cache,
    policy: Arc<PolicyStore>,
    audit: Mutex<File>,
    requests: AtomicU64,
}

#[derive(Debug)]
struct AppResponse {
    status: u16,
    content_type: &'static str,
    body: Vec<u8>,
    cache: Option<&'static str>,
}

impl AppResponse {
    fn json(status: u16, value: Value) -> Self {
        Self {
            status,
            content_type: "application/json; charset=utf-8",
            body: serde_json::to_vec(&value).unwrap_or_else(|_| b"{}".to_vec()),
            cache: None,
        }
    }

    fn text(status: u16, content_type: &'static str, body: impl Into<Vec<u8>>) -> Self {
        Self {
            status,
            content_type,
            body: body.into(),
            cache: None,
        }
    }
}

impl App {
    fn new(config: ServerConfig) -> Result<Arc<Self>> {
        fs::create_dir_all(&config.cache_dir)?;
        if let Some(parent) = config.audit_log.parent() {
            fs::create_dir_all(parent)?;
        }
        let audit = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&config.audit_log)
            .with_context(|| format!("open audit log {}", config.audit_log.display()))?;
        let policy = Arc::new(PolicyStore {
            cooldown: config.cooldown,
            exclusions_path: config.exclusions.clone(),
            advisories_path: config.advisories.clone(),
            remote: RwLock::new(Vec::new()),
        });
        let cache = Cache::new(config.cache_dir.clone(), config.cache_ttl, config.offline)?;
        let app = Arc::new(Self {
            config,
            cache,
            policy,
            audit: Mutex::new(audit),
            requests: AtomicU64::new(1),
        });
        app.refresh_advisories()?;
        Ok(app)
    }

    fn refresh_advisories(&self) -> Result<()> {
        if self.config.advisory_urls.is_empty() {
            return Ok(());
        }
        let mut combined = Vec::new();
        for url in &self.config.advisory_urls {
            let (body, _) = self
                .cache
                .get(url, false)
                .with_context(|| format!("advisory feed refresh failed for {url}"))?;
            let feed: AdvisoryFile = serde_json::from_slice(&body)
                .with_context(|| format!("advisory feed parse failed for {url}"))?;
            combined.extend(feed.blocked);
        }
        let mut remote = self
            .policy
            .remote
            .write()
            .map_err(|_| anyhow!("advisory policy lock is unavailable"))?;
        *remote = combined;
        Ok(())
    }

    fn request_id(&self) -> String {
        format!("crp-{:016x}", self.requests.fetch_add(1, Ordering::Relaxed))
    }

    fn audit_block(
        &self,
        request_id: &str,
        ecosystem: Ecosystem,
        package: &str,
        version: &str,
        decision: &Decision,
    ) {
        let (action, reason, available_at) = match decision {
            Decision::Cooldown { available_at } => (
                "cooldown_block",
                "release is younger than the configured cooldown".to_owned(),
                Some(*available_at),
            ),
            Decision::HardBlocked { id, reason } => {
                ("advisory_block", format!("{id}: {reason}"), None)
            }
            _ => return,
        };
        let event = AuditEvent {
            timestamp: Utc::now(),
            request_id,
            ecosystem,
            package,
            version,
            action,
            reason,
            available_at,
        };
        if let Ok(mut file) = self.audit.lock() {
            if serde_json::to_writer(&mut *file, &event).is_ok() {
                let _ = file.write_all(b"\n");
                let _ = file.flush();
            }
        }
    }

    fn blocked_response(
        &self,
        request_id: &str,
        ecosystem: Ecosystem,
        package: &str,
        version: &str,
        decision: Decision,
    ) -> AppResponse {
        self.audit_block(request_id, ecosystem, package, version, &decision);
        match decision {
            Decision::Cooldown { available_at } => AppResponse::json(
                404,
                json!({
                    "error": "version_in_cooldown",
                    "message": format!("{package}@{version} is quarantined until {}", available_at.to_rfc3339()),
                    "available_at": available_at,
                    "request_id": request_id
                }),
            ),
            Decision::HardBlocked { id, reason } => AppResponse::json(
                451,
                json!({
                    "error": "version_hard_blocked",
                    "message": format!("{package}@{version} is blocked by advisory {id}: {reason}"),
                    "advisory_id": id,
                    "request_id": request_id
                }),
            ),
            _ => AppResponse::json(
                500,
                json!({"error": "invalid_policy_state", "request_id": request_id}),
            ),
        }
    }

    fn handle(&self, method: &Method, raw_url: &str, host: Option<&str>) -> AppResponse {
        let request_id = self.request_id();
        if !matches!(method, Method::Get | Method::Head) {
            return AppResponse::json(
                405,
                json!({"error": "method_not_allowed", "request_id": request_id}),
            );
        }
        let path = raw_url.split('?').next().unwrap_or(raw_url);
        let result = if path == "/healthz" {
            Ok(AppResponse::json(
                200,
                json!({"status": "ok", "version": env!("CARGO_PKG_VERSION")}),
            ))
        } else if path == "/readyz" {
            Ok(AppResponse::json(
                200,
                json!({"status": "ready", "offline": self.config.offline}),
            ))
        } else if let Some(package) = path.strip_prefix("/npm/") {
            self.npm_metadata(package, &request_id, host)
        } else if let Some(route) = path.strip_prefix("/npm-tarball/") {
            self.npm_tarball(route, &request_id)
        } else if path == "/pypi/simple" || path == "/pypi/simple/" {
            Ok(AppResponse::text(
                200,
                "text/html; charset=utf-8",
                "<!doctype html><title>PyPI proxy</title><p>Specify a project name.</p>",
            ))
        } else if let Some(project) = path.strip_prefix("/pypi/simple/") {
            self.pypi_simple(project.trim_end_matches('/'), &request_id, host)
        } else if let Some(route) = path.strip_prefix("/pypi-files/") {
            self.pypi_file(route, &request_id)
        } else if path == "/cargo/config.json" {
            let base = self.public_url(host);
            Ok(AppResponse::json(
                200,
                json!({"dl": format!("{base}/cargo-crates"), "api": self.config.crates_api_upstream}),
            ))
        } else if let Some(route) = path.strip_prefix("/cargo-crates/") {
            self.cargo_crate(route, &request_id)
        } else if let Some(index_path) = path.strip_prefix("/cargo/") {
            self.cargo_index(index_path, &request_id)
        } else {
            Ok(AppResponse::json(
                404,
                json!({
                    "error": "route_not_found",
                    "message": "Use /npm/, /pypi/simple/, or /cargo/ as the client registry base.",
                    "request_id": request_id
                }),
            ))
        };
        match result {
            Ok(response) => response,
            Err(error) => {
                let status = if error.to_string().contains("offline cache miss") {
                    503
                } else {
                    502
                };
                AppResponse::json(
                    status,
                    json!({
                        "error": if status == 503 { "offline_cache_miss" } else { "upstream_error" },
                        "message": error.to_string(),
                        "request_id": request_id
                    }),
                )
            }
        }
    }

    fn public_url(&self, host: Option<&str>) -> String {
        self.config
            .public_url
            .clone()
            .unwrap_or_else(|| format!("http://{}", host.unwrap_or(&self.config.listen)))
            .trim_end_matches('/')
            .to_owned()
    }

    fn npm_packument(&self, encoded: &str) -> Result<(String, Value, &'static str)> {
        let package = urlencoding::decode(encoded)?.into_owned();
        let upstream_path = if package.starts_with('@') {
            package.replace('/', "%2f")
        } else {
            urlencoding::encode(&package).into_owned()
        };
        let url = format!("{}/{}", self.config.npm_upstream, upstream_path);
        let (body, cache) = self.cache.get(&url, false)?;
        let value: Value =
            serde_json::from_slice(&body).context("npm upstream returned invalid JSON")?;
        Ok((package, value, cache))
    }

    fn npm_metadata(
        &self,
        encoded: &str,
        request_id: &str,
        host: Option<&str>,
    ) -> Result<AppResponse> {
        let (package, mut root, cache) = self.npm_packument(encoded)?;
        let times = root
            .get("time")
            .and_then(Value::as_object)
            .cloned()
            .unwrap_or_default();
        let mut allowed = Vec::<(String, DateTime<Utc>)>::new();
        if let Some(versions) = root.get_mut("versions").and_then(Value::as_object_mut) {
            let keys: Vec<String> = versions.keys().cloned().collect();
            for version in keys {
                let published = times
                    .get(&version)
                    .and_then(Value::as_str)
                    .and_then(parse_time);
                let Some(published) = published else {
                    versions.remove(&version);
                    self.audit_block(
                        request_id,
                        Ecosystem::Npm,
                        &package,
                        &version,
                        &Decision::HardBlocked {
                            id: "MISSING-TIMESTAMP".into(),
                            reason: "upstream did not provide a publish time".into(),
                        },
                    );
                    continue;
                };
                let decision = self
                    .policy
                    .decide(Ecosystem::Npm, &package, &version, published);
                if !decision.is_allowed() {
                    versions.remove(&version);
                    self.audit_block(request_id, Ecosystem::Npm, &package, &version, &decision);
                    continue;
                }
                allowed.push((version.clone(), published));
                if let Some(item) = versions.get_mut(&version) {
                    if let Some(dist) = item.get_mut("dist").and_then(Value::as_object_mut) {
                        let filename = dist
                            .get("tarball")
                            .and_then(Value::as_str)
                            .and_then(|url| url.rsplit('/').next())
                            .unwrap_or("package.tgz");
                        dist.insert(
                            "tarball".into(),
                            Value::String(format!(
                                "{}/npm-tarball/{}/{}/{}",
                                self.public_url(host),
                                urlencoding::encode(&package),
                                urlencoding::encode(&version),
                                urlencoding::encode(filename)
                            )),
                        );
                    }
                }
            }
        }
        allowed.sort_by_key(|(_, time)| *time);
        if let Some(tags) = root.get_mut("dist-tags").and_then(Value::as_object_mut) {
            let allowed_set: HashSet<&str> = allowed.iter().map(|(v, _)| v.as_str()).collect();
            tags.retain(|_, version| {
                version
                    .as_str()
                    .map(|v| allowed_set.contains(v))
                    .unwrap_or(false)
            });
            if !tags.contains_key("latest") {
                if let Some((version, _)) = allowed.last() {
                    tags.insert("latest".into(), Value::String(version.clone()));
                }
            }
        }
        let mut response = AppResponse::json(200, root);
        response.cache = Some(cache);
        Ok(response)
    }

    fn npm_tarball(&self, route: &str, request_id: &str) -> Result<AppResponse> {
        let parts: Vec<&str> = route.split('/').collect();
        if parts.len() < 3 {
            bail!("invalid npm tarball route")
        }
        let package = urlencoding::decode(parts[0])?.into_owned();
        let version = urlencoding::decode(parts[1])?.into_owned();
        let (_, root, _) = self.npm_packument(parts[0])?;
        let published = root
            .get("time")
            .and_then(|v| v.get(&version))
            .and_then(Value::as_str)
            .and_then(parse_time)
            .ok_or_else(|| anyhow!("npm publish time not found for {package}@{version}"))?;
        let decision = self
            .policy
            .decide(Ecosystem::Npm, &package, &version, published);
        if !decision.is_allowed() {
            return Ok(self.blocked_response(
                request_id,
                Ecosystem::Npm,
                &package,
                &version,
                decision,
            ));
        }
        let url = root
            .get("versions")
            .and_then(|v| v.get(&version))
            .and_then(|v| v.get("dist"))
            .and_then(|v| v.get("tarball"))
            .and_then(Value::as_str)
            .ok_or_else(|| anyhow!("npm tarball URL not found for {package}@{version}"))?;
        let (body, cache) = self.cache.get(url, true)?;
        let mut response = AppResponse::text(200, "application/octet-stream", body);
        response.cache = Some(cache);
        Ok(response)
    }

    fn pypi_json(&self, encoded: &str) -> Result<(String, Value, &'static str)> {
        let project = urlencoding::decode(encoded)?.into_owned();
        let url = format!(
            "{}/pypi/{}/json",
            self.config.pypi_upstream,
            urlencoding::encode(&project)
        );
        let (body, cache) = self.cache.get(&url, false)?;
        let value = serde_json::from_slice(&body).context("PyPI upstream returned invalid JSON")?;
        Ok((project, value, cache))
    }

    fn pypi_simple(
        &self,
        encoded: &str,
        request_id: &str,
        host: Option<&str>,
    ) -> Result<AppResponse> {
        let (project, root, cache) = self.pypi_json(encoded)?;
        let canonical = root
            .pointer("/info/name")
            .and_then(Value::as_str)
            .unwrap_or(&project);
        let mut html = format!("<!doctype html><html><head><meta name=\"pypi:repository-version\" content=\"1.1\"><title>Links for {}</title></head><body><h1>Links for {}</h1>\n", html_escape(canonical), html_escape(canonical));
        if let Some(releases) = root.get("releases").and_then(Value::as_object) {
            for (version, files) in releases {
                for file in files.as_array().into_iter().flatten() {
                    let Some(published) = file
                        .get("upload_time_iso_8601")
                        .or_else(|| file.get("upload_time"))
                        .and_then(Value::as_str)
                        .and_then(parse_time)
                    else {
                        continue;
                    };
                    let decision =
                        self.policy
                            .decide(Ecosystem::Pypi, canonical, version, published);
                    if !decision.is_allowed() {
                        self.audit_block(
                            request_id,
                            Ecosystem::Pypi,
                            canonical,
                            version,
                            &decision,
                        );
                        continue;
                    }
                    let Some(filename) = file.get("filename").and_then(Value::as_str) else {
                        continue;
                    };
                    let hash = file
                        .pointer("/digests/sha256")
                        .and_then(Value::as_str)
                        .unwrap_or("");
                    let requires = file
                        .get("requires_python")
                        .and_then(Value::as_str)
                        .map(|v| format!(" data-requires-python=\"{}\"", html_escape(v)))
                        .unwrap_or_default();
                    let yanked = match file.get("yanked").and_then(Value::as_bool) {
                        Some(true) => " data-yanked=\"true\"",
                        _ => "",
                    };
                    html.push_str(&format!(
                        "<a href=\"{}/pypi-files/{}/{}#sha256={}\"{}{}>{}</a><br>\n",
                        self.public_url(host),
                        urlencoding::encode(canonical),
                        urlencoding::encode(filename),
                        hash,
                        requires,
                        yanked,
                        html_escape(filename)
                    ));
                }
            }
        }
        html.push_str("</body></html>");
        let mut response = AppResponse::text(200, "text/html; charset=utf-8", html);
        response.cache = Some(cache);
        Ok(response)
    }

    fn pypi_file(&self, route: &str, request_id: &str) -> Result<AppResponse> {
        let mut parts = route.splitn(2, '/');
        let project_encoded = parts
            .next()
            .ok_or_else(|| anyhow!("missing PyPI project"))?;
        let filename = urlencoding::decode(
            parts
                .next()
                .ok_or_else(|| anyhow!("missing PyPI filename"))?,
        )?
        .into_owned();
        let (project, root, _) = self.pypi_json(project_encoded)?;
        let canonical = root
            .pointer("/info/name")
            .and_then(Value::as_str)
            .unwrap_or(&project);
        for (version, files) in root
            .get("releases")
            .and_then(Value::as_object)
            .into_iter()
            .flatten()
        {
            for file in files.as_array().into_iter().flatten() {
                if file.get("filename").and_then(Value::as_str) != Some(&filename) {
                    continue;
                }
                let published = file
                    .get("upload_time_iso_8601")
                    .or_else(|| file.get("upload_time"))
                    .and_then(Value::as_str)
                    .and_then(parse_time)
                    .ok_or_else(|| anyhow!("PyPI upload time missing for {filename}"))?;
                let decision = self
                    .policy
                    .decide(Ecosystem::Pypi, canonical, version, published);
                if !decision.is_allowed() {
                    return Ok(self.blocked_response(
                        request_id,
                        Ecosystem::Pypi,
                        canonical,
                        version,
                        decision,
                    ));
                }
                let url = file
                    .get("url")
                    .and_then(Value::as_str)
                    .ok_or_else(|| anyhow!("PyPI file URL missing"))?;
                let (body, cache) = self.cache.get(url, true)?;
                let mut response = AppResponse::text(200, "application/octet-stream", body);
                response.cache = Some(cache);
                return Ok(response);
            }
        }
        Ok(AppResponse::json(
            404,
            json!({"error": "file_not_found", "request_id": request_id}),
        ))
    }

    fn cargo_versions(&self, crate_name: &str) -> Result<HashMap<String, DateTime<Utc>>> {
        let url = format!(
            "{}/api/v1/crates/{}",
            self.config.crates_api_upstream,
            urlencoding::encode(crate_name)
        );
        let (body, _) = self.cache.get(&url, false)?;
        let root: Value =
            serde_json::from_slice(&body).context("crates.io API returned invalid JSON")?;
        let mut versions = HashMap::new();
        for item in root
            .get("versions")
            .and_then(Value::as_array)
            .into_iter()
            .flatten()
        {
            if let (Some(version), Some(created)) = (
                item.get("num").and_then(Value::as_str),
                item.get("created_at")
                    .and_then(Value::as_str)
                    .and_then(parse_time),
            ) {
                versions.insert(version.to_owned(), created);
            }
        }
        Ok(versions)
    }

    fn cargo_index(&self, index_path: &str, request_id: &str) -> Result<AppResponse> {
        let url = format!("{}/{}", self.config.cargo_index_upstream, index_path);
        let (body, cache) = self.cache.get(&url, false)?;
        let source =
            String::from_utf8(body).context("Cargo sparse index returned non-UTF-8 data")?;
        let crate_name = source
            .lines()
            .find_map(|line| {
                serde_json::from_str::<Value>(line)
                    .ok()?
                    .get("name")?
                    .as_str()
                    .map(str::to_owned)
            })
            .ok_or_else(|| anyhow!("Cargo sparse index contained no versions"))?;
        let times = self.cargo_versions(&crate_name)?;
        let mut output = String::new();
        for line in source.lines() {
            let Ok(value) = serde_json::from_str::<Value>(line) else {
                continue;
            };
            let Some(version) = value.get("vers").and_then(Value::as_str) else {
                continue;
            };
            let Some(published) = times.get(version).copied() else {
                self.audit_block(
                    request_id,
                    Ecosystem::Cargo,
                    &crate_name,
                    version,
                    &Decision::HardBlocked {
                        id: "MISSING-TIMESTAMP".into(),
                        reason: "crates.io API did not provide a publish time".into(),
                    },
                );
                continue;
            };
            let decision = self
                .policy
                .decide(Ecosystem::Cargo, &crate_name, version, published);
            if decision.is_allowed() {
                output.push_str(line);
                output.push('\n');
            } else {
                self.audit_block(
                    request_id,
                    Ecosystem::Cargo,
                    &crate_name,
                    version,
                    &decision,
                );
            }
        }
        let mut response = AppResponse::text(200, "text/plain; charset=utf-8", output);
        response.cache = Some(cache);
        Ok(response)
    }

    fn cargo_crate(&self, route: &str, request_id: &str) -> Result<AppResponse> {
        let parts: Vec<&str> = route.trim_end_matches('/').split('/').collect();
        if parts.len() != 3 || parts[2] != "download" {
            bail!("invalid Cargo download route")
        }
        let crate_name = urlencoding::decode(parts[0])?.into_owned();
        let version = urlencoding::decode(parts[1])?.into_owned();
        let published = self
            .cargo_versions(&crate_name)?
            .get(&version)
            .copied()
            .ok_or_else(|| anyhow!("crate version not found: {crate_name}@{version}"))?;
        let decision = self
            .policy
            .decide(Ecosystem::Cargo, &crate_name, &version, published);
        if !decision.is_allowed() {
            return Ok(self.blocked_response(
                request_id,
                Ecosystem::Cargo,
                &crate_name,
                &version,
                decision,
            ));
        }
        let url = format!(
            "{}/api/v1/crates/{}/{}/download",
            self.config.crates_api_upstream,
            urlencoding::encode(&crate_name),
            urlencoding::encode(&version)
        );
        let (mut body, mut cache) = self.cache.get(&url, true)?;
        // crates.io may answer the API download route with a JSON pointer rather
        // than an HTTP redirect. Follow that pointer without exposing it to Cargo,
        // which expects the response body to be the checksummed .crate archive.
        if let Ok(pointer) = serde_json::from_slice::<Value>(&body) {
            if let Some(download_url) = pointer.get("url").and_then(Value::as_str) {
                (body, cache) = self.cache.get(download_url, true)?;
            }
        }
        let mut response = AppResponse::text(200, "application/octet-stream", body);
        response.cache = Some(cache);
        Ok(response)
    }
}

pub fn run_server(config: ServerConfig) -> Result<()> {
    let app = App::new(config)?;
    let server = Server::http(&app.config.listen).map_err(|error| anyhow!(error.to_string()))?;
    if !app.config.advisory_urls.is_empty() && !app.config.offline {
        let weak = Arc::downgrade(&app);
        let interval = app.config.advisory_refresh;
        thread::spawn(move || loop {
            thread::sleep(interval);
            let Some(app) = weak.upgrade() else { break };
            if let Err(error) = app.refresh_advisories() {
                eprintln!("{error:#}; retaining the last valid advisory snapshot");
            }
        });
    }
    for request in server.incoming_requests() {
        let app = Arc::clone(&app);
        thread::spawn(move || respond(app, request));
    }
    Ok(())
}

fn respond(app: Arc<App>, request: Request) {
    let host = request
        .headers()
        .iter()
        .find(|h| h.field.equiv("Host"))
        .map(|h| h.value.as_str());
    let result = app.handle(request.method(), request.url(), host);
    let is_head = request.method() == &Method::Head;
    let mut response = Response::from_data(if is_head { Vec::new() } else { result.body })
        .with_status_code(StatusCode(result.status));
    if let Ok(header) = Header::from_bytes("Content-Type", result.content_type) {
        response.add_header(header);
    }
    if let Ok(header) = Header::from_bytes("X-Content-Type-Options", "nosniff") {
        response.add_header(header);
    }
    if let Ok(header) = Header::from_bytes(
        "Cache-Control",
        if result.content_type == "application/octet-stream" {
            "public, max-age=31536000, immutable"
        } else {
            "no-cache"
        },
    ) {
        response.add_header(header);
    }
    if let Some(cache) = result.cache {
        if let Ok(header) = Header::from_bytes("X-Cooldown-Cache", cache) {
            response.add_header(header);
        }
    }
    let _ = request.respond(response);
}

fn parse_time(value: &str) -> Option<DateTime<Utc>> {
    DateTime::parse_from_rfc3339(value)
        .ok()
        .map(|time| time.with_timezone(&Utc))
}

fn html_escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    #[test]
    fn documented_durations_parse() {
        assert_eq!(parse_duration("7d").unwrap(), Duration::from_secs(604_800));
        assert_eq!(
            parse_duration("168h").unwrap(),
            Duration::from_secs(604_800)
        );
        assert!(parse_duration("0d").is_err());
        assert!(parse_duration("week").is_err());
    }

    #[test]
    fn advisory_wins_over_exclusion() {
        let dir = std::env::temp_dir().join(format!("crp-test-{}", std::process::id()));
        let _ = fs::create_dir_all(&dir);
        let exclusions_path = dir.join("exclusions.json");
        let advisories_path = dir.join("advisories.json");
        fs::write(&exclusions_path, r#"{"exclusions":[{"ecosystem":"npm","package":"demo","version":"1.0.0","expires":"2099-01-01T00:00:00Z","reason":"reviewed"}]}"#).unwrap();
        fs::write(&advisories_path, r#"{"blocked":[{"ecosystem":"npm","package":"demo","version":"1.0.0","id":"MAL-1","reason":"malware"}]}"#).unwrap();
        let store = PolicyStore {
            cooldown: Duration::from_secs(604800),
            exclusions_path: Some(exclusions_path),
            advisories_path: Some(advisories_path),
            remote: RwLock::new(Vec::new()),
        };
        let published = Utc.with_ymd_and_hms(2098, 12, 30, 0, 0, 0).unwrap();
        assert!(matches!(
            store.decide(Ecosystem::Npm, "demo", "1.0.0", published),
            Decision::HardBlocked { .. }
        ));
    }

    #[test]
    fn active_exclusion_allows_a_young_release() {
        let dir = std::env::temp_dir().join(format!("crp-exclusion-test-{}", std::process::id()));
        let _ = fs::create_dir_all(&dir);
        let path = dir.join("exclusions.json");
        fs::write(&path, r#"{"exclusions":[{"ecosystem":"pypi","package":"demo","version":"2.0.0","expires":"2099-01-01T00:00:00Z","reason":"security fix"}]}"#).unwrap();
        let store = PolicyStore {
            cooldown: Duration::from_secs(604800),
            exclusions_path: Some(path),
            advisories_path: None,
            remote: RwLock::new(Vec::new()),
        };
        assert!(matches!(
            store.decide(Ecosystem::Pypi, "Demo", "2.0.0", Utc::now()),
            Decision::Excluded { .. }
        ));
    }

    #[test]
    fn cooldown_blocks_a_fresh_release() {
        let store = PolicyStore {
            cooldown: Duration::from_secs(604800),
            exclusions_path: None,
            advisories_path: None,
            remote: RwLock::new(Vec::new()),
        };
        assert!(matches!(
            store.decide(Ecosystem::Cargo, "demo", "3.0.0", Utc::now()),
            Decision::Cooldown { .. }
        ));
        assert!(matches!(
            store.decide(
                Ecosystem::Cargo,
                "demo",
                "2.0.0",
                Utc::now() - chrono::Duration::days(8)
            ),
            Decision::Allowed
        ));
    }

    #[test]
    fn policy_validation_rejects_duplicate_blocks() {
        let dir = std::env::temp_dir().join(format!("crp-validation-test-{}", std::process::id()));
        let _ = fs::create_dir_all(&dir);
        let path = dir.join("advisories.json");
        fs::write(&path, r#"{"blocked":[{"ecosystem":"cargo","package":"x","version":"1","id":"A","reason":"bad"},{"ecosystem":"cargo","package":"X","version":"1","id":"B","reason":"worse"}]}"#).unwrap();
        assert!(validate_policy_files(None, Some(&path)).is_err());
    }

    #[test]
    fn npm_metadata_and_direct_download_share_the_cooldown() {
        let upstream = Server::http("127.0.0.1:0").unwrap();
        let upstream_url = format!("http://{}", upstream.server_addr());
        let old_time = (Utc::now() - chrono::Duration::days(10)).to_rfc3339();
        let fresh_time = Utc::now().to_rfc3339();
        let packument = json!({
            "name": "demo",
            "dist-tags": {"latest": "2.0.0"},
            "time": {"1.0.0": old_time, "2.0.0": fresh_time},
            "versions": {
                "1.0.0": {"dist": {"tarball": format!("{upstream_url}/demo-1.0.0.tgz")}},
                "2.0.0": {"dist": {"tarball": format!("{upstream_url}/demo-2.0.0.tgz")}}
            }
        });
        let upstream_thread = thread::spawn(move || {
            for _ in 0..2 {
                let request = upstream.recv().unwrap();
                request
                    .respond(Response::from_string(packument.to_string()).with_header(
                        Header::from_bytes("Content-Type", "application/json").unwrap(),
                    ))
                    .unwrap();
            }
        });

        let dir = std::env::temp_dir().join(format!(
            "crp-npm-integration-{}-{}",
            std::process::id(),
            Utc::now().timestamp_nanos_opt().unwrap_or_default()
        ));
        let config = ServerConfig {
            listen: "127.0.0.1:0".into(),
            public_url: Some("http://proxy.test".into()),
            cooldown: Duration::from_secs(7 * 86_400),
            cache_dir: dir.join("cache"),
            exclusions: None,
            advisories: None,
            advisory_urls: Vec::new(),
            advisory_refresh: Duration::from_secs(3600),
            audit_log: dir.join("audit.jsonl"),
            offline: false,
            cache_ttl: Duration::from_secs(0),
            npm_upstream: upstream_url,
            pypi_upstream: "http://unused.test".into(),
            cargo_index_upstream: "http://unused.test".into(),
            crates_api_upstream: "http://unused.test".into(),
        };
        let app = App::new(config).unwrap();
        let metadata = app.handle(&Method::Get, "/npm/demo", Some("proxy.test"));
        assert_eq!(metadata.status, 200);
        let value: Value = serde_json::from_slice(&metadata.body).unwrap();
        assert!(value["versions"].get("1.0.0").is_some());
        assert!(value["versions"].get("2.0.0").is_none());
        assert_eq!(value["dist-tags"]["latest"], "1.0.0");
        assert!(value["versions"]["1.0.0"]["dist"]["tarball"]
            .as_str()
            .unwrap()
            .starts_with("http://proxy.test/npm-tarball/"));

        let direct = app.handle(
            &Method::Get,
            "/npm-tarball/demo/2.0.0/demo-2.0.0.tgz",
            Some("proxy.test"),
        );
        assert_eq!(direct.status, 404);
        let refusal: Value = serde_json::from_slice(&direct.body).unwrap();
        assert_eq!(refusal["error"], "version_in_cooldown");
        upstream_thread.join().unwrap();
        let audit = fs::read_to_string(dir.join("audit.jsonl")).unwrap();
        assert!(audit.contains("cooldown_block"));
    }
}
