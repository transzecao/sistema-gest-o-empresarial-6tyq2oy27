import { useState, useEffect } from 'react'
import { useRoleValidation } from '@/hooks/use-role-validation'
import { getDrivers, createDriver, softDeleteDriver, Driver } from '@/services/fleetData'
import { logUnauthorizedAccess } from '@/services/auditLog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Lock, Plus, Trash2, ChevronDown, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

export function DriverTab() {
  const { canOperate, isReady } = useRoleValidation()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [newDriverName, setNewDriverName] = useState('')
  const [newDriverLocalId, setNewDriverLocalId] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (!isReady) return
    if (!canOperate) {
      logUnauthorizedAccess('ATTEMPT_OPEN_DRIVER_TAB')
      setLoading(false)
      return
    }
    loadDrivers()
  }, [isReady, canOperate])

  const loadDrivers = async () => {
    try {
      const data = await getDrivers()
      setDrivers(data)
    } catch (err) {
      console.error('Error loading drivers:', err)
      toast({ variant: 'destructive', title: 'Erro ao carregar motoristas' })
    } finally {
      setLoading(false)
    }
  }

  const handleAddDriver = async () => {
    if (!newDriverName.trim() || !newDriverLocalId.trim()) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha o nome e a matrícula do motorista.',
      })
      return
    }
    try {
      const newDriver = await createDriver({ name: newDriverName, local_id: newDriverLocalId })
      setDrivers([...drivers, newDriver])
      setNewDriverName('')
      setNewDriverLocalId('')
      toast({ title: 'Motorista adicionado com sucesso!' })
    } catch (err: any) {
      console.error('Error adding driver:', err)
      toast({ variant: 'destructive', title: 'Erro ao adicionar', description: err.message })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddDriver()
    }
  }

  const handleRemoveDriver = async (id: string, name: string) => {
    if (
      !window.confirm(`Tem certeza que deseja remover ${name}? Esta ação não pode ser desfeita.`)
    ) {
      return
    }
    try {
      await softDeleteDriver(id)
      setDrivers(drivers.filter((d) => d.id !== id))
      toast({ title: 'Motorista removido com sucesso!' })
    } catch (err: any) {
      console.error('Error removing driver:', err)
      toast({ variant: 'destructive', title: 'Erro ao remover', description: err.message })
    }
  }

  if (!isReady || loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Carregando permissões...
      </div>
    )
  }

  if (!canOperate) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-destructive/5 mt-4">
        <div className="p-4 bg-destructive/10 rounded-full mb-4">
          <Lock className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-destructive mb-2">Sem Permissão</h2>
        <p className="text-muted-foreground max-w-md">
          Apenas Funcionários Financeiros podem gerenciar o cadastro de motoristas. Suas tentativas
          de acesso foram registradas.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Motorista</CardTitle>
          <CardDescription>
            Cadastre um novo motorista para ser vinculado aos veículos na operação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 w-full">
              <Label htmlFor="driver-name">Nome Completo</Label>
              <Input
                id="driver-name"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: João Silva"
              />
            </div>
            <div className="space-y-2 w-full">
              <Label htmlFor="driver-local-id">Matrícula / ID Local</Label>
              <Input
                id="driver-local-id"
                value={newDriverLocalId}
                onChange={(e) => setNewDriverLocalId(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: MOT-001"
              />
            </div>
            <Button
              onClick={handleAddDriver}
              className={`w-full md:w-auto shrink-0 ${!newDriverName.trim() || !newDriverLocalId.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> Motoristas Ativos ({drivers.length})
        </h3>

        {drivers.length === 0 ? (
          <p className="text-muted-foreground bg-muted/30 p-8 text-center rounded-lg border border-dashed">
            Nenhum motorista cadastrado na base.
          </p>
        ) : (
          <ScrollArea className="h-[400px] rounded-md border bg-card p-4">
            <div className="space-y-3">
              {drivers.map((driver) => (
                <Collapsible key={driver.id} className="border rounded-md shadow-sm">
                  <div className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full hidden sm:block">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{driver.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {driver.local_id}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDriver(driver.id, driver.name)}
                        title="Remover Motorista"
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  <CollapsibleContent className="px-4 pb-3 text-xs text-muted-foreground border-t bg-muted/10 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <p>
                        <strong>ID Sistema:</strong> <span className="font-mono">{driver.id}</span>
                      </p>
                      <p>
                        <strong>Criado em:</strong>{' '}
                        {driver.created ? new Date(driver.created).toLocaleString() : '-'}
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
