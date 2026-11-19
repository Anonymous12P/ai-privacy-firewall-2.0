import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowTrendingUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { PolicyEvolutionVersion } from '../../types/policyLearning'

interface PolicyEvolutionChartProps {
  evolution: PolicyEvolutionVersion[]
}

export function PolicyEvolutionChart({ evolution }: PolicyEvolutionChartProps) {
  const chartData = evolution.map((v) => ({
    version: v.version.split(' ')[0],
    fullName: v.version,
    confidence: v.averageConfidence,
    fpr: v.falsePositiveRate,
    fnr: v.falseNegativeRate,
    rules: v.activeRules,
  }))

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Policy Architecture Evolution & Multi-Version Trajectory
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Longitudinal progression from static heuristic rules to continuous online Bayesian adaptation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
            Active: v4.2 Adaptive Bayesian
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="version" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              yAxisId="left"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: 'Confidence (%) & Active Rules',
                angle: -90,
                position: 'insideLeft',
                fontSize: 10,
                fill: '#94a3b8',
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 8]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: 'Error Rates: FPR / FNR (%)',
                angle: 90,
                position: 'insideRight',
                fontSize: 10,
                fill: '#94a3b8',
              }}
            />
            <Tooltip
              formatter={(val: unknown, name: unknown) => [String(val), String(name)]}
              labelFormatter={(label: unknown) => `Policy Version: ${label}`}
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
              yAxisId="left"
              type="monotone"
              dataKey="confidence"
              name="Decision Confidence (%)"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="rules"
              name="Active Rules Count"
              stroke="#0ea5e9"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="fpr"
              name="False Positive Rate (%)"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="fnr"
              name="False Negative Rate (%)"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Version Comparison Table */}
      <div className="mt-5 overflow-x-auto border-t border-slate-100 pt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-2.5 px-3">Version</th>
              <th className="py-2.5 px-3">Timeline</th>
              <th className="py-2.5 px-3 text-center">Active Rules</th>
              <th className="py-2.5 px-3 text-center">Avg Confidence</th>
              <th className="py-2.5 px-3 text-center">FP Rate</th>
              <th className="py-2.5 px-3 text-center">FN Rate</th>
              <th className="py-2.5 px-3 text-center">Threshold Updates</th>
              <th className="py-2.5 px-3 text-right">Rule Additions / Removals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {evolution.map((ver) => (
              <tr key={ver.version} className="hover:bg-slate-50/60 transition">
                <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                  {ver.version}
                </td>
                <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                  {ver.timestamp}
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-800">
                  {ver.activeRules}
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">
                  {ver.averageConfidence}%
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-semibold text-amber-700">
                  {ver.falsePositiveRate}%
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-semibold text-red-700">
                  {ver.falseNegativeRate}%
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                  {ver.thresholdModifications}
                </td>
                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                  <span className="text-emerald-600 font-semibold">+{ver.rulesAdded}</span> /{' '}
                  <span className="text-rose-600 font-semibold">-{ver.rulesRemoved}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-indigo-900 flex items-center gap-2">
        <SparklesIcon className="h-4 w-4 shrink-0 text-indigo-600" />
        <span>
          <strong>Version v4.2</strong> achieved an optimal balance point: 96.4% confidence with sub-1.5% FPR and sub-1.0% FNR through online gradient descent policy recalibration.
        </span>
      </div>
    </Card>
  )
}
