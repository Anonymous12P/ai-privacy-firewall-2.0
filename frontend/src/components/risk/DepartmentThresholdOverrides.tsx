import { useState } from 'react'
import { BuildingOffice2Icon } from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { Card } from '../Card'
import type { DepartmentThresholdOverride } from '../../types/riskTuning'

interface DepartmentThresholdOverridesProps {
  overrides: DepartmentThresholdOverride[]
  onToggleOverride?: (deptName: string, enabled: boolean) => void
}

export function DepartmentThresholdOverrides({
  overrides: initialOverrides,
  onToggleOverride,
}: DepartmentThresholdOverridesProps) {
  const [overrides, setOverrides] = useState<DepartmentThresholdOverride[]>(initialOverrides)

  const handleToggle = (dept: string) => {
    setOverrides((prev) =>
      prev.map((o) => {
        if (o.department === dept) {
          const nextState = !o.overrideEnabled
          if (onToggleOverride) onToggleOverride(dept, nextState)
          toast.success(
            `${dept} threshold override ${nextState ? 'ACTIVATED' : 'DEACTIVATED'} (Reverted to global policy)`,
          )
          return { ...o, overrideEnabled: nextState }
        }
        return o
      }),
    )
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BuildingOffice2Icon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Department-Specific Decision Threshold Overrides
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Tailor sensitivity parameters to departmental compliance mandates and asset criticality.
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
          {overrides.filter((o) => o.overrideEnabled).length} of {overrides.length} Overrides Active
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {overrides.map((item) => (
          <div
            key={item.department}
            className={`rounded-xl border p-4 transition ${
              item.overrideEnabled
                ? 'border-indigo-200 bg-white shadow-xs'
                : 'border-slate-200 bg-slate-50/50 opacity-80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{item.department}</h4>
                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 mt-1">
                  {item.regulatoryStandard}
                </span>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => handleToggle(item.department)}
                className={`cursor-pointer relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  item.overrideEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
                title={`Toggle override for ${item.department}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    item.overrideEnabled ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Threshold comparison */}
            <div className="mt-4 rounded-lg bg-slate-50 p-2.5 text-xs border border-slate-100">
              <div className="grid grid-cols-4 gap-1 text-center font-mono">
                <div>
                  <p className="text-[10px] text-slate-400">ALLOW</p>
                  <p className="font-bold text-emerald-700">
                    {item.overrideEnabled ? item.customAllow : item.baselineAllow}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">WARN</p>
                  <p className="font-bold text-amber-700">
                    {item.overrideEnabled ? item.customWarn : item.baselineWarn}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">RESTRICT</p>
                  <p className="font-bold text-orange-700">
                    {item.overrideEnabled ? item.customRestrict : item.baselineRestrict}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">BLOCK</p>
                  <p className="font-bold text-red-700">
                    {item.overrideEnabled ? item.customBlock : item.baselineBlock}
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance Rationale */}
            <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
              {item.rationale}
            </p>

            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2">
              <span>Status: {item.overrideEnabled ? 'Overridden' : 'Global Default'}</span>
              <span>Updated: {item.lastModified}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
