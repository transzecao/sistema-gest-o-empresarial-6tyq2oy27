import { FleetCostsForm } from '@/components/cpk/FleetCostsForm'
import { AdminPanelDialog } from '@/components/cpk/admin/AdminPanelDialog'
import { MonthlySnapshots } from '@/components/cpk/MonthlySnapshots'
import { SupervisorSettings } from '@/components/scheduling/SupervisorSettings'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RulesEngine } from '@/components/quotations/RulesEngine'
import { QuotationHistory } from '@/components/quotations/QuotationHistory'

export default function DashboardSupervisor() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Portal do Supervisor Financeiro
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Área de supervisão, auditoria e motor de preços. Configure as regras de cotação e
            gerencie a frota.
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 flex flex-wrap gap-2 h-auto bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-muted/50"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="quotation_rules"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-muted/50"
          >
            Regras do Motor (DNA)
          </TabsTrigger>
          <TabsTrigger
            value="quotation_history"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-muted/50"
          >
            Cotações Geradas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-6 animate-fade-in-up">
          <SupervisorSettings />
          <FleetCostsForm />
          <MonthlySnapshots />
        </TabsContent>

        <TabsContent value="quotation_rules" className="animate-fade-in-up">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <RulesEngine />
          </div>
        </TabsContent>

        <TabsContent value="quotation_history" className="animate-fade-in-up">
          <QuotationHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
