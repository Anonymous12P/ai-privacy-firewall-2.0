import { useMemo, useState } from 'react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { AdminEmpty } from '../components/AdminEmpty'
import { AdminError } from '../components/AdminError'
import { AdminLoading } from '../components/AdminLoading'
import { AdminPagination } from '../components/AdminPagination'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ExperimentHistoryTable } from '../components/ExperimentHistoryTable'
import { RegisteredModelsTable } from '../components/RegisteredModelsTable'
import { SystemHealthCard } from '../components/SystemHealthCard'
import { SystemOverviewCard } from '../components/SystemOverviewCard'
import { UserActivityTable } from '../components/UserActivityTable'
import { useExperiments, useModels, useSystemInfo, useUsers } from '../hooks/useAdmin'

const userPageSize = 10

export function AdminPage() {
  const system = useSystemInfo()
  const models = useModels()
  const users = useUsers()
  const experiments = useExperiments()
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const retry = () => {
    void system.refetch()
    void models.refetch()
    void users.refetch()
    void experiments.refetch()
  }
  const filteredUsers = useMemo(() => users.data?.users.filter((user) => user.username.toLowerCase().includes(userSearch.toLowerCase())) ?? [], [userSearch, users.data?.users])
  const pages = Math.max(1, Math.ceil(filteredUsers.length / userPageSize))
  const visibleUsers = filteredUsers.slice((userPage - 1) * userPageSize, userPage * userPageSize)
  const loading = system.isLoading || models.isLoading || users.isLoading || experiments.isLoading
  const error = system.isError || models.isError || users.isError || experiments.isError
  useEffect(() => {
    if (error) toast.error('Unable to load administrative data.')
  }, [error])

  return <div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold text-slate-900">Admin dashboard</h1><p className="mt-2 text-slate-500">Monitor application health, models, users, and experiments.</p></div><Button className="flex items-center gap-2" onClick={retry} disabled={loading}><ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />Refresh</Button></div>
    <div className="mt-8">{loading ? <AdminLoading /> : error ? <AdminError onRetry={retry} /> : !system.data || !models.data || !users.data || !experiments.data ? <Card><AdminEmpty /></Card> : <><div className="grid gap-6 lg:grid-cols-2"><SystemOverviewCard system={system.data} /><SystemHealthCard apiOnline authenticationEnabled={system.data.authentication_enabled} routes={system.data.registered_api_routes} /></div><div className="mt-6"><RegisteredModelsTable models={models.data.models} /></div><Card className="mt-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold text-slate-900">Users</h2><p className="mt-1 text-sm text-slate-500">{users.data.total_users} registered users</p></div><input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Search users" value={userSearch} onChange={(event) => { setUserSearch(event.target.value); setUserPage(1) }} /></div><div className="mt-2"><UserActivityTable users={visibleUsers} /><AdminPagination page={userPage} pages={pages} onChange={setUserPage} /></div></Card><div className="mt-6"><ExperimentHistoryTable experiments={experiments.data.experiments} /></div></>}</div>
  </div>
}
