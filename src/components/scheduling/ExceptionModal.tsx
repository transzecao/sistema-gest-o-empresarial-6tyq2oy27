import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ExceptionModal({ onReject }: { onReject: (reason: string) => void }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="h-7 text-[10px] px-2 shadow-sm">
          Rejeitar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Motivo da Rejeição</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="" disabled>
              Selecione um motivo padronizado...
            </option>
            <option value="Endereço Inexistente">Endereço Inexistente</option>
            <option value="Cliente Ausente">Cliente Ausente</option>
            <option value="Mercadoria não pronta">Mercadoria não pronta</option>
            <option value="Avaria Identificada">Avaria Identificada na Origem</option>
            <option value="Cancelamento pelo Cliente">Cancelamento solicitado pelo Cliente</option>
            <option value="Outros">Outros</option>
          </select>
          <Button
            className="w-full"
            variant="destructive"
            onClick={() => {
              onReject(reason)
              setOpen(false)
            }}
            disabled={!reason}
          >
            Confirmar Rejeição do Agendamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
