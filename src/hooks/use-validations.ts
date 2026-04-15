import { useCallback } from 'react'

export function useCNPJValidation() {
  return useCallback((val: string) => {
    if (!val) return ''
    let v = val.replace(/\D/g, '').slice(0, 14)
    if (v.length > 12) return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5')
    if (v.length > 8) return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4}).*/, '$1.$2.$3/$4')
    if (v.length > 5) return v.replace(/^(\d{2})(\d{3})(\d{1,3}).*/, '$1.$2.$3')
    if (v.length > 2) return v.replace(/^(\d{2})(\d{1,3}).*/, '$1.$2')
    return v
  }, [])
}

export function useCPFValidation() {
  return useCallback((val: string) => {
    if (!val) return ''
    let v = val.replace(/\D/g, '').slice(0, 11)
    if (v.length > 9) return v.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4')
    if (v.length > 6) return v.replace(/^(\d{3})(\d{3})(\d{1,3}).*/, '$1.$2.$3')
    if (v.length > 3) return v.replace(/^(\d{3})(\d{1,3}).*/, '$1.$2')
    return v
  }, [])
}

export function useTelefoneValidation() {
  return useCallback((val: string) => {
    if (!val) return ''
    let v = val.replace(/\D/g, '').slice(0, 11)
    if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
    if (v.length > 6) return v.replace(/^(\d{2})(\d{4,5})(\d{0,4}).*/, '($1) $2-$3')
    if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
    return v
  }, [])
}
