import Link from 'next/link'
import { HeartHandshake, MapPin, ShieldCheck, ArrowRight, LifeBuoy } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="home-page">
      <header className="home-header">
        <Link href="/" className="brand" aria-label="よりそいのアプリへ戻る"><span className="brand-mark"><HeartHandshake size={22} /></span><span><strong>よりそい</strong><small>災害支援マッチング</small></span></Link>
        <Link href="/" className="text-button">アプリを利用する <ArrowRight size={15} /></Link>
      </header>
      <section className="home-hero">
        <div className="home-copy"><span className="eyebrow">災害時の物資支援を、もっと安全に</span><h1>必要な人と、<br /><em>支えたい人</em>をつなぐ。</h1><p>よりそいは、被災者の支援依頼と支援者の申し出を、地域の安全レベルに合わせてつなぐアプリです。</p><div className="home-actions"><Link href="/" className="primary-button">アプリを利用する <ArrowRight size={17} /></Link><Link href="/help" className="secondary-button"><LifeBuoy size={16} />使い方を見る</Link></div></div>
        <div className="home-signal"><div className="signal-card"><div className="signal-top"><span className="status-dot green" />現在の地域情報</div><strong>石川県 能登地域</strong><div className="signal-level"><span>災害レベル</span><b>Lv.1</b></div><p>通常のマッチングが利用できます</p></div><div className="signal-route"><MapPin size={18} /><span>安全確認済みの地域から支援を始める</span></div></div>
      </section>
      <section className="home-values"><div><ShieldCheck size={21} /><h2>安全を最優先</h2><p>地域レベルに応じて、危険な移動やマッチングをサーバー側で制限します。</p></div><div><HeartHandshake size={21} /><h2>必要な情報だけで</h2><p>連絡先を公開せず、成立したマッチング内のメッセージでつながります。</p></div><div><MapPin size={21} /><h2>地域の状況を共有</h2><p>避難所、物資置き場、通行情報を地図上で確認できます。</p></div></section>
    </main>
  )
}
