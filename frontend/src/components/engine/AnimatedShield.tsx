import {
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import type { FirewallAction } from '../../types/api'

interface AnimatedShieldProps {
  decision: FirewallAction
  threatScore: number
  policyName: string
}

const shieldStyles: Record<
  FirewallAction,
  {
    glow: string
    ringColor: string
    bgGradient: string
    borderColor: string
    textColor: string
    badgeColor: string
    icon: typeof ShieldCheckIcon
    label: string
  }
> = {
  ALLOW: {
    glow: 'shadow-emerald-500/40 ring-emerald-400',
    ringColor: 'border-emerald-400',
    bgGradient: 'from-emerald-950/80 via-emerald-900/60 to-slate-900',
    borderColor: 'border-emerald-500/70',
    textColor: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: CheckBadgeIcon,
    label: 'ALLOW',
  },
  WARN: {
    glow: 'shadow-yellow-500/40 ring-yellow-400',
    ringColor: 'border-yellow-400',
    bgGradient: 'from-yellow-950/80 via-yellow-900/60 to-slate-900',
    borderColor: 'border-yellow-500/70',
    textColor: 'text-yellow-400',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    icon: ExclamationTriangleIcon,
    label: 'WARN',
  },
  RESTRICT: {
    glow: 'shadow-amber-500/40 ring-amber-400',
    ringColor: 'border-amber-400',
    bgGradient: 'from-amber-950/80 via-amber-900/60 to-slate-900',
    borderColor: 'border-amber-500/70',
    textColor: 'text-amber-400',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: LockClosedIcon,
    label: 'RESTRICT',
  },
  BLOCK: {
    glow: 'shadow-rose-600/50 ring-rose-500',
    ringColor: 'border-rose-500',
    bgGradient: 'from-rose-950/80 via-rose-900/60 to-slate-900',
    borderColor: 'border-rose-500/70',
    textColor: 'text-rose-400',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    icon: NoSymbolIcon,
    label: 'BLOCK',
  },
}

export function AnimatedShield({
  decision,
  threatScore,
  policyName,
}: AnimatedShieldProps) {
  const current = shieldStyles[decision]
  const IconComponent = current.icon

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Outer Pulse Rings */}
      <div className="relative flex items-center justify-center">
        {/* Animated Background Glow */}
        <div
          className={`absolute -inset-4 rounded-full opacity-60 blur-xl transition-all duration-700 animate-pulse ${
            decision === 'ALLOW'
              ? 'bg-emerald-500'
              : decision === 'WARN'
                ? 'bg-yellow-500'
                : decision === 'RESTRICT'
                  ? 'bg-amber-500'
                  : 'bg-rose-600'
          }`}
        />

        {/* Central Shield Container */}
        <div
          className={`relative flex h-36 w-36 sm:h-44 sm:w-44 flex-col items-center justify-center rounded-3xl border-2 bg-linear-to-b shadow-2xl transition-all duration-500 ${current.bgGradient} ${current.borderColor} ${current.glow}`}
        >
          {/* Decorative Corner Accents */}
          <span className="absolute top-2 left-2 h-2 w-2 rounded-full bg-white/30" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white/30" />
          <span className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-white/30" />
          <span className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-white/30" />

          {/* Large Shield / Action Icon */}
          <div className="relative flex items-center justify-center">
            <IconComponent
              className={`h-16 w-16 sm:h-20 sm:w-20 transition-transform duration-300 hover:scale-105 ${current.textColor}`}
            />
          </div>

          {/* Decision Label */}
          <div className="mt-2 text-center">
            <span
              className={`inline-block rounded-md border px-3 py-0.5 text-xs sm:text-sm font-extrabold tracking-widest font-mono uppercase shadow-xs ${current.badgeColor}`}
            >
              {current.label}
            </span>
          </div>
        </div>
      </div>

      {/* Threat Index Readout */}
      <div className="mt-4 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Threat Score:
          </span>
          <span className={`font-mono text-lg font-bold ${current.textColor}`}>
            {threatScore.toFixed(1)} / 100
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-xs truncate font-mono">
          Policy: {policyName}
        </p>
      </div>
    </div>
  )
}
