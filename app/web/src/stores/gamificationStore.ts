import { create } from 'zustand';
import { useTaskStore } from './taskStore';
import { useProjectStore } from './projectStore';
import { useAuthStore } from '../store/authStore';

export interface LeaderboardUser {
  username: string;
  name: string;
  avatar_url?: string;
  xp: number;
  level: number;
  completedCount: number;
  rank: number;
}

interface GamificationState {
  userXp: number;
  userLevel: number;
  badges: string[];
  leaderboard: LeaderboardUser[];
  showLevelUpModal: boolean;
  levelUpTo: number;

  calculateGamification: () => void;
  triggerXpGain: (amount: number) => void;
  closeLevelUpModal: () => void;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  userXp: 0,
  userLevel: 1,
  badges: [],
  leaderboard: [],
  showLevelUpModal: false,
  levelUpTo: 1,

  triggerXpGain: (amount) => {
    const currentXp = get().userXp;
    const newXp = currentXp + amount;
    const currentLevel = get().userLevel;
    const newLevel = Math.floor(newXp / 100) + 1;

    if (newLevel > currentLevel) {
      set({ 
        userXp: newXp, 
        userLevel: newLevel,
        showLevelUpModal: true,
        levelUpTo: newLevel
      });
    } else {
      set({ userXp: newXp, userLevel: newLevel });
    }
    // Liderlik tablosunu yeniden hesapla
    get().calculateGamification();
  },

  closeLevelUpModal: () => set({ showLevelUpModal: false }),

  calculateGamification: () => {
    const { tasks } = useTaskStore.getState();
    const { user } = useAuthStore.getState();
    if (!user) return;

    // 1. Projedeki tüm görevlerden tamamlananları analiz et
    const doneTasks = tasks.filter(t => t.status === 'done');
    
    // Kullanıcı bazlı XP ve tamamlanan görev eşleştirmesi
    const userStats: Record<string, { xp: number; name: string; avatar_url?: string; completed: number }> = {};

    // Projedeki kullanıcıları listeye eklemek için başlangıç değerleri
    // Kendi kullanıcımız her zaman olsun
    userStats[user.username] = {
      xp: 0,
      name: user.name || user.username,
      avatar_url: user.avatar_url,
      completed: 0
    };

    // Done olan ana görevleri hesapla
    doneTasks.forEach(task => {
      // Görevi kim tamamladı? (assignee_name veya oluşturan kullanıcı üzerinden simüle et)
      // assignee_name veya demo isimler
      const owner = (task as any).assignee_name || user.username; // Eğer assignee yoksa görevi yapan aktiftir
      
      if (!userStats[owner]) {
        userStats[owner] = {
          xp: 0,
          name: owner,
          completed: 0
        };
      }

      // Önceliğe göre XP puanı
      let xpEarned = 20; // Varsayılan
      if (task.priority === 'urgent' || (task.priority as any) === 'high') xpEarned = 50;
      else if ((task.priority as any) === 'medium') xpEarned = 30;
      else if (task.priority === 'low') xpEarned = 15;

      userStats[owner].xp += xpEarned;
      userStats[owner].completed += 1;
    });

    // Alt görevler için ek XP'ler (her alt görev +10 XP)
    const subTasks = tasks.filter(t => t.parent_task_id && t.status === 'done');
    subTasks.forEach(sub => {
      const owner = (sub as any).assignee_name || user.username;
      if (userStats[owner]) {
        userStats[owner].xp += 10;
      }
    });

    // Liderlik tablosu dizisini oluştur ve sırala
    const rawLeaderboard = Object.entries(userStats).map(([username, data]) => {
      const xp = data.xp || 10; // En az 10 XP başlangıç verelim ki boş durmasın
      const level = Math.floor(xp / 100) + 1;
      return {
        username,
        name: data.name,
        avatar_url: data.avatar_url,
        xp,
        level,
        completedCount: data.completed,
        rank: 1
      };
    });

    // XP'ye göre azalan sırada sırala
    const sorted = rawLeaderboard.sort((a, b) => b.xp - a.xp);
    
    // Sıralama (rank) numaralarını ata
    const leaderboardWithRanks = sorted.map((u, index) => ({
      ...u,
      rank: index + 1
    }));

    // Kendi kullanıcımızın güncel XP ve seviyesini set et
    const me = leaderboardWithRanks.find(u => u.username === user.username);
    
    // Rozetleri hesapla
    const badges: string[] = [];
    if (me && me.completedCount >= 1) badges.push("İlk Kan 🩸");
    if (me && me.completedCount >= 5) badges.push("Görev Canavarı 👾");
    if (me && me.xp >= 300) badges.push("Efsanevi Ekip Üyesi 👑");

    set({
      leaderboard: leaderboardWithRanks,
      userXp: me ? me.xp : 20,
      userLevel: me ? me.level : 1,
      badges
    });
  }
}));
