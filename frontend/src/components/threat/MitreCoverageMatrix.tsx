import { Card } from '../Card'
import type { MitreCoverageItem } from '../../types/threatIntel'

interface MitreCoverageMatrixProps {
  coverage: MitreCoverageItem[]
}

export function MitreCoverageMatrix({ coverage }: MitreCoverageMatrixProps) {
  const coveredCount = coverage.filter((c) => c.coverage === 'Covered').length
  const partialCount = coverage.filter((c) => c.coverage === 'Partial').length
  const totalTactics = coverage.length
  const coveragePercent = Math.round(((coveredCount + partialCount * 0.5) / totalTactics) * 100)

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            MITRE ATT&CK Enterprise Matrix Coverage & Defense Posture
          </h3>
          <p className="text-xs text-slate-500">
            Automated defensive mapping across all 12 enterprise adversary tactics evaluated by firewall rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Covered ({coveredCount})
            </span>
            <span className="flex items-center gap-1 font-semibold text-amber-700">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Partial ({partialCount})
            </span>
          </div>

          <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1 font-mono text-xs font-bold text-emerald-800">
            {coveragePercent}% Total Coverage
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {coverage.map((item) => {
          const isCovered = item.coverage === 'Covered'
          const isPartial = item.coverage === 'Partial'

          return (
            <div
              key={item.tactic}
              className={`flex flex-col justify-between rounded-2xl border p-3.5 text-xs transition ${
                isCovered
                  ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                  : isPartial
                  ? 'border-amber-200 bg-amber-50/50 hover:bg-amber-50'
                  : 'border-slate-200 bg-slate-50/40 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {item.techniqueId}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                      isCovered
                        ? 'bg-emerald-100 text-emerald-800'
                        : isPartial
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.coverage}
                  </span>
                </div>

                <h4 className="mt-2 font-bold text-xs text-slate-900">
                  {item.tactic}
                </h4>

                <span className="mt-0.5 text-[10px] text-slate-500 block truncate">
                  {item.techniqueName}
                </span>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Rules:</span>
                  <span className="font-bold text-slate-800">{item.ruleCount} Rules</span>
                </div>
                <p className="line-clamp-1 text-slate-500 italic">
                  {item.detectionMechanism}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
