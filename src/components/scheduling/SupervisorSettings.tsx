import { useEffect, useState } from 'react'
import { getConfiguracoes, updateConfiguracoes } from '@/services/agendamentos'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Settings } from 'lucide-react'

export function SupervisorSettings() {
  const [config, setConfig] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    getConfiguracoes().then(setConfig)
  }, [])

  const handleSave = async () => {
    if (!config) return
    await updateConfiguracoes(config.id, config)
    toast({ title: 'Configurações de roteirização salvas com sucesso.' })
  }

  if (!config) return null

  const obrigatorios =
    typeof config.campos_obrigatorios === 'string'
      ? JSON.parse(config.campos_obrigatorios)
      : config.campos_obrigatorios || {}
  const regras =
    typeof config.regras_negocio === 'string'
      ? JSON.parse(config.regras_negocio)
      : config.regras_negocio || {}

  return (
    <Card className="shadow-sm border-t-4 border-t-primary">
      <CardHeader className="bg-muted/30 border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5" /> Regras de Negócio e Agendamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h3 className="font-semibold text-base border-b pb-2 text-muted-foreground">
              Campos Obrigatórios no Portal
            </h3>
            {Object.keys(obrigatorios).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="capitalize cursor-pointer font-normal" htmlFor={`switch-${key}`}>
                  {key.replace(/_/g, ' ')}
                </Label>
                <Switch
                  id={`switch-${key}`}
                  checked={obrigatorios[key]}
                  onCheckedChange={(v) => {
                    const newObj = { ...obrigatorios, [key]: v }
                    setConfig({ ...config, campos_obrigatorios: JSON.stringify(newObj) })
                  }}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base border-b pb-2 text-muted-foreground">
              Regras Operacionais (Roteirizador)
            </h3>
            <div className="space-y-2">
              <Label>Máximo de Coletas por Dia (Fila)</Label>
              <Input
                type="number"
                value={regras.max_coletas_dia}
                onChange={(e) => {
                  const newRegras = { ...regras, max_coletas_dia: Number(e.target.value) }
                  setConfig({ ...config, regras_negocio: JSON.stringify(newRegras) })
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Peso Mínimo (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={regras.peso_min}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      regras_negocio: JSON.stringify({
                        ...regras,
                        peso_min: Number(e.target.value),
                      }),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Peso Máximo (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={regras.peso_max}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      regras_negocio: JSON.stringify({
                        ...regras,
                        peso_max: Number(e.target.value),
                      }),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Horário de Operação Padrão</Label>
              <Input
                placeholder="Ex: 08:00-18:00"
                value={regras.horario_operacao}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    regras_negocio: JSON.stringify({ ...regras, horario_operacao: e.target.value }),
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t mt-8">
          <Button onClick={handleSave} className="w-full md:w-auto shadow-sm">
            Aplicar e Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
