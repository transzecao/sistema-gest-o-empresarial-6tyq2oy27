migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('fleet_settings')

    if (app.countRecords('fleet_settings') > 0) {
      return
    }

    const record = new Record(col)
    record.set('das_rate', 6.0)
    record.set('min_margin', 15.0)
    record.set('warning_margin', 20.0)
    record.set('max_cpk', 1.5)
    record.set('fuel_price', 5.89)
    record.set('default_consumption', 10.0)
    record.set('labor_charges', { fgts: 8, inss: 20, thirteenth: 8.33, vacation: 11.11 })

    app.save(record)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('fleet_settings')
      app.truncateCollection(col)
    } catch (_) {}
  },
)
