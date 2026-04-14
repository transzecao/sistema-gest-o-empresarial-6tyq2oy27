import { useEffect, useState } from 'react'
import { getAgendamentos, createAgendamento } from '@/services/agendamentos'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'
import { MapPin, Package, Clock, Copy } from 'lucide-react'
import { TrackingTimeline } from './TrackingTimeline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function CustomerSchedules() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [schedules, setSchedules] = useState<any[]>([])

  const loadData = async () => {
    if (!user) return
    const data = await getAgendamentos(`cliente_id = "${user.id}"`)
    setSchedules(data)
  }

  useEffect(() => {
    loadData()
  }, [user])
  useRealtime('agendamentos', loadData)

  const handleReschedule = async (s: any) => {
    try {
      await createAgendamento({
        cliente_id: s.cliente_id,
        cnpj_origem: s.cnpj_origem,
        endereco_origem: s.endereco_origem,
        lat_origem: s.lat_origem,
        lng_origem: s.lng_origem,
        cnpj_destino: s.cnpj_destino,
        endereco_destino: s.endereco_destino,
        lat_destino: s.lat_destino,
        lng_destino: s.lng_destino,
        peso: s.peso,
        largura: s.largura,
        altura: s.altura,
        profundidade: s.profundidade,
        quantidade_pacotes: s.quantidade_pacotes,
        tipo_carga: s.tipo_carga,
        hora_desejada: s.hora_desejada,
        prioridade: s.prioridade,
        status: 'Aguardando Coleta',
        fase_atual: 'Coleta',
        numero_nota_fiscal: s.numero_nota_fiscal + '-R',
      })
      toast({ title: 'Reagendado com sucesso!' })
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erro ao reagendar',
        description: 'Verifique se a nota fiscal já não foi reagendada.',
      })
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'Concluído') return 'bg-green-500/10 text-green-600 border-green-500/20'
    if (['Cancelado', 'Rejeitado', 'Devolvido'].includes(status))
      return 'bg-red-500/10 text-red-600 border-red-500/20'
    return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
        Nenhum agendamento encontrado.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {schedules.map((s) => (
        <div
          key={s.id}
          className="border rounded-lg p-5 flex flex-col gap-4 shadow-sm bg-card hover:shadow-md transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(s.status)}>
                  {s.status}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground border px-2 py-0.5 rounded bg-muted/50">
                  NF: {s.numero_nota_fiscal}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-sm mt-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground text-xs block mb-0.5">
                      Destino de Entrega
                    </span>
                    <span className="font-medium text-base">{s.endereco_destino}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 text-xs text-muted-foreground shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3" /> {s.quantidade_pacotes} vols ({s.peso}kg)
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {s.prioridade}
              </div>
              {['Cancelado', 'Rejeitado', 'Devolvido'].includes(s.status) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 mt-1 text-xs shadow-sm hover:bg-primary/5 hover:text-primary"
                  onClick={() => handleReschedule(s)}
                >
                  <Copy className="h-3 w-3 mr-1" /> Reagendar Cópia
                </Button>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-muted/50">
            <TrackingTimeline status={s.status} />
          </div>
        </div>
      ))}
    </div>
  )
}
