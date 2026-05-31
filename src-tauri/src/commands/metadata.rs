/// POST /api/metadata/extract — returns JSON metadata
/// POST /api/metadata/strip  — returns stripped image bytes

use axum::{
    extract::Multipart,
    http::{StatusCode, HeaderValue, header},
    response::{Response, IntoResponse, Json},
};
use serde_json::{json, Value};

use crate::services::metadata_handler::{extract_metadata, strip_metadata};
use crate::utils::formats::{normalize_format, get_mime, ext_from_filename};

pub async fn handle_extract(mut multipart: Multipart) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let (data, filename) = read_file(&mut multipart).await?;
    let meta = extract_metadata(&data, &filename);
    Ok(Json(json!({ "metadata": meta })))
}

pub async fn handle_strip(mut multipart: Multipart) -> Response {
    let mut file_data:     Option<Vec<u8>> = None;
    let mut filename:      String          = "upload".into();
    let mut target_format: String          = String::new();

    while let Ok(Some(field)) = multipart.next_field().await {
        match field.name().unwrap_or("") {
            "file" => {
                filename  = field.file_name().unwrap_or("upload").to_string();
                let bytes = field.bytes().await.unwrap_or_default();
                file_data = Some(bytes.to_vec());
            }
            "target_format" => {
                target_format = field.text().await.unwrap_or_default();
            }
            _ => {}
        }
    }

    let data = match file_data {
        Some(d) => d,
        None    => return err_resp(StatusCode::BAD_REQUEST, "No file field"),
    };

    let detected_ext = ext_from_filename(&filename);

    let format = if target_format.trim().is_empty() {
        detected_ext.as_str()
    } else {
        target_format.as_str()
    };
    
    let tgt = normalize_format(format);

    match strip_metadata(&data, &tgt) {
        Ok(bytes) => {
            let mime = get_mime(&tgt);
            let mut resp = (StatusCode::OK, axum::body::Body::from(bytes)).into_response();
            resp.headers_mut().insert(
                header::CONTENT_TYPE,
                HeaderValue::from_static(mime),
            );
            resp
        }
        Err(e) => err_resp(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

async fn read_file(
    multipart: &mut Multipart,
) -> Result<(Vec<u8>, String), (StatusCode, Json<Value>)> {
    while let Ok(Some(field)) = multipart.next_field().await {
        if field.name().unwrap_or("") == "file" {
            let fname = field.file_name().unwrap_or("upload").to_string();
            let bytes = field.bytes().await.map_err(|e| {
                (StatusCode::BAD_REQUEST, Json(json!({ "detail": e.to_string() })))
            })?;
            return Ok((bytes.to_vec(), fname));
        }
    }
    Err((StatusCode::BAD_REQUEST, Json(json!({ "detail": "No file field found" }))))
}

fn err_resp(status: StatusCode, msg: &str) -> Response {
    (status, axum::Json(json!({ "detail": msg }))).into_response()
}