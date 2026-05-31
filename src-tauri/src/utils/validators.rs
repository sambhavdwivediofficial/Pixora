/// Client-facing validation helpers (format checks, size limits).

use crate::utils::formats::{supported_input_formats, normalize_format};

pub const MAX_FILE_BYTES: usize = 50 * 1024 * 1024; // 50 MB

pub struct ValidationResult {
    pub valid:      bool,
    pub message:    String,
    pub format:     String,
    pub width:      u32,
    pub height:     u32,
    pub size_bytes: usize,
}

impl ValidationResult {
    pub fn err(msg: impl Into<String>) -> Self {
        Self {
            valid:      false,
            message:    msg.into(),
            format:     String::new(),
            width:      0,
            height:     0,
            size_bytes: 0,
        }
    }
}

pub fn is_supported_ext(ext: &str) -> bool {
    supported_input_formats().contains(normalize_format(ext).as_str())
}

pub fn check_file_size(len: usize) -> Result<(), String> {
    if len == 0 {
        return Err("File is empty".into());
    }
    if len > MAX_FILE_BYTES {
        let mb = len as f64 / 1_048_576.0;
        return Err(format!("File too large ({:.1} MB). Max 50 MB.", mb));
    }
    Ok(())
}