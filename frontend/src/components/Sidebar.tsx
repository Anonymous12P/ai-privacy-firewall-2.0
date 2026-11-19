import {
  AdjustmentsHorizontalIcon,
  ArrowPathRoundedSquareIcon,
  ChartBarSquareIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  FingerPrintIcon,
  HomeIcon,
  RadioIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import type { ComponentType, SVGProps } from 'react'
import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  badge?: string
  badgeVariant?: 'primary' | 'success' | 'warning' | 'info' | 'default'
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/live-monitoring', label: 'Live Monitoring', icon: RadioIcon, badge: 'LIVE', badgeVariant: 'success' },
  { to: '/firewall-engine', label: 'AI Firewall Engine', icon: ShieldCheckIcon, badge: 'CORE', badgeVariant: 'primary' },
  { to: '/uba', label: 'User Behavior Analytics', icon: FingerPrintIcon, badge: 'UBA', badgeVariant: 'info' },
  { to: '/ai-analytics', label: 'AI Analytics', icon: ChartBarSquareIcon, badge: 'ML', badgeVariant: 'default' },
  { to: '/digital-twin', label: 'Digital Twin', icon: CircleStackIcon },
  { to: '/policy-engine', label: 'Policy Engine', icon: AdjustmentsHorizontalIcon },
  { to: '/audit-logs', label: 'Audit Logs', icon: DocumentTextIcon },
  { to: '/employees', label: 'Employees', icon: UserGroupIcon, badge: '8 SECURED', badgeVariant: 'primary' },
  { to: '/adaptive-learning', label: 'Adaptive Learning', icon: ArrowPathRoundedSquareIcon, badge: 'AUTO', badgeVariant: 'warning' },
  { to: '/settings', label: 'Settings', icon: Cog6ToothIcon },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const navContent = (
    <div className="flex h-full flex-col justify-between py-5 px-3">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase font-sans">
            Enterprise Navigation
          </p>
          <nav className="mt-2.5 grid gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 text-slate-500 group-hover:text-blue-600" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        item.badgeVariant === 'primary'
                          ? 'bg-blue-100 text-blue-700'
                          : item.badgeVariant === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.badgeVariant === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : item.badgeVariant === 'info'
                                ? 'bg-cyan-100 text-cyan-800'
                                : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Enterprise Infrastructure Badge */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
            Zero Trust Architecture
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 font-medium leading-relaxed">
          XGBoost + Real-time UBA Telemetry running on Privacy Shield Core.
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200/90 bg-white md:block">
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          {navContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4 shadow-2xl">
            <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-200">
              <span className="text-sm font-bold text-slate-900">Navigation Menu</span>
              <button
                type="button"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                onClick={onClose}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="h-full overflow-y-auto">{navContent}</div>
          </div>
        </div>
      )}
    </>
  )
}
