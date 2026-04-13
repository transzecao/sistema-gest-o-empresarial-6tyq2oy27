migrate(
  (app) => {
    // 1. Update users
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('role')) {
      users.fields.add(new TextField({ name: 'role' }))
    }
    app.save(users)

    // 2. Update audit_logs
    const auditLogs = app.findCollectionByNameOrId('audit_logs')
    if (!auditLogs.fields.getByName('role')) {
      auditLogs.fields.add(new TextField({ name: 'role' }))
      auditLogs.fields.add(new TextField({ name: 'old_value' }))
      auditLogs.fields.add(new TextField({ name: 'new_value' }))
      auditLogs.fields.add(new TextField({ name: 'status' }))
      auditLogs.fields.add(new TextField({ name: 'reason' }))
      auditLogs.fields.add(new TextField({ name: 'document_id' }))
    }
    app.save(auditLogs)

    // 3. Create drivers
    try {
      app.findCollectionByNameOrId('drivers')
    } catch (_) {
      const drivers = new Collection({
        name: 'drivers',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'local_id', type: 'text', required: true },
          { name: 'name', type: 'text', required: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(drivers)
    }

    // 4. Create vehicles
    try {
      app.findCollectionByNameOrId('vehicles')
    } catch (_) {
      const vehicles = new Collection({
        name: 'vehicles',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'local_id', type: 'text', required: true },
          { name: 'plate', type: 'text', required: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(vehicles)
    }

    // 5. Create vinculos
    try {
      app.findCollectionByNameOrId('vinculos')
    } catch (_) {
      const vinculos = new Collection({
        name: 'vinculos',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'local_id', type: 'text', required: true },
          { name: 'driver_id', type: 'text' },
          { name: 'vehicle_id', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(vinculos)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('vinculos'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('vehicles'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('drivers'))
    } catch (e) {}

    const auditLogs = app.findCollectionByNameOrId('audit_logs')
    auditLogs.fields.removeByName('role')
    auditLogs.fields.removeByName('old_value')
    auditLogs.fields.removeByName('new_value')
    auditLogs.fields.removeByName('status')
    auditLogs.fields.removeByName('reason')
    auditLogs.fields.removeByName('document_id')
    app.save(auditLogs)

    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('role')
    app.save(users)
  },
)
