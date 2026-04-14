import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, Target } from 'lucide-react'
import { SubFunctionSchedules } from '@/components/scheduling/SubFunctionSchedules'

export default function DashboardSubFuncao() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel de Apoio</h1>
        <p className="text-muted-foreground">Acompanhamento das tarefas e objetivos delegados.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-md transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Ativas</CardTitle>
            <ClipboardList className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Processos em andamento</p>
          </CardContent>
        </Card>
        <Card className="shadow-md transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objetivos Concluídos</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">Registrados nesta semana</p>
          </CardContent>
        </Card>
      </div>

      <SubFunctionSchedules />
    </div>
  )
}
