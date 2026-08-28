import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/supabase/server'

/**
 * 現在の地域レベルを返す読み取り専用APIです。
 * 地域レベルはUIの状態ではなく、サーバーから取得した値を表示します。
 */
export async function GET() {
  try {
    const { supabase } = await requireUser()
    const { data, error } = await supabase.from('disaster_regions').select('level').order('level_updated_at', { ascending: false }).limit(1).maybeSingle()
    if (error) throw error
    return NextResponse.json({ level: Number(data?.level ?? 1) })
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    return NextResponse.json({ error: code === 'AUTH_REQUIRED' ? 'ログインが必要です' : '地域レベルを取得できませんでした' }, { status: code === 'AUTH_REQUIRED' ? 401 : 500 })
  }
}
