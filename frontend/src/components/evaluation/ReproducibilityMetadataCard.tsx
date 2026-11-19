import { useState } from 'react'
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { Card } from '../Card'
import type { ReproducibilityMetadata } from '../../types/evaluation'

interface ReproducibilityMetadataCardProps {
  metadata: ReproducibilityMetadata
}

export function ReproducibilityMetadataCard({ metadata }: ReproducibilityMetadataCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(metadata.bibtexCitation)
    setCopied(true)
    toast.success('BibTeX citation copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CodeBracketIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Reproducibility Artifacts & Scientific Provenance
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Deterministic experiment seeds, artifact hashes, and citation schema for academic peer review.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyBibtex}
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
        >
          {copied ? (
            <>
              <ClipboardDocumentCheckIcon className="h-4 w-4 text-emerald-600" />
              Copied!
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="h-4 w-4 text-slate-500" />
              Copy BibTeX Citation
            </>
          )}
        </button>
      </div>

      {/* Metadata Attributes Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Run ID & Seed
          </span>
          <span className="font-mono font-bold text-indigo-700">{metadata.runId}</span>
          <span className="text-slate-500 text-[11px] block mt-0.5">Seed: {metadata.simulationSeed}</span>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Dataset & Feature Version
          </span>
          <span className="font-mono font-semibold text-slate-800">{metadata.datasetVersion}</span>
          <span className="text-slate-500 text-[11px] block mt-0.5">{metadata.featureSetVersion}</span>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Model & Policy Version
          </span>
          <span className="font-mono font-semibold text-slate-800">{metadata.modelVersion}</span>
          <span className="text-slate-500 text-[11px] block mt-0.5">{metadata.policyVersion}</span>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Compute Environment
          </span>
          <span className="text-slate-700 text-[11px] leading-tight block truncate" title={metadata.environment}>
            {metadata.environment}
          </span>
          <span className="text-emerald-600 font-semibold text-[10px] block mt-0.5">100% Deterministic</span>
        </div>
      </div>

      {/* BibTeX Box */}
      <div className="mt-4">
        <pre className="rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed shadow-sm">
          {metadata.bibtexCitation}
        </pre>
      </div>
    </Card>
  )
}
