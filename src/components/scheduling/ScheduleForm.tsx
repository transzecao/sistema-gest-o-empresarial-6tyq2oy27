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
import { MapPin, Lock } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

const schema = z.object({
  cnpj_origem: z.string().min(1, 'Obrigatório'),
  endereco_origem: z.string().min(1, 'Obrigatório'),
  cnpj_destino: z.string().min(1, 'Obrigatório'),
  endereco_destino: z.string().min(1, 'Obrigatório'),
  peso: z.coerce.number().min(0.1, 'Peso inválido'),
  largura: z.coerce.number().min(1, 'Largura mín 1'),
  altura: z.coerce.number().min(1, 'Altura mín 1'),
  profundidade: z.coerce.number().min(1, 'Prof mín 1'),
  quantidade_pacotes: z.coerce.number().min(1).max(100),
  tipo_carga: z.string(),
  numero_nota_fiscal: z.string().min(1, 'Obrigatório'),
  hora_desejada: z.string().optional(),
  prioridade: z.enum(['Urgente', 'Manhã', 'Tarde', 'Comercial']),
})

export function ScheduleForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  const quote = location.state?.quote
  const isLocked = !!quote

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      cnpj_origem: quote?.cnpj_remetente || '',
      endereco_origem: quote?.endereco_remetente || '',
      cnpj_destino: quote?.cnpj_destinatario || '',
      endereco_destino: quote?.endereco_destinatario || '',
      peso: quote?.peso_fisico || 0,
      largura: quote?.largura || 10,
      altura: quote?.altura || 10,
      profundidade: quote?.profundidade || 10,
      quantidade_pacotes: quote?.quantidade || 1,
      tipo_carga: quote?.tipo_carga || 'Geral',
      numero_nota_fiscal: '',
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
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'NF já cadastrada no sistema.',
        })
        return
      }
    } catch {
      // Not found, proceed
    }

    try {
      await createAgendamento({
        ...data,
        cliente_id: user.id,
        status: 'Aguardando Coleta',
        fase_atual: 'Coleta',
        // Pass cluster if mapping
        ...(quote?.cluster && { cluster: quote.cluster }),
      })
      toast({
        title: 'Sucesso',
        description: 'Agendamento criado com sucesso e enviado para roteirização!',
      })
      form.reset()
      if (quote) {
        // Optionally update quote status to 'agendada'
        await pb.collection('cotacoes').update(quote.id, { status: 'agendada' })
        navigate('/dashboard/cliente') // or wherever appropriate
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err.message || 'Falha ao salvar agendamento.',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isLocked && (
          <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-md text-sm flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4" />
            <span>
              Campos vinculados à cotação <b>{quote.codigo}</b> estão bloqueados para garantir
              consistência de preço.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-4 border rounded-md bg-muted/10">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Origem e Destino
            </h4>
            <FormField
              control={form.control}
              name="cnpj_origem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ Origem</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLocked} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endereco_origem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço de Origem</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input {...field} className="pl-9" disabled={isLocked} />
                    </div>
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
                  <FormLabel>CNPJ Destino</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLocked} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endereco_destino"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço de Destino</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input {...field} className="pl-9" disabled={isLocked} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-md bg-muted/10">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Dados da Carga
            </h4>
            <div className="grid grid-cols-2 gap-4">
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
                    <FormLabel>Qtd Volumes</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} disabled={isLocked} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="largura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Larg (cm)</FormLabel>
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
                    <FormLabel>Alt (cm)</FormLabel>
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
                    <FormLabel>Prof (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={isLocked} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="tipo_carga"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Carga</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLocked} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="p-4 border rounded-md bg-card shadow-sm border-primary/20">
          <h4 className="font-medium text-primary uppercase tracking-wider mb-4">
            Informações Complementares
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="numero_nota_fiscal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nota Fiscal <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Obrigatório"
                      className="border-primary/50 focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prioridade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Prioridade <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-primary/50">
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
        </div>

        <Button type="submit" size="lg" className="w-full text-md shadow-md">
          {form.formState.isSubmitting ? 'Processando...' : 'Confirmar e Agendar Solicitação'}
        </Button>
      </form>
    </Form>
  )
}
