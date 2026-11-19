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
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ModelBenchmarkMetrics } from '../../types/experiments'

interface ModelComparisonChartProps {
  benchmarks: ModelBenchmarkMetrics[]
}

export function ModelComparisonChart({
  benchmarks,
}: ModelComparisonChartProps) {
  const chartData = benchmarks.map((b) => ({
    name: b.modelName,
    Precision: b.precision,
    Recall: b.recall,
    'F1-Score': b.f1Score,
    'ROC-AUC': b.rocAuc,
    'PR-AUC': b.prAuc,
  }))

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Multi-Metric Model Architecture Comparison
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Grouped benchmark visualization comparing Precision, Recall, F1, ROC-AUC, and PR-AUC.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Evaluated on Test Partition
        </span>
      </div>

      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis domain={[75, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              formatter={(val: unknown) => [`${val}%`, 'Score']}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="Precision" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Recall" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="F1-Score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ROC-AUC" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="PR-AUC" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
