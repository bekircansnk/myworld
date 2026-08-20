import re
import os

def secure_filename(filename: str) -> str:
    """
    Sanitize a filename to prevent path traversal.
    """
    if not filename:
        return "unnamed_file"
    # Extract just the filename if a path was provided
    filename = os.path.basename(filename)
    # Strip any directory traversal sequences that might remain
    filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)
    # Ensure it's not empty after cleaning
    if not filename.strip('_.'):
        return "unnamed_file"
    return filename
