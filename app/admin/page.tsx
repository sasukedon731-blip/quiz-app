"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, doc, getDoc, getDocs } from "firebase/firestore"
import { useAuth } from "../lib/useAuth"
import { db } from "../lib/firebase"
import { ensureUserProfile, getUserRole } from "../lib/firestore"

type UserRole = "admin" | "user"

type UserDocData = {
  email?: string | null
  displayName?: string | null
  role?: UserRole
}

type StudyProgress = {
  totalSessions: number
  todaySessions: number
  lastStudyDate: string
  streak: number
  streakUpdatedDate: string
  bestStreak: number
}

type Row = {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole | null
  progress: Record<string, StudyProgress | null> // quizType -> progress or null
}

const QUIZ_TYPES = ["gaikoku-license", "japanese-n4"] as const

function jstDayKey(d = new Date()) {
  // "YYYY-MM-DD" (JST)
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

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [rows, setRows] = useState<Row[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [showOnlyNotStudiedToday, setShowOnlyNotStudiedToday] = useState(false)

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
        // 自分の users/{uid} を保証（なければ作る）
        await ensureUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        })

        // admin 判定
        const role = await getUserRole(user.uid)
        if (role !== "admin") {
          router.replace("/")
          return
        }

        // users 一覧取得（doc.id を uid として使う）
        const snap = await getDocs(collection(db, "users"))
        const baseList: Row[] = snap.docs.map((d) => {
          const data = d.data() as UserDocData
          return {
            uid: d.id,
            email: data.email ?? null,
            displayName: data.displayName ?? null,
            role: data.role ?? null,
            progress: {
              "gaikoku-license": null,
              "japanese-n4": null,
            },
          }
        })

        // progress を並列取得（ユーザー数 × quizType数 だけ read します）
        const enriched = await Promise.all(
          baseList.map(async (u) => {
            const progEntries = await Promise.all(
              QUIZ_TYPES.map(async (t) => [t, await fetchProgress(u.uid, t)] as const)
            )
            const progress: Record<string, StudyProgress | null> = {
              "gaikoku-license": null,
              "japanese-n4": null,
            }
            for (const [t, p] of progEntries) progress[t] = p
            return { ...u, progress }
          })
        )

        setRows(enriched)
      } catch (e: any) {
        console.error(e)
        setError(e?.code ? `${e.code}: ${e.message ?? ""}` : e?.message ?? "不明なエラー")
      } finally {
        setReady(true)
      }
    }

    init()
  }, [user, loading, router])

  const today = jstDayKey()

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = rows

    if (needle) {
      list = list.filter((r) => {
        const s = `${r.displayName ?? ""} ${r.email ?? ""} ${r.uid}`.toLowerCase()
        return s.includes(needle)
      })
    }

    if (showOnlyNotStudiedToday) {
      list = list.filter((r) => {
        // どちらの教材も今日の学習がなければ「未学習」
        const g = r.progress["gaikoku-license"]
        const n = r.progress["japanese-n4"]
        const didG = (g?.lastStudyDate ?? "") === today && (g?.todaySessions ?? 0) > 0
        const didN = (n?.lastStudyDate ?? "") === today && (n?.todaySessions ?? 0) > 0
        return !(didG || didN)
      })
    }

    return list
  }, [rows, q, showOnlyNotStudiedToday, today])

  if (loading || !ready) {
    return <p style={{ textAlign: "center" }}>読み込み中…</p>
  }

  if (error) {
    return (
      <div style={{ maxWidth: 720, margin: "30px auto", padding: 16 }}>
        <h1>管理者ページ</h1>
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
          onClick={() => router.push("/")}
          style={{
            marginTop: 16,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          TOPへ戻る
        </button>
      </div>
    )
  }

  const label = (t: string) => (t === "japanese-n4" ? "N4" : "外国免許")

  const cell = (p: StudyProgress | null) => {
    if (!p) return { today: 0, total: 0, streak: 0, last: "-" }
    return {
      today: p.lastStudyDate === today ? (p.todaySessions ?? 0) : 0,
      total: p.totalSessions ?? 0,
      streak: p.streak ?? 0,
      last: p.lastStudyDate || "-",
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", padding: 16 }}>
      <h1>管理者ページ</h1>

      <div style={{ display: "flex", gap: 10, margin: "12px 0 12px", flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="検索（名前 / メール / UID）"
          style={{
            flex: "1 1 320px",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
          <input
            type="checkbox"
            checked={showOnlyNotStudiedToday}
            onChange={(e) => setShowOnlyNotStudiedToday(e.target.checked)}
          />
          今日未学習のみ（{today}）
        </label>

        <button
          onClick={() => router.push("/")}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          戻る
        </button>
      </div>

      {filtered.length === 0 ? (
        <p>表示できるユーザーがいません。</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>名前</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>メール</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>UID</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>role</th>

              <th style={{ border: "1px solid #ccc", padding: 8 }}>{label("gaikoku-license")} 今日</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>{label("gaikoku-license")} 累計</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>{label("gaikoku-license")} 連続</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>{label("gaikoku-license")} 最終日</th>

              <th style={{ border: "1px solid #ccc", padding: 8 }}>{label("japanese-n4")} 今日</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>{label("japanese-n4")} 累計</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>{label("japanese-n4")} 連続</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>{label("japanese-n4")} 最終日</th>

              <th style={{ border: "1px solid #ccc", padding: 8 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const g = cell(u.progress["gaikoku-license"])
              const n = cell(u.progress["japanese-n4"])
              const didToday = g.today > 0 || n.today > 0

              return (
                <tr key={u.uid} style={{ background: didToday ? "#ecfdf5" : "#fff7ed" }}>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{u.displayName ?? "-"}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{u.email ?? "-"}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8, fontSize: 12 }}>{u.uid}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{u.role ?? "-"}</td>

                  <td style={{ border: "1px solid #ccc", padding: 8, fontWeight: 800 }}>{g.today}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{g.total}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{g.streak}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{g.last}</td>

                  <td style={{ border: "1px solid #ccc", padding: 8, fontWeight: 800 }}>{n.today}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{n.total}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{n.streak}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{n.last}</td>

                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    <button
                      onClick={() => router.push(`/admin/${u.uid}`)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        cursor: "pointer",
                        background: "#fff",
                      }}
                    >
                      詳細
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
        ※ progress は users/{`{uid}`}/progress/{`{quizType}`} を参照しています（ユーザー数×教材数だけ read します）
      </p>
    </div>
  )
}
