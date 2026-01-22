'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { questions, Question } from '@/app/data/questions'

export default function ReviewPage() {
  const [list, setList] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  // 復習問題を読み込む
  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('reviewIds') || '[]') as number[]
    const filtered = questions.filter(q => ids.includes(q.id))
    setList(filtered)
  }, [])

  if (list.length === 0) {
    return (
      <main style={{ padding: 24 }}>
        <h1>復習モード</h1>
        <p>復習する問題はありません 🎉</p>
        <Link href="/">メニューへ戻る</Link>
      </main>
    )
  }

  const q = list[index]

  const answer = (i: number) => {
    setSelected(i)
    setIsCorrect(i === q.correctIndex)

    // 正解したら復習リストから削除
    if (i === q.correctIndex) {
      const ids = JSON.parse(localStorage.getItem('reviewIds') || '[]') as number[]
      const nextIds = ids.filter(id => id !== q.id)
      localStorage.setItem('reviewIds', JSON.stringify(nextIds))
    }
  }

  const next = () => {
    setSelected(null)
    setIsCorrect(null)
    setIndex(i => i + 1)
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>復習モード</h1>
      <p>
        {index + 1} / {list.length}
      </p>

      <h2>{q.question}</h2>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {q.choices.map((c, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            <button
              onClick={() => answer(i)}
              disabled={selected !== null}
              style={{
                width: '100%',
                padding: 12,
                background:
                  selected === null
                    ? '#eee'
                    : i === q.correctIndex
                    ? '#8f8'
                    : i === selected
                    ? '#f88'
                    : '#eee',
              }}
            >
              {c}
            </button>
          </li>
        ))}
      </ul>

      {isCorrect !== null && (
        <div>
          <p>{isCorrect ? '⭕ 正解！' : '❌ 不正解'}</p>

          {index + 1 < list.length ? (
            <button onClick={next}>次へ</button>
          ) : (
            <Link href="/">メニューへ戻る</Link>
          )}
        </div>
      )}
    </main>
  )
}
