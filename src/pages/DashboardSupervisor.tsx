import { FleetCostsForm } from '@/components/cpk/FleetCostsForm'
import { AdminPanelDialog } from '@/components/cpk/admin/AdminPanelDialog'
import { MonthlySnapshots } from '@/components/cpk/MonthlySnapshots'
import { SupervisorSettings } from '@/components/scheduling/SupervisorSettings'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function DashboardSupervisor() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Portal do Supervisor Financeiro
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Área de supervisão e auditoria. Verifique os indicadores da equipe, configure as regras
            de agendamento e gerencie frota.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            className="shadow-sm border-primary/20 hover:border-primary/50 text-primary"
          >
            <Link to="/dashboard/routing">Mesa de Roteirização</Link>
          </Button>
          <AdminPanelDialog />
        </div>
      </div>

      <div className="grid gap-6">
        <SupervisorSettings />
        <FleetCostsForm />
        <MonthlySnapshots />
      </div>
    </div>
  )
}
