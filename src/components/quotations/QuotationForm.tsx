import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  getRules,
  getClusters,
  calculateDistance,
  createQuotation,
  Rule,
  Cluster,
} from '@/services/quotations'
import { calculateQuote } from '@/lib/quotation-calc'
import { MapPin, Calculator, Package, Check } from 'lucide-react'

const formSchema = z.object({
  cnpj_remetente: z.string().min(14, 'CNPJ Inválido'),
  endereco_remetente: z.string().min(5, 'Endereço obrigatório'),
  cnpj_destinatario: z.string().min(14, 'CNPJ Inválido'),
  endereco_destinatario: z.string().min(5, 'Endereço obrigatório'),
  peso_fisico: z.coerce.number().min(0.1, 'Peso obrigatório'),
  largura: z.coerce.number().min(1, 'Obrigatório (cm)'),
  altura: z.coerce.number().min(1, 'Obrigatório (cm)'),
  profundidade: z.coerce.number().min(1, 'Obrigatório (cm)'),
  quantidade: z.coerce.number().min(1, 'Obrigatório'),
  valor_nf: z.coerce.number().min(1, 'Obrigatório'),
  tipo_carga: z.string().optional(),
  motivo_desconto: z.string().optional(),
  desconto_percentual: z.coerce.number().optional(),
  valor_override: z.coerce.number().optional(),
  motivo_override: z.string().optional(),
})

export function QuotationForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [rules, setRules] = useState<Rule[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [result, setResult] = useState<any>(null)
  const [cluster, setCluster] = useState<string>('')
  const [distance, setDistance] = useState<number | null>(null)
  const isStaff = user?.role !== 'Cliente'

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { quantidade: 1, desconto_percentual: 0 },
  })

  useEffect(() => {
    Promise.all([getRules(), getClusters()]).then(([r, c]) => {
      setRules(r)
      setClusters(c)
    })
  }, [])

  const handleCalcDistance = async () => {
    const { endereco_remetente, endereco_destinatario } = getValues()
    if (!endereco_remetente || !endereco_destinatario) return
    try {
      const res = await calculateDistance(endereco_remetente, endereco_destinatario)
      setDistance(res.distancia_km)
      if (res.distancia_km < 80) setCluster('Local SP')
      else if (res.distancia_km < 300) setCluster('Regional SP')
      else setCluster('Nacional')
    } catch (e) {
      toast({
        title: 'Erro de Rota',
        description: 'Não foi possível validar o percurso.',
        variant: 'destructive',
      })
    }
  }

  const onSubmit = (data: any) => {
    if (!cluster) {
      toast({
        title: 'Atenção',
        description: 'Por favor calcule a distância ou selecione o cluster.',
        variant: 'destructive',
      })
      return
    }
    const calc = calculateQuote(
      {
        peso: data.peso_fisico,
        l: data.largura,
        a: data.altura,
        p: data.profundidade,
        qtd: data.quantidade,
        nf_value: data.valor_nf,
        cluster_name: cluster,
        discount: data.desconto_percentual,
        override: data.valor_override,
      },
      rules,
      clusters,
    )
    setResult(calc)
  }

  const saveQuote = async (agendar = false) => {
    if (!result) return
    try {
      const data = getValues()
      await createQuotation({
        ...data,
        usuario_id: user.id,
        cluster: cluster,
        peso_tarifavel: result.cobravel,
        valor_original: result.original,
        valor_final: result.total,
        status: agendar ? 'agendada' : 'gerada',
        origem: isStaff ? 'Funcionario_Operacional' : 'Cliente',
      })
      toast({ title: 'Sucesso', description: `Cotação salva${agendar ? ' e agendada' : ''}!` })
      setResult(null)
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar cotação', variant: 'destructive' })
    }
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-md">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-xl flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" /> Nova Cotação de Frete
        </CardTitle>
      </CardHeader>
      <ScrollArea className="h-[600px]">
        <CardContent className="pt-6">
          <form id="quote-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Origin / Dest */}
            <div className="space-y-4 p-4 border rounded-md bg-muted/10">
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Rota
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CNPJ Origem</Label>
                  <Input {...register('cnpj_remetente')} placeholder="00.000.000/0001-00" />
                  {errors.cnpj_remetente && (
                    <p className="text-xs text-red-500">{String(errors.cnpj_remetente.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Endereço Origem (Completo)</Label>
                  <Input {...register('endereco_remetente')} onBlur={handleCalcDistance} />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ Destino</Label>
                  <Input {...register('cnpj_destinatario')} placeholder="00.000.000/0001-00" />
                </div>
                <div className="space-y-2">
                  <Label>Endereço Destino (Completo)</Label>
                  <Input {...register('endereco_destinatario')} onBlur={handleCalcDistance} />
                </div>
              </div>
              {distance !== null && (
                <div className="text-sm text-muted-foreground flex gap-4">
                  <span>
                    Distância Est.: <b>{distance.toFixed(0)} km</b>
                  </span>
                  <span>
                    Cluster Sugerido: <b>{cluster}</b>
                  </span>
                </div>
              )}
            </div>

            {/* Package Info */}
            <div className="space-y-4 p-4 border rounded-md bg-muted/10">
              <h3 className="font-medium flex items-center gap-2">
                <Package className="w-4 h-4" /> Carga
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Valor NF (R$)</Label>
                  <Input type="number" step="0.01" {...register('valor_nf')} />
                </div>
                <div className="space-y-2">
                  <Label>Peso Físico (kg)</Label>
                  <Input type="number" step="0.01" {...register('peso_fisico')} />
                </div>
                <div className="space-y-2">
                  <Label>Qtd Volumes</Label>
                  <Input type="number" {...register('quantidade')} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Input {...register('tipo_carga')} placeholder="Ex: Caixas" />
                </div>
                <div className="space-y-2">
                  <Label>Larg. (cm)</Label>
                  <Input type="number" {...register('largura')} />
                </div>
                <div className="space-y-2">
                  <Label>Alt. (cm)</Label>
                  <Input type="number" {...register('altura')} />
                </div>
                <div className="space-y-2">
                  <Label>Prof. (cm)</Label>
                  <Input type="number" {...register('profundidade')} />
                </div>
              </div>
            </div>

            {/* Rules (Staff Only) */}
            {isStaff && (
              <div className="space-y-4 p-4 border rounded-md border-primary/20">
                <h3 className="font-medium text-primary">Ajustes (Uso Interno)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Desconto (%)</Label>
                    <Input type="number" max="10" step="0.1" {...register('desconto_percentual')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Motivo Desconto</Label>
                    <Select onValueChange={(v) => setValue('motivo_desconto', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Já é cliente">Já é cliente</SelectItem>
                        <SelectItem value="Baixo volume">Baixo volume</SelectItem>
                        <SelectItem value="Negociação">Negociação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Override Final (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('valor_override')}
                      placeholder="Forçar valor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Justificativa Override</Label>
                    <Input {...register('motivo_override')} />
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </ScrollArea>
      <CardFooter className="border-t bg-muted/30 p-6 flex flex-col items-stretch gap-4">
        <Button form="quote-form" type="submit" size="lg" className="w-full sm:w-auto">
          Gerar Cotação Detalhada
        </Button>

        {result && (
          <div className="w-full animate-fade-in-up border rounded-md p-4 bg-background">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">Memorial Descritivo</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">Peso Cobrável (Cubado x Físico):</span>
              <span className="font-medium text-right">{result.cobravel.toFixed(2)} kg</span>

              <span className="text-muted-foreground">Base (Despacho + Transporte):</span>
              <span className="font-medium text-right">R$ {result.base.toFixed(2)}</span>

              <span className="text-muted-foreground">GRIS + Ad Valorem:</span>
              <span className="font-medium text-right">
                R$ {(result.gris + result.adValorem).toFixed(2)}
              </span>

              <span className="text-muted-foreground">ICMS:</span>
              <span className="font-medium text-right">R$ {result.icms.toFixed(2)}</span>

              {result.appliedMin && (
                <span className="col-span-2 text-orange-500 text-xs text-right mt-1">
                  * Aplicado Frete Mínimo do Cluster
                </span>
              )}

              <div className="col-span-2 border-t my-2"></div>

              <span className="text-lg font-bold">Valor Final:</span>
              <span className="text-lg font-bold text-right text-primary">
                R$ {result.total.toFixed(2)}
              </span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-end">
              <Button variant="outline" onClick={() => saveQuote(false)}>
                Salvar Rascunho
              </Button>
              <Button onClick={() => saveQuote(true)} className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-2" /> Agendar Coleta
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
