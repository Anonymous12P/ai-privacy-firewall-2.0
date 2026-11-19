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
import { SparklesIcon } from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ModelCurves } from '../../types/experiments'

interface PrCurveChartProps {
  curves: ModelCurves[]
}

export function PrCurveChart({ curves }: PrCurveChartProps) {
  const xSamples = [0.0, 0.2, 0.4, 0.6, 0.75, 0.85, 0.95, 1.0]

  const chartData = xSamples.map((x) => {
    const row: Record<string, number> = { recall: x }

    curves.forEach((c) => {
      const pts = c.prPoints
      let precision = 0.5
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i]!
        const p2 = pts[i + 1]!
        if (x >= p1.x && x <= p2.x) {
          const ratio = (x - p1.x) / (p2.x - p1.x || 1)
          precision = p1.y + ratio * (p2.y - p1.y)
          break
        }
      }
      if (x >= pts[pts.length - 1]!.x) {
        precision = pts[pts.length - 1]!.y
      }
      row[c.modelName] = Number(precision.toFixed(3))
    })

    return row
  })

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Precision-Recall (PR) Curve on Imbalanced Minority Class
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Gold standard metric for extreme class imbalance (0.12% threats) illustrating positive predictive value at high recall.
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
          PR-AUC: 0.961 (XGBoost)
        </span>
      </div>

      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="recall"
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Recall (True Positive Rate)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#94a3b8' }}
            />
            <YAxis
              domain={[0.5, 1.0]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Precision (PPV)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
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

            <Line type="monotone" dataKey="XGBoost" name="XGBoost (PR-AUC 0.961)" stroke="#4f46e5" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="RandomForest" name="Random Forest (PR-AUC 0.939)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="DecisionTree" name="Decision Tree (PR-AUC 0.868)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="LogisticRegression" name="Logistic Regression (PR-AUC 0.804)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
