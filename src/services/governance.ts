import pb from '@/lib/pocketbase/client'

export interface Profile {
  id: string
  name: string
  description: string
  created: string
  updated: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar: string
  profile_id: string
  sector: string
  sub_function: string
  expand?: {
    profile_id?: Profile
  }
  created: string
  updated: string
}

export interface Permission {
  id: string
  profile_id: string
  permission_name: string
  resource: string
  created: string
  updated: string
  expand?: {
    profile_id?: Profile
  }
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  details: any
  created: string
  updated: string
  expand?: {
    user_id?: User
  }
}

export const getUsers = () =>
  pb.collection('users').getFullList<User>({ expand: 'profile_id', sort: '-created' })

export const getProfiles = () => pb.collection('profiles').getFullList<Profile>({ sort: 'name' })

export const getPermissions = () =>
  pb.collection('permissions').getFullList<Permission>({ expand: 'profile_id', sort: '-created' })

export const getAuditLogs = () =>
  pb.collection('audit_logs').getFullList<AuditLog>({ expand: 'user_id', sort: '-created' })
