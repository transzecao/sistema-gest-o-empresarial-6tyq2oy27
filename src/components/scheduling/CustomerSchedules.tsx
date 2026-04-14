import { useEffect, useState } from 'react'
import { getSchedules } from '@/services/schedules'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'
import { MapPin, Package, Clock } from 'lucide-react'

export function CustomerSchedules() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState<any[]>([])

  const loadData = async () => {
    if (!user) return
    const data = await getSchedules(`client_id = "${user.id}"`)
    setSchedules(data)
  }

  useEffect(() => {
    loadData()
  }, [user])
  useRealtime('schedules', loadData)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fila':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'Roteirizado':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'Concluído':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'Devolvido':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      default:
        return ''
    }
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">Nenhum agendamento encontrado.</div>
    )
  }

  return (
    <div className="space-y-4">
      {schedules.map((s) => (
        <div
          key={s.id}
          className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm bg-card hover:shadow-md transition-all"
        >
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusColor(s.status)}>
                {s.status}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground border px-2 py-0.5 rounded bg-muted/50">
                NF: {s.invoice_nf}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-sm">
                <span className="font-medium">{s.dest_address}</span>
              </div>
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 sm:gap-1 text-xs text-muted-foreground shrink-0 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4">
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3" /> {s.package_qty} vols ({s.weight}kg)
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {s.priority}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
