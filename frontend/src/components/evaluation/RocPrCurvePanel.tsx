import { useState } from 'react'
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
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ModelCurves } from '../../types/evaluation'

interface RocPrCurvePanelProps {
  curves: ModelCurves[]
}

export function RocPrCurvePanel({ curves }: RocPrCurvePanelProps) {
  const [activeTab, setActiveTab] = useState<'ROC' | 'PR'>('ROC')

  // Prepare interpolated multi-line chart data
  const xSamples = [0.0, 0.02, 0.05, 0.1, 0.15, 0.25, 0.4, 0.6, 0.8, 1.0]

  const chartData = xSamples.map((x) => {
    const row: Record<string, number> = {
      x,
      random: activeTab === 'ROC' ? x : 0.05, // random line for ROC is y=x; for PR is minority prevalence (~5%)
    }

    curves.forEach((c) => {
      const pts = activeTab === 'ROC' ? c.rocPoints : c.prPoints
      let yVal = 0

      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i]!
        const p2 = pts[i + 1]!
        if (x >= p1.x && x <= p2.x) {
          const ratio = (x - p1.x) / (p2.x - p1.x || 1)
          yVal = p1.y + ratio * (p2.y - p1.y)
          break
        }
      }
      if (x >= pts[pts.length - 1]!.x) {
        yVal = pts[pts.length - 1]!.y
      }
      row[c.modelName] = Number(yVal.toFixed(3))
    })

    return row
  })

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Discrimination Analysis: ROC & Precision-Recall Trajectories
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Comparing ensemble classifier trade-offs across discrimination thresholds on skewed threat distributions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('ROC')}
            className={`cursor-pointer rounded-lg px-3 py-1 font-bold transition ${
              activeTab === 'ROC'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ROC Curves (AUC: 0.984)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PR')}
            className={`cursor-pointer rounded-lg px-3 py-1 font-bold transition ${
              activeTab === 'PR'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PR Curves (PR-AUC: 0.965)
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="x"
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: activeTab === 'ROC' ? 'False Positive Rate (FPR)' : 'Recall (Sensitivity)',
                position: 'insideBottom',
                offset: -5,
                fontSize: 11,
                fill: '#94a3b8',
              }}
            />
            <YAxis
              domain={[0, 1.0]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: activeTab === 'ROC' ? 'True Positive Rate (TPR)' : 'Precision (Positive Predictive Value)',
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

            <Line
              type="monotone"
              dataKey="XGBoost"
              name={`XGBoost (${activeTab === 'ROC' ? '0.984' : '0.965'})`}
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="RandomForest"
              name={`Random Forest (${activeTab === 'ROC' ? '0.972' : '0.946'})`}
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="DecisionTree"
              name={`Decision Tree (${activeTab === 'ROC' ? '0.915' : '0.881'})`}
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="LogisticRegression"
              name={`Logistic Regression (${activeTab === 'ROC' ? '0.887' : '0.842'})`}
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="random"
              name={activeTab === 'ROC' ? 'Random Chance (0.500)' : 'Prevalence Baseline (0.050)'}
              stroke="#cbd5e1"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>
          <strong>Operational Operating Point:</strong> Calibrated decision threshold at $\tau = 0.65$ yields $95.1\%$ True Positive Recall with only $1.4\%$ False Alarm Rate.
        </span>
        <span className="font-mono text-indigo-700 font-bold">10-Fold Stratified Holdout</span>
      </div>
    </Card>
  )
}
