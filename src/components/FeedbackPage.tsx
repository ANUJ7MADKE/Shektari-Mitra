import { useState } from 'react'
import { submitFeedback } from '../lib/turso'

interface FeedbackPageProps {
  onBack: () => void
}

const criteria = [
  {
    key: 'taskCompletion' as const,
    label: 'Task Completion',
    description: 'Ability to complete assigned tasks successfully and independently',
  },
  {
    key: 'navigationInteraction' as const,
    label: 'Navigation & Interaction',
    description: 'Ease and intuitiveness of navigating between screens and interacting with elements',
  },
  {
    key: 'clarityConsistency' as const,
    label: 'Clarity & Consistency',
    description: 'Understandability of labels, content, layout, and consistency across screens',
  },
  {
    key: 'efficiencyError' as const,
    label: 'Efficiency & Error Handling',
    description: 'Time and effort to complete tasks, and ease of preventing or recovering from errors',
  },
  {
    key: 'userSatisfaction' as const,
    label: 'User Satisfaction',
    description: 'Overall comfort, confidence, ease of use, and personal feedback',
  },
]

type CriterionKey = typeof criteria[number]['key']

function RatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  return (
    <div className="flex items-center gap-2 mt-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-9 h-9 rounded-full text-sm font-semibold border transition-all ${
            value === n
              ? n < 3
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-[var(--primary)] text-white border-[var(--primary)]'
              : 'bg-white text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)]'
          }`}
        >
          {n}
        </button>
      ))}
      {value > 0 && (
        <span className={`text-xs ml-1 font-medium ${value < 3 ? 'text-red-500' : 'text-[var(--muted-foreground)]'}`}>
          {labels[value]}
        </span>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-6">
      <h3 className="font-semibold text-base text-[var(--foreground)] mb-4 pb-3 border-b border-[var(--border)]">
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function FeedbackPage({ onBack }: FeedbackPageProps) {
  const [participantName, setParticipantName] = useState('')
  const [ratings, setRatings] = useState<Record<CriterionKey, number>>({
    taskCompletion: 0,
    navigationInteraction: 0,
    clarityConsistency: 0,
    efficiencyError: 0,
    userSatisfaction: 0,
  })
  const [lowReasons, setLowReasons] = useState<Record<CriterionKey, string>>({
    taskCompletion: '',
    navigationInteraction: '',
    clarityConsistency: '',
    efficiencyError: '',
    userSatisfaction: '',
  })
  const [observations, setObservations] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!participantName.trim()) {
      setErrorMsg('Please enter your name.')
      return
    }
    const unrated = criteria.filter(c => ratings[c.key] === 0)
    if (unrated.length > 0) {
      setErrorMsg(`Please rate all criteria. Missing: ${unrated.map(c => c.label).join(', ')}.`)
      return
    }
    const missingReasons = criteria.filter(c => ratings[c.key] < 3 && ratings[c.key] > 0 && !lowReasons[c.key].trim())
    if (missingReasons.length > 0) {
      setErrorMsg(`Please explain your low rating for: ${missingReasons.map(c => c.label).join(', ')}.`)
      return
    }
    if (!observations.trim()) {
      setErrorMsg('Please share your observations before submitting.')
      return
    }

    setErrorMsg('')
    setStatus('submitting')

    // Append low-rating reasons to the written responses
    const reasonSummary = criteria
      .filter(c => ratings[c.key] < 3 && ratings[c.key] > 0)
      .map(c => `[${c.label} — rated ${ratings[c.key]}]: ${lowReasons[c.key]}`)
      .join('\n')
    const fullObservations = reasonSummary
      ? `${observations}\n\nLow-rating reasons:\n${reasonSummary}`
      : observations

    try {
      await submitFeedback({
        participantName: participantName.trim(),
        ...ratings,
        writtenResponses: fullObservations,
      })
      setStatus('success')
    } catch (err) {
      console.error(err)
      setErrorMsg('Submission failed. Please check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--secondary)] flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="font-display text-3xl text-[var(--foreground)] mb-3">Thank you, {participantName}.</h2>
          <p className="text-[var(--muted-foreground)] text-sm mb-6">
            Your feedback has been recorded and will help improve Shetkari Mitra's usability for farmers and officers across Sangli District.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-[var(--primary)] text-white font-semibold text-sm rounded-[var(--radius)]"
          >
            Return to App
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-[var(--border)] flex items-center gap-4 px-6 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to App
        </button>
        <div className="h-4 w-px bg-[var(--border)]" />
        <h1 className="font-semibold text-base text-[var(--foreground)]">Usability Testing Feedback — Shetkari Mitra</h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* About the app */}
        <div className="bg-white rounded-[var(--radius)] border border-[var(--border)] p-6">
          <h2 className="font-display text-2xl text-[var(--primary)] mb-3">About Shetkari Mitra</h2>
          <p className="text-sm text-[var(--foreground)] leading-relaxed">
            We designed a smart irrigation platform that fixes the brutal reality of sugarcane farming in Maharashtra. Right now, farmers are forced to wake up in the middle of the night to catch unpredictable power supply slots, which usually leads to overwatering that ruins the crop's sugar content and spikes electricity bills. Our <mark className="bg-amber-200 text-amber-950 font-bold px-1.5 py-0.5 rounded">prototype</mark> shows how we solve this with a two-part system. Farmers get a simple mobile app to automate their water pumps while they sleep, syncing directly with grid availability and soil moisture data. On the other side, agricultural extension officers get a clean desktop dashboard that flags waterlogged plots across the entire village. This setup lets farmers protect their sleep and crop yield, while officers can easily track field health and show farmers exactly how overwatering hurts their final payout at the sugar mill.
          </p>
          <div className="mt-4 flex gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
            <span className="w-1 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
            <p className="text-sm text-amber-950 leading-relaxed">
              <span className="font-bold">Note on the prototype: </span>
              This is a proof of concept, not a fully functioning service. Some parts are shown only to illustrate the idea, so certain buttons, screens and data may not be interactive or respond the way you would expect.
            </p>
          </div>
        </div>

        {/* Feedback form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="font-display text-2xl text-[var(--foreground)]">Your Feedback</h2>

          {/* Participant name */}
          <Section title="Participant Information">
            <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={participantName}
              onChange={e => setParticipantName(e.target.value)}
              placeholder="Enter your name"
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] bg-white"
            />
          </Section>

          {/* Criteria ratings */}
          <Section title="Usability Criteria Ratings (1 = Poor, 5 = Excellent)  *">
            <div className="space-y-6">
              {criteria.map(c => (
                <div key={c.key}>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{c.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{c.description}</p>
                  <RatingInput
                    value={ratings[c.key]}
                    onChange={v => setRatings(prev => ({ ...prev, [c.key]: v }))}
                  />
                  {/* Low-rating reason prompt */}
                  {ratings[c.key] > 0 && ratings[c.key] < 4 && (
                    <div className="mt-3 pl-1">
                      <label className="block text-xs font-semibold text-red-600 mb-1">
                        What made this difficult? <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={lowReasons[c.key]}
                        onChange={e => setLowReasons(prev => ({ ...prev, [c.key]: e.target.value }))}
                        rows={2}
                        placeholder={`Describe what went wrong with ${c.label.toLowerCase()}...`}
                        className="w-full border border-red-200 bg-red-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Observations */}
          <Section title="Observations & Insights  *">
            <p className="text-xs text-[var(--muted-foreground)] mb-3">
              What worked well, what was confusing, and what would you change? Include anything that surprised you during the session.
            </p>
            <textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              rows={6}
              placeholder="Share your observations from using the app — e.g. what felt intuitive, where you got stuck, what you'd improve..."
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none bg-white"
            />
          </Section>

          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{errorMsg}</p>
          )}

          <div className="flex items-center gap-4 pt-2 pb-8">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="px-8 py-3 bg-[var(--primary)] text-white font-semibold text-sm rounded-[var(--radius)] disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}