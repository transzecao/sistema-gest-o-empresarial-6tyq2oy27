import React, { useState, useEffect, useRef } from 'react'
import { useRoleValidation } from '@/hooks/use-role-validation'
import { useAuth } from '@/hooks/use-auth'
import { createAuditLog } from '@/services/auditLog'
import { syncMasterData } from '@/services/cpkSync'
import { useToast } from '@/hooks/use-toast'
import { Lock, CheckCircle, AlertTriangle, XCircle, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function FleetCostsForm() {
  const { canOperate, isReady } = useRoleValidation()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const hasLoggedUnauthorized = useRef(false)

  // Form State
  const [cpk, setCpk] = useState<number>(1.4)
  const [margin, setMargin] = useState<number>(22.5)

  useEffect(() => {
    if (isReady && !canOperate && !hasLoggedUnauthorized.current) {
      hasLoggedUnauthorized.current = true
      createAuditLog({
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resource_type: 'CPK_CALCULATION',
        status: 'UNAUTHORIZED',
        reason: 'User lacks canOperate permission to access FleetCostsForm',
      })
    }
  }, [isReady, canOperate])

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground font-medium">Carregando permissões...</p>
      </div>
    )
  }

  if (!canOperate) {
    return (
      <Card className="max-w-md mx-auto mt-8 border-destructive/50 bg-destructive/5">
        <CardContent className="pt-8 flex flex-col items-center text-center">
          <div className="p-4 bg-destructive/10 rounded-full mb-4">
            <Lock className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-destructive mb-2">Acesso Restrito</h2>
          <p className="text-sm text-destructive/90">
            Você não tem permissão para acessar o cálculo de CPK. Apenas Funcionários Financeiros
            podem operar esta tela.
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleCloseMonth = async () => {
    setIsProcessing(true)
    const date = new Date()
    const monthYear = `${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`
    const docId = `CPK-${monthYear}-${Date.now()}`

    try {
      // Mock local data payload for syncing as per requirements
      const drivers = [
        { local_id: 'DRV-001', name: 'Carlos Albuquerque' },
        { local_id: 'DRV-002', name: 'Marcos Silveira' },
      ]
      const vehicles = [
        { local_id: 'VEH-001', plate: 'XYZ-9876' },
        { local_id: 'VEH-002', plate: 'ABC-1234' },
      ]
      const vinculos = [
        { local_id: 'VNC-001', driver_id: 'DRV-001', vehicle_id: 'VEH-001' },
        { local_id: 'VNC-002', driver_id: 'DRV-002', vehicle_id: 'VEH-002' },
      ]

      // Step 1: Sync master data
      await syncMasterData(drivers, vehicles, vinculos)

      // Step 2: Log Success
      await createAuditLog({
        action: 'CLOSE_MONTH',
        resource_type: 'CPK_CALCULATION',
        status: 'SUCCESS',
        document_id: docId,
        new_value: JSON.stringify({ cpk, margin }),
      })

      toast({
        title: 'Mês Fechado com Sucesso',
        description: `Doc: ${docId}\nAutor: ${user?.name || 'Sistema'}\nData: ${new Date().toLocaleString()}`,
      })
    } catch (error: any) {
      const reason = error?.message || 'Erro desconhecido ao processar'

      // Step 3: Log Failure
      await createAuditLog({
        action: 'CLOSE_MONTH',
        resource_type: 'CPK_CALCULATION',
        status: 'FAILED',
        reason,
      })

      toast({
        title: 'Erro ao fechar o mês',
        description: `Motivo: ${reason}`,
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Visual status icons
  const renderCpkStatus = () => {
    if (cpk <= 1.5) return <CheckCircle className="text-emerald-500 w-5 h-5 shrink-0" />
    if (cpk <= 2.5) return <AlertTriangle className="text-amber-500 w-5 h-5 shrink-0" />
    return <XCircle className="text-destructive w-5 h-5 shrink-0" />
  }

  const renderMarginStatus = () => {
    if (margin >= 20) return <CheckCircle className="text-emerald-500 w-5 h-5 shrink-0" />
    if (margin >= 10) return <AlertTriangle className="text-amber-500 w-5 h-5 shrink-0" />
    return <XCircle className="text-destructive w-5 h-5 shrink-0" />
  }

  return (
    <Card className="w-full mt-6 shadow-sm">
      <CardHeader className="bg-muted/30 border-b">
        <CardTitle className="text-lg">Cálculo de CPK e Fechamento de Frota</CardTitle>
        <CardDescription>
          Valide os indicadores atuais antes de executar o fechamento do mês. Ao fechar, os dados
          mestre (veículos e motoristas) serão sincronizados com a nuvem e um documento de auditoria
          será gerado.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3 bg-muted/10 p-4 rounded-lg border">
            <Label htmlFor="cpk-input" className="text-sm font-medium">
              Custo Por Quilômetro Projetado (R$/km)
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="cpk-input"
                type="number"
                step="0.1"
                value={cpk}
                onChange={(e) => setCpk(parseFloat(e.target.value) || 0)}
                className="w-32 text-lg font-semibold"
                disabled={isProcessing}
              />
              {renderCpkStatus()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Status Ideal: Menor ou igual a 1.5 R$/km
            </p>
          </div>

          <div className="space-y-3 bg-muted/10 p-4 rounded-lg border">
            <Label htmlFor="margin-input" className="text-sm font-medium">
              Margem de Lucro Operacional (%)
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="margin-input"
                type="number"
                step="0.5"
                value={margin}
                onChange={(e) => setMargin(parseFloat(e.target.value) || 0)}
                className="w-32 text-lg font-semibold"
                disabled={isProcessing}
              />
              {renderMarginStatus()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Status Ideal: Maior ou igual a 20%</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            onClick={handleCloseMonth}
            disabled={isProcessing}
            size="lg"
            className="w-full md:w-auto min-w-[240px] shadow-sm transition-all"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isProcessing ? 'Sincronizando Dados...' : 'Confirmar Fechamento do Mês'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
