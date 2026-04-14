import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Truck, CheckCircle } from 'lucide-react'
import { ScheduleForm } from '@/components/scheduling/ScheduleForm'
import { CustomerSchedules } from '@/components/scheduling/CustomerSchedules'

export default function DashboardCliente() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portal do Cliente</h1>
        <p className="text-muted-foreground">
          Acompanhamento e rastreio de pedidos e entregas com timeline em tempo real.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-md transition-all hover:shadow-lg border-t-4 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Ativos</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Em fase de processamento</p>
          </CardContent>
        </Card>
        <Card className="shadow-md transition-all hover:shadow-lg border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Rota de Entrega</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Com previsão para hoje</p>
          </CardContent>
        </Card>
        <Card className="shadow-md transition-all hover:shadow-lg border-t-4 border-t-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Histórico total no sistema</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr] items-start">
        <Card className="shadow-md h-fit">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg">Novo Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ScheduleForm />
          </CardContent>
        </Card>

        <Card className="shadow-md h-fit">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg">Meus Agendamentos</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 bg-muted/5">
            <CustomerSchedules />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
