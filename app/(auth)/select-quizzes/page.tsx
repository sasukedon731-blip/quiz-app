"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"

import { auth } from "@/app/lib/firebase"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"
import { getSelectLimit, type PlanId } from "@/app/lib/plan"
import {
  loadAndRepairUserPlanState,
  saveSelectedQuizTypesWithLock,
} from "@/app/lib/userPlanState"

function canChange(now: Date, nextAllowedAt?: Date | null) {
  if (!nextAllowedAt) return true
  return now.getTime() >= nextAllowedAt.getTime()
}

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}/${m}/${day}`
}

export default function SelectQuizzesPage() {
  const router = useRouter()

  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [plan, setPlan] = useState<PlanId>("trial")
  const [entitled, setEntitled] = useState<QuizType[]>([])
  const [selected, setSelected] = useState<QuizType[]>([])
  const [nextAllowedAt, setNextAllowedAt] = useState<Date | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/login")
        return
      }
      setUid(u.uid)
    })
    return () => unsub()
  }, [router])

  useEffect(() => {
    ;(async () => {
      if (!uid) return
      setLoading(true)
      setError("")
      try {
        const state = await loadAndRepairUserPlanState(uid)
        setPlan(state.plan)
        setEntitled(state.entitledQuizTypes)
        setSelected(state.selectedQuizTypes)
        setNextAllowedAt(state.nextChangeAllowedAt)
      } catch (e) {
        console.error(e)
        setError("読み込みに失敗しました")
      } finally {
        setLoading(false)
      }
    })()
  }, [uid])

  const now = new Date()
  const changeOk = canChange(now, nextAllowedAt)

  const limit = useMemo(() => getSelectLimit(plan), [plan])
  const maxCount = limit === "ALL" ? entitled.length : limit

  const requiredCount = useMemo(() => {
    if (plan === "3") return 3
    if (plan === "5") return 5
    if (plan === "all") return entitled.length
    return 1
  }, [plan, entitled.length])

  // ロック中でも「初回の必要数に達していない」場合だけ編集できる（救済）
  const editable = changeOk || selected.length < requiredCount

  const remaining = useMemo(() => {
    if (limit === "ALL") return "∞"
    return Math.max(0, maxCount - selected.length)
  }, [limit, maxCount, selected.length])

  // 表示対象（存在する教材のみ）
  const entitledList = useMemo(() => {
    return entitled
      .filter((id) => (quizzes as any)[id] != null)
      .map((id) => {
        const q = (quizzes as any)[id]
        return { id, title: q.title as string, description: (q.description as string | undefined) ?? "" }
      })
  }, [entitled])

  const toggle = (q: QuizType) => {
    if (!editable) return

    setSelected((prev) => {
      const has = prev.includes(q)
      if (has) return prev.filter((x) => x !== q)

      // 上限チェック
      if (limit !== "ALL" && prev.length >= maxCount) return prev
      return [...prev, q]
    })
  }

  const handleSave = async () => {
    if (!uid) return
    setSaving(true)
    setError("")
    try {
      await saveSelectedQuizTypesWithLock({
        uid,
        selectedQuizTypes: selected,
      })
      router.replace("/select-mode")
    } catch (e) {
      console.error(e)
      setError("保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.card}>読み込み中...</div>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        {/* Top Bar */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.h1}>教材を選択</h1>
            <div style={styles.sub}>
              プラン：<b>{plan}</b> ・ 選択上限：<b>{limit === "ALL" ? "ALL" : `${limit}つ`}</b> ・
              選択中：<b>{selected.length}</b> ・ 残り：<b>{remaining}</b>
            </div>
          </div>

          <div style={styles.headerActions}>
            <button onClick={() => router.push("/select-mode")} style={{ ...styles.btn, ...styles.btnGray }}>
              モード選択へ
            </button>
            <button onClick={() => router.push("/plans")} style={{ ...styles.btn, ...styles.btnBlue }}>
              プランへ
            </button>
          </div>
        </header>

        {/* Status */}
        <section style={styles.infoCard}>
          {!changeOk && nextAllowedAt && selected.length >= requiredCount ? (
            <div style={{ ...styles.notice, ...styles.noticeWarn }}>
              変更ロック中：次に変更できる日 <b>{formatDate(nextAllowedAt)}</b>
            </div>
          ) : null}

          {!changeOk && selected.length < requiredCount ? (
            <div style={{ ...styles.notice, ...styles.noticeOk }}>
              ※ 初回の教材確定がまだなので、今だけ編集できます（保存後に1ヶ月ロック）
            </div>
          ) : null}

          {(plan === "trial" || plan === "free") ? (
            <div style={{ ...styles.notice, ...styles.noticeInfo }}>
              ※ お試し/無料は教材固定です（保存時に自動で整えられます）
            </div>
          ) : null}

          <div style={styles.mini}>
            推奨：{plan === "3" ? "3つ" : plan === "5" ? "5つ" : plan === "all" ? "全て" : "1つ"} 選ぶ
          </div>
        </section>

        {error ? <div style={styles.alert}>{error}</div> : null}

        {/* Grid */}
        <section style={{ marginTop: 12 }}>
          <div style={styles.grid}>
            {entitledList.map((q) => {
              const checked = selected.includes(q.id as QuizType)
              const disabled =
                !editable || (!checked && limit !== "ALL" && selected.length >= maxCount)

              return (
                <button
                  key={q.id}
                  onClick={() => toggle(q.id as QuizType)}
                  disabled={disabled}
                  style={{
                    ...styles.quizCard,
                    ...(checked ? styles.quizCardChecked : null),
                    ...(disabled ? styles.quizCardDisabled : null),
                  }}
                >
                  <div style={styles.quizHead}>
                    <div style={styles.quizTitle}>{q.title}</div>
                    <div style={{ ...styles.pill, ...(checked ? styles.pillChecked : styles.pillEmpty) }}>
                      {checked ? "選択中" : "未選択"}
                    </div>
                  </div>

                  {/* 説明の有無に関係なく高さを確保 */}
                  {q.description ? (
                    <div style={styles.quizDesc}>{q.description}</div>
                  ) : (
                    <div style={styles.quizDescMuted}>（説明なし）</div>
                  )}

                  {/* メタはボタンより上（カード内の位置を揃える） */}
                  <div style={styles.quizMeta}>ID: {q.id}</div>

                  {/* 下固定のアクション（見た目上の誘導） */}
                  <div style={styles.quizActions}>
                    <div style={styles.ctaRow}>
                      <span style={styles.ctaLabel}>ここを押して</span>
                      <span style={styles.ctaStrong}>{checked ? "解除" : "追加"}</span>
                    </div>
                    {!editable ? (
                      <div style={styles.ctaNote}>ロック中のため編集できません</div>
                    ) : disabled ? (
                      <div style={styles.ctaNote}>上限に達しています</div>
                    ) : (
                      <div style={styles.ctaNote}>タップで切替</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Bottom Save */}
        <footer style={styles.footer}>
          <button
            onClick={handleSave}
            disabled={!editable || saving}
            style={{
              ...styles.saveBtn,
              ...(editable ? styles.saveBtnOn : styles.saveBtnOff),
              ...(saving ? styles.saveBtnSaving : null),
            }}
          >
            {saving ? "保存中..." : editable ? "この内容で保存して進む" : "変更可能日まで編集できません"}
          </button>

          <div style={styles.footerNote}>
            ※ 保存時にプランに合わせて選択内容は自動で整えられます（不足分の補完・重複除去など）。
          </div>
        </footer>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f6f7fb", padding: 18 },
  shell: { maxWidth: 980, margin: "0 auto" },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  headerActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  h1: { margin: 0, fontSize: 26, letterSpacing: 0.2 },
  sub: { marginTop: 6, opacity: 0.8, lineHeight: 1.5 },

  btn: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "none",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  btnBlue: { background: "#2563eb" },
  btnGray: { background: "#111827" },

  infoCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },
  notice: {
    padding: 10,
    borderRadius: 14,
    fontWeight: 900,
    marginBottom: 8,
    lineHeight: 1.5,
  },
  noticeWarn: { background: "#fffbeb", border: "1px solid #fcd34d", color: "#92400e" },
  noticeOk: { background: "#ecfdf5", border: "1px solid #86efac", color: "#065f46" },
  noticeInfo: { background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af" },
  mini: { fontSize: 12, opacity: 0.7, marginTop: 6 },

  alert: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
    fontWeight: 900,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
    alignItems: "stretch",
  },

  // カードは「縦flex」で下揃えの土台
  quizCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
    textAlign: "left",
    cursor: "pointer",

    display: "flex",
    flexDirection: "column",
    minHeight: 250,
  },
  quizCardChecked: {
    border: "1px solid #93c5fd",
    background: "#eff6ff",
  },
  quizCardDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  quizHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  quizTitle: { fontWeight: 900, fontSize: 16 },

  pill: {
    fontSize: 12,
    fontWeight: 900,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#fff",
    whiteSpace: "nowrap",
  },
  pillChecked: { border: "1px solid #93c5fd", background: "#dbeafe" },
  pillEmpty: { border: "1px solid #e5e7eb", background: "#fff" },

  // 説明エリアは最低高さを確保
  quizDesc: {
    marginTop: 8,
    fontSize: 13,
    opacity: 0.85,
    lineHeight: 1.5,
    minHeight: 48,
  },
  quizDescMuted: {
    marginTop: 8,
    fontSize: 13,
    opacity: 0.55,
    minHeight: 48,
  },

  // メタはボタンより上に置く
  quizMeta: { marginTop: 8, fontSize: 12, opacity: 0.6 },

  // ✅ 下固定アクション（見た目の統一）
  quizActions: {
    marginTop: "auto",
    paddingTop: 10,
    borderTop: "1px dashed rgba(0,0,0,0.12)",
  },
  ctaRow: { display: "flex", gap: 8, alignItems: "baseline" },
  ctaLabel: { fontSize: 12, opacity: 0.7 },
  ctaStrong: { fontSize: 14, fontWeight: 900 },
  ctaNote: { marginTop: 4, fontSize: 12, opacity: 0.7 },

  footer: { marginTop: 14, paddingBottom: 10 },
  saveBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 16,
    border: "none",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
  },
  saveBtnOn: { background: "#2563eb" },
  saveBtnOff: { background: "#9ca3af", cursor: "not-allowed" },
  saveBtnSaving: { opacity: 0.85 },
  footerNote: { marginTop: 8, fontSize: 12, opacity: 0.65, lineHeight: 1.5 },

  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },
}
