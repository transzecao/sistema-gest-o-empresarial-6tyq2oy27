import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRoleValidation } from '@/hooks/use-role-validation'
import { Lock } from 'lucide-react'
import { VehiclesTab } from './tabs/VehiclesTab'
import { LinksTab } from './tabs/LinksTab'
import { HQTab } from './tabs/HQTab'
import { TaxesTab } from './tabs/TaxesTab'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function FleetManagement() {
  const { canConfigure, canOperate, isReady } = useRoleValidation()

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const canEdit = canConfigure || canOperate

  if (!canEdit) {
    return (
      <Card className="max-w-md mx-auto mt-8 border-destructive/50 bg-destructive/5">
        <CardContent className="pt-8 flex flex-col items-center text-center">
          <div className="p-4 bg-destructive/10 rounded-full mb-4">
            <Lock className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-destructive mb-2">Acesso Restrito</h2>
          <p className="text-sm text-destructive/90">
            Você não tem permissão para acessar o Gerenciamento de Frota. Apenas Funcionários
            Financeiros e Supervisores podem configurar estes parâmetros.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full mt-6 shadow-sm">
      <CardHeader className="bg-muted/30 border-b">
        <CardTitle className="text-xl">Gestão de Frota e Parâmetros CPK</CardTitle>
        <CardDescription>
          Gerencie o cadastro de veículos, vínculos operacionais, custos de sede e impostos para
          garantir um cálculo de custo por quilômetro (CPK) preciso.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="vehicles" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="vehicles">Veículos</TabsTrigger>
            <TabsTrigger value="links">Vínculos Operacionais</TabsTrigger>
            <TabsTrigger value="hq">Custos de Sede</TabsTrigger>
            <TabsTrigger value="taxes">Tributação e Operacional</TabsTrigger>
          </TabsList>
          <TabsContent value="vehicles" className="min-h-[400px]">
            <VehiclesTab />
          </TabsContent>
          <TabsContent value="links" className="min-h-[400px]">
            <LinksTab />
          </TabsContent>
          <TabsContent value="hq" className="min-h-[400px]">
            <HQTab />
          </TabsContent>
          <TabsContent value="taxes" className="min-h-[400px]">
            <TaxesTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
