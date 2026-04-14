routerAdd(
  'POST',
  '/backend/v1/roteirizar',
  (e) => {
    const body = e.requestInfo().body
    const agendamentos = body.agendamentos || []
    const rotaData = body.rota || {}

    if (agendamentos.length === 0) {
      return e.badRequestError('Agendamentos não fornecidos')
    }

    const trafegusUrl = $os.getenv('TRAFEGUS_API_URL') || 'https://api.trafegus.example.com'

    try {
      console.log('Mocking Trafegus API Integration. Endpoint: ', trafegusUrl)

      const rotasCol = $app.findCollectionByNameOrId('routes')
      const rota = new Record(rotasCol)
      rota.set('data', new Date().toISOString())
      rota.set('horario_estimado', '08:00')
      rota.set('status', 'Pendente')
      rota.set('tipo_rota', rotaData.tipo_rota || 'Coleta')
      $app.save(rota)

      const paradasCol = $app.findCollectionByNameOrId('paradas_rota')
      const agendamentosCol = $app.findCollectionByNameOrId('agendamentos')

      for (let i = 0; i < agendamentos.length; i++) {
        const agId = agendamentos[i].id

        const parada = new Record(paradasCol)
        parada.set('rota_id', rota.id)
        parada.set('agendamento_id', agId)
        parada.set('ordem', i + 1)
        parada.set('horario_estimado', agendamentos[i].horario_estimado || '08:00-18:00')
        parada.set('status', 'Pendente')
        $app.save(parada)

        const ag = $app.findRecordById('agendamentos', agId)
        const novoStatus = rotaData.tipo_rota === 'Entrega' ? 'Saiu para Entrega' : 'Em Coleta'
        ag.set('status', novoStatus)
        $app.save(ag)
      }

      return e.json(200, { success: true, rota_id: rota.id })
    } catch (err) {
      console.error('Erro ao roteirizar no Trafegus: ', err)
      return e.internalServerError('Erro ao comunicar com Trafegus: ' + err.message)
    }
  },
  $apis.requireAuth(),
)
