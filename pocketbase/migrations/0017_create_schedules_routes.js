migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const schedules = new Collection({
      name: 'schedules',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'client_id', type: 'relation', collectionId: users.id, maxSelect: 1 },
        { name: 'origin_cnpj', type: 'text' },
        { name: 'origin_address', type: 'text' },
        { name: 'dest_cnpj', type: 'text' },
        { name: 'dest_address', type: 'text' },
        { name: 'weight', type: 'number' },
        { name: 'dimensions', type: 'text' },
        { name: 'package_qty', type: 'number' },
        { name: 'cargo_type', type: 'text' },
        { name: 'invoice_nf', type: 'text' },
        { name: 'preferred_time', type: 'text' },
        { name: 'priority', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'time_slot', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_schedules_invoice_nf ON schedules (invoice_nf) WHERE invoice_nf != '' AND invoice_nf IS NOT NULL",
      ],
    })
    app.save(schedules)

    const drivers = app.findCollectionByNameOrId('drivers')
    const vehicles = app.findCollectionByNameOrId('vehicles')

    const routes = new Collection({
      name: 'routes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'driver_id', type: 'relation', collectionId: drivers.id, maxSelect: 1 },
        { name: 'vehicle_id', type: 'relation', collectionId: vehicles.id, maxSelect: 1 },
        { name: 'date', type: 'date' },
        { name: 'stop_sequence', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(routes)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('schedules'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('routes'))
    } catch (_) {}
  },
)
