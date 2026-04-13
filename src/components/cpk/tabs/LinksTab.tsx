import { useState, useEffect } from 'react'
import {
  getVehicles,
  getDrivers,
  getVinculos,
  createVinculo,
  softDeleteVinculo,
  type Vehicle,
  type Driver,
  type Vinculo,
} from '@/services/fleetData'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Trash2 } from 'lucide-react'

export function LinksTab() {
  const [links, setLinks] = useState<Vinculo[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])

  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [selectedDriver, setSelectedDriver] = useState('')
  const [estimatedKm, setEstimatedKm] = useState<number>(0)

  const { toast } = useToast()

  const loadData = async () => {
    setLinks(await getVinculos())
    setVehicles(await getVehicles())
    setDrivers(await getDrivers())
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = async () => {
    if (!selectedVehicle || !selectedDriver || !estimatedKm) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' })
      return
    }
    try {
      await createVinculo({
        local_id: `LNK-${Date.now()}`,
        driver_id: selectedDriver,
        vehicle_id: selectedVehicle,
        estimated_km: estimatedKm,
      })
      toast({ title: 'Vínculo operacional criado' })
      setSelectedVehicle('')
      setSelectedDriver('')
      setEstimatedKm(0)
      loadData()
    } catch (e: any) {
      toast({ title: 'Erro ao criar vínculo', description: e.message, variant: 'destructive' })
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await softDeleteVinculo(id)
      toast({ title: 'Vínculo removido' })
      loadData()
    } catch (e: any) {
      toast({ title: 'Erro ao remover vínculo', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-card p-4 rounded-lg border shadow-sm">
        <div className="space-y-1">
          <Label>Motorista</Label>
          <Select value={selectedDriver} onValueChange={setSelectedDriver}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Veículo</Label>
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.plate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>KM Mensal Estimado</Label>
          <Input
            type="number"
            value={estimatedKm || ''}
            onChange={(e) => setEstimatedKm(Number(e.target.value))}
          />
        </div>
        <Button onClick={handleAdd}>Criar Vínculo</Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Motorista</TableHead>
              <TableHead>Veículo (Placa)</TableHead>
              <TableHead>KM Estimado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((l) => (
              <TableRow key={l.id}>
                <TableCell>
                  {drivers.find((d) => d.id === l.driver_id)?.name || l.driver_id}
                </TableCell>
                <TableCell>
                  {vehicles.find((v) => v.id === l.vehicle_id)?.plate || l.vehicle_id}
                </TableCell>
                <TableCell>{l.estimated_km}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(l.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {links.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                  Nenhum vínculo operacional cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
