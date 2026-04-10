migrate(
  (app) => {
    const profilesId = app.findCollectionByNameOrId('profiles').id
    const users = app.findCollectionByNameOrId('users')

    users.fields.add(
      new RelationField({
        name: 'profile_id',
        collectionId: profilesId,
        maxSelect: 1,
        required: false,
      }),
    )
    users.fields.add(new TextField({ name: 'sector' }))
    users.fields.add(new TextField({ name: 'sub_function' }))

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('profile_id')
    users.fields.removeByName('sector')
    users.fields.removeByName('sub_function')
    app.save(users)
  },
)
