export type Role = 'Diretor' | 'Supervisor' | 'Funcionário' | 'Sub-função' | 'Cliente'

export const login = (role: Role) => {
  localStorage.setItem('user_role', role)
  localStorage.setItem('auth_token', 'mock_token_transzecao_123')
}

export const logout = () => {
  localStorage.removeItem('user_role')
  localStorage.removeItem('auth_token')
}

export const getRole = (): Role | null => {
  return localStorage.getItem('user_role') as Role | null
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token')
}
