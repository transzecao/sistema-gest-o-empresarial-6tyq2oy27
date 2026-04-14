import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createSchedule, getScheduleByNF } from '@/services/schedules'
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

const schema = z.object({
  origin_cnpj: z.string().min(1, 'Obrigatório'),
  origin_address: z.string().min(1, 'Obrigatório'),
  dest_cnpj: z.string().min(1, 'Obrigatório'),
  dest_address: z.string().min(1, 'Obrigatório'),
  weight: z.coerce.number().min(0.1, 'Peso inválido'),
  dimensions: z.string().min(1, 'Ex: 10x10x10'),
  package_qty: z.coerce.number().min(1).max(3),
  cargo_type: z.string(),
  invoice_nf: z.string().min(1, 'Obrigatório'),
  preferred_time: z.string().optional(),
  priority: z.enum(['Urgente', 'Manhã', 'Tarde', 'Comercial']),
})

export function ScheduleForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      origin_cnpj: '',
      origin_address: '',
      dest_cnpj: '',
      dest_address: '',
      weight: 0,
      dimensions: '',
      package_qty: 1,
      cargo_type: 'aberto',
      invoice_nf: '',
      preferred_time: '',
      priority: 'Comercial',
    },
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    if (!user) return
    const existing = await getScheduleByNF(data.invoice_nf)
    if (existing) {
      toast({ variant: 'destructive', title: 'Erro', description: 'NF já cadastrada no sistema.' })
      return
    }
    try {
      await createSchedule({ ...data, client_id: user.id, status: 'Fila' })
      toast({ title: 'Sucesso', description: 'Agendamento criado com sucesso!' })
      form.reset()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao salvar agendamento.' })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="origin_cnpj"
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
            name="dest_cnpj"
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
          name="origin_address"
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
          name="dest_address"
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

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="weight"
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
            name="dimensions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dimens (LxAxP)</FormLabel>
                <FormControl>
                  <Input placeholder="10x10x10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="package_qty"
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="invoice_nf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nota Fiscal</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
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
        </div>

        <Button type="submit" className="w-full">
          Agendar Coleta
        </Button>
      </form>
    </Form>
  )
}
