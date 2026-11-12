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
      // English for now; the Gujarati half of every string is still written and
      // waiting, so turning other languages back on is this one value again.
      lang: 'en',
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
    // v2 because the stored language changed meaning: anyone carrying a saved
    // 'gu' from the bilingual build should land on English like everyone else.
    { name: 'netquest-v1', version: 2, migrate: (s) => ({ ...(s as object), lang: 'en' }) as never },
  ),
)

/** Keeps <html data-mode="..."> in sync so CSS variables can react. */
export function applyModeToDocument(mode: Mode) {
  document.documentElement.setAttribute('data-mode', mode)
}
