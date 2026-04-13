migrate(
  (app) => {
    const collections = ['drivers', 'vehicles', 'vinculos']
    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        if (!col.fields.getByName('deleted_at')) {
          col.fields.add(new DateField({ name: 'deleted_at' }))
        }
        app.save(col)
      } catch (e) {
        console.log(`Collection ${name} not found or failed to update`, e)
      }
    }
  },
  (app) => {
    const collections = ['drivers', 'vehicles', 'vinculos']
    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        col.fields.removeByName('deleted_at')
        app.save(col)
      } catch (e) {
        console.log(`Collection ${name} not found or failed to revert`, e)
      }
    }
  },
)
