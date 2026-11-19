import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowTrendingUpIcon,
  BellAlertIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { RiskTrendState, UserRiskProgression } from '../../types/riskTuning'

interface RiskTrendChartProps {
  progression: UserRiskProgression
}

function getTrajectoryBadge(state: RiskTrendState) {
  switch (state) {
    case 'SPIKING':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'RISING':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'DECLINING':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'STABILIZING':
      return 'bg-teal-50 text-teal-700 border-teal-200'
    case 'STABLE':
    default:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
}

export function RiskTrendChart({ progression }: RiskTrendChartProps) {
  const eventPoints = progression.historyPoints.filter((p) => p.eventMarker)

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Longitudinal Risk Progression & Trajectory Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            14-day chronological risk score evolution for{' '}
            <strong className="text-slate-700">{progression.userName}</strong> ({progression.department}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${getTrajectoryBadge(
              progression.trajectoryState,
            )}`}
          >
            {progression.trajectoryState} TRAJECTORY
          </span>
        </div>
      </div>

      {/* Progression Multi-Line Chart */}
      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={progression.historyPoints} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: 'Risk Score (0 - 100)',
                angle: -90,
                position: 'insideLeft',
                fontSize: 11,
                fill: '#94a3b8',
              }}
            />
            <Tooltip
              formatter={(val: unknown, name: unknown) => [String(val), String(name)]}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

            {/* Department Baseline Line */}
            <Line
              type="monotone"
              dataKey="departmentAvg"
              name="Department Peer Average"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
            />

            {/* Personal Baseline Line */}
            <Line
              type="monotone"
              dataKey="baseline"
              name="Historical Personal Baseline"
              stroke="#0ea5e9"
              strokeDasharray="2 2"
              strokeWidth={1.5}
              dot={false}
            />

            {/* BLOCK Threshold Boundary */}
            <Line
              type="monotone"
              dataKey="blockThreshold"
              name="Firewall BLOCK Ceiling"
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              dot={false}
            />

            {/* Active User Risk Score Line */}
            <Line
              type="monotone"
              dataKey="riskScore"
              name="Observed Risk Score"
              stroke={
                progression.trajectoryState === 'SPIKING'
                  ? '#dc2626'
                  : progression.trajectoryState === 'RISING'
                  ? '#d97706'
                  : '#4f46e5'
              }
              strokeWidth={3}
              dot={{ r: 4 }}
            />

            {/* Highlighted Event Dots */}
            {eventPoints.map((pt) => (
              <ReferenceDot
                key={pt.day}
                x={pt.day}
                y={pt.riskScore}
                r={6}
                fill="#dc2626"
                stroke="#fff"
                strokeWidth={2}
                label={{
                  value: pt.eventMarker,
                  position: 'top',
                  fill: '#b91c1c',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Trajectory Narrative */}
      <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
        <div className="flex items-start gap-2">
          <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
          <div className="text-xs">
            <span className="font-bold text-slate-900">Trajectory Intelligence: </span>
            <span className="text-slate-600">{progression.narrative}</span>
            {eventPoints.length > 0 && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold text-red-700">
                <BellAlertIcon className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Key Trigger: {eventPoints.map((ep) => `${ep.eventMarker} (${ep.day})`).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
