export interface Reading { at: string; moisture: number }
export interface Pump { on: boolean; autoShutoff: boolean; nightOnly: boolean; startedAt: number | null; elapsedMs: number }
export interface Plot {
  id: string; farmer: string; field: string; soil: string; irrigation: string; power: string;
  moisture: number; threshold: number; history: Reading[]; pump: Pump
}
export interface Visit { id: string; plotIds: string[]; date: string; notes: string; status: 'scheduled' | 'completed' | 'cancelled' }
export interface Advice { id: string; plotId: string; text: string; threshold: number; at: string }
export interface Message { id: string; role: 'user' | 'assistant'; text: string }
export interface FeedbackEntry {
  id: number; participantName: string; ratings: [number, number, number, number, number];
  observations: string; lowReasons: string; submittedAt: string
}
export interface AppState {
  version: 1; plots: Plot[]; activeField: string; language: 'en' | 'mr';
  gridAvailable: boolean; nightSlot: boolean; rainExpected: boolean;
  visits: Visit[]; advice: Advice[]; chats: Record<string, Message[]>
}
export const STORAGE_KEY = 'shetkari-mitra:v1'
export const uid = () => crypto.randomUUID()
export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export function initialState(): AppState {
  const seeds = [
    ['P-101', 'Ramesh Patil', 'Gat No. 42 — Sugarcane (Plot B)', 78, 'Black Soil', 'Drip', 'Night Slot'],
    ['P-102', 'Sunita More', 'Gat No. 18 — Sugarcane', 91, 'Black Soil', 'Flood', 'Night Slot'],
    ['P-103', 'Vijay Deshmukh', 'Gat No. 23 — Sugarcane', 74, 'Red Soil', 'Drip', 'Day Slot'],
    ['P-104', 'Anita Kale', 'Gat No. 31 — Sugarcane', 68, 'Black Soil', 'Drip', 'Night Slot'],
    ['P-105', 'Manoj Shinde', 'Gat No. 50 — Sugarcane', 86, 'Black Soil', 'Drip', 'Night Slot'],
    ['P-106', 'Rekha Jadhav', 'Gat No. 61 — Sugarcane', 71, 'Red Soil', 'Sprinkler', 'Day Slot'],
    ['P-107', 'Ramesh Patil', 'Gat No. 42 — Sugarcane (Plot A)', 57, 'Black Soil', 'Flood', 'Day Slot'],
  ] as const
  return {
    version: 1, activeField: 'P-101', language: 'en', gridAvailable: true, nightSlot: true, rainExpected: true,
    visits: [], advice: [], chats: {},
    plots: seeds.map(([id, farmer, field, moisture, soil, irrigation, power]) => ({
      id, farmer, field, moisture, soil, irrigation, power, threshold: 80,
      pump: { on: false, autoShutoff: true, nightOnly: true, startedAt: null, elapsedMs: 0 },
      history: Array.from({ length: 28 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - 27 + i); d.setHours(12, 0, 0, 0)
        return { at: d.toISOString(), moisture: Math.max(0, Math.min(100, moisture + (i === 27 ? 0 : [0, 2, -1, 1, -2, 0, 1][i % 7]))) }
      }),
    })),
  }
}
export const health = (p: Plot) => p.moisture > p.threshold ? 'Waterlogged' : p.moisture < 60 ? 'Dry' : 'Optimal'
export const average = (xs: number[]) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
export const grade = (moisture: number, threshold = 80) => moisture > threshold + 8 ? 'C' : moisture > threshold || moisture < 60 ? 'B' : 'A'
export function advisory(p: Plot, s: AppState, mr = false): string {
  if (p.moisture > p.threshold) return mr ? 'जमिनीत जास्त ओलावा आहे. पंप बंद ठेवा आणि शेतातील निचरा तपासा.' : `Soil moisture is ${p.moisture}%, above the ${p.threshold}% limit. Keep the pump off and check drainage.`
  if (p.moisture < 60) return mr ? 'जमिनीत ओलावा कमी आहे. वीज उपलब्ध असल्यास पाणी द्या आणि ओलावा तपासा.' : `Soil moisture is low at ${p.moisture}%. Consider irrigation when power is available and monitor moisture.`
  return mr ? (s.rainExpected ? 'सध्या पाणी देण्याची गरज नाही. पावसाची शक्यता आहे. पुढील पाण्यापूर्वी ओलावा तपासा.' : 'जमिनीत पुरेसा ओलावा आहे. पुढील पाण्यापूर्वी ओलावा पुन्हा तपासा.') : (s.rainExpected ? 'No irrigation needed now. Rain is expected in the sample forecast. Check moisture again before irrigating.' : 'Soil moisture is in the safe range. Check moisture again before the next irrigation.')
}
export function stopPump(p: Plot, now = Date.now()): Plot {
  return { ...p, pump: { ...p.pump, on: false, startedAt: null, elapsedMs: p.pump.elapsedMs + (p.pump.startedAt === null ? 0 : Math.max(0, now - p.pump.startedAt)) } }
}
export function applyReading(p: Plot, moisture: number, now = Date.now()): Plot {
  let next = { ...p, moisture, history: [...p.history, { at: new Date(now).toISOString(), moisture }].slice(-1000) }
  if (next.pump.on && next.pump.autoShutoff && moisture >= next.threshold) next = stopPump(next, now)
  return next
}
export function pumpBlock(p: Plot, s: AppState): string {
  if (!s.gridAvailable) return 'Grid power is unavailable. Enable sample grid power before starting.'
  if (p.pump.nightOnly && !s.nightSlot) return 'Night-only mode is enabled. Select the sample night slot or disable this setting.'
  if (p.pump.autoShutoff && p.moisture >= p.threshold) return `Moisture has reached the ${p.threshold}% shutoff limit. Lower the sample moisture or change the automation settings.`
  return ''
}
export function advancePumps(s: AppState, now = Date.now()): AppState {
  let changed = false
  const plots = s.plots.map(p => {
    if (!p.pump.on) return p
    if (pumpBlock(p, s)) { changed = true; return stopPump(p, now) }
    const last = Math.max(p.pump.startedAt ?? now, Date.parse(p.history[p.history.length - 1].at))
    const steps = Math.floor((now - last) / 10000)
    if (steps < 1) return p
    changed = true
    const moisture = Math.min(p.pump.autoShutoff ? p.threshold : 100, p.moisture + steps)
    return applyReading(p, moisture, now)
  })
  return changed ? { ...s, plots } : s
}
export function months() {
  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i)
    return { value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) }
  })
}
export const periodReadings = (p: Plot, period: string) => p.history.filter(r => r.at.slice(0, 7) === period)

// Validate persisted data before it reaches rendering or automation.
export function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false
  const s = value as AppState
  const str = (v: unknown) => typeof v === 'string'
  const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v)
  const date = (v: unknown) => str(v) && Number.isFinite(Date.parse(v as string))
  if (s.version !== 1 || !Array.isArray(s.plots) || !s.plots.length || !str(s.activeField) || !['en', 'mr'].includes(s.language)) return false
  if (![s.gridAvailable, s.nightSlot, s.rainExpected].every(v => typeof v === 'boolean')) return false
  if (!s.plots.every(p => p && [p.id, p.farmer, p.field, p.soil, p.irrigation, p.power].every(str) && num(p.moisture) && p.moisture >= 0 && p.moisture <= 100 && num(p.threshold) && p.threshold >= 60 && p.threshold <= 90 && Array.isArray(p.history) && p.history.length > 0 && p.history.every(r => r && date(r.at) && num(r.moisture) && r.moisture >= 0 && r.moisture <= 100) && p.pump && [p.pump.on, p.pump.autoShutoff, p.pump.nightOnly].every(v => typeof v === 'boolean') && num(p.pump.elapsedMs) && p.pump.elapsedMs >= 0 && (p.pump.on ? num(p.pump.startedAt) : p.pump.startedAt === null))) return false
  const ids = new Set(s.plots.map(p => p.id))
  if (ids.size !== s.plots.length || !s.plots.some(p => p.id === s.activeField && p.farmer === 'Ramesh Patil')) return false
  if (!Array.isArray(s.visits) || !s.visits.every(v => v && str(v.id) && Array.isArray(v.plotIds) && v.plotIds.length > 0 && v.plotIds.every(id => ids.has(id)) && /^\d{4}-\d{2}-\d{2}$/.test(v.date) && date(v.date) && str(v.notes) && ['scheduled', 'completed', 'cancelled'].includes(v.status))) return false
  if (!Array.isArray(s.advice) || !s.advice.every(a => a && str(a.id) && ids.has(a.plotId) && str(a.text) && date(a.at) && num(a.threshold))) return false
  if (!s.chats || typeof s.chats !== 'object' || Array.isArray(s.chats) || !Object.entries(s.chats).every(([key, msgs]) => ids.has(key) && Array.isArray(msgs) && msgs.every(m => m && str(m.id) && ['user', 'assistant'].includes(m.role) && str(m.text)))) return false
  return true
}
