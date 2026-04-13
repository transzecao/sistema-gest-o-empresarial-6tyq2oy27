import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { getAuditLogs } from '@/services/auditLog'
import { useAuth } from '@/hooks/use-auth'
import { useRoleValidation } from '@/hooks/use-role-validation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function MonthlySnapshots() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { canConfigure } = useRoleValidation()

  useEffect(() => {
    getAuditLogs().then((data) => {
      let snapshots = data.filter((l) => l.action === 'CLOSE_MONTH' && l.status === 'SUCCESS')

      // If not supervisor, only show own snapshots
      if (!canConfigure && user) {
        snapshots = snapshots.filter((l) => l.user_id === user.id)
      }

      setLogs(snapshots)
      setLoading(false)
    })
  }, [user, canConfigure])

  if (loading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg mt-6"></div>
  }

  if (logs.length === 0) {
    return null
  }

  return (
    <Card className="w-full mt-6 shadow-sm">
      <CardHeader className="bg-muted/30 border-b">
        <CardTitle className="text-lg">Histórico de Fechamentos Mensais</CardTitle>
        <CardDescription>Registro de todos os meses fechados e processados.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Data</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>CPK Apurado</TableHead>
              <TableHead>Margem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              let cpk = '-'
              let margin = '-'
              try {
                if (log.new_value) {
                  const parsed = JSON.parse(log.new_value)
                  cpk = `R$ ${parsed.cpk?.toFixed(2)}`
                  margin = `${parsed.margin?.toFixed(1)}%`
                }
              } catch (e) {
                // Ignore parsing errors
              }

              return (
                <TableRow key={log.id}>
                  <TableCell className="pl-6 whitespace-nowrap">
                    {format(new Date(log.created), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.document_id}</TableCell>
                  <TableCell>{log.expand?.user_id?.name || 'Desconhecido'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{cpk}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{margin}</Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
