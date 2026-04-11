import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export default function DashboardSupervisor() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel do Supervisor</h1>
        <p className="text-muted-foreground">Gestão de equipe e aprovações pendentes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-md transition-all hover:shadow-lg border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovações Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Formulários aguardando revisão</p>
          </CardContent>
        </Card>
        <Card className="shadow-md transition-all hover:shadow-lg border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos Hoje</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Aprovações finalizadas</p>
          </CardContent>
        </Card>
        <Card className="shadow-md transition-all hover:shadow-lg border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas da Equipe</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Atenção imediata requerida</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
