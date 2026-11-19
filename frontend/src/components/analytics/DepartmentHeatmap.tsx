import { Card } from '../Card'
import type { DepartmentRiskRecord } from '../../types/analytics'

interface DepartmentHeatmapProps {
  data: DepartmentRiskRecord[]
}

function getRiskColorClasses(avgRisk: number) {
  if (avgRisk >= 40) {
    return {
      bg: 'bg-rose-500 text-white',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      intensity: 'w-full bg-rose-500',
    }
  }
  if (avgRisk >= 30) {
    return {
      bg: 'bg-orange-500 text-white',
      badge: 'bg-orange-100 text-orange-800 border-orange-200',
      intensity: 'w-3/4 bg-orange-500',
    }
  }
  if (avgRisk >= 20) {
    return {
      bg: 'bg-amber-500 text-white',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      intensity: 'w-1/2 bg-amber-500',
    }
  }
  return {
    bg: 'bg-emerald-500 text-white',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    intensity: 'w-1/4 bg-emerald-500',
  }
}

export function DepartmentHeatmap({ data }: DepartmentHeatmapProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Department Risk Heatmap
          </h3>
          <p className="text-xs text-slate-500">
            Continuous threat posture, incident frequency, and enforcement distribution by department.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Critical (&ge;40)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            High (30-39)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Medium (20-29)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Low (&lt;20)
          </span>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2.5 font-semibold">Department</th>
              <th className="py-2.5 font-semibold text-center">Risk Intensity</th>
              <th className="py-2.5 font-semibold text-right">Average Risk</th>
              <th className="py-2.5 font-semibold text-right">Blocked</th>
              <th className="py-2.5 font-semibold text-right">Warnings</th>
              <th className="py-2.5 font-semibold text-right">Incidents</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((dept) => {
              const styles = getRiskColorClasses(dept.avgRisk)
              return (
                <tr
                  key={dept.department}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="py-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      <span>{dept.department}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${styles.intensity}`}
                        style={{ width: `${Math.min(100, dept.avgRisk * 2)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 font-bold ${styles.badge}`}
                    >
                      {dept.avgRisk.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-semibold text-rose-600">
                    {dept.blocked}
                  </td>
                  <td className="py-3 text-right font-mono font-semibold text-amber-600">
                    {dept.warnings}
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900">
                    {dept.incidents}
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
