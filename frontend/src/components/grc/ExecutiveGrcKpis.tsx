import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckBadgeIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  FolderOpenIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ExecutiveGrcKPIs } from '../../types/grc'

export interface ExecutiveGrcKpisProps {
  kpis: ExecutiveGrcKPIs
}

export function ExecutiveGrcKpis({ kpis }: ExecutiveGrcKpisProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {/* 1. Enterprise Risk Score */}
      <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-medium text-slate-500">
            Enterprise Risk Score
          </span>
          <ShieldExclamationIcon className="h-4 w-4 text-amber-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-slate-900">
            {kpis.enterpriseRiskScore}
            <span className="text-xs font-normal text-slate-400">/100</span>
          </span>
          <span className="inline-flex items-center text-[10px] font-bold text-emerald-600">
            <ArrowDownIcon className="mr-0.5 h-3 w-3" />
            {Math.abs(kpis.trend.risk)}%
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400">Lower indicates safer posture</p>
      </Card>

      {/* 2. Compliance Score */}
      <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-medium text-slate-500">
            Compliance Score
          </span>
          <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-emerald-600">
            {kpis.complianceScore}%
          </span>
          <span className="inline-flex items-center text-[10px] font-bold text-emerald-600">
            <ArrowUpIcon className="mr-0.5 h-3 w-3" />
            +{kpis.trend.compliance}%
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400">Weighted cross-framework avg</p>
      </Card>

      {/* 3. Open Risks */}
      <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-medium text-slate-500">Open Risks</span>
          <ExclamationTriangleIcon className="h-4 w-4 text-indigo-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-indigo-700">
            {kpis.openRisks}
          </span>
          <span className="text-[10px] font-semibold text-slate-500">Cataloged</span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400">Active in register</p>
      </Card>

      {/* 4. Critical Risks */}
      <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-medium text-slate-500">Critical Risks</span>
          <ShieldExclamationIcon className="h-4 w-4 text-rose-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-rose-600">
            {kpis.criticalRisks}
          </span>
          <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
            PRIORITY
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400">Require active mitigation</p>
      </Card>

      {/* 5. Active Audits */}
      <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-medium text-slate-500">Active Audits</span>
          <ClipboardDocumentCheckIcon className="h-4 w-4 text-cyan-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-cyan-700">
            {kpis.activeAudits}
          </span>
          <span className="text-[10px] font-semibold text-cyan-700">In Flight</span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400">SOC 2, ISO 27001 & GDPR</p>
      </Card>

      {/* 6. Controls Implemented */}
      <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-medium text-slate-500">
            Controls Implemented
          </span>
          <CheckBadgeIcon className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-slate-900">
            {kpis.controlsImplemented}
            <span className="text-xs font-normal text-slate-400">
              /{kpis.totalControls}
            </span>
          </span>
          <span className="text-[10px] font-bold text-emerald-600">
            {Math.round((kpis.controlsImplemented / (kpis.totalControls || 1)) * 100)}%
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400">Automated & tested</p>
      </Card>

      {/* 7. Compliance Frameworks */}
      <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-medium text-slate-500">
            Frameworks Active
          </span>
          <SparklesIcon className="h-4 w-4 text-purple-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-purple-700">
            {kpis.complianceFrameworks}
          </span>
          <span className="text-[10px] font-semibold text-purple-600">100% Tracked</span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400">ISO, NIST, SOC2, GDPR+</p>
      </Card>

      {/* 8. Open Findings */}
      <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-medium text-slate-500">Open Findings</span>
          <FolderOpenIcon className="h-4 w-4 text-amber-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-amber-600">
            {kpis.openFindings}
          </span>
          <span className="text-[10px] font-semibold text-slate-500">Auditor Notes</span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400">Zero material deficiencies</p>
      </Card>

      {/* 9. Remediation Tasks */}
      <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-medium text-slate-500">
            Remediations In Progress
          </span>
          <WrenchScrewdriverIcon className="h-4 w-4 text-blue-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-blue-600">
            {kpis.remediationTasks}
          </span>
          <span className="inline-flex items-center text-[10px] font-bold text-blue-600">
            <ArrowUpIcon className="mr-0.5 h-3 w-3" />
            +{kpis.trend.remediation}%
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400">Action items assigned</p>
      </Card>

      {/* 10. Overall Security Rating */}
      <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-medium text-slate-500">
            Security Rating
          </span>
          <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-black text-emerald-600">
            {kpis.overallSecurityRating}
          </span>
          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
            EXCELLENT
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400">Enterprise benchmark tier</p>
      </Card>
    </div>
  )
}
