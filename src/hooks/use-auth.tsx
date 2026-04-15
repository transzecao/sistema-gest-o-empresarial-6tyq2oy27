import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

export interface AuthContextType {
  user: any
  profile: any
  signIn: (email: string, password: string) => Promise<{ error: any; record?: any }>
  signInWithGoogle: () => Promise<{ error: any; record?: any }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.record)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const loadProfile = async (record: any) => {
      if (record?.profile_id) {
        try {
          const p = await pb.collection('profiles').getOne(record.profile_id)
          if (isMounted) setProfile(p)
        } catch (e) {
          if (isMounted) setProfile(null)
        }
      } else {
        if (isMounted) setProfile(null)
      }
      if (isMounted) setLoading(false)
    }

    loadProfile(pb.authStore.record)

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(record)
      loadProfile(record)
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const logLogin = async (record: any, email: string) => {
    try {
      await pb.collection('audit_logs').create({
        user_id: record.id,
        action: 'LOGIN',
        resource_type: 'AUTH',
        details: { email },
      })
    } catch (e) {
      console.error('Failed to create audit log', e)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const authData = await pb
        .collection('users')
        .authWithPassword(email, password, { expand: 'profile_id' })

      if (authData.record.active === false) {
        pb.authStore.clear()
        return { error: new Error('Usuário inativo. Acesso bloqueado.') }
      }

      await logLogin(authData.record, email)
      return { error: null, record: authData.record }
    } catch (error) {
      console.error('Authentication failed:', error)
      return { error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const authData = await pb
        .collection('users')
        .authWithOAuth2({ provider: 'google', expand: 'profile_id' })

      if (authData.record.active === false) {
        pb.authStore.clear()
        return { error: new Error('Usuário inativo. Acesso bloqueado.') }
      }

      await logLogin(authData.record, authData.record.email)
      return { error: null, record: authData.record }
    } catch (error) {
      console.error('Google authentication failed:', error)
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider value={{ user, profile, signIn, signInWithGoogle, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
