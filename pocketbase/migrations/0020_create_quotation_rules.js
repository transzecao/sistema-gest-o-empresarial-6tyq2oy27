migrate(
  (app) => {
    const regras = new Collection({
      name: 'regras_motor',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'Supervisor Financeiro'",
      updateRule: "@request.auth.role = 'Supervisor Financeiro'",
      deleteRule: "@request.auth.role = 'Supervisor Financeiro'",
      fields: [
        { name: 'supervisor_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'nome', type: 'text', required: true },
        {
          name: 'tipo',
          type: 'select',
          values: ['taxa_despacho', 'custo_transporte', 'gris', 'ad_valorem', 'icms'],
          required: true,
          maxSelect: 1,
        },
        { name: 'valor', type: 'number' },
        { name: 'percentual', type: 'number' },
        { name: 'condicao', type: 'text' },
        { name: 'ativo', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(regras)

    const clusters = new Collection({
      name: 'clusters',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'Supervisor Financeiro'",
      updateRule: "@request.auth.role = 'Supervisor Financeiro'",
      deleteRule: "@request.auth.role = 'Supervisor Financeiro'",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'km_medio', type: 'number' },
        { name: 'frete_minimo', type: 'number', required: true },
        { name: 'ativo', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(clusters)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('clusters'))
    app.delete(app.findCollectionByNameOrId('regras_motor'))
  },
)
