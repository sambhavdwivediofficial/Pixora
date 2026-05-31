/// Dimension computation for resizing.

/// Compute output (width, height) given optional targets and aspect-lock.
pub fn compute_dimensions(
    orig_w: u32,
    orig_h: u32,
    target_w: Option<u32>,
    target_h: Option<u32>,
    preserve_aspect: bool,
) -> (u32, u32) {
    match (target_w, target_h) {
        (None, None) => (orig_w, orig_h),

        (Some(w), Some(h)) if preserve_aspect => {
            let ratio_w = w as f64 / orig_w as f64;
            let ratio_h = h as f64 / orig_h as f64;
            let ratio   = ratio_w.min(ratio_h);
            (
                ((orig_w as f64 * ratio).round() as u32).max(1),
                ((orig_h as f64 * ratio).round() as u32).max(1),
            )
        }

        (Some(w), Some(h)) => (w, h),

        (Some(w), None) if preserve_aspect => {
            let ratio = w as f64 / orig_w as f64;
            (w, ((orig_h as f64 * ratio).round() as u32).max(1))
        }

        (None, Some(h)) if preserve_aspect => {
            let ratio = h as f64 / orig_h as f64;
            (((orig_w as f64 * ratio).round() as u32).max(1), h)
        }

        (Some(w), None)  => (w, orig_h),
        (None,  Some(h)) => (orig_w, h),
    }
}