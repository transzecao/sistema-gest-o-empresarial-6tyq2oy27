migrate(
  (app) => {
    const agendamentos = new Collection({
      name: 'agendamentos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'cliente_id', type: 'relation', required: false, collectionId: '_pb_users_auth_' },
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
        {
          name: 'veiculo_coleta_id',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('vehicles').id,
        },
        {
          name: 'veiculo_entrega_id',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('vehicles').id,
        },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(agendamentos)

    const rotas = app.findCollectionByNameOrId('routes')
    if (!rotas.fields.getByName('motorista_id'))
      rotas.fields.add(
        new RelationField({
          name: 'motorista_id',
          collectionId: app.findCollectionByNameOrId('drivers').id,
        }),
      )
    if (!rotas.fields.getByName('horario_estimado'))
      rotas.fields.add(new TextField({ name: 'horario_estimado' }))
    if (!rotas.fields.getByName('status'))
      rotas.fields.add(
        new SelectField({
          name: 'status',
          values: ['Pendente', 'Em Andamento', 'Concluída'],
          maxSelect: 1,
        }),
      )
    if (!rotas.fields.getByName('tipo_rota'))
      rotas.fields.add(
        new SelectField({ name: 'tipo_rota', values: ['Coleta', 'Entrega'], maxSelect: 1 }),
      )
    app.save(rotas)

    const paradas = new Collection({
      name: 'paradas_rota',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'rota_id', type: 'relation', required: true, collectionId: rotas.id },
        { name: 'agendamento_id', type: 'relation', required: true, collectionId: agendamentos.id },
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

    const audit = new Collection({
      name: 'audit_agendamentos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'agendamento_id', type: 'relation', required: true, collectionId: agendamentos.id },
        { name: 'user_id', type: 'relation', required: true, collectionId: '_pb_users_auth_' },
        { name: 'acao', type: 'text' },
        { name: 'detalhes', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(audit)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('audit_agendamentos'))
    app.delete(app.findCollectionByNameOrId('paradas_rota'))
    app.delete(app.findCollectionByNameOrId('configuracoes_agendamento'))
    app.delete(app.findCollectionByNameOrId('agendamentos'))
  },
)
