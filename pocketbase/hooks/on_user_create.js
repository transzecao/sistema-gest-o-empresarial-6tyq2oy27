onRecordCreate((e) => {
  if (!e.record.getString('role')) {
    e.record.set('role', 'Cliente')
  }
  if (e.record.getBool('active') === false) {
    e.record.set('active', true)
  }
  e.next()
}, 'users')
