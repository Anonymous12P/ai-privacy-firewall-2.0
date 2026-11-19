import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { PolicyConfidenceMetrics } from '../../types/policyLearning'

interface PolicyConfidenceCardProps {
  metrics: PolicyConfidenceMetrics
}

export function PolicyConfidenceCard({ metrics }: PolicyConfidenceCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckBadgeIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Policy Confidence & Calibration Gain
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Measures probabilistic certainty and ensemble decision consistency post-feedback tuning.
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
          +{metrics.confidenceGain}% Overall Confidence Lift
        </span>
      </div>

      {/* KPI Badges */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Pre-Feedback Confidence
          </p>
          <p className="mt-1 text-2xl font-black text-slate-400 line-through">
            {metrics.beforeCalibrationConfidence}%
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">Heuristic prior</p>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
          <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
            Calibrated Confidence
          </p>
          <p className="mt-1 text-2xl font-black text-indigo-700">
            {metrics.afterCalibrationConfidence}%
          </p>
          <p className="mt-0.5 text-[10px] text-indigo-600 font-semibold">Active Calibrated</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Consistency Gain
            </p>
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-slate-900">
            +{metrics.consistencyGain}%
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Decision Stability</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Brier Error Reduction
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            {metrics.brierImprovement}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Lower Calibration Error</p>
        </div>
      </div>

      {/* Comparison Grouped Bar Chart */}
      <div className="mt-6 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Decision Confidence Stratified by Risk Decile Band
        </h4>

        <div className="mt-3 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.confidenceDeciles} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="decile" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{
                  value: 'Confidence (%)',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 10,
                  fill: '#94a3b8',
                }}
              />
              <Tooltip
                formatter={(val: unknown, name: unknown) => [`${val}%`, String(name)]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              <Bar dataKey="before" name="Pre-Calibration Confidence" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="after" name="Post-Feedback Calibrated Confidence" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}
