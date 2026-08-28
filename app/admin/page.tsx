'use client'

import { FormEvent, useState } from 'react'

/** 管理者専用の災害レベル設定画面。保存先と権限検証はAPI側です。 */
export default function AdminPage() {
  const [level, setLevel] = useState('1')
  const [message, setMessage] = useState('')
  async function save(event: FormEvent) {
    event.preventDefault()
    setMessage('保存しています…')
    const response = await fetch('/api/disaster-level', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ level: Number(level) }) })
    const data = await response.json().catch(() => ({}))
    setMessage(response.ok ? `全国の災害レベルをLv.${data.level}に更新しました。` : data.error ?? '保存できませんでした。')
  }
  return <main className="auth-page"><section className="auth-card"><p className="eyebrow">管理者コンソール</p><h1>災害レベル設定</h1><p className="auth-lead">全国のマッチング利用制限に適用されます。変更内容はサーバーとSupabaseに保存されます。</p><form className="auth-form" onSubmit={save}><label>現在の災害レベル<select value={level} onChange={(event) => setLevel(event.target.value)}><option value="1">Lv.1（マッチング利用可）</option><option value="2">Lv.2（マッチング停止）</option><option value="3">Lv.3（マッチング停止）</option></select></label><button className="primary-button full" type="submit">レベルを保存</button>{message && <p className="form-note" role="status">{message}</p>}</form></section></main>
}
