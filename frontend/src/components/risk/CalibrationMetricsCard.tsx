import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CheckBadgeIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { CalibrationMetrics } from '../../types/riskTuning'

interface CalibrationMetricsCardProps {
  calibration: CalibrationMetrics
}

export function CalibrationMetricsCard({ calibration }: CalibrationMetricsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ScaleIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Model Calibration & Decision Confidence
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Assesses probability fidelity, Brier score error convergence, and false-positive/negative balance.
          </p>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
          <CheckBadgeIcon className="h-4 w-4" />
          Well-Calibrated Ensemble
        </span>
      </div>

      {/* 6 Key Calibration Metric Badges */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Calibration Score
          </p>
          <p className="mt-1 text-xl font-black text-indigo-700">
            {calibration.confidenceCalibration}%
          </p>
          <p className="text-[10px] text-slate-400">Platt Scaled</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Brier Score
          </p>
          <p className="mt-1 text-xl font-black text-slate-900">
            {calibration.brierScore}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold">&lt; 0.10 Optimal</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Threshold Accuracy
          </p>
          <p className="mt-1 text-xl font-black text-emerald-600">
            {calibration.thresholdAccuracy}%
          </p>
          <p className="text-[10px] text-slate-400">Cross-Validated</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            False Positive Rate
          </p>
          <p className="mt-1 text-xl font-black text-slate-800">
            {calibration.falsePositiveRate}%
          </p>
          <p className="text-[10px] text-slate-400">&alpha; error budget</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            False Negative Rate
          </p>
          <p className="mt-1 text-xl font-black text-slate-800">
            {calibration.falseNegativeRate}%
          </p>
          <p className="text-[10px] text-slate-400">&beta; leakage budget</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Decision Consistency
          </p>
          <p className="mt-1 text-xl font-black text-indigo-700">
            {calibration.decisionConsistency}%
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold">Deterministic</p>
        </div>
      </div>

      {/* Reliability Calibration Curve */}
      <div className="mt-6 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Empirical Reliability Diagram (Calibration Curve)
          </h4>
          <span className="text-[11px] text-slate-500">
            Predicted Confidence Deciles vs Observed Accuracy
          </span>
        </div>

        <div className="mt-3 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={calibration.calibrationCurve} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="confidenceDecile"
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{
                  value: 'Predicted Confidence Decile (0.0 - 1.0)',
                  position: 'insideBottom',
                  offset: -5,
                  fontSize: 10,
                  fill: '#94a3b8',
                }}
              />
              <YAxis
                domain={[0, 1.0]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{
                  value: 'Observed Empirical Accuracy',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 10,
                  fill: '#94a3b8',
                }}
              />
              <Tooltip
                formatter={(val: unknown, name: unknown) => [String(val), String(name)]}
                labelFormatter={(label: unknown) => `Confidence Decile: ${label}`}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              <Line
                type="monotone"
                dataKey="idealAccuracy"
                name="Ideal Perfect Calibration (y = x)"
                stroke="#cbd5e1"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="observedAccuracy"
                name="Ensemble Firewall Observed Accuracy"
                stroke="#4f46e5"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#4f46e5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}
