migrate(
  (app) => {
    // 1. Update API rules for all collections to allow authenticated access
    // profiles, permissions, and audit_logs already have "@request.auth.id != ''" in the schema,
    // but we enforce it here for users to meet the acceptance criteria.
    try {
      const usersCol = app.findCollectionByNameOrId('users')
      usersCol.listRule = "@request.auth.id != ''"
      usersCol.viewRule = "@request.auth.id != ''"
      app.save(usersCol)
    } catch (e) {
      console.log('Failed to update users collection rules:', e)
    }

    // 2. Seed Profiles
    const profilesCol = app.findCollectionByNameOrId('profiles')
    const profileNames = ['Diretor', 'Supervisor', 'Funcionário', 'Sub-função', 'Cliente']
    const profileIds = {}

    for (const name of profileNames) {
      try {
        const existing = app.findFirstRecordByData('profiles', 'name', name)
        profileIds[name] = existing.id
      } catch (_) {
        const record = new Record(profilesCol)
        record.set('name', name)
        record.set('description', `Perfil de acesso: ${name}`)
        app.save(record)
        profileIds[name] = record.id
      }
    }

    // 3. Seed Users
    const usersCol = app.findCollectionByNameOrId('users')
    const usersToSeed = [
      { email: 'diretor@transzecao.com', profileName: 'Diretor', name: 'Diretor Teste' },
      { email: 'supervisor@transzecao.com', profileName: 'Supervisor', name: 'Supervisor Teste' },
      {
        email: 'funcionario@transzecao.com',
        profileName: 'Funcionário',
        name: 'Funcionário Teste',
      },
    ]

    for (const u of usersToSeed) {
      try {
        app.findAuthRecordByEmail('users', u.email)
      } catch (_) {
        const record = new Record(usersCol)
        record.setEmail(u.email)
        record.setPassword('Skip@Pass123')
        record.setVerified(true)
        record.set('name', u.name)

        if (profileIds[u.profileName]) {
          record.set('profile_id', profileIds[u.profileName])
        }

        app.save(record)
      }
    }
  },
  (app) => {
    // 1. Revert API rules for users
    try {
      const usersCol = app.findCollectionByNameOrId('users')
      usersCol.listRule = 'id = @request.auth.id'
      usersCol.viewRule = 'id = @request.auth.id'
      app.save(usersCol)
    } catch (_) {}

    // 2. Delete seeded users
    const emails = [
      'diretor@transzecao.com',
      'supervisor@transzecao.com',
      'funcionario@transzecao.com',
    ]
    for (const email of emails) {
      try {
        const record = app.findAuthRecordByEmail('users', email)
        app.delete(record)
      } catch (_) {}
    }

    // 3. Delete seeded profiles
    const profileNames = ['Diretor', 'Supervisor', 'Funcionário', 'Sub-função', 'Cliente']
    for (const name of profileNames) {
      try {
        const record = app.findFirstRecordByData('profiles', 'name', name)
        app.delete(record)
      } catch (_) {}
    }
  },
)
