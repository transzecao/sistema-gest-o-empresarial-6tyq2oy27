import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { getAuditLogs } from '@/services/auditLog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export function AdminAuditHistory() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAuditLogs().then((data) => {
      setLogs(
        data.filter((l) => l.resource_type === 'CPK_SETTINGS' || l.action === 'UPDATE_CONFIG'),
      )
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Nenhum registro de alteração encontrado.
      </p>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Parâmetro</TableHead>
            <TableHead>De → Para</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{format(new Date(log.created), 'dd/MM/yyyy HH:mm')}</TableCell>
              <TableCell>{log.expand?.user_id?.name || 'Sistema'}</TableCell>
              <TableCell className="capitalize">
                {log.details?.parameter?.replace('_', ' ') || 'Geral'}
              </TableCell>
              <TableCell>
                <span className="text-red-500 line-through mr-2">{log.old_value || '-'}</span>
                <span className="text-green-600 font-bold">→ {log.new_value || '-'}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
