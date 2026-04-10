import { useEffect, useState } from 'react'
import { getRole, Role } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, LayoutDashboard, Lock, Sparkles, Bell } from 'lucide-react'

export default function Dashboard() {
  const [role, setRole] = useState<Role | null>(null)

  useEffect(() => {
    setRole(getRole())
  }, [])

  if (!role) return null

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bem-vindo, {role}!</h1>
        <p className="text-gray-500 text-lg">
          Este é o seu painel de controle central. Navegue pelos módulos disponíveis no menu
          lateral.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <LayoutDashboard className="h-5 w-5" />
              Visão Geral
            </CardTitle>
            <CardDescription>Resumo das suas atividades recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50 mt-4">
              <Activity className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground border-none shadow-md lg:col-span-2 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 bg-white/10 w-48 h-48 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 bg-black/10 w-48 h-48 rounded-full blur-3xl"></div>

          <CardHeader className="relative z-10">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              Fase 1: Governança & Acessos
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-base mt-2">
              Você está acessando a simulação arquitetural do novo Business Management System da
              Transzecão.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pt-4">
            <div className="bg-black/20 rounded-lg p-5 backdrop-blur-sm border border-white/10">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/10 rounded-full mt-0.5 shrink-0">
                  <Lock className="h-5 w-5 text-white/90" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1.5 text-lg">
                    Estrutura de Permissões Ativa
                  </h4>
                  <p className="text-sm text-white/80 leading-relaxed">
                    O menu lateral à esquerda foi gerado dinamicamente com base no seu perfil de{' '}
                    <strong className="text-white font-semibold">"{role}"</strong>. Módulos
                    específicos aparecerão bloqueados e estão previstos para as próximas fases de
                    desenvolvimento do sistema.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          Mural de Atualizações
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              id: 1,
              title: 'Atualização de Módulo Financeiro',
              desc: 'O módulo entrará em fase de testes fechados na próxima semana.',
              days: 2,
            },
            {
              id: 2,
              title: 'Nova Política de Acessos',
              desc: 'A hierarquia de visualização de formulários foi atualizada para supervisores.',
              days: 5,
            },
          ].map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                <span className="text-xs font-medium text-gray-400 mt-3 block uppercase tracking-wider">
                  Há {item.days} dias
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
