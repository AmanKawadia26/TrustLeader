import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionPrefsState = {
  lastSearchQuery: string;
  setLastSearchQuery: (q: string) => void;
};

export const useSessionPrefsStore = create<SessionPrefsState>()(
  persist(
    (set) => ({
      lastSearchQuery: "",
      setLastSearchQuery: (q) => set({ lastSearchQuery: q }),
    }),
    { name: "mp-session-prefs" },
  ),
);
