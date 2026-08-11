import os
filename = None
sanitized = os.path.basename((filename or "unnamed").replace("\\", "/"))
print(sanitized)
