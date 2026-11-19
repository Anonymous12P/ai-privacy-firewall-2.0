import {
  ArrowDownTrayIcon,
  CameraIcon,
  EyeIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline'

interface ScreenshotModeControlsProps {
  isScreenshotMode: boolean
  onToggleScreenshotMode: () => void
  onOpenExportModal: () => void
}

export function ScreenshotModeControls({
  isScreenshotMode,
  onToggleScreenshotMode,
  onOpenExportModal,
}: ScreenshotModeControlsProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
          <CameraIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-900">
            Presentation & Screenshot Toolbar
          </h3>
          <p className="text-[11px] text-slate-500">
            Adjust visual density for academic slides, executive presentations, or PDF publication.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Toggle Screenshot / Presentation Layout */}
        <button
          type="button"
          onClick={onToggleScreenshotMode}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition border cursor-pointer ${
            isScreenshotMode
              ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          <EyeIcon className="h-4 w-4" />
          <span>{isScreenshotMode ? 'Exit Presentation Mode' : 'Presentation View'}</span>
        </button>

        {/* Browser Print / PDF */}
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer"
        >
          <PrinterIcon className="h-4 w-4 text-slate-600" />
          <span>Print / PDF</span>
        </button>

        {/* Export Data Modal */}
        <button
          type="button"
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
        >
          <ArrowDownTrayIcon className="h-4 w-4 text-indigo-700" />
          <span>Export Data</span>
        </button>
      </div>
    </div>
  )
}
