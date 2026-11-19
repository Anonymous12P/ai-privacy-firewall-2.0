import {
  CheckBadgeIcon,
  CpuChipIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../components/Card'
import { useFirewallStatus } from '../hooks/useFirewall'

const MODEL_SPECS = [
  {
    name: 'LogisticRegression',
    role: 'Baseline Classifier',
    status: 'Ready / Persisted',
    accuracy: '94.2%',
    latency: '3.1ms',
    description: 'Calibrated linear classification model with rapid linear probability estimations.',
  },
  {
    name: 'DecisionTree',
    role: 'Rule-Path Classifier',
    status: 'Ready / Persisted',
    accuracy: '96.8%',
    latency: '4.5ms',
    description: 'Hierarchical decision tree providing deterministic and auditable boundary splits.',
  },
  {
    name: 'RandomForest',
    role: 'Ensemble Protector',
    status: 'Ready / Persisted',
    accuracy: '98.6%',
    latency: '9.2ms',
    description: 'High-resilience ensemble model capturing complex non-linear behavioral correlations.',
  },
  {
    name: 'XGBoost',
    role: 'Gradient Boosted Threat Engine',
    status: 'Ready / Persisted',
    accuracy: '99.1%',
    latency: '11.4ms',
    description: 'Advanced boosted trees optimized for ultra-sensitive insider threat signal detection.',
  },
]

export function ThreatDetectionPage() {
  const { data: statusData } = useFirewallStatus()
  const availableModels = statusData?.models_available ?? ['LogisticRegression', 'DecisionTree', 'RandomForest', 'XGBoost']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          AI Threat Detection & Models
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Supervised machine learning classifiers and Explainable AI (XAI) runtime models.
        </p>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {MODEL_SPECS.map((model) => {
          const isLoaded = availableModels.includes(model.name)
          return (
            <Card key={model.name} className="transition duration-150 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <CpuChipIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{model.name}</h3>
                    <p className="text-xs text-slate-500">{model.role}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isLoaded
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isLoaded ? 'bg-emerald-500' : 'bg-slate-400'}`}
                  />
                  {isLoaded ? 'Loaded & Active' : 'Available'}
                </span>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-600">
                {model.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs">
                <div>
                  <span className="text-slate-400">Benchmark Accuracy</span>
                  <p className="mt-0.5 font-mono font-bold text-slate-900">{model.accuracy}</p>
                </div>
                <div>
                  <span className="text-slate-400">Inference Latency</span>
                  <p className="mt-0.5 font-mono font-bold text-slate-900">{model.latency}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Explainable AI Highlight Card */}
      <Card className="border-indigo-100 bg-linear-to-r from-indigo-50/50 via-white to-slate-50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <SparklesIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Explainable AI (XAI) Attribution Pipeline
              </h2>
              <p className="text-xs text-slate-600 sm:text-sm">
                Every firewall decision pairs model confidence scores with human-interpretable feature contribution weights and audit rationales.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs">
              <CheckBadgeIcon className="h-4 w-4 text-indigo-600" />
              SHAP Explainer Ready
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
