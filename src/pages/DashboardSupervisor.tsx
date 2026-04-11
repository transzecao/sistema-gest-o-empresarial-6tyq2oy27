import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FileText, CheckSquare, Users } from 'lucide-react'

export default function DashboardSupervisor() {
  const { user } = useAuth()
  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-primary">
        Bem-vindo, {user?.name || 'Supervisor'}
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formulários Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">5</div>
            <p className="text-xs text-secondary">aguardando revisão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovações Hoje</CardTitle>
            <CheckSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">18</div>
            <p className="text-xs text-secondary">registros processados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipe</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">8</div>
            <p className="text-xs text-secondary">funcionários online</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestão de Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-secondary">
            Analise as métricas da sua equipe e valide os formulários pendentes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
