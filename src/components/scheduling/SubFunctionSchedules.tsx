import { useEffect, useState } from 'react'
import { getSchedules } from '@/services/schedules'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

export function SubFunctionSchedules() {
  const [schedules, setSchedules] = useState<any[]>([])

  const loadData = async () => {
    const data = await getSchedules(`status = "Devolvido"`)
    setSchedules(data)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('schedules', loadData)

  const grouped = schedules.reduce(
    (acc, curr) => {
      const date = new Date(curr.created).toLocaleDateString()
      if (!acc[date]) acc[date] = []
      acc[date].push(curr)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-2xl font-semibold tracking-tight">Coletas Devolvidas</h2>
      {Object.entries(grouped).map(([date, items]) => (
        <Card key={date}>
          <CardHeader className="pb-3 bg-muted/40">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" /> {date}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 shadow-sm bg-card">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="destructive">Devolvido</Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      NF: {item.invoice_nf}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate mb-1">{item.dest_address}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Origem: {item.origin_address}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground border-t pt-2 flex justify-between">
                    <span>{item.weight}kg</span>
                    <span>Pri: {item.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          Nenhuma coleta devolvida no momento.
        </div>
      )}
    </div>
  )
}
