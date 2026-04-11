migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')
    const passField = usersCol.fields.getByName('password')
    if (passField) {
      passField.min = 6
      app.save(usersCol)
    }

    const profilesCol = app.findCollectionByNameOrId('profiles')

    const roles = ['Diretor', 'Supervisor', 'Funcionário', 'Sub-função', 'Cliente']
    const profileIds = {}

    for (const role of roles) {
      let profile
      try {
        profile = app.findFirstRecordByData('profiles', 'name', role)
      } catch (_) {
        profile = new Record(profilesCol)
        profile.set('name', role)
        app.save(profile)
      }
      profileIds[role] = profile.id
    }

    const users = [
      { email: 'diretor@transzecao.com', pass: '123456', role: 'Diretor', name: 'Diretor Silva' },
      {
        email: 'supervisor@transzecao.com',
        pass: '123456',
        role: 'Supervisor',
        name: 'Supervisor Santos',
      },
      {
        email: 'funcionario@transzecao.com',
        pass: '123456',
        role: 'Funcionário',
        name: 'Funcionario Oliveira',
      },
      { email: 'sub@transzecao.com', pass: '123456', role: 'Sub-função', name: 'Sub Assistente' },
      { email: 'cliente@transzecao.com', pass: '123456', role: 'Cliente', name: 'Cliente VIP' },
    ]

    for (const u of users) {
      try {
        app.findAuthRecordByEmail('users', u.email)
      } catch (_) {
        const user = new Record(usersCol)
        user.setEmail(u.email)
        user.setPassword(u.pass)
        user.setVerified(true)
        user.set('name', u.name)
        user.set('profile_id', profileIds[u.role])
        app.save(user)
      }
    }
  },
  (app) => {
    // Try to remove users if rollback is requested
    const emails = [
      'diretor@transzecao.com',
      'supervisor@transzecao.com',
      'funcionario@transzecao.com',
      'sub@transzecao.com',
      'cliente@transzecao.com',
    ]
    for (const email of emails) {
      try {
        const u = app.findAuthRecordByEmail('users', email)
        app.delete(u)
      } catch (_) {}
    }
  },
)
