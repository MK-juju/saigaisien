import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/authz'

const schema = z.object({ region_code: z.string().trim().min(1).max(100), level: z.coerce.number().int().min(0).max(3) })
export async function PATCH(request: Request) {
  try {
    const { supabase } = await requireAdmin()
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: '入力内容を確認してください' }, { status: 400 })
    const { data, error } = await supabase.from('disaster_regions').upsert({ ...parsed.data, manual_level: parsed.data.level, updated_at: new Date().toISOString() }, { onConflict: 'region_code' }).select().single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) { const code = error instanceof Error ? error.message : ''; return NextResponse.json({ error: code === 'AUTH_REQUIRED' ? 'ログインが必要です' : code === 'FORBIDDEN' ? '管理者権限が必要です' : '更新できませんでした' }, { status: code === 'FORBIDDEN' ? 403 : 401 }) }
}
