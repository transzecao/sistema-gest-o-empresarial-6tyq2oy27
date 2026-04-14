import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate } from 'react-router-dom'
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
import { MapPin, Calculator, Package, Check, FileText, Calendar, PlusCircle } from 'lucide-react'
import { exportQuotationPdf } from '@/lib/pdf-export'

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
  const navigate = useNavigate()
  const [rules, setRules] = useState<Rule[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [cluster, setCluster] = useState<string>('')
  const [distance, setDistance] = useState<number | null>(null)
  const [savedQuote, setSavedQuote] = useState<any>(null)

  const isStaff = user?.role !== 'Cliente'

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { quantidade: 1, desconto_percentual: 0 },
  })

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = form

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

  const onSubmit = async (data: any) => {
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

    try {
      const recordData = {
        ...data,
        usuario_id: user.id,
        cluster: cluster,
        peso_tarifavel: calc.cobravel,
        valor_original: calc.original,
        valor_final: calc.total,
        status: 'gerada',
        origem: isStaff ? 'Funcionario_Operacional' : 'Cliente',
      }
      const saved = await createQuotation(recordData)
      setSavedQuote({ ...saved, calc }) // Keep calc details for display/PDF
      toast({ title: 'Sucesso', description: 'Cotação gerada e salva automaticamente!' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar cotação', variant: 'destructive' })
    }
  }

  const resetForm = () => {
    setSavedQuote(null)
    setCluster('')
    setDistance(null)
    reset()
  }

  if (savedQuote) {
    return (
      <Card className="max-w-2xl mx-auto shadow-lg border-primary/20 animate-fade-in">
        <CardHeader className="bg-primary/5 border-b pb-6 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-primary mb-1">Cotação Concluída</CardTitle>
          <p className="text-muted-foreground text-sm font-mono tracking-wider">
            {savedQuote.codigo || savedQuote.id}
          </p>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid grid-cols-2 gap-y-6 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                Data/Hora
              </span>
              <span className="font-medium">{new Date(savedQuote.created).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                CNPJ Cliente
              </span>
              <span className="font-medium">{savedQuote.cnpj_remetente}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                Cluster
              </span>
              <span className="font-medium inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" /> {savedQuote.cluster}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                Volumes / Peso
              </span>
              <span className="font-medium">
                {savedQuote.quantidade} vol(s) / {savedQuote.peso_fisico} kg
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-dashed">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Valor Original</span>
              <span>R$ {savedQuote.valor_original.toFixed(2)}</span>
            </div>
            {(savedQuote.desconto_percentual > 0 || savedQuote.valor_override > 0) && (
              <div className="flex justify-between items-center mb-2 text-red-600">
                <span>Descontos/Ajustes</span>
                <span>Aplicado</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-lg font-bold text-primary">Valor Final</span>
              <span className="text-2xl font-black text-primary">
                R$ {savedQuote.valor_final.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t p-6 flex flex-col sm:flex-row justify-between gap-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => exportQuotationPdf(savedQuote, savedQuote.calc, user)}
          >
            <FileText className="w-4 h-4 mr-2" /> Baixar PDF
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="secondary" onClick={resetForm} className="w-full sm:w-auto">
              <PlusCircle className="w-4 h-4 mr-2" /> Nova
            </Button>
            <Button
              onClick={() => navigate('/dashboard/agendar', { state: { quote: savedQuote } })}
              className="w-full sm:w-auto shadow-md"
            >
              <Calendar className="w-4 h-4 mr-2" /> Agendar Coleta
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-md border-t-4 border-t-primary">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-xl flex items-center gap-2 text-primary">
          <Calculator className="w-5 h-5" /> Simulador de Frete
        </CardTitle>
      </CardHeader>
      <ScrollArea className="h-[600px]">
        <CardContent className="pt-6">
          <form id="quote-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 p-5 border rounded-lg bg-card shadow-sm">
              <h3 className="font-semibold flex items-center gap-2 text-primary/80 border-b pb-2">
                <MapPin className="w-4 h-4" /> Trajeto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>CNPJ Origem</Label>
                  <Input
                    {...register('cnpj_remetente')}
                    placeholder="00.000.000/0001-00"
                    className="focus-visible:ring-primary"
                  />
                  {errors.cnpj_remetente && (
                    <p className="text-xs text-destructive">
                      {String(errors.cnpj_remetente.message)}
                    </p>
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
                <div className="mt-4 p-3 bg-primary/5 rounded-md text-sm flex gap-6 border border-primary/10">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" /> Distância Est.:{' '}
                    <b>{distance.toFixed(0)} km</b>
                  </span>
                  <span>
                    Cluster Sugerido: <b>{cluster}</b>
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4 p-5 border rounded-lg bg-card shadow-sm">
              <h3 className="font-semibold flex items-center gap-2 text-primary/80 border-b pb-2">
                <Package className="w-4 h-4" /> Dados da Carga
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

            {isStaff && (
              <div className="space-y-4 p-5 border rounded-lg border-destructive/20 bg-destructive/5 shadow-sm">
                <h3 className="font-semibold text-destructive/80 border-b border-destructive/20 pb-2">
                  Ajustes Comerciais (Uso Interno)
                </h3>
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
                      placeholder="Forçar valor exato"
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
      <CardFooter className="border-t bg-muted/20 p-6">
        <Button
          form="quote-form"
          type="submit"
          size="lg"
          className="w-full shadow-lg text-md font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processando...' : 'Gerar Cotação e Salvar'}
        </Button>
      </CardFooter>
    </Card>
  )
}
