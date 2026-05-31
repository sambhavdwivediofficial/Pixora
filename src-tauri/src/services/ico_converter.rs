/// ICO conversion service — produces multi-size ICO from any supported input.
/// All operations are in memory. Zero disk writes.

use std::io::Cursor;

use image::{imageops::FilterType, DynamicImage, ImageFormat};

use crate::utils::formats::{ICO_SIZES, ext_from_filename};
use crate::services::converter::rasterize_svg;

#[derive(Debug)]
pub struct IcoPackage {
    /// Raw ICO bytes (multi-size, all ICO_SIZES embedded).
    pub ico_bytes: Vec<u8>,
    /// Individual PNG files: (filename, png_bytes).
    pub png_files: Vec<(String, Vec<u8>)>,
}

pub fn build_ico_package(data: &[u8], filename: &str) -> Result<IcoPackage, String> {
    let ext = ext_from_filename(filename);

    // Decode to RGBA
    let img: DynamicImage = if ext == "svg" {
        // Rasterize SVG at 256×256 (largest ICO size), then resize per size
        rasterize_svg(data, 256, 256)?
    } else {
        image::load_from_memory(data)
            .map_err(|e| format!("Image decode error: {}", e))?
    };

    let img = img.to_rgba8();

    // Build each size
    let mut sized_imgs: Vec<(u32, Vec<u8>)> = Vec::new();
    let mut png_files:  Vec<(String, Vec<u8>)> = Vec::new();

    for &size in ICO_SIZES {
        let resized = image::imageops::resize(&img, size, size, FilterType::Lanczos3);
        let dynamic  = DynamicImage::ImageRgba8(resized);

        // Encode as PNG
        let mut png_buf = Cursor::new(Vec::new());
        dynamic
            .write_to(&mut png_buf, ImageFormat::Png)
            .map_err(|e| format!("PNG encode error at {}x{}: {}", size, size, e))?;

        let png_bytes = png_buf.into_inner();
        sized_imgs.push((size, png_bytes.clone()));
        png_files.push((
            format!("icon_{}x{}.png", size, size),
            png_bytes,
        ));
    }

    // Build ICO manually: ICO header + directory + PNG data
    let ico_bytes = build_ico_binary(&sized_imgs)?;

    Ok(IcoPackage { ico_bytes, png_files })
}

/// Build a valid ICO binary from a list of (size, png_bytes).
/// Uses PNG compression within ICO (Vista+ format) for best quality.
fn build_ico_binary(entries: &[(u32, Vec<u8>)]) -> Result<Vec<u8>, String> {
    let count = entries.len() as u16;

    // ICO header: 6 bytes
    // Directory entries: count × 16 bytes
    let dir_offset  = 6_u32 + count as u32 * 16;
    let mut offsets = Vec::with_capacity(entries.len());
    let mut cur_off = dir_offset;

    for (_, png) in entries {
        offsets.push(cur_off);
        cur_off += png.len() as u32;
    }

    let mut out: Vec<u8> = Vec::new();

    // File header
    out.extend_from_slice(&[0u8, 0]); // reserved
    out.extend_from_slice(&[1u8, 0]); // type: 1 = ICO
    out.extend_from_slice(&(count as u16).to_le_bytes());

    // Directory
    for (i, (size, png)) in entries.iter().enumerate() {
        let s = if *size >= 256 { 0u8 } else { *size as u8 }; // 256 encoded as 0
        out.push(s);                           // width
        out.push(s);                           // height
        out.push(0);                           // color count (0 = no palette)
        out.push(0);                           // reserved
        out.extend_from_slice(&[1u16.to_le_bytes()[0], 1u16.to_le_bytes()[1]]); // color planes
        out.extend_from_slice(&[32u16.to_le_bytes()[0], 32u16.to_le_bytes()[1]]); // bits per pixel
        out.extend_from_slice(&(png.len() as u32).to_le_bytes());
        out.extend_from_slice(&offsets[i].to_le_bytes());
    }

    // PNG data
    for (_, png) in entries {
        out.extend_from_slice(png);
    }

    Ok(out)
}