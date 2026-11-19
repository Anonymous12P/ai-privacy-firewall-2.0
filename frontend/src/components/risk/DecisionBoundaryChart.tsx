import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type {
  DecisionBoundaryPoint,
  DecisionBoundarySample,
  FirewallThresholds,
} from '../../types/riskTuning'

interface DecisionBoundaryChartProps {
  points: DecisionBoundaryPoint[]
  samples: DecisionBoundarySample[]
  thresholds: FirewallThresholds
}

export function DecisionBoundaryChart({
  points,
  samples,
  thresholds,
}: DecisionBoundaryChartProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Decision Boundary Density & Classification Zones
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Empirical probability distribution of access request risk scores partitioned by active decision boundaries.
          </p>
        </div>

        {/* Zone Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700 border border-emerald-200">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            ALLOW (0 - {thresholds.allowThreshold})
          </span>
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 font-bold text-amber-700 border border-amber-200">
            <InformationCircleIcon className="h-3.5 w-3.5" />
            WARN ({thresholds.allowThreshold + 1} - {thresholds.warnThreshold})
          </span>
          <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 font-bold text-orange-700 border border-orange-200">
            <ExclamationCircleIcon className="h-3.5 w-3.5" />
            RESTRICT ({thresholds.warnThreshold + 1} - {thresholds.restrictThreshold})
          </span>
          <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 font-bold text-red-700 border border-red-200">
            <NoSymbolIcon className="h-3.5 w-3.5" />
            BLOCK (&gt; {thresholds.restrictThreshold})
          </span>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="riskDensityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="riskScore"
              tick={{ fontSize: 11, fill: '#64748b' }}
              domain={[0, 100]}
              label={{
                value: 'Privacy Risk Score (0 - 100)',
                position: 'insideBottom',
                offset: -5,
                fontSize: 11,
                fill: '#94a3b8',
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: 'Request Density',
                angle: -90,
                position: 'insideLeft',
                fontSize: 11,
                fill: '#94a3b8',
              }}
            />
            <Tooltip
              formatter={(val: unknown) => [String(val), 'Traffic Density']}
              labelFormatter={(label: unknown) => `Risk Score: ${label}`}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px',
              }}
            />

            {/* Decision Threshold Reference Lines */}
            <ReferenceLine
              x={thresholds.allowThreshold}
              stroke="#10b981"
              strokeDasharray="3 3"
              strokeWidth={2}
              label={{
                value: `ALLOW: ${thresholds.allowThreshold}`,
                position: 'top',
                fill: '#059669',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            />
            <ReferenceLine
              x={thresholds.warnThreshold}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              strokeWidth={2}
              label={{
                value: `WARN: ${thresholds.warnThreshold}`,
                position: 'top',
                fill: '#d97706',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            />
            <ReferenceLine
              x={thresholds.restrictThreshold}
              stroke="#f97316"
              strokeDasharray="3 3"
              strokeWidth={2}
              label={{
                value: `RESTRICT: ${thresholds.restrictThreshold}`,
                position: 'top',
                fill: '#ea580c',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            />
            <ReferenceLine
              x={thresholds.blockThreshold}
              stroke="#ef4444"
              strokeDasharray="3 3"
              strokeWidth={2}
              label={{
                value: `BLOCK: ${thresholds.blockThreshold}`,
                position: 'top',
                fill: '#dc2626',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            />

            <Area
              type="monotone"
              dataKey="density"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#riskDensityGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Active Access Requests Placed Across Zones */}
      <div className="mt-6 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Live Access Requests Clustered by Decision Zone
        </h4>
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {samples.map((s) => {
            const isBlock = s.decision === 'BLOCK'
            const isRestrict = s.decision === 'RESTRICT'
            const isWarn = s.decision === 'WARN'

            const badgeColor = isBlock
              ? 'border-red-200 bg-red-50 text-red-700'
              : isRestrict
              ? 'border-orange-200 bg-orange-50 text-orange-700'
              : isWarn
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'

            return (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-2.5 text-xs transition hover:bg-slate-100/60"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{s.userName}</span>
                    <span className="text-[10px] text-slate-400">({s.department})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate max-w-[150px]" title={s.resource}>
                    {s.resource}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                    {s.decision} ({s.riskScore})
                  </span>
                  <p className="mt-0.5 text-[9px] text-slate-400">{s.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
