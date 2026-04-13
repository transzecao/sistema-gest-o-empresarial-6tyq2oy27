migrate(
  (app) => {
    // 1. Deduplicate existing records before adding unique constraints
    app
      .db()
      .newQuery(
        `DELETE FROM drivers WHERE id NOT IN (SELECT MIN(id) FROM drivers GROUP BY cpf) AND cpf IS NOT NULL AND cpf != ''`,
      )
      .execute()
    app
      .db()
      .newQuery(
        `DELETE FROM drivers WHERE id NOT IN (SELECT MIN(id) FROM drivers GROUP BY local_id) AND local_id IS NOT NULL AND local_id != ''`,
      )
      .execute()

    app
      .db()
      .newQuery(
        `DELETE FROM vehicles WHERE id NOT IN (SELECT MIN(id) FROM vehicles GROUP BY plate) AND plate IS NOT NULL AND plate != ''`,
      )
      .execute()
    app
      .db()
      .newQuery(
        `DELETE FROM vehicles WHERE id NOT IN (SELECT MIN(id) FROM vehicles GROUP BY local_id) AND local_id IS NOT NULL AND local_id != ''`,
      )
      .execute()

    app
      .db()
      .newQuery(
        `DELETE FROM vinculos WHERE id NOT IN (SELECT MIN(id) FROM vinculos GROUP BY local_id) AND local_id IS NOT NULL AND local_id != ''`,
      )
      .execute()

    // 2. Update Drivers
    const drivers = app.findCollectionByNameOrId('drivers')
    if (!drivers.fields.getByName('cpf')) {
      drivers.fields.add(
        new TextField({ name: 'cpf', pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$' }),
      )
    }
    if (!drivers.fields.getByName('base_salary')) {
      drivers.fields.add(new NumberField({ name: 'base_salary' }))
    }
    if (!drivers.fields.getByName('encargos')) {
      drivers.fields.add(new JSONField({ name: 'encargos' }))
    }
    drivers.addIndex('idx_drivers_cpf', true, 'cpf', "cpf != '' AND cpf IS NOT NULL")
    drivers.addIndex('idx_drivers_local_id', true, 'local_id', "local_id != ''")
    drivers.addIndex('idx_drivers_deleted_at', false, 'deleted_at', '')
    app.save(drivers)

    // 3. Update Vehicles
    const vehicles = app.findCollectionByNameOrId('vehicles')
    const plateField = vehicles.fields.getByName('plate')
    if (plateField) {
      plateField.pattern = '^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$'
    }
    if (!vehicles.fields.getByName('consumo')) {
      vehicles.fields.add(new NumberField({ name: 'consumo' }))
    }
    vehicles.addIndex('idx_vehicles_plate', true, 'plate', "plate != '' AND plate IS NOT NULL")
    vehicles.addIndex('idx_vehicles_local_id', true, 'local_id', "local_id != ''")
    vehicles.addIndex('idx_vehicles_deleted_at', false, 'deleted_at', '')
    app.save(vehicles)

    // 4. Update Vinculos
    const vinculos = app.findCollectionByNameOrId('vinculos')
    if (!vinculos.fields.getByName('km_mensal')) {
      vinculos.fields.add(new NumberField({ name: 'km_mensal' }))
    }
    vinculos.addIndex('idx_vinculos_local_id', true, 'local_id', "local_id != ''")
    vinculos.addIndex('idx_vinculos_deleted_at', false, 'deleted_at', '')
    app.save(vinculos)

    // 5. Update Audit Logs
    const audit = app.findCollectionByNameOrId('audit_logs')
    audit.addIndex('idx_audit_logs_action', false, 'action', '')
    audit.addIndex('idx_audit_logs_user_id', false, 'user_id', '')
    app.save(audit)

    // 6. Create HQ Costs
    const hqCosts = new Collection({
      name: 'hq_costs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'Supervisor Financeiro' || @request.auth.role = 'Diretor'",
      updateRule: "@request.auth.role = 'Supervisor Financeiro' || @request.auth.role = 'Diretor'",
      deleteRule: "@request.auth.role = 'Supervisor Financeiro' || @request.auth.role = 'Diretor'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'value', type: 'number', required: true },
        {
          name: 'type',
          type: 'select',
          values: ['fixed', 'variable'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(hqCosts)

    // 7. Create Taxes
    const taxes = new Collection({
      name: 'taxes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'Supervisor Financeiro' || @request.auth.role = 'Diretor'",
      updateRule: "@request.auth.role = 'Supervisor Financeiro' || @request.auth.role = 'Diretor'",
      deleteRule: "@request.auth.role = 'Supervisor Financeiro' || @request.auth.role = 'Diretor'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'rate', type: 'number', required: true, min: 0, max: 100 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(taxes)

    // 8. Create CPK Settings
    const cpkSettings = new Collection({
      name: 'cpk_settings',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'Supervisor Financeiro' || @request.auth.role = 'Diretor'",
      updateRule: "@request.auth.role = 'Supervisor Financeiro' || @request.auth.role = 'Diretor'",
      deleteRule: null,
      fields: [
        { name: 'max_cpk', type: 'number', required: true },
        { name: 'min_margin', type: 'number', required: true, min: 0, max: 100 },
        { name: 'yellow_margin', type: 'number', required: true, min: 0, max: 100 },
        { name: 'das_rate', type: 'number', required: true, min: 0, max: 100 },
        { name: 'fuel_price', type: 'number', required: true },
        { name: 'target_margin', type: 'number', required: false, min: 0, max: 100 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(cpkSettings)

    // 9. Create CPK Calculations
    const cpkCalc = new Collection({
      name: 'cpk_calculations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.role = 'Supervisor Financeiro' || @request.auth.role = 'Diretor'",
      deleteRule: "@request.auth.role = 'Supervisor Financeiro' || @request.auth.role = 'Diretor'",
      fields: [
        { name: 'vinculo_id', type: 'relation', collectionId: vinculos.id, maxSelect: 1 },
        { name: 'driver_id', type: 'relation', collectionId: drivers.id, maxSelect: 1 },
        { name: 'vehicle_id', type: 'relation', collectionId: vehicles.id, maxSelect: 1 },
        { name: 'calculated_cpk', type: 'number', required: true },
        { name: 'margin', type: 'number', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['healthy', 'warning', 'critical'],
          maxSelect: 1,
          required: true,
        },
        { name: 'details', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(cpkCalc)

    // 10. Views
    try {
      const activeDrivers = new Collection({
        name: 'active_drivers',
        type: 'view',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        viewQuery:
          "SELECT id, local_id, name, cpf, base_salary, created, updated FROM drivers WHERE deleted_at = '' OR deleted_at IS NULL",
      })
      app.save(activeDrivers)
    } catch (e) {
      console.log('Skipping active_drivers creation:', e.message)
    }

    try {
      const activeVehicles = new Collection({
        name: 'active_vehicles',
        type: 'view',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        viewQuery:
          "SELECT id, local_id, plate, purchase_value, consumo, created, updated FROM vehicles WHERE deleted_at = '' OR deleted_at IS NULL",
      })
      app.save(activeVehicles)
    } catch (e) {
      console.log('Skipping active_vehicles creation:', e.message)
    }

    try {
      const activeVinculos = new Collection({
        name: 'active_vinculos',
        type: 'view',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        viewQuery:
          "SELECT id, local_id, driver_id, vehicle_id, km_mensal, created, updated FROM vinculos WHERE deleted_at = '' OR deleted_at IS NULL",
      })
      app.save(activeVinculos)
    } catch (e) {
      console.log('Skipping active_vinculos creation:', e.message)
    }

    try {
      const recentAuditLogs = new Collection({
        name: 'recent_audit_logs',
        type: 'view',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        viewQuery:
          'SELECT id, user_id, action, resource_type, created, updated FROM audit_logs ORDER BY created DESC LIMIT 1000',
      })
      app.save(recentAuditLogs)
    } catch (e) {
      console.log('Skipping recent_audit_logs creation:', e.message)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('recent_audit_logs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('active_vinculos'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('active_vehicles'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('active_drivers'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('cpk_calculations'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('cpk_settings'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('taxes'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('hq_costs'))
    } catch (_) {}
  },
)
