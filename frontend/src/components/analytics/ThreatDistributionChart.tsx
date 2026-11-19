import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card } from '../Card'
import type { ThreatDistribution } from '../../types/analytics'

interface ThreatDistributionChartProps {
  data: ThreatDistribution[]
}

export function ThreatDistributionChart({ data }: ThreatDistributionChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Threat Severity Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Categorization of detected anomalies by AI severity tiers.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-slate-700">
          {total} Threats
        </span>
      </div>

      <div className="mt-4 flex flex-col items-center justify-center sm:flex-row sm:items-center sm:gap-6">
        <div className="h-60 w-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="count"
                nameKey="level"
              >
                {data.map((entry) => (
                  <Cell key={entry.level} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: unknown, name: unknown) => [
                  `${Number(val ?? 0)} incidents (${Math.round(
                    (Number(val ?? 0) / (total || 1)) * 100,
                  )}%)`,
                  String(name),
                ]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with Counts and Percentages */}
        <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:mt-0 sm:w-auto sm:flex-1">
          {data.map((item) => (
            <div
              key={item.level}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-semibold text-slate-700">
                  {item.level}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-bold text-slate-900">
                  {item.count}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
