#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Kanban Test Sütunlarını Temizleme Scripti
Yazar: Antigravity AI
"""

import sys
import os
import asyncio
import re
import argparse
from pathlib import Path

# Backend modüllerini içe aktarabilmek için sys.path ekliyoruz
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
sys.path.append(str(BACKEND_DIR))

from sqlalchemy import select, update
from app.database import AsyncSessionLocal, engine

# SQLAlchemy mapper ilişkilerini çözebilmek için tüm modelleri import ediyoruz
import app.models
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.models.task_comment import TaskComment

async def run_cleanup():
    parser = argparse.ArgumentParser(description="Kanban Test Sütunları ve Görevleri Temizleme Scripti")
    parser.add_argument("--apply", action="store_true", help="Veritabanına değişiklikleri uygular (Belirtilmezse varsayılan olarak dry-run çalışır)")
    parser.add_argument("--project-id", type=int, help="Sadece belirli bir proje ID'si üzerinde filtreleme yapar")
    parser.add_argument("--status", type=str, help="Sadece belirli bir status değeri üzerinde filtreleme yapar")
    args = parser.parse_args()

    is_dry_run = not args.apply

    print("=" * 70)
    print(" KANBAN TEST SÜTUNLARI VE GÖREVLERİ TEMİZLEME ARACI")
    print("=" * 70)
    print(f"Mod: {'[APPLY] - VERİLER DEĞİŞTİRİLECEK!' if args.apply else '[DRY-RUN] - SALT OKUNUR RAPOR'}")
    if args.project_id:
        print(f"Proje Filtresi: ID={args.project_id}")
    if args.status:
        print(f"Statü Filtresi: {args.status}")
    print("-" * 70)

    # Regex deseni: col_... veya COL_... (büyük/küçük harfe duyarsız)
    status_pattern = re.compile(r"^col_[0-9]+$", re.IGNORECASE)

    async with AsyncSessionLocal() as session:
        # Aktif görevleri çek (is_deleted == False olanlar)
        stmt = select(Task).where(Task.is_deleted == False)
        if args.project_id:
            stmt = stmt.where(Task.project_id == args.project_id)
        
        result = await session.execute(stmt)
        all_active_tasks = result.scalars().all()

        # Custom / Test statülerine sahip görevleri filtrele
        test_tasks = []
        for t in all_active_tasks:
            # Eğer belirli bir statü filtresi varsa onu eşleştir, yoksa regex deseniyle karşılaştır
            if args.status:
                if t.status and t.status.lower() == args.status.lower():
                    test_tasks.append(t)
            else:
                if t.status and status_pattern.match(t.status):
                    test_tasks.append(t)

        if not test_tasks:
            print("Temizlenecek herhangi bir test/custom görev veya sütun bulunamadı.")
            return

        # Projeleri önbelleğe almak için proje bilgilerini sorgula
        project_ids = list(set([t.project_id for t in test_tasks if t.project_id is not None]))
        project_map = {}
        if project_ids:
            proj_stmt = select(Project).where(Project.id.in_(project_ids))
            proj_res = await session.execute(proj_stmt)
            for p in proj_res.scalars().all():
                project_map[p.id] = p.name

        # Gruplama işlemi
        # { project_id: { status: [tasks] } }
        grouped = {}
        for t in test_tasks:
            pid = t.project_id or 0
            status_val = t.status or "SÜTUNSUZ"
            
            if pid not in grouped:
                grouped[pid] = {}
            if status_val not in grouped[pid]:
                grouped[pid][status_val] = []
            grouped[pid][status_val].append(t)

        total_tasks_to_delete = len(test_tasks)
        print(f"Toplam silinecek/soft-delete edilecek görev sayısı: {total_tasks_to_delete}")
        print("-" * 70)

        for pid, statuses in grouped.items():
            proj_name = project_map.get(pid, "Bilinmeyen Proje / Özel Görevler")
            print(f"📂 Proje ID: {pid} | Adı: {proj_name}")
            for status_val, tasks in statuses.items():
                print(f"   🚥 Statü / Fallback Sütun: '{status_val}' (Görev Sayısı: {len(tasks)})")
                for t in tasks:
                    print(f"      - ID: {t.id} | Başlık: {t.title}")
            print("-" * 70)

        if is_dry_run:
            print("[WARN] BU BİR DRY-RUN ÇALIŞMASIDIR. HİÇBİR VERİ DEĞİŞTİRİLMEDİ.")
            print("[INFO] Değişiklikleri uygulamak ve görevleri soft-delete yapmak için lütfen:")
            print("       python scripts/cleanup_kanban_test_statuses.py --apply")
        else:
            # Soft delete işlemini gerçekleştir (is_deleted = True)
            print("Değişiklikler veritabanına uygulanıyor (Soft-delete)...")
            
            task_ids = [t.id for t in test_tasks]
            update_stmt = update(Task).where(Task.id.in_(task_ids)).values(is_deleted=True)
            await session.execute(update_stmt)
            await session.commit()
            
            print(f"Başarıyla {len(task_ids)} görev soft-delete yapıldı (is_deleted=True).")
            print("Kanban tahtasındaki fallback sütunlar ve kartlar temizlendi.")

    # Veritabanı motorunu kapat
    await engine.dispose()

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_cleanup())
