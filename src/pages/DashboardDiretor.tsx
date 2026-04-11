import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Activity, Users, TrendingUp } from 'lucide-react'

export default function DashboardDiretor() {
  const { user } = useAuth()
  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-primary">
        Bem-vindo, {user?.name || 'Diretor'}
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Métricas Globais</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">+24%</div>
            <p className="text-xs text-secondary">em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipes Ativas</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">12</div>
            <p className="text-xs text-secondary">supervisores em operação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">100%</div>
            <p className="text-xs text-secondary">operações normais</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão Executiva</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-secondary">
            Acesse as configurações avançadas e gerencie a hierarquia da empresa pelo menu lateral.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
