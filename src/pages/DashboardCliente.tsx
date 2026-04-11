import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ShoppingCart, Map, Clock } from 'lucide-react'

export default function DashboardCliente() {
  const { user } = useAuth()
  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-primary">
        Bem-vindo, {user?.name || 'Cliente'}
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Ativos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">2</div>
            <p className="text-xs text-secondary">em trânsito</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <Map className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">Hoje, 09:41</div>
            <p className="text-xs text-secondary">São Paulo, SP</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Histórico</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">45</div>
            <p className="text-xs text-secondary">entregas concluídas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portal do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-secondary">
            Acompanhe seus pedidos em tempo real e acesse o histórico completo de serviços prestados
            pela Transzecão.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
