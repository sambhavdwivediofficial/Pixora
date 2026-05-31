#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
/// Pixora — Rust Backend Entry Point
///
/// Two modes, one binary:
///
///   Standalone HTTP server  →  cargo run --bin pixora-server
///                               Listens on 0.0.0.0:8599
///
///   Tauri desktop app       →  cargo tauri dev  /  cargo tauri build
///                               Embeds the server on 127.0.0.1:8599
///                               and opens the Next.js frontend in a window.

// Tauri requires this on Windows in release mode


use std::net::SocketAddr;
use dotenvy::dotenv;
use tracing_subscriber::{fmt, EnvFilter};
use tracing_subscriber::prelude::*;

#[cfg(feature = "desktop")]
fn main() {
    pixora_lib::run_tauri_app();
}

#[cfg(not(feature = "desktop"))]
#[tokio::main]
async fn main() {
    // Load .env if present
    dotenv().ok();

    // Logging
    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .with(fmt::layer().pretty())
        .init();

    let port: u16 = std::env::var("RUST_PORT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(8599);

    let host = std::env::var("RUST_HOST")
        .unwrap_or_else(|_| "0.0.0.0".into());

    let addr: SocketAddr = format!("{}:{}", host, port)
        .parse()
        .expect("Invalid bind address");

    let allowed_origins: Vec<String> = std::env::var("ALLOWED_ORIGINS")
        .unwrap_or_else(|_| "http://localhost:9539".into())
        .split(',')
        .map(str::trim)
        .map(String::from)
        .collect();

    tracing::info!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    tracing::info!(" Pixora Rust Backend");
    tracing::info!(" Listening on http://{}", addr);
    tracing::info!(" Docs: http://{}/health", addr);
    tracing::info!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    let app = pixora_lib::build_router(allowed_origins);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind address — is port 8599 already in use?");

    axum::serve(listener, app)
        .await
        .expect("Server error");
}