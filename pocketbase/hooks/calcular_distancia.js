routerAdd(
  'POST',
  '/backend/v1/calcular-distancia',
  (e) => {
    const body = e.requestInfo().body
    if (!body.origem || !body.destino) {
      return e.badRequestError('Os campos origem e destino são obrigatórios.')
    }

    const apiKey = $secrets.get('GOOGLE_MAPS_API_KEY')

    if (!apiKey) {
      // Fallback if no API key is configured
      const distMock = Math.floor(Math.random() * 400) + 20
      return e.json(200, {
        distancia_km: distMock,
        tempo_minutos: Math.floor(distMock * 1.5),
        mock: true,
      })
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(body.origem)}&destinations=${encodeURIComponent(body.destino)}&key=${apiKey}`
    const res = $http.send({ url: url, method: 'GET', timeout: 15 })

    if (res.statusCode !== 200 || !res.json || res.json.status !== 'OK') {
      return e.json(200, { distancia_km: 150, tempo_minutos: 120, mock: true })
    }

    const element = res.json.rows[0].elements[0]
    if (element.status !== 'OK') {
      return e.json(200, { distancia_km: 150, tempo_minutos: 120, mock: true })
    }

    return e.json(200, {
      distancia_km: element.distance.value / 1000,
      tempo_minutos: element.duration.value / 60,
      mock: false,
    })
  },
  $apis.requireAuth(),
)
