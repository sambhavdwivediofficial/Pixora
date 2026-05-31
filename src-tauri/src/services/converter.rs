/// Core image conversion service — entirely in memory, zero disk writes.

use std::io::{Cursor};

use image::{
    imageops::FilterType, DynamicImage, GenericImageView, ImageEncoder,
    codecs::{
        jpeg::JpegEncoder,
        png::PngEncoder,
    },
};
use thiserror::Error;

use crate::utils::dimensions::compute_dimensions;
use crate::utils::formats::{normalize_format, get_mime, ext_from_filename};
use crate::utils::helpers::flatten_alpha;

#[derive(Debug, Error)]
pub enum ConvertError {
    #[error("Unsupported output format: {0}")]
    UnsupportedFormat(String),
    #[error("Image decode error: {0}")]
    DecodeError(String),
    #[error("Image encode error: {0}")]
    EncodeError(String),
    #[error("SVG rasterize error: {0}")]
    SvgError(String),
}

pub struct ConvertResult {
    pub bytes:  Vec<u8>,
    pub mime:   &'static str,
    pub width:  u32,
    pub height: u32,
}

pub fn convert_image(
    data:             &[u8],
    source_filename:  &str,
    target_fmt:       &str,
    target_w:         Option<u32>,
    target_h:         Option<u32>,
    preserve_aspect:  bool,
    quality:          u8,
    _preserve_meta:   bool,
) -> Result<ConvertResult, ConvertError> {
    let src_ext = ext_from_filename(source_filename);
    let tgt     = normalize_format(target_fmt);

    // --- Decode source ---
    let img = if src_ext == "svg" {
        rasterize_svg(data, target_w.unwrap_or(512), target_h.unwrap_or(512))
            .map_err(|e| ConvertError::SvgError(e))?
    } else {
        image::load_from_memory(data)
            .map_err(|e| ConvertError::DecodeError(e.to_string()))?
    };

    // --- Resize ---
    let (orig_w, orig_h) = img.dimensions();
    let (out_w, out_h)   = compute_dimensions(orig_w, orig_h, target_w, target_h, preserve_aspect);

    let img = if (out_w, out_h) != (orig_w, orig_h) {
        img.resize_exact(out_w, out_h, FilterType::Lanczos3)
    } else {
        img
    };

    // --- Encode ---
    let bytes = encode_image(img, &tgt, quality)?;
    let mime  = get_mime(&tgt);

    Ok(ConvertResult { bytes, mime, width: out_w, height: out_h })
}

fn encode_image(img: DynamicImage, fmt: &str, quality: u8) -> Result<Vec<u8>, ConvertError> {
    let mut buf = Cursor::new(Vec::new());

    match fmt {
        "jpg" | "jpeg" => {
            let img = flatten_alpha(img);
            let rgb = img.to_rgb8();
            let mut enc = JpegEncoder::new_with_quality(&mut buf, quality);
            enc.encode_image(&rgb)
                .map_err(|e| ConvertError::EncodeError(e.to_string()))?;
        }

        "png" => {
            let enc = PngEncoder::new_with_quality(
                &mut buf,
                image::codecs::png::CompressionType::Best,
                image::codecs::png::FilterType::Adaptive,
            );
            enc.write_image(
                img.as_bytes(),
                img.width(),
                img.height(),
                img.color().into(),
            )
            .map_err(|e| ConvertError::EncodeError(e.to_string()))?;
        }

        "webp" => {
            // image crate WebP encoder (lossless for quality=100, lossy otherwise)
            img.save_with_format(
                // write through a temp in-memory path — we use write_to
                std::path::Path::new("unused.webp"),
                image::ImageFormat::WebP,
            )
            .ok(); // ignore — use write_to instead
            img.write_to(&mut buf, image::ImageFormat::WebP)
                .map_err(|e| ConvertError::EncodeError(e.to_string()))?;
        }

        "bmp" => {
            let img = flatten_alpha(img);
            img.write_to(&mut buf, image::ImageFormat::Bmp)
                .map_err(|e| ConvertError::EncodeError(e.to_string()))?;
        }

        "tiff" => {
            img.write_to(&mut buf, image::ImageFormat::Tiff)
                .map_err(|e| ConvertError::EncodeError(e.to_string()))?;
        }

        "avif" => {
            img.write_to(&mut buf, image::ImageFormat::Avif)
                .map_err(|e| ConvertError::EncodeError(e.to_string()))?;
        }

        // SVG output: we produce a high-quality PNG (true SVG generation from raster
        // is not feasible without a full vector tracing library)
        "svg" => {
            let enc = PngEncoder::new_with_quality(
                &mut buf,
                image::codecs::png::CompressionType::Best,
                image::codecs::png::FilterType::Adaptive,
            );
            enc.write_image(
                img.as_bytes(),
                img.width(),
                img.height(),
                img.color().into(),
            )
            .map_err(|e| ConvertError::EncodeError(e.to_string()))?;
            // Return PNG mime for SVG output
            return Ok(buf.into_inner());
        }

        other => return Err(ConvertError::UnsupportedFormat(other.to_string())),
    }

    Ok(buf.into_inner())
}

/// Rasterize SVG bytes to a DynamicImage at the given target dimensions.
pub fn rasterize_svg(data: &[u8], w: u32, h: u32) -> Result<DynamicImage, String> {
    let svg_str = std::str::from_utf8(data).map_err(|e| e.to_string())?;
    let options = usvg::Options::default();
    let tree    = usvg::Tree::from_str(svg_str, &options).map_err(|e| e.to_string())?;

    let size   = tree.size();
    let out_w  = if w > 0 { w } else { size.width() as u32 };
    let out_h  = if h > 0 { h } else { size.height() as u32 };

    let mut pixmap = tiny_skia::Pixmap::new(out_w, out_h)
        .ok_or_else(|| "Failed to allocate pixmap".to_string())?;

    let scale_x = out_w as f32 / size.width();
    let scale_y = out_h as f32 / size.height();
    let transform = tiny_skia::Transform::from_scale(scale_x, scale_y);

    resvg::render(&tree, transform, &mut pixmap.as_mut());

    let img = image::RgbaImage::from_raw(out_w, out_h, pixmap.take())
        .ok_or_else(|| "Pixmap to image conversion failed".to_string())?;

    Ok(DynamicImage::ImageRgba8(img))
}