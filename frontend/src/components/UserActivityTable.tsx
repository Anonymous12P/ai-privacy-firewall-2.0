import type { AdminUser } from '../types/api'
import { Card } from './Card'

export function UserActivityTable({ users }: { users: AdminUser[] }) {
  return <Card><h2 className="font-semibold text-slate-900">User activity</h2>{users.length === 0 ? <p className="mt-5 text-sm text-slate-500">No users registered.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="text-xs uppercase tracking-wide text-slate-400"><tr><th className="py-3">Username</th><th className="py-3">Scans</th><th className="py-3">Last activity</th></tr></thead><tbody>{users.map((user) => <tr className="border-t border-slate-100" key={user.username}><td className="py-3 font-medium">{user.username}</td><td className="py-3">{user.scan_count}</td><td className="py-3 text-slate-500">{user.last_activity ? new Date(user.last_activity).toLocaleString() : '—'}</td></tr>)}</tbody></table></div>}</Card>
}
