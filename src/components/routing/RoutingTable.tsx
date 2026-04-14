import { useState, useEffect } from 'react'
import {
  getAgendamentos,
  updateAgendamentoStatus,
  roteirizarAgendamentos,
} from '@/services/agendamentos'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { X, Undo2, ArrowRight } from 'lucide-react'
import { ExceptionModal } from '../scheduling/ExceptionModal'

const PRIORITY_COLORS: Record<string, string> = {
  Urgente: 'border-l-4 border-l-[#800000]',
  Manhã: 'border-l-4 border-l-[#0000FF]',
  Tarde: 'border-l-4 border-l-[#FFFF00]',
  Comercial: 'border-l-4 border-l-[#808080]',
}
const PRIORITY_BADGES: Record<string, string> = {
  Urgente: 'bg-[#800000] text-white hover:bg-[#800000]/90',
  Manhã: 'bg-[#0000FF] text-white hover:bg-[#0000FF]/90',
  Tarde: 'bg-[#FFFF00] text-black hover:bg-[#FFFF00]/90',
  Comercial: 'bg-[#808080] text-white hover:bg-[#808080]/90',
}

function DraggableScheduleCard({ schedule, onReturn, onReject }: any) {
  const isEntrega = schedule.fase_atual === 'Entrega'
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('scheduleId', schedule.id)}
      className={cn(
        'bg-card border rounded-md p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative',
        PRIORITY_COLORS[schedule.prioridade] || PRIORITY_COLORS['Comercial'],
      )}
    >
      {isEntrega && (
        <Badge variant="secondary" className="absolute -top-2 -right-2 text-[10px] shadow-sm">
          P/ Entrega
        </Badge>
      )}

      <div className="flex justify-between items-start mb-2">
        <Badge
          className={cn(
            'text-[10px] uppercase font-bold',
            PRIORITY_BADGES[schedule.prioridade] || PRIORITY_BADGES['Comercial'],
          )}
        >
          {schedule.prioridade}
        </Badge>
        <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded border border-muted-foreground/10">
          NF: {schedule.numero_nota_fiscal}
        </span>
      </div>
      <div className="space-y-2 mb-3">
        <p
          className="text-sm font-medium leading-tight line-clamp-2"
          title={schedule.endereco_destino}
        >
          {schedule.endereco_destino}
        </p>
        <p className="text-[11px] text-muted-foreground flex justify-between bg-muted/40 p-1.5 rounded">
          <span className="font-semibold">
            {schedule.quantidade_pacotes} vol • {schedule.peso}kg
          </span>
          <span
            className="truncate max-w-[130px] flex items-center gap-1"
            title={schedule.endereco_origem}
          >
            <ArrowRight className="h-3 w-3 shrink-0" /> {schedule.endereco_origem.split(',')[0]}
          </span>
        </p>
      </div>
      <div className="flex justify-between items-center gap-2 mt-2 pt-2 border-t">
        <ExceptionModal onReject={onReject} />
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-[10px] px-2 hover:bg-muted text-muted-foreground"
          onClick={onReturn}
        >
          <Undo2 className="h-3 w-3 mr-1" /> Devolver
        </Button>
      </div>
    </div>
  )
}

export function RoutingTable() {
  const [queue, setQueue] = useState<any[]>([])
  const [routeStops, setRouteStops] = useState<any[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    const data = await getAgendamentos(
      `status = "Aguardando Coleta" || status = "Aguardando Entrega"`,
    )
    const inRouteIds = new Set(routeStops.map((r) => r.id))
    setQueue(data.filter((q) => !inRouteIds.has(q.id)))
  }

  useEffect(() => {
    loadData()
  }, [])
  useEffect(() => {
    setQueue((prev) => {
      const inRouteIds = new Set(routeStops.map((r) => r.id))
      return prev.filter((q) => !inRouteIds.has(q.id))
    })
  }, [routeStops])

  useRealtime('agendamentos', loadData)

  const handleReturn = async (id: string) => {
    try {
      await updateAgendamentoStatus(id, 'Devolvido')
      toast({ title: 'Devolvido com sucesso' })
      setQueue(queue.filter((q) => q.id !== id))
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao devolver' })
    }
  }

  const handleReject = async (id: string, reason: string) => {
    try {
      await updateAgendamentoStatus(id, 'Rejeitado')
      toast({ title: `Agendamento rejeitado: ${reason}` })
      setQueue(queue.filter((q) => q.id !== id))
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao rejeitar' })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const id = e.dataTransfer.getData('scheduleId')
    const item = queue.find((q) => q.id === id)
    if (item) {
      setRouteStops([...routeStops, { ...item, horario_estimado: '08:00-18:00' }])
    }
  }

  const handleRemoveFromRoute = (id: string) => {
    const item = routeStops.find((r) => r.id === id)
    if (item) {
      setRouteStops(routeStops.filter((r) => r.id !== id))
      setQueue([...queue, item])
    }
  }

  const setTimeSlot = (id: string, slot: string) => {
    setRouteStops(routeStops.map((r) => (r.id === id ? { ...r, horario_estimado: slot } : r)))
  }

  const handleRoteirizar = async () => {
    if (routeStops.length === 0) return
    const tipoRota = routeStops[0].fase_atual === 'Entrega' ? 'Entrega' : 'Coleta'

    try {
      await roteirizarAgendamentos(routeStops, { tipo_rota: tipoRota })
      toast({
        title: 'Rota processada no Trafegus com sucesso!',
        description: 'Motorista foi notificado e webhook armado.',
      })
      setRouteStops([])
      loadData()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao roteirizar (Trafegus API)' })
    }
  }

  const priorityOrder: Record<string, number> = { Urgente: 1, Manhã: 2, Tarde: 3, Comercial: 4 }
  const sortedQueue = [...queue].sort(
    (a, b) => (priorityOrder[a.prioridade] || 99) - (priorityOrder[b.prioridade] || 99),
  )

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6 h-full pb-8">
      <Card className="flex flex-col h-[650px] border-t-4 border-t-primary shadow-lg">
        <CardHeader className="pb-3 shrink-0 bg-muted/10 border-b">
          <CardTitle className="text-lg flex justify-between items-center">
            Fila Operacional
            <Badge variant="secondary" className="px-2.5 py-0.5 text-sm">
              {queue.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden bg-muted/5">
          <ScrollArea className="h-full px-4 pt-4 pb-4">
            <div className="space-y-4">
              {sortedQueue.map((q) => (
                <DraggableScheduleCard
                  key={q.id}
                  schedule={q}
                  onReturn={() => handleReturn(q.id)}
                  onReject={(reason: string) => handleReject(q.id, reason)}
                />
              ))}
              {queue.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed rounded-lg p-4 bg-background">
                  <p className="text-sm font-medium">Fila vazia</p>
                  <p className="text-xs">Nenhum agendamento pendente.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 h-[650px]">
        <Card className="shrink-0 h-[280px] relative overflow-hidden bg-slate-100 shadow-md">
          <img
            src="https://img.usecurling.com/p/1200/400?q=street%20map&color=gray"
            className="w-full h-full object-cover opacity-60 mix-blend-multiply"
            alt="Map mockup"
          />
          {routeStops.map((stop, i) => (
            <div
              key={stop.id}
              className="absolute flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full font-bold shadow-lg text-sm border-2 border-white transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
              style={{ top: `${30 + i * 15}%`, left: `${25 + (i % 3) * 20}%` }}
            >
              {i + 1}
            </div>
          ))}
          {routeStops.length > 0 && (
            <div className="absolute bottom-4 left-4 bg-background/95 p-3 rounded-md shadow-md backdrop-blur-sm text-sm font-medium border flex gap-4 items-center">
              <div>
                <span className="text-muted-foreground text-xs block">Paradas</span>
                <span className="text-lg">{routeStops.length}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div>
                <span className="text-muted-foreground text-xs block">Volume Total</span>
                <span className="text-lg">
                  {routeStops.reduce((acc, curr) => acc + (curr.peso || 0), 0).toFixed(1)}kg
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card className="flex-1 flex flex-col min-h-0 border-primary/30 border-2 shadow-md">
          <CardHeader className="py-3 shrink-0 bg-muted/30 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  {routeStops.length}
                </span>
                Construtor de Rota (Trafegus)
              </CardTitle>
              <Button
                onClick={handleRoteirizar}
                disabled={routeStops.length === 0}
                size="sm"
                className="shadow-sm font-semibold"
              >
                Roteirizar {routeStops.length > 0 && `(${routeStops.length})`}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
            <div
              className={cn(
                'flex-1 p-4 overflow-y-auto transition-colors',
                isDragOver
                  ? 'bg-primary/5 border-2 border-primary/50 border-dashed m-2 rounded-lg'
                  : 'bg-muted/5',
              )}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              {routeStops.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg text-muted-foreground text-sm bg-background">
                  <ArrowRight className="h-8 w-8 mb-2 opacity-50" />
                  Arraste os cards da fila para montar a sequência
                </div>
              ) : (
                <div className="space-y-3">
                  {routeStops.map((stop, i) => (
                    <div
                      key={stop.id}
                      className={cn(
                        'flex items-center gap-3 bg-card border rounded-md p-3 shadow-sm hover:shadow transition-shadow relative',
                        PRIORITY_COLORS[stop.prioridade],
                      )}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-xs font-bold shrink-0 border border-muted-foreground/20">
                        {i + 1}º
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate leading-none mb-1.5"
                          title={stop.endereco_destino}
                        >
                          {stop.endereco_destino}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex gap-2 items-center">
                          <span className="bg-muted px-1.5 py-0.5 rounded border">
                            NF: {stop.numero_nota_fiscal}
                          </span>
                          <span className="text-foreground font-medium">{stop.prioridade}</span>
                          {stop.fase_atual === 'Entrega' && (
                            <Badge variant="secondary" className="h-4 text-[9px] px-1">
                              Entrega
                            </Badge>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0 bg-muted/30 p-1.5 rounded-md border">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant={
                              stop.horario_estimado === '08:00-12:00' ? 'default' : 'outline'
                            }
                            className="text-[10px] h-6 px-1.5"
                            onClick={() => setTimeSlot(stop.id, '08:00-12:00')}
                          >
                            AM
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              stop.horario_estimado === '13:00-18:00' ? 'default' : 'outline'
                            }
                            className="text-[10px] h-6 px-1.5"
                            onClick={() => setTimeSlot(stop.id, '13:00-18:00')}
                          >
                            PM
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              stop.horario_estimado === '08:00-18:00' ? 'default' : 'outline'
                            }
                            className="text-[10px] h-6 px-1.5"
                            onClick={() => setTimeSlot(stop.id, '08:00-18:00')}
                          >
                            8-18h
                          </Button>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive shrink-0 hover:bg-destructive/10"
                        onClick={() => handleRemoveFromRoute(stop.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
