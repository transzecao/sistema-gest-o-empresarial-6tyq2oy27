migrate(
  (app) => {
    const profilesCol = app.findCollectionByNameOrId('profiles')
    const usersCol = app.findCollectionByNameOrId('users')

    const roles = ['Diretor', 'Supervisor', 'Funcionário', 'Sub-função', 'Cliente']
    const profileIds = {}

    for (const role of roles) {
      try {
        const existing = app.findFirstRecordByData('profiles', 'name', role)
        profileIds[role] = existing.id
      } catch (_) {
        const record = new Record(profilesCol)
        record.set('name', role)
        record.set('description', `Perfil de ${role}`)
        app.save(record)
        profileIds[role] = record.id
      }
    }

    const usersToSeed = [
      {
        email: 'nikytafurchi@outlook.com',
        pass: 'Skip@Pass',
        name: 'Admin (Diretor)',
        role: 'Diretor',
      },
      {
        email: 'director@transzecao.com',
        pass: 'Skip@Pass123',
        name: 'Test Director',
        role: 'Diretor',
      },
      {
        email: 'supervisor@transzecao.com',
        pass: 'Skip@Pass123',
        name: 'Test Supervisor',
        role: 'Supervisor',
      },
      {
        email: 'employee@transzecao.com',
        pass: 'Skip@Pass123',
        name: 'Test Employee',
        role: 'Funcionário',
      },
      { email: 'sub@transzecao.com', pass: 'Skip@Pass123', name: 'Test Sub', role: 'Sub-função' },
      {
        email: 'client@transzecao.com',
        pass: 'Skip@Pass123',
        name: 'Test Client',
        role: 'Cliente',
      },
    ]

    for (const u of usersToSeed) {
      try {
        app.findAuthRecordByEmail('users', u.email)
      } catch (_) {
        const record = new Record(usersCol)
        record.setEmail(u.email)
        record.setPassword(u.pass)
        record.setVerified(true)
        record.set('name', u.name)
        if (profileIds[u.role]) {
          record.set('profile_id', profileIds[u.role])
        }
        app.save(record)
      }
    }
  },
  (app) => {
    // Empty down
  },
)
