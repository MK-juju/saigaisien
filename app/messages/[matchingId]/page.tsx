'use client'
/** このファイルの役割と主要な画面動作を、実装の近くにコメントで説明しています。 */

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, HeartHandshake, Send, ShieldCheck } from 'lucide-react'

export default function MessagesPage({ params }: { params: Promise<{ matchingId: string }> }) {
  const [matchingId, setMatchingId] = useState('')
  const [body, setBody] = useState('')
  const [messages, setMessages] = useState<{ id: string; body: string; sender_id: string }[]>([])
  const [notice, setNotice] = useState('')
  useEffect(() => { params.then(({ matchingId: id }) => { setMatchingId(id); fetch(`/api/messages?matching_id=${id}`).then(async (res) => { if (res.ok) setMessages((await res.json()).data ?? []) }) }) }, [params])
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!body.trim() || !matchingId) return; const response = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matching_id: matchingId, body: body.trim() }) }); if (response.ok) { const result = await response.json(); setMessages((current) => [...current, result.data]); setBody(''); setNotice('メッセージを送信しました') } else setNotice('成立したマッチング相手にのみ送信できます') }
  return <main className="standalone-page"><header className="standalone-header">{/* 左上の戻るアイコンとブランドは、最上位のホームへ戻る共通導線です。 */}<Link href="/" className="icon-button" aria-label="最上位のホームへ移動"><ArrowLeft size={20} /></Link><Link href="/" className="brand" aria-label="最上位のホームへ移動"><span className="brand-mark"><HeartHandshake size={21} /></span><span><strong>よりそい</strong><small>メールページ</small></span></Link></header><section className="message-shell"><div className="message-header"><div><p className="eyebrow">成立した支援依頼</p><h1>安全なメッセージ</h1></div><ShieldCheck size={23} /></div><div className="privacy-note"><ShieldCheck size={17} />メールアドレス・電話番号は公開されません。必要な連絡はここで行ってください。</div><div className="message-list">{messages.length === 0 ? <p className="message-empty">最初のメッセージを送って、支援の内容を確認しましょう。</p> : messages.map(message => <div className="message-bubble" key={message.id}>{message.body}</div>)}</div><form className="message-composer" onSubmit={submit}><textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="支援内容や受け取り方法を入力" rows={3} /><button className="primary-button" type="submit"><Send size={16} />送信</button></form></section>{notice && <div className="toast"><Check size={17} />{notice}</div>}</main>
}
