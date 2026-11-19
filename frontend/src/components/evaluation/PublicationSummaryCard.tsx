import {
  AcademicCapIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { PublicationSummary } from '../../types/evaluation'

interface PublicationSummaryCardProps {
  publication: PublicationSummary
}

export function PublicationSummaryCard({ publication }: PublicationSummaryCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Publication-Ready Synthesis & Scientific Contributions
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Formal peer-reviewed paper abstract, theoretical findings, and operational conclusions.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          <TrophyIcon className="h-4 w-4 text-amber-500" />
          {publication.bestModel.split(' ')[0]} State-of-the-Art
        </span>
      </div>

      {/* Abstract Block */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <DocumentTextIcon className="h-4 w-4 text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Paper Abstract
          </h4>
        </div>
        <p className="mt-2 text-xs text-slate-700 leading-relaxed text-justify font-serif">
          {publication.abstractText}
        </p>
      </div>

      {/* Strongest Features & Findings */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strongest Features */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Dominant Predictive Features
            </h4>
          </div>
          <ul className="mt-2.5 space-y-1.5">
            {publication.strongestFeatures.map((feat) => (
              <li
                key={feat}
                className="flex items-center gap-2 font-mono text-xs text-slate-700 rounded-md bg-slate-50 p-2 border border-slate-100"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Findings */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <CheckBadgeIcon className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Empirical Findings
            </h4>
          </div>
          <ul className="mt-2.5 space-y-2">
            {publication.keyFindings.map((finding) => (
              <li key={finding} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Limitations & Future Work Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Limitations */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-4">
          <div className="flex items-center gap-2">
            <ExclamationCircleIcon className="h-4 w-4 text-amber-600" />
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Methodological Limitations
            </h4>
          </div>
          <ul className="mt-2 space-y-1.5">
            {publication.limitations.map((lim) => (
              <li key={lim} className="flex items-start gap-2 text-xs text-amber-900/90">
                <span className="text-amber-600 font-bold mt-0.5">-</span>
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Future Work */}
        <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/30 p-4">
          <div className="flex items-center gap-2">
            <LightBulbIcon className="h-4 w-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Future Research Directions
            </h4>
          </div>
          <ul className="mt-2 space-y-1.5">
            {publication.futureWork.map((fw) => (
              <li key={fw} className="flex items-start gap-2 text-xs text-indigo-900/90">
                <span className="text-indigo-600 font-bold mt-0.5">&rarr;</span>
                <span>{fw}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
