'use client'
/** このファイルの役割と主要な画面動作を、実装の近くにコメントで説明しています。 */

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const disasters = ['暴風','竜巻','豪雨','豪雪','洪水','崖崩れ','土石流','高潮','地震','津波','地盤の液状化','噴火','地滑り','大規模な火事','大規模な爆発','その他']
const supportRegionOptions = ['北海道','東北','関東','北陸','甲信越','東海','近畿','中国','四国','九州・沖縄','全国']

/** 災害発生時の自己申告を保存する画面。過去の役割は保持せず、現在の申告だけを更新します。 */
export default function DeclarationPage() {
  const [role, setRole] = useState<'victim'|'supporter'>('victim')
  const [disaster, setDisaster] = useState('地震')
  const [location, setLocation] = useState('')
  const [regions, setRegions] = useState<string[]>([])
  const [other, setOther] = useState('')
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    const { data: { user } } = await createClient().auth.getUser()
    if (!user) { setMessage('ログインが必要です。'); return }
    const { error } = await createClient().from('profiles').upsert({ id: user.id, role_type: role, disaster_type: disaster, disaster_location: location, support_regions: regions, support_notes: other })
    setMessage(error ? '保存できませんでした。入力内容とログイン状態を確認してください。' : '自己申告内容を保存しました。いつでもこの画面から変更できます。')
  }
  return <main className="auth-page"><section className="auth-card declaration-card"><Link href="/account" className="text-button">マイページへ戻る</Link><p className="eyebrow">災害時の自己申告</p><h1>現在の状況を登録</h1><p className="auth-lead">災害・場所・現在の役割を登録してください。被災者と支援者は後から変更できます。</p><form className="auth-form" onSubmit={submit}><label>災害の種類<select value={disaster} onChange={e=>setDisaster(e.target.value)}>{disasters.map(item=><option key={item}>{item}</option>)}</select></label><label>災害発生地域<input required value={location} onChange={e=>setLocation(e.target.value)} placeholder="例：石川県輪島市" /></label><fieldset><legend>現在の役割</legend><div className="segmented"><button type="button" className={role==='victim'?'selected':''} onClick={()=>setRole('victim')}>被災者</button><button type="button" className={role==='supporter'?'selected':''} onClick={()=>setRole('supporter')}>支援者</button></div></fieldset>{role==='supporter'&&<><fieldset><legend>支援可能範囲（複数選択）</legend>{supportRegionOptions.map(item=><label key={item} className="checkbox-line"><input type="checkbox" checked={regions.includes(item)} onChange={e=>setRegions(e.target.checked?[...regions,item]:regions.filter(x=>x!==item))}/>{item}</label>)}</fieldset><label>支援できる内容・その他<textarea value={other} onChange={e=>setOther(e.target.value)} rows={4} placeholder="支援可能な物資や補足を入力してください" /></label></>}<button className="primary-button full" type="submit">申告内容を保存</button>{message&&<p className="form-note" role="status">{message}</p>}</form></section></main>
}
