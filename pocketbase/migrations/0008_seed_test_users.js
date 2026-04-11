migrate(
  (app) => {
    const profilesCol = app.findCollectionByNameOrId('profiles')
    const usersCol = app.findCollectionByNameOrId('users')

    // Temporarily adjust password constraints if needed to allow '123456'
    let modified = false
    if (usersCol.passwordAuth && usersCol.passwordAuth.minPasswordLength > 6) {
      usersCol.passwordAuth.minPasswordLength = 6
      modified = true
    }
    if (usersCol.fields) {
      const passwordField = usersCol.fields.getByName('password')
      if (passwordField && passwordField.min > 6) {
        passwordField.min = 6
        modified = true
      }
    }
    if (modified) {
      app.save(usersCol)
    }

    const profiles = ['Diretor', 'Supervisor', 'Funcionário', 'Sub-função', 'Cliente']
    const profileIds = {}

    for (const name of profiles) {
      try {
        const record = app.findFirstRecordByData('profiles', 'name', name)
        profileIds[name] = record.id
      } catch (_) {
        const record = new Record(profilesCol)
        record.set('name', name)
        app.save(record)
        profileIds[name] = record.id
      }
    }

    const testUsers = [
      { email: 'diretor@transzecao.com', profile: 'Diretor' },
      { email: 'supervisor@transzecao.com', profile: 'Supervisor' },
      { email: 'funcionario@transzecao.com', profile: 'Funcionário' },
    ]

    for (const tu of testUsers) {
      try {
        app.findAuthRecordByEmail('users', tu.email)
      } catch (_) {
        const record = new Record(usersCol)
        record.setEmail(tu.email)
        record.setPassword('123456')
        record.setVerified(true)
        record.set('name', tu.profile)
        record.set('profile_id', profileIds[tu.profile])
        app.save(record)
      }
    }
  },
  (app) => {
    const testEmails = [
      'diretor@transzecao.com',
      'supervisor@transzecao.com',
      'funcionario@transzecao.com',
    ]
    for (const email of testEmails) {
      try {
        const record = app.findAuthRecordByEmail('users', email)
        app.delete(record)
      } catch (_) {}
    }
  },
)
