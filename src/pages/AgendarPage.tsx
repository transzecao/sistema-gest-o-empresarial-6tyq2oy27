import { ScheduleForm } from '@/components/scheduling/ScheduleForm'

export default function AgendarPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Agendar Coleta</h1>
        <p className="text-muted-foreground mt-1">
          Preencha os dados complementares para efetivar a coleta da sua carga.
        </p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-1">
        <ScheduleForm />
      </div>
    </div>
  )
}
