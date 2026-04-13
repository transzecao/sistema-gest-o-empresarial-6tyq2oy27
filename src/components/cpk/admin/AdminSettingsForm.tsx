import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { getFleetSettings, updateFleetSettings, type FleetSettings } from '@/services/fleetSettings'
import { createAuditLog } from '@/services/auditLog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'

const formSchema = z
  .object({
    das_rate: z.coerce.number().min(0).max(100),
    min_margin: z.coerce.number().min(0).max(100),
    warning_margin: z.coerce.number().min(0).max(100),
    max_cpk: z.coerce.number().min(0.01).max(999.99),
    fuel_price: z.coerce.number().min(0.01),
    default_consumption: z.coerce.number().min(0.1),
  })
  .refine((data) => data.warning_margin >= data.min_margin, {
    message: 'Margem Amarela não pode ser menor que a Margem Mínima',
    path: ['warning_margin'],
  })

export function AdminSettingsForm({ onSave }: { onSave: () => void }) {
  const [settings, setSettings] = useState<FleetSettings | null>(null)
  const [impactWarning, setImpactWarning] = useState<{ show: boolean; msgs: string[]; data: any }>({
    show: false,
    msgs: [],
    data: null,
  })
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      das_rate: 0,
      min_margin: 0,
      warning_margin: 0,
      max_cpk: 0,
      fuel_price: 0,
      default_consumption: 0,
    },
  })

  useEffect(() => {
    getFleetSettings().then((data) => {
      if (data) {
        setSettings(data)
        form.reset({
          das_rate: data.das_rate,
          min_margin: data.min_margin,
          warning_margin: data.warning_margin,
          max_cpk: data.max_cpk,
          fuel_price: data.fuel_price,
          default_consumption: data.default_consumption,
        })
      }
    })
  }, [form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!localStorage.getItem('ultimoResultadoCPK')) {
      localStorage.setItem('ultimoResultadoCPK', JSON.stringify({ cpk: 1.6, margin: 12 }))
    }

    const ultimo = JSON.parse(localStorage.getItem('ultimoResultadoCPK') || '{}')
    const msgs = []

    if (ultimo.cpk && values.max_cpk < ultimo.cpk) {
      msgs.push(`Novo Max CPK (${values.max_cpk}) é menor que o resultado atual (${ultimo.cpk}).`)
    }
    if (ultimo.margin && values.min_margin > ultimo.margin) {
      msgs.push(
        `Nova Margem Mínima (${values.min_margin}%) é maior que o resultado atual (${ultimo.margin}%).`,
      )
    }

    if (msgs.length > 0) {
      setImpactWarning({ show: true, msgs, data: values })
    } else {
      handleSave(values)
    }
  }

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    if (!settings) return
    try {
      await updateFleetSettings(settings.id, values)

      const changes = Object.keys(values) as (keyof typeof values)[]
      for (const key of changes) {
        if (values[key] !== settings[key as keyof FleetSettings]) {
          await createAuditLog({
            action: 'UPDATE_CONFIG',
            resource_type: 'CPK_SETTINGS',
            old_value: String(settings[key as keyof FleetSettings]),
            new_value: String(values[key]),
            details: { parameter: key },
          })
        }
      }

      toast({ title: 'Configurações salvas com sucesso!' })
      onSave()
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Verifique sua conexão.',
      })
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="max_cpk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPK Máximo Permitido (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="das_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alíquota DAS (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="min_margin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Margem Mínima (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="warning_margin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Margem Amarela (Aviso) (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fuel_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço do Combustível Base (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="default_consumption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consumo Padrão (km/l)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full">
            Salvar Alterações
          </Button>
        </form>
      </Form>

      <AlertDialog
        open={impactWarning.show}
        onOpenChange={(val) => setImpactWarning((prev) => ({ ...prev, show: val }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle /> Aviso de Impacto Operacional
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                As novas configurações são mais restritivas que os resultados operacionais atuais:
              </p>
              <ul className="list-disc pl-5 font-medium text-foreground">
                {impactWarning.msgs.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
              <p>Isso poderá gerar alertas imediatos para a equipe. Deseja prosseguir?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setImpactWarning((prev) => ({ ...prev, show: false }))
                handleSave(impactWarning.data)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar Alterações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
