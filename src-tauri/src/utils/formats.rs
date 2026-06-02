/// Format constants and helpers for Pixora Rust backend.

use std::collections::HashSet;

/// Formats accepted as upload input on the main page.
pub fn supported_input_formats() -> HashSet<&'static str> {
    ["png", "jpg", "jpeg", "webp", "bmp", "tiff", "tif",
     "avif", "svg", "ico"]
        .into_iter()
        .collect()
}

/// Formats accepted as upload input on the /ico page (no ICO input).
pub fn ico_input_formats() -> HashSet<&'static str> {
    ["png", "jpg", "jpeg", "webp", "bmp", "tiff", "tif",
     "avif", "svg"]
        .into_iter()
        .collect()
}

/// Valid output formats (ICO never appears here).
pub fn output_formats() -> HashSet<&'static str> {
    ["png", "jpg", "jpeg", "webp", "bmp", "tiff", "avif", "svg"]
        .into_iter()
        .collect()
}

/// ICO sizes to generate in the favicon package.
pub const ICO_SIZES: &[u32] = &[16, 32, 48, 64, 128, 256];

/// Normalize a format string: lowercase, strip dot, jpeg→jpg, tif→tiff.
pub fn normalize_format(fmt: &str) -> String {
    let s = fmt.trim_start_matches('.').to_lowercase();
    match s.as_str() {
        "jpeg"        => "jpg".into(),
        "tif"         => "tiff".into(),
        other         => other.into(),
    }
}

/// Map format string to MIME type.
pub fn get_mime(fmt: &str) -> &'static str {
    match normalize_format(fmt).as_str() {
        "png"  => "image/png",
        "jpg"  => "image/jpeg",
        "webp" => "image/webp",
        "bmp"  => "image/bmp",
        "tiff" => "image/tiff",
        "avif" => "image/avif",
        "svg"  => "image/svg+xml",
        "ico"  => "image/x-icon",
        "zip"  => "application/zip",
        _      => "application/octet-stream",
    }
}

/// Extract extension from a filename.
pub fn ext_from_filename(name: &str) -> String {
    name.rsplit('.')
        .next()
        .map(|e| normalize_format(e))
        .unwrap_or_default()
}

/// Map our format string to the `image` crate's ImageFormat.
pub fn to_image_format(fmt: &str) -> Option<image::ImageFormat> {
    match normalize_format(fmt).as_str() {
        "png"  => Some(image::ImageFormat::Png),
        "jpg"  => Some(image::ImageFormat::Jpeg),
        "webp" => Some(image::ImageFormat::WebP),
        "bmp"  => Some(image::ImageFormat::Bmp),
        "tiff" => Some(image::ImageFormat::Tiff),
        "avif" => Some(image::ImageFormat::Avif),
        "ico"  => Some(image::ImageFormat::Ico),
        _      => None,
    }
}