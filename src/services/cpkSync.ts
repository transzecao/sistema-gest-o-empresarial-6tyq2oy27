import pb from '@/lib/pocketbase/client'

export interface LocalDriver {
  local_id: string
  name: string
}

export interface LocalVehicle {
  local_id: string
  plate: string
}

export interface LocalVinculo {
  local_id: string
  driver_id: string
  vehicle_id: string
}

/**
 * Automates synchronization of local master data (drivers, vehicles, vinculos)
 * to PocketBase collections before finalizing month-end closures.
 */
export async function syncMasterData(
  drivers: LocalDriver[],
  vehicles: LocalVehicle[],
  vinculos: LocalVinculo[],
) {
  const upsert = async (collection: string, data: any) => {
    try {
      // Check if it already exists by local_id
      const existing = await pb
        .collection(collection)
        .getFirstListItem(`local_id="${data.local_id}"`)
      // Update if found
      return await pb.collection(collection).update(existing.id, data)
    } catch (err: any) {
      if (err.status === 404) {
        // Create if not found
        return await pb.collection(collection).create(data)
      }
      throw err
    }
  }

  // Process serially or in parallel. Serial is safer for constraints.
  for (const d of drivers) {
    await upsert('drivers', d)
  }
  for (const v of vehicles) {
    await upsert('vehicles', v)
  }
  for (const l of vinculos) {
    await upsert('vinculos', l)
  }
}
