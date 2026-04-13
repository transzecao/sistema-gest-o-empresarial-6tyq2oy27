import { useState, useEffect } from 'react'
import {
  getFleetSettings,
  updateFleetSettings,
  type FleetSettings,
  type TaxesConfig,
} from '@/services/fleetSettings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Save } from 'lucide-react'

export function TaxesTab() {
  const [settings, setSettings] = useState<FleetSettings | null>(null)
  const [taxes, setTaxes] = useState<TaxesConfig>({})
  const [newFieldName, setNewFieldName] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    getFleetSettings().then((res) => {
      if (res) {
        setSettings(res)
        setTaxes(res.taxes_config || {})
      }
    })
  }, [])

  const handleSave = async () => {
    if (!settings) return
    try {
      await updateFleetSettings(settings.id, {
        min_margin: settings.min_margin,
        das_rate: settings.das_rate,
        taxes_config: taxes,
      })
      toast({ title: 'Parâmetros atualizados com sucesso' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const addCustomField = () => {
    if (!newFieldName) return
    const custom_fields = [
      ...(taxes.custom_fields || []),
      { id: Date.now().toString(), name: newFieldName, value: 0 },
    ]
    setTaxes({ ...taxes, custom_fields })
    setNewFieldName('')
  }

  const removeCustomField = (id: string) => {
    const custom_fields = (taxes.custom_fields || []).filter((f) => f.id !== id)
    setTaxes({ ...taxes, custom_fields })
  }

  return (
    <div className="space-y-6 mt-4 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 border p-5 rounded-lg bg-card shadow-sm">
          <h4 className="font-semibold border-b pb-2">Geral & Margem</h4>
          <div className="space-y-1">
            <Label>Margem de Lucro Alvo (%)</Label>
            <Input
              type="number"
              value={settings?.min_margin || ''}
              onChange={(e) =>
                settings && setSettings({ ...settings, min_margin: Number(e.target.value) })
              }
              className="text-lg font-bold w-32"
            />
          </div>
        </div>

        <div className="space-y-4 border p-5 rounded-lg bg-card shadow-sm">
          <h4 className="font-semibold border-b pb-2">Tributação (Anexo II)</h4>
          <div className="flex items-center gap-3 py-2">
            <Switch
              checked={!!taxes.use_simplified_bracket}
              onCheckedChange={(c) => setTaxes({ ...taxes, use_simplified_bracket: c })}
            />
            <Label className="font-medium cursor-pointer">Usar Faixa de Receita Simplificada</Label>
          </div>

          {taxes.use_simplified_bracket ? (
            <div className="space-y-1">
              <Label>Faixa Anexo II (Transporte)</Label>
              <Select
                value={taxes.bracket_level?.toString() || '1'}
                onValueChange={(v) => setTaxes({ ...taxes, bracket_level: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Faixa 1 (até 180k) - 4.0%</SelectItem>
                  <SelectItem value="2">Faixa 2 (180k a 360k) - 7.3%</SelectItem>
                  <SelectItem value="3">Faixa 3 (360k a 720k) - 9.5%</SelectItem>
                  <SelectItem value="4">Faixa 4 (720k a 1.8M) - 10.7%</SelectItem>
                  <SelectItem value="5">Faixa 5 (1.8M a 3.6M) - 14.3%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1">
              <Label>Taxa DAS Manual (%)</Label>
              <Input
                type="number"
                value={settings?.das_rate || ''}
                onChange={(e) =>
                  settings && setSettings({ ...settings, das_rate: Number(e.target.value) })
                }
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border p-5 rounded-lg bg-card shadow-sm">
        <div className="space-y-1">
          <Label>Custo CT-e/MDF-e (R$)</Label>
          <Input
            type="number"
            value={taxes.cte_mdfe_cost || ''}
            onChange={(e) => setTaxes({ ...taxes, cte_mdfe_cost: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <Label>Docs Mensais (Qtd)</Label>
          <Input
            type="number"
            value={taxes.monthly_docs || ''}
            onChange={(e) => setTaxes({ ...taxes, monthly_docs: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <Label>Taxas Fiscais Anuais (R$)</Label>
          <Input
            type="number"
            value={taxes.annual_fiscal_fees || ''}
            onChange={(e) => setTaxes({ ...taxes, annual_fiscal_fees: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <Label>KM Morto Estimado (%)</Label>
          <Input
            type="number"
            value={taxes.dead_km || ''}
            onChange={(e) => setTaxes({ ...taxes, dead_km: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t">
        <h4 className="font-semibold text-lg">Taxas Operacionais Adicionais</h4>
        <div className="flex items-center gap-2 max-w-sm">
          <Input
            placeholder="Nome da taxa..."
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
          />
          <Button type="button" variant="secondary" onClick={addCustomField}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {(taxes.custom_fields || []).map((cf) => (
            <div key={cf.id} className="flex items-end gap-2 bg-muted/20 p-3 rounded-lg border">
              <div className="space-y-1 flex-1">
                <Label>{cf.name}</Label>
                <Input
                  type="number"
                  value={cf.value || ''}
                  onChange={(e) => {
                    const custom_fields = taxes.custom_fields!.map((f) =>
                      f.id === cf.id ? { ...f, value: Number(e.target.value) } : f,
                    )
                    setTaxes({ ...taxes, custom_fields })
                  }}
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
          <Save className="w-4 h-4 mr-2" /> Salvar Parâmetros Fiscais
        </Button>
      </div>
    </div>
  )
}
