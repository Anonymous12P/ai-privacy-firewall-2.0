import { UserCircleIcon } from '@heroicons/react/24/outline'
import { Card } from '../components/Card'
import { LoadingState } from '../components/LoadingState'
import { useHistory } from '../hooks/useHistory'
import { useAuth } from '../hooks/useAuth'

export function ProfilePage() {
  const { user } = useAuth()
  const history = useHistory({ page: 1, pageSize: 1, sortOrder: 'desc' })
  return <div className="mx-auto max-w-3xl"><h1 className="text-3xl font-bold text-slate-900">Profile</h1><p className="mt-2 text-slate-500">Your authenticated account information.</p><div className="mt-8 grid gap-6"><Card><div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-full bg-indigo-50 text-indigo-600"><UserCircleIcon className="h-8 w-8" /></div><div><h2 className="text-lg font-semibold text-slate-900">{user?.username ?? 'Authenticated user'}</h2><p className="text-sm text-slate-500">Username</p></div></div><dl className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2"><div><dt className="text-xs uppercase tracking-wide text-slate-400">Account created</dt><dd className="mt-1 text-sm text-slate-700">Not available from the current API</dd></div><div><dt className="text-xs uppercase tracking-wide text-slate-400">Scan count</dt><dd className="mt-1 text-sm font-semibold text-slate-700">{history.isLoading ? '…' : history.data?.total ?? '—'}</dd></div></dl></Card><Card><h2 className="text-lg font-semibold text-slate-900">Password</h2><p className="mt-2 text-sm text-slate-500">Password changes are not available because the backend currently exposes no change-password endpoint.</p><button className="mt-5 cursor-not-allowed rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400" disabled>Change password</button></Card>{history.isLoading && <LoadingState />}</div></div>
}
