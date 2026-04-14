migrate(
  (app) => {
    app
      .db()
      .newQuery(`
    DELETE FROM agendamentos WHERE id NOT IN (
      SELECT MIN(id) FROM agendamentos GROUP BY numero_nota_fiscal
    ) AND numero_nota_fiscal != '' AND numero_nota_fiscal IS NOT NULL
  `)
      .execute()

    const col = app.findCollectionByNameOrId('agendamentos')
    col.addIndex('idx_agendamentos_nf', true, 'numero_nota_fiscal', "numero_nota_fiscal != ''")
    col.addIndex('idx_agendamentos_cliente', false, 'cliente_id', '')
    app.save(col)

    const rotas = app.findCollectionByNameOrId('routes')
    rotas.addIndex('idx_rotas_motorista', false, 'motorista_id', '')
    rotas.addIndex('idx_rotas_data', false, 'data', '')
    app.save(rotas)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('agendamentos')
    col.removeIndex('idx_agendamentos_nf')
    col.removeIndex('idx_agendamentos_cliente')
    app.save(col)
  },
)
