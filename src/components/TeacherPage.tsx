import { useEffect, useMemo, useState } from 'react'
import { fetchFeedback, type FeedbackEntry } from '../lib/turso'

const labels = ['Task Completion', 'Navigation', 'Clarity', 'Efficiency & Errors', 'Satisfaction']

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const overall = (e: FeedbackEntry) => avg(e.ratings)
const fmtDate = (s: string) =>
  new Date(s).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function csvCell(v: string | number) {
  return `"${String(v).replace(/"/g, '""')}"`
}

export default function TeacherPage() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'newest' | 'lowest' | 'highest'>('newest')
  const [onlyLow, setOnlyLow] = useState(false)
  const [open, setOpen] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      setEntries(await fetchFeedback())
    } catch (e) {
      console.error(e)
      setError('Could not load feedback. Please check the connection and refresh.')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const criterionAvgs = labels.map((_, i) => avg(entries.map(e => e.ratings[i])))
  const lowCount = entries.filter(e => e.ratings.some(r => r < 3)).length

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = entries.filter(
      e =>
        (!onlyLow || e.ratings.some(r => r < 3)) &&
        (!q || `${e.participantName} ${e.observations} ${e.lowReasons}`.toLowerCase().includes(q)),
    )
    if (sort === 'lowest') list = [...list].sort((a, b) => overall(a) - overall(b))
    if (sort === 'highest') list = [...list].sort((a, b) => overall(b) - overall(a))
    return list
  }, [entries, query, sort, onlyLow])

  function exportCsv() {
    const head = ['Name', ...labels, 'Observations', 'Low-rating reasons', 'Submitted']
    const rows = shown.map(e =>
      [e.participantName, ...e.ratings, e.observations, e.lowReasons, e.submittedAt].map(csvCell).join(','),
    )
    const blob = new Blob([[head.map(csvCell).join(','), ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'shetkari-mitra-feedback.csv'
    a.click()
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="sticky top-0 z-10 bg-white border-b border-[var(--border)] flex items-center gap-4 px-6 py-3">
        <h1 className="font-semibold text-base text-[var(--foreground)]">Feedback Responses — Shetkari Mitra</h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={load}
            className="px-4 py-1.5 text-sm border border-[var(--border)] rounded-full text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
          >
            Refresh
          </button>
          <button
            onClick={exportCsv}
            disabled={!shown.length}
            className="px-4 py-1.5 text-sm bg-[var(--primary)] text-white font-semibold rounded-full disabled:opacity-40"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
        )}

        <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-6">
          <div className="flex flex-wrap items-end gap-x-10 gap-y-4 mb-6">
            <div>
              <p className="font-display text-5xl text-[var(--primary)] leading-none">{entries.length}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Responses</p>
            </div>
            <div>
              <p className="font-display text-5xl text-[var(--primary)] leading-none">
                {entries.length ? avg(entries.map(overall)).toFixed(1) : '–'}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Overall average / 5</p>
            </div>
            <div>
              <p className="font-display text-5xl text-[var(--accent)] leading-none">{lowCount}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">With a rating below 3</p>
            </div>
          </div>
          <div className="space-y-3">
            {labels.map((l, i) => (
              <div key={l} className="flex items-center gap-3">
                <p className="w-40 text-sm text-[var(--foreground)] shrink-0">{l}</p>
                <div className="flex-1 h-2 rounded-full bg-[var(--secondary)] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${criterionAvgs[i] < 3 ? 'bg-[var(--accent)]' : 'bg-[var(--primary)]'}`}
                    style={{ width: `${(criterionAvgs[i] / 5) * 100}%` }}
                  />
                </div>
                <p className="w-8 text-sm font-semibold text-right">{entries.length ? criterionAvgs[i].toFixed(1) : '–'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl text-[var(--foreground)] mr-auto">Responses</h2>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search name or comments"
              className="px-4 py-2 text-sm bg-white border border-[var(--border)] rounded-[var(--radius)] w-56 outline-none focus:border-[var(--primary)]"
            />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as typeof sort)}
              className="px-3 py-2 text-sm bg-white border border-[var(--border)] rounded-[var(--radius)] outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="lowest">Lowest rated</option>
              <option value="highest">Highest rated</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-[var(--foreground)] cursor-pointer">
              <input type="checkbox" checked={onlyLow} onChange={e => setOnlyLow(e.target.checked)} className="accent-[var(--primary)]" />
              Low ratings only
            </label>
          </div>

          {loading && <p className="text-sm text-[var(--muted-foreground)]">Loading responses…</p>}
          {!loading && !shown.length && !error && (
            <p className="text-sm text-[var(--muted-foreground)] bg-white border border-[var(--border)] rounded-[var(--radius)] p-6 text-center">
              No responses to show.
            </p>
          )}

          {shown.map(e => {
            const isOpen = open === e.id
            const low = e.ratings.some(r => r < 3)
            return (
              <div key={e.id} className="bg-white rounded-[var(--radius)] border border-[var(--border)]">
                <button
                  onClick={() => setOpen(isOpen ? null : e.id)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--foreground)] truncate">{e.participantName}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{fmtDate(e.submittedAt)}</p>
                  </div>
                  <div className="hidden sm:flex gap-1.5">
                    {e.ratings.map((r, i) => (
                      <span
                        key={i}
                        title={labels[i]}
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold ${
                          r < 3 ? 'bg-amber-100 text-amber-900' : 'bg-[var(--secondary)] text-[var(--primary)]'
                        }`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                  <p className={`w-10 text-right text-sm font-semibold ${low ? 'text-[var(--accent)]' : 'text-[var(--primary)]'}`}>
                    {overall(e).toFixed(1)}
                  </p>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2"
                    className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="border-t border-[var(--border)] p-5 space-y-5">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {labels.map((l, i) => (
                        <div key={l}>
                          <p className="text-xs text-[var(--muted-foreground)]">{l}</p>
                          <p className={`text-lg font-semibold ${e.ratings[i] < 3 ? 'text-[var(--accent)]' : 'text-[var(--primary)]'}`}>
                            {e.ratings[i]} / 5
                          </p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-1.5">
                        Observations & Insights
                      </p>
                      <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{e.observations || '—'}</p>
                    </div>
                    {e.lowReasons && (
                      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-900 mb-1.5">Reasons for low ratings</p>
                        <p className="text-sm text-amber-950 leading-relaxed whitespace-pre-wrap">{e.lowReasons}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
