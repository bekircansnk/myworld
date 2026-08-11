import os
def sanitize_filename(filename: str) -> str:
    if not filename:
        return "unnamed"
    return os.path.basename(filename.replace("\\", "/"))

print(sanitize_filename("test.txt"))
print(sanitize_filename("../../../etc/passwd"))
print(sanitize_filename("..\\..\\..\\windows\\system32\\cmd.exe"))
print(sanitize_filename(None))
