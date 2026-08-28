import { requireUser } from '@/lib/supabase/server'

export async function requireAdmin() {
  const ctx = await requireUser()
  const isAdmin = ctx.user.app_metadata?.role === 'admin' || ctx.user.app_metadata?.is_admin === true
  if (!isAdmin) throw new Error('FORBIDDEN')
  return ctx
}

export function assertLevel(level: number, capability: 'matching' | 'direct_delivery') {
  if (capability === 'matching' && level > 1) throw new Error('CAPABILITY_LOCKED')
  if (capability === 'direct_delivery' && level >= 3) throw new Error('CAPABILITY_LOCKED')
}
