import { useEffect, useState } from 'react'
import { getRules, updateRule, Rule } from '@/services/quotations'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export function RulesList() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    getRules()
      .then(setRules)
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async (rule: Rule) => {
    try {
      const updated = await updateRule(rule.id, { ativo: !rule.ativo })
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)))
      toast({
        title: 'Regra atualizada',
        description: `${rule.nome} agora está ${updated.ativo ? 'Ativa' : 'Inativa'}`,
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a regra',
        variant: 'destructive',
      })
    }
  }

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor (R$)</TableHead>
            <TableHead>Percentual (%)</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule.id}>
              <TableCell className="font-medium">{rule.nome}</TableCell>
              <TableCell>
                <Badge variant="outline">{rule.tipo}</Badge>
              </TableCell>
              <TableCell>{rule.valor?.toFixed(2) || '-'}</TableCell>
              <TableCell>{rule.percentual ? `${rule.percentual}%` : '-'}</TableCell>
              <TableCell className="text-right">
                <Switch checked={rule.ativo} onCheckedChange={() => handleToggle(rule)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
