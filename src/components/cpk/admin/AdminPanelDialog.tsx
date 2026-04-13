import { useState } from 'react'
import { Settings } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useRoleValidation } from '@/hooks/use-role-validation'
import { logUnauthorizedAccess } from '@/services/auditLog'
import { useToast } from '@/hooks/use-toast'
import { AdminSettingsForm } from './AdminSettingsForm'
import { AdminAuditHistory } from './AdminAuditHistory'
import { AdminBackupRestore } from './AdminBackupRestore'

export function AdminPanelDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const { canConfigure, isReady } = useRoleValidation()
  const { toast } = useToast()

  const handleOpenChange = (open: boolean) => {
    if (!isReady) return

    if (open && !canConfigure) {
      logUnauthorizedAccess('ATTEMPT_OPEN_ADMIN_PANEL')
      toast({
        variant: 'destructive',
        title: 'Acesso Restrito',
        description: 'Você não tem permissão para acessar o Painel Administrativo.',
      })
      return
    }

    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 shadow-sm">
          <Settings className="w-4 h-4" />
          Painel Administrativo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5 text-primary" />
            Administração do Sistema
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="params" className="flex-1 flex flex-col min-h-0 mt-2">
          <TabsList className="grid w-full grid-cols-3 shrink-0">
            <TabsTrigger value="params">Parâmetros Operacionais</TabsTrigger>
            <TabsTrigger value="audit">Histórico de Auditoria</TabsTrigger>
            <TabsTrigger value="backup">Backup e Restauração</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 pr-2 custom-scrollbar">
            <TabsContent value="params" className="m-0 h-full">
              <AdminSettingsForm onSave={() => setIsOpen(false)} />
            </TabsContent>

            <TabsContent value="audit" className="m-0 h-full">
              <AdminAuditHistory />
            </TabsContent>

            <TabsContent value="backup" className="m-0 h-full">
              <AdminBackupRestore />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
