import { useEffect, useState } from 'react'
import { getQuotations, getQuotationAudit } from '@/services/quotations'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { useAuth } from '@/hooks/use-auth'
import { FileText, Info } from 'lucide-react'

export function QuotationHistory() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const isSupervisor = user?.role === 'Supervisor Financeiro'

  useEffect(() => {
    getQuotations()
      .then(setQuotes)
      .finally(() => setLoading(false))
  }, [])

  const handlePrint = (quote: any) => {
    const content = `
      <h2>Cotação de Frete Transzecão</h2>
      <hr/>
      <p><b>Origem:</b> ${quote.endereco_remetente} (${quote.cnpj_remetente})</p>
      <p><b>Destino:</b> ${quote.endereco_destinatario} (${quote.cnpj_destinatario})</p>
      <p><b>Valor NF:</b> R$ ${quote.valor_nf}</p>
      <p><b>Peso Físico:</b> ${quote.peso_fisico} kg</p>
      <hr/>
      <h3>Valor Final: R$ ${quote.valor_final.toFixed(2)}</h3>
    `
    const win = window.open('', '', 'width=600,height=600')
    if (win) {
      win.document.write(
        `<html><body style="font-family: sans-serif; padding: 20px;">${content}</body></html>`,
      )
      win.document.close()
      win.print()
    }
  }

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium tracking-tight">Histórico de Cotações</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>NF (R$)</TableHead>
            <TableHead>Valor Final</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((q) => (
            <TableRow key={q.id}>
              <TableCell>{new Date(q.created).toLocaleDateString()}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={q.endereco_destinatario}>
                {q.endereco_destinatario}
              </TableCell>
              <TableCell>{q.valor_nf?.toFixed(2)}</TableCell>
              <TableCell className="font-medium">
                R$ {q.valor_final?.toFixed(2)}
                {(q.desconto_percentual > 0 || q.valor_override > 0) && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 rounded-full">
                        <Info className="h-3 w-3 text-blue-500" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Detalhes do Ajuste</h4>
                        <p className="text-sm text-muted-foreground">
                          Original: R$ {q.valor_original?.toFixed(2)}
                        </p>
                        {q.desconto_percentual > 0 && (
                          <p className="text-sm">
                            Desconto: {q.desconto_percentual}% ({q.motivo_desconto})
                          </p>
                        )}
                        {q.valor_override > 0 && (
                          <p className="text-sm text-red-500">
                            Override: R$ {q.valor_override?.toFixed(2)} ({q.motivo_override})
                          </p>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={q.status === 'agendada' ? 'default' : 'secondary'}>
                  {q.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handlePrint(q)}>
                  <FileText className="w-4 h-4 mr-2" /> PDF
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {quotes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                Nenhuma cotação encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
