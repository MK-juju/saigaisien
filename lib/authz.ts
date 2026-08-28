import { requireUser } from '@/lib/supabase/server'

export async function requireAdmin() {
  const ctx = await requireUser()
  // Supabaseの本番権限はapp_metadataを優先し、開発時に付与済みのuser_metadataも後方互換で確認します。
  // クライアントから送られた値は参照せず、必ず検証済みセッションのユーザー情報だけを使います。
  const appMetadata = ctx.user.app_metadata ?? {}
  const userMetadata = ctx.user.user_metadata ?? {}
  const isAdmin =
    appMetadata.role === 'admin' ||
    appMetadata.is_admin === true ||
    userMetadata.role === 'admin' ||
    userMetadata.is_admin === true
  if (!isAdmin) throw new Error('FORBIDDEN')
  return ctx
}

export function assertLevel(level: number, capability: 'matching' | 'direct_delivery') {
  if (capability === 'matching' && level > 1) throw new Error('CAPABILITY_LOCKED')
  if (capability === 'direct_delivery' && level >= 3) throw new Error('CAPABILITY_LOCKED')
}
