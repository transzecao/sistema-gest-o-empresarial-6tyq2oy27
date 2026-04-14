import { FleetCostsForm } from '@/components/cpk/FleetCostsForm'
import { MonthlySnapshots } from '@/components/cpk/MonthlySnapshots'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuotationForm } from '@/components/quotations/QuotationForm'
import { QuotationHistory } from '@/components/quotations/QuotationHistory'

export default function DashboardFuncionario() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Portal do Funcionário
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Área operacional para geração de cotações, gestão de frota e acompanhamento de
            indicadores.
          </p>
        </div>
        <div className="shrink-0 flex gap-2">
          <Button asChild className="bg-primary text-primary-foreground shadow-sm">
            <Link to="/dashboard/routing">Mesa de Roteirização</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="quotes" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="quotes">Cotação de Frete</TabsTrigger>
          <TabsTrigger value="fleet">Gestão de Frota (CPK)</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="grid gap-6 lg:grid-cols-2 items-start">
          <QuotationForm />
          <QuotationHistory />
        </TabsContent>

        <TabsContent value="fleet" className="grid gap-6">
          <FleetCostsForm />
          <MonthlySnapshots />
        </TabsContent>
      </Tabs>
    </div>
  )
}
