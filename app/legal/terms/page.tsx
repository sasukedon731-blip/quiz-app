import Link from "next/link"

export const metadata = {
  title: "利用規約",
}

export default function TermsPage() {
  return (
    <main style={styles.main}>
      <article style={styles.card}>
        <h1 style={styles.title}>利用規約</h1>

        <Section title="第1条（適用）">
          本規約は、高野倫之（以下「当方」）が提供する「外国人学習プラットフォーム」（以下「本サービス」）の利用条件を定めるものです。
        </Section>

        <Section title="第2条（利用）">
          ユーザーは、本規約に同意のうえ本サービスを利用するものとします。
        </Section>

        <Section title="第3条（アカウント管理）">
          ユーザーは、自己の責任においてアカウント情報を管理するものとします。
        </Section>

        <Section title="第4条（サービス内容）">
          本サービスは、日本語学習教材、ゲーム型学習、会話練習機能その他これに関連する機能を提供します。
        </Section>

        <Section title="第5条（料金および支払）">
          本サービスの有料機能は、買い切り型の期間利用権として販売されます。
          <br />
          購入時に一括で支払いが発生します。
        </Section>

        <Section title="第6条（利用期間）">
          ユーザーは、購入したプランに応じた期間、本サービスを利用できます。
          <br />
          利用期間終了後は、自動的に有料機能を利用できなくなります。
          <br />
          自動更新はありません。
        </Section>

        <Section title="第7条（返金）">
          決済完了後の返金は原則として行いません。
          <br />
          ただし、二重課金、当方の重大な不具合、その他当方が必要と認めた場合はこの限りではありません。
        </Section>

        <Section title="第8条（禁止事項）">
          ユーザーは、以下の行為をしてはなりません。
          <br />
          ・法令または公序良俗に反する行為
          <br />
          ・不正アクセスまたはこれを試みる行為
          <br />
          ・本サービスの運営を妨害する行為
          <br />
          ・教材、画像、音声、文章等の無断転載、複製、再配布、販売
          <br />
          ・他人になりすます行為
          <br />
          ・その他、当方が不適切と判断する行為
        </Section>

        <Section title="第9条（サービスの変更・停止）">
          当方は、保守、障害対応、天災、通信障害その他やむを得ない事情がある場合、本サービスの全部または一部を変更または停止することがあります。
        </Section>

        <Section title="第10条（免責）">
          当方は、本サービスの利用により特定の学習成果、試験合格、就職等を保証するものではありません。
          <br />
          当方に故意または重大な過失がある場合を除き、本サービス利用により生じた損害について責任を負いません。
        </Section>

        <Section title="第11条（規約の変更）">
          当方は、必要と判断した場合、本規約を変更できるものとします。
          <br />
          変更後の内容は、本サービス上に表示した時点で効力を生じます。
        </Section>

        <Section title="第12条（準拠法・管轄）">
          本規約は日本法に準拠し、本サービスに関して紛争が生じた場合は、当方所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
        </Section>

        <div style={styles.bottomLinks}>
          <Link href="/legal/privacy" style={styles.link}>
            プライバシーポリシー
          </Link>
          <Link href="/legal/refund" style={styles.link}>
            返金ポリシー
          </Link>
          <Link href="/legal/tokushoho" style={styles.link}>
            特定商取引法
          </Link>
        </div>
      </article>
    </main>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <p style={styles.text}>{children}</p>
    </section>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "24px 14px 40px",
  },
  card: {
    background: "#fff",
    border: "1px solid rgba(17,24,39,.08)",
    borderRadius: 18,
    padding: 20,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    margin: "0 0 8px",
    fontSize: 18,
    fontWeight: 900,
  },
  text: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.9,
    color: "#1f2937",
    whiteSpace: "pre-wrap",
  },
  bottomLinks: {
    marginTop: 28,
    paddingTop: 16,
    borderTop: "1px solid rgba(17,24,39,.08)",
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  },
  link: {
    color: "#2563eb",
    fontWeight: 800,
    textDecoration: "none",
    fontSize: 14,
  },
}