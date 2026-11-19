import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { Card } from '../Card'
import type {
  Incident,
  IncidentPriority,
  IncidentStatus,
} from '../../types/incident'

interface CaseManagementPanelProps {
  incident: Incident
  onIncidentUpdated: (updated: Incident) => void
}

const ANALYSTS = [
  'Robert (Security Administrator)',
  'Mike (SecOps Lead)',
  'Emma (Security Auditor)',
  'Analyst On-Call (Tier 1)',
]

export function CaseManagementPanel({
  incident,
  onIncidentUpdated,
}: CaseManagementPanelProps) {
  const [newNote, setNewNote] = useState('')
  const [newTag, setNewTag] = useState('')

  const handleStatusChange = (status: IncidentStatus) => {
    const isClosing = status === 'Closed' || status === 'Resolved'
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)

    const updated: Incident = {
      ...incident,
      status,
      closedTime: isClosing ? now : undefined,
      investigationNotes: [
        `Status updated to "${status}" by analyst.`,
        ...incident.investigationNotes,
      ],
    }
    onIncidentUpdated(updated)
    toast.success(`Incident status changed to ${status}`)
  }

  const handlePriorityChange = (priority: IncidentPriority) => {
    const updated: Incident = {
      ...incident,
      priority,
      investigationNotes: [
        `Priority modified to ${priority}.`,
        ...incident.investigationNotes,
      ],
    }
    onIncidentUpdated(updated)
    toast.info(`Priority updated to ${priority}`)
  }

  const handleAnalystChange = (assignedAnalyst: string) => {
    const updated: Incident = {
      ...incident,
      assignedAnalyst,
      investigationNotes: [
        `Case assigned to ${assignedAnalyst}.`,
        ...incident.investigationNotes,
      ],
    }
    onIncidentUpdated(updated)
    toast.info(`Assigned to ${assignedAnalyst}`)
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    const now = new Date().toLocaleTimeString()
    const updated: Incident = {
      ...incident,
      investigationNotes: [`[${now}] ${newNote.trim()}`, ...incident.investigationNotes],
    }
    onIncidentUpdated(updated)
    setNewNote('')
    toast.success('Investigation note saved')
  }

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTag.trim() || incident.tags.includes(newTag.trim())) return

    const updated: Incident = {
      ...incident,
      tags: [...incident.tags, newTag.trim()],
    }
    onIncidentUpdated(updated)
    setNewTag('')
    toast.success(`Tag "${newTag.trim()}" added`)
  }

  const isClosed = incident.status === 'Closed' || incident.status === 'Resolved'

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Case Management & Incident Governance
          </h3>
          <p className="text-xs text-slate-500">
            Lifecycle workflow controls: analyst assignment, triage priority, status progression, and forensic notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isClosed ? (
            <button
              type="button"
              onClick={() => handleStatusChange('Open')}
              className="cursor-pointer rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              Reopen Incident
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleStatusChange('Resolved')}
              className="cursor-pointer rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
            >
              Resolve & Close Case
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-3">
        {/* Column 1: Analyst Assignment & Priority */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Assigned SOC Lead
            </label>
            <select
              value={incident.assignedAnalyst}
              onChange={(e) => handleAnalystChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ANALYSTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Incident Priority
            </label>
            <select
              value={incident.priority}
              onChange={(e) => handlePriorityChange(e.target.value as IncidentPriority)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="P1-Critical">P1-Critical (Immediate Response)</option>
              <option value="P2-High">P2-High (1 Hour SLA)</option>
              <option value="P3-Medium">P3-Medium (4 Hours SLA)</option>
              <option value="P4-Low">P4-Low (Next Business Day)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Workflow Status
            </label>
            <select
              value={incident.status}
              onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="Contained">Contained</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Column 2: Forensic Tags & Classification */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Case Forensic Tags
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-100 bg-slate-50 min-h-[42px]">
              {incident.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700 shadow-2xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddTag} className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag (e.g. ZeroDay)..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </form>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700 block">Governance SLA Policy</span>
            <p className="mt-1">
              All P1/P2 incidents require forensic sign-off within 4 hours per corporate compliance controls.
            </p>
          </div>
        </div>

        {/* Column 3: Add Investigation Note */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Append Analyst Note
            </label>
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log evidence findings, interviews, or containment actions..."
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="cursor-pointer w-full rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
              >
                Save Investigation Note
              </button>
            </form>
          </div>
        </div>
      </div>
    </Card>
  )
}
