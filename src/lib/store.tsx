import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { advancePumps, initialState, isAppState, STORAGE_KEY, type AppState } from './model'

type Update = (change: (previous: AppState) => AppState) => boolean
const Context = createContext<{ state: AppState; update: Update; notify: (message: string) => void } | null>(null)

function load(): { state: AppState; error: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { state: initialState(), error: '' }
    const saved: unknown = JSON.parse(raw)
    if (!isAppState(saved)) throw new Error('invalid data')
    // A browser demo does not keep a motor running while the app is closed.
    return { state: { ...saved, plots: saved.plots.map(p => ({ ...p, pump: { ...p.pump, on: false, startedAt: null } })) }, error: '' }
  } catch {
    return { state: initialState(), error: 'Saved data could not be read. Sample data is displayed; the original saved data has been preserved. Download it before resetting.' }
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(load)
  const [state, setState] = useState(loaded.state)
  const current = useRef(state)
  const [storageError, setStorageError] = useState(loaded.error)
  const [message, setMessage] = useState('')
  const update: Update = change => {
    const next = change(current.current)
    if (next === current.current) return true
    if (loaded.error && storageError === loaded.error) {
      setMessage('Open Local data to download or reset the unreadable data before saving changes.')
      return false
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      current.current = next; setState(next); setStorageError(''); return true
    } catch {
      setStorageError('Changes could not be saved. Browser storage is blocked or full. Free space or allow local storage, then try again.')
      return false
    }
  }
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      try {
        const value: unknown = event.newValue ? JSON.parse(event.newValue) : initialState()
        if (!isAppState(value)) throw new Error('invalid')
        current.current = value; setState(value); setStorageError('')
      } catch { setStorageError('Saved data changed in another tab but could not be read. Reload to recover it.') }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  useEffect(() => {
    const timer = window.setInterval(() => update(s => advancePumps(s)), 1000)
    return () => window.clearInterval(timer)
  })
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(''), 5000)
    return () => window.clearTimeout(timer)
  }, [message])
  return <Context.Provider value={{ state, update, notify: setMessage }}>
    {storageError && <div role="alert" className="storage-error">{storageError} <a href="/data">Local data</a></div>}
    {children}
    {message && <div role="status" className="toast">{message}<button aria-label="Dismiss notification" onClick={() => setMessage('')}>×</button></div>}
  </Context.Provider>
}
export function useApp() {
  const value = useContext(Context)
  if (!value) throw new Error('AppProvider is required')
  return value
}
