"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp } from "firebase/firestore"
import { useAuth } from "@/app/lib/useAuth"
import { db } from "@/app/lib/firebase"
import { ensureUserProfile, getUserRole } from "@/app/lib/firestore"

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
  progress: Record<string, StudyProgress | null>
}

const QUIZ_TYPES = ["gaikoku-license", "japanese-n4"] as const

function jstDayKey(d = new Date()) {
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

// ✅ role の更新（adminのみ可能：Rulesで制御）
async function setUserRole(targetUid: string, role: UserRole) {
  const ref = doc(db, "users", targetUid)
  await setDoc(
    ref,
    {
      role,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [rows, setRows] = useState<Row[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ デバッグ情報（UIにも出す）
  const [debug, setDebug] = useState<{
    projectId: string
    authUid: string
    authEmail: string
    myRole: string
    usersCount: number
    userIdsPreview: string[]
  } | null>(null)

  const [q, setQ] = useState("")
  const [showOnlyNotStudiedToday, setShowOnlyNotStudiedToday] = useState(false)

  const today = jstDayKey()

  const loadUsers = async (currentAdminUid: string, myRole: string) => {
    // ✅ users 一覧
    const snap = await getDocs(collection(db, "users"))

    // ✅ 切り分けログ（ここが一番重要）
    console.log("[AdminPage] users snap.size =", snap.size)
    console.log("[AdminPage] user ids =", snap.docs.map((d) => d.id))

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

    // progress を並列取得（ユーザー数×教材数 read）
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

    // ✅ UI側にも「見えてるDBがどこか」「何件取れてるか」表示（間違い防止）
    const projectId = ((db as any).app?.options?.projectId ?? "") as string
    setDebug({
      projectId: projectId || "(unknown)",
      authUid: currentAdminUid,
      authEmail: user?.email ?? "",
      myRole,
      usersCount: snap.size,
      userIdsPreview: snap.docs.slice(0, 10).map((d) => d.id), // 先頭10件だけ
    })
  }

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
        // ✅ ここで「users/{自分uid} が必ずある」状態にする（admin判定の前提）
        await ensureUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        })

        // ✅ 自分のrole確認
        const role = await getUserRole(user.uid)

        // ✅ 重要ログ：プロジェクトIDと自分のrole
        const projectId = ((db as any).app?.options?.projectId ?? "") as string
        console.log("[AdminPage] Firebase projectId:", projectId)
        console.log("[AdminPage] Auth uid:", user.uid, "email:", user.email)
        console.log("[AdminPage] my role:", role)

        if (role !== "admin") {
          router.replace("/")
          return
        }

        await loadUsers(user.uid, role)
      } catch (e: any) {
        // ✅ 握りつぶさず必ず見える化
        console.error("[AdminPage] init error:", e)
        setError(e?.code ? `${e.code}: ${e.message ?? ""}` : e?.message ?? "不明なエラー")
      } finally {
        setReady(true)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, router])

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
        const g = r.progress["gaikoku-license"]
        const n = r.progress["japanese-n4"]
        const didG = (g?.lastStudyDate ?? "") === today && (g?.todaySessions ?? 0) > 0
        const didN = (n?.lastStudyDate ?? "") === today && (n?.todaySessions ?? 0) > 0
        return !(didG || didN)
      })
    }

    return list
  }, [rows, q, showOnlyNotStudiedToday, today])

  if (loading || !ready) return <p style={{ textAlign: "center" }}>読み込み中…</p>

  if (error) {
    return (
      <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
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
        <p style={{ marginTop: 10, color: "#666" }}>
          ※ Console にも詳細ログを出しています（projectId / users 件数など）
        </p>
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

  const onPromote = async (targetUid: string) => {
    if (!user) return
    if (targetUid === user.uid) {
      alert("自分自身の role 変更はおすすめしません（必要なら可能ですが慎重に）")
    }
    const ok = confirm(`UID: ${targetUid}\nこのユーザーを admin にしますか？`)
    if (!ok) return

    try {
      await setUserRole(targetUid, "admin")
      const role = await getUserRole(user.uid)
      await loadUsers(user.uid, role)
      alert("admin に変更しました")
    } catch (e: any) {
      console.error(e)
      alert(e?.code ? `${e.code}: ${e.message ?? ""}` : e?.message ?? "更新に失敗しました")
    }
  }

  const onDemote = async (targetUid: string) => {
    if (!user) return
    if (targetUid === user.uid) {
      const okSelf = confirm("自分を user に戻すと管理画面に入れなくなります。\n本当に実行しますか？")
      if (!okSelf) return
    } else {
      const ok = confirm(`UID: ${targetUid}\nこのユーザーを user に戻しますか？`)
      if (!ok) return
    }

    try {
      await setUserRole(targetUid, "user")
      const role = await getUserRole(user.uid)
      await loadUsers(user.uid, role)
      alert("user に変更しました")
    } catch (e: any) {
      console.error(e)
      alert(e?.code ? `${e.code}: ${e.message ?? ""}` : e?.message ?? "更新に失敗しました")
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: "30px auto", padding: 16 }}>
      <h1>管理者ページ</h1>

      {/* ✅ デバッグ表示（間違い防止：どのDBを見てるかが一目で分かる） */}
      {debug && (
        <div
          style={{
            margin: "12px 0",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #c7d2fe",
            background: "#eef2ff",
            color: "#1e3a8a",
            fontWeight: 800,
            whiteSpace: "pre-wrap",
          }}
        >
          <div>DEBUG</div>
          <div>projectId: {debug.projectId}</div>
          <div>authUid: {debug.authUid}</div>
          <div>authEmail: {debug.authEmail}</div>
          <div>myRole: {debug.myRole}</div>
          <div>usersCount(from getDocs users): {debug.usersCount}</div>
          <div>userIdsPreview: {debug.userIdsPreview.join(", ")}</div>
        </div>
      )}

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
                  <td style={{ border: "1px solid #ccc", padding: 8, fontWeight: 800 }}>
                    {u.role ?? "-"}
                  </td>

                  <td style={{ border: "1px solid #ccc", padding: 8, fontWeight: 800 }}>{g.today}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{g.total}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{g.streak}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{g.last}</td>

                  <td style={{ border: "1px solid #ccc", padding: 8, fontWeight: 800 }}>{n.today}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{n.total}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{n.streak}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{n.last}</td>

                  <td style={{ border: "1px solid #ccc", padding: 8, display: "grid", gap: 6 }}>
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

                    {u.role !== "admin" ? (
                      <button
                        onClick={() => onPromote(u.uid)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #16a34a",
                          cursor: "pointer",
                          background: "#ecfdf5",
                          fontWeight: 800,
                        }}
                      >
                        adminにする
                      </button>
                    ) : (
                      <button
                        onClick={() => onDemote(u.uid)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #ef4444",
                          cursor: "pointer",
                          background: "#fef2f2",
                          fontWeight: 800,
                        }}
                      >
                        userに戻す
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
        ※ 管理者は role のみ変更可能（Rulesで制限） / progress は users/{`{uid}`}/progress/{`{quizType}`} を参照
      </p>
    </div>
  )
}
