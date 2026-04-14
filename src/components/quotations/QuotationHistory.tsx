import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getQuotations,
  deleteQuotation,
  createQuotation,
  getRules,
  getClusters,
} from '@/services/quotations'
import { calculateQuote } from '@/lib/quotation-calc'
import { exportQuotationPdf } from '@/lib/pdf-export'
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
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { FileText, Info, Copy, Trash2, Calendar } from 'lucide-react'

export function QuotationHistory() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const loadData = () => {
    setLoading(true)
    getQuotations()
      .then(setQuotes)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handlePrint = async (quote: any) => {
    try {
      const rules = await getRules()
      const clusters = await getClusters()
      const breakdown = calculateQuote(
        {
          peso: quote.peso_fisico,
          l: quote.largura,
          a: quote.altura,
          p: quote.profundidade,
          qtd: quote.quantidade,
          nf_value: quote.valor_nf,
          cluster_name: quote.cluster,
          discount: quote.desconto_percentual,
          override: quote.valor_override,
        },
        rules,
        clusters,
      )

      exportQuotationPdf(quote, breakdown, user)
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao gerar PDF.', variant: 'destructive' })
    }
  }

  const handleDuplicate = async (q: any) => {
    try {
      const { id, created, updated, codigo, collectionId, collectionName, ...rest } = q
      await createQuotation({ ...rest, status: 'gerada' })
      toast({ title: 'Sucesso', description: 'Cotação duplicada!' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao duplicar cotação.', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta cotação?')) return
    try {
      await deleteQuotation(id)
      setQuotes(quotes.filter((q) => q.id !== id))
      toast({ title: 'Sucesso', description: 'Cotação excluída!' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="bg-muted/40 px-6 py-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold tracking-tight text-primary">Histórico de Cotações</h3>
      </div>
      <Table>
        <TableHeader className="bg-muted/20">
          <TableRow>
            <TableHead>Data / ID</TableHead>
            <TableHead>Cliente CNPJ</TableHead>
            <TableHead>Cluster</TableHead>
            <TableHead className="text-right">Original (R$)</TableHead>
            <TableHead className="text-right">Desconto</TableHead>
            <TableHead className="text-right font-bold">Final (R$)</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right pr-6">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((q) => (
            <TableRow key={q.id} className="group hover:bg-muted/10 transition-colors">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {new Date(q.created).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {q.codigo || q.id.slice(0, 8)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm">{q.cnpj_remetente}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs font-normal">
                  {q.cluster || '-'}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {q.valor_original?.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {q.desconto_percentual > 0 ? (
                  <span className="text-destructive text-xs bg-destructive/10 px-2 py-1 rounded-full">
                    -{q.desconto_percentual}%
                  </span>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="text-right font-bold text-primary">
                {q.valor_final?.toFixed(2)}
                {q.valor_override > 0 && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-3 w-3 inline ml-1 text-primary/60 cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64">
                      <p className="text-sm font-semibold mb-1">Ajuste Manual</p>
                      <p className="text-xs text-muted-foreground">
                        {q.motivo_override || 'Sem justificativa'}
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  className={
                    q.status === 'gerada'
                      ? 'bg-green-600/10 text-green-700 hover:bg-green-600/20 border-green-600/20'
                      : q.status === 'agendada'
                        ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
                        : 'bg-yellow-600/10 text-yellow-700 hover:bg-yellow-600/20 border-yellow-600/20'
                  }
                  variant="outline"
                >
                  {q.status?.toUpperCase() || 'GERADA'}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-4">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary"
                    title="Agendar"
                    onClick={() => navigate('/dashboard/agendar', { state: { quote: q } })}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="PDF"
                    onClick={() => handlePrint(q)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Duplicar"
                    onClick={() => handleDuplicate(q)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    title="Excluir"
                    onClick={() => handleDelete(q.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {quotes.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-muted-foreground/30" />
                  <p>Nenhuma cotação encontrada no histórico.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
