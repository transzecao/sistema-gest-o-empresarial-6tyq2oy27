migrate((app) => {
  const regrasCol = app.findCollectionByNameOrId('regras_motor')
  const clustersCol = app.findCollectionByNameOrId('clusters')

  const clusters = [
    { nome: 'Local SP', km_medio: 50, frete_minimo: 54, ativo: true },
    { nome: 'Regional SP', km_medio: 200, frete_minimo: 150, ativo: true },
    { nome: 'Nacional', km_medio: 1000, frete_minimo: 350, ativo: true },
  ]

  for (const c of clusters) {
    try {
      app.findFirstRecordByData('clusters', 'nome', c.nome)
    } catch (_) {
      const r = new Record(clustersCol)
      r.set('nome', c.nome)
      r.set('km_medio', c.km_medio)
      r.set('frete_minimo', c.frete_minimo)
      r.set('ativo', c.ativo)
      app.save(r)
    }
  }

  const regras = [
    {
      nome: 'Taxa de Despacho Padrão',
      tipo: 'taxa_despacho',
      valor: 45.0,
      percentual: 0,
      ativo: true,
    },
    {
      nome: 'Custo Transporte / Kg',
      tipo: 'custo_transporte',
      valor: 2.93,
      percentual: 0,
      ativo: true,
    },
    { nome: 'Taxa GRIS', tipo: 'gris', valor: 0, percentual: 0.3, ativo: true },
    { nome: 'Taxa Ad Valorem', tipo: 'ad_valorem', valor: 0, percentual: 0.2, ativo: true },
    { nome: 'ICMS Padrão', tipo: 'icms', valor: 0, percentual: 12.0, ativo: true },
  ]

  for (const c of regras) {
    try {
      app.findFirstRecordByData('regras_motor', 'nome', c.nome)
    } catch (_) {
      const r = new Record(regrasCol)
      r.set('nome', c.nome)
      r.set('tipo', c.tipo)
      r.set('valor', c.valor)
      r.set('percentual', c.percentual)
      r.set('ativo', c.ativo)
      app.save(r)
    }
  }
})
