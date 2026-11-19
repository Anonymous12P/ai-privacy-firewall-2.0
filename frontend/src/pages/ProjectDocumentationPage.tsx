import {
  BookOpenIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { ApiReferenceSection } from '../components/documentation/ApiReferenceSection'
import { InstallationGuideSection } from '../components/documentation/InstallationGuideSection'
import { ReproducibilityCard } from '../components/documentation/ReproducibilityCard'
import { ArchitectureVisualizer } from '../components/demo/ArchitectureVisualizer'

export function ProjectDocumentationPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              Developer & Researcher Hub
            </span>
            <span className="text-xs text-slate-500">Comprehensive Technical Manual</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Project Documentation & API Guide
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 max-w-3xl">
            Complete technical guide covering system architecture, reproducible local setup, Docker deployment,
            FastAPI endpoint schemas, and CMU SEI CERT r4.2 machine learning artifacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/demo"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
          >
            <SparklesIcon className="h-4 w-4 text-indigo-600" />
            <span>Interactive Demo</span>
          </a>

          <a
            href="/research-summary"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-xs"
          >
            <BookOpenIcon className="h-4 w-4" />
            <span>Research Summary</span>
          </a>
        </div>
      </div>

      {/* 1. Architecture Flow Visualizer */}
      <ArchitectureVisualizer />

      {/* 2. Installation & Verification Guide */}
      <InstallationGuideSection />

      {/* 3. REST API & OpenAPI Specification */}
      <ApiReferenceSection />

      {/* 4. Reproducibility & Model Serialization Manifest */}
      <ReproducibilityCard />
    </div>
  )
}
