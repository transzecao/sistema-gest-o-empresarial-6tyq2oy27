import pb from '@/lib/pocketbase/client'

export interface AuditLogPayload {
  action: string
  resource_type: string
  resource_id?: string
  details?: any
  old_value?: string
  new_value?: string
  status?: 'SUCCESS' | 'FAILED' | 'UNAUTHORIZED'
  reason?: string
  document_id?: string
}

/**
 * Centralized service to log successes, failures, and unauthorized access attempts.
 * Automatically captures the current authenticated user's ID and role.
 */
export async function logUnauthorizedAccess(action: string, details?: any) {
  return createAuditLog({
    action,
    resource_type: 'SYSTEM',
    status: 'UNAUTHORIZED',
    details,
  })
}

export async function getAuditLogs() {
  return pb.collection('audit_logs').getFullList({
    sort: '-created',
    expand: 'user_id',
  })
}

export async function createAuditLog(payload: AuditLogPayload) {
  const user = pb.authStore.record
  if (!user) {
    console.warn('Cannot create audit log: No authenticated user')
    return null
  }

  try {
    const record = await pb.collection('audit_logs').create({
      user_id: user.id,
      role: user.role || 'UNKNOWN_ROLE',
      ...payload,
    })
    return record
  } catch (err) {
    console.error('Failed to write audit log to database', err)
    return null
  }
}
