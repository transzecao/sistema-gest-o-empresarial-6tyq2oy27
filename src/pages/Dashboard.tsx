import { useEffect, useState } from 'react'
import { getUsers, User } from '@/services/governance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users, Shield, Activity, UserCog } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const loadUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Keep table in sync with real-time updates
  useRealtime('users', () => {
    loadUsers()
  })

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users },
    {
      label: 'Active Profiles',
      value: new Set(users.map((u) => u.profile_id).filter(Boolean)).size,
      icon: Shield,
    },
    {
      label: 'Sectors Assigned',
      value: new Set(users.map((u) => u.sector).filter(Boolean)).size,
      icon: Activity,
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Governance Overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '-' : stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            Manage user access and profile assignments across the enterprise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Profile Role</TableHead>
                <TableHead>Sector</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Loading governance data...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <UserCog className="h-4 w-4" />
                      </div>
                      {user.name || 'Unnamed User'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.expand?.profile_id ? (
                        <Badge variant="default" className="bg-primary/90">
                          {user.expand.profile_id.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          No Profile Assigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.sector || 'Not Assigned'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
