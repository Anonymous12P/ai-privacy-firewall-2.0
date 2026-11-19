import { Card } from '../Card'
import type { GlobalAttackPoint, ThreatSeverity } from '../../types/threatIntel'

interface GlobalAttackMapProps {
  attackPoints: GlobalAttackPoint[]
}

const SEVERITY_COLORS: Record<ThreatSeverity, { bg: string; dot: string; glow: string }> = {
  Critical: { bg: 'border-rose-300 bg-rose-50/80', dot: 'bg-rose-500', glow: 'shadow-rose-500/50' },
  High: { bg: 'border-orange-300 bg-orange-50/80', dot: 'bg-orange-500', glow: 'shadow-orange-500/50' },
  Medium: { bg: 'border-amber-300 bg-amber-50/80', dot: 'bg-amber-500', glow: 'shadow-amber-500/50' },
  Low: { bg: 'border-emerald-300 bg-emerald-50/80', dot: 'bg-emerald-500', glow: 'shadow-emerald-500/50' },
}

export function GlobalAttackMap({ attackPoints }: GlobalAttackMapProps) {
  const totalAttacks = attackPoints.reduce((acc, curr) => acc + curr.attackCount, 0)

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Global Cyber Threat & Attack Origin Matrix
            </h3>
            <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
              Live Ingress Monitoring
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Geographic adversary provenance mapping correlating foreign C2 infrastructure and high-velocity exfiltration probes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Total Intercepted Probes:</span>
          <span className="rounded-xl bg-slate-900 px-3 py-1 font-mono text-xs font-bold text-white shadow-xs">
            {totalAttacks.toLocaleString()} Attacks
          </span>
        </div>
      </div>

      {/* Stylized Visual Map Projection Container */}
      <div className="mt-6 relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-inner min-h-[280px] flex flex-col justify-between">
        {/* Subtle grid background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-mono text-indigo-400 font-bold uppercase tracking-wider">
            RADAR ACTIVE // SOC GLOBAL SENSORS
          </span>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              Critical (&gt;300)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              High
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Medium
            </span>
          </div>
        </div>

        {/* Global Origins Cards Carousel */}
        <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {attackPoints.slice(0, 4).map((pt) => (
            <div
              key={pt.countryCode}
              className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 backdrop-blur-sm shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-200">
                  {pt.country} ({pt.countryCode})
                </span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    pt.threatLevel === 'Critical'
                      ? 'bg-rose-500 shadow-sm shadow-rose-500'
                      : 'bg-orange-500'
                  }`}
                />
              </div>

              <p className="mt-2 text-xl font-black text-white font-mono">
                {pt.attackCount.toLocaleString()}
              </p>

              <span className="mt-1 text-[10px] text-slate-400 block truncate">
                {pt.primaryThreatType}
              </span>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-4 flex items-center justify-between text-[11px] text-slate-500">
          <span>Global IP geolocation accuracy: 99.4% (MaxMind GeoIP2 Certified)</span>
          <span className="font-mono text-indigo-400">8 Hostile Hotspots Active</span>
        </div>
      </div>

      {/* Country Detail Table */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2.5 font-semibold">Origin Country</th>
              <th className="py-2.5 font-semibold text-right">Attack Volume</th>
              <th className="py-2.5 font-semibold">Associated Campaign</th>
              <th className="py-2.5 font-semibold">Primary Threat Type</th>
              <th className="py-2.5 font-semibold text-center">Threat Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attackPoints.map((pt) => {
              const styles = SEVERITY_COLORS[pt.threatLevel]

              return (
                <tr key={pt.countryCode} className="transition hover:bg-slate-50/70">
                  <td className="py-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
                      <span>{pt.country}</span>
                      <span className="rounded bg-slate-100 px-1 py-0.2 font-mono text-[10px] text-slate-500">
                        {pt.countryCode}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900">
                    {pt.attackCount.toLocaleString()}
                  </td>
                  <td className="py-3 text-slate-700 font-medium">
                    {pt.campaign}
                  </td>
                  <td className="py-3 text-slate-600">
                    {pt.primaryThreatType}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${styles.bg}`}
                    >
                      {pt.threatLevel}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
