import pb from '@/lib/pocketbase/client'
import { createAuditLog } from './auditLog'

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

export interface HQCosts {
  iptu?: number
  rent?: number
  water?: number
  light?: number
  internet?: number
  phone?: number
  custom_fields?: Array<{ id: string; name: string; value: number }>
}

export interface TaxesConfig {
  use_simplified_bracket?: boolean
  bracket_level?: number
  cte_mdfe_cost?: number
  monthly_docs?: number
  annual_fiscal_fees?: number
  dead_km?: number
  custom_fields?: Array<{ id: string; name: string; value: number }>
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
  hq_costs?: HQCosts
  taxes_config?: TaxesConfig
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
  const oldRecord = await pb.collection('fleet_settings').getOne<FleetSettings>(id)
  const record = await pb.collection('fleet_settings').update<FleetSettings>(id, data)
  await createAuditLog({
    action: 'UPDATE_FLEET_SETTINGS',
    resource_type: 'FLEET_SETTINGS',
    resource_id: record.id,
    old_value: JSON.stringify(oldRecord),
    new_value: JSON.stringify(record),
    status: 'SUCCESS',
  })
  return record
}
