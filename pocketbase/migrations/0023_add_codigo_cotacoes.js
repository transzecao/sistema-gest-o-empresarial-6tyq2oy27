migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('cotacoes')
    if (!col.fields.getByName('codigo')) {
      col.fields.add(new TextField({ name: 'codigo' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('cotacoes')
    col.fields.removeByName('codigo')
    app.save(col)
  },
)
