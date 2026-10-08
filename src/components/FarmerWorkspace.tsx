import { useEffect, useRef, useState, type ReactNode } from "react"
import { useApp } from "../lib/store"
import {
  advisory,
  applyReading,
  average,
  grade,
  health,
  months,
  periodReadings,
  pumpBlock,
  stopPump,
  uid,
  type Plot,
} from "../lib/model"
import { exportReport } from "../lib/export"
import { recognitionConstructor, speak, type Recognition } from "../lib/speech"

export type FarmerScreen = "home" | "pump" | "voice" | "reports"
const mrLabels: Record<string, string> = {
  Home: "मुख्यपृष्ठ",
  "Pump Control": "पंप नियंत्रण",
  Voice: "संवाद",
  Reports: "अहवाल",
  "Active Field": "निवडलेले शेत",
  "Soil Moisture": "जमिनीतील ओलावा",
  Optimal: "पुरेसा ओलावा",
  Waterlogged: "जास्त ओलावा",
  Dry: "कमी ओलावा",
  "Current Advisory": "सध्याचा सल्ला",
  "Listen Audio": "सल्ला ऐका",
  "Pump Motor Status": "पंपाची स्थिती",
  Manage: "नियंत्रण",
  "Weather — Sample Forecast": "हवामान — नमुना अंदाज",
  Rain: "पाऊस",
  Cloudy: "ढगाळ",
  Humidity: "आर्द्रता",
  "Sample controls": "नमुना नियंत्रण",
  "Sample moisture": "नमुना ओलावा",
  "Rain expected": "पावसाची शक्यता",
  "Power & Pump Sync": "वीज आणि पंप नियंत्रण",
  "Grid Status": "विजेची स्थिती",
  "Grid power available": "वीज उपलब्ध",
  "Sample night slot": "नमुना रात्रीची वेळ",
  Automation: "स्वयंचलित नियंत्रण",
  "Auto-shutoff at": "या ओलाव्यावर पंप बंद:",
  "Run only during night power slots": "फक्त रात्री वीज असताना चालवा",
  "Manual Override": "पंप नियंत्रण",
  "Recorded Pump Usage": "नोंदवलेला पंप वापर",
  "Run Time": "चाललेला वेळ",
  "Estimated Energy": "अंदाजे वीज वापर",
  "Voice Assistant": "शेतकरी संवाद",
  "Play Audio": "ऐका",
  "Tap & Speak": "दाबा आणि बोला",
  Listening: "ऐकत आहे",
  "Type a question": "प्रश्न लिहा",
  Send: "पाठवा",
  "Monthly Usage & Reports": "मासिक वापर आणि अहवाल",
  "Report period": "अहवाल कालावधी",
  "Average Moisture": "सरासरी ओलावा",
  "Sample Recovery Grade": "नमुना गुणवत्ता श्रेणी",
  "Soil Moisture Trend": "ओलाव्याचा कल",
  "Download Mill Summary PDF": "गिरणीचा नमुना अहवाल डाउनलोड करा",
  "Officer Notes": "अधिकाऱ्यांचे सल्ले",
  "No notes yet.": "अद्याप सल्ला नाही.",
  Notifications: "सूचना",
  "No scheduled visits.": "भेट नियोजित नाही.",
  "Switch role": "भूमिका बदला",
  "Give Feedback": "अभिप्राय द्या",
  "Local data": "स्थानिक माहिती",
  "No readings for this period.": "या कालावधीतील नोंदी उपलब्ध नाहीत.",
}
function useFarmer() {
  const app = useApp(),
    plot = app.state.plots.find((p) => p.id === app.state.activeField)!,
    mr = app.state.language === "mr"
  const t = (text: string) => (mr ? (mrLabels[text] ?? text) : text)
  const edit = (change: (p: Plot) => Plot) =>
    app.update((s) => ({
      ...s,
      plots: s.plots.map((p) => (p.id === plot.id ? change(p) : p)),
    }))
  return { ...app, plot, mr, t, edit }
}
function Card({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`bg-white rounded-[var(--radius)] border border-[var(--border)] p-4 ${className}`}
    >
      {children}
    </div>
  )
}
function Header({
  title,
  onNav,
}: {
  title: string
  onNav: (s: FarmerScreen) => void
}) {
  const { t } = useFarmer()
  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-white shrink-0">
      <button
        onClick={() => onNav("home")}
        aria-label={t("Home")}
        className="back-button"
      >
        ‹
      </button>
      <h2 className="font-semibold text-base">{t(title)}</h2>
    </header>
  )
}
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm">
      <span>{label}</span>
      <span className="toggle-switch shrink-0">
        <input
          aria-label={label}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-slider" />
      </span>
    </label>
  )
}
function Home({ onNav }: { onNav: (s: FarmerScreen) => void }) {
  const { state, update, plot, mr, t, edit, notify } = useFarmer()
  const [notifications, setNotifications] = useState(false)
  const notes = state.advice
      .filter((a) => a.plotId === plot.id)
      .slice()
      .reverse(),
    visits = state.visits.filter(
      (v) => v.plotIds.includes(plot.id) && v.status === "scheduled",
    ),
    condition = health(plot)
  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-white">
        <h1 className="font-display text-xl text-[var(--primary)]">
          Shetkari Mitra
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--secondary)] rounded-full p-0.5 text-xs font-medium">
            {(["en", "mr"] as const).map((lang) => (
              <button
                key={lang}
                aria-label={lang === "en" ? "English" : "मराठी"}
                aria-pressed={state.language === lang}
                onClick={() => update((s) => ({ ...s, language: lang }))}
                className={`px-2 py-1 rounded-full ${
                  state.language === lang
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {lang === "en" ? "EN" : "मर"}
              </button>
            ))}
          </div>
          <button
            aria-label={t("Notifications")}
            aria-expanded={notifications}
            onClick={() => setNotifications((n) => !n)}
            className="w-8 h-8 rounded-full bg-[var(--secondary)] text-[var(--primary)]"
          >
            <svg
              className="mx-auto"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
          </button>
        </div>
      </header>
      <div className="flex-1 p-4 space-y-3">
        <Card>
          <label
            htmlFor="field"
            className="text-xs text-[var(--muted-foreground)] block mb-1"
          >
            {t("Active Field")}
          </label>
          <select
            id="field"
            className="w-full font-semibold text-sm bg-white"
            value={plot.id}
            onChange={(e) =>
              update((s) => ({ ...s, activeField: e.target.value }))
            }
          >
            {state.plots
              .filter((p) => p.farmer === "Ramesh Patil")
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.field}
                </option>
              ))}
          </select>
        </Card>
        {notifications && (
          <Card>
            <h3 className="font-semibold mb-2">{t("Notifications")}</h3>
            <p className="text-sm mb-3">{advisory(plot, state, mr)}</p>
            {visits.map((v) => (
              <p key={v.id} className="text-sm mb-2">
                {mr ? "शेतभेट:" : "Field visit:"} {v.date} — {v.notes}
              </p>
            ))}
            {!visits.length && (
              <p className="text-xs text-[var(--muted-foreground)]">
                {t("No scheduled visits.")}
              </p>
            )}
            {notes.slice(0, 3).map((a) => (
              <p
                key={a.id}
                className="text-sm border-t border-[var(--border)] mt-2 pt-2"
              >
                Priya Sharma: {a.text}
              </p>
            ))}
          </Card>
        )}
        <Card>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium">{t("Soil Moisture")}</p>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                condition === "Optimal"
                  ? "bg-[var(--secondary)] text-[var(--primary)]"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              {t(condition)}
            </span>
          </div>
          <p className="font-display text-4xl text-[var(--primary)] mb-2">
            {plot.moisture}%
          </p>
          <div
            role="meter"
            aria-label={t("Soil Moisture")}
            aria-valuenow={plot.moisture}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-3 bg-[var(--muted)] rounded-full overflow-hidden"
          >
            <div
              className={`h-full rounded-full ${
                condition === "Optimal"
                  ? "bg-[var(--primary)]"
                  : "bg-[var(--accent)]"
              }`}
              style={{ width: `${plot.moisture}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
            <span>0%</span>
            <span>
              {mr ? "सुरक्षित मर्यादा" : "Safe range"}: 60–{plot.threshold}%
            </span>
            <span>100%</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            {mr ? "नमुना नोंद" : "Sample reading"}:{" "}
            {new Date(plot.history[plot.history.length - 1].at).toLocaleString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
          </p>
        </Card>
        <div className="bg-[var(--primary)] rounded-[var(--radius)] p-4">
          <p className="text-white font-semibold text-sm mb-1">
            {t("Current Advisory")}
          </p>
          <p className="text-green-100 text-sm mb-3">
            {advisory(plot, state, mr)}
          </p>
          <button
            onClick={() =>
              speak(advisory(plot, state, mr), state.language, notify)
            }
            className="w-full py-2.5 bg-white text-[var(--primary)] font-semibold text-sm rounded-lg"
          >
            {t("Listen Audio")}
          </button>
        </div>
        <Card>
          <p className="text-xs text-[var(--muted-foreground)] mb-2">
            {t("Pump Motor Status")}
          </p>
          <div className="flex justify-between">
            <p className="font-semibold text-sm flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  plot.pump.on ? "bg-green-500" : "bg-[var(--border)]"
                }`}
              />
              {plot.pump.on
                ? mr
                  ? "चालू"
                  : "ON — Running"
                : mr
                  ? "बंद"
                  : "OFF — Standby"}
            </p>
            <button
              onClick={() => onNav("pump")}
              className="text-xs text-[var(--primary)] underline"
            >
              {t("Manage")}
            </button>
          </div>
        </Card>
        <Card>
          <p className="text-xs text-[var(--muted-foreground)] mb-2">
            {t("Weather — Sample Forecast")}
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              {
                label: state.rainExpected ? "Rain" : "Cloudy",
                value: state.rainExpected ? "12 mm" : "0 mm",
              },
              { label: "Cloudy", value: "28°C" },
              { label: "Humidity", value: "82%" },
            ].map((w, i) => (
              <div key={i} className="bg-[var(--muted)] rounded-lg p-2">
                <p className="text-xs text-[var(--muted-foreground)]">
                  {t(w.label)}
                </p>
                <p className="font-semibold text-sm">{w.value}</p>
              </div>
            ))}
          </div>
        </Card>
        {notes.length > 0 && (
          <Card>
            <p className="text-xs font-semibold text-[var(--primary)] mb-2">
              {t("Officer Notes")}
            </p>
            <p className="text-sm">{notes[0].text}</p>
          </Card>
        )}
        <details className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-4">
          <summary className="text-sm font-semibold cursor-pointer">
            {t("Sample controls")}
          </summary>
          <div className="space-y-4 mt-4">
            <label className="block text-sm">
              {t("Sample moisture")}: {plot.moisture}%
              <input
                aria-label={t("Sample moisture")}
                type="range"
                className="w-full mt-2 accent-[var(--primary)]"
                min="0"
                max="100"
                value={plot.moisture}
                onChange={(e) =>
                  edit((p) => applyReading(p, Number(e.target.value)))
                }
              />
            </label>
            <Toggle
              label={t("Rain expected")}
              checked={state.rainExpected}
              onChange={(v) => update((s) => ({ ...s, rainExpected: v }))}
            />
          </div>
        </details>
      </div>
    </div>
  )
}
function Pump({ onNav }: { onNav: (s: FarmerScreen) => void }) {
  const { plot, state, update, edit, notify, mr, t } = useFarmer()
  const [now, setNow] = useState(Date.now()),
    [error, setError] = useState("")
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  const runtime =
    plot.pump.elapsedMs +
    (plot.pump.startedAt ? Math.max(0, now - plot.pump.startedAt) : 0)
  function togglePump() {
    setError("")
    if (plot.pump.on) {
      if (edit((p) => stopPump(p)))
        notify(mr ? "पंप बंद केला." : "Sample pump stopped.")
      return
    }
    const reason = pumpBlock(plot, state)
    if (reason) {
      setError(reason)
      return
    }
    if (
      edit((p) => ({
        ...p,
        pump: { ...p.pump, on: true, startedAt: Date.now() },
      }))
    )
      notify(
        mr
          ? "नमुना पंप सुरू झाला."
          : "Sample pump started. Moisture rises 1% every 10 seconds while this app is open.",
      )
  }
  function setting(key: "autoShutoff" | "nightOnly", value: boolean) {
    edit((p) => {
      const next = { ...p, pump: { ...p.pump, [key]: value } }
      return next.pump.on && pumpBlock(next, state) ? stopPump(next) : next
    })
    setError("")
  }
  function grid(key: "gridAvailable" | "nightSlot", value: boolean) {
    update((s) => {
      const next = { ...s, [key]: value }
      return {
        ...next,
        plots: next.plots.map((p) =>
          p.pump.on && pumpBlock(p, next) ? stopPump(p) : p,
        ),
      }
    })
    setError("")
  }
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Header title="Power & Pump Sync" onNav={onNav} />
      <div className="p-4 space-y-3">
        <Card>
          <p className="text-xs text-[var(--muted-foreground)] mb-2">
            {t("Grid Status")}
          </p>
          <p className="font-semibold text-sm mb-3">
            {state.gridAvailable
              ? mr
                ? "नमुना वीज उपलब्ध"
                : "Sample MSEDCL 3-Phase Active"
              : mr
                ? "नमुना वीज बंद"
                : "Sample grid unavailable"}
          </p>
          <div className="space-y-3">
            <Toggle
              label={t("Grid power available")}
              checked={state.gridAvailable}
              onChange={(v) => grid("gridAvailable", v)}
            />
            <Toggle
              label={t("Sample night slot")}
              checked={state.nightSlot}
              onChange={(v) => grid("nightSlot", v)}
            />
          </div>
        </Card>
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            {t("Automation")}
          </p>
          <Toggle
            label={`${t("Auto-shutoff at")} ${plot.threshold}%`}
            checked={plot.pump.autoShutoff}
            onChange={(v) => setting("autoShutoff", v)}
          />
          <div className="h-px bg-[var(--border)]" />
          <Toggle
            label={t("Run only during night power slots")}
            checked={plot.pump.nightOnly}
            onChange={(v) => setting("nightOnly", v)}
          />
        </Card>
        <Card className="flex flex-col items-center gap-3 py-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            {t("Manual Override")}
          </p>
          <button
            aria-label={plot.pump.on ? "Stop sample pump" : "Start sample pump"}
            aria-pressed={plot.pump.on}
            onClick={togglePump}
            className={`w-32 h-32 rounded-full font-bold text-lg border-4 transition-all shadow-md ${
              plot.pump.on
                ? "bg-[var(--primary)] text-white border-green-700"
                : "bg-white border-[var(--border)]"
            }`}
          >
            {mr
              ? `पंप ${plot.pump.on ? "चालू" : "बंद"}`
              : `PUMP ${plot.pump.on ? "ON" : "OFF"}`}
          </button>
          <p className="text-xs text-[var(--muted-foreground)]">
            {mr
              ? `ओलावा: ${plot.moisture}%`
              : `Current moisture: ${plot.moisture}%`}
          </p>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <p className="text-xs text-center text-[var(--muted-foreground)]">
            {mr
              ? "हा नमुना पंप आहे. अ‍ॅप चालू असताना दर १० सेकंदांनी ओलावा १% वाढतो. पान रीलोड केल्यास पंप बंद होतो."
              : "Simulation: moisture rises 1% every 10 seconds. Reloading stops the sample pump."}
          </p>
        </Card>
        <div className="bg-[var(--secondary)] rounded-[var(--radius)] p-4">
          <p className="text-xs font-semibold text-[var(--primary)] mb-2">
            {t("Recorded Pump Usage")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Run Time",
                value: `${Math.floor(runtime / 60000)}m ${Math.floor(runtime / 1000) % 60}s`,
              },
              {
                label: "Estimated Energy",
                value: `${((runtime / 3600000) * 2.4).toFixed(3)} kWh`,
              },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-lg p-3">
                <p className="text-xs text-[var(--muted-foreground)]">
                  {t(item.label)}
                </p>
                <p className="font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            {mr
              ? "या ब्राउझरमध्ये नोंदवलेला वापर. २.४ kW नमुना मोटर."
              : "Recorded in this browser since setup. Assumes a 2.4 kW sample motor."}
          </p>
        </div>
      </div>
    </div>
  )
}
function Voice({ onNav }: { onNav: (s: FarmerScreen) => void }) {
  const { state, plot, update, notify, mr, t } = useFarmer()
  const [input, setInput] = useState(""),
    [listening, setListening] = useState(false),
    [error, setError] = useState("")
  const recognition = useRef<Recognition | null>(null),
    chatEnd = useRef<HTMLDivElement>(null),
    messages = state.chats[plot.id] ?? []
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: "nearest" })
  }, [messages.length])
  useEffect(
    () => () => {
      if (recognition.current) {
        recognition.current.onend = null
        recognition.current.onerror = null
        recognition.current.onresult = null
        recognition.current.abort()
      }
      window.speechSynthesis?.cancel()
    },
    [],
  )
  function send(text: string) {
    if (!text.trim()) return
    const q = text.toLowerCase()
    let answer = advisory(plot, state, mr)
    if (/pump|motor|पंप|मोटर/.test(q))
      answer = mr
        ? `पंप ${
            plot.pump.on ? "चालू" : "बंद"
          } आहे. स्वयंचलित बंद मर्यादा ${plot.threshold}% आहे.`
        : `The sample pump is ${plot.pump.on ? "ON" : "OFF"}. Auto-shutoff is ${
            plot.pump.autoShutoff
              ? `enabled at ${plot.threshold}% moisture`
              : "disabled"
          }. ${
            state.gridAvailable
              ? "Sample grid power is available."
              : "Sample grid power is unavailable."
          }`
    else if (/rain|weather|पाऊस|हवामान/.test(q))
      answer = mr
        ? state.rainExpected
          ? "नमुना अंदाजात १२ mm पावसाची शक्यता आहे."
          : "नमुना अंदाजात पाऊस नाही."
        : state.rainExpected
          ? "The sample forecast shows 12 mm of rain, 28°C and 82% humidity."
          : "The sample forecast shows no rain, 28°C and 82% humidity."
    else if (!/water|irrigat|moisture|soil|पाणी|ओलावा|उसाला|सिंचन/.test(q))
      answer = mr
        ? "ओलावा, पाणी, पंप किंवा हवामानाबद्दल प्रश्न विचारा. हा स्थानिक नमुना सहाय्यक आहे."
        : "Ask about soil moisture, irrigation, pump status, or weather. This local assistant answers from your sample field data."
    const additions = [
      { id: uid(), role: "user" as const, text: text.trim() },
      { id: uid(), role: "assistant" as const, text: answer },
    ]
    if (
      update((s) => ({
        ...s,
        chats: {
          ...s.chats,
          [plot.id]: [...(s.chats[plot.id] ?? []), ...additions].slice(-100),
        },
      }))
    ) {
      setInput("")
      setError("")
    }
  }
  function microphone() {
    if (listening) {
      recognition.current?.stop()
      return
    }
    const Constructor = recognitionConstructor()
    if (!Constructor) {
      setError(
        mr
          ? "या ब्राउझरमध्ये आवाजाची सुविधा नाही. प्रश्न लिहा."
          : "Speech recognition is unavailable in this browser. Type your question below.",
      )
      return
    }
    const r = new Constructor()
    recognition.current = r
    r.lang = mr ? "mr-IN" : "en-IN"
    r.continuous = false
    r.interimResults = false
    r.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript
      if (transcript) send(transcript)
    }
    r.onerror = (e) => {
      setListening(false)
      setError(
        e.error === "not-allowed"
          ? "Microphone permission was denied. Allow it in browser settings or type your question."
          : "Speech could not be recognized. Try again or type your question.",
      )
    }
    r.onend = () => setListening(false)
    try {
      r.start()
      setListening(true)
      setError("")
    } catch {
      setError("Microphone could not start. Type your question instead.")
    }
  }
  return (
    <div className="flex flex-col h-full min-h-0">
      <Header title="Voice Assistant" onNav={onNav} />
      <div className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite">
        <p className="text-xs text-[var(--muted-foreground)]">
          {mr
            ? "स्थानिक नमुना सहाय्यक. आवाज ओळखण्यासाठी ब्राउझरची सेवा आणि इंटरनेट लागू शकते."
            : "Local sample assistant. Browser speech recognition may use an online service."}
        </p>
        {!messages.length && (
          <div className="bg-white border border-[var(--border)] rounded-2xl p-3">
            <p className="text-sm mb-2">{advisory(plot, state, mr)}</p>
            <button
              className="text-xs text-[var(--primary)] font-medium"
              onClick={() =>
                speak(advisory(plot, state, mr), state.language, notify)
              }
            >
              ▶ {t("Play Audio")}
            </button>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] text-sm rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-[var(--primary)] text-white rounded-tr-sm"
                  : "bg-white border border-[var(--border)] rounded-tl-sm"
              }`}
            >
              <p>{m.text}</p>
              {m.role === "assistant" && (
                <button
                  className="text-xs text-[var(--primary)] font-medium mt-2"
                  onClick={() =>
                    speak(
                      m.text,
                      /[\u0900-\u097F]/.test(m.text) ? "mr" : "en",
                      notify,
                    )
                  }
                >
                  ▶ {t("Play Audio")}
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEnd} />
      </div>
      <div className="p-4 border-t border-[var(--border)] bg-white space-y-3 shrink-0">
        <div className="flex flex-wrap gap-2">
          {[
            mr ? "ओलावा किती आहे?" : "Soil moisture?",
            mr ? "पंपाची स्थिती?" : "Pump status?",
            mr ? "हवामान?" : "Weather?",
          ].map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="text-xs bg-[var(--secondary)] rounded-full px-3 py-2 text-[var(--primary)]"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
        >
          <input
            aria-label={t("Type a question")}
            placeholder={t("Type a question")}
            className="form-input min-w-0 flex-1"
            value={input}
            maxLength={500}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="primary-button" disabled={!input.trim()}>
            {t("Send")}
          </button>
        </form>
        <div className="flex flex-col items-center gap-2">
          <button
            aria-label={listening ? "Stop listening" : t("Tap & Speak")}
            aria-pressed={listening}
            onClick={microphone}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
              listening ? "bg-red-500" : "bg-[var(--primary)]"
            }`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <rect x="9" y="2" width="6" height="13" rx="3" />
              <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v4M8 23h8" />
            </svg>
          </button>
          <p className="text-xs text-[var(--muted-foreground)]">
            {t(listening ? "Listening" : "Tap & Speak")}
          </p>
        </div>
        {error && (
          <p role="alert" className="text-xs text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
function Reports({ onNav }: { onNav: (s: FarmerScreen) => void }) {
  const { plot, state, mr, t, notify } = useFarmer(),
    periods = months()
  const [period, setPeriod] = useState(periods[0].value)
  const readings = periodReadings(plot, period),
    mean = average(readings.map((r) => r.moisture))
  const weeks = [0, 1, 2, 3, 4]
    .map((i) => {
      const values = readings
        .filter((r) => Math.floor((new Date(r.at).getDate() - 1) / 7) === i)
        .map((r) => r.moisture)
      return {
        label: `${mr ? "आठवडा" : "Week"} ${i + 1}`,
        val: values.length ? average(values) : null,
      }
    })
    .filter((w) => w.val !== null)
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Header title="Monthly Usage & Reports" onNav={onNav} />
      <div className="p-4 space-y-4">
        <label className="block text-sm">
          {t("Report period")}
          <select
            className="form-input w-full mt-1"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">
              {t("Average Moisture")}
            </p>
            <p className="font-display text-2xl text-[var(--primary)]">
              {readings.length ? `${mean.toFixed(1)}%` : "—"}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">
              {t("Sample Recovery Grade")}
            </p>
            <p className="font-display text-2xl text-[var(--primary)]">
              {readings.length ? grade(mean, plot.threshold) : "—"}
            </p>
          </Card>
        </div>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-4">
            {t("Soil Moisture Trend")}
          </p>
          {!readings.length ? (
            <p className="text-sm">{t("No readings for this period.")}</p>
          ) : (
            <div className="flex items-end gap-3 h-32">
              {weeks.map((w) => (
                <div
                  key={w.label}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs font-semibold">
                    {w.val!.toFixed(0)}%
                  </span>
                  <div className="w-full flex items-end h-20">
                    <div
                      className="w-full bg-[var(--primary)] rounded-t-sm"
                      style={{ height: `${w.val}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {w.label}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[var(--muted-foreground)] mt-3">
            {mr ? "सुरक्षित मर्यादा" : "Safe range"}: 60–{plot.threshold}%
          </p>
        </Card>
        <div className="bg-[var(--secondary)] rounded-[var(--radius)] p-4 text-sm">
          <p className="font-semibold text-[var(--primary)] mb-1">
            {mr ? "नमुना अहवाल" : "About this report"}
          </p>
          <p>
            {mr
              ? "हे नमुना नोंदींवर आधारित श्रेणी आहेत. अधिकृत गिरणी प्रमाणपत्र नाही."
              : "Grades use a simple moisture rule on sample readings. Mill verification requires real field measurements."}
          </p>
        </div>
        <button
          disabled={!readings.length}
          className="primary-button w-full py-3.5"
          onClick={async () => {
            try {
              await exportReport([plot], period, state)
              notify(mr ? "PDF तयार केला." : "Sample PDF downloaded.")
            } catch {
              notify("PDF could not be generated. Please try again.")
            }
          }}
        >
          {t("Download Mill Summary PDF")}
        </button>
        <Card>
          <p className="text-xs font-semibold text-[var(--primary)] mb-2">
            {t("Officer Notes")}
          </p>
          {state.advice
            .filter((a) => a.plotId === plot.id)
            .slice()
            .reverse()
            .map((a) => (
              <p key={a.id} className="text-sm mb-3">
                {new Date(a.at).toLocaleDateString("en-IN")}: {a.text}
              </p>
            ))}
          {!state.advice.some((a) => a.plotId === plot.id) && (
            <p className="text-sm">{t("No notes yet.")}</p>
          )}
        </Card>
      </div>
    </div>
  )
}
export default function FarmerWorkspace({
  onSwitchRole,
  onFeedback,
  screen,
  onScreen,
}: {
  onSwitchRole: () => void
  onFeedback: () => void
  screen: FarmerScreen
  onScreen: (s: FarmerScreen) => void
}) {
  const { mr, t } = useFarmer(),
    tabs: { id: FarmerScreen; label: string }[] = [
      { id: "home", label: "Home" },
      { id: "pump", label: "Pump Control" },
      { id: "voice", label: "Voice" },
      { id: "reports", label: "Reports" },
    ]
  return (
    <div
      lang={mr ? "mr" : "en"}
      className="farmer-shell min-h-screen bg-[var(--muted)] flex flex-col items-center justify-center py-6 px-4"
    >
      <div className="w-full max-w-sm flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
        <p className="text-[var(--muted-foreground)]">
          {mr ? "शेतकरी: रमेश पाटील" : "Farmer: Ramesh Patil"}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onFeedback}
            className="text-[var(--accent)] underline"
          >
            {t("Give Feedback")}
          </button>
          <button
            onClick={onSwitchRole}
            className="text-[var(--primary)] underline"
          >
            {t("Switch role")}
          </button>
        </div>
      </div>
      <div className="farmer-frame w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[var(--border)]">
        <div className="px-4 py-2 text-xs bg-[var(--secondary)] text-[var(--primary)] text-center shrink-0">
          {mr
            ? "नमुना अ‍ॅप • माहिती या ब्राउझरमध्ये जतन होते"
            : "Interactive demo • Saved in this browser"}
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {screen === "home" ? (
            <Home onNav={onScreen} />
          ) : screen === "pump" ? (
            <Pump onNav={onScreen} />
          ) : screen === "voice" ? (
            <Voice onNav={onScreen} />
          ) : (
            <Reports onNav={onScreen} />
          )}
        </div>
        <nav
          aria-label={mr ? "मुख्य नेव्हिगेशन" : "Farmer navigation"}
          className="flex border-t border-[var(--border)] bg-white shrink-0"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onScreen(tab.id)}
              aria-current={screen === tab.id ? "page" : undefined}
              className={`flex-1 py-3 text-xs font-medium ${
                screen === tab.id
                  ? "text-[var(--primary)] border-t-2 border-[var(--primary)] -mt-px"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              {t(tab.label)}
            </button>
          ))}
        </nav>
      </div>
      <a
        href="/data"
        className="text-xs text-[var(--muted-foreground)] mt-3 underline"
      >
        {t("Local data")}
      </a>
    </div>
  )
}
