import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao Workspace</h1>
        <p className="text-muted-foreground">Visão geral do sistema.</p>
      </div>

      <Card className="border-t-4 border-t-primary shadow-md">
        <CardHeader className="flex flex-row items-center space-x-2">
          <Home className="h-6 w-6 text-primary" />
          <CardTitle>Início Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Seu perfil atual não possui um painel específico configurado. Utilize o menu lateral
            para navegar entre os módulos disponíveis do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
