'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, HeartHandshake, MapPin, MessageCircle, Package, ShieldCheck, LockKeyhole, Check, Clock3, ChevronRight } from 'lucide-react'

type Matching = { id: string; post_id: string; score: number; status: string; created_at: string }
type Filter = 'すべて' | '申請中' | '成立' | '完了'

/** マッチング一覧。候補の状態と次の行動を独立ページで確認するUIです。権限・レベル判定はAPI側でも必ず行います。 */
export default function MatchingPage() {
  const [level] = useState(1)
  const [items, setItems] = useState<Matching[]>([])
  const [filter, setFilter] = useState<Filter>('すべて')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    // 個人情報を含む候補は、認証済みユーザーのセッションCookieを使うサーバーAPIからのみ取得します。
    fetch('/api/matchings').then(async (res) => { if (res.ok) { const body = await res.json(); setItems(body.data ?? []) } else if (res.status === 401) setNotice('ログインするとマッチング候補を確認できます') }).catch(() => setNotice('マッチング情報を取得できませんでした'))
  }, [])

  const counts = useMemo(() => ({ すべて: items.length, 申請中: items.filter((item) => item.status === 'proposed').length, 成立: items.filter((item) => item.status === 'accepted').length, 完了: items.filter((item) => item.status === 'completed').length }), [items])
  const visibleItems = items.filter((item) => filter === 'すべて' || (filter === '申請中' && item.status === 'proposed') || (filter === '成立' && item.status === 'accepted') || (filter === '完了' && item.status === 'completed'))
  const locked = level > 1

  return <main className="standalone-page"><header className="standalone-header"><Link href="/" className="icon-button" aria-label="アプリに戻る"><ArrowLeft size={20} /></Link><div className="brand"><span className="brand-mark"><HeartHandshake size={21} /></span><span><strong>よりそい</strong><small>災害支援マッチング</small></span></div><span className="standalone-level"><span className="status-dot green" />地域レベル Lv.{level}</span></header><section className="standalone-content"><div className="content-head"><div><p className="eyebrow">つながりを確認する</p><h1>マッチング</h1></div><Link href="/" className="secondary-button">支援依頼を探す</Link></div>{locked ? <div className="locked-state"><LockKeyhole size={30} /><h2>この機能はレベル2以上では使用できません</h2><p>安全が確認され、地域レベルがLv.1以下になるまでマッチング機能は停止しています。</p><Link href="/" className="primary-button">検索へ戻る</Link></div> : <><div className="matching-intro"><div className="intro-icon"><HeartHandshake size={22} /></div><div><h2>あなたのマッチング候補</h2><p>物資・地域・緊急度をもとに、あなたの依頼に近い候補を表示します。連絡先は公開されません。</p></div><ShieldCheck size={20} /></div><nav className="matching-tabs" aria-label="マッチングの状態"><div>{(['すべて', '申請中', '成立', '完了'] as Filter[]).map((tab) => <button type="button" key={tab} className={filter === tab ? 'active' : ''} onClick={() => setFilter(tab)}>{tab}<span>{counts[tab]}</span></button>)}</div></nav><div className="matching-summary"><span><strong>{visibleItems.length}</strong>件の候補</span><span><Clock3 size={14} /> 更新時に最新状態を取得</span></div><div className="standalone-list">{visibleItems.length === 0 ? <div className="empty-matching"><Package size={28} /><h2>{filter === 'すべて' ? 'マッチング候補はまだありません' : `${filter}の候補はありません`}</h2><p>支援したい依頼の「この依頼を支援する」から申し込むと、候補がここに表示されます。</p><Link href="/" className="text-button">支援依頼を探す</Link></div> : visibleItems.map(item => <article className="standalone-match candidate-card" key={item.id}><div className="match-score"><b>{Math.round(item.score)}%</b><span>一致度</span></div><div className="match-info"><Badge status={item.status} /><h3>支援依頼 #{item.post_id.slice(0, 8)}</h3><p><MapPin size={14} />対象地域・物資情報を確認できます</p><small>候補登録 {new Date(item.created_at).toLocaleDateString('ja-JP')}</small></div><div className="match-actions">{item.status === 'accepted' ? <Link href={`/messages/${item.id}`} className="primary-button"><MessageCircle size={16} />メッセージ</Link> : <span className="candidate-next"><Clock3 size={15} />相手の確認待ち</span>}<ChevronRight size={17} aria-hidden="true" /></div></article>)}</div></>}</section>{notice && <div className="toast"><Check size={17} />{notice}</div>}</main>
}
function Badge({ status }: { status: string }) { const label = status === 'accepted' ? '成立' : status === 'completed' ? '完了' : status === 'cancelled' ? '終了' : '申請中'; return <span className={status === 'accepted' ? 'badge badge-green' : status === 'completed' ? 'badge badge-blue' : 'badge badge-neutral'}>{label}</span> }
