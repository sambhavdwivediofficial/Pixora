/// POST /api/ico/convert
/// Converts any supported image into a ZIP favicon package.
/// Returns application/zip with favicon.ico + 6 individual PNGs.

use axum::{
    extract::Multipart,
    http::{StatusCode, HeaderValue, header},
    response::{Response, IntoResponse},
};
use serde_json::json;

use crate::services::ico_converter::build_ico_package;
use crate::services::zip_generator::build_zip;
use crate::utils::formats::{ico_input_formats, ext_from_filename};

pub async fn handle_ico_convert(mut multipart: Multipart) -> Response {
    let mut file_data: Option<Vec<u8>> = None;
    let mut filename:  String          = "upload".into();

    while let Ok(Some(field)) = multipart.next_field().await {
        if field.name().unwrap_or("") == "file" {
            filename  = field.file_name().unwrap_or("upload").to_string();
            let bytes = field.bytes().await.unwrap_or_default();
            file_data = Some(bytes.to_vec());
            break;
        }
    }

    let data = match file_data {
        Some(d) => d,
        None    => return err_resp(StatusCode::BAD_REQUEST, "No file field found"),
    };

    // Reject ICO input and unsupported formats
    let ext = ext_from_filename(&filename);
    if ext == "ico" {
        return err_resp(
            StatusCode::BAD_REQUEST,
            "ICO files cannot be converted to ICO. Upload a PNG, JPG, WEBP, etc.",
        );
    }
    if !ico_input_formats().contains(ext.as_str()) {
        return err_resp(
            StatusCode::BAD_REQUEST,
            &format!("Unsupported input format for ICO conversion: {}", ext),
        );
    }

    // Build ICO package
    let package = match build_ico_package(&data, &filename) {
        Ok(p)  => p,
        Err(e) => return err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e),
    };

    // Build ZIP
    let zip_bytes = match build_zip(&package) {
        Ok(z)  => z,
        Err(e) => return err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e),
    };

    let mut headers = axum::http::HeaderMap::new();
    headers.insert(
        header::CONTENT_TYPE,
        HeaderValue::from_static("application/zip"),
    );
    headers.insert(
        header::CONTENT_DISPOSITION,
        HeaderValue::from_static(r#"attachment; filename="pixora_favicon_package.zip""#),
    );
    headers.insert(
        "X-Output-Size",
        HeaderValue::from_str(&zip_bytes.len().to_string())
            .unwrap_or(HeaderValue::from_static("0")),
    );
    headers.insert(
        "Access-Control-Expose-Headers",
        HeaderValue::from_static("X-Output-Size"),
    );

    (StatusCode::OK, headers, axum::body::Body::from(zip_bytes)).into_response()
}

fn err_resp(status: StatusCode, msg: &str) -> Response {
    (status, axum::Json(json!({ "detail": msg }))).into_response()
}