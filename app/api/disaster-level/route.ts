import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * 災害レベルはサーバー側の値だけを信頼します。Lv.0は廃止し、Lv.1〜3で運用します。
 * 管理画面から変更した値は短期の管理Cookieへ反映し、再読込後も判定を揃えます。
 */
export async function GET() {
  const cookieLevel = (await cookies()).get('disaster-level')?.value
  const raw = Number.parseInt(cookieLevel ?? process.env.DISASTER_LEVEL ?? '1', 10)
  const level = Number.isFinite(raw) ? Math.min(3, Math.max(1, raw)) : 1
  return NextResponse.json({ level })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const level = Number(body.level)
  if (!Number.isInteger(level) || level < 1 || level > 3) {
    return NextResponse.json({ error: '災害レベルはLv.1〜Lv.3で指定してください' }, { status: 400 })
  }
  const response = NextResponse.json({ level })
  response.cookies.set('disaster-level', String(level), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
