import pb from '@/lib/pocketbase/client'

export interface LaborCharges {
  max_das?: number
  cte_cost?: number
  monthly_docs?: number
  fiscal_taxes?: number
  working_days?: number
  vr_daily?: number
  basic_basket?: number
  fgts?: number
  thirteenth?: number
  vacation?: number
  pis?: number
  [key: string]: number | undefined
}

export interface FleetSettings {
  id: string
  das_rate: number
  min_margin: number
  warning_margin: number
  max_cpk: number
  fuel_price: number
  default_consumption: number
  labor_charges: LaborCharges
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
