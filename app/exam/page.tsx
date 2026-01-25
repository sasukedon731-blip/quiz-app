'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { questions, Question } from '../data/questions'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firestore'

const EXAM_TIME = 20 * 60 // 20分

export default function ExamPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  const [quiz, setQuiz] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME)
  const [mode, setMode] = useState<'quiz' | 'result'>('quiz')

  const savedRef = useRef(false) // 二重保存防止

  // 🔐 ログイン確認
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) router.replace('/login')
      else setUser(u)
    })
    return () => unsub()
  }, [router])

  // 初期化（シャッフル＋20問）
  useEffect(() => {
    const shuffled = [...questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 20)

    setQuiz(shuffled)
    setSelectedAnswers(Array(shuffled.length).fill(null))
  }, [])

  // タイマー
  useEffect(() => {
    if (mode !== 'quiz') return
    if (timeLeft <= 0) {
      setMode('result')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, mode])

  // 🔥 結果保存（1回だけ）
  useEffect(() => {
    if (mode !== 'result') return
    if (!user) return
    if (savedRef.current) return

    savedRef.current = true

    addDoc(collection(db, 'users', user.uid, 'results'), {
      score,
      total: quiz.length,
      mode: 'exam',
      createdAt: serverTimestamp(),
    })
  }, [mode, user, score, quiz.length])

  if (quiz.length === 0) {
    return <p className="container">読み込み中...</p>
  }

  const current = quiz[index]
  const min = Math.floor(timeLeft / 60)
  const sec = timeLeft % 60

  const handleAnswer = (i: number) => {
    if (selected !== null) return

    setSelected(i)
    setSelectedAnswers(prev => {
      const copy = [...prev]
      copy[index] = i
      return copy
    })

    if (i === current.correctIndex) {
      setScore(s => s + 1)
    }

    setTimeout(() => {
      setSelected(null)
      if (index + 1 < quiz.length) setIndex(p => p + 1)
      else setMode('result')
    }, 500)
  }

  /* ===== 結果画面 ===== */
  if (mode === 'result') {
    return (
      <main className="container">
        <div className="card">
          <h2>模擬試験 結果</h2>
          <p>スコア：{score} / {quiz.length}</p>
        </div>

        {quiz.map((q, i) => {
          const userAnswer = selectedAnswers[i]
          const isCorrect = userAnswer === q.correctIndex

          return (
            <div key={i} className="card">
              <p><strong>問題 {i + 1}</strong></p>
              <p>{q.question}</p>
              <p>
                あなたの回答：
                <span className={isCorrect ? 'button-success' : ''}>
                  {' '}
                  {userAnswer !== null ? q.choices[userAnswer] : '未回答'}
                </span>
              </p>
              <p>正解：<strong>{q.choices[q.correctIndex]}</strong></p>
            </div>
          )
        })}

        <button className="button button-main" onClick={() => router.push('/')}>
          TOPへ戻る
        </button>
      </main>
    )
  }

  /* ===== 問題画面 ===== */
  return (
    <main className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <p>残り時間：{min}:{sec.toString().padStart(2, '0')}</p>
          <p>{index + 1} / {quiz.length}</p>
        </div>

        <h2>{current.question}</h2>

        {current.choices.map((choice, i) => {
          let className = 'button button-choice'
          if (selected !== null) {
            if (i === current.correctIndex) className += ' correct'
            else if (i === selected) className += ' wrong'
          }

          return (
            <button
              key={i}
              className={className}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null}
            >
              {choice}
            </button>
          )
        })}
      </div>

      <button className="button button-main" onClick={() => router.push('/')}>
        TOPへ戻る
      </button>
    </main>
  )
}
