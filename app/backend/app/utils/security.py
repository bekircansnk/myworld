import os
import re


def secure_filename(filename: str) -> str:
    """
    Sanitizes a filename to prevent path traversal and ensure it's safe to use in file paths.
    Strips directory paths and limits to safe characters.
    """
    if not filename:
        return "unnamed_file"

    # Strip path information
    filename = os.path.basename(filename)

    # Replace non-alphanumeric/underscore/dash/dot with underscore
    filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)

    # Remove leading dots to prevent hidden files
    filename = filename.lstrip('.')

    return filename or "unnamed_file"
