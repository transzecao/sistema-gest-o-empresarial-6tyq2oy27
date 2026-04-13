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
import { Badge } from '@/components/ui/badge'

export function AdminAuditHistory() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [filterUser, setFilterUser] = useState('')
  const [filterAction, setFilterAction] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')

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
      const matchStatus = filterStatus !== 'ALL' ? log.status === filterStatus : true
      return matchUser && matchAction && matchStatus
    })
  }, [logs, filterUser, filterAction, filterStatus])

  const exportCSV = () => {
    const headers = [
      'Data',
      'Usuário',
      'Role',
      'Ação',
      'Recurso',
      'Detalhes',
      'Status',
      'Motivo',
      'Valor Antigo',
      'Novo Valor',
    ]
    const rows = filteredLogs.map((log) => [
      format(new Date(log.created), 'dd/MM/yyyy HH:mm:ss'),
      log.expand?.user_id?.name || 'Sistema',
      log.role || '',
      log.action,
      log.resource_type,
      log.details ? JSON.stringify(log.details) : '',
      log.status || 'SUCCESS',
      log.reason || '',
      log.old_value || '',
      log.new_value || '',
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
                <SelectItem key={a} value={a as string}>
                  {a as string}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos Status</SelectItem>
              <SelectItem value="SUCCESS">Sucesso</SelectItem>
              <SelectItem value="FAILED">Falha</SelectItem>
              <SelectItem value="UNAUTHORIZED">Não Autorizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {filteredLogs.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Nenhum registro encontrado.</p>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.created), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.expand?.user_id?.name || 'Sistema'}</span>
                      <span className="text-xs text-muted-foreground">{log.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{log.resource_type}</TableCell>
                  <TableCell>
                    {log.status === 'SUCCESS' && (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">Sucesso</Badge>
                    )}
                    {log.status === 'FAILED' && <Badge variant="destructive">Falha</Badge>}
                    {log.status === 'UNAUTHORIZED' && (
                      <Badge variant="destructive" className="bg-amber-500">
                        Não Autorizado
                      </Badge>
                    )}
                    {!log.status && <Badge variant="secondary">Info</Badge>}
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">
                    {log.old_value && log.new_value ? (
                      <div className="flex flex-col">
                        <span className="text-red-500 line-through">{log.old_value}</span>
                        <span className="text-emerald-600">→ {log.new_value}</span>
                      </div>
                    ) : log.reason ? (
                      <span className="text-destructive" title={log.reason}>
                        {log.reason}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
