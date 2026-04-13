import { useRef } from 'react'
import { Download, Upload, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function AdminBackupRestore() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const stateStr =
      localStorage.getItem('fleet_calculator_state') ||
      JSON.stringify({ drivers: [], vehicles: [] })
    const blob = new Blob([stateStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `backup_cpk_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({ title: 'Backup exportado com sucesso' })
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (!data.drivers || !data.vehicles) {
          throw new Error('Formato inválido: chaves drivers e vehicles são obrigatórias.')
        }

        localStorage.setItem('fleet_calculator_state', JSON.stringify(data))
        toast({
          title: 'Restauração concluída',
          description: 'Os dados foram atualizados no navegador.',
        })

        setTimeout(() => window.location.reload(), 1500)
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'Falha na restauração', description: err.message })
      }
    }

    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 max-w-lg pt-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Exportação Local</AlertTitle>
        <AlertDescription>
          O backup contêm o estado atual da calculadora armazenado neste navegador. Utilize para
          migrar configurações para outro computador ou garantir um ponto de restauração seguro.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-4">
        <Button onClick={handleExport} className="gap-2 h-24" variant="outline">
          <Download className="w-6 h-6 text-primary" />
          <div className="flex flex-col items-start text-left">
            <span className="font-bold">Exportar Dados Locais</span>
            <span className="text-xs text-muted-foreground">Salvar .json localmente</span>
          </div>
        </Button>

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="gap-2 h-24"
          variant="outline"
        >
          <Upload className="w-6 h-6 text-primary" />
          <div className="flex flex-col items-start text-left">
            <span className="font-bold">Restaurar Backup</span>
            <span className="text-xs text-muted-foreground">Carregar arquivo .json</span>
          </div>
        </Button>
        <input
          type="file"
          accept=".json"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImport}
        />
      </div>
    </div>
  )
}
