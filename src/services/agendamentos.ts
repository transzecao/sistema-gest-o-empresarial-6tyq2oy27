import pb from '@/lib/pocketbase/client'

export const getAgendamentos = async (filter?: string) => {
  return pb.collection('agendamentos').getFullList({ filter, sort: '-created' })
}

export const createAgendamento = async (data: any) => {
  return pb.collection('agendamentos').create(data)
}

export const updateAgendamentoStatus = async (id: string, status: string, fase_atual?: string) => {
  const data: any = { status }
  if (fase_atual) data.fase_atual = fase_atual
  return pb.collection('agendamentos').update(id, data)
}

export const roteirizarAgendamentos = async (agendamentos: any[], rotaData: any) => {
  return pb.send('/backend/v1/roteirizar', {
    method: 'POST',
    body: JSON.stringify({ agendamentos, rota: rotaData }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const getConfiguracoes = async () => {
  const records = await pb.collection('configuracoes_agendamento').getFullList()
  return records[0]
}

export const updateConfiguracoes = async (id: string, data: any) => {
  return pb.collection('configuracoes_agendamento').update(id, data)
}
