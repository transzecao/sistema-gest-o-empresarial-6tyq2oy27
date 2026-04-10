migrate(
  (app) => {
    const profilesId = app.findCollectionByNameOrId('profiles').id
    const collection = new Collection({
      name: 'permissions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'profile_id',
          type: 'relation',
          collectionId: profilesId,
          maxSelect: 1,
          required: true,
        },
        { name: 'permission_name', type: 'text', required: true },
        { name: 'resource', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('permissions')
    app.delete(collection)
  },
)
