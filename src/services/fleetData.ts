import pb from '@/lib/pocketbase/client'
import { createAuditLog } from './auditLog'

export interface Driver {
  id: string
  local_id: string
  name: string
  deleted_at?: string
}

export interface Vehicle {
  id: string
  local_id: string
  plate: string
  purchase_value?: number
  resale_value?: number
  brand_model?: string
  year?: number
  vehicle_type?: string
  consumption?: number
  diesel_price?: number
  ipva?: number
  licensing?: number
  insurance?: number
  tire_cost?: number
  maintenance?: number
  cleaning?: number
  arla_32?: boolean
  deleted_at?: string
}

export interface Vinculo {
  id: string
  local_id: string
  driver_id: string
  vehicle_id: string
  estimated_km?: number
  deleted_at?: string
}

export async function getDrivers() {
  return pb.collection('drivers').getFullList<Driver>({
    filter: 'deleted_at = "" || deleted_at = null',
  })
}

export async function getVehicles() {
  return pb.collection('vehicles').getFullList<Vehicle>({
    filter: 'deleted_at = "" || deleted_at = null',
  })
}

export async function getVinculos() {
  return pb.collection('vinculos').getFullList<Vinculo>({
    filter: 'deleted_at = "" || deleted_at = null',
  })
}

export async function createDriver(data: Partial<Driver>) {
  const record = await pb.collection('drivers').create<Driver>(data)
  await createAuditLog({
    action: 'CREATE_DRIVER',
    resource_type: 'DRIVER',
    resource_id: record.id,
    new_value: record.name,
    status: 'SUCCESS',
  })
  return record
}

export async function updateVehicle(id: string, data: Partial<Vehicle>) {
  const oldRecord = await pb.collection('vehicles').getOne<Vehicle>(id)
  const record = await pb.collection('vehicles').update<Vehicle>(id, data)
  await createAuditLog({
    action: 'UPDATE_VEHICLE',
    resource_type: 'VEHICLE',
    resource_id: record.id,
    old_value: JSON.stringify(oldRecord),
    new_value: JSON.stringify(record),
    status: 'SUCCESS',
  })
  return record
}

export async function createVehicle(data: Partial<Vehicle>) {
  const record = await pb.collection('vehicles').create<Vehicle>(data)
  await createAuditLog({
    action: 'CREATE_VEHICLE',
    resource_type: 'VEHICLE',
    resource_id: record.id,
    new_value: record.plate,
    status: 'SUCCESS',
  })
  return record
}

export async function createVinculo(data: Partial<Vinculo>) {
  const record = await pb.collection('vinculos').create<Vinculo>(data)
  await createAuditLog({
    action: 'CREATE_VINCULO',
    resource_type: 'VINCULO',
    resource_id: record.id,
    new_value: `${record.driver_id} - ${record.vehicle_id}`,
    status: 'SUCCESS',
  })
  return record
}

export async function softDeleteDriver(id: string) {
  try {
    // Check for active vinculos
    const activeVinculos = await pb.collection('vinculos').getFullList({
      filter: `driver_id = "${id}" && (deleted_at = "" || deleted_at = null)`,
    })

    if (activeVinculos.length > 0) {
      throw new Error(`Cannot delete. This driver has ${activeVinculos.length} active links.`)
    }

    const record = await pb.collection('drivers').update<Driver>(id, {
      deleted_at: new Date().toISOString(),
    })

    await createAuditLog({
      action: 'DELETE_DRIVER',
      resource_type: 'DRIVER',
      resource_id: id,
      status: 'SUCCESS',
    })

    return record
  } catch (error: any) {
    await createAuditLog({
      action: 'DELETE_DRIVER',
      resource_type: 'DRIVER',
      resource_id: id,
      status: 'FAILED',
      reason: error.message,
    })
    throw error
  }
}

export async function softDeleteVehicle(id: string) {
  try {
    // Check for active vinculos
    const activeVinculos = await pb.collection('vinculos').getFullList({
      filter: `vehicle_id = "${id}" && (deleted_at = "" || deleted_at = null)`,
    })

    if (activeVinculos.length > 0) {
      throw new Error(`Cannot delete. This vehicle has ${activeVinculos.length} active links.`)
    }

    // Additional checks for cost history could be added here

    const record = await pb.collection('vehicles').update<Vehicle>(id, {
      deleted_at: new Date().toISOString(),
    })

    await createAuditLog({
      action: 'DELETE_VEHICLE',
      resource_type: 'VEHICLE',
      resource_id: id,
      status: 'SUCCESS',
    })

    return record
  } catch (error: any) {
    await createAuditLog({
      action: 'DELETE_VEHICLE',
      resource_type: 'VEHICLE',
      resource_id: id,
      status: 'FAILED',
      reason: error.message,
    })
    throw error
  }
}

export async function softDeleteVinculo(id: string) {
  try {
    const record = await pb.collection('vinculos').update<Vinculo>(id, {
      deleted_at: new Date().toISOString(),
    })

    await createAuditLog({
      action: 'DELETE_VINCULO',
      resource_type: 'VINCULO',
      resource_id: id,
      status: 'SUCCESS',
    })

    return record
  } catch (error: any) {
    await createAuditLog({
      action: 'DELETE_VINCULO',
      resource_type: 'VINCULO',
      resource_id: id,
      status: 'FAILED',
      reason: error.message,
    })
    throw error
  }
}
