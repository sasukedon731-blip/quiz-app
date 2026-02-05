"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore"
import { useAuth } from "@/app/lib/useAuth"
import { db } from "@/app/lib/firebase"
import { getUserRole } from "@/app/lib/firestore"

type QuizResult = {
  score: number
  total: number
  mode?: string
  quizType?: string
  createdAt?: { seconds: number } | null
}

type StudyProgress = {
  totalSessions: number
  todaySessions: number
  lastStudyDate: string
  streak: number
  streakUpdatedDate: string
  bestStreak: number
}

type UserProfile = {
  email?: string | null
  displayName?: string | null
  role?: "admin" | "user"
}

const QUIZ_TYPES = ["gaikoku-license", "japanese-n4"] as const

function formatDateSeconds(seconds?: number) {
  if (!seconds) return "-"
  return new Date(seconds * 1000).toLocaleString()
}

function jstDayKey(d = new Date()) {
  // "YYYY-MM-DD" in JST
  try {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d)
  } catch {
    const local = new Date(d.getTime() + 9 * 60 * 60 * 1000)
    return local.toISOString().slice(0, 10)
  }
}

function safeProgress(p: any): StudyProgress {
  const base: StudyProgress = {
    totalSessions: 0,
    todaySessions: 0,
    lastStudyDate: "",
    streak: 0,
    streakUpdatedDate: "",
    bestStreak: 0,
  }
  if (!p) return base
  return {
    totalSessions: typeof p.totalSessions === "number" ? p.totalSessions : 0,
    todaySessions: typeof p.todaySessions === "number" ? p.todaySessions : 0,
    lastStudyDate: typeof p.lastStudyDate === "string" ? p.lastStudyDate : "",
    streak: typeof p.streak === "number" ? p.streak : 0,
    streakUpdatedDate: typeof p.streakUpdatedDate === "string" ? p.streakUpdatedDate : "",
    bestStreak: typeof p.bestStreak === "number" ? p.bestStreak : 0,
  }
}

async function fetchProgress(uid: string, quizType: string): Promise<StudyProgress | null> {
  try {
    const ref = doc(db, "users", uid, "progress", quizType)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return safeProgress(snap.data())
  } catch (e) {
    console.error("fetchProgress failed", uid, quizType, e)
    return null
  }
}

export default function AdminUserPage() {
  const router = useRouter()
  const params = useParams()
  const uid = String((params as any).uid)

  const { user, loading } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [progress, setProgress] = useState<Record<string, StudyProgress | null>>({
    "gaikoku-license": null,
    "japanese-n4": null,
  })

  const [results, setResults] = useState<QuizResult[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace("/login")
      return
    }

    const init = async () => {
      setError(null)
      setReady(false)

      try {
        // admin判定
        const role = await getUserRole(user.uid)
        if (role !== "admin") {
          router.replace("/")
          return
        }

        // users/{uid} のプロフィール取得
        const userRef = doc(db, "users", uid)
        const userSnap = await getDoc(userRef)
        setProfile(userSnap.exists() ? (userSnap.data() as UserProfile) : null)

        // progress 取得（教材別）
        const progEntries = await Promise.all(
          QUIZ_TYPES.map(async (t) => [t, await fetchProgress(uid, t)] as const)
        )
        const prog: Record<string, StudyProgress | null> = {
          "gaikoku-license": null,
          "japanese-n4": null,
        }
        for (const [t, p] of progEntries) prog[t] = p
        setProgress(prog)

        // results 取得（最新50件）
        const q = query(
          collection(db, "users", uid, "results"),
          orderBy("createdAt", "desc"),
          limit(50)
        )
        const snap = await getDocs(q)
        const list = snap.docs.map((d) => d.data() as QuizResult)
        setResults(list)
      } catch (e: any) {
        console.error(e)
        setError(e?.code ? `${e.code}: ${e.message ?? ""}` : e?.message ?? "不明なエラー")
      } finally {
        setReady(true)
      }
    }

    init()
  }, [uid, user, loading, router])

  const today = jstDayKey()

  const label = (t: string) => (t === "japanese-n4" ? "日本語N4" : "外国免許切替")

  const progCell = (p: StudyProgress | null) => {
    if (!p) {
      return { todayCount: 0, total: 0, streak: 0, best: 0, last: "-" }
    }
    const todayCount = p.lastStudyDate === today ? (p.todaySessions ?? 0) : 0
    return {
      todayCount,
      total: p.totalSessions ?? 0,
      streak: p.streak ?? 0,
      best: p.bestStreak ?? 0,
      last: p.lastStudyDate || "-",
    }
  }

  const progressSummary = useMemo(() => {
    const g = progCell(progress["gaikoku-license"])
    const n = progCell(progress["japanese-n4"])
    return {
      todayTotal: g.todayCount + n.todayCount,
      totalAll: g.total + n.total,
      currentStreak: Math.max(g.streak, n.streak),
      bestStreak: Math.max(g.best, n.best),
    }
  }, [progress, today])

  if (loading || !ready) return <p style={{ textAlign: "center" }}>読み込み中…</p>

  if (error) {
    return (
      <div style={{ maxWidth: 820, margin: "30px auto", padding: 16 }}>
        <h1>ユーザー詳細</h1>
        <p>UID: {uid}</p>
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #fca5a5",
            background: "#fef2f2",
            color: "#991b1b",
            fontWeight: 800,
            whiteSpace: "pre-wrap",
          }}
        >
          エラー：
          {"\n"}
          {error}
        </div>
        <button
          onClick={() => router.push("/admin")}
          style={{
            marginTop: 16,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          ← 一覧に戻る
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", padding: 16 }}>
      <button
        onClick={() => router.push("/admin")}
        style={{
          marginBottom: 12,
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #ccc",
          background: "#fff",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        ← 一覧に戻る
      </button>

      <h1>ユーザー詳細</h1>
      <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>UID: {uid}</div>

      {/* ✅ プロフィール */}
      <div
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: 12,
          border: "1px solid #ddd",
          background: "#fafafa",
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>
            {profile?.displayName ?? "-"}
          </div>
          <div style={{ color: "#555" }}>{profile?.email ?? "-"}</div>
          <div
            style={{
              marginLeft: "auto",
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid #ccc",
              background: "#fff",
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            role: {profile?.role ?? "-"}
          </div>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px", padding: 12, borderRadius: 10, border: "1px solid #eee", background: "#fff" }}>
            <div style={{ fontSize: 12, color: "#666" }}>今日の完了回数（合計）</div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{progressSummary.todayTotal} 回</div>
          </div>

          <div style={{ flex: "1 1 220px", padding: 12, borderRadius: 10, border: "1px solid #eee", background: "#fff" }}>
            <div style={{ fontSize: 12, color: "#666" }}>累計の完了回数（合計）</div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{progressSummary.totalAll} 回</div>
          </div>

          <div style={{ flex: "1 1 220px", padding: 12, borderRadius: 10, border: "1px solid #eee", background: "#fff" }}>
            <div style={{ fontSize: 12, color: "#666" }}>連続学習日数（現在 / 最高）</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>
              {progressSummary.currentStreak}日 / {progressSummary.bestStreak}日
            </div>
          </div>
        </div>
      </div>

      {/* ✅ 教材別 progress */}
      <h2 style={{ marginTop: 18 }}>学習進捗（標準問題）</h2>

      <div style={{ display: "grid", gap: 10 }}>
        {QUIZ_TYPES.map((t) => {
          const p = progCell(progress[t])
          const didToday = p.todayCount > 0
          return (
            <div
              key={t}
              style={{
                padding: 14,
                borderRadius: 12,
                border: "1px solid #ddd",
                background: didToday ? "#ecfdf5" : "#fff7ed",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900 }}>
                  {label(t)}
                  <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 800, color: "#444" }}>
                    （今日: {today}）
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: didToday ? "#065f46" : "#9a3412" }}>
                  {didToday ? "✅ 今日学習あり" : "🟠 今日未学習"}
                </div>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 180px", padding: 10, borderRadius: 10, border: "1px solid #eee", background: "#fff" }}>
                  <div style={{ fontSize: 12, color: "#666" }}>今日の完了回数</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{p.todayCount} 回</div>
                </div>

                <div style={{ flex: "1 1 180px", padding: 10, borderRadius: 10, border: "1px solid #eee", background: "#fff" }}>
                  <div style={{ fontSize: 12, color: "#666" }}>累計完了回数</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{p.total} 回</div>
                </div>

                <div style={{ flex: "1 1 180px", padding: 10, borderRadius: 10, border: "1px solid #eee", background: "#fff" }}>
                  <div style={{ fontSize: 12, color: "#666" }}>連続 / 最高</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>
                    {p.streak}日 / {p.best}日
                  </div>
                </div>

                <div style={{ flex: "1 1 220px", padding: 10, borderRadius: 10, border: "1px solid #eee", background: "#fff" }}>
                  <div style={{ fontSize: 12, color: "#666" }}>最終学習日</div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{p.last}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ✅ results（模擬試験） */}
      <h2 style={{ marginTop: 18 }}>結果（模擬試験など）</h2>

      {results.length === 0 ? (
        <p>結果がありません</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>教材</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>モード</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>日時</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>スコア</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>正答率</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const acc = r.total ? Math.round((r.score / r.total) * 100) : 0
              return (
                <tr key={i}>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{r.quizType ?? "-"}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{r.mode ?? "-"}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    {formatDateSeconds(r.createdAt?.seconds)}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    {r.score} / {r.total}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8, fontWeight: 800 }}>
                    {acc}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
        ※ progress は users/{`{uid}`}/progress/{`{quizType}`} を参照 / results は users/{`{uid}`}/results を参照
      </p>
    </div>
  )
}
