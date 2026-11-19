import { apiClient } from '../api/client'
import type {
  AdminExperiments,
  AdminModels,
  AdminUsers,
  SystemAdmin,
} from '../types/api'

export async function getSystemInfo(): Promise<SystemAdmin> {
  return (await apiClient.get<SystemAdmin>('/admin/system')).data
}

export async function getModels(): Promise<AdminModels> {
  return (await apiClient.get<AdminModels>('/admin/models')).data
}

export async function getUsers(): Promise<AdminUsers> {
  return (await apiClient.get<AdminUsers>('/admin/users')).data
}

export async function getExperiments(): Promise<AdminExperiments> {
  return (await apiClient.get<AdminExperiments>('/admin/experiments')).data
}
