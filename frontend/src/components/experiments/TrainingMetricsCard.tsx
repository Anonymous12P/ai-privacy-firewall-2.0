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
import { CpuChipIcon } from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { TrainingMetricsSummary } from '../../types/experiments'

interface TrainingMetricsCardProps {
  metrics: TrainingMetricsSummary
}

export function TrainingMetricsCard({ metrics }: TrainingMetricsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CpuChipIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Training Optimization & Loss Convergence Dynamics
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Cross-entropy loss descent and validation generalization over {metrics.epochsTotal} optimization epochs for{' '}
            <strong className="text-slate-800">{metrics.modelName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
            {metrics.convergenceStatus} at Epoch {metrics.bestEpoch}
          </span>
        </div>
      </div>

      {/* 4 Summary Pills */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
        <div className="rounded-xl bg-slate-50 p-2.5">
          <span className="text-[10px] font-semibold text-slate-400 block">
            FINAL TRAIN LOSS
          </span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            {metrics.finalTrainLoss}
          </span>
        </div>
        <div className="rounded-xl bg-slate-50 p-2.5">
          <span className="text-[10px] font-semibold text-slate-400 block">
            FINAL VAL LOSS
          </span>
          <span className="font-mono font-bold text-indigo-700 text-sm">
            {metrics.finalValLoss}
          </span>
        </div>
        <div className="rounded-xl bg-slate-50 p-2.5">
          <span className="text-[10px] font-semibold text-slate-400 block">
            PEAK VAL ACCURACY
          </span>
          <span className="font-mono font-bold text-emerald-600 text-sm">
            {metrics.finalValAccuracy}%
          </span>
        </div>
        <div className="rounded-xl bg-slate-50 p-2.5">
          <span className="text-[10px] font-semibold text-slate-400 block">
            OPTIMAL CHECKPOINT
          </span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            Epoch {metrics.bestEpoch} of {metrics.epochsTotal}
          </span>
        </div>
      </div>

      {/* Recharts Loss Descent Chart */}
      <div className="mt-5 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metrics.lossHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="epoch"
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Training Epochs', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#94a3b8' }}
            />
            <YAxis
              domain={[0, 0.7]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Loss', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
            />
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
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

            <Line type="monotone" dataKey="trainLoss" name="Training Loss" stroke="#4f46e5" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="valLoss" name="Validation Loss" stroke="#f43f5e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
