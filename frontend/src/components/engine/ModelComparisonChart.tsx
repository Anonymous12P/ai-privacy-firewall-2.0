import { useMemo } from 'react'
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
import { MODEL_BENCHMARK_DATA } from '../../utils/engineSimulation'
import { useFirewallModelPipeline } from '../../hooks/useFirewall'

export function ModelComparisonChart() {
  const { data: pipelineData } = useFirewallModelPipeline()

  const chartData = useMemo(() => {
    if (pipelineData?.models && pipelineData.models.length > 0) {
      return pipelineData.models.map((m) => ({
        model: m.model_name,
        accuracy: +(m.accuracy * 100).toFixed(2),
        precision: +(m.precision * 100).toFixed(2),
        recall: +(m.recall * 100).toFixed(2),
        f1Score: +(m.f1_score * 100).toFixed(2),
      }))
    }
    return MODEL_BENCHMARK_DATA
  }, [pipelineData])

  return (
    <Card className="p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            AI Model Benchmark Performance
          </h3>
          <p className="text-xs text-slate-500">
            Empirical evaluation across Accuracy, Precision, Recall, and F1-Score.
          </p>
        </div>
        <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-700">
          CERT r4.2 Benchmark
        </span>
      </div>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="model" tick={{ fontSize: 11 }} stroke="#64748b" />
            <YAxis
              domain={[97, 100]}
              tick={{ fontSize: 11 }}
              stroke="#64748b"
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value: unknown) => [`${Number(value ?? 0).toFixed(2)}%`]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '11px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="accuracy" name="Accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="precision" name="Precision" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="recall" name="Recall" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="f1Score" name="F1-Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

