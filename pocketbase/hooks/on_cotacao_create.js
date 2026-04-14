onRecordCreate((e) => {
  if (!e.record.getString('codigo')) {
    const random = $security.randomStringWithAlphabet(6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
    e.record.set('codigo', 'COT-' + random)
  }
  e.next()
}, 'cotacoes')
