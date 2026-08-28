import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * 現在の地域レベルを返す読み取り専用APIです。
 * 地域レベルはUIの状態ではなく、サーバーから取得した値を表示します。
 */
export async function GET() {
  try {
    // 災害レベルは画面遷移前にも必要な公開安全情報なので、認証状態に依存させません。\n    // レベルは全利用者が確認する安全情報です。RLSに左右されないサーバー専用キーで値だけを取得します。
    const supabase = createSupabaseClient(
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
    const { data, error } = await supabase.from('disaster_regions').select('level').order('level_updated_at', { ascending: false }).limit(1).maybeSingle()
    if (error) throw error
    return NextResponse.json({ level: Number(data?.level ?? 1) })
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    return NextResponse.json({ error: code === 'AUTH_REQUIRED' ? 'ログインが必要です' : '地域レベルを取得できませんでした' }, { status: code === 'AUTH_REQUIRED' ? 401 : 500 })
  }
}
