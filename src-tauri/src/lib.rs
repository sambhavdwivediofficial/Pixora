/// Pixora — shared library.
/// This module builds the Axum router that is used by:
///   1. The standalone HTTP server binary (cargo run --bin pixora-server)
///   2. The Tauri desktop app (embedded local server on port 8599)

pub mod commands;
pub mod services;
pub mod utils;

use axum::{
    Router,
    routing::{get, post},
    http::Method,
    response::Json,
};
use tower_http::cors::{CorsLayer, Any};
use serde_json::json;

use commands::validate::handle_validate;
use commands::convert::handle_convert;
use commands::metadata::{handle_extract, handle_strip};
use commands::ico::handle_ico_convert;

/// Build and return the full Axum application router.
/// Called from both main.rs (server) and the Tauri setup hook (app).
pub fn build_router(_allowed_origins: Vec<String>) -> Router {
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any)
        .allow_origin(Any)  // Frontend is always localhost — fine for local-only server
        .expose_headers(Any);

    Router::new()
        // Health
        .route("/",              get(root_handler))
        .route("/health",        get(health_handler))
        // Validate
        .route("/api/validate",          post(handle_validate))
        // Convert
        .route("/api/convert",           post(handle_convert))
        // Metadata
        .route("/api/metadata/extract",  post(handle_extract))
        .route("/api/metadata/strip",    post(handle_strip))
        // ICO
        .route("/api/ico/convert",       post(handle_ico_convert))
        // CORS
        .layer(cors)
}

async fn root_handler() -> Json<serde_json::Value> {
    Json(json!({
        "service": "Pixora Rust Backend",
        "status":  "running",
        "version": "1.0.0",
        "backend": "Rust",
    }))
}

async fn health_handler() -> Json<serde_json::Value> {
    Json(json!({ "backend": "Rust", "status": "ok" }))
}

/// Tauri entry point — only compiled when `desktop` feature is active.
#[cfg(feature = "desktop")]
pub fn run_tauri_app() {
    use std::thread;
    use std::net::SocketAddr;

    // Start embedded HTTP server on port 8599 in a background thread
    thread::spawn(|| {
        let rt = tokio::runtime::Runtime::new().expect("Failed to create Tokio runtime");
        rt.block_on(async {
            let app  = build_router(vec![]);
            let addr = SocketAddr::from(([127, 0, 0, 1], 8599));
            tracing::info!("Pixora Rust embedded server listening on {}", addr);
            let listener = tokio::net::TcpListener::bind(addr)
                .await
                .expect("Failed to bind port 8599");
            axum::serve(listener, app)
                .await
                .expect("Embedded server crashed");
        });
    });

    // Launch Tauri window
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}