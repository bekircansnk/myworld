import os

filename = "../../../etc/passwd"
sanitized = os.path.basename(filename)
print(sanitized)
sanitized = os.path.basename(filename.replace("\\", "/"))
print(sanitized)
