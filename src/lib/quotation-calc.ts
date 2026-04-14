import { Rule, Cluster } from '@/services/quotations'

export interface QuoteParams {
  peso: number
  l: number
  a: number
  p: number
  qtd: number
  nf_value: number
  cluster_name?: string
  discount?: number
  override?: number
}

export function calculateQuote(params: QuoteParams, rules: Rule[], clusters: Cluster[]) {
  // Volume in meters (assuming L,A,P are in cm)
  const lM = params.l / 100
  const aM = params.a / 100
  const pM = params.p / 100

  const pesoCubado = lM * aM * pM * 300 * params.qtd
  const cobravel = Math.max(params.peso, pesoCubado)

  const activeRules = rules.filter((r) => r.ativo)
  const taxaDespacho = activeRules.find((r) => r.tipo === 'taxa_despacho')?.valor || 0
  const custoTransp = activeRules.find((r) => r.tipo === 'custo_transporte')?.valor || 0
  const grisPct = activeRules.find((r) => r.tipo === 'gris')?.percentual || 0
  const adValoremPct = activeRules.find((r) => r.tipo === 'ad_valorem')?.percentual || 0
  const icmsPct = activeRules.find((r) => r.tipo === 'icms')?.percentual || 0

  const base = taxaDespacho + custoTransp * cobravel
  const gris = params.nf_value * (grisPct / 100)
  const adValorem = params.nf_value * (adValoremPct / 100)

  const subtotal = base + gris + adValorem
  const icms = subtotal * (icmsPct / 100)

  let total = subtotal + icms
  let appliedMin = false

  const cluster = clusters.find((c) => c.nome === params.cluster_name)
  if (cluster && total < cluster.frete_minimo) {
    total = cluster.frete_minimo
    appliedMin = true
  }

  const original = total

  if (params.discount && !params.override) {
    total = total * (1 - params.discount / 100)
  }

  if (params.override) {
    total = params.override
  }

  return {
    pesoCubado,
    cobravel,
    base,
    gris,
    adValorem,
    subtotal,
    icms,
    original,
    total,
    appliedMin,
  }
}
