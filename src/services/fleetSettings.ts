import pb from '@/lib/pocketbase/client'

export interface FleetSettings {
  id: string
  das_rate: number
  min_margin: number
  warning_margin: number
  max_cpk: number
  fuel_price: number
  default_consumption: number
  labor_charges: Record<string, number>
}

export async function getFleetSettings(): Promise<FleetSettings | null> {
  try {
    const records = await pb.collection('fleet_settings').getFullList<FleetSettings>()
    return records[0] || null
  } catch (err) {
    console.error('Failed to fetch fleet settings', err)
    return null
  }
}

export async function updateFleetSettings(id: string, data: Partial<FleetSettings>) {
  return await pb.collection('fleet_settings').update<FleetSettings>(id, data)
}
