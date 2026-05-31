
use image::GenericImageView;
use serde::Serialize;

use crate::utils::formats::{supported_input_formats, ext_from_filename};
use crate::utils::validators::check_file_size;

#[derive(Serialize)]
pub struct ValidateResponse {
    pub valid:      bool,
    pub format:     String,
    pub width:      u32,
    pub height:     u32,
    pub size_bytes: usize,
    pub message:    String,
}

pub fn validate_image(data: &[u8], filename: &str) -> ValidateResponse {
    // 1. Non-empty + size check
    if let Err(e) = check_file_size(data.len()) {
        return ValidateResponse::err(e);
    }

    // 2. Extension check
    let ext = ext_from_filename(filename);
    if ext.is_empty() {
        return ValidateResponse::err("Could not determine file format");
    }
    if !supported_input_formats().contains(ext.as_str()) {
        return ValidateResponse::err(format!("Unsupported format: {}", ext));
    }

    // 3. SVG — parse with resvg, return synthetic dimensions
    if ext == "svg" {
        return validate_svg(data, filename);
    }

    // 4. All raster formats — try to decode with image crate
    match image::load_from_memory(data) {
        Ok(img) => {
            let (w, h) = img.dimensions();
            if w == 0 || h == 0 {
                return ValidateResponse::err("Image has zero dimensions");
            }
            ValidateResponse {
                valid:      true,
                format:     ext.to_uppercase(),
                width:      w,
                height:     h,
                size_bytes: data.len(),
                message:    "ok".into(),
            }
        }
        Err(e) => ValidateResponse::err(format!("Image unreadable: {}", e)),
    }
}

fn validate_svg(data: &[u8], _filename: &str) -> ValidateResponse {
    let svg_str = match std::str::from_utf8(data) {
        Ok(s) => s,
        Err(_) => return ValidateResponse::err("SVG file is not valid UTF-8"),
    };

    let options = usvg::Options::default();
    match usvg::Tree::from_str(svg_str, &options) {
        Ok(tree) => {
            let size = tree.size();
            ValidateResponse {
                valid:      true,
                format:     "SVG".into(),
                width:      size.width() as u32,
                height:     size.height() as u32,
                size_bytes: data.len(),
                message:    "ok".into(),
            }
        }
        Err(e) => ValidateResponse::err(format!("SVG parse error: {}", e)),
    }
}

impl ValidateResponse {
    fn err(msg: impl Into<String>) -> Self {
        Self {
            valid:      false,
            format:     String::new(),
            width:      0,
            height:     0,
            size_bytes: 0,
            message:    msg.into(),
        }
    }
}