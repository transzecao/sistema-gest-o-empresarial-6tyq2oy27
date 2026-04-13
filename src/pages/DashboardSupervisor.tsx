import { FleetCostsForm } from '@/components/cpk/FleetCostsForm'
import { AdminPanelDialog } from '@/components/cpk/admin/AdminPanelDialog'
import { MonthlySnapshots } from '@/components/cpk/MonthlySnapshots'

export default function DashboardSupervisor() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Portal do Supervisor Financeiro
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Área de supervisão e auditoria. Verifique os indicadores da equipe e gerencie
            fechamentos excepcionais de frota.
          </p>
        </div>
        <AdminPanelDialog />
      </div>

      <div className="grid gap-6">
        <FleetCostsForm />
        <MonthlySnapshots />
      </div>
    </div>
  )
}
