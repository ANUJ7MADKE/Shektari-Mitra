import { useState } from 'react'

type FarmerScreen = 'home' | 'pump' | 'voice' | 'reports'

interface FarmerAppProps {
  onSwitchRole: () => void
  onFeedback: () => void
}

function BottomNav({ active, onChange }: { active: FarmerScreen; onChange: (s: FarmerScreen) => void }) {
  const tabs: { id: FarmerScreen; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'pump', label: 'Pump Control' },
    { id: 'voice', label: 'Voice' },
    { id: 'reports', label: 'Reports' },
  ]
  return (
    <nav className="flex border-t border-[var(--border)] bg-white">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-3 text-xs font-medium transition-colors ${
            active === tab.id
              ? 'text-[var(--primary)] border-t-2 border-[var(--primary)] -mt-px'
              : 'text-[var(--muted-foreground)]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

function HomeScreen({ onNav }: { onNav: (s: FarmerScreen) => void }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-white">
        <h1 className="font-display text-xl text-[var(--primary)]">Shetkari Mitra</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[var(--secondary)] rounded-full p-0.5 text-xs font-medium">
            <span className="px-2 py-1 rounded-full bg-[var(--primary)] text-white">EN</span>
            <span className="px-2 py-1 text-[var(--muted-foreground)]">मर</span>
          </div>
          <button className="w-8 h-8 rounded-full bg-[var(--secondary)] flex items-center justify-center text-[var(--primary)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-3">
        {/* Field Selector */}
        <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-3">
          <p className="text-xs text-[var(--muted-foreground)] mb-1">Active Field</p>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Gat No. 42 — Sugarcane (Plot B)</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        {/* Soil Moisture Card */}
        <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-[var(--foreground)]">Soil Moisture</p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--primary)]">
              Optimal / पुरेसा ओलावा
            </span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="font-display text-4xl text-[var(--primary)]">78%</span>
          </div>
          <div className="h-3 bg-[var(--muted)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: '78%' }} />
          </div>
          <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
            <span>0%</span>
            <span>Safe zone: 60–85%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Advisory Box */}
        <div className="bg-[var(--primary)] rounded-[var(--radius)] p-4">
          <p className="text-white font-semibold text-sm mb-1">Tonight's Advisory</p>
          <p className="text-green-100 text-sm mb-3">No irrigation needed tonight. Rain expected in your area.</p>
          <button
            onClick={() => onNav('voice')}
            className="w-full py-2.5 bg-white text-[var(--primary)] font-semibold text-sm rounded-lg"
          >
            Listen Audio / ऐका
          </button>
        </div>

        {/* Quick Status */}
        <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
          <p className="text-xs text-[var(--muted-foreground)] mb-2">Pump Motor Status</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
              <span className="font-semibold text-sm">OFF — Standby</span>
            </div>
            <button
              onClick={() => onNav('pump')}
              className="text-xs text-[var(--primary)] font-medium underline underline-offset-2"
            >
              Manage
            </button>
          </div>
        </div>

        {/* Weather Snapshot */}
        <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
          <p className="text-xs text-[var(--muted-foreground)] mb-2">Weather — Next 24 Hours</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Tonight', val: 'Rain', note: '12mm' },
              { label: 'Tomorrow', val: 'Cloudy', note: '28°C' },
              { label: 'Humidity', val: '82%', note: 'High' },
            ].map(w => (
              <div key={w.label} className="bg-[var(--muted)] rounded-lg p-2">
                <p className="text-xs text-[var(--muted-foreground)]">{w.label}</p>
                <p className="font-semibold text-sm">{w.val}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{w.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PumpScreen({ onNav }: { onNav: (s: FarmerScreen) => void }) {
  const [autoShutoff, setAutoShutoff] = useState(true)
  const [nightOnly, setNightOnly] = useState(true)
  const [pumpOn, setPumpOn] = useState(false)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-white">
        <button onClick={() => onNav('home')} className="text-[var(--muted-foreground)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2 className="font-semibold text-base">Power &amp; Pump Sync</h2>
      </header>

      <div className="flex-1 p-4 space-y-3">
        {/* Grid Status */}
        <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
          <p className="text-xs text-[var(--muted-foreground)] mb-2">Grid Status</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">MSEDCL 3-Phase Active</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Available until 06:00 AM</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 block" />
          </div>
        </div>

        {/* Automation Toggles */}
        <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Automation</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-shutoff at 80% moisture</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Pump stops when soil is fully saturated</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={autoShutoff} onChange={e => setAutoShutoff(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Run only during night power slots</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Saves electricity during peak billing hours</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={nightOnly} onChange={e => setNightOnly(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Manual Override */}
        <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-6 flex flex-col items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Manual Override</p>
          <button
            onClick={() => setPumpOn(p => !p)}
            className={`w-32 h-32 rounded-full font-bold text-lg border-4 transition-all shadow-md ${
              pumpOn
                ? 'bg-[var(--primary)] text-white border-green-700'
                : 'bg-white text-[var(--foreground)] border-[var(--border)]'
            }`}
          >
            PUMP {pumpOn ? 'ON' : 'OFF'}
          </button>
          <p className="text-xs text-[var(--muted-foreground)]">
            {pumpOn ? 'Pump is running manually' : 'Tap to start pump manually'}
          </p>
        </div>

        {/* Current Draw */}
        <div className="bg-[var(--secondary)] rounded-[var(--radius)] p-4">
          <p className="text-xs font-semibold text-[var(--primary)] mb-2">Today's Pump Summary</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Run Time', val: '3.5 hrs' },
              { label: 'Units Used', val: '8.4 kWh' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg p-3">
                <p className="text-xs text-[var(--muted-foreground)]">{s.label}</p>
                <p className="font-semibold text-base">{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function VoiceScreen({ onNav }: { onNav: (s: FarmerScreen) => void }) {
  const [listening, setListening] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-white">
        <button onClick={() => onNav('home')} className="text-[var(--muted-foreground)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div>
          <h2 className="font-semibold text-base">Voice Assistant</h2>
          <p className="text-xs text-[var(--muted-foreground)]">शेतकरी संवाद</p>
        </div>
      </header>

      {/* Chat stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* User bubble */}
        <div className="flex justify-end">
          <div className="max-w-[75%] bg-[var(--primary)] text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5">
            उसाला पुढचे पाणी कधी देऊ?
          </div>
        </div>

        {/* System response */}
        <div className="flex justify-start">
          <div className="max-w-[80%] bg-white border border-[var(--border)] rounded-2xl rounded-tl-sm p-3">
            <p className="text-sm text-[var(--foreground)] mb-2">
              Soil moisture is currently 78%. Pumping tonight wastes electricity. Rain is expected — wait 48 hours before next irrigation.
            </p>
            <button className="flex items-center gap-1.5 text-xs text-[var(--primary)] font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Play Audio
            </button>
          </div>
        </div>

        {/* User bubble 2 */}
        <div className="flex justify-end">
          <div className="max-w-[75%] bg-[var(--primary)] text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5">
            What is the current pump status?
          </div>
        </div>

        {/* System response 2 */}
        <div className="flex justify-start">
          <div className="max-w-[80%] bg-white border border-[var(--border)] rounded-2xl rounded-tl-sm p-3">
            <p className="text-sm text-[var(--foreground)] mb-2">
              Pump motor is OFF and in standby mode. 3-phase power from MSEDCL is available until 6:00 AM. Auto-shutoff is enabled at 80% moisture.
            </p>
            <button className="flex items-center gap-1.5 text-xs text-[var(--primary)] font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Play Audio
            </button>
          </div>
        </div>
      </div>

      {/* Mic area */}
      <div className="p-4 border-t border-[var(--border)] bg-white flex flex-col items-center gap-2">
        <button
          onClick={() => setListening(l => !l)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
            listening ? 'bg-red-500 scale-110' : 'bg-[var(--primary)]'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        <p className="text-xs text-[var(--muted-foreground)]">
          {listening ? 'Listening...' : 'Tap & Speak / दाबा आणि बोला'}
        </p>
      </div>
    </div>
  )
}

function ReportsScreen({ onNav }: { onNav: (s: FarmerScreen) => void }) {
  const weeks = [
    { label: 'Week 1', val: 74 },
    { label: 'Week 2', val: 78 },
    { label: 'Week 3', val: 76 },
    { label: 'Week 4', val: 78 },
  ]
  const maxVal = 100

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-white">
        <button onClick={() => onNav('home')} className="text-[var(--muted-foreground)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2 className="font-semibold text-base">Monthly Usage &amp; Savings</h2>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {/* Metrics row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
            <p className="text-xs text-[var(--muted-foreground)] mb-1">Electricity Saved</p>
            <p className="font-display text-2xl text-[var(--primary)]">Rs. 1,420</p>
            <p className="text-xs font-semibold text-green-600 mt-1">-28% vs last month</p>
          </div>
          <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
            <p className="text-xs text-[var(--muted-foreground)] mb-1">Pump Run Time</p>
            <p className="font-display text-2xl text-[var(--primary)]">-18 Hrs</p>
            <p className="text-xs font-semibold text-green-600 mt-1">vs previous month</p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-4">
            4-Week Soil Moisture Trend
          </p>
          <div className="flex items-end gap-3 h-32">
            {weeks.map(w => (
              <div key={w.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-[var(--foreground)]">{w.val}%</span>
                <div className="w-full relative flex items-end" style={{ height: 80 }}>
                  {/* Safe zone line */}
                  <div
                    className="absolute inset-x-0 border-t border-dashed border-[var(--accent)]"
                    style={{ bottom: `${(70 / maxVal) * 80}px` }}
                  />
                  <div
                    className="w-full bg-[var(--primary)] rounded-t-sm transition-all"
                    style={{ height: `${(w.val / maxVal) * 80}px` }}
                  />
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">{w.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <div className="w-4 border-t border-dashed border-[var(--accent)]" />
            <span className="text-xs text-[var(--muted-foreground)]">Safe floor: 70%</span>
          </div>
        </div>

        {/* Summary note */}
        <div className="bg-[var(--secondary)] rounded-[var(--radius)] p-4">
          <p className="text-xs font-semibold text-[var(--primary)] mb-1">Mill Compliance</p>
          <p className="text-sm text-[var(--foreground)]">
            Moisture stayed above 70% all month. Your plot qualifies for Grade A recovery rating at the sugar mill.
          </p>
        </div>

        {/* CTA */}
        <button className="w-full py-3.5 bg-[var(--primary)] text-white font-semibold text-sm rounded-[var(--radius)]">
          Download Mill Verification PDF
        </button>
      </div>
    </div>
  )
}

export default function FarmerApp({ onSwitchRole, onFeedback }: FarmerAppProps) {
  const [screen, setScreen] = useState<FarmerScreen>('home')

  const screenMap: Record<FarmerScreen, JSX.Element> = {
    home: <HomeScreen onNav={setScreen} />,
    pump: <PumpScreen onNav={setScreen} />,
    voice: <VoiceScreen onNav={setScreen} />,
    reports: <ReportsScreen onNav={setScreen} />,
  }

  return (
    <div className="min-h-screen bg-[var(--muted)] flex flex-col items-center justify-center py-6 px-4">
      {/* Role switcher strip */}
      <div className="w-full max-w-sm flex items-center justify-between mb-3">
        <p className="text-xs text-[var(--muted-foreground)]">Viewing as: Farmer (Ramesh Patil)</p>
        <div className="flex items-center gap-3">
          <button
            onClick={onFeedback}
            className="text-xs font-medium text-[var(--accent)] underline underline-offset-2"
          >
            Give Feedback
          </button>
          <span className="text-[var(--border)] text-xs">|</span>
          <button
            onClick={onSwitchRole}
            className="text-xs font-medium text-[var(--primary)] underline underline-offset-2"
          >
            Switch role
          </button>
        </div>
      </div>

      {/* Mobile frame */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[var(--border)]" style={{ height: '780px' }}>
        {/* Status bar mockup */}
        <div className="flex justify-between items-center px-5 py-2 text-xs font-medium bg-white">
          <span>9:41</span>
          <span className="text-[var(--muted-foreground)] tracking-widest">●●●</span>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {screenMap[screen]}
        </div>

        <BottomNav active={screen} onChange={setScreen} />
      </div>
    </div>
  )
}
