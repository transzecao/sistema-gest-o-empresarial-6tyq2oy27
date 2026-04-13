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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { AlertTriangle, AlertCircle } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

const formSchema = z
  .object({
    max_cpk: z.coerce.number().min(0.01, 'Min R$ 0.01').max(999.99, 'Max R$ 999.99'),
    min_margin: z.coerce.number().min(0, 'Min 0%').max(100, 'Max 100%'),
    warning_margin: z.coerce.number().min(0, 'Min 0%').max(100, 'Max 100%'),
    das_rate: z.coerce.number().min(0, 'Min 0%').max(100, 'Max 100%'),
    fuel_price: z.coerce.number().min(0.01, 'Min R$ 0.01'),
    default_consumption: z.coerce.number().min(0.1, 'Min 0.1'),
    labor_charges: z.object({
      max_das: z.coerce.number().min(0, 'Min 0%').max(100, 'Max 100%'),
      cte_cost: z.coerce.number().min(0, 'Min 0'),
      monthly_docs: z.coerce.number().min(0, 'Min 0'),
      fiscal_taxes: z.coerce.number().min(0, 'Min 0'),
      working_days: z.coerce.number().min(1, 'Min 1').max(31, 'Max 31'),
      vr_daily: z.coerce.number().min(0, 'Min 0'),
      basic_basket: z.coerce.number().min(0, 'Min 0'),
      fgts: z.coerce.number().min(0, 'Min 0%').max(100, 'Max 100%'),
      thirteenth: z.coerce.number().min(0, 'Min 0%').max(100, 'Max 100%'),
      vacation: z.coerce.number().min(0, 'Min 0%').max(100, 'Max 100%'),
      pis: z.coerce.number().min(0, 'Min 0%').max(100, 'Max 100%'),
    }),
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
      max_cpk: 0,
      min_margin: 0,
      warning_margin: 0,
      das_rate: 0,
      fuel_price: 0,
      default_consumption: 0,
      labor_charges: {
        max_das: 0,
        cte_cost: 0,
        monthly_docs: 0,
        fiscal_taxes: 0,
        working_days: 0,
        vr_daily: 0,
        basic_basket: 0,
        fgts: 0,
        thirteenth: 0,
        vacation: 0,
        pis: 0,
      },
    },
  })

  useEffect(() => {
    getFleetSettings().then((data) => {
      if (data) {
        setSettings(data)
        form.reset({
          max_cpk: data.max_cpk,
          min_margin: data.min_margin,
          warning_margin: data.warning_margin,
          das_rate: data.das_rate,
          fuel_price: data.fuel_price,
          default_consumption: data.default_consumption,
          labor_charges: {
            max_das: data.labor_charges?.max_das ?? 0,
            cte_cost: data.labor_charges?.cte_cost ?? 0,
            monthly_docs: data.labor_charges?.monthly_docs ?? 0,
            fiscal_taxes: data.labor_charges?.fiscal_taxes ?? 0,
            working_days: data.labor_charges?.working_days ?? 22,
            vr_daily: data.labor_charges?.vr_daily ?? 0,
            basic_basket: data.labor_charges?.basic_basket ?? 0,
            fgts: data.labor_charges?.fgts ?? 0,
            thirteenth: data.labor_charges?.thirteenth ?? 0,
            vacation: data.labor_charges?.vacation ?? 0,
            pis: data.labor_charges?.pis ?? 0,
          },
        })
      }
    })
  }, [form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const ultimo = JSON.parse(
      localStorage.getItem('ultimoResultadoCPK') || '{"cpk": 1.6, "margin": 12}',
    )
    const msgs = []

    if (ultimo.cpk && values.max_cpk < ultimo.cpk) {
      msgs.push(
        `Novo Max CPK (R$ ${values.max_cpk}) é menor que o resultado atual (R$ ${ultimo.cpk}).`,
      )
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
      const mergedLabor = { ...(settings.labor_charges || {}), ...values.labor_charges }
      await updateFleetSettings(settings.id, { ...values, labor_charges: mergedLabor })

      const changes = []
      for (const key of [
        'max_cpk',
        'min_margin',
        'warning_margin',
        'das_rate',
        'fuel_price',
        'default_consumption',
      ] as const) {
        if (values[key] !== settings[key])
          changes.push({ key, old: settings[key], new: values[key] })
      }
      for (const [k, v] of Object.entries(values.labor_charges)) {
        if (v !== (settings.labor_charges?.[k] ?? 0))
          changes.push({ key: `labor_charges.${k}`, old: settings.labor_charges?.[k] ?? 0, new: v })
      }

      for (const change of changes) {
        await createAuditLog({
          action: 'UPDATE_CONFIG',
          resource_type: 'CPK_SETTINGS',
          old_value: String(change.old),
          new_value: String(change.new),
          details: { parameter: change.key },
        })
      }
      toast({ title: 'Configurações salvas com sucesso!' })
      onSave()
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro ao salvar configurações' })
    }
  }

  const renderField = (name: string, label: string) => (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type="number" step="any" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  const allErrors = Object.values(form.formState.errors).flatMap((e) =>
    (e as any)?.message ? [(e as any).message] : [],
  )
  if (form.formState.errors.labor_charges) {
    allErrors.push(
      ...Object.values(form.formState.errors.labor_charges)
        .map((e) => (e as any)?.message)
        .filter(Boolean),
    )
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {allErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erros de Validação</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {allErrors.map((err, i) => (
                    <li key={i}>{String(err)}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="thresholds" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="thresholds">Limites (Thresholds)</TabsTrigger>
              <TabsTrigger value="parameters">Parâmetros (Parameters)</TabsTrigger>
              <TabsTrigger value="standards">Padrões (Standards)</TabsTrigger>
            </TabsList>

            <TabsContent value="thresholds" className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {renderField('max_cpk', 'Max CPK Permitido (R$)')}
              {renderField('min_margin', 'Margem Mínima (%)')}
              {renderField('warning_margin', 'Margem Amarela (%)')}
              {renderField('labor_charges.max_das', 'Max DAS Permitido (%)')}
            </TabsContent>

            <TabsContent value="parameters" className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {renderField('das_rate', 'Alíquota DAS (Anexo II) (%)')}
              {renderField('labor_charges.cte_cost', 'Custo por CT-e (R$)')}
              {renderField('labor_charges.monthly_docs', 'Documentos Mensais (Qtd)')}
              {renderField('labor_charges.fiscal_taxes', 'Taxas Fiscais (R$)')}
            </TabsContent>

            <TabsContent value="standards" className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {renderField('labor_charges.working_days', 'Dias Úteis (Mês)')}
              {renderField('labor_charges.vr_daily', 'Vale Refeição Diário (R$)')}
              {renderField('labor_charges.basic_basket', 'Cesta Básica (R$)')}
              {renderField('fuel_price', 'Preço do Combustível (R$)')}
              {renderField('default_consumption', 'Consumo Padrão (km/l)')}
              {renderField('labor_charges.fgts', 'Encargo FGTS (%)')}
              {renderField('labor_charges.thirteenth', 'Encargo 13º Salário (%)')}
              {renderField('labor_charges.vacation', 'Encargo Férias (%)')}
              {renderField('labor_charges.pis', 'Encargo PIS (%)')}
            </TabsContent>
          </Tabs>
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
              <AlertTriangle /> Alerta de Impacto Operacional
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>As novas configurações gerarão impactos (Red Alert) na operação atual:</p>
              <ul className="list-disc pl-5 font-medium text-foreground">
                {impactWarning.msgs.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
              <p>Deseja prosseguir mesmo assim?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setImpactWarning((p) => ({ ...p, show: false }))
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
