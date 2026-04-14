routerAdd('POST', '/backend/v1/omnilink/webhook', (e) => {
  const body = e.requestInfo().body

  if (!body.parada_id || !body.status) {
    return e.badRequestError('Invalid payload. Required: parada_id, status')
  }

  try {
    const parada = $app.findRecordById('paradas_rota', body.parada_id)
    parada.set('status', body.status)
    parada.set('horario_real', new Date().toISOString())

    if (body.motivo_insucesso) {
      parada.set('motivo_insucesso', body.motivo_insucesso)
    }
    $app.save(parada)

    const agId = parada.get('agendamento_id')
    const ag = $app.findRecordById('agendamentos', agId)

    if (body.status === 'Concluída') {
      if (ag.get('fase_atual') === 'Coleta') {
        ag.set('fase_atual', 'Entrega')
        ag.set('status', 'Aguardando Entrega')
      } else {
        ag.set('status', 'Concluído')
      }
    } else if (body.status === 'Insucesso') {
      ag.set('status', 'Rejeitado')
    }

    $app.save(ag)
    return e.json(200, { success: true })
  } catch (err) {
    console.error('Erro no Webhook Omnilink: ', err)
    return e.internalServerError('Webhook falhou ao processar a requisição.')
  }
})
