'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, HeartHandshake, LockKeyhole, Package, ShieldCheck, MessageCircle, Check, Clock3 } from 'lucide-react'

type Matching = { id: string; post_id: string; status: string; created_at: string }
type Filter = 'すべて' | '申請中' | '成立' | '完了'

/**
 * マッチング専用画面です。
 * 候補の個人情報は、認証済みセッションを確認するサーバーAPIからのみ取得します。
 * レベルによる利用制限も見た目だけでなくAPI側で強制されます。
 */
export default function MatchingPage() {
  // 環境変数APIを取得できない場合も安全側に倒し、マッチングを開放しません。
  const [level, setLevel] = useState(2)
  const [items, setItems] = useState<Matching[]>([])
  const [filter, setFilter] = useState<Filter>('すべて')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    // 地域レベルは公開読み取りAPIから取得し、表示とサーバー制限の基準を揃えます。
    fetch('/api/disaster-level').then(async (response) => {
      if (!response.ok) return
      const body = await response.json()
      const value = Number(body.level)
      if (Number.isInteger(value)) setLevel(value)
    }).catch(() => undefined)
    fetch('/api/matchings').then(async (response) => {
      if (response.ok) {
        const body = await response.json()
        setItems(body.data ?? [])
      } else if (response.status === 401) setNotice('ログインするとマッチング候補を確認できます')
    }).catch(() => setNotice('マッチング情報を取得できませんでした'))
  }, [])

  const counts = {
    すべて: items.length,
    申請中: items.filter((item) => item.status === 'proposed').length,
    成立: items.filter((item) => item.status === 'accepted').length,
    完了: items.filter((item) => item.status === 'completed').length,
  }
  const visibleItems = items.filter((item) => filter === 'すべて' || (filter === '申請中' && item.status === 'proposed') || (filter === '成立' && item.status === 'accepted') || (filter === '完了' && item.status === 'completed'))
  const locked = level >= 2

  return <main className="standalone-page">
    <header className="standalone-header"><Link href="/" className="icon-button" aria-label="アプリに戻る"><ArrowLeft size={20} /></Link><div className="brand"><span className="brand-mark"><HeartHandshake size={21} /></span><span><strong>よりそい</strong><small>災害支援マッチング</small></span></div><span className="standalone-level"><span className={`status-dot ${locked ? '' : 'green'}`} />地域レベル Lv.{level}</span></header>
    <section className="standalone-content"><div className="content-head"><div><p className="eyebrow">つながりを確認する</p><h1>マッチング</h1></div><Link href="/" className="secondary-button">支援依頼を探す</Link></div>
      {locked ? <div className="locked-state matching-lock-overlay" role="alertdialog" aria-live="assertive"><LockKeyhole size={30} /><h2>この機能はレベル2以上では使用できません</h2><p>安全が確認され、地域レベルがLv.1以下になるまでマッチング機能は停止しています。</p><Link href="/" className="primary-button">検索へ戻る</Link></div> : <>
        <div className="matching-intro"><div className="intro-icon"><HeartHandshake size={22} /></div><div><h2>マッチング候補を確認</h2><p>成立状況と対象の支援依頼を確認できます。マッチ度や連絡先は表示しません。</p></div><ShieldCheck size={20} /></div>
        <nav className="matching-tabs" aria-label="マッチングの状態"><div>{(['すべて', '申請中', '成立', '完了'] as Filter[]).map((tab) => <button type="button" key={tab} className={filter === tab ? 'active' : ''} onClick={() => setFilter(tab)}>{tab}<span>{counts[tab]}</span></button>)}</div></nav>
        <div className="matching-summary"><span><strong>{visibleItems.length}</strong>件の候補</span><span><Clock3 size={14} /> 更新時に最新状態を取得</span></div>
        <div className="standalone-list">{visibleItems.length === 0 ? <div className="empty-matching"><Package size={28} /><h2>{filter === 'すべて' ? 'マッチング候補はまだありません' : `${filter}の候補はありません`}</h2><p>支援依頼への申し出が成立すると、ここから相手とつながれます。</p><Link href="/" className="text-button">支援依頼を探す</Link></div> : visibleItems.map((item) => <article className="standalone-match candidate-card" key={item.id}><div className="match-info"><StatusBadge status={item.status} /><h3>支援依頼 #{item.post_id.slice(0, 8)}</h3><p>対象の依頼情報は権限に応じて安全に表示されます。</p><small>申請日：{new Date(item.created_at).toLocaleDateString('ja-JP')}</small></div>{item.status === 'accepted' && <Link href={`/messages/${item.id}`} className="primary-button"><MessageCircle size={16} />メールページへ</Link>} {item.status === 'completed' && <span className="completed-label"><Check size={16} />支援完了</span>}</article>)}</div>
      </>}
    </section>{notice && <div className="toast"><Check size={17} />{notice}</div>}
  </main>
}

function StatusBadge({ status }: { status: string }) { const label = status === 'accepted' ? '成立' : status === 'completed' ? '完了' : status === 'cancelled' ? '終了' : '申請中'; return <span className={status === 'accepted' ? 'badge badge-green' : status === 'completed' ? 'badge badge-blue' : 'badge badge-neutral'}>{label}</span> }
