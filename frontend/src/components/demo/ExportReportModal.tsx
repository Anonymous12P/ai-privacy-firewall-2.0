import { useState } from 'react'
import {
  ArrowDownTrayIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  TableCellsIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import {
  exportAllScenariosAsJson,
  exportScenarioAsJson,
  exportScenariosAsCsv,
  type DemoScenario,
} from '../../utils/demoScenarioData'

interface ExportReportModalProps {
  isOpen: boolean
  onClose: () => void
  activeScenario: DemoScenario
}

function generateTimestamp(): number {
  return Date.now()
}

export function ExportReportModal({
  isOpen,
  onClose,
  activeScenario,
}: ExportReportModalProps) {
  const [exportFormat, setExportFormat] = useState<'json-active' | 'json-all' | 'csv'>('json-active')
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const getContent = (): string => {
    switch (exportFormat) {
      case 'json-active':
        return exportScenarioAsJson(activeScenario)
      case 'json-all':
        return exportAllScenariosAsJson()
      case 'csv':
        return exportScenariosAsCsv()
    }
  }

  const content = getContent()

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const isCsv = exportFormat === 'csv'
    const ts = generateTimestamp()
    const filename = isCsv
      ? `firewall-evaluation-scenarios-${ts}.csv`
      : `firewall-${exportFormat === 'json-active' ? activeScenario.id : 'all-scenarios'}-${ts}.json`
    const mimeType = isCsv ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;'

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
              <DocumentTextIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Export Firewall Evaluation Telemetry
              </h3>
              <p className="text-xs text-slate-500">
                Download structured data artifacts for reproducibility, auditing, or research reporting.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Format Selector Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setExportFormat('json-active')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition border cursor-pointer ${
              exportFormat === 'json-active'
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span>Active Scenario (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setExportFormat('json-all')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition border cursor-pointer ${
              exportFormat === 'json-all'
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span>All 8 Scenarios (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setExportFormat('csv')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition border cursor-pointer ${
              exportFormat === 'csv'
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TableCellsIcon className="h-4 w-4" />
            <span>Tabular Summary (CSV)</span>
          </button>
        </div>

        {/* Preview Code Box */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1.5">
            <span>Payload Preview</span>
            <span>{content.split('\n').length} lines</span>
          </div>
          <pre className="h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-emerald-400 select-all">
            {content}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            {copied ? <CheckIcon className="h-4 w-4 text-emerald-600" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Payload'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition cursor-pointer shadow-xs"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Download Artifact File</span>
          </button>
        </div>
      </div>
    </div>
  )
}
