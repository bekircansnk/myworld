import re
import os

def secure_filename(filename: str) -> str:
    """
    Sanitizes a filename to prevent path traversal.
    """
    if not filename:
        return "unnamed_file"

    # Remove path information
    filename = os.path.basename(filename)

    # Remove non-alphanumeric characters except some common ones
    filename = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', filename)

    return filename
