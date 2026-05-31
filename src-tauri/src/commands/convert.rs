/// POST /api/convert
/// Converts an uploaded image to the specified output format.
/// Returns raw image bytes with metadata in response headers.

use axum::{
    extract::Multipart,
    http::{StatusCode, HeaderMap, HeaderValue, header},
    response::{Response, IntoResponse},
    body::Body,
};
use serde_json::json;

use crate::services::converter::convert_image;
use crate::utils::formats::{normalize_format, output_formats};
// use crate::commands::validate::extract_file;

pub async fn handle_convert(mut multipart: Multipart) -> Response {
    // --- Parse multipart fields ---
    let mut file_data:       Option<Vec<u8>> = None;
    let mut filename:        String          = "upload".into();
    let mut target_format:   String          = String::new();
    let mut width:           Option<u32>     = None;
    let mut height:          Option<u32>     = None;
    let mut preserve_aspect: bool            = true;
    let mut quality:         u8              = 90;
    let mut preserve_meta:   bool            = true;

    while let Ok(Some(field)) = multipart.next_field().await {
        let name = field.name().unwrap_or("").to_string();
        match name.as_str() {
            "file" => {
                filename  = field.file_name().unwrap_or("upload").to_string();
                let bytes = field.bytes().await.unwrap_or_default();
                file_data = Some(bytes.to_vec());
            }
            "target_format" => {
                target_format = field.text().await.unwrap_or_default();
            }
            "width" => {
                width = field.text().await.ok()
                    .and_then(|v| v.parse::<u32>().ok())
                    .filter(|&v| v > 0);
            }
            "height" => {
                height = field.text().await.ok()
                    .and_then(|v| v.parse::<u32>().ok())
                    .filter(|&v| v > 0);
            }
            "preserve_aspect" => {
                preserve_aspect = field.text().await
                    .map(|v| v != "false" && v != "0")
                    .unwrap_or(true);
            }
            "quality" => {
                quality = field.text().await.ok()
                    .and_then(|v| v.parse::<u8>().ok())
                    .unwrap_or(90)
                    .clamp(1, 100);
            }
            "preserve_metadata" => {
                preserve_meta = field.text().await
                    .map(|v| v != "false" && v != "0")
                    .unwrap_or(true);
            }
            _ => {}
        }
    }

    let data = match file_data {
        Some(d) => d,
        None    => return error_response(StatusCode::BAD_REQUEST, "No file field found"),
    };

    let tgt = normalize_format(&target_format);

    if tgt.is_empty() {
        return error_response(StatusCode::BAD_REQUEST, "target_format is required");
    }
    if !output_formats().contains(tgt.as_str()) {
        return error_response(
            StatusCode::BAD_REQUEST,
            &format!("Unsupported output format: {}", tgt),
        );
    }

    // --- Convert ---
    match convert_image(&data, &filename, &tgt, width, height, preserve_aspect, quality, preserve_meta) {
        Ok(result) => {
            let ext = if tgt == "jpeg" { "jpg" } else { tgt.as_str() };
            let mut headers = HeaderMap::new();

            headers.insert("X-Output-Width",  hval(result.width.to_string()));
            headers.insert("X-Output-Height", hval(result.height.to_string()));
            headers.insert("X-Output-Size",   hval(result.bytes.len().to_string()));
            headers.insert("X-Output-Format", hval(tgt.to_uppercase()));
            headers.insert(
                header::CONTENT_TYPE,
                HeaderValue::from_static(result.mime),
            );
            headers.insert(
                header::CONTENT_DISPOSITION,
                hval(format!("attachment; filename=\"pixora_converted.{}\"", ext)),
            );
            // Expose custom headers to browser (CORS)
            headers.insert(
                "Access-Control-Expose-Headers",
                HeaderValue::from_static(
                    "X-Output-Width, X-Output-Height, X-Output-Size, X-Output-Format",
                ),
            );

            (StatusCode::OK, headers, Body::from(result.bytes)).into_response()
        }
        Err(e) => error_response(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()),
    }
}

fn hval(s: impl Into<String>) -> HeaderValue {
    HeaderValue::from_str(&s.into()).unwrap_or(HeaderValue::from_static(""))
}

fn error_response(status: StatusCode, msg: &str) -> Response {
    let body = axum::Json(json!({ "detail": msg }));
    (status, body).into_response()
}