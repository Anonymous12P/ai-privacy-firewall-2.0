import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../Card'
import { GLOBAL_FEATURE_IMPORTANCE_DATA } from '../../utils/engineSimulation'
import { useFirewallModelPipeline } from '../../hooks/useFirewall'

export function FeatureImportanceChart() {
  const { data: pipelineData } = useFirewallModelPipeline()

  const data = useMemo(() => {
    if (pipelineData?.global_features && pipelineData.global_features.length > 0) {
      return pipelineData.global_features.map((f) => ({
        feature: f.display_name,
        importance: f.percentage_contribution,
        key: f.feature_name,
        rank: f.rank,
      }))
    }
    return GLOBAL_FEATURE_IMPORTANCE_DATA
  }, [pipelineData])

  return (
    <Card className="p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Global Feature Importance (SHAP Analysis)
          </h3>
          <p className="text-xs text-slate-500">
            Relative percentage contribution of behavioral indicators to threat classification.
          </p>
        </div>
        <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
          SHAP TreeExplainer
        </span>
      </div>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              domain={[0, 40]}
              tick={{ fontSize: 11 }}
              stroke="#64748b"
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="feature"
              width={145}
              tick={{ fontSize: 11 }}
              stroke="#64748b"
            />
            <Tooltip
              formatter={(val: unknown) => [
                `${Number(val ?? 0).toFixed(1)}% Contribution`,
                'Impact',
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '11px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Bar
              dataKey="importance"
              name="SHAP Weight %"
              fill="#4f46e5"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

