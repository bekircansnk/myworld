import re

def secure_filename(filename: str) -> str:
    """
    Sanitize a filename to prevent Path Traversal.
    """
    if not filename:
        return "unnamed_file"

    # Keep only alphanumeric characters, dots, dashes, and underscores
    secure_name = re.sub(r'[^a-zA-Z0-9.\-_]', '_', filename)

    # Prevent starting with a dot or dash
    secure_name = re.sub(r'^[.\-]+', '', secure_name)

    # If the filename becomes empty after sanitization
    if not secure_name:
        return "unnamed_file"

    return secure_name
