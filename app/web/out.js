"use strict";
"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useProjectStore } from "@/stores/projectStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { TaskPhotoUploader } from "./TaskPhotoUploader";
import { useToast } from "@/components/ui/toast";
import {
  Calendar,
  Sparkles,
  Loader2,
  CheckCircle2,
  Circle,
  ListChecks,
  Plus,
  X,
  Clock,
  Pencil,
  Save,
  Trash2,
  Bot,
  Activity,
  CalendarClock,
  Target,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  FileText,
  Paperclip,
  History,
  Flag,
  Share2,
  Copy,
  Mail,
  MessageCircle
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
function LinkedItemsBadges({ taskId }) {
  const [linkedNote, setLinkedNote] = React.useState(null);
  const [linkedEvents, setLinkedEvents] = React.useState([]);
  React.useEffect(() => {
    import("@/stores/noteStore").then(({ useNoteStore }) => {
      const notes = useNoteStore.getState().notes;
      const note = notes.find((n) => n.task_id === taskId);
      setLinkedNote(note || null);
    }).catch(() => {
    });
    import("@/stores/calendarStore").then(({ useCalendarStore }) => {
      const events = useCalendarStore.getState().events;
      const taskEvents = events.filter((e) => e.taskId === taskId);
      setLinkedEvents(taskEvents);
    }).catch(() => {
    });
  }, [taskId]);
  const handleOpenNote = async () => {
    if (linkedNote) {
      const { useNoteStore } = await import("@/stores/noteStore");
      useNoteStore.getState().openNoteDetail(linkedNote);
    }
  };
  if (!linkedNote && linkedEvents.length === 0) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    linkedNote && /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleOpenNote,
        className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-700/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all",
        children: [
          /* @__PURE__ */ jsx(FileText, { className: "w-3 h-3" }),
          linkedNote.title || linkedNote.content?.slice(0, 30) || "Not"
        ]
      }
    ),
    linkedEvents.map((ev) => /* @__PURE__ */ jsxs(
      "span",
      {
        className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-200 dark:border-blue-700/50",
        children: [
          /* @__PURE__ */ jsx(Calendar, { className: "w-3 h-3" }),
          ev.startTime,
          ev.endTime ? ` - ${ev.endTime}` : ""
        ]
      },
      ev.id
    ))
  ] });
}
export function TaskDetailPanel() {
  const {
    selectedTask,
    isDetailPanelOpen,
    closeTaskDetail,
    updateTaskStatus,
    updateTask,
    tasks,
    fetchTasks,
    addSubtask,
    deleteTask
  } = useTaskStore();
  const { projects } = useProjectStore();
  const [isEditingDesc, setIsEditingDesc] = React.useState(false);
  const [descriptionDraft, setDescriptionDraft] = React.useState("");
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState("");
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [editingDueDate, setEditingDueDate] = React.useState(false);
  const [dueDateDraft, setDueDateDraft] = React.useState("");
  const [editingSubtaskId, setEditingSubtaskId] = React.useState(null);
  const [subtaskEditTitle, setSubtaskEditTitle] = React.useState("");
  const [subtaskEditDesc, setSubtaskEditDesc] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState(null);
  const [activityLog, setActivityLog] = React.useState([]);
  const [showPriorityMenu, setShowPriorityMenu] = React.useState(false);
  const [isProgressOpen, setIsProgressOpen] = React.useState(false);
  const [isAIOpen, setIsAIOpen] = React.useState(false);
  const subtaskInputRef = React.useRef(null);
  const priorityMenuRef = React.useRef(null);
  const hasFetchedAI = React.useRef(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const toast = useToast();
  const [isShareMenuOpen, setIsShareMenuOpen] = React.useState(false);
  const shareMenuRef = React.useRef(null);
  const subtasks = React.useMemo(() => {
    if (!selectedTask) return [];
    return tasks.filter((t) => t.parent_task_id === selectedTask.id).sort((a, b) => a.sort_order - b.sort_order);
  }, [tasks, selectedTask]);
  const doneSubtasks = subtasks.filter((t) => t.status === "done");
  const progress = subtasks.length > 0 ? Math.round(doneSubtasks.length / subtasks.length * 100) : 0;
  const project = selectedTask ? projects.find((p) => p.id === selectedTask.project_id) : null;
  const descImages = React.useMemo(() => {
    if (!selectedTask?.description) return [];
    const imgRegex = /(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp|svg))/gi;
    return selectedTask.description.match(imgRegex) || [];
  }, [selectedTask?.description]);
  const elapsedTime = React.useMemo(() => {
    if (!selectedTask?.created_at) return "";
    return formatDistanceToNow(new Date(selectedTask.created_at), { locale: tr, addSuffix: true });
  }, [selectedTask?.created_at]);
  React.useEffect(() => {
    if (isEditingDesc && selectedTask) {
      setDescriptionDraft(selectedTask.description || "");
    }
  }, [isEditingDesc, selectedTask]);
  React.useEffect(() => {
    if (isAddingSubtask && subtaskInputRef.current) {
      subtaskInputRef.current.focus();
    }
  }, [isAddingSubtask]);
  React.useEffect(() => {
    if (selectedTask && isDetailPanelOpen) {
      if (!selectedTask.ai_analysis && !hasFetchedAI.current) {
        hasFetchedAI.current = true;
        fetchAIAnalysis();
      }
      setDueDateDraft(selectedTask.due_date ? selectedTask.due_date.split("T")[0] : "");
      setTitleDraft(selectedTask.title || "");
      const initLogs = [{
        id: "created",
        type: "created",
        text: "G\xF6rev olu\u015Fturuldu",
        timestamp: new Date(selectedTask.created_at ?? 0),
        color: "blue"
      }];
      if (selectedTask.ai_analysis) {
        initLogs.push({
          id: "ai_init",
          type: "ai_analysis",
          text: "AI analizi olu\u015Fturuldu",
          timestamp: new Date(selectedTask.created_at ?? 0),
          color: "purple"
        });
      }
      setActivityLog(initLogs.reverse());
    }
    return () => {
      setIsEditingDesc(false);
      setIsAddingSubtask(false);
      setImagePreview(null);
      setActivityLog([]);
      hasFetchedAI.current = false;
      setEditingSubtaskId(null);
    };
  }, [selectedTask?.id, isDetailPanelOpen]);
  React.useEffect(() => {
    if (!isDetailPanelOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (imagePreview) {
          setImagePreview(null);
          return;
        }
        if (editingSubtaskId) {
          setEditingSubtaskId(null);
          return;
        }
        if (isEditingDesc || isAddingSubtask || editingDueDate) return;
        closeTaskDetail();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDetailPanelOpen, isEditingDesc, isAddingSubtask, editingDueDate, imagePreview, editingSubtaskId, closeTaskDetail]);
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (priorityMenuRef.current && !priorityMenuRef.current.contains(e.target)) {
        setShowPriorityMenu(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setIsShareMenuOpen(false);
      }
    };
    if (showPriorityMenu || isShareMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPriorityMenu, isShareMenuOpen]);
  if (!selectedTask || !isDetailPanelOpen) return null;
  async function fetchAIAnalysis() {
    if (!selectedTask) return;
    setIsAnalyzing(true);
    try {
      await api.post(`/api/tasks/${selectedTask.id}/ai-analysis`);
      await fetchTasks();
      addActivityEvent("ai_analysis", "AI analizi yenilendi", "purple");
    } catch (e) {
      console.error("AI analiz y\xFCklenemedi:", e);
    } finally {
      setIsAnalyzing(false);
    }
  }
  function addActivityEvent(type, text, color) {
    setActivityLog((prev) => [{
      id: `${Date.now()}_${Math.random()}`,
      type,
      text,
      timestamp: /* @__PURE__ */ new Date(),
      color
    }, ...prev]);
  }
  const saveTitle = async () => {
    if (!titleDraft.trim() || titleDraft === selectedTask.title) {
      setIsEditingTitle(false);
      return;
    }
    const newTitle = titleDraft;
    setIsEditingTitle(false);
    try {
      await updateTask(selectedTask.id, { title: newTitle });
      await fetchTasks();
      addActivityEvent("description_edit", "Ba\u015Fl\u0131k g\xFCncellendi", "blue");
    } catch (e) {
      console.error(e);
    }
  };
  const saveDescription = async () => {
    const draft = descriptionDraft;
    setIsEditingDesc(false);
    try {
      await updateTask(selectedTask.id, { description: draft });
      await fetchTasks();
      addActivityEvent("description_edit", "A\xE7\u0131klama g\xFCncellendi", "blue");
    } catch (e) {
      console.error(e);
    }
  };
  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    const title = newSubtaskTitle;
    setNewSubtaskTitle("");
    try {
      await addSubtask(selectedTask.id, { title, status: "todo" });
      addActivityEvent("subtask_done", `"${title}" alt g\xF6revi eklendi`, "teal");
    } catch (e) {
      console.error(e);
    }
  };
  const openSubtaskEdit = (st) => {
    setEditingSubtaskId(st.id);
    setSubtaskEditTitle(st.title);
    setSubtaskEditDesc(st.description || "");
  };
  const saveSubtaskEdit = async () => {
    if (!editingSubtaskId || !subtaskEditTitle.trim()) return;
    const idToUpdate = editingSubtaskId;
    const newTitle = subtaskEditTitle;
    const newDesc = subtaskEditDesc;
    setEditingSubtaskId(null);
    try {
      await updateTask(idToUpdate, { title: newTitle, description: newDesc });
      await fetchTasks();
      addActivityEvent("description_edit", `"${newTitle}" alt g\xF6revi g\xFCncellendi`, "blue");
    } catch (e) {
      console.error(e);
    }
  };
  const cancelSubtaskEdit = () => {
    setEditingSubtaskId(null);
  };
  const handleSubtaskToggle = async (st) => {
    const newStatus = st.status === "done" ? "todo" : "done";
    await updateTaskStatus(st.id, newStatus);
    if (newStatus === "done") {
      const remaining = subtasks.filter((s) => s.id !== st.id && s.status !== "done").length;
      addActivityEvent("subtask_done", `"${st.title}" tamamland\u0131${remaining === 0 ? " \u2014 T\xFCm alt g\xF6revler bitti! \u{1F389}" : ""}`, "emerald");
    }
  };
  const saveDueDate = async () => {
    const dueDate = dueDateDraft ? new Date(dueDateDraft).toISOString() : null;
    const draftText = dueDateDraft;
    setEditingDueDate(false);
    try {
      await updateTask(selectedTask.id, { due_date: dueDate });
      await fetchTasks();
      addActivityEvent("date_change", `Hedef tarih ${draftText ? format(new Date(draftText), "dd MMM yyyy", { locale: tr }) : "kald\u0131r\u0131ld\u0131"}`, "amber");
    } catch (e) {
      console.error(e);
    }
  };
  const handleDeleteSubtask = async (id, e) => {
    e.stopPropagation();
    await deleteTask(id);
  };
  const handleStatusChange = (status) => {
    updateTaskStatus(selectedTask.id, status);
    const label = statusConfig[status]?.label || status;
    addActivityEvent("status_change", `Durum "${label}" olarak de\u011Fi\u015Ftirildi`, "indigo");
  };
  const handlePriorityChange = async (priority) => {
    await updateTask(selectedTask.id, { priority });
    await fetchTasks();
    setShowPriorityMenu(false);
    const pLabel = priorityConfig[priority]?.label || priority;
    addActivityEvent("status_change", `\xD6ncelik "${pLabel}" olarak de\u011Fi\u015Ftirildi`, "amber");
  };
  const generateShareText = () => {
    if (!selectedTask) return "";
    let text = `\u{1F4CC} G\xF6rev: ${selectedTask.title}
`;
    if (selectedTask.due_date) {
      text += `\u{1F4C5} Hedef Tarih: ${format(new Date(selectedTask.due_date), "dd MMM yyyy", { locale: tr })}
`;
    }
    const pConfigItem = priorityConfig[selectedTask.priority] || priorityConfig["medium"];
    text += `\u26A1 \xD6ncelik: ${pConfigItem.label}
`;
    const sConfigItem = statusConfig[selectedTask.status] || statusConfig["todo"];
    text += `\u{1F6A5} Durum: ${sConfigItem.label}

`;
    if (selectedTask.description) {
      text += `\u{1F4DD} A\xE7\u0131klama:
${selectedTask.description}

`;
    }
    if (subtasks.length > 0) {
      text += `\u2705 Alt G\xF6revler:
`;
      subtasks.forEach((st) => {
        text += `- [${st.status === "done" ? "x" : " "}] ${st.title}
`;
      });
      text += "\n";
    }
    if (selectedTask.task_photos && selectedTask.task_photos.length > 0) {
      text += `\u{1F5BC}\uFE0F ${selectedTask.task_photos.length} adet foto\u011Fraf (dosya olarak/ekli) mevcuttur.
`;
    }
    return text;
  };
  const handleCopyText = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      setIsShareMenuOpen(false);
      addActivityEvent("status_change", "G\xF6rev metni panoya kopyaland\u0131", "blue");
    } catch (e) {
      console.error(e);
    }
  };
  const handleShareWhatsApp = async () => {
    const text = generateShareText();
    setIsShareMenuOpen(false);
    const isNative = typeof window !== "undefined" && window.Capacitor?.isNative;
    const isMobileBrowser = typeof window !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const encodedText = encodeURIComponent(text);
    let waWindow = null;
    if (!isNative && !isMobileBrowser) {
      waWindow = window.open("about:blank", "_blank");
    }
    const filesToShare = [];
    if (selectedTask?.task_photos && selectedTask.task_photos.length > 0) {
      toast.show("Foto\u011Fraflar haz\u0131rlan\u0131yor, l\xFCtfen bekleyin...", "loading", 4e3);
      for (const photo of selectedTask.task_photos) {
        try {
          const lh3Url = `https://lh3.googleusercontent.com/d/${photo.drive_id}=s0`;
          if (isNative) {
            const response = await fetch(lh3Url, { mode: "cors" });
            const blob = await response.blob();
            const pureBase64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const dataUrl = reader.result;
                resolve(dataUrl.split(",")[1]);
              };
              reader.readAsDataURL(blob);
            });
            const ext = photo.name?.split(".").pop() || "jpg";
            const fileName = `share_${Date.now()}_${photo.drive_id}.${ext}`;
            const { Filesystem, Directory } = await import("@capacitor/filesystem");
            const writeResult = await Filesystem.writeFile({
              path: fileName,
              data: pureBase64,
              directory: Directory.Cache
            });
            filesToShare.push(writeResult.uri);
          } else {
            fetch(lh3Url, { mode: "cors", cache: "no-cache" }).then((res) => res.blob()).then((blob) => {
              if (blob.size > 1e3) {
                const objUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = objUrl;
                a.download = photo.name || "foto.jpg";
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                  document.body.removeChild(a);
                  URL.revokeObjectURL(objUrl);
                }, 1e3);
              }
            }).catch((e) => console.warn("Otomatik indirme hatas\u0131", e));
          }
        } catch (error) {
          console.warn("Foto\u011Fraf i\u015Fleme hatas\u0131", error);
        }
      }
    }
    if (isNative) {
      try {
        const { Share } = await import("@capacitor/share");
        await Share.share({
          title: selectedTask?.title || "G\xF6rev",
          text,
          url: "",
          files: filesToShare.length > 0 ? filesToShare : void 0,
          dialogTitle: "\u015Eununla Payla\u015F (WhatsApp Se\xE7in)"
        });
        addActivityEvent("status_change", "Foto\u011Frafl\u0131 g\xF6rev payla\u015F\u0131ld\u0131", "emerald");
      } catch (e) {
        window.open(`whatsapp://send?text=${encodedText}`, "_system");
      }
    } else if (isMobileBrowser) {
      window.location.href = `whatsapp://send?text=${encodedText}`;
      if (selectedTask?.task_photos && selectedTask.task_photos.length > 0) {
        toast.show("Metin WhatsApp'a aktar\u0131ld\u0131, foto\u011Fraflar cihaz\u0131n\u0131za indirildi.", "success", 5e3);
      }
      addActivityEvent("status_change", "WhatsApp (Mobil) payla\u015F\u0131ld\u0131", "emerald");
    } else {
      if (waWindow) {
        waWindow.location.href = `https://api.whatsapp.com/send?text=${encodedText}`;
      } else {
        window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
      }
      if (selectedTask?.task_photos && selectedTask.task_photos.length > 0) {
        toast.show("Metin WhatsApp'a aktar\u0131ld\u0131, foto\u011Fraflar bilgisayar\u0131n\u0131za indirildi.", "success", 5e3);
      }
      addActivityEvent("status_change", "WhatsApp payla\u015F\u0131m\u0131 ba\u015Flat\u0131ld\u0131", "emerald");
    }
  };
  const handleShareEmail = () => {
    const text = generateShareText();
    setIsShareMenuOpen(false);
    const subject = encodeURIComponent(`G\xF6rev: ${selectedTask?.title}`);
    const body = encodeURIComponent(text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    addActivityEvent("status_change", "E-posta olu\u015Fturuldu", "blue");
  };
  const handleNativeShare = async () => {
    const text = generateShareText();
    setIsShareMenuOpen(false);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: selectedTask?.title || "G\xF6rev Payla\u015F\u0131m\u0131",
          text
        });
        addActivityEvent("status_change", "G\xF6rev payla\u015F\u0131ld\u0131", "blue");
      } catch (err) {
        console.error("Native share failed", err);
      }
    }
  };
  const priorityConfig = {
    urgent: { label: "Acil", gradient: "from-rose-400 to-orange-400", flagColor: "text-rose-500" },
    high: { label: "Y\xFCksek", gradient: "from-orange-400 to-amber-400", flagColor: "text-orange-500" },
    normal: { label: "Normal", gradient: "from-amber-300 to-yellow-400", flagColor: "text-amber-500" },
    medium: { label: "Orta", gradient: "from-amber-300 to-yellow-400", flagColor: "text-amber-500" },
    low: { label: "D\xFC\u015F\xFCk", gradient: "from-emerald-300 to-teal-400", flagColor: "text-emerald-500" }
  };
  const statusConfig = {
    todo: { label: "Bekliyor", color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-400" },
    in_progress: { label: "Devam Ediyor", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500" },
    done: { label: "Tamamland\u0131", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500" }
  };
  const pConfig = priorityConfig[selectedTask.priority] || priorityConfig["medium"];
  const sConfig = statusConfig[selectedTask.status] || statusConfig["todo"];
  const getActivityIcon = (event) => {
    const colorMap = {
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
      indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
      teal: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
    };
    const iconMap = {
      status_change: /* @__PURE__ */ jsx(Activity, { className: "w-3 h-3" }),
      ai_analysis: /* @__PURE__ */ jsx(Bot, { className: "w-3 h-3" }),
      subtask_done: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3 h-3" }),
      created: /* @__PURE__ */ jsx(Plus, { className: "w-3 h-3" }),
      description_edit: /* @__PURE__ */ jsx(Pencil, { className: "w-3 h-3" }),
      date_change: /* @__PURE__ */ jsx(Calendar, { className: "w-3 h-3" })
    };
    return /* @__PURE__ */ jsx("div", { className: `w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[event.color || "blue"]}`, children: iconMap[event.type] || /* @__PURE__ */ jsx(Activity, { className: "w-3 h-3" }) });
  };
  const totalEstimated = selectedTask.estimated_minutes || subtasks.reduce((acc, st) => acc + (st.estimated_minutes || 0), 0);
  const totalActual = selectedTask.actual_minutes || subtasks.reduce((acc, st) => acc + (st.actual_minutes || 0), 0);
  const calculateTotalDuration = () => {
    if (selectedTask.status !== "done" || !selectedTask.completed_at || !selectedTask.created_at) return "\u2014";
    const start = new Date(selectedTask.created_at).getTime();
    const end = new Date(selectedTask.completed_at).getTime();
    const diffMins = Math.max(0, Math.round((end - start) / 6e4));
    if (diffMins < 60) return `${diffMins}dk`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours < 24) return `${hours}s ${mins}dk`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}g ${remainingHours}s`;
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      ConfirmDialog,
      {
        isOpen: isDeleteConfirmOpen,
        onOpenChange: setIsDeleteConfirmOpen,
        title: "G\xF6revi Sil",
        description: "Bu g\xF6revi silmek istedi\u011Finize emin misiniz? Bu i\u015Flem geri al\u0131namaz.",
        confirmText: "Sil",
        onConfirm: async () => {
          await deleteTask(selectedTask.id);
          closeTaskDetail();
        }
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-200",
        onClick: closeTaskDetail
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-0 md:p-5 pointer-events-none", children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "pointer-events-auto w-full max-w-full md:max-w-[1280px] h-[100dvh] md:h-[92vh] rounded-none md:rounded-3xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 border-0 md:border border-slate-200/60 dark:border-white/10 shadow-2xl shadow-indigo-500/10 bg-white dark:bg-slate-900 flex flex-col",
        onClick: (e) => e.stopPropagation(),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "relative px-4 md:px-8 pt-4 md:pt-6 pb-3 md:pb-5 border-b border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 shrink-0", children: [
            /* @__PURE__ */ jsx("div", { className: `absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${pConfig.gradient}` }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-3", children: [
                  project && /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white shadow-sm",
                      style: { backgroundColor: project.color || "#6366f1" },
                      children: project.name
                    }
                  ),
                  /* @__PURE__ */ jsxs("span", { className: `flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${sConfig.color}`, children: [
                    /* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full ${sConfig.bg} shadow-sm` }),
                    sConfig.label
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "relative", ref: priorityMenuRef, children: [
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => setShowPriorityMenu(!showPriorityMenu),
                        className: `text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${pConfig.gradient} text-white shadow-sm flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer`,
                        children: [
                          /* @__PURE__ */ jsx(Flag, { className: "w-3 h-3" }),
                          pConfig.label,
                          /* @__PURE__ */ jsx(ChevronDown, { className: "w-3 h-3" })
                        ]
                      }
                    ),
                    showPriorityMenu && /* @__PURE__ */ jsx("div", { className: "absolute top-full left-0 mt-1 z-20 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 animate-in fade-in slide-in-from-top-2 duration-150", children: Object.entries(priorityConfig).filter(([k]) => k !== "normal").map(([key, cfg]) => /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => handlePriorityChange(key),
                        className: `w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${selectedTask.priority === key ? "bg-slate-50 dark:bg-slate-700" : ""}`,
                        children: [
                          /* @__PURE__ */ jsx(Flag, { className: `w-3 h-3 ${cfg.flagColor}` }),
                          cfg.label,
                          selectedTask.priority === key && /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3 h-3 text-indigo-500 ml-auto" })
                        ]
                      },
                      key
                    )) })
                  ] })
                ] }),
                isEditingTitle ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1 mb-2", children: [
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      value: titleDraft,
                      onChange: (e) => setTitleDraft(e.target.value),
                      className: "text-xl md:text-2xl font-black text-slate-800 dark:text-white/95 h-12 bg-white dark:bg-black/20",
                      autoFocus: true,
                      onKeyDown: (e) => {
                        if (e.key === "Enter") saveTitle();
                        if (e.key === "Escape") {
                          setIsEditingTitle(false);
                          setTitleDraft(selectedTask.title);
                        }
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(Button, { onClick: saveTitle, size: "sm", className: "bg-indigo-500 hover:bg-indigo-600 text-white shrink-0", children: "Kaydet" }),
                  /* @__PURE__ */ jsx("button", { onClick: () => {
                    setIsEditingTitle(false);
                    setTitleDraft(selectedTask.title);
                  }, className: "p-2 text-slate-400 hover:text-slate-600 shrink-0", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) })
                ] }) : /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-black text-slate-800 dark:text-white/95 leading-tight group flex items-center gap-2 cursor-pointer transition-colors hover:text-indigo-600 dark:hover:text-indigo-400", onClick: () => setIsEditingTitle(true), children: [
                  selectedTask.title,
                  /* @__PURE__ */ jsx(Pencil, { className: "w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 mt-3 text-xs font-semibold text-slate-500 dark:text-white/40", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5" }),
                    "Olu\u015Fturulma: ",
                    selectedTask.created_at ? format(new Date(selectedTask.created_at), "dd MMM yyyy HH:mm", { locale: tr }) : "\u2014"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5" }),
                    elapsedTime
                  ] }),
                  selectedTask.due_date && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-orange-500 dark:text-orange-400", children: [
                    /* @__PURE__ */ jsx(Target, { className: "w-3.5 h-3.5" }),
                    "Hedef: ",
                    format(new Date(selectedTask.due_date), "dd MMM yyyy", { locale: tr })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 mt-1 relative", ref: shareMenuRef, children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setIsShareMenuOpen(!isShareMenuOpen),
                    className: "p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-500 hover:text-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 dark:hover:text-indigo-300 transition-all shadow-sm",
                    title: "G\xF6revi Payla\u015F",
                    children: /* @__PURE__ */ jsx(Share2, { className: "w-5 h-5" })
                  }
                ),
                isShareMenuOpen && /* @__PURE__ */ jsxs("div", { className: "absolute top-0 right-12 z-50 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 animate-in fade-in slide-in-from-right-2 duration-150", children: [
                  /* @__PURE__ */ jsxs("button", { onClick: handleCopyText, className: "w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-white/90", children: [
                    /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4 text-slate-400" }),
                    " Panoya Kopyala"
                  ] }),
                  /* @__PURE__ */ jsxs("button", { onClick: handleShareWhatsApp, className: "w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-emerald-700 dark:text-emerald-400", children: [
                    /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4 text-emerald-500" }),
                    " WhatsApp'ta Payla\u015F"
                  ] }),
                  /* @__PURE__ */ jsxs("button", { onClick: handleShareEmail, className: "w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-blue-700 dark:text-blue-400", children: [
                    /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4 text-blue-500" }),
                    " E-posta G\xF6nder"
                  ] }),
                  typeof navigator !== "undefined" && typeof navigator.share === "function" && /* @__PURE__ */ jsxs("button", { onClick: handleNativeShare, className: "w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-purple-700 dark:text-purple-400 border-t border-slate-100 dark:border-slate-700/50 mt-1 pt-2", children: [
                    /* @__PURE__ */ jsx(Share2, { className: "w-4 h-4 text-purple-500" }),
                    " Di\u011Fer..."
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: closeTaskDetail,
                    className: "p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/40 dark:hover:text-white transition-all shadow-sm",
                    title: "Kapat",
                    children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setIsDeleteConfirmOpen(true),
                    className: "p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:hover:text-red-300 transition-all shadow-sm",
                    title: "G\xF6revi Sil",
                    children: /* @__PURE__ */ jsx(Trash2, { className: "w-5 h-5" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 md:gap-2 mt-3 md:mt-4 overflow-x-auto pb-1 scrollbar-none", children: [
              ["todo", "in_progress", "done"].map((s) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleStatusChange(s),
                  className: `px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl whitespace-nowrap transition-all shadow-sm ${selectedTask.status === s ? "bg-indigo-600 text-white shadow-indigo-500/30" : "bg-white dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent"}`,
                  children: statusConfig[s].label
                },
                s
              )),
              /* @__PURE__ */ jsx("div", { className: "flex-1" }),
              editingDueDate ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "date",
                    value: dueDateDraft,
                    onChange: (e) => setDueDateDraft(e.target.value),
                    className: "px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/20 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
                  }
                ),
                /* @__PURE__ */ jsx(Button, { size: "sm", className: "h-8 text-xs font-bold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white px-4", onClick: saveDueDate, children: "Kaydet" }),
                /* @__PURE__ */ jsx("button", { onClick: () => setEditingDueDate(false), className: "text-slate-400 hover:text-slate-600 dark:text-white/30", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) })
              ] }) : /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setEditingDueDate(true),
                  className: "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-white dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/10 shadow-sm",
                  children: [
                    /* @__PURE__ */ jsx(CalendarClock, { className: "w-4 h-4 opacity-70" }),
                    selectedTask.due_date ? "Tarihi D\xFCzenle" : "Hedef Tarih Ekle"
                  ]
                }
              )
            ] }),
            subtasks.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-4", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: `h-full transition-all duration-700 ease-out ${progress === 100 ? "bg-gradient-to-r from-emerald-400 to-green-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`,
                  style: { width: `${progress}%` }
                }
              ) }),
              /* @__PURE__ */ jsxs("span", { className: `text-sm font-black min-w-[36px] ${progress === 100 ? "text-emerald-500" : "text-indigo-600 dark:text-indigo-400"}`, children: [
                progress,
                "%"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col md:flex-row overflow-hidden min-h-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-y-auto md:border-r border-slate-200/50 dark:border-white/5 pb-24 md:pb-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-4 md:p-7 border-b border-slate-100 dark:border-white/5", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-slate-800 dark:text-white/90", children: "G\xF6rev A\xE7\u0131klamas\u0131" }),
                  !isEditingDesc && /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setIsEditingDesc(true),
                      className: "text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-white/40 dark:hover:text-white/80 flex items-center gap-1.5 transition-colors",
                      children: [
                        /* @__PURE__ */ jsx(Pencil, { className: "w-3.5 h-3.5" }),
                        " D\xFCzenle"
                      ]
                    }
                  )
                ] }),
                isEditingDesc ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                  /* @__PURE__ */ jsx(
                    Textarea,
                    {
                      value: descriptionDraft,
                      onChange: (e) => setDescriptionDraft(e.target.value),
                      placeholder: "A\xE7\u0131klama, linkler, notlar ekleyin...",
                      className: "min-h-[160px] text-sm bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/90 resize-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl shadow-inner font-medium",
                      autoFocus: true
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2 sticky bottom-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 py-4 border-t border-slate-100 dark:border-white/5 -mx-7 px-7 mt-2", children: [
                    /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", className: "h-8 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:text-white/50 rounded-xl px-4", onClick: () => setIsEditingDesc(false), children: "\u0130ptal" }),
                    /* @__PURE__ */ jsxs(Button, { size: "sm", className: "h-8 text-xs font-bold gap-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white px-5", onClick: saveDescription, children: [
                      /* @__PURE__ */ jsx(Save, { className: "w-3.5 h-3.5" }),
                      " Kaydet"
                    ] })
                  ] })
                ] }) : /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 p-5 cursor-text hover:bg-slate-100/50 dark:hover:bg-white/10 transition-all min-h-[100px] shadow-sm",
                    onClick: () => setIsEditingDesc(true),
                    children: selectedTask.description ? /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-slate-600 dark:text-white/70 whitespace-pre-wrap break-words leading-relaxed", children: selectedTask.description }) : /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-400 dark:text-white/30 italic", children: "A\xE7\u0131klama eklemek i\xE7in t\u0131klay\u0131n..." })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold text-slate-500 dark:text-white/50", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Durum: ",
                    /* @__PURE__ */ jsx("span", { className: `${sConfig.color} font-bold`, children: sConfig.label })
                  ] }),
                  selectedTask.due_date && /* @__PURE__ */ jsxs("span", { children: [
                    "Tarih: ",
                    /* @__PURE__ */ jsx("span", { className: "text-slate-700 dark:text-white/70 font-bold", children: format(new Date(selectedTask.due_date), "dd MMM yyyy", { locale: tr }) })
                  ] }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "\xD6ncelik: ",
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-700 dark:text-white/70", children: pConfig.label })
                  ] }),
                  /* @__PURE__ */ jsx(LinkedItemsBadges, { taskId: selectedTask.id })
                ] }),
                descImages.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
                  /* @__PURE__ */ jsxs("h4", { className: "text-xs font-bold text-slate-500 dark:text-white/50 flex items-center gap-1.5 mb-2", children: [
                    /* @__PURE__ */ jsx(Paperclip, { className: "w-3 h-3" }),
                    " Eklentiler (",
                    descImages.length,
                    ")"
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3", children: descImages.map((url, i) => /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: url,
                      alt: `Ek ${i + 1}`,
                      className: "w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-white/10 shadow-sm cursor-zoom-in hover:scale-105 transition-transform duration-300",
                      onClick: () => setImagePreview(url)
                    },
                    i
                  )) })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "p-4 md:p-7 border-b border-slate-100 dark:border-white/5", children: /* @__PURE__ */ jsx(
                TaskPhotoUploader,
                {
                  taskId: selectedTask.id,
                  taskTitle: selectedTask.title,
                  photos: selectedTask.task_photos || [],
                  onPhotosChange: async (newPhotos) => {
                    const prevPhotos = selectedTask.task_photos || [];
                    try {
                      await updateTask(selectedTask.id, { task_photos: newPhotos });
                      if (newPhotos.length > prevPhotos.length) {
                        addActivityEvent("description_edit", `Foto\u011Fraf eklendi (${newPhotos.length} adet)`, "indigo");
                      } else if (newPhotos.length < prevPhotos.length) {
                        addActivityEvent("description_edit", "Foto\u011Fraf silindi", "amber");
                      }
                    } catch (e) {
                      console.error("Foto\u011Fraf g\xFCncelleme hatas\u0131:", e);
                    }
                  }
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "p-7 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                  /* @__PURE__ */ jsxs("h3", { className: "text-base font-bold text-slate-800 dark:text-white/90 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(ListChecks, { className: "w-4 h-4 text-blue-500" }),
                    "Alt G\xF6revler",
                    subtasks.length > 0 && /* @__PURE__ */ jsxs("span", { className: "text-[10px] bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/60 px-2.5 py-0.5 rounded-full font-black ml-1", children: [
                      doneSubtasks.length,
                      "/",
                      subtasks.length
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: async () => {
                        setIsAnalyzing(true);
                        try {
                          await api.post(`/api/breakdown/${selectedTask.id}`);
                          await fetchTasks();
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setIsAnalyzing(false);
                        }
                      },
                      disabled: isAnalyzing,
                      className: "text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400/70 flex items-center gap-1.5 transition-colors disabled:opacity-50",
                      children: [
                        isAnalyzing ? /* @__PURE__ */ jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5" }),
                        "AI ile B\xF6l"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1", children: subtasks.map((st) => editingSubtaskId === st.id ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-indigo-200 dark:border-indigo-500/30 shadow-sm animate-in fade-in", children: [
                  /* @__PURE__ */ jsx(Textarea, { value: subtaskEditTitle, onChange: (e) => setSubtaskEditTitle(e.target.value), placeholder: "Alt g\xF6rev ad\u0131", className: "min-h-[40px] text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 resize-none py-2", autoFocus: true }),
                  /* @__PURE__ */ jsx(Textarea, { value: subtaskEditDesc, onChange: (e) => setSubtaskEditDesc(e.target.value), placeholder: "A\xE7\u0131klama (opsiyonel)", className: "min-h-[60px] text-[11px] resize-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 mt-1", children: [
                    /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: cancelSubtaskEdit, className: "h-7 text-[11px] px-3", children: "\u0130ptal" }),
                    /* @__PURE__ */ jsx(Button, { size: "sm", onClick: saveSubtaskEdit, className: "h-7 text-[11px] px-4 bg-indigo-500 hover:bg-indigo-600 text-white", children: "Kaydet" })
                  ] })
                ] }, st.id) : /* @__PURE__ */ jsxs("div", { className: "group flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200/50 dark:hover:border-white/10 cursor-pointer", onClick: () => openSubtaskEdit(st), children: [
                  /* @__PURE__ */ jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    handleSubtaskToggle(st);
                  }, className: "flex-shrink-0", children: st.status === "done" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-emerald-500" }) : /* @__PURE__ */ jsx(Circle, { className: "w-5 h-5 text-slate-300 hover:text-indigo-500 dark:text-white/20 dark:hover:text-indigo-400 transition-colors" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      st.description && /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5 text-slate-400 dark:text-white/30 flex-shrink-0" }),
                      /* @__PURE__ */ jsx("span", { className: `text-sm font-medium ${st.status === "done" ? "line-through text-slate-400 dark:text-white/40" : "text-slate-700 dark:text-white/90"}`, children: st.title })
                    ] }),
                    st.description && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500 dark:text-white/40 mt-0.5 ml-5 leading-snug", children: st.description })
                  ] }),
                  st.estimated_minutes && /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-slate-400 dark:text-white/30 px-2 py-0.5 bg-slate-100 dark:bg-black/20 rounded-md", children: [
                    st.estimated_minutes,
                    "dk"
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        openSubtaskEdit(st);
                      },
                      className: "opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600 p-1 rounded-lg",
                      children: /* @__PURE__ */ jsx(Pencil, { className: "w-3.5 h-3.5" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: (e) => handleDeleteSubtask(st.id, e),
                      className: "opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 p-1 rounded-lg",
                      children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                    }
                  )
                ] }, st.id)) }),
                isAddingSubtask ? /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2", children: [
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      ref: subtaskInputRef,
                      value: newSubtaskTitle,
                      onChange: (e) => setNewSubtaskTitle(e.target.value),
                      placeholder: "Detayl\u0131 bir ad\u0131m...",
                      className: "text-sm h-9 flex-1 bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-xl",
                      onKeyDown: (e) => {
                        if (e.key === "Enter") handleAddSubtask();
                        if (e.key === "Escape") {
                          setIsAddingSubtask(false);
                          setNewSubtaskTitle("");
                        }
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(Button, { size: "sm", className: "h-9 text-xs font-bold px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white", onClick: handleAddSubtask, children: "Ekle" }),
                  /* @__PURE__ */ jsx("button", { onClick: () => {
                    setIsAddingSubtask(false);
                    setNewSubtaskTitle("");
                  }, className: "text-slate-400 hover:text-slate-600", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) })
                ] }) : /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setIsAddingSubtask(true),
                    className: "mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all border border-dashed border-slate-300 dark:border-white/10 hover:border-indigo-500/50",
                    children: [
                      /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                      " Yeni Alt G\xF6rev Ekle"
                    ]
                  }
                ),
                subtasks.length === 0 && !isAddingSubtask && /* @__PURE__ */ jsxs("p", { className: "text-xs font-medium text-slate-500 dark:text-white/30 text-center py-6", children: [
                  "Buray\u0131 k\xFC\xE7\xFCk ad\u0131mlara b\xF6lmek i\u015Fi kolayla\u015Ft\u0131r\u0131r. ",
                  /* @__PURE__ */ jsx("br", {}),
                  /* @__PURE__ */ jsx("span", { className: "text-indigo-500 font-bold", children: "AI ile B\xF6l" }),
                  " butonunu deneyin."
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "w-full md:w-[400px] shrink-0 flex flex-col overflow-hidden bg-slate-50/30 dark:bg-black/10", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "border-b border-slate-100 dark:border-white/5 shrink-0 cursor-pointer select-none",
                  onClick: () => setIsProgressOpen(!isProgressOpen),
                  children: /* @__PURE__ */ jsxs("div", { className: "p-3 md:p-5", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4 text-emerald-500" }),
                        /* @__PURE__ */ jsx("span", { className: "text-[10px] md:text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400/80", children: "\u0130lerleme \xD6zeti" })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-emerald-600 md:hidden", children: [
                          progress,
                          "%"
                        ] }),
                        /* @__PURE__ */ jsx(ChevronDown, { className: `w-3.5 h-3.5 transition-transform text-slate-400 ${isProgressOpen ? "rotate-180" : ""}` })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: `overflow-hidden transition-all duration-300 ease-in-out ${isProgressOpen ? "max-h-[300px] mt-3" : "max-h-0 md:max-h-[300px] md:mt-3"}`, children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-500/10 dark:to-teal-500/5 border border-emerald-100 dark:border-emerald-500/20 p-4", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium text-emerald-800/80 dark:text-emerald-100/60 leading-relaxed", children: subtasks.length > 0 ? `${subtasks.length} alt g\xF6revden ${doneSubtasks.length} tanesi tamamland\u0131 (${progress}%). ${progress === 100 ? "Harika, g\xF6rev tamamlanmaya haz\u0131r! \u{1F389}" : progress >= 50 ? "Yar\u0131dan fazlas\u0131 bitti, devam et! \u{1F4AA}" : "Hen\xFCz ba\u015Flang\u0131\xE7 a\u015Famas\u0131nda, ilk ad\u0131ma odaklan."}` : "Alt g\xF6rev eklendik\xE7e ilerleme burada \xF6zetlenecek." }),
                      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-3 w-full md:w-2/3 mx-auto", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex-1 bg-white/80 dark:bg-slate-800/60 rounded-lg p-1.5 text-center flex flex-col justify-center", children: [
                          /* @__PURE__ */ jsxs("p", { className: "text-sm font-black text-slate-800 dark:text-white/90", children: [
                            totalActual,
                            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 ml-0.5", children: "dk" })
                          ] }),
                          /* @__PURE__ */ jsx("p", { className: "text-[9px] font-bold uppercase text-slate-500 dark:text-white/50", children: "Harcanan" })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex-1 bg-white/80 dark:bg-slate-800/60 rounded-lg p-1.5 text-center flex flex-col justify-center", children: [
                          /* @__PURE__ */ jsxs("p", { className: "text-sm font-black text-slate-800 dark:text-white/90", children: [
                            totalEstimated || "\u2014",
                            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 ml-0.5", children: totalEstimated ? "dk" : "" })
                          ] }),
                          /* @__PURE__ */ jsx("p", { className: "text-[9px] font-bold uppercase text-slate-500 dark:text-white/50", children: "Tahmini" })
                        ] })
                      ] })
                    ] }) })
                  ] })
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "border-b border-slate-100 dark:border-white/5 shrink-0 cursor-pointer select-none",
                  onClick: () => setIsAIOpen(!isAIOpen),
                  children: /* @__PURE__ */ jsxs("div", { className: "p-3 md:p-4", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxs("h3", { className: "text-[10px] md:text-xs font-bold uppercase tracking-widest md:tracking-normal md:normal-case text-slate-700 dark:text-white/80 flex items-center gap-2", children: [
                        /* @__PURE__ */ jsx(Bot, { className: "w-4 h-4 text-purple-500" }),
                        "Yapay Zeka"
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                        /* @__PURE__ */ jsxs(
                          "button",
                          {
                            onClick: (e) => {
                              e.stopPropagation();
                              fetchAIAnalysis();
                            },
                            disabled: isAnalyzing,
                            className: "text-[10px] font-semibold text-purple-500 hover:text-purple-600 flex items-center gap-1 transition-colors disabled:opacity-50",
                            children: [
                              isAnalyzing ? /* @__PURE__ */ jsx(Loader2, { className: "w-3 h-3 animate-spin" }) : /* @__PURE__ */ jsx(Sparkles, { className: "w-3 h-3" }),
                              /* @__PURE__ */ jsx("span", { className: "hidden md:inline", children: "Yenile" })
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsx(ChevronDown, { className: `w-3.5 h-3.5 transition-transform text-slate-400 ${isAIOpen ? "rotate-180" : ""}` })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: `overflow-hidden transition-all duration-300 ease-in-out ${isAIOpen ? "max-h-[500px] mt-3" : "max-h-0 md:max-h-[100px] md:mt-3"}`, children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-br from-purple-100/80 to-indigo-100/60 dark:from-purple-500/15 dark:to-indigo-500/10 border border-purple-200/50 dark:border-purple-500/20 p-3 md:p-4 shadow-sm relative overflow-hidden", children: [
                      /* @__PURE__ */ jsx("div", { className: "absolute -top-10 -right-10 w-24 h-24 bg-purple-400/20 blur-3xl rounded-full pointer-events-none" }),
                      isAnalyzing ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-medium text-purple-600/70 dark:text-purple-300/60", children: [
                        /* @__PURE__ */ jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin text-purple-500" }),
                        "B\xFCy\xFCk zeka d\xFC\u015F\xFCn\xFCyor..."
                      ] }) : selectedTask.ai_analysis ? /* @__PURE__ */ jsx("p", { className: "text-[11px] md:text-[12px] font-medium text-slate-700 dark:text-white/80 leading-relaxed whitespace-pre-wrap relative z-10", children: selectedTask.ai_analysis }) : /* @__PURE__ */ jsx("p", { className: "text-[11px] md:text-[12px] font-medium text-slate-400 dark:text-white/30 italic relative z-10", children: "AI analizi yok. Yenile'ye t\u0131klay\u0131n." })
                    ] }) }),
                    selectedTask.ai_analysis_history && selectedTask.ai_analysis_history.length > 0 && /* @__PURE__ */ jsxs("div", { className: `mt-2 space-y-1.5 overflow-hidden transition-all duration-300 ${isAIOpen ? "max-h-[200px]" : "max-h-0"}`, children: [
                      /* @__PURE__ */ jsx("h4", { className: "text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40", children: "Ge\xE7mi\u015F Analizler" }),
                      selectedTask.ai_analysis_history.slice(0, 3).map((hist, i) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-2", children: [
                        /* @__PURE__ */ jsx("p", { className: "text-[9px] text-slate-400 dark:text-white/40 mb-0.5 font-semibold", children: format(new Date(hist.created_at), "dd MMM yyyy HH:mm", { locale: tr }) }),
                        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium text-slate-600 dark:text-white/60 line-clamp-1", children: hist.text })
                      ] }, i))
                    ] })
                  ] })
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "hidden md:flex flex-1 flex-col overflow-hidden min-h-0", children: [
                /* @__PURE__ */ jsx("div", { className: "px-5 pt-5 pb-2 shrink-0", children: /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-slate-700 dark:text-white/80 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(History, { className: "w-4 h-4 text-emerald-500" }),
                  "\u0130\u015Flem Ge\xE7mi\u015Fi"
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-5 pb-5 min-h-0", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx("div", { className: "absolute left-[13px] top-2 bottom-2 w-px bg-slate-200 dark:bg-white/10" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-1", children: [
                    activityLog.map((event) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 relative", children: [
                      getActivityIcon(event),
                      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 pt-0.5", children: [
                        /* @__PURE__ */ jsx("p", { className: "text-[12px] font-medium text-slate-700 dark:text-white/80 leading-snug", children: event.text }),
                        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 dark:text-white/40 mt-0.5 font-semibold", children: format(event.timestamp, "dd MMM yyyy, HH:mm", { locale: tr }) })
                      ] })
                    ] }, event.id)),
                    activityLog.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
                      /* @__PURE__ */ jsx(Activity, { className: "w-8 h-8 text-slate-200 dark:text-white/10 mx-auto mb-3" }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 dark:text-white/30 font-medium", children: "Hen\xFCz i\u015Flem ge\xE7mi\u015Fi yok" }),
                      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-300 dark:text-white/20 mt-1", children: "G\xF6revde de\u011Fi\u015Fiklik yap\u0131ld\u0131\u011F\u0131nda burada g\xF6r\xFCnecek" })
                    ] })
                  ] })
                ] }) })
              ] })
            ] })
          ] })
        ]
      }
    ) }),
    imagePreview && /* @__PURE__ */ jsxs(
      "div",
      {
        className: "fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-200",
        onClick: () => setImagePreview(null),
        children: [
          /* @__PURE__ */ jsx("img", { src: imagePreview, alt: "Preview", className: "max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/20 animate-in zoom-in-95 duration-300" }),
          /* @__PURE__ */ jsx("button", { onClick: () => setImagePreview(null), className: "absolute top-6 right-6 p-3 rounded-2xl bg-white/10 text-white hover:bg-white/25 transition-colors backdrop-blur-md", children: /* @__PURE__ */ jsx(X, { className: "w-6 h-6" }) })
        ]
      }
    )
  ] });
}
