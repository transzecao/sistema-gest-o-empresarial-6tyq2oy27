migrate(
  (app) => {
    // 1. CPK Settings Seed
    const cpkSettings = app.findCollectionByNameOrId('cpk_settings')
    if (app.countRecords('cpk_settings') === 0) {
      const record = new Record(cpkSettings)
      record.set('max_cpk', 15.5)
      record.set('min_margin', 10)
      record.set('yellow_margin', 15)
      record.set('das_rate', 12)
      record.set('fuel_price', 5.8)
      record.set('target_margin', 20)
      app.save(record)
    }

    // 2. HQ Costs Seed
    const hqCosts = app.findCollectionByNameOrId('hq_costs')
    if (app.countRecords('hq_costs') === 0) {
      const costs = [
        { name: 'Aluguel Sede', value: 5000, type: 'fixed' },
        { name: 'Energia', value: 1200, type: 'variable' },
        { name: 'Internet', value: 300, type: 'fixed' },
        { name: 'Contabilidade', value: 1500, type: 'fixed' },
      ]
      costs.forEach((c) => {
        const r = new Record(hqCosts)
        r.set('name', c.name)
        r.set('value', c.value)
        r.set('type', c.type)
        app.save(r)
      })
    }

    // 3. Taxes Seed
    const taxes = app.findCollectionByNameOrId('taxes')
    if (app.countRecords('taxes') === 0) {
      const taxList = [
        { name: 'INSS', rate: 20 },
        { name: 'FGTS', rate: 8 },
        { name: 'ISS', rate: 5 },
      ]
      taxList.forEach((t) => {
        const r = new Record(taxes)
        r.set('name', t.name)
        r.set('rate', t.rate)
        app.save(r)
      })
    }
  },
  (app) => {
    app.db().newQuery('DELETE FROM cpk_settings').execute()
    app.db().newQuery('DELETE FROM hq_costs').execute()
    app.db().newQuery('DELETE FROM taxes').execute()
  },
)
