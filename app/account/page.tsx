'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/** ログイン中のユーザー情報と、災害時の自己申告（役割・地域）を管理します。 */
export default function AccountPage() {
  // Supabaseブラウザクライアントはブラウザでだけ初期化し、静的ビルド時の環境変数エラーを防ぎます。
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [role, setRole] = useState('victim')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState('')
  useEffect(() => { createClient().auth.getUser().then(({ data }) => setUser(data.user)) }, [])
  async function save() {
    const supabase = createClient()
    const { data: auth } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').upsert({ id: auth.user?.id, role_type: role, disaster_location: location })
    setMessage(error ? '申告を保存できませんでした。ログイン状態を確認してください。' : '申告内容を保存しました。')
  }
  async function logout() { await createClient().auth.signOut(); window.location.href = '/' }
  if (!user) return <main className="auth-page"><section className="auth-card"><h1>ログインが必要です</h1><p className="auth-lead">アカウント情報と申告機能を利用するにはログインしてください。</p><Link href="/auth/login" className="primary-button full">ログインする</Link></section></main>
  return <main className="auth-page"><section className="auth-card"><p className="eyebrow">アカウント</p><h1>マイページ</h1><p className="auth-lead">{user.email}</p><div className="auth-form"><label>現在の立場<select value={role} onChange={e => setRole(e.target.value)}><option value="victim">被災者</option><option value="supporter">支援者</option><option value="admin">管理者</option></select></label><label>支援・避難地域<input value={location} onChange={e => setLocation(e.target.value)} placeholder="例：石川県輪島市" /></label><button className="primary-button full" onClick={save}>申告内容を保存</button>{message && <p className="form-note" role="status">{message}</p>}<button className="secondary-button full" onClick={logout}>ログアウト</button></div><Link href="/matching" className="text-button">マッチングページへ</Link></section></main>
}
