import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Mode = 'beginner' | 'exam'
export type Lang = 'gu' | 'en'
export type TrackId = 'beginner' | 'ccna' | 'ccnp'

interface AppState {
  mode: Mode
  lang: Lang
  /** lessonId -> completed */
  completed: Record<string, boolean>
  setMode: (m: Mode) => void
  toggleMode: () => void
  setLang: (l: Lang) => void
  toggleLang: () => void
  complete: (lessonId: string) => void
  uncomplete: (lessonId: string) => void
  isDone: (lessonId: string) => boolean
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      mode: 'beginner',
      lang: 'gu',
      completed: {},
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((s) => ({ mode: s.mode === 'beginner' ? 'exam' : 'beginner' })),
      setLang: (lang) => set({ lang }),
      toggleLang: () => set((s) => ({ lang: s.lang === 'gu' ? 'en' : 'gu' })),
      complete: (id) => set((s) => ({ completed: { ...s.completed, [id]: true } })),
      uncomplete: (id) =>
        set((s) => {
          const next = { ...s.completed }
          delete next[id]
          return { completed: next }
        }),
      isDone: (id) => !!get().completed[id],
    }),
    { name: 'netquest-v1' },
  ),
)

/** Keeps <html data-mode="..."> in sync so CSS variables can react. */
export function applyModeToDocument(mode: Mode) {
  document.documentElement.setAttribute('data-mode', mode)
}
