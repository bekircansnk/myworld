import os

def secure_filename(filename: str) -> str:
    """
    Sanitize a filename to prevent directory traversal attacks.
    Removes path information and leaves only the base name.
    """
    if not filename:
        return ""
    # Replace backslashes with forward slashes, then get the basename
    return os.path.basename(filename.replace('\\', '/'))
