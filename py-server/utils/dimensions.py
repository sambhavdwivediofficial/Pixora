"""
Dimension utilities for Pixora.
"""
from typing import Tuple, Optional


def compute_dimensions(
    original_width: int,
    original_height: int,
    target_width: Optional[int],
    target_height: Optional[int],
    preserve_aspect: bool,
) -> Tuple[int, int]:
    """
    Compute output dimensions given constraints.
    Returns (width, height).
    """
    if not target_width and not target_height:
        return original_width, original_height

    if preserve_aspect:
        if target_width and target_height:
            ratio = min(target_width / original_width, target_height / original_height)
            return max(1, int(original_width * ratio)), max(1, int(original_height * ratio))
        elif target_width:
            ratio = target_width / original_width
            return target_width, max(1, int(original_height * ratio))
        else:
            ratio = target_height / original_height
            return max(1, int(original_width * ratio)), target_height
    else:
        w = target_width if target_width else original_width
        h = target_height if target_height else original_height
        return w, h