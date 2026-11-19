import { useEffect, useState } from 'react'
import {
  ArrowDownTrayIcon,
  BoltIcon,
  ClipboardDocumentCheckIcon,
  DocumentArrowDownIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { AuditManagement } from '../components/grc/AuditManagement'
import { BusinessImpactAnalysis } from '../components/grc/BusinessImpactAnalysis'
import { ComplianceDashboard } from '../components/grc/ComplianceDashboard'
import { ComplianceGapAnalysis } from '../components/grc/ComplianceGapAnalysis'
import { ComplianceTimeline } from '../components/grc/ComplianceTimeline'
import { ControlsLibrary } from '../components/grc/ControlsLibrary'
import { ExecutiveGrcKpis } from '../components/grc/ExecutiveGrcKpis'
import { ExecutiveRiskSummaryCard } from '../components/grc/ExecutiveRiskSummaryCard'
import { PolicyComplianceGrid } from '../components/grc/PolicyComplianceGrid'
import { RemediationTracker } from '../components/grc/RemediationTracker'
import { RiskHeatmap } from '../components/grc/RiskHeatmap'
import { RiskRegisterTable } from '../components/grc/RiskRegisterTable'
import { RiskTreatmentPlans } from '../components/grc/RiskTreatmentPlans'
import { VendorRiskManagement } from '../components/grc/VendorRiskManagement'
import type { GRCSnapshot, RiskItem } from '../types/grc'
import {
  exportGRCToCSV,
  exportGRCToJSON,
  exportGRCToPDF,
  generateGRCSnapshot,
} from '../utils/grcSimulation'

export function GRCPage() {
  const [snapshot, setSnapshot] = useState<GRCSnapshot>(() =>
    generateGRCSnapshot(),
  )
  const [isStreaming, setIsStreaming] = useState(true)
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null)

  // Simulation loop updating every 5 seconds
  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      setSnapshot(generateGRCSnapshot())
    }, 5000)

    return () => clearInterval(interval)
  }, [isStreaming])

  const handleExportJSON = () => {
    exportGRCToJSON(snapshot)
    toast.success('GRC Executive Snapshot exported as JSON')
  }

  const handleExportCSV = () => {
    exportGRCToCSV(snapshot)
    toast.success('Enterprise Risk Register exported as CSV')
  }

  const handleExportPDF = () => {
    exportGRCToPDF(snapshot)
    toast.info('Generating print-ready PDF executive compliance report...')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Enterprise Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <ClipboardDocumentCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl">
                  Enterprise Risk, Compliance & Governance (GRC) Center
                </h1>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Tier 1 GRC
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Continuous compliance telemetry, quantitative risk registers, 5×5 matrix heatmaps, and regulatory audit assurance.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Exporters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live streaming status & toggle */}
          <button
            type="button"
            onClick={() => setIsStreaming((prev) => !prev)}
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-xs transition ${
              isStreaming
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isStreaming ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <PauseIcon className="h-4 w-4 text-emerald-600" />
                <span>Streaming (5s)</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 text-slate-500" />
                <span>Resume Feed</span>
              </>
            )}
          </button>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={() => {
              setSnapshot(generateGRCSnapshot())
              toast.success('GRC snapshot refreshed')
            }}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <BoltIcon className="h-4 w-4 text-amber-500" />
            <span>Evaluate</span>
          </button>

          {/* Export PDF */}
          <button
            type="button"
            onClick={handleExportPDF}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <DocumentArrowDownIcon className="h-4 w-4 text-slate-500" />
            <span>Export PDF</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 text-slate-500" />
            <span>CSV</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* 1. Executive GRC KPI Cards */}
      <ExecutiveGrcKpis kpis={snapshot.kpis} />

      {/* 12. AI Executive Governance & Risk Intelligence Summary */}
      <ExecutiveRiskSummaryCard summary={snapshot.summary} />

      {/* 3. 5x5 Enterprise Risk Heatmap */}
      <RiskHeatmap
        heatmap={snapshot.heatmap}
        risks={snapshot.risks}
        onSelectRisk={(risk) => setSelectedRisk(risk)}
      />

      {/* 2. Enterprise Risk Register */}
      <RiskRegisterTable
        risks={snapshot.risks}
        selectedRiskFromHeatmap={selectedRisk}
      />

      {/* 4. Regulatory Compliance Posture & Framework Benchmarks */}
      <ComplianceDashboard frameworks={snapshot.frameworks} />

      {/* 5. Security Controls Library & Evidence Catalog */}
      <ControlsLibrary controls={snapshot.controls} />

      {/* 6. Active Audit Management */}
      <AuditManagement audits={snapshot.audits} />

      {/* 7. Compliance Gap Analysis */}
      <ComplianceGapAnalysis gaps={snapshot.gaps} />

      {/* 8. Business Impact Analysis (BIA) */}
      <BusinessImpactAnalysis impacts={snapshot.businessImpacts} />

      {/* 9. Risk Treatment Plans */}
      <RiskTreatmentPlans plans={snapshot.treatmentPlans} />

      {/* 10. Third-Party Vendor Risk Management (VRM) */}
      <VendorRiskManagement vendors={snapshot.vendors} />

      {/* 11. Corporate Security Policy Adherence */}
      <PolicyComplianceGrid policies={snapshot.policies} />

      {/* 13. Enterprise Remediation Task Tracker */}
      <RemediationTracker remediations={snapshot.remediations} />

      {/* 14. 24-Month Compliance Trajectory & Milestones */}
      <ComplianceTimeline timeline={snapshot.timeline} />
    </div>
  )
}
