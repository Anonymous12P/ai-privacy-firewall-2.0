import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { DriftTrendDataPoint, UserBaselineProfile } from '../../types/adaptiveLearning'

interface DriftTrendChartProps {
  data: DriftTrendDataPoint[]
  user: UserBaselineProfile
}

export function DriftTrendChart({ data, user }: DriftTrendChartProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Longitudinal Drift Dynamics & Adaptive Threshold Calibration
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Evolution of benign vs. anomalous statistical drift over rolling 14-day observation window for{' '}
            <strong className="text-slate-800">{user.userName}</strong> ({user.role}).
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Normal Drift Baseline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600">Suspicious Drift</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
            <span className="text-slate-600">Risk Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600">Adapted Threshold</span>
          </div>
        </div>
      </div>

      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSuspicious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              formatter={(val: unknown, name: unknown) => [`${val}`, String(name)]}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />

            <Area
              type="monotone"
              dataKey="normalDrift"
              name="Normal Drift"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorNormal)"
            />
            <Area
              type="monotone"
              dataKey="suspiciousDrift"
              name="Suspicious Drift"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSuspicious)"
            />
            <Area
              type="monotone"
              dataKey="currentRiskScore"
              name="Evaluated Threat Score"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRisk)"
            />
            <Line
              type="stepAfter"
              dataKey="adaptedThreshold"
              name="Adaptive Threshold"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <span>
          Current Drift Classification:{' '}
          <strong className="text-slate-800">{user.driftCategory}</strong>
        </span>
        <span>
          Threshold Shift Dynamic:{' '}
          <strong>
            {user.currentThreatScore > 50
              ? 'TIGHTENED (Auto-Restricting)'
              : 'STABLE (Relaxed Normal)'}
          </strong>
        </span>
      </div>
    </Card>
  )
}
