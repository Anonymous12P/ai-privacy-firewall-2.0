import { useState } from 'react'
import {
  CommandLineIcon,
  DocumentChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { ArchitectureVisualizer } from '../components/demo/ArchitectureVisualizer'
import { DemoScenarioPicker } from '../components/demo/DemoScenarioPicker'
import { DemoWalkthroughCard } from '../components/demo/DemoWalkthroughCard'
import { ExportReportModal } from '../components/demo/ExportReportModal'
import { ScreenshotModeControls } from '../components/demo/ScreenshotModeControls'
import {
  DEMO_SCENARIOS,
  type DemoScenario,
} from '../utils/demoScenarioData'

export function DemoCenterPage() {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0])
  const [isScreenshotMode, setIsScreenshotMode] = useState<boolean>(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)

  return (
    <div className={`space-y-6 ${isScreenshotMode ? 'max-w-7xl mx-auto px-4 py-6' : ''}`}>
      {/* Page Header (Hides or simplifies during screenshot mode) */}
      {!isScreenshotMode ? (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                Sprint 17 Presentation Suite
              </span>
              <span className="text-xs text-slate-500">Live Executive & Research Showcase</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Interactive Demo & Evaluation Center
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 max-w-3xl">
              Step through the full end-to-end lifecycle of the Explainable Adaptive AI Privacy Firewall:
              telemetry ingestion, real model inference, TreeSHAP explanation, policy arbitration, immutable audit logging, and adaptive learning.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/research-summary"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
            >
              <DocumentChartBarIcon className="h-4 w-4 text-indigo-600" />
              <span>Research Summary</span>
            </a>

            <a
              href="/documentation"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-xs"
            >
              <CommandLineIcon className="h-4 w-4" />
              <span>Documentation & API</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-900 text-white p-6 shadow-md flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider">
              <SparklesIcon className="h-4 w-4" />
              <span>Presentation Mode Active</span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold text-white tracking-tight">
              An Explainable Adaptive AI Privacy Firewall
            </h1>
            <p className="text-xs text-indigo-200 mt-0.5">
              Detecting Unauthorized Data Access Using User Behavior Analytics (CERT r4.2 Benchmark)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsScreenshotMode(false)}
            className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer"
          >
            Exit Presentation View
          </button>
        </div>
      )}

      {/* Screenshot / Presentation Toolbar */}
      <ScreenshotModeControls
        isScreenshotMode={isScreenshotMode}
        onToggleScreenshotMode={() => setIsScreenshotMode(!isScreenshotMode)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Preset Scenario Picker (8 Scenarios) */}
      <DemoScenarioPicker
        scenarios={DEMO_SCENARIOS}
        selectedScenarioId={selectedScenario.id}
        onSelectScenario={(s) => setSelectedScenario(s)}
        isScreenshotMode={isScreenshotMode}
      />

      {/* Step-by-Step Full Lifecycle Walkthrough Card */}
      <DemoWalkthroughCard
        scenario={selectedScenario}
        isScreenshotMode={isScreenshotMode}
      />

      {/* Architecture Visualizer (7 Pillars) */}
      <ArchitectureVisualizer />

      {/* Export Report Data Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeScenario={selectedScenario}
      />
    </div>
  )
}
