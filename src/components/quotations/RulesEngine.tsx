import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RulesList } from './RulesList'
import { ClustersList } from './ClustersList'

export function RulesEngine() {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Motor de Precificação (DNA)</h2>
        <p className="text-muted-foreground">
          Gerencie as taxas de transporte, GRIS, Ad Valorem, ICMS e restrições de Cluster.
        </p>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="rules">Regras de Preço</TabsTrigger>
          <TabsTrigger value="clusters">Clusters & Mínimos</TabsTrigger>
        </TabsList>
        <TabsContent value="rules" className="mt-4">
          <RulesList />
        </TabsContent>
        <TabsContent value="clusters" className="mt-4">
          <ClustersList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
