migrate(
  (app) => {
    const usersId = app.findCollectionByNameOrId('users').id
    const collection = new Collection({
      name: 'audit_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'user_id', type: 'relation', collectionId: usersId, maxSelect: 1, required: true },
        { name: 'action', type: 'text', required: true },
        { name: 'resource_type', type: 'text', required: true },
        { name: 'resource_id', type: 'text' },
        { name: 'details', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('audit_logs')
    app.delete(collection)
  },
)
