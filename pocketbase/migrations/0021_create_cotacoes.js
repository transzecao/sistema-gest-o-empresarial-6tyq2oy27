migrate(
  (app) => {
    const clustersCol = app.findCollectionByNameOrId('clusters')

    const cotacoes = new Collection({
      name: 'cotacoes',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'Supervisor Financeiro' || usuario_id = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'Supervisor Financeiro' || usuario_id = @request.auth.id)",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'Supervisor Financeiro' || usuario_id = @request.auth.id)",
      deleteRule: "@request.auth.role = 'Supervisor Financeiro'",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
        },
        { name: 'cnpj_remetente', type: 'text', required: true },
        { name: 'endereco_remetente', type: 'text', required: true },
        { name: 'lat_remetente', type: 'number' },
        { name: 'lng_remetente', type: 'number' },
        { name: 'cnpj_destinatario', type: 'text', required: true },
        { name: 'endereco_destinatario', type: 'text', required: true },
        { name: 'lat_destinatario', type: 'number' },
        { name: 'lng_destinatario', type: 'number' },
        { name: 'peso_fisico', type: 'number', required: true },
        { name: 'largura', type: 'number', required: true },
        { name: 'altura', type: 'number', required: true },
        { name: 'profundidade', type: 'number', required: true },
        { name: 'quantidade', type: 'number', required: true },
        { name: 'tipo_carga', type: 'text' },
        { name: 'valor_nf', type: 'number', required: true },
        { name: 'cluster', type: 'text' },
        { name: 'peso_tarifavel', type: 'number' },
        { name: 'valor_original', type: 'number' },
        { name: 'desconto_percentual', type: 'number' },
        { name: 'motivo_desconto', type: 'text' },
        { name: 'valor_override', type: 'number' },
        { name: 'motivo_override', type: 'text' },
        { name: 'valor_final', type: 'number', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['gerada', 'alterada', 'agendada'],
          maxSelect: 1,
        },
        {
          name: 'origem',
          type: 'select',
          values: [
            'Funcionario_Financeiro',
            'Funcionario_Operacional',
            'Funcionario_Prospeccao',
            'Cliente',
          ],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_cotacoes_usuario ON cotacoes (usuario_id)',
        'CREATE INDEX idx_cotacoes_cluster ON cotacoes (cluster)',
        'CREATE INDEX idx_cotacoes_created ON cotacoes (created DESC)',
      ],
    })
    app.save(cotacoes)

    const audit = new Collection({
      name: 'audit_cotacoes',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.role = 'Supervisor Financeiro'",
      viewRule: "@request.auth.id != '' && @request.auth.role = 'Supervisor Financeiro'",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
        },
        {
          name: 'cotacao_id',
          type: 'relation',
          collectionId: cotacoes.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'acao', type: 'text', required: true },
        { name: 'valor_anterior', type: 'json' },
        { name: 'valor_novo', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_audit_cotacoes_cotacao ON audit_cotacoes (cotacao_id)'],
    })
    app.save(audit)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('audit_cotacoes'))
    app.delete(app.findCollectionByNameOrId('cotacoes'))
  },
)
