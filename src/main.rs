use anyhow::{Context, Result};
use clap::{Args, Parser, Subcommand};
use cooldown_registry_proxy::{parse_duration, run_server, validate_policy_files, ServerConfig};
use serde_json::json;
use std::path::PathBuf;

#[derive(Debug, Parser)]
#[command(name = "cooldown-registry-proxy", version, about, long_about = None)]
struct Cli {
    /// Emit machine-readable command output.
    #[arg(long, global = true)]
    json: bool,

    #[command(subcommand)]
    command: Command,
}

#[derive(Debug, Subcommand)]
enum Command {
    /// Run the registry proxy until interrupted.
    Serve(Box<ServeArgs>),
    /// Validate exclusion and advisory files without starting the server.
    Validate(ValidateArgs),
}

#[derive(Debug, Args)]
struct ServeArgs {
    /// Address and port to accept package-manager requests on.
    #[arg(long, default_value = "127.0.0.1:8787")]
    listen: String,
    /// Externally reachable base URL used in rewritten artifact links.
    #[arg(long)]
    public_url: Option<String>,
    /// Minimum package age, such as 7d, 168h, or 30m.
    #[arg(long, default_value = "7d")]
    cooldown: String,
    /// Persistent metadata and artifact cache directory.
    #[arg(long, default_value = "./data/cache")]
    cache_dir: PathBuf,
    /// JSON file containing expiring, version-specific exclusions.
    #[arg(long)]
    exclusions: Option<PathBuf>,
    /// JSON file containing hard-blocked package versions.
    #[arg(long)]
    advisories: Option<PathBuf>,
    /// URL of an advisory JSON feed. May be repeated.
    #[arg(long = "advisory-url")]
    advisory_urls: Vec<String>,
    /// How often remote advisory feeds are refreshed.
    #[arg(long, default_value = "6h")]
    advisory_refresh: String,
    /// JSONL destination for every filtered or refused version.
    #[arg(long, default_value = "./data/refusals.jsonl")]
    audit_log: PathBuf,
    /// Serve existing cache entries and reject every cache miss.
    #[arg(long)]
    offline: bool,
    /// Metadata freshness window before checking upstream again.
    #[arg(long, default_value = "5m")]
    cache_ttl: String,
    /// npm registry base URL.
    #[arg(long, default_value = "https://registry.npmjs.org")]
    npm_upstream: String,
    /// PyPI API base URL.
    #[arg(long, default_value = "https://pypi.org")]
    pypi_upstream: String,
    /// crates.io sparse index base URL.
    #[arg(long, default_value = "https://index.crates.io")]
    cargo_index_upstream: String,
    /// crates.io API base URL.
    #[arg(long, default_value = "https://crates.io")]
    crates_api_upstream: String,
}

#[derive(Debug, Args)]
struct ValidateArgs {
    /// JSON file containing expiring exclusions.
    #[arg(long)]
    exclusions: Option<PathBuf>,
    /// JSON file containing advisory hard blocks.
    #[arg(long)]
    advisories: Option<PathBuf>,
}

fn main() {
    if let Err(error) = execute() {
        eprintln!("error: {error:#}");
        std::process::exit(2);
    }
}

fn execute() -> Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Command::Validate(args) => {
            let summary =
                validate_policy_files(args.exclusions.as_deref(), args.advisories.as_deref())?;
            if cli.json {
                println!("{}", serde_json::to_string(&summary)?);
            } else {
                println!(
                    "policy valid: {} exclusions, {} advisory blocks",
                    summary.exclusions, summary.blocked
                );
            }
            Ok(())
        }
        Command::Serve(args) => {
            let args = *args;
            let cooldown = parse_duration(&args.cooldown).context("invalid --cooldown")?;
            let cache_ttl = parse_duration(&args.cache_ttl).context("invalid --cache-ttl")?;
            let advisory_refresh =
                parse_duration(&args.advisory_refresh).context("invalid --advisory-refresh")?;
            let config = ServerConfig {
                listen: args.listen,
                public_url: args.public_url,
                cooldown,
                cache_dir: args.cache_dir,
                exclusions: args.exclusions,
                advisories: args.advisories,
                advisory_urls: args.advisory_urls,
                advisory_refresh,
                audit_log: args.audit_log,
                offline: args.offline,
                cache_ttl,
                npm_upstream: args.npm_upstream.trim_end_matches('/').to_owned(),
                pypi_upstream: args.pypi_upstream.trim_end_matches('/').to_owned(),
                cargo_index_upstream: args.cargo_index_upstream.trim_end_matches('/').to_owned(),
                crates_api_upstream: args.crates_api_upstream.trim_end_matches('/').to_owned(),
            };
            validate_policy_files(config.exclusions.as_deref(), config.advisories.as_deref())?;
            if cli.json {
                println!(
                    "{}",
                    json!({
                        "event": "starting",
                        "listen": config.listen,
                        "cooldown_seconds": config.cooldown.as_secs(),
                        "offline": config.offline
                    })
                );
            } else {
                eprintln!(
                    "cooldown-registry-proxy v{} listening on {} (cooldown {}s)",
                    env!("CARGO_PKG_VERSION"),
                    config.listen,
                    config.cooldown.as_secs()
                );
            }
            run_server(config)
        }
    }
}
