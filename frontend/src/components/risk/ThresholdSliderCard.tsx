import { useState } from 'react'
import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { Card } from '../Card'
import type { FirewallThresholds } from '../../types/riskTuning'
import { computeProjectedImpact } from '../../utils/riskTuningSimulation'

interface ThresholdSliderCardProps {
  thresholds: FirewallThresholds
  onUpdateThresholds: (updated: FirewallThresholds) => void
}

export function ThresholdSliderCard({
  thresholds,
  onUpdateThresholds,
}: ThresholdSliderCardProps) {
  const [localAllow, setLocalAllow] = useState(thresholds.allowThreshold)
  const [localWarn, setLocalWarn] = useState(thresholds.warnThreshold)
  const [localRestrict, setLocalRestrict] = useState(thresholds.restrictThreshold)
  const [localBlock, setLocalBlock] = useState(thresholds.blockThreshold)

  const projected = computeProjectedImpact(localAllow, localWarn, localRestrict, localBlock)

  const handleApply = () => {
    if (localAllow >= localWarn || localWarn >= localRestrict || localRestrict >= localBlock) {
      toast.error('Threshold constraint violation: Must satisfy ALLOW < WARN < RESTRICT < BLOCK')
      return
    }

    onUpdateThresholds({
      ...thresholds,
      allowThreshold: localAllow,
      warnThreshold: localWarn,
      restrictThreshold: localRestrict,
      blockThreshold: localBlock,
      projectedImpact: projected,
    })
    toast.success('Adaptive decision thresholds applied to real-time firewall engine')
  }

  const handlePreset = (preset: 'BALANCED' | 'CONSERVATIVE' | 'PERMISSIVE') => {
    if (preset === 'CONSERVATIVE') {
      setLocalAllow(28)
      setLocalWarn(52)
      setLocalRestrict(72)
      setLocalBlock(82)
    } else if (preset === 'PERMISSIVE') {
      setLocalAllow(42)
      setLocalWarn(72)
      setLocalRestrict(88)
      setLocalBlock(95)
    } else {
      setLocalAllow(35)
      setLocalWarn(65)
      setLocalRestrict(82)
      setLocalBlock(90)
    }
    toast.info(`Loaded ${preset} threshold preset (click Apply to commit)`)
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Adaptive Decision Threshold Tuning
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Tune Bayesian decision boundaries and evaluate projected false-positive and containment trade-offs.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Presets:</span>
          <button
            type="button"
            onClick={() => handlePreset('BALANCED')}
            className="cursor-pointer rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Balanced
          </button>
          <button
            type="button"
            onClick={() => handlePreset('CONSERVATIVE')}
            className="cursor-pointer rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Conservative (SOC)
          </button>
          <button
            type="button"
            onClick={() => handlePreset('PERMISSIVE')}
            className="cursor-pointer rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Permissive (Dev)
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* ALLOW Boundary */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
              ALLOW Cap
            </span>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-sm font-black text-emerald-800">
              0 - {localAllow}
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={50}
            value={localAllow}
            onChange={(e) => setLocalAllow(Number(e.target.value))}
            className="mt-4 h-2 w-full cursor-pointer accent-emerald-600"
          />
          <p className="mt-2 text-[11px] text-emerald-700/80">
            Requests with risk score &le; {localAllow} are passed transparently without friction.
          </p>
        </div>

        {/* WARN Boundary */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              WARN Ceiling
            </span>
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-sm font-black text-amber-800">
              {localAllow + 1} - {localWarn}
            </span>
          </div>
          <input
            type="range"
            min={localAllow + 5}
            max={75}
            value={localWarn}
            onChange={(e) => setLocalWarn(Number(e.target.value))}
            className="mt-4 h-2 w-full cursor-pointer accent-amber-500"
          />
          <p className="mt-2 text-[11px] text-amber-700/80">
            Prompts user with non-blocking privacy disclaimer and telemetry audit logging.
          </p>
        </div>

        {/* RESTRICT Boundary */}
        <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">
              RESTRICT Ceiling
            </span>
            <span className="rounded-md bg-orange-100 px-2 py-0.5 text-sm font-black text-orange-800">
              {localWarn + 1} - {localRestrict}
            </span>
          </div>
          <input
            type="range"
            min={localWarn + 5}
            max={89}
            value={localRestrict}
            onChange={(e) => setLocalRestrict(Number(e.target.value))}
            className="mt-4 h-2 w-full cursor-pointer accent-orange-500"
          />
          <p className="mt-2 text-[11px] text-orange-700/80">
            Enforces biometric MFA step-up verification or temporary read-only quarantine.
          </p>
        </div>

        {/* BLOCK Boundary */}
        <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-red-800 uppercase tracking-wider">
              <ShieldExclamationIcon className="h-4 w-4 text-red-600" />
              BLOCK Threshold
            </span>
            <span className="rounded-md bg-red-100 px-2 py-0.5 text-sm font-black text-red-800">
              &ge; {localRestrict + 1}
            </span>
          </div>
          <input
            type="range"
            min={localRestrict + 1}
            max={98}
            value={localBlock}
            onChange={(e) => setLocalBlock(Number(e.target.value))}
            className="mt-4 h-2 w-full cursor-pointer accent-red-600"
          />
          <p className="mt-2 text-[11px] text-red-700/80">
            Immediate TCP session drop, security isolation, and priority SOC incident triage.
          </p>
        </div>
      </div>

      {/* Projected Decision Impact Matrix */}
      <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Projected Enterprise Traffic Impact
          </span>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span>
              False Positive Rate: <strong className="text-indigo-600">{projected.falsePositiveRate}%</strong>
            </span>
            <span>
              False Negative Rate: <strong className="text-indigo-600">{projected.falseNegativeRate}%</strong>
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-slate-200/60">
            <span className="text-xs font-semibold text-emerald-700">ALLOW Rate</span>
            <span className="text-sm font-bold text-slate-900">{projected.allowRate}%</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-slate-200/60">
            <span className="text-xs font-semibold text-amber-700">WARN Rate</span>
            <span className="text-sm font-bold text-slate-900">{projected.warnRate}%</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-slate-200/60">
            <span className="text-xs font-semibold text-orange-700">RESTRICT Rate</span>
            <span className="text-sm font-bold text-slate-900">{projected.restrictRate}%</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-slate-200/60">
            <span className="text-xs font-semibold text-red-700">BLOCK Rate</span>
            <span className="text-sm font-bold text-slate-900">{projected.blockRate}%</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setLocalAllow(thresholds.allowThreshold)
              setLocalWarn(thresholds.warnThreshold)
              setLocalRestrict(thresholds.restrictThreshold)
              setLocalBlock(thresholds.blockThreshold)
            }}
            className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowPathIcon className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
          >
            <CheckCircleIcon className="h-3.5 w-3.5" />
            Apply Adaptive Thresholds
          </button>
        </div>
      </div>
    </Card>
  )
}
