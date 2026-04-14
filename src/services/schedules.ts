import pb from '@/lib/pocketbase/client'

export const getSchedules = async (filter?: string) => {
  return pb.collection('schedules').getFullList({ filter, sort: '-created' })
}

export const getScheduleByNF = async (nf: string) => {
  try {
    return await pb.collection('schedules').getFirstListItem(`invoice_nf="${nf}"`)
  } catch {
    return null
  }
}

export const createSchedule = async (data: any) => {
  const record = await pb.collection('schedules').create(data)
  try {
    await pb.collection('audit_logs').create({
      user_id: pb.authStore.record?.id,
      action: 'create',
      resource_type: 'schedules',
      resource_id: record.id,
      details: { status: data.status, invoice_nf: data.invoice_nf },
    })
  } catch (e) {
    // ignore audit log failure
  }
  return record
}

export const updateScheduleStatus = async (id: string, status: string, time_slot?: string) => {
  const data: any = { status }
  if (time_slot) data.time_slot = time_slot
  const record = await pb.collection('schedules').update(id, data)
  try {
    await pb.collection('audit_logs').create({
      user_id: pb.authStore.record?.id,
      action: 'update_status',
      resource_type: 'schedules',
      resource_id: record.id,
      details: { status, time_slot },
    })
  } catch (e) {
    // ignore audit log failure
  }
  return record
}
