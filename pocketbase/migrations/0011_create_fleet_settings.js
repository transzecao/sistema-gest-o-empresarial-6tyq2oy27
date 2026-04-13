migrate(
  (app) => {
    const collection = new Collection({
      name: 'fleet_settings',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'Supervisor Financeiro'",
      updateRule: "@request.auth.role = 'Supervisor Financeiro'",
      deleteRule: null,
      fields: [
        { name: 'das_rate', type: 'number', required: true },
        { name: 'min_margin', type: 'number', required: true },
        { name: 'warning_margin', type: 'number', required: true },
        { name: 'max_cpk', type: 'number', required: true },
        { name: 'fuel_price', type: 'number', required: true },
        { name: 'default_consumption', type: 'number', required: true },
        { name: 'labor_charges', type: 'json', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('fleet_settings')
    app.delete(collection)
  },
)
