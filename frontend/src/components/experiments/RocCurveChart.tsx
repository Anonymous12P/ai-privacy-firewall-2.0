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
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ModelCurves } from '../../types/experiments'

interface RocCurveChartProps {
  curves: ModelCurves[]
}

export function RocCurveChart({ curves }: RocCurveChartProps) {
  // Combine ROC points into interpolated chart points for clean multi-line visualization
  const xSamples = [0.0, 0.02, 0.05, 0.1, 0.15, 0.25, 0.4, 0.6, 0.8, 1.0]

  const chartData = xSamples.map((x) => {
    const row: Record<string, number> = { fpr: x, random: x }

    curves.forEach((c) => {
      // Linear interpolation to find TPR at this FPR
      const pts = c.rocPoints
      let tpr = 0
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i]!
        const p2 = pts[i + 1]!
        if (x >= p1.x && x <= p2.x) {
          const ratio = (x - p1.x) / (p2.x - p1.x || 1)
          tpr = p1.y + ratio * (p2.y - p1.y)
          break
        }
      }
      if (x >= pts[pts.length - 1]!.x) {
        tpr = pts[pts.length - 1]!.y
      }
      row[c.modelName] = Number(tpr.toFixed(3))
    })

    return row
  })

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Receiver Operating Characteristic (ROC) Trajectory
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            True Positive Rate (Sensitivity) vs. False Positive Rate (1 - Specificity) across discrimination thresholds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {curves.map((c) => (
            <span
              key={c.modelName}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: `${c.color}20`, color: c.color }}
            >
              {c.displayName}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="fpr"
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#94a3b8' }}
            />
            <YAxis
              domain={[0, 1.0]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
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

            <Line type="monotone" dataKey="XGBoost" name="XGBoost (0.984)" stroke="#4f46e5" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="RandomForest" name="Random Forest (0.972)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="DecisionTree" name="Decision Tree (0.915)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="LogisticRegression" name="Logistic Regression (0.887)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="random" name="Random Guess (0.500)" stroke="#cbd5e1" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
