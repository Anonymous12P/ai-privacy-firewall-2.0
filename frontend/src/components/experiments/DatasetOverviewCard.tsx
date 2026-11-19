import {
  CircleStackIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { DatasetOverview } from '../../types/experiments'

interface DatasetOverviewCardProps {
  dataset: DatasetOverview
}

export function DatasetOverviewCard({ dataset }: DatasetOverviewCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <CircleStackIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {dataset.datasetName}
              </h3>
              <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                {dataset.version}
              </span>
            </div>
            <p className="text-xs text-slate-500">{dataset.source}</p>
          </div>
        </div>

        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
          Gold Standard Benchmark
        </span>
      </div>

      {/* 4 Stat Cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Raw Events */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Raw Ingested
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {(dataset.totalRawEvents / 1000000).toFixed(1)}M
          </span>
          <span className="text-[10px] text-slate-500">
            Across logon, device, file, email
          </span>
        </div>

        {/* Benchmark Evaluation Window */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Evaluation Window
          </span>
          <span className="text-xl font-black text-indigo-700 mt-1 block">
            {dataset.benchmarkRecords.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500">
            Balanced & verified instances
          </span>
        </div>

        {/* Synthetic Employees */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Synthetic Subjects
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {dataset.usersCount} Users
          </span>
          <span className="text-[10px] text-slate-500">
            Enterprise roles & shifts
          </span>
        </div>

        {/* Engineered Feature Vector */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Feature Dimensions
          </span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            {dataset.featureDimensionsCount} Features
          </span>
          <span className="text-[10px] text-slate-500">
            Temporal, behavioral, privacy
          </span>
        </div>
      </div>

      {/* Class Balance & Split Progress */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Class Imbalance Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span>Pre-SMOTE Class Distribution</span>
            <span className="font-mono text-slate-500">
              {dataset.classBalance.threatPercent}% Threat ({dataset.classBalance.threatCount}) vs {dataset.classBalance.benignPercent}% Benign ({dataset.classBalance.benignCount.toLocaleString()})
            </span>
          </div>
          <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="bg-emerald-500"
              style={{ width: `${dataset.classBalance.benignPercent}%` }}
              title="Benign Class (99.88%)"
            />
            <div
              className="bg-rose-500"
              style={{ width: `${dataset.classBalance.threatPercent * 20}%` }}
              title="Threat Class (0.12%)"
            />
          </div>
          <span className="mt-1.5 block text-[10px] text-slate-400 italic">
            Extreme insider threat imbalance addressed using Synthetic Minority Over-sampling Technique (SMOTE).
          </span>
        </div>

        {/* Reference Citation */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 text-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
            Academic Citation & Reference
          </span>
          <p className="mt-1 text-[11px] text-indigo-950 font-medium leading-relaxed">
            {dataset.referenceCitation}
          </p>
          <span className="mt-2 text-[10px] font-mono text-indigo-600">
            Split Configuration: {dataset.splitRatio.trainPercent}% Train / {dataset.splitRatio.valPercent}% Val / {dataset.splitRatio.testPercent}% Test
          </span>
        </div>
      </div>
    </Card>
  )
}
