import pb from '@/lib/pocketbase/client'

export interface Rule {
  id: string
  nome: string
  tipo: 'taxa_despacho' | 'custo_transporte' | 'gris' | 'ad_valorem' | 'icms'
  valor: number
  percentual: number
  ativo: boolean
}

export interface Cluster {
  id: string
  nome: string
  km_medio: number
  frete_minimo: number
  ativo: boolean
}

export const getRules = () => pb.collection('regras_motor').getFullList<Rule>({ sort: 'tipo' })
export const getClusters = () =>
  pb.collection('clusters').getFullList<Cluster>({ sort: 'frete_minimo' })

export const updateRule = (id: string, data: Partial<Rule>) =>
  pb.collection('regras_motor').update(id, data)
export const updateCluster = (id: string, data: Partial<Cluster>) =>
  pb.collection('clusters').update(id, data)

export const createQuotation = (data: any) => pb.collection('cotacoes').create(data)
export const updateQuotation = (id: string, data: any) => pb.collection('cotacoes').update(id, data)
export const deleteQuotation = (id: string) => pb.collection('cotacoes').delete(id)
export const getQuotations = () => pb.collection('cotacoes').getFullList({ sort: '-created' })
export const getQuotationAudit = (cotacaoId: string) =>
  pb
    .collection('audit_cotacoes')
    .getFullList({ filter: `cotacao_id = "${cotacaoId}"`, sort: '-created' })
export const createAudit = (data: any) => pb.collection('audit_cotacoes').create(data)

export const calculateDistance = async (origem: string, destino: string) => {
  return pb.send('/backend/v1/calcular-distancia', {
    method: 'POST',
    body: JSON.stringify({ origem, destino }),
    headers: { 'Content-Type': 'application/json' },
  })
}
