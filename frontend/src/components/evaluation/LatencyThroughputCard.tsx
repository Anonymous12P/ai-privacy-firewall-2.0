import {
  BoltIcon,
  CircleStackIcon,
  ClockIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { LatencyThroughputMetrics } from '../../types/evaluation'

interface LatencyThroughputCardProps {
  latency: LatencyThroughputMetrics
}

export function LatencyThroughputCard({ latency }: LatencyThroughputCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BoltIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Computational Performance, Latency & Throughput Evaluation
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Real-time inference profiling under simulated multi-tenant enterprise packet filtering loads.
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          Sub-5ms Strict Enterprise Budget
        </span>
      </div>

      {/* KPI Badges */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Mean Latency
            </p>
            <ClockIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-emerald-700">
            {latency.meanLatencyMs} ms
          </p>
          <p className="mt-0.5 text-[10px] text-emerald-600 font-semibold">Per-Request Evaluation</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              p95 Tail Latency
            </p>
            <ClockIcon className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-indigo-700">
            {latency.p95LatencyMs} ms
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">95th Percentile Bound</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Single-Node Throughput
            </p>
            <BoltIcon className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {latency.requestsPerSecond.toLocaleString()} req/s
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Synchronous API Edge</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Batch Speed
            </p>
            <CircleStackIcon className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {latency.batchProcessingSpeed.toLocaleString()} rec/s
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Offline Audit Scans</p>
        </div>
      </div>

      {/* Latency Percentile Distribution Grid */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Tail Latency Percentile Profile (ms)
          </h4>
          <span className="text-[11px] text-slate-500">
            Audit overhead: +{latency.loggingOverheadMs} ms
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {latency.latencyDeciles.map((dec) => (
            <div
              key={dec.percentile}
              className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-2.5 text-center"
            >
              <p className="text-[10px] font-semibold text-slate-500">{dec.percentile}</p>
              <p className="mt-1 text-base font-black text-slate-900">{dec.latency} ms</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-[11px] text-slate-500 flex items-center gap-2">
        <CpuChipIcon className="h-4 w-4 shrink-0 text-slate-400" />
        <span>
          <strong>Hardware Benchmark Baseline:</strong> {latency.hardwareSpecs}
        </span>
      </div>
    </Card>
  )
}
