import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function Index() {
  const navigate = useNavigate()
  const { user, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      setLoading(true)
      setErrorMsg('')
      const { error } = await signIn(email, password)
      if (error) {
        setErrorMsg(getErrorMessage(error))
        setLoading(false)
      } else {
        navigate('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-primary p-3 rounded-xl mb-4 shadow-lg">
            <Truck className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Transzecão</h1>
          <p className="text-secondary mt-2">Gestão Empresarial</p>
        </div>

        <Card className="border-t-4 border-t-primary shadow-xl">
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>Insira suas credenciais para continuar.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md font-medium border border-red-100">
                  {errorMsg}
                </div>
              )}
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
              <div className="text-sm text-muted-foreground pt-2">
                <p>
                  <strong>Contas de teste:</strong>
                </p>
                <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                  <li>director@transzecao.com</li>
                  <li>supervisor@transzecao.com</li>
                  <li>employee@transzecao.com</li>
                  <li>sub@transzecao.com</li>
                  <li>client@transzecao.com</li>
                </ul>
                <p className="mt-2 text-xs">
                  Senha:{' '}
                  <code className="bg-gray-200 px-1 rounded text-black font-semibold">
                    Skip@Pass123
                  </code>
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full text-md h-11 transition-all hover:scale-[1.02]"
                disabled={!email || !password || loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar no Workspace'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-sm text-secondary">
          © {new Date().getFullYear()} Transzecão - Gestão Empresarial
        </p>
      </div>
    </div>
  )
}
