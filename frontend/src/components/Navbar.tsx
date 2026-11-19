import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  CpuChipIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { useFirewallStatus } from '../hooks/useFirewall'

interface NavbarProps {
  onToggleMobileMenu?: () => void
  isMobileMenuOpen?: boolean
}

export function Navbar({
  onToggleMobileMenu,
  isMobileMenuOpen,
}: NavbarProps) {
  const { user, logout } = useAuth()
  const { data: statusData } = useFirewallStatus()
  const isEnforcing = statusData?.mode !== 'MONITOR_ONLY'

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/90 backdrop-blur-md shadow-2xs">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              type="button"
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden cursor-pointer transition-colors"
              onClick={onToggleMobileMenu}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                  AI Privacy Firewall
                </span>
                <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-700 uppercase sm:inline-block">
                  ENTERPRISE UBA
                </span>
              </div>
              <p className="hidden text-xs text-slate-500 font-medium sm:block">
                Privacy Shield Technologies Pvt. Ltd.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Live Protection Status Indicator */}
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 md:flex shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold text-emerald-700">Autonomous Defense Active</span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-500">Latency: 1.2ms</span>
          </div>

          {/* Engine Enforcement Badge */}
          <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 lg:flex shadow-2xs">
            <CpuChipIcon className="h-3.5 w-3.5 text-blue-600" />
            <span>Mode:</span>
            <span className={isEnforcing ? 'text-blue-700' : 'text-amber-700'}>
              {isEnforcing ? 'Zero Trust Enforcing' : 'Monitoring Only'}
            </span>
          </div>

          {/* User Account & Logout */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:gap-3 sm:pl-5">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">
                {user?.username ?? 'SOC Analyst'}
              </p>
              <p className="text-[10px] font-semibold text-blue-600 uppercase">
                SecOps Lead
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 cursor-pointer transition-all duration-150 shadow-2xs"
              title="Sign Out"
              aria-label="Sign out"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
