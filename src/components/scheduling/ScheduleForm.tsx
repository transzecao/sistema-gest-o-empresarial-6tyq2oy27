import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { createAgendamento } from '@/services/agendamentos'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Lock } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useCNPJValidation } from '@/hooks/use-validations'
import { useGoogleMaps } from '@/hooks/use-google-maps'
import { AddressGroup } from '@/components/shared/AddressGroup'

const schema = z.object({
  cnpj_origem: z.string().min(14, 'Obrigatório'),
  orig_street: z.string().min(1, 'Obrigatório'),
  orig_number: z.string().min(1, 'Obrigatório'),
  orig_neighborhood: z.string().min(1, 'Obrigatório'),
  orig_city: z.string().min(1, 'Obrigatório'),
  orig_state: z.string().min(2, 'Obrigatório'),
  orig_cep: z.string().min(8, 'Obrigatório'),
  lat_orig: z.number().optional(),
  lng_orig: z.number().optional(),

  cnpj_destino: z.string().min(14, 'Obrigatório'),
  dest_street: z.string().min(1, 'Obrigatório'),
  dest_number: z.string().min(1, 'Obrigatório'),
  dest_neighborhood: z.string().min(1, 'Obrigatório'),
  dest_city: z.string().min(1, 'Obrigatório'),
  dest_state: z.string().min(2, 'Obrigatório'),
  dest_cep: z.string().min(8, 'Obrigatório'),
  lat_dest: z.number().optional(),
  lng_dest: z.number().optional(),

  peso: z.coerce.number().min(0.1, 'Peso inválido'),
  largura: z.coerce.number().min(1, 'Largura mín 1'),
  altura: z.coerce.number().min(1, 'Altura mín 1'),
  profundidade: z.coerce.number().min(1, 'Prof mín 1'),
  quantidade_pacotes: z.coerce.number().min(1).max(100),
  tipo_carga: z.string(),
  numero_nota_fiscal: z.string().min(1, 'Obrigatório'),
  valor_nf: z.coerce.number().min(0.01, 'Obrigatório'),
  hora_desejada: z.string().optional(),
  prioridade: z.enum(['Urgente', 'Manhã', 'Tarde', 'Comercial']),
})

const parseAddress = (full: string) => {
  if (!full) return { street: '', number: '', neighborhood: '', city: '', state: '', cep: '' }
  const match = full.match(/(.*?), (.*?) - (.*?), (.*?) - (.*?), (.*)/)
  if (match)
    return {
      street: match[1],
      number: match[2],
      neighborhood: match[3],
      city: match[4],
      state: match[5],
      cep: match[6],
    }
  return { street: full, number: '', neighborhood: '', city: '', state: '', cep: '' }
}

export function ScheduleForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  const quote = location.state?.quote
  const isLocked = !!quote
  const formatCNPJ = useCNPJValidation()
  const isMapsLoaded = useGoogleMaps('AIzaSyAsj7S86On-s3X9it4Vzq6aPlg8UJUO30s')

  const parsedOrigem = parseAddress(quote?.endereco_remetente || '')
  const parsedDestino = parseAddress(quote?.endereco_destinatario || '')

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      cnpj_origem: quote?.cnpj_remetente || '',
      orig_street: parsedOrigem.street,
      orig_number: parsedOrigem.number,
      orig_neighborhood: parsedOrigem.neighborhood,
      orig_city: parsedOrigem.city,
      orig_state: parsedOrigem.state,
      orig_cep: parsedOrigem.cep,
      cnpj_destino: quote?.cnpj_destinatario || '',
      dest_street: parsedDestino.street,
      dest_number: parsedDestino.number,
      dest_neighborhood: parsedDestino.neighborhood,
      dest_city: parsedDestino.city,
      dest_state: parsedDestino.state,
      dest_cep: parsedDestino.cep,
      peso: quote?.peso_fisico || 0,
      largura: quote?.largura || 10,
      altura: quote?.altura || 10,
      profundidade: quote?.profundidade || 10,
      quantidade_pacotes: quote?.quantidade || 1,
      tipo_carga: quote?.tipo_carga || 'Geral',
      numero_nota_fiscal: quote?.numero_nota_fiscal || '',
      valor_nf: quote?.valor_nf || 0,
      hora_desejada: '',
      prioridade: 'Comercial',
    },
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    if (!user) return
    try {
      const existing = await pb
        .collection('agendamentos')
        .getFirstListItem(`numero_nota_fiscal="${data.numero_nota_fiscal}"`)
      if (existing) {
        toast({ variant: 'destructive', title: 'Erro', description: 'NF já cadastrada.' })
        return
      }
    } catch {
      /* proceed */
    }

    const endereco_origem = `${data.orig_street}, ${data.orig_number} - ${data.orig_neighborhood}, ${data.orig_city} - ${data.orig_state}, ${data.orig_cep}`
    const endereco_destino = `${data.dest_street}, ${data.dest_number} - ${data.dest_neighborhood}, ${data.dest_city} - ${data.dest_state}, ${data.dest_cep}`

    try {
      await createAgendamento({
        ...data,
        endereco_origem,
        lat_origem: data.lat_orig,
        lng_origem: data.lng_orig,
        endereco_destino,
        lat_destino: data.lat_dest,
        lng_destino: data.lng_dest,
        cliente_id: user.id,
        status: 'Aguardando Coleta',
        fase_atual: 'Coleta',
        ...(quote?.cluster && { cluster: quote.cluster }),
      })
      toast({ title: 'Sucesso', description: 'Agendamento enviado para roteirização!' })
      form.reset()
      if (quote) {
        await pb.collection('cotacoes').update(quote.id, { status: 'agendada' })
        navigate('/dashboard/cliente')
      }
    } catch (err: any) {
      console.error(err)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err.message || 'Falha ao salvar agendamento.',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
        {isLocked && (
          <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-md text-sm flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4" />
            <span>
              Campos vinculados à cotação <b>{quote.codigo}</b> estão bloqueados para consistência.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="cnpj_origem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  CNPJ Origem <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLocked}
                    onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cnpj_destino"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  CNPJ Destino <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLocked}
                    onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <AddressGroup
          prefix="orig"
          title="Endereço de Coleta (Origem)"
          form={form as any}
          isMapsLoaded={isMapsLoaded}
          disabled={isLocked}
        />
        <AddressGroup
          prefix="dest"
          title="Endereço de Entrega (Destino)"
          form={form as any}
          isMapsLoaded={isMapsLoaded}
          disabled={isLocked}
        />

        <div className="space-y-4 p-4 border rounded-md bg-muted/10">
          <h4 className="font-medium text-sm text-primary uppercase tracking-wider mb-2">
            Dados da Carga e Fiscal
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="numero_nota_fiscal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nota Fiscal <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLocked} className="border-primary/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valor_nf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Valor NF <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground font-medium text-sm">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={isLocked}
                        className="pl-9 border-primary/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="peso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} disabled={isLocked} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantidade_pacotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qtd Vols</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} disabled={isLocked} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="largura"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Largura (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled={isLocked} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="altura"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Altura (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled={isLocked} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profundidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prof. (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled={isLocked} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipo_carga"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo Carga</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLocked} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
          <FormField
            control={form.control}
            name="prioridade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                    <SelectItem value="Manhã">Período da Manhã</SelectItem>
                    <SelectItem value="Tarde">Período da Tarde</SelectItem>
                    <SelectItem value="Comercial">Horário Comercial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hora_desejada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora Desejada (Opcional)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" size="lg" className="w-full text-md shadow-md">
          {form.formState.isSubmitting ? 'Processando...' : 'Confirmar e Agendar Solicitação'}
        </Button>
      </form>
    </Form>
  )
}
