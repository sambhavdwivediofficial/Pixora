/// Misc helpers for Pixora Rust backend.

use image::{DynamicImage, ImageBuffer, Rgba};

/// Flatten any alpha channel to a white background for formats that don't support transparency.
pub fn flatten_alpha(img: DynamicImage) -> DynamicImage {
    let rgba = img.to_rgba8();
    let (w, h) = rgba.dimensions();
    let mut out = ImageBuffer::from_pixel(w, h, Rgba([255u8, 255, 255, 255]));

    for (x, y, px) in rgba.enumerate_pixels() {
        let a = px[3] as f32 / 255.0;
        let r = (px[0] as f32 * a + 255.0 * (1.0 - a)) as u8;
        let g = (px[1] as f32 * a + 255.0 * (1.0 - a)) as u8;
        let b = (px[2] as f32 * a + 255.0 * (1.0 - a)) as u8;
        out.put_pixel(x, y, Rgba([r, g, b, 255]));
    }

    DynamicImage::ImageRgba8(out)
}

/// Convert bytes to human-readable file size string.
pub fn human_size(bytes: usize) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB"];
    let mut size = bytes as f64;
    let mut i    = 0;
    while size >= 1024.0 && i < UNITS.len() - 1 {
        size /= 1024.0;
        i    += 1;
    }
    if i == 0 {
        format!("{} B", bytes)
    } else {
        format!("{:.1} {}", size, UNITS[i])
    }
}