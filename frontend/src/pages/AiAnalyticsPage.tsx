import {
  BoltIcon,
  CheckCircleIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../components/Card'
import { MetricCard } from '../components/MetricCard'

interface ModelMetric {
  name: string
  accuracy: number
  precision: number
  recall: number
  f1: number
  rocAuc: number
  latency: string
  status: string
}

const MODELS: ModelMetric[] = [
  {
    name: 'XGBoost (Active Production)',
    accuracy: 97.8,
    precision: 96.4,
    recall: 98.1,
    f1: 97.2,
    rocAuc: 0.991,
    latency: '1.2 ms',
    status: 'PRODUCTION DEPLOYED',
  },
  {
    name: 'Random Forest',
    accuracy: 96.5,
    precision: 95.1,
    recall: 96.8,
    f1: 95.9,
    rocAuc: 0.984,
    latency: '1.8 ms',
    status: 'VERIFICATION ENSEMBLE',
  },
  {
    name: 'Decision Tree',
    accuracy: 92.1,
    precision: 90.4,
    recall: 92.8,
    f1: 91.6,
    rocAuc: 0.938,
    latency: '0.6 ms',
    status: 'FAST-PATH FALLBACK',
  },
  {
    name: 'Logistic Regression',
    accuracy: 88.4,
    precision: 86.2,
    recall: 89.0,
    f1: 87.6,
    rocAuc: 0.912,
    latency: '0.4 ms',
    status: 'LINEAR BASELINE',
  },
]

const ROC_CURVE_DATA = [
  { fpr: 0.0, tpr: 0.0, baseline: 0.0 },
  { fpr: 0.01, tpr: 0.88, baseline: 0.01 },
  { fpr: 0.02, tpr: 0.94, baseline: 0.02 },
  { fpr: 0.04, tpr: 0.97, baseline: 0.04 },
  { fpr: 0.08, tpr: 0.985, baseline: 0.08 },
  { fpr: 0.15, tpr: 0.992, baseline: 0.15 },
  { fpr: 0.3, tpr: 0.998, baseline: 0.3 },
  { fpr: 1.0, tpr: 1.0, baseline: 1.0 },
]

const PR_CURVE_DATA = [
  { recall: 0.0, precision: 1.0 },
  { recall: 0.2, precision: 0.99 },
  { recall: 0.5, precision: 0.98 },
  { recall: 0.8, precision: 0.96 },
  { recall: 0.92, precision: 0.94 },
  { recall: 0.98, precision: 0.89 },
  { recall: 1.0, precision: 0.82 },
]

const FEATURE_IMPORTANCE_DATA = [
  { feature: 'usb_storage_attached', importance: 0.28 },
  { feature: 'download_velocity_bytes', importance: 0.24 },
  { feature: 'off_hours_access', importance: 0.18 },
  { feature: 'http_request_frequency', importance: 0.14 },
  { feature: 'failed_login_burst', importance: 0.09 },
  { feature: 'vpn_split_tunnel', importance: 0.07 },
]

const CONFUSION_MATRIX = {
  trueNegative: 1840,
  falsePositive: 32,
  falseNegative: 18,
  truePositive: 910,
}

const PREDICTION_DISTRIBUTION_DATA = [
  { name: 'Allow (Normal 0)', count: 1872, percentage: 66.8, color: '#22c55e' },
  { name: 'Suspicious / Block (Threat 1)', count: 928, percentage: 33.2, color: '#ef4444' },
]

export function AiAnalyticsPage() {
  const [selectedModel, setSelectedModel] = useState<ModelMetric>(MODELS[0]!)

  return (
    <div className="space-y-8">
      {/* Module Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
              EVALUATION & BENCHMARKS
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Privacy Shield Technologies Pvt. Ltd.
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            AI Analytics & Model Performance
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            Machine learning evaluation metrics, ROC/PR curves, confusion matrix, SHAP explainability, and inference benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
          <CpuChipIcon className="h-4 w-4 text-blue-600" />
          <span>Active Classifier: XGBoost</span>
        </div>
      </div>

      {/* Model Selection Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {MODELS.map((m) => (
          <button
            key={m.name}
            type="button"
            onClick={() => setSelectedModel(m)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
              selectedModel.name === m.name
                ? 'bg-blue-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* 6 Core Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <MetricCard
          label="Accuracy"
          value={`${selectedModel.accuracy}%`}
          detail="Overall test accuracy"
          icon={<ShieldCheckIcon className="h-5 w-5 text-emerald-600" />}
        />

        <MetricCard
          label="Precision"
          value={`${selectedModel.precision}%`}
          detail="Positive predictive value"
          icon={<CheckCircleIcon className="h-5 w-5 text-blue-600" />}
        />

        <MetricCard
          label="Recall"
          value={`${selectedModel.recall}%`}
          detail="True positive sensitivity"
          icon={<SparklesIcon className="h-5 w-5 text-blue-600" />}
        />

        <MetricCard
          label="F1 Score"
          value={`${selectedModel.f1}%`}
          detail="Harmonic metric balance"
          icon={<BoltIcon className="h-5 w-5 text-blue-600" />}
        />

        <MetricCard
          label="ROC-AUC"
          value={selectedModel.rocAuc.toFixed(3)}
          detail="Discrimination ability"
          icon={<CpuChipIcon className="h-5 w-5 text-blue-600" />}
        />

        <MetricCard
          label="Inference Time"
          value={selectedModel.latency}
          detail="Sub-2ms p99 SLA"
          icon={<CpuChipIcon className="h-5 w-5 text-emerald-600" />}
        />
      </div>

      {/* Model Comparison Table */}
      <Card className="p-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            BENCHMARK COMPARISON
          </span>
          <h2 className="text-base font-extrabold text-slate-900">
            Supervised Classifier Ensemble Comparison
          </h2>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Model Architecture</th>
                <th className="py-3 px-3">Accuracy</th>
                <th className="py-3 px-3">Precision</th>
                <th className="py-3 px-3">Recall</th>
                <th className="py-3 px-3">F1-Score</th>
                <th className="py-3 px-3">ROC-AUC</th>
                <th className="py-3 px-3">Inference SLA</th>
                <th className="py-3 px-3">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {MODELS.map((m) => (
                <tr
                  key={m.name}
                  onClick={() => setSelectedModel(m)}
                  className={`cursor-pointer transition-colors ${
                    selectedModel.name === m.name
                      ? 'bg-blue-50/70 font-semibold text-blue-900'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-slate-900">{m.name}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">{m.accuracy}%</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{m.precision}%</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{m.recall}%</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{m.f1}%</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">
                    {m.rocAuc.toFixed(3)}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">{m.latency}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'PRODUCTION DEPLOYED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ROC Curve & PR Curve Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ROC Curve */}
        <div className="lg:col-span-6">
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  DISCRIMINATION ABILITY
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  ROC Curve (AUC = 0.991)
                </h2>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-600">Near-Optimal</span>
            </div>

            <div className="mt-6 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ROC_CURVE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="fpr" stroke="#64748b" fontSize={11} label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -4 }} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tpr"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#2563eb' }}
                    name="XGBoost ROC"
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#cbd5e1"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    name="Random Classifier"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* PR Curve */}
        <div className="lg:col-span-6">
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  IMBALANCED DATASET FIDELITY
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Precision-Recall (PR) Curve
                </h2>
              </div>
              <span className="font-mono text-xs font-bold text-blue-600">PR-AUC = 0.974</span>
            </div>

            <div className="mt-6 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PR_CURVE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="recall" stroke="#64748b" fontSize={11} label={{ value: 'Recall', position: 'insideBottom', offset: -4 }} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0.8, 1]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="precision"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#10b981' }}
                    name="Precision"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Confusion Matrix, Feature Importance & Prediction Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Confusion Matrix */}
        <div className="lg:col-span-4">
          <Card className="p-6 h-full">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                EVALUATION CONTINGENCY
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                Confusion Matrix
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-center font-mono">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <span className="block text-[10px] text-emerald-800 font-sans font-bold uppercase tracking-wider">
                  True Negative (TN)
                </span>
                <span className="mt-1 block text-2xl font-extrabold text-emerald-700">
                  {CONFUSION_MATRIX.trueNegative}
                </span>
                <span className="text-[10px] text-emerald-600">Normal Allowed</span>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4">
                <span className="block text-[10px] text-rose-800 font-sans font-bold uppercase tracking-wider">
                  False Positive (FP)
                </span>
                <span className="mt-1 block text-2xl font-extrabold text-rose-700">
                  {CONFUSION_MATRIX.falsePositive}
                </span>
                <span className="text-[10px] text-rose-600">Type I Error (1.7%)</span>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <span className="block text-[10px] text-amber-800 font-sans font-bold uppercase tracking-wider">
                  False Negative (FN)
                </span>
                <span className="mt-1 block text-2xl font-extrabold text-amber-700">
                  {CONFUSION_MATRIX.falseNegative}
                </span>
                <span className="text-[10px] text-amber-600">Type II Error (0.9%)</span>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                <span className="block text-[10px] text-blue-800 font-sans font-bold uppercase tracking-wider">
                  True Positive (TP)
                </span>
                <span className="mt-1 block text-2xl font-extrabold text-blue-700">
                  {CONFUSION_MATRIX.truePositive}
                </span>
                <span className="text-[10px] text-blue-600">Threats Blocked</span>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-400">
              * Evaluated over 2,800 test instances extracted from UBA security audit logs.
            </p>
          </Card>
        </div>

        {/* Feature Importance */}
        <div className="lg:col-span-4">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                GLOBAL FEATURE WEIGHTS
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                Feature Importance
              </h2>
            </div>

            <div className="h-56 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FEATURE_IMPORTANCE_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} domain={[0, 0.35]} />
                  <YAxis
                    dataKey="feature"
                    type="category"
                    stroke="#64748b"
                    fontSize={10}
                    width={130}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="importance" fill="#2563eb" radius={[0, 6, 6, 0]}>
                    {FEATURE_IMPORTANCE_DATA.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#2563eb'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              * Relative gain across 150 gradient boosted decision trees.
            </p>
          </Card>
        </div>

        {/* Prediction Distribution */}
        <div className="lg:col-span-4">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                PREDICTION CONFIDENCE
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                Prediction Distribution
              </h2>
            </div>

            <div className="h-44 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PREDICTION_DISTRIBUTION_DATA}
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {PREDICTION_DISTRIBUTION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100">
              {PREDICTION_DISTRIBUTION_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {item.percentage}% ({item.count})
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
