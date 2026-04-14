import { useEffect, useState } from 'react'
import { getClusters, updateCluster, Cluster } from '@/services/quotations'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export function ClustersList() {
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    getClusters()
      .then(setClusters)
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async (cluster: Cluster) => {
    try {
      const updated = await updateCluster(cluster.id, { ativo: !cluster.ativo })
      setClusters((prev) => prev.map((c) => (c.id === cluster.id ? updated : c)))
      toast({ title: 'Cluster atualizado' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar', variant: 'destructive' })
    }
  }

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>KM Médio</TableHead>
            <TableHead>Frete Mínimo (R$)</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clusters.map((cluster) => (
            <TableRow key={cluster.id}>
              <TableCell className="font-medium">{cluster.nome}</TableCell>
              <TableCell>{cluster.km_medio} km</TableCell>
              <TableCell>R$ {cluster.frete_minimo?.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Switch checked={cluster.ativo} onCheckedChange={() => handleToggle(cluster)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
