/// Metadata extraction and stripping for Pixora Rust backend.

use std::collections::HashMap;
use std::io::Cursor;

// use image::DynamicImage;
use serde_json::{json, Value};


/// Extract image metadata. Returns a JSON Value with available fields.
pub fn extract_metadata(data: &[u8], filename: &str) -> Value {
    let mut meta: HashMap<&str, Value> = HashMap::new();

    // Basic image info via image crate
    if let Ok(img) = image::load_from_memory(data) {
        meta.insert("width",  json!(img.width()));
        meta.insert("height", json!(img.height()));
        meta.insert("color",  json!(format!("{:?}", img.color())));
    }

    // EXIF via kamadak-exif
    let exif_reader = exif::Reader::new();
    let mut cursor  = Cursor::new(data);

    if let Ok(exif) = exif_reader.read_from_container(&mut cursor) {
        let mut exif_map: HashMap<String, String> = HashMap::new();
        for field in exif.fields() {
            exif_map.insert(
                field.tag.to_string(),
                field.display_value().with_unit(&exif).to_string(),
            );
        }
        if !exif_map.is_empty() {
            meta.insert("exif", json!(exif_map));
        }
    }

    meta.insert("size_bytes", json!(data.len()));
    meta.insert("filename",   json!(filename));

    json!(meta)
}

/// Strip metadata: decode → re-encode without EXIF/ICC.
/// Returns clean image bytes.
pub fn strip_metadata(data: &[u8], target_fmt: &str) -> Result<Vec<u8>, String> {
    use crate::services::converter::convert_image;
    use crate::utils::formats::normalize_format;

    // Re-encode through our converter with a dummy source filename.
    // This naturally drops EXIF because image crate doesn't carry EXIF on encode.
    let tgt = normalize_format(target_fmt);
    let dummy_name = format!("upload.{}", tgt);

    let result = convert_image(
        data,
        &dummy_name,
        &tgt,
        None,  // no resize
        None,
        true,
        90,
        false, // strip metadata
    )
    .map_err(|e| e.to_string())?;

    Ok(result.bytes)
}