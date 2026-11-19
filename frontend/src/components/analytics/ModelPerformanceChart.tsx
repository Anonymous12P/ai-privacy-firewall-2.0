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
import { Card } from '../Card'
import type { ModelBenchmarkMetric } from '../../types/analytics'

interface ModelPerformanceChartProps {
  data: ModelBenchmarkMetric[]
}

export function ModelPerformanceChart({ data }: ModelPerformanceChartProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Model Performance Benchmarking
          </h3>
          <p className="text-xs text-slate-500">
            Empirical multi-class evaluation across Accuracy, Precision, Recall, F1-Score, and ROC-AUC.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            Ensemble Active
          </span>
          <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-indigo-700">
            5-Fold Cross Validation
          </span>
        </div>
      </div>

      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="model"
              tick={{ fontSize: 12, fill: '#475569' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              domain={[97, 100]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              stroke="#64748b"
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              formatter={(val: unknown) => [`${Number(val ?? 0).toFixed(2)}%`]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
            <Bar dataKey="accuracy" name="Accuracy" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="precision" name="Precision" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="recall" name="Recall" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="f1Score" name="F1 Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="rocAuc" name="ROC AUC" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
        {data.map((m) => (
          <div key={m.model} className="rounded-xl bg-slate-50 p-3 text-center">
            <span className="text-xs font-semibold text-slate-600">{m.model}</span>
            <div className="mt-1 flex items-baseline justify-center gap-1">
              <span className="text-lg font-bold text-slate-900">{m.accuracy}%</span>
              <span className="text-[10px] text-slate-400">acc</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">F1: {m.f1Score}%</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
