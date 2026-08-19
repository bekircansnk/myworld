import re

def secure_filename(filename: str) -> str:
    """
    Return a secure version of a filename.
    """
    if not filename:
        return "unnamed_file"

    # Keep only word characters, dots, dashes, and underscores
    filename = re.sub(r'[^a-zA-Z0-9.\-_]', '', filename)

    # Strip leading periods or slashes
    filename = filename.lstrip('./\\')

    if not filename:
        return "unnamed_file"

    return filename
