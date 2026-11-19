import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 selection:bg-blue-500/10 selection:text-blue-700">
      <Outlet />
    </main>
  )
}
