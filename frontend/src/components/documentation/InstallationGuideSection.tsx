import { useState } from 'react'
import {
  CheckIcon,
  ClipboardDocumentIcon,
  CommandLineIcon,
  CubeIcon,
  ServerIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'

interface CommandSnippet {
  id: string
  label: string
  commands: string[]
  description: string
}

const SNIPPETS: CommandSnippet[] = [
  {
    id: 'prerequisites',
    label: 'Prerequisites',
    description: 'System software versions validated for reproducibility across Linux, macOS, and Windows environments.',
    commands: [
      '# Ensure Python >= 3.11',
      'python --version  # Output: Python 3.11.x or 3.14.x',
      '',
      '# Ensure Node.js >= 20.0 and npm >= 10.0',
      'node --version    # Output: v20.x or v24.x',
      'npm --version     # Output: 10.x or 11.x',
      '',
      '# Ensure Docker & Compose are running (optional for containerized deployment)',
      'docker --version && docker compose version',
    ],
  },
  {
    id: 'backend',
    label: 'Backend Setup',
    description: 'Set up Python virtual environment, install scikit-learn & xgboost dependencies, and start FastAPI service.',
    commands: [
      '# Navigate into backend directory',
      'cd backend',
      '',
      '# Create and activate Python virtual environment',
      'python -m venv .venv',
      'source .venv/bin/activate  # Windows: .venv\\Scripts\\activate',
      '',
      '# Install machine learning & backend dependencies',
      'pip install -r requirements.txt',
      '',
      '# Run database migrations',
      'alembic upgrade head',
      '',
      '# Start FastAPI development server on port 8000',
      'uvicorn app.main:app --reload --host 0.0.0.0 --port 8000',
    ],
  },
  {
    id: 'frontend',
    label: 'Frontend Setup',
    description: 'Install React 18, TailwindCSS, and Vite dependencies, then launch high-performance dev server.',
    commands: [
      '# Navigate into frontend directory',
      'cd frontend',
      '',
      '# Install frontend dependencies',
      'npm install',
      '',
      '# Launch Vite development server on port 5173',
      'npm run dev',
      '',
      '# Open browser to access dashboard',
      '# http://localhost:5173',
    ],
  },
  {
    id: 'docker',
    label: 'Docker Compose',
    description: 'One-command full-stack container orchestration for database, backend API, and static frontend proxy.',
    commands: [
      '# Build and launch all multi-container services in detached mode',
      'docker compose up -d --build',
      '',
      '# Check service status and health checks',
      'docker compose ps',
      '',
      '# Tail aggregate firewall engine logs',
      'docker compose logs -f backend',
      '',
      '# Tear down containers and preserve persistent database volume',
      'docker compose down',
    ],
  },
  {
    id: 'verification',
    label: 'Testing & Verification',
    description: 'Execute complete automated test suites, linter compliance, and type checking across backend and frontend.',
    commands: [
      '# Run Python ML and Firewall API tests',
      'pytest backend/tests/test_firewall_platform.py backend/tests/test_real_ai_model_pipeline.py -v',
      '',
      '# Run Frontend Vitest suites',
      'npm --prefix frontend run test -- --run',
      '',
      '# Run Oxlint / ESLint checking across 250+ frontend files',
      'npm --prefix frontend run lint',
      '',
      '# Compile production TypeScript bundle',
      'npm --prefix frontend run build',
    ],
  },
]

export function InstallationGuideSection() {
  const [activeSnippetId, setActiveSnippetId] = useState<string>('backend')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const activeSnippet = SNIPPETS.find((s) => s.id === activeSnippetId) ?? SNIPPETS[1]

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              Deployment & Setup
            </span>
            <span className="text-xs text-slate-500">Zero-Config Reproducibility</span>
          </div>
          <h2 className="mt-1 text-base font-bold text-slate-900">
            Installation, Deployment & Verification Guide
          </h2>
          <p className="text-xs text-slate-500">
            Step-by-step instructions to clone, configure, build, and verify the AI Privacy Firewall locally or via Docker.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <CubeIcon className="h-4 w-4 text-indigo-600" />
          <span>Production Ready</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {SNIPPETS.map((snippet) => {
          const isSelected = snippet.id === activeSnippetId
          return (
            <button
              key={snippet.id}
              type="button"
              onClick={() => setActiveSnippetId(snippet.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition border cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {snippet.id === 'backend' && <ServerIcon className="h-4 w-4" />}
              {snippet.id === 'frontend' && <CommandLineIcon className="h-4 w-4" />}
              {snippet.id === 'docker' && <CubeIcon className="h-4 w-4" />}
              {snippet.id === 'verification' && <WrenchScrewdriverIcon className="h-4 w-4" />}
              {snippet.id === 'prerequisites' && <CubeIcon className="h-4 w-4" />}
              <span>{snippet.label}</span>
            </button>
          )
        })}
      </div>

      {/* Description & Command Code Box */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-900 p-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs">
          <span className="text-slate-400">{activeSnippet.description}</span>
          <button
            type="button"
            onClick={() => handleCopy(activeSnippet.id, activeSnippet.commands.join('\n'))}
            className="flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
          >
            {copiedId === activeSnippet.id ? (
              <>
                <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>

        <pre className="mt-3 overflow-x-auto font-mono text-xs text-slate-200 select-all leading-relaxed">
          {activeSnippet.commands.map((cmd, idx) => (
            <div key={idx} className={cmd.startsWith('#') ? 'text-slate-500 italic' : 'text-emerald-400'}>
              {cmd || ' '}
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}
