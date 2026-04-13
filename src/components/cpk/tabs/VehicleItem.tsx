import { useState } from 'react'
import { updateVehicle, softDeleteVehicle, type Vehicle } from '@/services/fleetData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Trash2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const numFields = [
  { key: 'purchase_value', label: 'Valor Compra (R$)' },
  { key: 'resale_value', label: 'Valor Revenda (5 anos)' },
  { key: 'year', label: 'Ano' },
  { key: 'consumption', label: 'Consumo (km/L)' },
  { key: 'diesel_price', label: 'Preço Diesel (R$/L)' },
  { key: 'ipva', label: 'IPVA' },
  { key: 'licensing', label: 'Licenciamento' },
  { key: 'insurance', label: 'Seguro' },
  { key: 'tire_cost', label: 'Custo Pneus/KM' },
  { key: 'maintenance', label: 'Manutenção' },
  { key: 'cleaning', label: 'Limpeza' },
] as const

export function VehicleItem({ vehicle, onUpdate }: { vehicle: Vehicle; onUpdate: () => void }) {
  const [data, setData] = useState<Partial<Vehicle>>(vehicle)
  const { toast } = useToast()

  const handleSave = async () => {
    try {
      await updateVehicle(vehicle.id, { ...data, plate: data.plate?.toUpperCase().slice(0, 8) })
      toast({ title: 'Veículo atualizado com sucesso' })
      onUpdate()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    try {
      await softDeleteVehicle(vehicle.id)
      toast({ title: 'Veículo removido' })
      onUpdate()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Collapsible className="border rounded-lg p-4 bg-card shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </CollapsibleTrigger>
          <span className="font-semibold text-lg">{vehicle.plate || 'NOVA PLACA'}</span>
          <span className="text-sm text-muted-foreground">({vehicle.local_id})</span>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <CollapsibleContent className="pt-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <Label>Placa</Label>
          <Input
            value={data.plate || ''}
            onChange={(e) => setData({ ...data, plate: e.target.value.toUpperCase().slice(0, 8) })}
          />
        </div>
        <div className="space-y-1">
          <Label>Marca/Modelo</Label>
          <Input
            value={data.brand_model || ''}
            onChange={(e) => setData({ ...data, brand_model: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Tipo (Baú, etc)</Label>
          <Input
            value={data.vehicle_type || ''}
            onChange={(e) => setData({ ...data, vehicle_type: e.target.value })}
          />
        </div>

        {numFields.map((f) => (
          <div key={f.key} className="space-y-1">
            <Label>{f.label}</Label>
            <Input
              type="number"
              value={(data[f.key as keyof Vehicle] as number) || ''}
              onChange={(e) => setData({ ...data, [f.key]: Number(e.target.value) })}
            />
          </div>
        ))}

        <div className="flex items-center gap-2 pt-6">
          <Switch
            checked={!!data.arla_32}
            onCheckedChange={(c) => setData({ ...data, arla_32: c })}
          />
          <Label>Usa Arla 32 (5%)</Label>
        </div>
        <div className="col-span-full flex justify-end mt-2">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Salvar Veículo
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
