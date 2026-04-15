import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import DashboardDiretor from './pages/DashboardDiretor'
import DashboardSupervisor from './pages/DashboardSupervisor'
import DashboardFuncionario from './pages/DashboardFuncionario'
import DashboardSubFuncao from './pages/DashboardSubFuncao'
import DashboardCliente from './pages/DashboardCliente'
import FleetConfigPage from './pages/FleetConfigPage'
import RoutingPage from './pages/RoutingPage'
import AgendarPage from './pages/AgendarPage'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { AuthProvider, useAuth } from './hooks/use-auth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/diretor" element={<DashboardDiretor />} />
        <Route path="/portal-supervisor" element={<DashboardSupervisor />} />
        <Route path="/dashboard/funcionario" element={<DashboardFuncionario />} />
        <Route path="/dashboard/sub-funcao" element={<DashboardSubFuncao />} />
        <Route path="/portal-cliente" element={<DashboardCliente />} />
        <Route path="/dashboard/fleet" element={<FleetConfigPage />} />
        <Route path="/dashboard/routing" element={<RoutingPage />} />
        <Route path="/dashboard/agendar" element={<AgendarPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="cpk-theme">
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
)

export default App
