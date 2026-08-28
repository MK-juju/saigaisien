'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, HeartHandshake, MapPin, MessageCircle, Package, ShieldCheck, LockKeyhole, Check } from 'lucide-react'

type Matching = { id: string; post_id: string; score: number; status: string; created_at: string }

export default function MatchingPage() {
  const [level, setLevel] = useState<number | null>(null)
  const [items, setItems] = useState<Matching[]>([])
  const [notice, setNotice] = useState('')
  useEffect(() => { fetch('/api/matchings').then(async (res) => { if (res.ok) { const body = await res.json(); setItems(body.data ?? []) } else if (res.status === 401) setNotice('ログインするとマッチングを確認できます') }).catch(() => setNotice('マッチング情報を取得できませんでした')) }, [])
  const locked = level !== null && level > 1
  return <main className="standalone-page"><header className="standalone-header"><Link href="/" className="icon-button" aria-label="アプリに戻る"><ArrowLeft size={20} /></Link><div className="brand"><span className="brand-mark"><HeartHandshake size={21} /></span><span><strong>よりそい</strong><small>災害支援マッチング</small></span></div><span className="standalone-level"><span className="status-dot green" />地域レベル Lv.1</span></header><section className="standalone-content"><div className="content-head"><div><p className="eyebrow">つながりを確認する</p><h1>マッチング</h1></div><Link href="/" className="secondary-button">支援依頼を探す</Link></div>{locked ? <div className="locked-state"><LockKeyhole size={30} /><h2>この機能はレベル2以上では使用できません</h2><p>安全が確認され、地域レベルがLv.1以下になるまでマッチング機能は停止しています。</p><Link href="/" className="primary-button">検索へ戻る</Link></div> : <><div className="matching-intro"><div className="intro-icon"><HeartHandshake size={22} /></div><div><h2>あなたのマッチング</h2><p>距離・緊急度・物資の一致度をもとに候補を表示します。連絡先は公開されません。</p></div><ShieldCheck size={20} /></div><div className="standalone-list">{items.length === 0 ? <div className="empty-matching"><Package size={28} /><h2>マッチングはまだありません</h2><p>支援したい依頼の「この依頼を支援する」から申し込むと、ここで進捗を確認できます。</p><Link href="/" className="text-button">支援依頼を探す</Link></div> : items.map(item => <article className="standalone-match" key={item.id}><div className="match-score"><b>{Math.round(item.score)}%</b><span>マッチ度</span></div><div className="match-info"><Badge status={item.status} /><h3>支援依頼 #{item.post_id.slice(0, 8)}</h3><p><MapPin size={14} />対象地域の支援依頼</p></div><Link href={`/messages/${item.id}`} className="primary-button"><MessageCircle size={16} />メッセージ</Link></article>)}</div></>}</section>{notice && <div className="toast"><Check size={17} />{notice}</div>}</main>
}
function Badge({ status }: { status: string }) { return <span className="badge badge-green">{status === 'accepted' ? '成立' : '申請中'}</span> }
