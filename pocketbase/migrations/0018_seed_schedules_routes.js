migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'nikytafurchi@outlook.com')
    } catch (_) {
      return // no admin, skip seed
    }

    const schedules = app.findCollectionByNameOrId('schedules')

    if (app.countRecords('schedules') === 0) {
      const seeds = [
        {
          client_id: admin.id,
          origin_cnpj: '12.345.678/0001-90',
          origin_address: 'Av. Paulista, 1000 - São Paulo, SP',
          dest_cnpj: '98.765.432/0001-10',
          dest_address: 'Rua das Flores, 123 - Campinas, SP',
          weight: 150.5,
          dimensions: '100x100x120',
          package_qty: 2,
          cargo_type: 'aberto',
          invoice_nf: 'NF-10001',
          priority: 'Urgente',
          status: 'Fila',
        },
        {
          client_id: admin.id,
          origin_cnpj: '12.345.678/0001-90',
          origin_address: 'Av. Paulista, 1000 - São Paulo, SP',
          dest_cnpj: '55.444.333/0001-99',
          dest_address: 'Av. Brasil, 500 - Jundiaí, SP',
          weight: 50,
          dimensions: '50x50x50',
          package_qty: 1,
          cargo_type: 'aberto',
          invoice_nf: 'NF-10002',
          priority: 'Manhã',
          status: 'Fila',
        },
        {
          client_id: admin.id,
          origin_cnpj: '12.345.678/0001-90',
          origin_address: 'Av. Paulista, 1000 - São Paulo, SP',
          dest_cnpj: '11.222.333/0001-88',
          dest_address: 'Rua XV de Novembro, 800 - Sorocaba, SP',
          weight: 300,
          dimensions: '200x150x150',
          package_qty: 3,
          cargo_type: 'fechado',
          invoice_nf: 'NF-10003',
          priority: 'Comercial',
          status: 'Devolvido',
        },
      ]

      seeds.forEach((s) => {
        const record = new Record(schedules)
        Object.entries(s).forEach(([k, v]) => record.set(k, v))
        app.save(record)
      })
    }
  },
  (app) => {
    app.db().newQuery('DELETE FROM schedules').execute()
  },
)
