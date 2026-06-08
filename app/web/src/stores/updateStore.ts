import { create } from "zustand";

export interface VersionInfo {
  version: string;
  version_code: number;
  download_url: string;
  changelog: string;
  force_update: boolean;
  min_supported_version: string;
}

export type UpdateState = "idle" | "checking" | "available" | "downloading" | "installing" | "dismissed" | "error";

interface UpdateStore {
  state: UpdateState;
  versionInfo: VersionInfo | null;
  progress: number;
  errorMsg: string;
  currentVersion: string;
  triggerCheck: boolean; // Dışarıdan tetikleme için flag
  
  setState: (state: UpdateState) => void;
  setVersionInfo: (info: VersionInfo | null) => void;
  setProgress: (progress: number) => void;
  setErrorMsg: (msg: string) => void;
  setCurrentVersion: (v: string) => void;
  checkUpdate: () => void; // Dışarıdan tetikleme fonksiyonu
}

export const useUpdateStore = create<UpdateStore>((set) => ({
  state: "idle",
  versionInfo: null,
  progress: 0,
  errorMsg: "",
  currentVersion: "",
  triggerCheck: false,

  setState: (state) => set({ state }),
  setVersionInfo: (versionInfo) => set({ versionInfo }),
  setProgress: (progress) => set({ progress }),
  setErrorMsg: (errorMsg) => set({ errorMsg }),
  setCurrentVersion: (currentVersion) => set({ currentVersion }),
  checkUpdate: () => set((state) => ({ triggerCheck: !state.triggerCheck }))
}));
