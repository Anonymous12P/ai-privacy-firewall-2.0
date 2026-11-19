import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { VendorItem } from '../../types/grc'

interface VendorRiskManagementProps {
  vendors: VendorItem[]
}

export function VendorRiskManagement({ vendors }: VendorRiskManagementProps) {
  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'Low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getClassificationBadge = (tier: string) => {
    switch (tier) {
      case 'Restricted':
        return 'bg-purple-100 text-purple-800 border-purple-200 font-bold'
      case 'Confidential':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200 font-semibold'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BuildingOfficeIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Third-Party Vendor Risk Management (VRM)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Supply chain risk ratings, Data Processing Agreements (DPA), sub-processor certifications, and security scores.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {vendors.length} Integrated Enterprise Sub-processors
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-[10px] font-bold text-indigo-700">
                    {vendor.id}
                  </span>
                  <h4 className="mt-0.5 text-sm font-bold text-slate-900">
                    {vendor.name}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {vendor.service}
                  </span>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold ${getRatingBadge(
                    vendor.riskRating,
                  )}`}
                >
                  {vendor.riskRating} Risk
                </span>
              </div>

              {/* Security Score bar */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Security Score
                  </span>
                  <span className="font-black text-slate-900">
                    {vendor.securityScore} / 100
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      vendor.securityScore >= 95
                        ? 'bg-emerald-500'
                        : vendor.securityScore >= 85
                          ? 'bg-indigo-600'
                          : 'bg-rose-500'
                    }`}
                    style={{ width: `${vendor.securityScore}%` }}
                  />
                </div>
              </div>

              {/* Compliance & Data Classification */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    COMPLIANCE STATUS
                  </span>
                  <span
                    className={`font-bold ${
                      vendor.complianceStatus === 'Compliant'
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {vendor.complianceStatus}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-2.5">
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    DATA CLASSIFICATION
                  </span>
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[10px] ${getClassificationBadge(
                      vendor.dataClassification,
                    )}`}
                  >
                    {vendor.dataClassification}
                  </span>
                </div>
              </div>

              {/* SOC2 Status & DPA */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-medium">{vendor.soc2Status}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DocumentTextIcon className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span className="text-[11px] font-medium">
                    DPA Status:{' '}
                    <strong>{vendor.dpaSigned ? 'Executed & In Effect' : 'Action Required (Pending)'}</strong>
                  </span>
                </div>
              </div>

              {/* Contracts on file */}
              <div className="mt-3 border-t border-slate-100 pt-2.5">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                  CONTRACTS ON FILE:
                </span>
                <div className="flex flex-wrap gap-1">
                  {vendor.contracts.map((c) => (
                    <span
                      key={c}
                      className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-2.5 text-right font-mono text-[10px] text-slate-400">
              Assessed: {vendor.lastAssessment}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
