FROM rust:1.85-slim-bookworm AS builder
WORKDIR /build
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --locked --release

FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --uid 10001 --home /var/lib/cooldown cooldown \
    && install -d -o cooldown -g cooldown /var/lib/cooldown /var/log/cooldown
COPY --from=builder /build/target/release/cooldown-registry-proxy /usr/local/bin/cooldown-registry-proxy
USER cooldown
EXPOSE 8787
ENTRYPOINT ["cooldown-registry-proxy"]
CMD ["serve", "--listen", "0.0.0.0:8787", "--public-url", "http://localhost:8787", "--cache-dir", "/var/lib/cooldown/cache", "--audit-log", "/var/log/cooldown/refusals.jsonl"]

