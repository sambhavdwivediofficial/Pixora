/// POST /api/validate
/// Validates an uploaded image and returns format, dimensions, size.

use axum::{
    extract::Multipart,
    http::StatusCode,
    response::Json,
};
use serde_json::{json, Value};

use crate::services::validator::validate_image;

pub async fn handle_validate(mut multipart: Multipart) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let (data, filename) = extract_file(&mut multipart).await?;

    let result = validate_image(&data, &filename);

    Ok(Json(json!({
        "valid":      result.valid,
        "format":     result.format,
        "width":      result.width,
        "height":     result.height,
        "size_bytes": result.size_bytes,
        "message":    result.message,
    })))
}

/// Extract the `file` field from multipart, returning (bytes, filename).
pub async fn extract_file(
    multipart: &mut Multipart,
) -> Result<(Vec<u8>, String), (StatusCode, Json<Value>)> {
    while let Ok(Some(field)) = multipart.next_field().await {
        let name = field.name().unwrap_or("").to_string();
        if name == "file" {
            let filename = field
                .file_name()
                .unwrap_or("upload")
                .to_string();
            let data = field.bytes().await.map_err(|e| {
                (
                    StatusCode::BAD_REQUEST,
                    Json(json!({ "detail": format!("Failed to read file: {}", e) })),
                )
            })?;
            return Ok((data.to_vec(), filename));
        }
    }

    Err((
        StatusCode::BAD_REQUEST,
        Json(json!({ "detail": "No file field found in request" })),
    ))
}