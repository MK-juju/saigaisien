import { NextResponse } from 'next/server'

/**
 * 災害レベルの唯一の情報源です。UIのデモ状態ではなく、サーバー環境変数を読みます。
 * 未設定時は安全側のLv.2として扱い、マッチングを誤って開放しません。
 */
export async function GET() {
  const raw = Number.parseInt(process.env.DISASTER_LEVEL ?? '2', 10)
  const level = Number.isFinite(raw) ? Math.min(3, Math.max(0, raw)) : 2
  return NextResponse.json({ level })
}
