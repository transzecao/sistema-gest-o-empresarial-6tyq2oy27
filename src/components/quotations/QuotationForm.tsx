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
import {
  MapPin,
  Calculator,
  Package,
  Check,
  FileText,
  Calendar,
  PlusCircle,
  Receipt,
} from 'lucide-react'
import { exportQuotationPdf } from '@/lib/pdf-export'
import { useCNPJValidation } from '@/hooks/use-validations'
import { useGoogleMaps } from '@/hooks/use-google-maps'
import { AddressGroup } from '@/components/shared/AddressGroup'

const formSchema = z.object({
  cnpj_remetente: z.string().min(14, 'CNPJ Inválido'),
  rem_street: z.string().min(1, 'Obrigatório'),
  rem_number: z.string().min(1, 'Obrigatório'),
  rem_neighborhood: z.string().min(1, 'Obrigatório'),
  rem_city: z.string().min(1, 'Obrigatório'),
  rem_state: z.string().min(2, 'Obrigatório'),
  rem_cep: z.string().min(8, 'Obrigatório'),
  lat_rem: z.number().optional(),
  lng_rem: z.number().optional(),

  cnpj_destinatario: z.string().min(14, 'CNPJ Inválido'),
  dest_street: z.string().min(1, 'Obrigatório'),
  dest_number: z.string().min(1, 'Obrigatório'),
  dest_neighborhood: z.string().min(1, 'Obrigatório'),
  dest_city: z.string().min(1, 'Obrigatório'),
  dest_state: z.string().min(2, 'Obrigatório'),
  dest_cep: z.string().min(8, 'Obrigatório'),
  lat_dest: z.number().optional(),
  lng_dest: z.number().optional(),

  numero_nota_fiscal: z.string().min(1, 'Nota Fiscal é obrigatória'),
  valor_nf: z.coerce.number().min(0.01, 'Valor inválido'),
  peso_fisico: z.coerce.number().min(0.1, 'Peso obrigatório'),
  largura: z.coerce.number().min(1, 'Obrigatório (cm)'),
  altura: z.coerce.number().min(1, 'Obrigatório (cm)'),
  profundidade: z.coerce.number().min(1, 'Obrigatório (cm)'),
  quantidade: z.coerce.number().min(1, 'Obrigatório'),
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
  const formatCNPJ = useCNPJValidation()
  const isMapsLoaded = useGoogleMaps('AIzaSyAsj7S86On-s3X9it4Vzq6aPlg8UJUO30s')

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
    const vals = getValues()
    if (!vals.rem_street || !vals.dest_street || !vals.rem_number || !vals.dest_number) return
    const endRem = `${vals.rem_street}, ${vals.rem_number} - ${vals.rem_neighborhood}, ${vals.rem_city} - ${vals.rem_state}`
    const endDest = `${vals.dest_street}, ${vals.dest_number} - ${vals.dest_neighborhood}, ${vals.dest_city} - ${vals.dest_state}`

    try {
      const res = await calculateDistance(endRem, endDest)
      setDistance(res.distancia_km)
      if (res.distancia_km < 80) setCluster('Local SP')
      else if (res.distancia_km < 300) setCluster('Regional SP')
      else setCluster('Nacional')
    } catch (e) {
      toast({
        title: 'Aviso',
        description: 'Não foi possível validar distância exata.',
        variant: 'destructive',
      })
    }
  }

  const onSubmit = async (data: any) => {
    if (!cluster && !distance) await handleCalcDistance()

    const endereco_remetente = `${data.rem_street}, ${data.rem_number} - ${data.rem_neighborhood}, ${data.rem_city} - ${data.rem_state}, ${data.rem_cep}`
    const endereco_destinatario = `${data.dest_street}, ${data.dest_number} - ${data.dest_neighborhood}, ${data.dest_city} - ${data.dest_state}, ${data.dest_cep}`

    const calc = calculateQuote(
      {
        peso: data.peso_fisico,
        l: data.largura,
        a: data.altura,
        p: data.profundidade,
        qtd: data.quantidade,
        nf_value: data.valor_nf,
        cluster_name: cluster || 'Nacional',
        discount: data.desconto_percentual,
        override: data.valor_override,
      },
      rules,
      clusters,
    )

    try {
      const recordData = {
        cnpj_remetente: data.cnpj_remetente,
        endereco_remetente,
        lat_remetente: data.lat_rem,
        lng_remetente: data.lng_rem,
        cnpj_destinatario: data.cnpj_destinatario,
        endereco_destinatario,
        lat_destinatario: data.lat_dest,
        lng_destinatario: data.lng_dest,
        numero_nota_fiscal: data.numero_nota_fiscal,
        valor_nf: data.valor_nf,
        peso_fisico: data.peso_fisico,
        largura: data.largura,
        altura: data.altura,
        profundidade: data.profundidade,
        quantidade: data.quantidade,
        tipo_carga: data.tipo_carga,
        motivo_desconto: data.motivo_desconto,
        desconto_percentual: data.desconto_percentual,
        valor_override: data.valor_override,
        motivo_override: data.motivo_override,
        usuario_id: user.id,
        cluster: cluster || 'Nacional',
        peso_tarifavel: calc.cobravel,
        valor_original: calc.original,
        valor_final: calc.total,
        status: 'gerada',
        origem: isStaff ? 'Funcionario_Operacional' : 'Cliente',
      }
      const saved = await createQuotation(recordData)
      setSavedQuote({ ...saved, calc })
      toast({ title: 'Sucesso', description: 'Cotação gerada com sucesso!' })
    } catch (error) {
      console.error('Save Quotation Error', error)
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
                CNPJ Origem
              </span>
              <span className="font-medium">{savedQuote.cnpj_remetente}</span>
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
    <Card className="max-w-4xl mx-auto shadow-md border-t-4 border-t-primary">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-xl flex items-center gap-2 text-primary">
          <Calculator className="w-5 h-5" /> Simulador de Frete
        </CardTitle>
      </CardHeader>
      <ScrollArea className="h-[650px]">
        <CardContent className="pt-6">
          <form id="quote-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 p-5 border rounded-lg bg-card shadow-sm border-primary/10">
              <h3 className="font-semibold flex items-center gap-2 text-primary uppercase tracking-wider border-b pb-2">
                <Receipt className="w-4 h-4" /> Dados Fiscais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>
                    Nota Fiscal <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    {...register('numero_nota_fiscal')}
                    placeholder="Nº da NF"
                    className="border-primary/30 focus-visible:ring-primary"
                  />
                  {errors.numero_nota_fiscal && (
                    <p className="text-xs text-destructive">
                      {String(errors.numero_nota_fiscal.message)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Valor da NF <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-medium text-sm">
                      R$
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('valor_nf')}
                      className="pl-9 border-primary/30 focus-visible:ring-primary"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.valor_nf && (
                    <p className="text-xs text-destructive">{String(errors.valor_nf.message)}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>
                  CNPJ Origem <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('cnpj_remetente')}
                  onChange={(e) =>
                    setValue('cnpj_remetente', formatCNPJ(e.target.value), { shouldValidate: true })
                  }
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
                <Label>
                  CNPJ Destino <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('cnpj_destinatario')}
                  onChange={(e) =>
                    setValue('cnpj_destinatario', formatCNPJ(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                  placeholder="00.000.000/0001-00"
                  className="focus-visible:ring-primary"
                />
                {errors.cnpj_destinatario && (
                  <p className="text-xs text-destructive">
                    {String(errors.cnpj_destinatario.message)}
                  </p>
                )}
              </div>
            </div>

            <AddressGroup
              title="Origem"
              prefix="rem"
              form={form}
              isMapsLoaded={isMapsLoaded}
              onAddressChanged={handleCalcDistance}
            />

            <AddressGroup
              title="Destino"
              prefix="dest"
              form={form}
              isMapsLoaded={isMapsLoaded}
              onAddressChanged={handleCalcDistance}
            />

            {distance !== null && (
              <div className="p-3 bg-primary/5 rounded-md text-sm flex gap-6 border border-primary/10">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-primary" /> Distância Est.:{' '}
                  <b>{distance.toFixed(0)} km</b>
                </span>
                <span>
                  Cluster: <b>{cluster}</b>
                </span>
              </div>
            )}

            <div className="space-y-4 p-5 border rounded-lg bg-card shadow-sm">
              <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                <Package className="w-4 h-4" /> Dados da Carga
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input type="number" step="0.01" {...register('peso_fisico')} />
                </div>
                <div className="space-y-2">
                  <Label>Qtd Vols</Label>
                  <Input type="number" {...register('quantidade')} />
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
                  Ajustes Comerciais (Interno)
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
