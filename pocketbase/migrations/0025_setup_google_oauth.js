migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let changed = false
    if (!users.fields.getByName('active')) {
      users.fields.add(new BoolField({ name: 'active' }))
      changed = true
    }

    if (users.oauth2) {
      const providers = users.oauth2.providers || []
      const hasGoogle = providers.find((p) => p.name === 'google')

      if (!hasGoogle) {
        providers.push({
          name: 'google',
          clientId: $secrets.get('GOOGLE_CLIENT_ID') || 'setup_required',
          clientSecret: $secrets.get('GOOGLE_CLIENT_SECRET') || 'setup_required',
          authUrl: 'https://accounts.google.com/o/oauth2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          userApiUrl: 'https://www.googleapis.com/oauth2/v1/userinfo',
        })
        users.oauth2.providers = providers
        users.oauth2.enabled = true
        changed = true
      }
    }

    if (changed) {
      app.save(users)
    }

    try {
      app.db().newQuery('UPDATE users SET active = 1').execute()
    } catch (e) {
      console.log('Failed to update active status:', e)
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let changed = false
    if (users.fields.getByName('active')) {
      users.fields.removeByName('active')
      changed = true
    }

    if (users.oauth2) {
      const providers = users.oauth2.providers || []
      const initialLen = providers.length
      users.oauth2.providers = providers.filter((p) => p.name !== 'google')
      if (users.oauth2.providers.length !== initialLen) {
        changed = true
      }
    }

    if (changed) {
      app.save(users)
    }
  },
)
