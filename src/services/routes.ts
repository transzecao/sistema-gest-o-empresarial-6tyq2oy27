import pb from '@/lib/pocketbase/client'

export const createRoute = async (data: any) => {
  const record = await pb.collection('routes').create(data)
  try {
    await pb.collection('audit_logs').create({
      user_id: pb.authStore.record?.id,
      action: 'create',
      resource_type: 'routes',
      resource_id: record.id,
      details: { stop_sequence: data.stop_sequence },
    })
  } catch (e) {}
  return record
}
