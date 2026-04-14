migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('configuracoes_agendamento')
    const records = app.findRecordsByFilter(col.id, "id != ''", '', 1, 0)

    if (records.length === 0) {
      const record = new Record(col)
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
  },
  (app) => {},
)
