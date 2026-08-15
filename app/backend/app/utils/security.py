def secure_filename(filename: str) -> str:
    import re
    if not filename:
        return ""
    # Remove path info
    filename = filename.replace("\\", "/").split("/")[-1]
    # Replace anything that isn't alphanumeric or dot/dash/underscore
    filename = re.sub(r'[^A-Za-z0-9._-]', '_', filename)
    # Strip leading/trailing dots and spaces
    filename = filename.strip(' .')
    return filename or "unnamed_file"
