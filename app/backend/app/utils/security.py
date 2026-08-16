import re
import os

def secure_filename(filename: str) -> str:
    """
    Sanitize a filename to prevent path traversal and other injection attacks.
    Removes path characters and limits to safe alphanumeric and some special chars.
    """
    if not filename:
        return "unknown"

    # Keep only alphanumeric, dash, underscore, dot
    filename = os.path.basename(filename)
    filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)

    # Prevent empty or hidden files like "." or ".."
    filename = filename.strip('._')
    if not filename:
        return "unknown"

    return filename
