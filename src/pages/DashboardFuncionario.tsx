import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Activity, Clock, CheckCircle } from 'lucide-react'

export default function DashboardFuncionario() {
  const { user } = useAuth()
  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-primary">
        Bem-vindo, {user?.name || 'Funcionário'}
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lançamentos Hoje</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">3</div>
            <p className="text-xs text-secondary">registros efetuados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Registradas</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">6h 30m</div>
            <p className="text-xs text-secondary">neste turno</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">Ativo</div>
            <p className="text-xs text-secondary">sem pendências</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Lançamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-secondary">
            Acompanhe seu histórico de lançamentos e status das aprovações.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
