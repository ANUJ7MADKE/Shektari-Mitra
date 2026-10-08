import { useState } from "react"
import { useApp } from "../lib/store"
import {
  initialState,
  isAppState,
  STORAGE_KEY,
  stopPump,
  type AppState,
} from "../lib/model"
import { download } from "../lib/export"

export default function DataPage() {
  const { state, update, notify } = useApp()
  const [confirmReset, setConfirmReset] = useState(false),
    [pending, setPending] = useState<AppState | null>(null),
    [error, setError] = useState("")
  async function read(file: File | undefined) {
    setError("")
    setPending(null)
    if (!file) return
    try {
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Choose a backup smaller than 5 MB.")
      const parsed: unknown = JSON.parse(await file.text())
      if (!isAppState(parsed))
        throw new Error(
          "This file is not a valid Shetkari Mitra activity backup.",
        )
      setPending({
        ...parsed,
        plots: parsed.plots.map((p) =>
          p.pump.on ? stopPump(p, p.pump.startedAt ?? Date.now()) : p,
        ),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Backup could not be read.")
    }
  }
  function backup() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      download(
        "shetkari-mitra-backup.json",
        saved ?? JSON.stringify(state, null, 2),
        "application/json",
      )
      notify("Local activity backup downloaded.")
    } catch {
      setError("Browser storage could not be read.")
    }
  }
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <a href="/" className="text-sm text-[var(--primary)] underline">
        Home
      </a>
      <h1 className="font-display text-3xl text-[var(--primary)]">
        Local data
      </h1>
      <p className="text-sm text-[var(--muted-foreground)]">
        Field readings, pump settings, visits, officer advice and assistant
        conversations are saved on this device and browser. They are not shared
        with other devices. Feedback stays in the shared Turso database.
      </p>
      <div className="bg-white border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold">Back up your activity</h2>
        <p className="text-sm">
          {state.plots.length} plots · {state.visits.length} visits ·{" "}
          {state.advice.length} officer notes
        </p>
        <button className="primary-button" onClick={backup}>
          Download backup JSON
        </button>
        <label className="block text-sm">
          Restore an activity backup
          <input
            type="file"
            accept=".json,application/json"
            className="form-input w-full mt-2"
            onChange={(e) => {
              void read(e.target.files?.[0])
              e.target.value = ""
            }}
          />
        </label>
        {pending && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-lg text-sm space-y-3">
            <p>
              Replace this browser’s activity with {pending.plots.length} plots,{" "}
              {pending.visits.length} visits and {pending.advice.length} notes
              from the backup?
            </p>
            <div className="flex gap-3">
              <button
                className="primary-button"
                onClick={() => {
                  if (update(() => pending, true)) {
                    setPending(null)
                    notify(
                      "Activity backup restored. Sample pumps are stopped.",
                    )
                  }
                }}
              >
                Restore backup
              </button>
              <button className="form-input" onClick={() => setPending(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold">Reset sample activity</h2>
        <p className="text-sm">
          Start again with the sample plots. This replaces locally saved
          activity. Turso feedback is unaffected.
        </p>
        {!confirmReset ? (
          <button
            className="form-input text-red-700"
            onClick={() => setConfirmReset(true)}
          >
            Reset local activity
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">
              Download a backup first if you want to keep your activity.
            </p>
            <div className="flex gap-3">
              <button
                className="primary-button"
                onClick={() => {
                  if (update(() => initialState(), true)) {
                    setConfirmReset(false)
                    notify(
                      "Sample activity reset. Turso feedback was preserved.",
                    )
                  }
                }}
              >
                Confirm reset
              </button>
              <button
                className="form-input"
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </main>
  )
}
