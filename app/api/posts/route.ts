import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/supabase/server'

const schema = z.object({ title: z.string().trim().min(1).max(160), category: z.string().min(1).max(40), quantity: z.string().trim().min(1).max(80), place: z.string().trim().min(1).max(200), urgency: z.coerce.number().int().min(1).max(5), description: z.string().max(5000).optional(), disaster_type: z.string().min(1).max(40), tags: z.array(z.string().trim().min(1).max(50)).max(100).default([]) })

export async function GET(request: Request) {
  try {
    const { supabase } = await requireUser()
    const search = new URL(request.url).searchParams.get('q')?.trim()
    let query = supabase.from('posts').select('id,title,category,quantity,place,urgency,description,status,disaster_type,created_at,user_id').eq('is_hidden', false).order('created_at', { ascending: false }).limit(100)
    if (search) query = query.or(`title.ilike.%${search}%,place.ilike.%${search}%,description.ilike.%${search}%`)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) { return NextResponse.json({ error: error instanceof Error && error.message === 'AUTH_REQUIRED' ? 'ログインが必要です' : '投稿を取得できませんでした' }, { status: 401 }) }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser()
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: '入力内容を確認してください' }, { status: 400 })
    const { data, error } = await supabase.from('posts').insert({ ...parsed.data, user_id: user.id, post_type: 'request', status: 'open' }).select('id,title,status,created_at').single()
    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) { const status = error instanceof Error && error.message === 'AUTH_REQUIRED' ? 401 : 500; return NextResponse.json({ error: status === 401 ? 'ログインが必要です' : '投稿を保存できませんでした' }, { status }) }
}
