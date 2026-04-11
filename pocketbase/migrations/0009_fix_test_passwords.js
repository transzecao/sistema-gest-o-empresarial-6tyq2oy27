migrate(
  (app) => {
    const emails = [
      'diretor@transzecao.com',
      'supervisor@transzecao.com',
      'funcionario@transzecao.com',
    ]

    for (const email of emails) {
      try {
        const record = app.findAuthRecordByEmail('users', email)
        record.setPassword('Skip@2026')
        app.save(record)
      } catch (_) {
        // Record might not exist, skip safely
      }
    }
  },
  (app) => {
    const emails = [
      'diretor@transzecao.com',
      'supervisor@transzecao.com',
      'funcionario@transzecao.com',
    ]

    for (const email of emails) {
      try {
        const record = app.findAuthRecordByEmail('users', email)
        record.setPassword('123456')
        app.save(record)
      } catch (_) {
        // Skip safely
      }
    }
  },
)
