migrate(
  (app) => {
    // 1. Audit Logs Update
    let auditLogs = app.findCollectionByNameOrId('audit_logs')

    ;['old_value', 'new_value'].forEach((name) => {
      let field = auditLogs.fields.getByName(name)
      if (field && field.type === 'text') {
        auditLogs.fields.removeByName(name)
        auditLogs.fields.add(new JSONField({ name: name }))
      } else if (!field) {
        auditLogs.fields.add(new JSONField({ name: name }))
      }
    })

    const auditTextFields = ['role', 'status', 'reason', 'document_id', 'ip_address']
    auditTextFields.forEach((name) => {
      if (!auditLogs.fields.getByName(name)) {
        auditLogs.fields.add(new TextField({ name }))
      }
    })

    app.save(auditLogs)

    // 2. Drivers Update
    let drivers = app.findCollectionByNameOrId('drivers')
    if (!drivers.fields.getByName('local_id')) {
      drivers.fields.add(new TextField({ name: 'local_id' }))
    }

    let driverName = drivers.fields.getByName('name')
    if (driverName && driverName.type === 'text') {
      driverName.required = true
    } else if (!driverName) {
      drivers.fields.add(new TextField({ name: 'name', required: true }))
    }

    const driverFields = [
      { name: 'cpf', type: 'text' },
      { name: 'cnh', type: 'text' },
      { name: 'base_salary', type: 'number' },
      { name: 'periculosidade', type: 'bool' },
      { name: 'vr_daily', type: 'number' },
      { name: 'vt_mensal', type: 'number' },
      { name: 'cesta_basica', type: 'number' },
      { name: 'seguro_vida', type: 'number' },
      { name: 'tox_anual', type: 'number' },
      { name: 'rat', type: 'number' },
      { name: 'encargos', type: 'json' },
      { name: 'custom_fields', type: 'json' },
    ]
    driverFields.forEach((f) => {
      if (!drivers.fields.getByName(f.name)) {
        if (f.type === 'text') drivers.fields.add(new TextField({ name: f.name }))
        if (f.type === 'number') drivers.fields.add(new NumberField({ name: f.name }))
        if (f.type === 'bool') drivers.fields.add(new BoolField({ name: f.name }))
        if (f.type === 'json') drivers.fields.add(new JSONField({ name: f.name }))
      }
    })

    if (!drivers.fields.getByName('deleted_at')) {
      drivers.fields.add(new DateField({ name: 'deleted_at' }))
    }
    app.save(drivers)

    // 3. Vehicles Update
    let vehicles = app.findCollectionByNameOrId('vehicles')

    if (!vehicles.fields.getByName('local_id')) {
      vehicles.fields.add(new TextField({ name: 'local_id' }))
    }

    const vehiclesRemove = [
      'consumption',
      'insurance',
      'licensing',
      'tire_cost',
      'maintenance',
      'cleaning',
      'arla_32',
      'brand_model',
    ]
    vehiclesRemove.forEach((name) => {
      if (vehicles.fields.getByName(name)) vehicles.fields.removeByName(name)
    })

    const vehicleFields = [
      { name: 'plate', type: 'text' },
      { name: 'model', type: 'text' },
      { name: 'year', type: 'number' },
      { name: 'vehicle_type', type: 'text' },
      { name: 'purchase_value', type: 'number' },
      { name: 'resale_value', type: 'number' },
      { name: 'ipva', type: 'number' },
      { name: 'licenciamento', type: 'number' },
      { name: 'seguro_casco', type: 'number' },
      { name: 'rctrc', type: 'number' },
      { name: 'rcfdc', type: 'number' },
      { name: 'consumo', type: 'number' },
      { name: 'diesel_price', type: 'number' },
      { name: 'pneus_jogo', type: 'number' },
      { name: 'km_pneus', type: 'number' },
      { name: 'manutencao', type: 'number' },
      { name: 'usa_arla', type: 'bool' },
      { name: 'limpeza', type: 'number' },
      { name: 'averbacao', type: 'number' },
      { name: 'consulta', type: 'number' },
      { name: 'satelite', type: 'number' },
      { name: 'estimated_km', type: 'number' },
      { name: 'overrides', type: 'json' },
      { name: 'custom_fields', type: 'json' },
      { name: 'status', type: 'text' },
    ]

    vehicleFields.forEach((f) => {
      if (!vehicles.fields.getByName(f.name)) {
        if (f.type === 'text') vehicles.fields.add(new TextField({ name: f.name }))
        if (f.type === 'number') vehicles.fields.add(new NumberField({ name: f.name }))
        if (f.type === 'bool') vehicles.fields.add(new BoolField({ name: f.name }))
        if (f.type === 'json') vehicles.fields.add(new JSONField({ name: f.name }))
      }
    })

    if (!vehicles.fields.getByName('deleted_at')) {
      vehicles.fields.add(new DateField({ name: 'deleted_at' }))
    }
    app.save(vehicles)

    // 4. Vinculos Update
    let vinculos = app.findCollectionByNameOrId('vinculos')

    if (!vinculos.fields.getByName('local_id')) {
      vinculos.fields.add(new TextField({ name: 'local_id' }))
    }

    ;['driver_id', 'vehicle_id'].forEach((name) => {
      let field = vinculos.fields.getByName(name)
      if (field && field.type === 'text') {
        vinculos.fields.removeByName(name)
      }
    })

    if (!vinculos.fields.getByName('driver_id')) {
      vinculos.fields.add(
        new RelationField({ name: 'driver_id', collectionId: drivers.id, maxSelect: 1 }),
      )
    }
    if (!vinculos.fields.getByName('vehicle_id')) {
      vinculos.fields.add(
        new RelationField({ name: 'vehicle_id', collectionId: vehicles.id, maxSelect: 1 }),
      )
    }
    if (!vinculos.fields.getByName('km_mensal')) {
      vinculos.fields.add(new NumberField({ name: 'km_mensal' }))
    }
    if (!vinculos.fields.getByName('deleted_at')) {
      vinculos.fields.add(new DateField({ name: 'deleted_at' }))
    }
    app.save(vinculos)

    // 5. HQ Costs
    let hqCosts
    try {
      hqCosts = app.findCollectionByNameOrId('hq_costs')
    } catch (_) {
      hqCosts = new Collection({
        name: 'hq_costs',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule:
          "@request.auth.role ?= 'Supervisor Financeiro' || @request.auth.role ?= 'Diretor'",
        updateRule:
          "@request.auth.role ?= 'Supervisor Financeiro' || @request.auth.role ?= 'Diretor'",
        deleteRule:
          "@request.auth.role ?= 'Supervisor Financeiro' || @request.auth.role ?= 'Diretor'",
        fields: [
          { name: 'iptu', type: 'number' },
          { name: 'aluguel', type: 'number' },
          { name: 'agua', type: 'number' },
          { name: 'luz', type: 'number' },
          { name: 'internet', type: 'number' },
          { name: 'telefone', type: 'number' },
          { name: 'avcb', type: 'number' },
          { name: 'seguro_patrimonial', type: 'number' },
          { name: 'docas', type: 'number' },
          { name: 'custom_fields', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(hqCosts)
    }

    // 6. Taxes
    let taxes
    try {
      taxes = app.findCollectionByNameOrId('taxes')
    } catch (_) {
      taxes = new Collection({
        name: 'taxes',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule:
          "@request.auth.role ?= 'Supervisor Financeiro' || @request.auth.role ?= 'Diretor'",
        updateRule:
          "@request.auth.role ?= 'Supervisor Financeiro' || @request.auth.role ?= 'Diretor'",
        deleteRule:
          "@request.auth.role ?= 'Supervisor Financeiro' || @request.auth.role ?= 'Diretor'",
        fields: [
          { name: 'target_margin', type: 'number' },
          { name: 'das_rate', type: 'number' },
          { name: 'use_faixa', type: 'bool' },
          { name: 'faixa', type: 'text' },
          { name: 'cte_cost', type: 'number' },
          { name: 'docs_count', type: 'number' },
          { name: 'taxas_fiscal', type: 'number' },
          { name: 'dead_km', type: 'number' },
          { name: 'custom_fields', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(taxes)
    }

    // 7. CPK Settings
    let cpkSettings
    try {
      cpkSettings = app.findCollectionByNameOrId('cpk_settings')
    } catch (_) {
      try {
        cpkSettings = app.findCollectionByNameOrId('fleet_settings')
        cpkSettings.name = 'cpk_settings'[
          ('warning_margin', 'default_consumption', 'labor_charges', 'hq_costs', 'taxes_config')
        ].forEach((name) => {
          if (cpkSettings.fields.getByName(name)) cpkSettings.fields.removeByName(name)
        })
      } catch (_) {
        cpkSettings = new Collection({
          name: 'cpk_settings',
          type: 'base',
          fields: [
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
        })
      }
    }

    cpkSettings.listRule = "@request.auth.id != ''"
    cpkSettings.viewRule = "@request.auth.id != ''"
    cpkSettings.createRule =
      "@request.auth.role ?= 'Supervisor Financeiro' || @request.auth.role ?= 'Diretor'"
    cpkSettings.updateRule =
      "@request.auth.role ?= 'Supervisor Financeiro' || @request.auth.role ?= 'Diretor'"
    cpkSettings.deleteRule =
      "@request.auth.role ?= 'Supervisor Financeiro' || @request.auth.role ?= 'Diretor'"

    const cpkSettingsFields = [
      'max_cpk',
      'min_margin',
      'yellow_margin',
      'max_das',
      'das_rate',
      'cte_cost',
      'docs_count',
      'taxas_fiscal',
      'dead_km',
      'working_days',
      'vr_daily',
      'cesta_basica',
      'fuel_consumption',
      'fuel_price',
      'default_fgts',
      'default_decimo',
      'default_ferias',
      'default_pis',
      'var_cost_max_percent',
    ]
    cpkSettingsFields.forEach((name) => {
      if (!cpkSettings.fields.getByName(name)) {
        cpkSettings.fields.add(new NumberField({ name }))
      }
    })
    app.save(cpkSettings)

    // 8. CPK Calculations
    let cpkCalc
    try {
      cpkCalc = app.findCollectionByNameOrId('cpk_calculations')
    } catch (_) {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      cpkCalc = new Collection({
        name: 'cpk_calculations',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule:
          "@request.auth.role ?= 'Supervisor Financeiro' || @request.auth.role ?= 'Funcionário Financeiro' || @request.auth.role ?= 'Diretor'",
        updateRule:
          "@request.auth.role ?= 'Supervisor Financeiro' || @request.auth.role ?= 'Funcionário Financeiro' || @request.auth.role ?= 'Diretor'",
        deleteRule:
          "@request.auth.role ?= 'Supervisor Financeiro' || @request.auth.role ?= 'Diretor'",
        fields: [
          { name: 'user_id', type: 'relation', collectionId: usersCol.id, maxSelect: 1 },
          { name: 'month_year', type: 'text' },
          { name: 'cpk', type: 'number' },
          { name: 'margin', type: 'number' },
          { name: 'faturamento', type: 'number' },
          { name: 'das_cost', type: 'number' },
          { name: 'das_percent', type: 'number' },
          { name: 'total_cost', type: 'number' },
          { name: 'estimated_km', type: 'number' },
          { name: 'costs', type: 'json' },
          { name: 'full_state', type: 'json' },
          { name: 'document_id', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(cpkCalc)
    }

    // 9. Deduplicate & Indexes
    const db = app.db()

    // Safety ALTERS
    try {
      db.newQuery("ALTER TABLE drivers ADD COLUMN `cpf` TEXT DEFAULT ''").execute()
    } catch (e) {}
    try {
      db.newQuery("ALTER TABLE drivers ADD COLUMN `local_id` TEXT DEFAULT ''").execute()
    } catch (e) {}
    try {
      db.newQuery("ALTER TABLE vehicles ADD COLUMN `plate` TEXT DEFAULT ''").execute()
    } catch (e) {}
    try {
      db.newQuery("ALTER TABLE vehicles ADD COLUMN `local_id` TEXT DEFAULT ''").execute()
    } catch (e) {}
    try {
      db.newQuery("ALTER TABLE vinculos ADD COLUMN `local_id` TEXT DEFAULT ''").execute()
    } catch (e) {}
    try {
      db.newQuery("ALTER TABLE cpk_calculations ADD COLUMN `document_id` TEXT DEFAULT ''").execute()
    } catch (e) {}

    // Deduplicate
    try {
      db.newQuery(
        `DELETE FROM drivers WHERE id NOT IN (SELECT MIN(id) FROM drivers GROUP BY cpf) AND cpf IS NOT NULL AND cpf != ''`,
      ).execute()
    } catch (e) {}
    try {
      db.newQuery(
        `DELETE FROM drivers WHERE id NOT IN (SELECT MIN(id) FROM drivers GROUP BY local_id) AND local_id IS NOT NULL AND local_id != ''`,
      ).execute()
    } catch (e) {}

    try {
      db.newQuery(
        `DELETE FROM vehicles WHERE id NOT IN (SELECT MIN(id) FROM vehicles GROUP BY plate) AND plate IS NOT NULL AND plate != ''`,
      ).execute()
    } catch (e) {}
    try {
      db.newQuery(
        `DELETE FROM vehicles WHERE id NOT IN (SELECT MIN(id) FROM vehicles GROUP BY local_id) AND local_id IS NOT NULL AND local_id != ''`,
      ).execute()
    } catch (e) {}

    try {
      db.newQuery(
        `DELETE FROM vinculos WHERE id NOT IN (SELECT MIN(id) FROM vinculos GROUP BY local_id) AND local_id IS NOT NULL AND local_id != ''`,
      ).execute()
    } catch (e) {}

    try {
      db.newQuery(
        `DELETE FROM cpk_calculations WHERE id NOT IN (SELECT MIN(id) FROM cpk_calculations GROUP BY document_id) AND document_id IS NOT NULL AND document_id != ''`,
      ).execute()
    } catch (e) {}

    // Add Indexes
    auditLogs = app.findCollectionByNameOrId('audit_logs')
    auditLogs.addIndex('idx_audit_logs_user_id', false, 'user_id', '')
    auditLogs.addIndex('idx_audit_logs_action', false, 'action', '')
    auditLogs.addIndex('idx_audit_logs_resource_type', false, 'resource_type', '')
    app.save(auditLogs)

    drivers = app.findCollectionByNameOrId('drivers')
    drivers.addIndex('idx_drivers_cpf', true, 'cpf', "`cpf` != '' AND `cpf` IS NOT NULL")
    drivers.addIndex(
      'idx_drivers_local_id',
      true,
      'local_id',
      "`local_id` != '' AND `local_id` IS NOT NULL",
    )
    drivers.addIndex('idx_drivers_name', false, 'name', '')
    app.save(drivers)

    vehicles = app.findCollectionByNameOrId('vehicles')
    vehicles.addIndex('idx_vehicles_plate', true, 'plate', "`plate` != '' AND `plate` IS NOT NULL")
    vehicles.addIndex(
      'idx_vehicles_local_id',
      true,
      'local_id',
      "`local_id` != '' AND `local_id` IS NOT NULL",
    )
    app.save(vehicles)

    vinculos = app.findCollectionByNameOrId('vinculos')
    vinculos.addIndex(
      'idx_vinculos_local_id',
      true,
      'local_id',
      "`local_id` != '' AND `local_id` IS NOT NULL",
    )
    vinculos.addIndex('idx_vinculos_driver_id', false, 'driver_id', '')
    vinculos.addIndex('idx_vinculos_vehicle_id', false, 'vehicle_id', '')
    app.save(vinculos)

    cpkCalc = app.findCollectionByNameOrId('cpk_calculations')
    cpkCalc.addIndex('idx_cpk_calculations_user_id', false, 'user_id', '')
    cpkCalc.addIndex('idx_cpk_calculations_month_year', false, 'month_year', '')
    cpkCalc.addIndex(
      'idx_cpk_calculations_document_id',
      true,
      'document_id',
      "`document_id` != '' AND `document_id` IS NOT NULL",
    )
    app.save(cpkCalc)
  },
  (app) => {
    try {
      let cpkSettings = app.findCollectionByNameOrId('cpk_settings')
      cpkSettings.name = 'fleet_settings'
      app.save(cpkSettings)
    } catch (_) {}
  },
)
