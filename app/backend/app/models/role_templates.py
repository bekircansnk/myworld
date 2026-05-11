# Önceden tanımlı rol şablonları
# Admin panelinde kullanıcı eklerken hızlı atama için kullanılır

# Tüm modüllere tam erişim
FULL_PERMISSIONS = {
    "dashboard": {"view": True},
    "tasks": {"view": True, "edit": True, "delete": True},
    "calendar": {"view": True, "edit": True},
    "notes": {"view": True, "edit": True},
    "ai_chat": {"view": True},
    "venus_ads": {"view": True, "edit": True},
    "photo_tracking": {"view": True, "edit": True}
}

ROLE_TEMPLATES = {
    "e_commerce": {
        "label": "E-Ticaret Yöneticisi",
        "description": "Reklam, fotoğraf takip ve görev yönetimi",
        "role": "editor",
        "permissions": {
            "dashboard": {"view": True},
            "tasks": {"view": True, "edit": True, "delete": False},
            "calendar": {"view": True, "edit": True},
            "notes": {"view": False, "edit": False},
            "ai_chat": {"view": False},
            "venus_ads": {"view": True, "edit": True},
            "photo_tracking": {"view": True, "edit": True}
        }
    },
    "it_department": {
        "label": "IT Departmanı",
        "description": "Görev, takvim ve not yönetimi",
        "role": "editor",
        "permissions": {
            "dashboard": {"view": True},
            "tasks": {"view": True, "edit": True, "delete": True},
            "calendar": {"view": True, "edit": True},
            "notes": {"view": True, "edit": True},
            "ai_chat": {"view": False},
            "venus_ads": {"view": False, "edit": False},
            "photo_tracking": {"view": False, "edit": False}
        }
    },
    "full_access": {
        "label": "Tam Erişim",
        "description": "Tüm modüllere tam yetki",
        "role": "admin",
        "permissions": FULL_PERMISSIONS
    },
    "viewer_only": {
        "label": "Sadece Görüntüleme",
        "description": "Tüm modülleri görür ama değişiklik yapamaz",
        "role": "viewer",
        "permissions": {
            "dashboard": {"view": True},
            "tasks": {"view": True, "edit": False, "delete": False},
            "calendar": {"view": True, "edit": False},
            "notes": {"view": True, "edit": False},
            "ai_chat": {"view": True},
            "venus_ads": {"view": True, "edit": False},
            "photo_tracking": {"view": True, "edit": False}
        }
    }
}

# Modül tanımları (frontend eşleştirme için)
MODULE_DEFINITIONS = [
    {"key": "dashboard", "label": "Kontrol Paneli", "icon": "LayoutDashboard", "actions": ["view"]},
    {"key": "tasks", "label": "Görevler", "icon": "ListTodo", "actions": ["view", "edit", "delete"]},
    {"key": "calendar", "label": "Takvim", "icon": "CalendarDays", "actions": ["view", "edit"]},
    {"key": "notes", "label": "Notlar", "icon": "NotebookPen", "actions": ["view", "edit"]},
    {"key": "ai_chat", "label": "AI Sohbet", "icon": "Bot", "actions": ["view"]},
    {"key": "venus_ads", "label": "Reklam Paneli", "icon": "Megaphone", "actions": ["view", "edit"]},
    {"key": "photo_tracking", "label": "Fotoğraf Takip", "icon": "Camera", "actions": ["view", "edit"]},
]
