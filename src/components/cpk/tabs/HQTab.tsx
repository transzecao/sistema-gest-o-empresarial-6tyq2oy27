import { useState, useEffect } from 'react'
import {
  getFleetSettings,
  updateFleetSettings,
  type FleetSettings,
  type HQCosts,
} from '@/services/fleetSettings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Save } from 'lucide-react'

export function HQTab() {
  const [settings, setSettings] = useState<FleetSettings | null>(null)
  const [hqCosts, setHqCosts] = useState<HQCosts>({})
  const [newFieldName, setNewFieldName] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    getFleetSettings().then((res) => {
      if (res) {
        setSettings(res)
        setHqCosts(res.hq_costs || {})
      }
    })
  }, [])

  const handleSave = async () => {
    if (!settings) return
    try {
      await updateFleetSettings(settings.id, { hq_costs: hqCosts })
      toast({ title: 'Custos de Sede atualizados com sucesso' })
    } catch (e: any) {
      toast({ title: 'Erro ao atualizar custos', description: e.message, variant: 'destructive' })
    }
  }

  const addCustomField = () => {
    if (!newFieldName) return
    const custom_fields = [
      ...(hqCosts.custom_fields || []),
      { id: Date.now().toString(), name: newFieldName, value: 0 },
    ]
    setHqCosts({ ...hqCosts, custom_fields })
    setNewFieldName('')
  }

  const removeCustomField = (id: string) => {
    const custom_fields = (hqCosts.custom_fields || []).filter((f) => f.id !== id)
    setHqCosts({ ...hqCosts, custom_fields })
  }

  const updateCustomField = (id: string, value: number) => {
    const custom_fields = (hqCosts.custom_fields || []).map((f) =>
      f.id === id ? { ...f, value } : f,
    )
    setHqCosts({ ...hqCosts, custom_fields })
  }

  const fixedFields = [
    { key: 'iptu', label: 'IPTU (Anual)' },
    { key: 'rent', label: 'Aluguel' },
    { key: 'water', label: 'Água' },
    { key: 'light', label: 'Luz' },
    { key: 'internet', label: 'Internet' },
    { key: 'phone', label: 'Telefone' },
  ] as const

  return (
    <div className="space-y-8 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fixedFields.map((f) => (
          <div key={f.key} className="space-y-1">
            <Label>{f.label}</Label>
            <Input
              type="number"
              value={(hqCosts[f.key] as number) || ''}
              onChange={(e) => setHqCosts({ ...hqCosts, [f.key]: Number(e.target.value) })}
            />
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-6 border-t">
        <h4 className="font-semibold text-lg">Custos Adicionais Personalizados</h4>
        <div className="flex items-center gap-2 max-w-sm">
          <Input
            placeholder="Ex: Material de Escritório"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
          />
          <Button type="button" variant="secondary" onClick={addCustomField}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {(hqCosts.custom_fields || []).map((cf) => (
            <div key={cf.id} className="flex items-end gap-2 bg-muted/20 p-3 rounded-lg border">
              <div className="space-y-1 flex-1">
                <Label>{cf.name}</Label>
                <Input
                  type="number"
                  value={cf.value || ''}
                  onChange={(e) => updateCustomField(cf.id, Number(e.target.value))}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCustomField(cf.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" /> Salvar Sede
        </Button>
      </div>
    </div>
  )
}
