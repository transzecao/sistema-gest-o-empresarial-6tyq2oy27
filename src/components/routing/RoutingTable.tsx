import { useState, useEffect } from 'react'
import { getSchedules, updateScheduleStatus } from '@/services/schedules'
import { createRoute } from '@/services/routes'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { X, Undo2 } from 'lucide-react'

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

function DraggableScheduleCard({ schedule, onReturn }: any) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('scheduleId', schedule.id)}
      className={cn(
        'bg-card border rounded-md p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow',
        PRIORITY_COLORS[schedule.priority] || PRIORITY_COLORS['Comercial'],
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <Badge
          className={cn(
            'text-[10px] uppercase font-bold',
            PRIORITY_BADGES[schedule.priority] || PRIORITY_BADGES['Comercial'],
          )}
        >
          {schedule.priority}
        </Badge>
        <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
          NF: {schedule.invoice_nf}
        </span>
      </div>
      <div className="space-y-1 mb-3">
        <p className="text-sm font-medium leading-tight line-clamp-2" title={schedule.dest_address}>
          {schedule.dest_address}
        </p>
        <p className="text-xs text-muted-foreground flex justify-between">
          <span>
            {schedule.package_qty} vol • {schedule.weight}kg
          </span>
          <span className="truncate max-w-[120px]" title={schedule.origin_address}>
            De: {schedule.origin_address}
          </span>
        </p>
      </div>
      <div className="flex justify-end">
        <Button size="sm" variant="secondary" className="h-7 text-[10px] px-2" onClick={onReturn}>
          <Undo2 className="h-3 w-3 mr-1" /> Devolver p/ Sub-Função
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
    const data = await getSchedules(`status = "Fila"`)
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

  useRealtime('schedules', loadData)

  const handleReturn = async (id: string) => {
    try {
      await updateScheduleStatus(id, 'Devolvido')
      toast({ title: 'Devolvido com sucesso' })
      setQueue(queue.filter((q) => q.id !== id))
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao devolver' })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const id = e.dataTransfer.getData('scheduleId')
    const item = queue.find((q) => q.id === id)
    if (item) {
      setRouteStops([...routeStops, item])
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
    setRouteStops(routeStops.map((r) => (r.id === id ? { ...r, time_slot: slot } : r)))
  }

  const handleRoteirizar = async () => {
    if (routeStops.length === 0) return
    try {
      await createRoute({
        date: new Date().toISOString(),
        stop_sequence: routeStops.map((r) => r.id),
      })
      for (const stop of routeStops) {
        await updateScheduleStatus(stop.id, 'Roteirizado', stop.time_slot)
      }
      toast({ title: 'Rota finalizada e enviada!' })
      setRouteStops([])
      loadData()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao roteirizar' })
    }
  }

  const priorityOrder: Record<string, number> = { Urgente: 1, Manhã: 2, Tarde: 3, Comercial: 4 }
  const sortedQueue = [...queue].sort(
    (a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99),
  )

  return (
    <div className="grid lg:grid-cols-[350px_1fr] gap-6 h-full pb-8">
      <Card className="flex flex-col h-[600px] border-t-4 border-t-primary">
        <CardHeader className="pb-3 shrink-0">
          <CardTitle className="text-lg">Agendamentos em Fila ({queue.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 pb-4">
            <div className="space-y-3">
              {sortedQueue.map((q) => (
                <DraggableScheduleCard
                  key={q.id}
                  schedule={q}
                  onReturn={() => handleReturn(q.id)}
                />
              ))}
              {queue.length === 0 && (
                <p className="text-sm text-center text-muted-foreground mt-8 border-2 border-dashed rounded-lg p-4">
                  Fila vazia
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 h-[600px]">
        <Card className="shrink-0 h-[250px] relative overflow-hidden bg-slate-100">
          <img
            src="https://img.usecurling.com/p/1000/400?q=street%20map&color=gray"
            className="w-full h-full object-cover opacity-60 mix-blend-multiply"
            alt="Map mockup"
          />
          {routeStops.map((stop, i) => (
            <div
              key={stop.id}
              className="absolute flex items-center justify-center w-7 h-7 bg-red-600 text-white rounded-full font-bold shadow-md text-sm border-2 border-white"
              style={{ top: `${30 + i * 12}%`, left: `${20 + (i % 3) * 20}%` }}
            >
              {i + 1}
            </div>
          ))}
          {routeStops.length > 0 && (
            <div className="absolute bottom-4 right-4 bg-background/90 p-2 rounded-md shadow-sm backdrop-blur-sm text-sm font-medium border">
              {routeStops.length} parada(s)
            </div>
          )}
        </Card>

        <Card className="flex-1 flex flex-col min-h-0 border-primary/20 border-2">
          <CardHeader className="py-3 shrink-0 bg-muted/30 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  {routeStops.length}
                </span>
                Construtor de Rota
              </CardTitle>
              <Button onClick={handleRoteirizar} disabled={routeStops.length === 0} size="sm">
                Roteirizar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
            <div
              className={cn(
                'flex-1 p-4 overflow-y-auto transition-colors',
                isDragOver
                  ? 'bg-primary/5 border-2 border-primary/50 border-dashed m-2 rounded-lg'
                  : '',
              )}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              {routeStops.length === 0 ? (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg text-muted-foreground text-sm">
                  Arraste os cards da fila para montar a sequência
                </div>
              ) : (
                <div className="space-y-2">
                  {routeStops.map((stop, i) => (
                    <div
                      key={stop.id}
                      className={cn(
                        'flex items-center gap-3 bg-card border rounded-md p-3 shadow-sm hover:shadow transition-shadow',
                        PRIORITY_COLORS[stop.priority],
                      )}
                    >
                      <div className="flex items-center justify-center w-7 h-7 bg-muted rounded-full text-xs font-bold shrink-0">
                        {i + 1}º
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate leading-none mb-1">
                          {stop.dest_address}
                        </p>
                        <p className="text-xs text-muted-foreground flex gap-2">
                          <span>NF: {stop.invoice_nf}</span>
                          <span className="text-foreground font-medium">{stop.priority}</span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0 bg-muted/50 p-1.5 rounded-md">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant={stop.time_slot === '08:00-12:00' ? 'default' : 'outline'}
                            className="text-[10px] h-6 px-1.5"
                            onClick={() => setTimeSlot(stop.id, '08:00-12:00')}
                          >
                            AM
                          </Button>
                          <Button
                            size="sm"
                            variant={stop.time_slot === '13:00-18:00' ? 'default' : 'outline'}
                            className="text-[10px] h-6 px-1.5"
                            onClick={() => setTimeSlot(stop.id, '13:00-18:00')}
                          >
                            PM
                          </Button>
                          <Button
                            size="sm"
                            variant={stop.time_slot === '08:00-18:00' ? 'default' : 'outline'}
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
                        className="h-8 w-8 text-destructive shrink-0"
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
