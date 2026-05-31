/// ZIP generation service for the ICO favicon package.
/// Everything in memory — zero disk writes.

use std::io::{Cursor, Write};
use zip::{ZipWriter, write::FileOptions, CompressionMethod};

use crate::services::ico_converter::IcoPackage;

pub fn build_zip(package: &IcoPackage) -> Result<Vec<u8>, String> {
    let buf     = Cursor::new(Vec::new());
    let mut zip = ZipWriter::new(buf);

    let options = FileOptions::<()>::default()
        .compression_method(CompressionMethod::Deflated)
        .unix_permissions(0o644);

    // favicon.ico (multi-size)
    zip.start_file("favicon.ico", options)
        .map_err(|e| e.to_string())?;
    zip.write_all(&package.ico_bytes)
        .map_err(|e| e.to_string())?;

    // Individual PNGs
    for (name, data) in &package.png_files {
        zip.start_file(name, options)
            .map_err(|e| e.to_string())?;
        zip.write_all(data)
            .map_err(|e| e.to_string())?;
    }

    let finished = zip.finish().map_err(|e| e.to_string())?;
    Ok(finished.into_inner())
}