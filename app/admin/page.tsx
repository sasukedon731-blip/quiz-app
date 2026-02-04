"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs } from "firebase/firestore"
import { useAuth } from "../lib/useAuth"
import { db } from "../lib/firebase"
import { ensureUserProfile, getUserRole } from "../lib/firestore"

type UserRole = "admin" | "user"

type UserDocData = {
  email?: string | null
  displayName?: string | null
  role?: UserRole
  // 他に users/{uid} に入れているフィールドがあれば追加してOK
}

type Row = {
  uid: string // ★ doc.id を必ず使う
  email: string | null
  displayName: string | null
  role: UserRole | null
}

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [rows, setRows] = useState<Row[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")

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
        // ① 自分の users/{uid} を保証（なければ作成）
        await ensureUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        })

        // ② admin 判定
        const role = await getUserRole(user.uid)
        if (role !== "admin") {
          router.replace("/")
          return
        }

        // ③ users 一覧取得
        const snap = await getDocs(collection(db, "users"))

        // ★ここが重要：doc.id を uid として使う
        const list: Row[] = snap.docs.map((d) => {
          const data = d.data() as UserDocData
          return {
            uid: d.id,
            email: data.email ?? null,
            displayName: data.displayName ?? null,
            role: data.role ?? null,
          }
        })

        setRows(list)
      } catch (e: any) {
        console.error(e)
        setError(e?.code ? `${e.code}: ${e.message ?? ""}` : e?.message ?? "不明なエラー")
      } finally {
        setReady(true)
      }
    }

    init()
  }, [user, loading, router])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((r) => {
      const s = `${r.displayName ?? ""} ${r.email ?? ""} ${r.uid}`.toLowerCase()
      return s.includes(needle)
    })
  }, [rows, q])

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

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <h1>管理者ページ</h1>

      <div style={{ display: "flex", gap: 10, margin: "12px 0 18px" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="検索（名前 / メール / UID）"
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
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
        <p>users コレクションにドキュメントがありません。</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>名前</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>メール</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>UID(doc id)</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>role</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.uid}>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{u.displayName ?? "-"}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{u.email ?? "-"}</td>
                <td style={{ border: "1px solid #ccc", padding: 8, fontSize: 12 }}>{u.uid}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{u.role ?? "-"}</td>
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
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
