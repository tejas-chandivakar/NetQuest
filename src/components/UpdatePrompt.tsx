import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdatePrompt() {
  const [offlineReady, setOfflineReady] = useState(false)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onOfflineReady() {
      setOfflineReady(true)
    },
  })

  useEffect(() => {
    if (offlineReady) {
      const t = setTimeout(() => setOfflineReady(false), 3500)
      return () => clearTimeout(t)
    }
  }, [offlineReady])

  if (!needRefresh && !offlineReady) return null

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[9999] -translate-x-1/2 rounded-2xl border border-violet-200 bg-white px-4 py-3 shadow-lg shadow-violet-900/10"
      role="status"
      aria-live="polite"
    >
      {needRefresh ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-700">New version ready</span>
          <button
            onClick={() => updateServiceWorker(true)}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Reload
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Later
          </button>
        </div>
      ) : (
        <div className="text-sm text-slate-700">App ready to work offline</div>
      )}
    </div>
  )
}
