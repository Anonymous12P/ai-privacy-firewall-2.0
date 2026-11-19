import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  FireIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  PauseIcon,
  PlayIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card } from '../components/Card'
import { AIInvestigationSummary } from '../components/incidents/AIInvestigationSummary'
import { AttackGraph } from '../components/incidents/AttackGraph'
import { BehaviorTimeline } from '../components/incidents/BehaviorTimeline'
import { CaseManagementPanel } from '../components/incidents/CaseManagementPanel'
import { ContainmentSimulator } from '../components/incidents/ContainmentSimulator'
import { EvidencePanel } from '../components/incidents/EvidencePanel'
import { IncidentDetailsModal } from '../components/incidents/IncidentDetailsModal'
import { IncidentQueue } from '../components/incidents/IncidentQueue'
import { InvestigationTimeline } from '../components/incidents/InvestigationTimeline'
import { MitreAttackMatrix } from '../components/incidents/MitreAttackMatrix'
import { ResponseRecommendations } from '../components/incidents/ResponseRecommendations'
import type { Incident, IncidentKPIs } from '../types/incident'
import {
  INITIAL_INCIDENTS,
  computeIncidentKPIs,
  exportIncidentReportPDF,
  exportIncidentsToCSV,
  exportIncidentsToJSON,
  generateSimulatedIncident,
} from '../utils/incidentSimulation'

export function IncidentCenterPage() {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS)
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    INITIAL_INCIDENTS[0]?.id ?? '',
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStreaming, setIsStreaming] = useState(true)

  // Simulation tick every 5 seconds to generate live enterprise incident
  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      const newInc = generateSimulatedIncident()
      setIncidents((prev) => [newInc, ...prev.slice(0, 24)])
    }, 5000)

    return () => clearInterval(interval)
  }, [isStreaming])

  const selectedIncident =
    incidents.find((i) => i.id === selectedIncidentId) ?? incidents[0]!

  const kpis: IncidentKPIs = computeIncidentKPIs(incidents)

  const handleSelectIncident = (inc: Incident) => {
    setSelectedIncidentId(inc.id)
    setIsModalOpen(true)
  }

  const handleUpdateIncident = (updated: Incident) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i)),
    )
  }

  const handleExportJSON = () => {
    exportIncidentsToJSON(incidents)
    toast.success('Incidents exported to JSON')
  }

  const handleExportCSV = () => {
    exportIncidentsToCSV(incidents)
    toast.success('Incidents exported to CSV')
  }

  const handleExportPDF = () => {
    toast.info('Generating SOC Incident Report print preview...')
    exportIncidentReportPDF()
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              AI Incident Response & Investigation Center
            </h1>
            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">
              SOC TIER-3
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Security Operations Center triage, automated containment playbooks, forensic evidence analysis, and MITRE ATT&CK mapping.
          </p>
        </div>

        {/* Action Controls & Simulation Stream */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsStreaming((prev) => !prev)}
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-xs transition ${
              isStreaming
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isStreaming ? (
              <>
                <PauseIcon className="h-4 w-4" />
                <span>Live Feed (5s)</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                <span>Resume Feed</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <DocumentArrowDownIcon className="h-4 w-4 text-slate-500" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 text-slate-500" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: 8 ANIMATED EXECUTIVE INCIDENT KPIS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {/* 1. Critical Incidents */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">Critical</span>
            <FireIcon className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-600">
            {kpis.criticalIncidents}
          </p>
          <span className="mt-0.5 text-[10px] text-rose-500 font-semibold block">P1 Escalation</span>
        </Card>

        {/* 2. High Incidents */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">High</span>
            <ShieldExclamationIcon className="h-4 w-4 text-orange-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-orange-600">
            {kpis.highIncidents}
          </p>
          <span className="mt-0.5 text-[10px] text-orange-500 font-semibold block">P2 Priority</span>
        </Card>

        {/* 3. Open Cases */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">Open Cases</span>
            <FolderOpenIcon className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {kpis.openCases}
          </p>
          <span className="mt-0.5 text-[10px] text-slate-400 font-medium block">Queue Active</span>
        </Card>

        {/* 4. Investigating */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">Investigating</span>
            <MagnifyingGlassIcon className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600">
            {kpis.investigating}
          </p>
          <span className="mt-0.5 text-[10px] text-amber-500 font-semibold block">Under Review</span>
        </Card>

        {/* 5. Resolved */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">Resolved</span>
            <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {kpis.resolved}
          </p>
          <span className="mt-0.5 text-[10px] text-emerald-500 font-semibold block">Closed</span>
        </Card>

        {/* 6. MTTD */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">MTTD</span>
            <ClockIcon className="h-4 w-4 text-cyan-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-cyan-700">
            {kpis.mttd}
          </p>
          <span className="mt-0.5 text-[10px] text-cyan-600 font-semibold block">Mean Detect</span>
        </Card>

        {/* 7. MTTR */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">MTTR</span>
            <ClockIcon className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-purple-700">
            {kpis.mttr}
          </p>
          <span className="mt-0.5 text-[10px] text-purple-600 font-semibold block">Mean Respond</span>
        </Card>

        {/* 8. Containment Rate */}
        <Card className="p-3.5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium text-slate-500">Success Rate</span>
            <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {kpis.containmentSuccessRate}%
          </p>
          <span className="mt-0.5 text-[10px] text-emerald-500 font-semibold block">Containment</span>
        </Card>
      </div>

      {/* SECTION 2: INCIDENT QUEUE TABLE */}
      <IncidentQueue
        incidents={incidents}
        selectedIncidentId={selectedIncidentId}
        onSelectIncident={handleSelectIncident}
      />

      {/* ACTIVE INCIDENT FORENSIC INVESTIGATION WORKSPACE */}
      {selectedIncident && (
        <div className="space-y-6 pt-2">
          {/* Target Investigation Banner */}
          <div className="flex items-center justify-between rounded-xl bg-slate-900 px-5 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-indigo-400">
                ACTIVE CASE: {selectedIncident.id}
              </span>
              <span className="text-xs text-slate-300">
                {selectedIncident.title} • {selectedIncident.affectedUser} ({selectedIncident.department})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer text-xs font-bold text-indigo-300 hover:text-white underline"
            >
              Open Full Forensic Details Modal ↗
            </button>
          </div>

          {/* SECTION 9: AI INVESTIGATION SUMMARY */}
          <AIInvestigationSummary incident={selectedIncident} />

          {/* SECTION 7: ATTACK GRAPH KILL-CHAIN VISUALIZATION */}
          <AttackGraph nodes={selectedIncident.attackGraph} />

          {/* SECTION 6: MITRE ATT&CK MAPPING MATRIX */}
          <MitreAttackMatrix techniques={selectedIncident.mitreMatrix} />

          {/* SECTION 8: BEHAVIOR INDICATOR SPECTRUM */}
          <BehaviorTimeline steps={selectedIncident.behaviorTimeline} />

          {/* SECTION 4 & 5: INVESTIGATION TIMELINE & FORENSIC EVIDENCE */}
          <div className="grid gap-6 lg:grid-cols-2">
            <InvestigationTimeline
              timeline={selectedIncident.timeline}
              incidentId={selectedIncident.id}
            />
            <EvidencePanel
              evidence={selectedIncident.evidence}
              evidenceScore={selectedIncident.evidenceScore}
            />
          </div>

          {/* SECTION 10 & 11: RECOMMENDED RESPONSE & CONTAINMENT SIMULATOR */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ResponseRecommendations
              recommendations={selectedIncident.recommendations}
            />
            <ContainmentSimulator
              incident={selectedIncident}
              onIncidentUpdated={handleUpdateIncident}
            />
          </div>

          {/* SECTION 12: CASE MANAGEMENT LIFECYCLE PANEL */}
          <CaseManagementPanel
            incident={selectedIncident}
            onIncidentUpdated={handleUpdateIncident}
          />

          {/* SECTION 3: MODAL POPUP */}
          <IncidentDetailsModal
            incident={selectedIncident}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
