import {
  CpuChipIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ExecutiveThreatSummary, ThreatPrediction } from '../../types/threatIntel'

interface ThreatPredictionCardProps {
  prediction: ThreatPrediction
  summary: ExecutiveThreatSummary
}

export function ThreatPredictionCard({
  prediction,
  summary,
}: ThreatPredictionCardProps) {
  const isEscalating = prediction.predictedRiskTrend === 'Escalating'

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* 1. Executive Intelligence Narrative (2 Columns) */}
      <Card className="p-6 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <SparklesIcon className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Executive Cyber Threat Intelligence Narrative
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                summary.posture === 'Critical'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Posture: {summary.posture}
            </span>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-emerald-700">
              Confidence: {summary.confidenceLevel}%
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/50 p-4.5">
          <p className="text-sm text-slate-800 font-medium leading-relaxed">
            {summary.narrative}
          </p>
        </div>

        {/* Strategic Target Assets & Emerging Risks */}
        <div className="mt-4 grid gap-4 text-xs sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              PRIMARY TARGET ASSETS
            </span>
            <ul className="space-y-1 font-semibold text-slate-800">
              {summary.mostTargetedAssets.map((asset, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <span>{asset}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              PRESCRIPTIVE REMEDIATION
            </span>
            <ul className="space-y-1 text-slate-700">
              {summary.recommendedActions.slice(0, 2).map((act, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* 2. AI Threat Prediction Engine (1 Column) */}
      <Card className="p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CpuChipIcon className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                AI Predictive Threat Forecasting
              </h3>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                isEscalating
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              Trend: {prediction.predictedRiskTrend}
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-slate-500">Projected Tomorrow Volume</span>
              <div className="text-right">
                <span className="font-mono text-base font-bold text-slate-900">
                  {prediction.tomorrowVolume} Incidents
                </span>
                <span className="text-[10px] font-semibold text-rose-600 block">
                  +{prediction.volumeChangePercent}% Spike
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-3 space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 block">MOST LIKELY ATTACK VECTOR</span>
                <p className="font-bold text-slate-900 mt-0.5">{prediction.likelyAttackType}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">EMERGING MALWARE FAMILY</span>
                <p className="font-mono font-bold text-indigo-700 mt-0.5">{prediction.emergingMalware}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">HIGHEST RISK SECTOR</span>
                <p className="font-semibold text-slate-800 mt-0.5">{prediction.highestRiskDept}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 text-[11px] text-slate-600">
          <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
            <span>Forecast Probability</span>
            <span className="font-mono text-indigo-700">{prediction.probability}%</span>
          </div>
          <p className="text-slate-500 line-clamp-2 leading-tight">
            {prediction.explanation}
          </p>
        </div>
      </Card>
    </div>
  )
}
