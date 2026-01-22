const KEY = 'quiz-results'

type Result = {
  id: string
  correct: boolean
}

export function saveResult(id: string, correct: boolean) {
  const raw = localStorage.getItem(KEY)
  const data: Result[] = raw ? JSON.parse(raw) : []

  data.push({ id, correct })

  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getWrongIds(): string[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []

  const data: Result[] = JSON.parse(raw)
  return data.filter(r => !r.correct).map(r => r.id)
}
