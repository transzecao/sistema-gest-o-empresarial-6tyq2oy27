import { RoutingTable } from '@/components/routing/RoutingTable'

export default function RoutingPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in-up h-[calc(100vh-4rem)]">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mesa de Roteirização</h1>
          <p className="text-muted-foreground">
            Organize as coletas arrastando os cards para a rota.
          </p>
        </div>
      </div>
      <RoutingTable />
    </div>
  )
}
