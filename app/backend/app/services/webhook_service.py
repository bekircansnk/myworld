import httpx
from datetime import datetime
from app.utils.logger import logger
from typing import Optional

async def send_discord_notification(webhook_url: str, payload: dict):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(webhook_url, json=payload)
            if resp.status_code >= 400:
                logger.warning(f"Discord webhook responded with error: {resp.status_code} - {resp.text}")
    except Exception as e:
        logger.error(f"Error sending Discord webhook notification: {e}")

async def send_slack_notification(webhook_url: str, payload: dict):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(webhook_url, json=payload)
            if resp.status_code >= 400:
                logger.warning(f"Slack webhook responded with error: {resp.status_code} - {resp.text}")
    except Exception as e:
        logger.error(f"Error sending Slack webhook notification: {e}")

class WebhookService:
    @staticmethod
    def get_priority_color(priority: str) -> int:
        # Discord için Decimal Color
        if priority == "urgent":
            return 15158332  # Kırmızı
        elif priority == "normal":
            return 3447003   # Mavi
        else:
            return 10197915  # Gri

    @classmethod
    async def send_task_created(cls, task, project, creator_name: str):
        if not project:
            return
        
        task_title = task.title
        priority = getattr(task, "priority", "normal")
        desc = getattr(task, "description", "") or "Açıklama belirtilmedi."
        project_name = project.name
        
        # Discord Webhook
        if project.discord_webhook_url:
            discord_payload = {
                "embeds": [
                    {
                        "title": f"📌 Yeni Görev Oluşturuldu: {task_title}",
                        "description": desc,
                        "color": cls.get_priority_color(priority),
                        "fields": [
                            {"name": "📁 Proje / Firma", "value": project_name, "inline": True},
                            {"name": "⚠️ Öncelik", "value": priority.upper(), "inline": True},
                            {"name": "👤 Oluşturan", "value": creator_name, "inline": True}
                        ],
                        "footer": {
                            "text": "Planla • Dijital Kurucu Ortak"
                        },
                        "timestamp": datetime.utcnow().isoformat()
                    }
                ]
            }
            await send_discord_notification(project.discord_webhook_url, discord_payload)

        # Slack Webhook
        if project.slack_webhook_url:
            slack_payload = {
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": f"📌 Yeni Görev: {task_title}",
                            "emoji": True
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"*Açıklama:* {desc}"
                        }
                    },
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*📁 Proje / Firma:*\n{project_name}"},
                            {"type": "mrkdwn", "text": f"*⚠️ Öncelik:*\n{priority.upper()}"},
                            {"type": "mrkdwn", "text": f"*👤 Oluşturan:*\n{creator_name}"}
                        ]
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "plain_text",
                                "text": "Planla • Dijital Kurucu Ortak",
                                "emoji": True
                            }
                        ]
                    }
                ]
            }
            await send_slack_notification(project.slack_webhook_url, slack_payload)

    @classmethod
    async def send_task_status_changed(cls, task, old_status: str, new_status: str, project, user_name: str):
        if not project:
            return

        task_title = task.title
        project_name = project.name
        priority = getattr(task, "priority", "normal")

        status_mapping = {
            "todo": "Bekleyenler 📁",
            "in_progress": "Devam Edenler ⚡",
            "done": "Tamamlananlar ✅"
        }

        old_status_tr = status_mapping.get(old_status, old_status)
        new_status_tr = status_mapping.get(new_status, new_status)

        # Discord Webhook
        if project.discord_webhook_url:
            discord_payload = {
                "embeds": [
                    {
                        "title": f"🔄 Görev Durumu Güncellendi: {task_title}",
                        "color": 3066993 if new_status == "done" else 3447003,
                        "fields": [
                            {"name": "📁 Proje / Firma", "value": project_name, "inline": True},
                            {"name": "👤 Güncelleyen", "value": user_name, "inline": True},
                            {"name": "🔄 Durum Değişikliği", "value": f"`{old_status_tr}` ➡️ `{new_status_tr}`", "inline": False}
                        ],
                        "footer": {
                            "text": "Planla • Dijital Kurucu Ortak"
                        },
                        "timestamp": datetime.utcnow().isoformat()
                    }
                ]
            }
            await send_discord_notification(project.discord_webhook_url, discord_payload)

        # Slack Webhook
        if project.slack_webhook_url:
            slack_payload = {
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"🔄 *Görev Durumu Güncellendi:* `{task_title}`"
                        }
                    },
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*📁 Proje / Firma:*\n{project_name}"},
                            {"type": "mrkdwn", "text": f"*👤 Güncelleyen:*\n{user_name}"},
                            {"type": "mrkdwn", "text": f"*🔄 Durum:*\n`{old_status_tr}` ➡️ `{new_status_tr}`"}
                        ]
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "plain_text",
                                "text": "Planla • Dijital Kurucu Ortak",
                                "emoji": True
                            }
                        ]
                    }
                ]
            }
            await send_slack_notification(project.slack_webhook_url, slack_payload)

    @classmethod
    async def send_task_comment_added(cls, task, comment_content: str, project, user_name: str):
        if not project:
            return

        task_title = task.title
        project_name = project.name

        # Discord Webhook
        if project.discord_webhook_url:
            discord_payload = {
                "embeds": [
                    {
                        "title": f"💬 Göreve Yeni Yorum Eklendi: {task_title}",
                        "description": comment_content,
                        "color": 16580705,  # Tatlı turuncu
                        "fields": [
                            {"name": "📁 Proje / Firma", "value": project_name, "inline": True},
                            {"name": "👤 Yorum Yapan", "value": user_name, "inline": True}
                        ],
                        "footer": {
                            "text": "Planla • Dijital Kurucu Ortak"
                        },
                        "timestamp": datetime.utcnow().isoformat()
                    }
                ]
            }
            await send_discord_notification(project.discord_webhook_url, discord_payload)

        # Slack Webhook
        if project.slack_webhook_url:
            slack_payload = {
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"💬 *Göreve yeni bir yorum yazıldı:* `{task_title}`"
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f">_{comment_content}_"
                        }
                    },
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*📁 Proje / Firma:*\n{project_name}"},
                            {"type": "mrkdwn", "text": f"*👤 Yorum Yapan:*\n{user_name}"}
                        ]
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "plain_text",
                                "text": "Planla • Dijital Kurucu Ortak",
                                "emoji": True
                            }
                        ]
                    }
                ]
            }
            await send_slack_notification(project.slack_webhook_url, slack_payload)
