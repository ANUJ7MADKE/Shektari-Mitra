import { useEffect, useState } from 'react'
import FarmerApp, { type FarmerScreen } from './components/FarmerWorkspace'
import OfficerApp from './components/OfficerApp'
import FeedbackPage from './components/FeedbackPage'
import TeacherPage from './components/TeacherPage'
import { AppProvider } from './lib/store'

function RoleSelector({ onSelect, onFeedback }: { onSelect: (r: 'farmer' | 'officer') => void; onFeedback: () => void }) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="text-center mb-10">
        <h1 className="font-display text-5xl text-[var(--primary)] mb-2">Shetkari Mitra</h1>
        <p className="text-[var(--muted-foreground)] text-base">Smart Irrigation Advisory for Sugarcane Farmers</p>
        <p className="text-[var(--muted-foreground)] text-sm">शेतकरी मित्र — Sangli District, Maharashtra</p>
      </div>

      {/* Role cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-xl">
        <button
          onClick={() => onSelect('farmer')}
          className="flex-1 bg-white border-2 border-[var(--border)] hover:border-[var(--primary)] rounded-2xl p-6 text-left transition-all group"
        >
          <div className="w-10 h-10 bg-[var(--secondary)] rounded-xl flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <p className="font-semibold text-base text-[var(--foreground)] mb-1 group-hover:text-[var(--primary)] transition-colors">
            Farmer
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            View field status, control your pump, and get irrigation advisories.
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-3">Ramesh Patil — Gat No. 42, Plot B</p>
          <div className="mt-4 text-xs font-semibold text-[var(--primary)] flex items-center gap-1">
            Open Farmer App
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </button>

        <button
          onClick={() => onSelect('officer')}
          className="flex-1 bg-white border-2 border-[var(--border)] hover:border-[var(--primary)] rounded-2xl p-6 text-left transition-all group"
        >
          <div className="w-10 h-10 bg-[var(--secondary)] rounded-xl flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <p className="font-semibold text-base text-[var(--foreground)] mb-1 group-hover:text-[var(--primary)] transition-colors">
            Agricultural Officer
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Monitor cluster health, review flagged plots, and generate mill reports.
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-3">Priya Sharma — Village A, Sangli District</p>
          <div className="mt-4 text-xs font-semibold text-[var(--primary)] flex items-center gap-1">
            Open Officer Dashboard
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </button>
      </div>

      {/* Feedback button */}
      <div className="mt-8">
        <button
          onClick={onFeedback}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[var(--border)] rounded-full text-sm font-medium text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all shadow-sm"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Give Feedback
        </button>
      </div>

      <div className="mt-8 max-w-md text-center">
        <div className="flex justify-center gap-5 mb-4 text-xs text-[var(--primary)] underline"><a href="/teacher">Feedback Responses</a><a href="/data">Local data</a></div>
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          Shetkari Mitra connects soil sensors, grid power data, and weather forecasts to help farmers irrigate efficiently and enable officers to monitor compliance for sugar mill quality standards.
        </p>
      </div>
    </div>
  )
}

function AppContent() {
  const [path, setPath] = useState(window.location.pathname)
  const go = (url: string) => { window.history.pushState({}, '', url); setPath(url); window.scrollTo(0, 0) }
  useEffect(() => { const pop = () => setPath(window.location.pathname); window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop) }, [])
  const parts = path.replace(/\/+$/, '').split('/')
  const screen = parts[2] as FarmerScreen
  if (parts[1] === 'teacher') return <TeacherPage />
  if (parts[1] === 'farmer') return <FarmerApp screen={['home', 'pump', 'voice', 'reports'].includes(screen) ? screen : 'home'} onScreen={s => go(`/farmer/${s}`)} onSwitchRole={() => go('/')} onFeedback={() => go('/feedback')} />
  if (parts[1] === 'officer') return <OfficerApp onSwitchRole={() => go('/')} onFeedback={() => go('/feedback')} />
  if (parts[1] === 'feedback') return <FeedbackPage onBack={() => { window.history.back(); setPath(window.location.pathname) }} />
  return <RoleSelector onSelect={v => go(`/${v}`)} onFeedback={() => go('/feedback')} />
}

export default function App() { return <AppProvider><AppContent /></AppProvider> }
