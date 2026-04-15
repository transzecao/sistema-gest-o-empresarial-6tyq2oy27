import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function Index() {
  const navigate = useNavigate()
  const { user, profile, signIn, signInWithGoogle, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const routeUser = (record: any) => {
    const role = record?.role || record?.expand?.profile_id?.name || ''
    switch (role) {
      case 'Diretor':
        navigate('/dashboard/diretor')
        break
      case 'Supervisor Financeiro':
        navigate('/portal-supervisor')
        break
      case 'Funcionário':
      case 'Funcionario_Financeiro':
      case 'Funcionario_Operacional':
      case 'Funcionario_Prospeccao':
        navigate('/dashboard/funcionario')
        break
      case 'Cliente':
        navigate('/portal-cliente')
        break
      default:
        navigate('/dashboard')
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      routeUser(user)
    }
  }, [user, profile, authLoading, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      setLoading(true)
      try {
        const { error, record } = await signIn(email, password)
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Erro de autenticação',
            description: error.message || 'E-mail ou senha inválidos',
          })
        } else {
          routeUser(record)
        }
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Erro de autenticação',
          description: 'E-mail ou senha inválidos',
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error, record } = await signInWithGoogle()
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro de autenticação',
          description: error.message || 'Falha ao autenticar com Google',
        })
      } else {
        routeUser(record)
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: 'Falha ao autenticar com Google',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-[#800020] p-3 rounded-xl mb-4 shadow-lg">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#5c0017]">Transzecão</h1>
          <p className="text-secondary mt-2">Gestão Empresarial</p>
        </div>

        <Card className="border-t-4 border-t-[#800020] shadow-xl">
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>
              Insira suas credenciais ou use o Google para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-2 hover:bg-slate-50 transition-all font-medium flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Entrar com Google
                </>
              )}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou entre com e-mail</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@transzecao.com.br"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white text-black"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white text-black"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full text-md h-11 transition-all hover:scale-[1.02] bg-[#5c0017] hover:bg-[#800020] text-white"
                disabled={!email || !password || loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="text-sm text-muted-foreground w-full">
              <p>
                <strong>Contas de teste:</strong>
              </p>
              <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                <li>diretor@transzecao.com</li>
                <li>supervisor@transzecao.com</li>
                <li>funcionario@transzecao.com</li>
              </ul>
              <p className="mt-2 text-xs">
                Senha:{' '}
                <code className="bg-gray-200 px-1 rounded text-black font-semibold">Skip@2026</code>
              </p>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-secondary">
          © {new Date().getFullYear()} Transzecão - Gestão Empresarial
        </p>
      </div>
    </div>
  )
}
