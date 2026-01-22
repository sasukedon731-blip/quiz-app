const KEY = 'quiz-results'

type ResultMap = Record<number, boolean>

function load(): ResultMap {
  if (typeof window === 'undefined') return {}
  return JSON.parse(localStorage.getItem(KEY) || '{}')
}

function save(data: ResultMap) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function saveResult(id: number, correct: boolean) {
  const data = load()
  data[id] = correct
  save(data)
}

export function getReviewCount() {
  const data = load()
  return Object.values(data).filter(v => !v).length
}

export function getReviewIds(): number[] {
  const data = load()
  return Object.entries(data)
    .filter(([, v]) => !v)
    .map(([k]) => Number(k))
}
