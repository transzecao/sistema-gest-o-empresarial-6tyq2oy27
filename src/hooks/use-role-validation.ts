import { useMemo } from 'react'
import { useAuth } from './use-auth'

export function useRoleValidation() {
  const { user, loading } = useAuth()

  const permissions = useMemo(() => {
    if (loading) {
      return { canConfigure: false, canViewAudit: false, canOperate: false, isReady: false }
    }

    if (!user) {
      return { canConfigure: false, canViewAudit: false, canOperate: false, isReady: true }
    }

    const role = user.role || ''

    // As per specifications
    const isSupervisor = role === 'Supervisor Financeiro'
    const isFuncionario = role === 'Funcionário Financeiro'

    return {
      canConfigure: isSupervisor,
      canViewAudit: isSupervisor,
      canOperate: isFuncionario || isSupervisor, // Operational tasks are allowed for both
      isReady: true,
    }
  }, [user, loading])

  return permissions
}
