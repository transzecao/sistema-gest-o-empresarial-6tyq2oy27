import { useEffect, useState, useMemo } from 'react'
import { format } from 'date-fns'
import { getAuditLogs } from '@/services/auditLog'
import { Download, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AdminAuditHistory() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [filterUser, setFilterUser] = useState('')
  const [filterAction, setFilterAction] = useState('ALL')

  useEffect(() => {
    getAuditLogs().then((data) => {
      setLogs(data)
      setLoading(false)
    })
  }, [])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchUser = filterUser
        ? log.expand?.user_id?.name?.toLowerCase().includes(filterUser.toLowerCase())
        : true
      const matchAction = filterAction !== 'ALL' ? log.action === filterAction : true
      return matchUser && matchAction
    })
  }, [logs, filterUser, filterAction])

  const exportCSV = () => {
    const headers = ['Data', 'Usuário', 'Ação', 'Parâmetro', 'De → Para']
    const rows = filteredLogs.map((log) => [
      format(new Date(log.created), 'dd/MM/yyyy HH:mm:ss'),
      log.expand?.user_id?.name || 'Sistema',
      log.action,
      log.details?.parameter || log.resource_type || '-',
      `${log.old_value || '-'} → ${log.new_value || '-'}`,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((e) => e.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_logs_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const actions = Array.from(new Set(logs.map((l) => l.action))).filter(Boolean)

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20 p-3 rounded-lg border">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuário..."
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as Ações</SelectItem>
              {actions.map((a) => (
                <SelectItem key={a as string} value={a as string}>
                  {a as string}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      {filteredLogs.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Nenhum registro encontrado.</p>
      ) : (
        <ScrollArea className="h-[400px] border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Parâmetro</TableHead>
                <TableHead>De → Para</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {format(new Date(log.created), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {log.expand?.user_id?.name || 'Sistema'}
                  </TableCell>
                  <TableCell className="text-sm">{log.action}</TableCell>
                  <TableCell className="text-sm font-mono">
                    {log.details?.parameter || log.resource_type || '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.old_value || log.new_value ? (
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 line-through">{log.old_value || '-'}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-emerald-600 font-medium">{log.new_value || '-'}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  )
}
