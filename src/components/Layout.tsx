import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  LogOut,
  LayoutDashboard,
  BarChart,
  Users,
  Settings,
  FileText,
  CheckSquare,
  TrendingUp,
  Clock,
  Activity,
  ShoppingCart,
  Map,
  Truck,
} from 'lucide-react'

const navConfig: Record<string, { title: string; icon: any }[]> = {
  Diretor: [
    { title: 'Métricas', icon: BarChart },
    { title: 'Gestão de Supervisores', icon: Users },
    { title: 'Configurações', icon: Settings },
  ],
  'Supervisor Financeiro': [
    { title: 'Gestão de Formulários', icon: FileText },
    { title: 'Aprovações', icon: CheckSquare },
    { title: 'Métricas da Equipe', icon: TrendingUp },
  ],
  Funcionário: [
    { title: 'Meus Lançamentos', icon: Activity },
    { title: 'Histórico', icon: Clock },
    { title: 'Status', icon: CheckSquare },
  ],
  Funcionario_Financeiro: [
    { title: 'Meus Lançamentos', icon: Activity },
    { title: 'Histórico', icon: Clock },
  ],
  Funcionario_Operacional: [
    { title: 'Meus Lançamentos', icon: Activity },
    { title: 'Status', icon: CheckSquare },
  ],
  Funcionario_Prospeccao: [{ title: 'Meus Lançamentos', icon: Activity }],
  Cliente: [
    { title: 'Meus Pedidos', icon: ShoppingCart },
    { title: 'Acompanhamento', icon: Map },
    { title: 'Histórico', icon: Clock },
  ],
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut } = useAuth()

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  if (!user) return null

  const roleName = user?.role || profile?.name || 'Cliente'
  const currentNav = roleName ? navConfig[roleName] || [] : []

  const getDashboardLink = () => {
    switch (roleName) {
      case 'Diretor':
        return '/dashboard/diretor'
      case 'Supervisor Financeiro':
        return '/portal-supervisor'
      case 'Funcionário':
      case 'Funcionario_Financeiro':
      case 'Funcionario_Operacional':
      case 'Funcionario_Prospeccao':
        return '/dashboard/funcionario'
      case 'Cliente':
        return '/portal-cliente'
      default:
        return '/dashboard'
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background animate-fade-in">
        <Sidebar className="border-r-0 shadow-xl" collapsible="icon">
          <SidebarHeader className="py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="hover:bg-transparent pointer-events-none">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#5c0017] text-white">
                    <Truck className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold text-base text-sidebar-foreground">
                      Transzecão
                    </span>
                    <span className="text-xs text-sidebar-foreground/80">Gestão 360</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent className="px-2 mt-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === getDashboardLink()}
                  tooltip="Visão Geral"
                  className="text-sidebar-foreground"
                >
                  <Link to={getDashboardLink()}>
                    <LayoutDashboard />
                    <span>Visão Geral</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <div className="my-4 px-2 text-xs font-semibold text-sidebar-primary-foreground/50 uppercase tracking-wider">
                Módulos
              </div>

              {currentNav.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="opacity-60 hover:opacity-100 transition-opacity text-sidebar-foreground cursor-not-allowed"
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                    <span className="ml-auto text-[9px] uppercase tracking-wider bg-black/10 px-1.5 py-0.5 rounded text-sidebar-foreground/80">
                      Em breve
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-sidebar-foreground hover:bg-red-500/20 hover:text-red-600 transition-colors font-medium"
                >
                  <LogOut />
                  <span>Sair do Sistema</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 text-[#5c0017] hover:bg-[#5c0017]/10 transition-colors" />
              <Separator orientation="vertical" className="h-6" />
              <h2 className="font-semibold text-lg text-slate-800">Workspace Central</h2>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-500 hover:text-[#5c0017] hover:bg-[#5c0017]/5"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
              </Button>
              <div className="flex items-center gap-3 border-l border-border pl-4">
                <div className="flex-col items-end hidden sm:flex">
                  <span className="text-sm font-medium leading-none text-slate-800">
                    {user?.name || user?.email}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">{roleName}</span>
                </div>
                <Avatar className="h-9 w-9 border-2 border-[#5c0017]/20">
                  <AvatarImage
                    src={
                      user?.avatar
                        ? pb.files.getURL(user, user.avatar)
                        : `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${user?.id}`
                    }
                  />
                  <AvatarFallback className="bg-[#5c0017]/10 text-[#5c0017] font-bold">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
