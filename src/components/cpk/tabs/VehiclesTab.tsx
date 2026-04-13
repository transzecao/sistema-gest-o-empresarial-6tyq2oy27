import { useState, useEffect } from 'react'
import { getVehicles, createVehicle, type Vehicle } from '@/services/fleetData'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'
import { VehicleItem } from './VehicleItem'

export function VehiclesTab() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const { toast } = useToast()

  const loadVehicles = async () => {
    const data = await getVehicles()
    setVehicles(data)
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  const handleAdd = async () => {
    try {
      await createVehicle({ local_id: `VEH-${Date.now()}`, plate: '' })
      toast({ title: 'Veículo adicionado' })
      loadVehicles()
    } catch (e: any) {
      toast({ title: 'Erro ao adicionar veículo', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-medium">Gerenciar Frota</h3>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" /> Novo Veículo
        </Button>
      </div>
      <div className="space-y-3">
        {vehicles.map((v) => (
          <VehicleItem key={v.id} vehicle={v} onUpdate={loadVehicles} />
        ))}
        {vehicles.length === 0 && (
          <div className="text-center p-8 border rounded-lg bg-muted/10 text-muted-foreground">
            Nenhum veículo cadastrado na frota.
          </div>
        )}
      </div>
    </div>
  )
}
