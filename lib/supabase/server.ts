/** このファイルの役割と主要な処理フローを、実装の近くにコメントで説明しています。 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cookiesToSet) => { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} } } },
  )
}

export async function requireUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('AUTH_REQUIRED')
  return { supabase, user: data.user }
}

// BEGIN DEMO ACCESS: 未ログインのデモ役割にサーバー処理を付与します。公開時に削除する場合はこのコメントからENDまで削除します。
// デモCookieは画面操作用の識別子としてのみ使い、DB操作はサーバー側のservice roleクライアントで行います。
export async function requireUserOrDemo() {
  try {
    return await requireUser()
  } catch (error) {
    if (!(error instanceof Error) || error.message !== 'AUTH_REQUIRED') throw error
    const cookieStore = await cookies()
    // BEGIN DEMO ACCESS: アップロード環境でCookieが分離される場合も、ピン投稿画面から渡されたデモ識別子を利用します。公開時はこのブロックを削除します。
    const demoRole = cookieStore.get('yorisoi_demo_role')?.value
    const requestHeaders = await import('next/headers').then(({ headers }) => headers())
    const hasDemoHeader = requestHeaders.get('x-demo-access') === 'true'
    const resolvedDemoRole = demoRole ?? (hasDemoHeader ? 'victim' : undefined)
    if (!resolvedDemoRole || !['victim', 'supporter', 'admin'].includes(resolvedDemoRole)) throw error
    // END DEMO ACCESS
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
    if (!url || !key) throw new Error('DEMO_SERVER_CONFIG_MISSING')
    const serviceClient = createServerClient(url, key, { cookies: { getAll: () => [], setAll: () => undefined } })
    const { data: profile } = await serviceClient.from('profiles').select('id,role_type').eq('role_type', demoRole).limit(1).maybeSingle()
    if (!profile?.id) throw new Error('DEMO_PROFILE_MISSING')
    return { supabase: serviceClient, user: { id: profile.id }, demo: true as const }
  }
}
// END DEMO ACCESS
