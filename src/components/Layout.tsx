import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { getRole, logout, Role } from '@/lib/auth'
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

const navConfig: Record<Role, { title: string; icon: any }[]> = {
  Diretor: [
    { title: 'Métricas', icon: BarChart },
    { title: 'Gestão de Supervisores', icon: Users },
    { title: 'Configurações', icon: Settings },
  ],
  Supervisor: [
    { title: 'Gestão de Formulários', icon: FileText },
    { title: 'Aprovação', icon: CheckSquare },
    { title: 'Métricas da Equipe', icon: TrendingUp },
  ],
  Funcionário: [
    { title: 'Meus Lançamentos', icon: Activity },
    { title: 'Histórico', icon: Clock },
    { title: 'Status', icon: CheckSquare },
  ],
  'Sub-função': [{ title: 'Meus Lançamentos', icon: Activity }],
  Cliente: [
    { title: 'Meus Pedidos', icon: ShoppingCart },
    { title: 'Acompanhamento', icon: Map },
    { title: 'Histórico', icon: Clock },
  ],
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState<Role | null>(null)

  useEffect(() => {
    const currentRole = getRole()
    if (!currentRole) {
      navigate('/')
    } else {
      setRole(currentRole)
    }
  }, [navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!role) return null

  const currentNav = navConfig[role] || []

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50 animate-fade-in">
        <Sidebar className="border-r-0 shadow-xl" collapsible="icon">
          <SidebarHeader className="py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="hover:bg-transparent pointer-events-none">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-primary">
                    <Truck className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold text-base text-white">Transzecão</span>
                    <span className="text-xs text-sidebar-primary-foreground/80">Gestão 360</span>
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
                  isActive={location.pathname === '/dashboard'}
                  tooltip="Visão Geral"
                >
                  <Link to="/dashboard">
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
                    className="opacity-60 hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                    <span className="ml-auto text-[9px] uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded text-white/70">
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
                  className="text-sidebar-primary-foreground hover:bg-red-500/20 hover:text-white transition-colors"
                >
                  <LogOut />
                  <span>Sair do sistema</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden bg-gray-50">
          <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 text-primary hover:bg-primary/10 hover:text-primary transition-colors" />
              <Separator orientation="vertical" className="h-6" />
              <h2 className="font-semibold text-lg text-gray-800">Workspace Central</h2>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-500 hover:text-primary hover:bg-primary/5"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
              </Button>
              <div className="flex items-center gap-3 border-l pl-4">
                <div className="flex-col items-end hidden sm:flex">
                  <span className="text-sm font-medium leading-none text-gray-900">
                    Perfil: {role}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Acesso Autenticado</span>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${role.length}`}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {role.charAt(0)}
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
