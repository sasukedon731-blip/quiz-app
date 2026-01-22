const KEY = 'quiz-results'

type ResultMap = Record<number, boolean>

const isBrowser = () => typeof window !== 'undefined'

function load(): ResultMap {
  if (!isBrowser()) return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

function save(data: ResultMap) {
  if (!isBrowser()) return
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function saveResult(id: number, correct: boolean) {
  const data = load()
  data[id] = correct
  save(data)
}

export function getReviewCount(): number {
  const data = load()
  return Object.values(data).filter(v => v === false).length
}

export function getReviewIds(): number[] {
  const data = load()
  return Object.entries(data)
    .filter(([, v]) => v === false)
    .map(([k]) => Number(k))
}
