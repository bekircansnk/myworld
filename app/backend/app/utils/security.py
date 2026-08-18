import re
import os

def secure_filename(filename: str) -> str:
    """
    Sanitize a filename by removing path traversal characters.
    """
    if not filename:
        return "unnamed_file"

    # Keep only alphanumeric characters, dots, dashes, and underscores
    filename = re.sub(r'[^a-zA-Z0-9.-_]', '_', filename)

    # Remove leading dots to prevent hidden files or traversal like ../
    filename = filename.lstrip('.')

    if not filename:
        return "unnamed_file"

    return filename
