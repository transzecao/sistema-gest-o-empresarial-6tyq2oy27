import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Activity, List } from 'lucide-react'

export default function DashboardSubFuncao() {
  const { user } = useAuth()
  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-primary">
        Bem-vindo, {user?.name || 'Sub-função'}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lançamentos Assistidos</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">14</div>
            <p className="text-xs text-secondary">nesta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <List className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">2</div>
            <p className="text-xs text-secondary">requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividades Restritas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-secondary">
            Você está acessando o sistema com perfil de sub-função. Suas ações estão limitadas aos
            lançamentos assistidos.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
