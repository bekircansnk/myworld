import os
def secure_filename(filename: str) -> str:
    if not filename:
        return "unnamed"
    return os.path.basename(filename.replace("\\", "/"))

print(secure_filename("../../../etc/passwd"))
print(secure_filename("..\\..\\..\\windows\\system32\\cmd.exe"))
print(secure_filename("test.txt"))
