import { useState, type JSX } from 'react'

type OfficerScreen = 'overview' | 'filter' | 'diagnostic' | 'millreport'

interface OfficerAppProps {
  onSwitchRole: () => void
  onFeedback: () => void
}

const plots = [
  { id: 'P-101', farmer: 'Ramesh Patil', moisture: 82, grade: 'B', flag: 'WATERLOGGED' },
  { id: 'P-102', farmer: 'Sunita More', moisture: 91, grade: 'C', flag: 'WATERLOGGED' },
  { id: 'P-103', farmer: 'Vijay Deshmukh', moisture: 74, grade: 'A', flag: null },
  { id: 'P-104', farmer: 'Anita Kale', moisture: 68, grade: 'A', flag: null },
  { id: 'P-105', farmer: 'Manoj Shinde', moisture: 86, grade: 'B', flag: 'WATERLOGGED' },
  { id: 'P-106', farmer: 'Rekha Jadhav', moisture: 71, grade: 'A', flag: null },
]

function Sidebar({ active, onChange }: { active: OfficerScreen; onChange: (s: OfficerScreen) => void }) {
  const links: { id: OfficerScreen; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'filter', label: 'Filter Plots' },
    { id: 'diagnostic', label: 'Farm Diagnostics' },
    { id: 'millreport', label: 'Mill Reports' },
  ]
  return (
    <nav className="w-52 shrink-0 bg-white border-r border-[var(--border)] flex flex-col py-6">
      <div className="px-5 mb-8">
        <p className="font-display text-lg text-[var(--primary)] leading-tight">Shetkari Mitra</p>
        <p className="text-xs text-[var(--muted-foreground)]">Officer Console</p>
      </div>
      <div className="flex-1 space-y-1 px-3">
        {links.map(link => (
          <button
            key={link.id}
            onClick={() => onChange(link.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active === link.id
                ? 'bg-[var(--secondary)] text-[var(--primary)]'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>
      <div className="px-5 pt-4 border-t border-[var(--border)]">
        <p className="text-xs font-semibold text-[var(--foreground)]">Priya Sharma</p>
        <p className="text-xs text-[var(--muted-foreground)]">Village A, Sangli District</p>
      </div>
    </nav>
  )
}

function OverviewScreen({ onNav }: { onNav: (s: OfficerScreen) => void }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Top bar */}
      <div>
        <h1 className="font-display text-2xl text-[var(--foreground)]">Cluster Overview &amp; Alerts</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Village A — Sangli District — September 2026</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Plots Monitored', val: '142', sub: 'All active', color: 'text-[var(--foreground)]' },
          { label: 'Over-Irrigated', val: '5', sub: 'Action needed', color: 'text-red-600' },
          { label: 'Optimal Plots', val: '137', sub: 'In safe range', color: 'text-[var(--primary)]' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
            <p className="text-xs text-[var(--muted-foreground)] mb-1">{kpi.label}</p>
            <p className={`font-display text-3xl ${kpi.color}`}>{kpi.val}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Plot cards grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Plot Summary</h2>
          <button
            onClick={() => onNav('filter')}
            className="text-xs text-[var(--primary)] font-medium underline underline-offset-2"
          >
            Filter Plots
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {plots.map(plot => (
            <div key={plot.id} className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">{plot.farmer}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{plot.id}</p>
                </div>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                  plot.grade === 'A'
                    ? 'bg-green-100 text-green-700'
                    : plot.grade === 'B'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-600'
                }`}>
                  Grade {plot.grade}
                </span>
              </div>

              <div className="mb-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--muted-foreground)]">Moisture</span>
                  <span className={`font-semibold ${plot.moisture > 85 ? 'text-red-600' : 'text-[var(--foreground)]'}`}>
                    {plot.moisture}%
                  </span>
                </div>
                <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${plot.moisture > 85 ? 'bg-red-500' : 'bg-[var(--primary)]'}`}
                    style={{ width: `${plot.moisture}%` }}
                  />
                </div>
              </div>

              {plot.flag && (
                <p className="text-xs font-semibold text-red-600 mt-2">[FLAG: {plot.flag}]</p>
              )}

              <button
                onClick={() => onNav('diagnostic')}
                className="mt-3 text-xs text-[var(--primary)] font-medium underline underline-offset-2"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FilterScreen({ onNav }: { onNav: (s: OfficerScreen) => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const flaggedPlots = plots.filter(p => p.flag)

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[var(--foreground)]">Plot Filter &amp; Health Tracking</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Identify and act on at-risk plots</p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-3">Filters</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Moisture Level', val: '> 80%' },
            { label: 'Soil Type', val: 'Black Soil' },
            { label: 'Irrigation Method', val: 'Drip' },
            { label: 'Power Group', val: 'Night Slot' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">{f.label}</label>
              <div className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-between bg-[var(--muted)] cursor-pointer">
                {f.val}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Split view */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left: flagged plot list */}
        <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-3">
            Flagged Plots ({flaggedPlots.length})
          </p>
          <div className="space-y-2">
            {flaggedPlots.map(p => (
              <label key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--muted)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(p.id)}
                  onChange={e => setSelected(prev =>
                    e.target.checked ? [...prev, p.id] : prev.filter(x => x !== p.id)
                  )}
                  className="accent-[var(--primary)] w-4 h-4"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.farmer}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{p.id} — {p.moisture}% moisture</p>
                </div>
                <span className="text-xs font-semibold text-red-600">[FLAG]</span>
              </label>
            ))}
          </div>
        </div>

        {/* Right: Map placeholder */}
        <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4 flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-3">
            GIS Parcel Map — Village A
          </p>
          <div className="flex-1 bg-[var(--muted)] rounded-lg flex items-center justify-center relative overflow-hidden" style={{ minHeight: 220 }}>
            {/* Simple SVG map placeholder */}
            <svg width="100%" height="100%" viewBox="0 0 300 200" className="absolute inset-0">
              {/* Background grid */}
              {[0,60,120,180,240,300].map(x => (
                <line key={x} x1={x} y1={0} x2={x} y2={200} stroke="var(--border)" strokeWidth="0.5" />
              ))}
              {[0,50,100,150,200].map(y => (
                <line key={y} x1={0} y1={y} x2={300} y2={y} stroke="var(--border)" strokeWidth="0.5" />
              ))}
              {/* Plot parcels */}
              <rect x="20" y="20" width="70" height="50" fill="#2D6A4F" fillOpacity="0.2" stroke="#2D6A4F" strokeWidth="1.5" rx="2"/>
              <text x="55" y="48" textAnchor="middle" fontSize="9" fill="#2D6A4F" fontWeight="600">P-103</text>

              <rect x="100" y="20" width="70" height="50" fill="#ef4444" fillOpacity="0.25" stroke="#ef4444" strokeWidth="1.5" rx="2"/>
              <text x="135" y="48" textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="600">P-101 ⚑</text>

              <rect x="180" y="20" width="70" height="50" fill="#ef4444" fillOpacity="0.25" stroke="#ef4444" strokeWidth="1.5" rx="2"/>
              <text x="215" y="48" textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="600">P-102 ⚑</text>

              <rect x="20" y="90" width="70" height="50" fill="#2D6A4F" fillOpacity="0.2" stroke="#2D6A4F" strokeWidth="1.5" rx="2"/>
              <text x="55" y="118" textAnchor="middle" fontSize="9" fill="#2D6A4F" fontWeight="600">P-104</text>

              <rect x="100" y="90" width="70" height="50" fill="#ef4444" fillOpacity="0.25" stroke="#ef4444" strokeWidth="1.5" rx="2"/>
              <text x="135" y="118" textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="600">P-105 ⚑</text>

              <rect x="180" y="90" width="70" height="50" fill="#2D6A4F" fillOpacity="0.2" stroke="#2D6A4F" strokeWidth="1.5" rx="2"/>
              <text x="215" y="118" textAnchor="middle" fontSize="9" fill="#2D6A4F" fontWeight="600">P-106</text>
            </svg>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[var(--primary)] opacity-40 border border-[var(--primary)]" />
              <span className="text-[var(--muted-foreground)]">Optimal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-red-400 opacity-40 border border-red-500" />
              <span className="text-[var(--muted-foreground)]">Over-irrigated</span>
            </div>
          </div>
        </div>
      </div>

      <button className="px-5 py-2.5 bg-[var(--primary)] text-white font-semibold text-sm rounded-[var(--radius)]">
        Schedule Field Visits ({selected.length} selected)
      </button>
    </div>
  )
}

function DiagnosticScreen({ onNav }: { onNav: (s: OfficerScreen) => void }) {
  const moistureData = [82, 83, 85, 87, 84, 86, 88, 85, 84, 82, 83, 81, 82, 82]
  const sucroseData = [0, -0.1, -0.3, -0.6, -0.8, -1.0, -1.2, -1.3, -1.5, -1.6, -1.7, -1.7, -1.8, -1.8]

  const chartH = 120
  const maxM = 100; const minM = 60
  const getY = (val: number, min: number, max: number) =>
    chartH - ((val - min) / (max - min)) * chartH

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => onNav('overview')} className="text-sm text-[var(--primary)] underline underline-offset-2">
          Overview
        </button>
        <span className="text-[var(--muted-foreground)]">/</span>
        <h1 className="font-display text-2xl text-[var(--foreground)]">Field Diagnostic: Ramesh Patil (Plot B)</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Moisture line chart */}
        <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-4">
            14-Day Soil Moisture
          </p>
          <svg width="100%" height={chartH + 24} viewBox={`0 0 ${(moistureData.length - 1) * 22} ${chartH + 24}`}>
            {/* Safe threshold line at 80% */}
            <line
              x1={0} y1={getY(80, minM, maxM)}
              x2={(moistureData.length - 1) * 22} y2={getY(80, minM, maxM)}
              stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 3"
            />
            <text x={2} y={getY(80, minM, maxM) - 3} fontSize="7" fill="var(--accent)">80% safe limit</text>
            {/* Line */}
            <polyline
              points={moistureData.map((v, i) => `${i * 22},${getY(v, minM, maxM)}`).join(' ')}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {moistureData.map((v, i) => (
              <circle key={i} cx={i * 22} cy={getY(v, minM, maxM)} r="3" fill={v > 85 ? '#ef4444' : 'var(--primary)'} />
            ))}
            {/* X axis labels */}
            {[0, 6, 13].map(i => (
              <text key={i} x={i * 22} y={chartH + 16} fontSize="7" fill="var(--muted-foreground)" textAnchor="middle">
                Day {i + 1}
              </text>
            ))}
          </svg>
        </div>

        {/* Sucrose correlation chart */}
        <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-4">
            Predicted Sucrose Recovery Impact
          </p>
          <svg width="100%" height={chartH + 24} viewBox={`0 0 ${(sucroseData.length - 1) * 22} ${chartH + 24}`}>
            <line x1={0} y1={0} x2={0} y2={chartH} stroke="var(--border)" strokeWidth="1" />
            <line x1={0} y1={chartH / 2} x2={(sucroseData.length - 1) * 22} y2={chartH / 2}
              stroke="var(--border)" strokeWidth="1" strokeDasharray="3 2" />
            <polyline
              points={sucroseData.map((v, i) => `${i * 22},${getY(v, -2, 0)}`).join(' ')}
              fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round"
            />
            {sucroseData.map((v, i) => (
              <circle key={i} cx={i * 22} cy={getY(v, -2, 0)} r="2.5" fill="#ef4444" />
            ))}
            <text x={(sucroseData.length - 1) * 22 - 2} y={getY(-1.8, -2, 0) - 4} fontSize="7" fill="#ef4444" textAnchor="end">
              -1.8% recovery
            </text>
            {[0, 6, 13].map(i => (
              <text key={i} x={i * 22} y={chartH + 16} fontSize="7" fill="var(--muted-foreground)" textAnchor="middle">
                Day {i + 1}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Advisory footer */}
      <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">Advisory</p>
        <p className="text-sm text-[var(--foreground)] mb-4">
          Plot P-101 has remained above the 80% moisture threshold for 11 consecutive days, correlating with a predicted sucrose recovery drop of 1.8%. Immediate reduction in irrigation is advised to recover cane quality before harvest.
        </p>
        <button className="px-5 py-2.5 bg-[var(--primary)] text-white font-semibold text-sm rounded-[var(--radius)]">
          Log Advice &amp; Reset Threshold
        </button>
      </div>
    </div>
  )
}

function MillReportScreen() {
  const complianceData = [
    { week: 'Week 1', pct: 88 },
    { week: 'Week 2', pct: 91 },
    { week: 'Week 3', pct: 87 },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[var(--foreground)]">Village A — Monthly Mill Summary Report</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Sangli District — September 2026</p>
      </div>

      {/* Compliance table */}
      <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              {['Plot ID', 'Farmer Name', 'Avg Soil Moisture', 'Recovery Grade'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plots.map((p, i) => (
              <tr key={p.id} className={`border-b border-[var(--border)] ${i % 2 === 0 ? '' : 'bg-[var(--muted)]'}`}>
                <td className="px-4 py-3 font-mono text-xs text-[var(--muted-foreground)]">{p.id}</td>
                <td className="px-4 py-3 font-medium">{p.farmer}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${p.moisture > 85 ? 'text-red-600' : ''}`}>{p.moisture}%</span>
                    <div className="w-20 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${p.moisture > 85 ? 'bg-red-500' : 'bg-[var(--primary)]'}`}
                        style={{ width: `${p.moisture}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    p.grade === 'A' ? 'bg-green-100 text-green-700' :
                    p.grade === 'B' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-600'
                  }`}>
                    Grade {p.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar chart — village compliance */}
      <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-4">
          Village Irrigation Compliance — Last 3 Weeks
        </p>
        <div className="flex items-end gap-6 h-28">
          {complianceData.map(d => (
            <div key={d.week} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-[var(--foreground)]">{d.pct}%</span>
              <div className="w-full flex items-end" style={{ height: 80 }}>
                <div
                  className="w-full bg-[var(--primary)] rounded-t-sm"
                  style={{ height: `${(d.pct / 100) * 80}px` }}
                />
              </div>
              <span className="text-xs text-[var(--muted-foreground)]">{d.week}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Export section */}
      <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-1">Export Report</p>
          <p className="text-sm text-[var(--foreground)]">Generate the official mill compliance PDF for the reporting period.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm flex items-center gap-2 bg-[var(--muted)] cursor-pointer">
            September 2026
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <button className="px-5 py-2.5 bg-[var(--primary)] text-white font-semibold text-sm rounded-[var(--radius)] whitespace-nowrap">
            Export Verification PDF for Sugar Mill
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OfficerApp({ onSwitchRole, onFeedback }: OfficerAppProps) {
  const [screen, setScreen] = useState<OfficerScreen>('overview')

  const screenMap: Record<OfficerScreen, JSX.Element> = {
    overview: <OverviewScreen onNav={setScreen} />,
    filter: <FilterScreen onNav={setScreen} />,
    diagnostic: <DiagnosticScreen onNav={setScreen} />,
    millreport: <MillReportScreen />,
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Role switcher bar */}
      <div className="flex items-center justify-between px-6 py-2 bg-[var(--muted)] border-b border-[var(--border)] text-xs">
        <span className="text-[var(--muted-foreground)]">Viewing as: Agricultural Officer (Priya Sharma)</span>
        <div className="flex items-center gap-3">
          <button
            onClick={onFeedback}
            className="text-[var(--accent)] font-medium underline underline-offset-2"
          >
            Give Feedback
          </button>
          <span className="text-[var(--border)]">|</span>
          <button
            onClick={onSwitchRole}
            className="text-[var(--primary)] font-medium underline underline-offset-2"
          >
            Switch role
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 32px)' }}>
        <Sidebar active={screen} onChange={setScreen} />
        {screenMap[screen]}
      </div>
    </div>
  )
}
