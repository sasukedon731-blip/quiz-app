import Link from "next/link"

export const metadata = {
  title: "特定商取引法に基づく表記",
}

export default function TokushohoPage() {
  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>特定商取引法に基づく表記</h1>

        <InfoRow label="販売事業者" value="高野倫之" />
        <InfoRow label="運営責任者" value="高野倫之" />
        <InfoRow
          label="所在地"
          value="〒150-0043 東京都渋谷区道玄坂1-10-8 渋谷道玄坂東急ビル2F-C"
        />
        <InfoRow
  label="電話番号"
  value={`090-xxxx-xxxx
※電話でのお問い合わせには対応しておりません。
お問い合わせはメール（info@outin-plus.com）までお願いいたします。
※We do not provide phone support. Please contact us via email.`}
/>
        <InfoRow label="メールアドレス" value="info@outin-plus.com" />
        <InfoRow
          label="販売URL"
          value="【https://quiz-app-mu-ochre-76.vercel.app/】"
        />

        <SectionTitle>販売価格</SectionTitle>
        <p style={styles.text}>
          各プランページに税込価格を表示します。
          <br />
          ・3教材プラン
          <br />
          ・5教材プラン
          <br />
          ・7教材プラン
          <br />
          ・AI会話オプション
        </p>

        <SectionTitle>商品代金以外の必要料金</SectionTitle>
        <p style={styles.text}>
          インターネット接続に必要な通信料等は、お客様のご負担となります。
        </p>

        <SectionTitle>支払方法</SectionTitle>
        <p style={styles.text}>クレジットカード決済 / コンビニ決済</p>

        <SectionTitle>支払時期</SectionTitle>
        <p style={styles.text}>申込時に決済されます。</p>

        <SectionTitle>サービス提供時期</SectionTitle>
        <p style={styles.text}>決済完了後、即時に利用可能です。</p>

        <SectionTitle>商品の内容</SectionTitle>
        <p style={styles.text}>
          外国人向け日本語学習Webアプリ「日本語バトル」の期間利用権を提供します。
        </p>

        <SectionTitle>契約について</SectionTitle>
        <p style={styles.text}>
          本サービスは買い切り型の期間利用権販売です。
          <br />
          自動更新はありません。
        </p>

        <SectionTitle>利用期間</SectionTitle>
        <p style={styles.text}>
          購入したプランに応じた期間のみ利用できます。
          <br />
          期間終了後は、必要に応じて再度ご購入ください。
        </p>

        <SectionTitle>解約について</SectionTitle>
        <p style={styles.text}>
          本サービスは買い切り型のため、月額サブスクリプションのような解約手続きはありません。
        </p>

        <SectionTitle>返金について</SectionTitle>
        <p style={styles.text}>
          サービスの性質上、原則として返金は行っておりません。
          <br />
          ただし、二重課金や重大な不具合があった場合は個別に対応します。
        </p>

        <SectionTitle>表現および商品に関する注意書き</SectionTitle>
        <p style={styles.text}>
          本サービスの学習効果には個人差があり、特定の成果を保証するものではありません。
        </p>

        <BottomLinks />
      </div>
    </main>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.row}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={styles.sectionTitle}>{children}</h2>
}

function BottomLinks() {
  return (
    <div style={styles.bottomLinks}>
      <Link href="/legal/terms" style={styles.link}>
        利用規約
      </Link>
      <Link href="/legal/privacy" style={styles.link}>
        プライバシーポリシー
      </Link>
      <Link href="/legal/refund" style={styles.link}>
        返金ポリシー
      </Link>
      <Link href="/plans" style={styles.link}>
        プランへ戻る
      </Link>
    </div>
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
    lineHeight: 1.3,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    gap: 14,
    padding: "14px 0",
    borderBottom: "1px solid rgba(17,24,39,.08)",
  },
  label: {
    fontWeight: 900,
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
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