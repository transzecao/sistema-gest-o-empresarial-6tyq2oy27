migrate(
  (app) => {
    // 1. Create agendamentos
    let agendamentos
    try {
      agendamentos = app.findCollectionByNameOrId('agendamentos')
    } catch (_) {
      agendamentos = new Collection({
        name: 'agendamentos',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        indexes: [
          "CREATE UNIQUE INDEX idx_agendamentos_nf ON agendamentos (numero_nota_fiscal) WHERE numero_nota_fiscal != '' AND numero_nota_fiscal IS NOT NULL",
          'CREATE INDEX idx_agendamentos_cliente ON agendamentos (cliente_id)',
        ],
        fields: [
          {
            name: 'cliente_id',
            type: 'relation',
            required: false,
            collectionId: '_pb_users_auth_',
          },
          {
            name: 'funcionario_id',
            type: 'relation',
            required: false,
            collectionId: '_pb_users_auth_',
          },
          { name: 'cnpj_origem', type: 'text' },
          { name: 'endereco_origem', type: 'text' },
          { name: 'lat_origem', type: 'number' },
          { name: 'lng_origem', type: 'number' },
          { name: 'cnpj_destino', type: 'text' },
          { name: 'endereco_destino', type: 'text' },
          { name: 'lat_destino', type: 'number' },
          { name: 'lng_destino', type: 'number' },
          { name: 'peso', type: 'number' },
          { name: 'largura', type: 'number' },
          { name: 'altura', type: 'number' },
          { name: 'profundidade', type: 'number' },
          { name: 'quantidade_pacotes', type: 'number', min: 1, max: 3 },
          { name: 'tipo_carga', type: 'text' },
          { name: 'numero_nota_fiscal', type: 'text', required: true },
          { name: 'hora_desejada', type: 'text' },
          {
            name: 'prioridade',
            type: 'select',
            values: ['Urgente', 'Manhã', 'Tarde', 'Comercial'],
            maxSelect: 1,
            required: true,
          },
          {
            name: 'status',
            type: 'select',
            values: [
              'Aguardando Coleta',
              'Em Coleta',
              'Aguardando Entrega',
              'Saiu para Entrega',
              'Concluído',
              'Cancelado',
              'Rejeitado',
              'Devolvido',
            ],
            maxSelect: 1,
          },
          { name: 'fase_atual', type: 'select', values: ['Coleta', 'Entrega'], maxSelect: 1 },
          { name: 'created', type: 'autodate', onCreate: true },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })

      try {
        const vehiclesId = app.findCollectionByNameOrId('vehicles').id
        agendamentos.fields.add(
          new RelationField({ name: 'veiculo_coleta_id', collectionId: vehiclesId }),
        )
        agendamentos.fields.add(
          new RelationField({ name: 'veiculo_entrega_id', collectionId: vehiclesId }),
        )
      } catch (_) {}

      app.save(agendamentos)
    }

    const agendamentosId = agendamentos.id

    // 2. Update routes safely
    try {
      const rotas = app.findCollectionByNameOrId('routes')

      try {
        const driversId = app.findCollectionByNameOrId('drivers').id
        if (!rotas.fields.getByName('motorista_id')) {
          rotas.fields.add(new RelationField({ name: 'motorista_id', collectionId: driversId }))
        }
      } catch (_) {}

      if (!rotas.fields.getByName('horario_estimado')) {
        rotas.fields.add(new TextField({ name: 'horario_estimado' }))
      }
      if (!rotas.fields.getByName('status')) {
        rotas.fields.add(
          new SelectField({
            name: 'status',
            values: ['Pendente', 'Em Andamento', 'Concluída'],
            maxSelect: 1,
          }),
        )
      }
      if (!rotas.fields.getByName('tipo_rota')) {
        rotas.fields.add(
          new SelectField({ name: 'tipo_rota', values: ['Coleta', 'Entrega'], maxSelect: 1 }),
        )
      }
      if (!rotas.fields.getByName('data')) {
        rotas.fields.add(new DateField({ name: 'data' }))
      }

      // IMPORTANT: Fix invalid collectionId values in existing routes relation fields that triggered "referenced collection does not exist"
      for (let f of rotas.fields) {
        if (f.type === 'relation' && f.collectionId === 'agendamentos') {
          f.collectionId = agendamentosId
        }
      }

      rotas.addIndex('idx_rotas_motorista', false, 'motorista_id', '')
      rotas.addIndex('idx_rotas_data', false, 'data', '')

      app.save(rotas)
    } catch (_) {}

    // 3. Create paradas_rota
    try {
      app.findCollectionByNameOrId('paradas_rota')
    } catch (_) {
      const rotasId = app.findCollectionByNameOrId('routes').id
      const paradas = new Collection({
        name: 'paradas_rota',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'rota_id', type: 'relation', required: true, collectionId: rotasId },
          {
            name: 'agendamento_id',
            type: 'relation',
            required: true,
            collectionId: agendamentosId,
          },
          { name: 'ordem', type: 'number' },
          { name: 'horario_estimado', type: 'text' },
          { name: 'horario_real', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['Pendente', 'Concluída', 'Insucesso'],
            maxSelect: 1,
          },
          { name: 'motivo_insucesso', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(paradas)
    }

    // 4. Create configuracoes_agendamento
    try {
      app.findCollectionByNameOrId('configuracoes_agendamento')
    } catch (_) {
      const config = new Collection({
        name: 'configuracoes_agendamento',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: null,
        fields: [
          { name: 'campos_obrigatorios', type: 'json' },
          { name: 'campos_customizados', type: 'json' },
          { name: 'regras_negocio', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(config)

      // Seed config
      const record = new Record(config)
      record.set(
        'campos_obrigatorios',
        JSON.stringify({
          cnpj_origem: true,
          endereco_origem: true,
          cnpj_destino: true,
          endereco_destino: true,
          peso: true,
          largura: true,
          altura: true,
          profundidade: true,
          quantidade_pacotes: true,
          tipo_carga: false,
          numero_nota_fiscal: true,
        }),
      )
      record.set('campos_customizados', JSON.stringify([]))
      record.set(
        'regras_negocio',
        JSON.stringify({
          max_coletas_dia: 50,
          peso_min: 0.1,
          peso_max: 1000,
          horario_operacao: '08:00-18:00',
        }),
      )
      app.save(record)
    }

    // 5. Create audit_agendamentos
    try {
      app.findCollectionByNameOrId('audit_agendamentos')
    } catch (_) {
      const audit = new Collection({
        name: 'audit_agendamentos',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: null,
        deleteRule: null,
        fields: [
          {
            name: 'agendamento_id',
            type: 'relation',
            required: true,
            collectionId: agendamentosId,
          },
          { name: 'user_id', type: 'relation', required: true, collectionId: '_pb_users_auth_' },
          { name: 'acao', type: 'text' },
          { name: 'detalhes', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(audit)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('audit_agendamentos'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('paradas_rota'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('configuracoes_agendamento'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('agendamentos'))
    } catch (_) {}
  },
)
