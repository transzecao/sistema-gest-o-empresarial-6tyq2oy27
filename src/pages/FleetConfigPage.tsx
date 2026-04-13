import { FleetManagement } from '@/components/cpk/FleetManagement'

export default function FleetConfigPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Configuração de Frota</h1>
        <p className="text-muted-foreground">
          Ajuste os parâmetros dos veículos, impostos e vínculos operacionais essenciais para a
          composição dos custos da sua transportadora.
        </p>
      </div>
      <FleetManagement />
    </div>
  )
}
