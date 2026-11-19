import {
  ArrowDownIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { AblationRow } from '../../types/evaluation'

interface AblationStudyTableProps {
  ablation: AblationRow[]
}

function getCriticalityBadge(crit: AblationRow['criticality']) {
  switch (crit) {
    case 'CRITICAL':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'HIGH':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'MODERATE':
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200'
  }
}

export function AblationStudyTable({ ablation }: AblationStudyTableProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CpuChipIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              10-Feature System Ablation Study
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Measures predictive degradation (&Delta;F1 and &Delta;AUC) when individual behavioral dimensions are omitted from the ensemble.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-mono font-medium text-slate-600">
          Full Feature Baseline: F1 = 0.956, AUC = 0.984
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-3">Omitted Feature Dimension</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3 text-center">Ablated F1</th>
              <th className="py-3 px-3 text-center">&Delta; F1 Drop</th>
              <th className="py-3 px-3 text-center">Ablated AUC</th>
              <th className="py-3 px-3 text-center">&Delta; AUC Drop</th>
              <th className="py-3 px-3 text-center">Criticality</th>
              <th className="py-3 px-3">Scientific Theoretical Significance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ablation.map((row) => (
              <tr key={row.featureRemoved} className="hover:bg-slate-50/60 transition">
                <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                  {row.featureRemoved}
                </td>
                <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                  {row.category}
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-700">
                  {row.ablatedF1}
                </td>
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-red-50 border border-red-200 px-2 py-0.5 font-mono font-bold text-red-700">
                    <ArrowDownIcon className="h-3 w-3" />
                    {row.deltaF1}
                  </span>
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-700">
                  {row.ablatedAuc}
                </td>
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-red-50 border border-red-200 px-2 py-0.5 font-mono font-bold text-red-700">
                    <ArrowDownIcon className="h-3 w-3" />
                    {row.deltaAuc}
                  </span>
                </td>
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getCriticalityBadge(
                      row.criticality,
                    )}`}
                  >
                    {row.criticality}
                  </span>
                </td>
                <td className="py-3 px-3 max-w-sm text-slate-600 text-[11px] leading-relaxed">
                  {row.interpretation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 text-xs text-amber-900 flex items-center gap-2">
        <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-amber-600" />
        <span>
          <strong>Ablation Conclusion:</strong> Peripheral USB usage and after-hours temporal anomalies exhibit the highest individual ablation drops (totaling &Delta;F1 = -0.116). Omission of either dimension causes critical blindspots in air-gapped physical and night-shift exfiltration defense.
        </span>
      </div>
    </Card>
  )
}
