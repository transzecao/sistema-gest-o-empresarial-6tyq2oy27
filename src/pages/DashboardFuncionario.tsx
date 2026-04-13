import { FleetCostsForm } from '@/components/cpk/FleetCostsForm'

export default function DashboardFuncionario() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Portal do Funcionário</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Área operacional para gestão de frota, acompanhamento de indicadores e execução do
          fechamento financeiro mensal.
        </p>
      </div>

      <div className="grid gap-6">
        <FleetCostsForm />
      </div>
    </div>
  )
}
