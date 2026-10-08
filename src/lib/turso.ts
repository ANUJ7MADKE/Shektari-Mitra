import { createClient } from '@libsql/client'

const client = createClient({
  url: 'libsql://sdt-ia3-probablyachair.aws-ap-south-1.turso.io',
  authToken:
    'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA4NDYwOTcsImlkIjoiMDFhMGY2YmUtOTEwMS03Y2RiLWI2Y2MtNDQ1YmI4ZmRlNzU2Iiwia2lkIjoiTFZoQlVnaTNkdml1V1NuQnBBclpNbFNkazJ0V285R0VRRExIb0JYX2lsbyIsInJpZCI6ImEwZDNhZDE2LWEwMjUtNDAzZS1iZmUzLTJjN2FmM2I0YTRkNyJ9.z88wKO_0uZ9JDVCJQu5dEKvFS8RccqkpqoXHgpWlU9483X5mlqC0SpqdOxxFeXwmoON6OBsV4gkgITRyib9SDA',
})

export async function ensureTable() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_name TEXT NOT NULL,
      task_completion INTEGER NOT NULL,
      navigation_interaction INTEGER NOT NULL,
      clarity_consistency INTEGER NOT NULL,
      efficiency_error INTEGER NOT NULL,
      user_satisfaction INTEGER NOT NULL,
      written_responses TEXT,
      submitted_at TEXT NOT NULL
    )
  `)
}

export interface FeedbackRow {
  participantName: string
  taskCompletion: number
  navigationInteraction: number
  clarityConsistency: number
  efficiencyError: number
  userSatisfaction: number
  writtenResponses: string
}

export async function submitFeedback(data: FeedbackRow) {
  await ensureTable()
  await client.execute({
    sql: `INSERT INTO feedback (
      participant_name, task_completion, navigation_interaction,
      clarity_consistency, efficiency_error, user_satisfaction,
      written_responses, submitted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.participantName,
      data.taskCompletion,
      data.navigationInteraction,
      data.clarityConsistency,
      data.efficiencyError,
      data.userSatisfaction,
      data.writtenResponses,
      new Date().toISOString(),
    ],
  })
}

export interface FeedbackEntry {
  id: number
  participantName: string
  ratings: [number, number, number, number, number]
  observations: string
  lowReasons: string
  submittedAt: string
}

export async function fetchFeedback(): Promise<FeedbackEntry[]> {
  await ensureTable()
  const res = await client.execute(`
    SELECT id, participant_name, task_completion, navigation_interaction,
      clarity_consistency, efficiency_error, user_satisfaction,
      written_responses, submitted_at
    FROM feedback ORDER BY id DESC
  `)
  return res.rows.map(r => {
    const [obs, low] = String(r.written_responses ?? '').split('\n\nLow-rating reasons:\n')
    return {
      id: Number(r.id),
      participantName: String(r.participant_name),
      ratings: [
        Number(r.task_completion),
        Number(r.navigation_interaction),
        Number(r.clarity_consistency),
        Number(r.efficiency_error),
        Number(r.user_satisfaction),
      ],
      observations: obs ?? '',
      lowReasons: low ?? '',
      submittedAt: String(r.submitted_at),
    }
  })
}
