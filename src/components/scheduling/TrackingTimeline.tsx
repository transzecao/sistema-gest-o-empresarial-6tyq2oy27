import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TrackingTimeline({ status }: { status: string }) {
  const steps = [
    { id: 'Aguardando Coleta', label: 'Coleta Agendada', icon: Clock },
    { id: 'Em Coleta', label: 'Em Coleta', icon: Package },
    { id: 'Aguardando Entrega', label: 'Aguardando Entrega', icon: Package },
    { id: 'Saiu para Entrega', label: 'Saiu para Entrega', icon: Truck },
    { id: 'Concluído', label: 'Entregue', icon: CheckCircle },
  ]

  const isCancelled = ['Cancelado', 'Rejeitado', 'Devolvido'].includes(status)

  if (isCancelled) {
    return (
      <div className="flex w-full items-center justify-center mt-4 text-destructive space-x-2 bg-destructive/10 p-3 rounded-lg border border-destructive/20">
        <XCircle className="h-5 w-5" />
        <span className="text-sm font-semibold">Agendamento {status}</span>
      </div>
    )
  }

  const currentIndex = steps.findIndex((s) => s.id === status)

  return (
    <div className="flex w-full items-center justify-between mt-6 mb-2">
      {steps.map((step, idx) => {
        const isActive = idx <= currentIndex
        const isCurrent = idx === currentIndex
        const Icon = step.icon
        return (
          <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center border-2 bg-background transition-colors',
                isActive ? 'border-primary text-primary' : 'border-muted text-muted-foreground',
                isCurrent ? 'ring-4 ring-primary/20 ring-offset-1' : '',
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span
              className={cn(
                'text-[10px] sm:text-xs text-center mt-2 font-medium max-w-[80px] leading-tight',
                isActive ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'absolute top-4 left-1/2 w-full h-[2px] -z-10',
                  idx < currentIndex ? 'bg-primary' : 'bg-muted',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
