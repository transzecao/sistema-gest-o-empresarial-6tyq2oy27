migrate(
  (app) => {
    // 1. CPK Settings Seed
    const cpkSettings = app.findCollectionByNameOrId('cpk_settings')
    if (app.countRecords('cpk_settings') === 0) {
      const record = new Record(cpkSettings)
      record.set('max_cpk', 15.5)
      record.set('min_margin', 10)
      record.set('yellow_margin', 15)
      record.set('max_das', 20)
      record.set('das_rate', 12)
      record.set('cte_cost', 2.5)
      record.set('docs_count', 10)
      record.set('taxas_fiscal', 150)
      record.set('dead_km', 5)
      record.set('working_days', 22)
      record.set('vr_daily', 35)
      record.set('cesta_basica', 150)
      record.set('fuel_consumption', 3.5)
      record.set('fuel_price', 5.8)
      record.set('default_fgts', 8)
      record.set('default_decimo', 8.33)
      record.set('default_ferias', 11.11)
      record.set('default_pis', 1)
      record.set('var_cost_max_percent', 30)
      app.save(record)
    }

    // 2. HQ Costs Seed
    const hqCosts = app.findCollectionByNameOrId('hq_costs')
    if (app.countRecords('hq_costs') === 0) {
      const record = new Record(hqCosts)
      record.set('iptu', 500)
      record.set('aluguel', 5000)
      record.set('agua', 200)
      record.set('luz', 1200)
      record.set('internet', 300)
      record.set('telefone', 150)
      record.set('avcb', 100)
      record.set('seguro_patrimonial', 400)
      record.set('docas', 800)
      app.save(record)
    }

    // 3. Taxes Seed
    const taxes = app.findCollectionByNameOrId('taxes')
    if (app.countRecords('taxes') === 0) {
      const record = new Record(taxes)
      record.set('target_margin', 20)
      record.set('das_rate', 12)
      record.set('use_faixa', true)
      record.set('faixa', 'Faixa 1')
      record.set('cte_cost', 2.5)
      record.set('docs_count', 10)
      record.set('taxas_fiscal', 150)
      record.set('dead_km', 5)
      app.save(record)
    }
  },
  (app) => {
    app.db().newQuery('DELETE FROM cpk_settings').execute()
    app.db().newQuery('DELETE FROM hq_costs').execute()
    app.db().newQuery('DELETE FROM taxes').execute()
  },
)
