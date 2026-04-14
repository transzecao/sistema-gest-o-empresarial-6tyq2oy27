import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { MapPin } from 'lucide-react'
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
  quantidade_pacotes: z.coerce.number().min(1).max(3),
  tipo_carga: z.string(),
  numero_nota_fiscal: z.string().min(1, 'Obrigatório'),
  hora_desejada: z.string().optional(),
  prioridade: z.enum(['Urgente', 'Manhã', 'Tarde', 'Comercial']),
})

export function ScheduleForm() {
  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      cnpj_origem: '',
      endereco_origem: '',
      cnpj_destino: '',
      endereco_destino: '',
      peso: 0,
      largura: 10,
      altura: 10,
      profundidade: 10,
      quantidade_pacotes: 1,
      tipo_carga: 'Geral',
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
      })
      toast({ title: 'Sucesso', description: 'Agendamento criado com sucesso!' })
      form.reset()
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cnpj_origem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ Origem</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="endereco_origem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço de Origem</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    className="pl-9"
                    placeholder="Buscar endereço (Google Places)..."
                  />
                </div>
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
                  <Input
                    {...field}
                    className="pl-9"
                    placeholder="Buscar endereço (Google Places)..."
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="peso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
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
                <FormLabel>Larg (cm)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
                  <Input type="number" {...field} />
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
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="quantidade_pacotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vols (1-3)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numero_nota_fiscal"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Nota Fiscal</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  <SelectItem value="Manhã">Manhã</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full mt-6">
          Agendar Solicitação
        </Button>
      </form>
    </Form>
  )
}
