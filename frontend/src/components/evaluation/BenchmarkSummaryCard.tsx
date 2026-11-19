import {
  CircleStackIcon,
  CpuChipIcon,
  DocumentChartBarIcon,
  TagIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { BenchmarkOverview } from '../../types/evaluation'

interface BenchmarkSummaryCardProps {
  benchmark: BenchmarkOverview
}

export function BenchmarkSummaryCard({ benchmark }: BenchmarkSummaryCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <DocumentChartBarIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Benchmark Dataset & Experimental Configuration
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Gold-standard benchmark evaluation based on the CMU SEI Insider Threat Dataset r4.2.
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          {benchmark.evaluationDate}
        </span>
      </div>

      {/* 4 Primary Stats */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Users
            </p>
            <UserGroupIcon className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {benchmark.userCount.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Corporate Identities</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Processed Records
            </p>
            <CircleStackIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-emerald-700">
            {benchmark.processedRecordCount.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">From 12.48M Raw Events</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Extracted Features
            </p>
            <CpuChipIcon className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-indigo-800">
            {benchmark.totalFeatures}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Behavioral Dimensions</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Partition Split
            </p>
            <TagIcon className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-1 text-2xl font-black text-slate-900">70 / 15 / 15</p>
          <p className="mt-0.5 text-[10px] text-slate-500">Train / Val / Test Holdout</p>
        </div>
      </div>

      {/* Dataset & Model Families Details Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 space-y-1.5">
          <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
            Dataset Source & Class Balance
          </p>
          <p className="text-slate-700 font-semibold">{benchmark.datasetName}</p>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            {benchmark.imbalanceRatio}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 space-y-1.5">
          <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
            Evaluated Model Families
          </p>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {benchmark.modelFamiliesTested.map((fam) => (
              <span
                key={fam}
                className="rounded-md bg-white border border-slate-200 px-2 py-0.5 font-semibold text-slate-700 shadow-2xs"
              >
                {fam}
              </span>
            ))}
          </div>
          <p className="text-slate-500 text-[11px] pt-1">
            Standardized 10-fold cross-validation with stratified holdout testing.
          </p>
        </div>
      </div>
    </Card>
  )
}
