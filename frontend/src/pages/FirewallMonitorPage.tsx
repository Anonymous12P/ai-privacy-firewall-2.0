import {
  ArrowPathIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  LockClosedIcon,
  NoSymbolIcon,
  PauseIcon,
  PlayIcon,
  RadioIcon,
  ShieldCheckIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { FirewallEventCard } from '../components/FirewallEventCard'
import { useFirewallStatus } from '../hooks/useFirewall'
import type {
  FirewallAction,
  FirewallLiveEvent,
  MonitorDepartment,
} from '../types/api'
import {
  DEPARTMENTS,
  generateInitialEvents,
  generateLiveFirewallEvent,
} from '../utils/monitorSimulation'

export function FirewallMonitorPage() {
  // Real-time backend status using React Query
  const { data: statusData } = useFirewallStatus()

  // Live digital clock state updating every 1s
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date())

  // Streaming control: active or paused
  const [isStreaming, setIsStreaming] = useState(true)

  // Live timeline events buffer
  const [events, setEvents] = useState<FirewallLiveEvent[]>(() =>
    generateInitialEvents(6),
  )

  // Track latest generated event ID for highlighting
  const [newestEventId, setNewestEventId] = useState<string | null>(null)

  // Incremental counters for live events during current session
  const [sessionCounts, setSessionCounts] = useState<{
    requests: number
    allowed: number
    warned: number
    restricted: number
    blocked: number
  }>({
    requests: 6,
    allowed: 2,
    warned: 2,
    restricted: 1,
    blocked: 1,
  })

  // Filter states
  const [selectedDecision, setSelectedDecision] = useState<string>('ALL')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Digital Clock Interval (ticks every 1,000 ms)
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(clockTimer)
  }, [])

  // 2. Automatic Live Access Request Generator (generates every 3 seconds)
  useEffect(() => {
    if (!isStreaming) return

    const streamTimer = setInterval(() => {
      const nextEvent = generateLiveFirewallEvent()
      setNewestEventId(nextEvent.id)

      setEvents((prev) => [nextEvent, ...prev.slice(0, 49)]) // Keep latest 50 events

      setSessionCounts((prev) => ({
        requests: prev.requests + 1,
        allowed: prev.allowed + (nextEvent.firewallDecision === 'ALLOW' ? 1 : 0),
        warned: prev.warned + (nextEvent.firewallDecision === 'WARN' ? 1 : 0),
        restricted:
          prev.restricted + (nextEvent.firewallDecision === 'RESTRICT' ? 1 : 0),
        blocked: prev.blocked + (nextEvent.firewallDecision === 'BLOCK' ? 1 : 0),
      }))
    }, 3000)

    return () => clearInterval(streamTimer)
  }, [isStreaming])

  // Manual Trigger to fire an immediate event on demand
  const handleSimulateNow = (tier?: FirewallAction) => {
    const nextEvent = generateLiveFirewallEvent(tier)
    setNewestEventId(nextEvent.id)
    setEvents((prev) => [nextEvent, ...prev.slice(0, 49)])
    setSessionCounts((prev) => ({
      requests: prev.requests + 1,
      allowed: prev.allowed + (nextEvent.firewallDecision === 'ALLOW' ? 1 : 0),
      warned: prev.warned + (nextEvent.firewallDecision === 'WARN' ? 1 : 0),
      restricted:
        prev.restricted + (nextEvent.firewallDecision === 'RESTRICT' ? 1 : 0),
      blocked: prev.blocked + (nextEvent.firewallDecision === 'BLOCK' ? 1 : 0),
    }))
  }

  const handleClearTimeline = () => {
    setEvents([])
    setNewestEventId(null)
  }

  // Combined metrics from backend baseline + live streaming increments
  const baselineRequests = statusData?.total_evaluations ?? 1420
  const baselineBlocked = statusData?.total_blocks ?? 18
  const baselineWarned = statusData?.total_warnings ?? 64
  const baselineRestricted = statusData?.total_restrictions ?? 31
  const baselineAllowed = Math.max(
    baselineRequests - (baselineBlocked + baselineWarned + baselineRestricted),
    1307,
  )

  const totalRequestsToday = baselineRequests + sessionCounts.requests
  const totalAllowed = baselineAllowed + sessionCounts.allowed
  const totalWarned = baselineWarned + sessionCounts.warned
  const totalRestricted = baselineRestricted + sessionCounts.restricted
  const totalBlocked = baselineBlocked + sessionCounts.blocked

  // Compute active unique employees seen in timeline + base staff
  const activeEmployeesCount = useMemo(() => {
    const uniqueInStream = new Set(events.map((e) => e.employeeName)).size
    return Math.max(uniqueInStream + 48, 52)
  }, [events])

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedDecision !== 'ALL' && ev.firewallDecision !== selectedDecision) {
        return false
      }
      if (
        selectedDepartment !== 'ALL' &&
        ev.department !== selectedDepartment
      ) {
        return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesEmployee = ev.employeeName.toLowerCase().includes(query)
        const matchesResource = ev.requestedResource.toLowerCase().includes(query)
        const matchesPolicy = ev.policyTriggered.toLowerCase().includes(query)
        const matchesIndicator = ev.behaviorIndicators.some((ind) =>
          ind.toLowerCase().includes(query),
        )
        if (
          !matchesEmployee &&
          !matchesResource &&
          !matchesPolicy &&
          !matchesIndicator
        ) {
          return false
        }
      }
      return true
    })
  }, [events, selectedDecision, selectedDepartment, searchQuery])

  // Formatted clock display
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* SOC Top Header Banner */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <RadioIcon className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Live Firewall Monitor
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  REAL-TIME
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Security Operations Center (SOC) live telemetry & explainable zero-trust authorization feed.
              </p>
            </div>
          </div>
        </div>

        {/* Live Controls: Time + Stream Toggle + Manual Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Digital Clock */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-2xs">
            <ClockIcon className="h-4 w-4 text-indigo-600 shrink-0" />
            <div className="text-right">
              <div className="font-mono text-sm font-bold text-slate-900 leading-none">
                {formattedTime}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {formattedDate}
              </div>
            </div>
          </div>

          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={() => setIsStreaming(!isStreaming)}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-2xs border ${
              isStreaming
                ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {isStreaming ? (
              <>
                <PauseIcon className="h-4 w-4" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                <span>Resume Stream</span>
              </>
            )}
          </button>

          {/* Simulate Now Button */}
          <button
            type="button"
            onClick={() => handleSimulateNow()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-2xs hover:bg-indigo-100 transition"
          >
            <BoltIcon className="h-4 w-4 text-indigo-600" />
            <span>Simulate Request</span>
          </button>
        </div>
      </div>

      {/* Top Section Metrics Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {/* Metric 1: Firewall Status */}
        <Card className="col-span-2 sm:col-span-2 lg:col-span-2 p-4 bg-linear-to-br from-indigo-50/50 to-white border-indigo-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Firewall Status
            </span>
            <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="font-mono text-lg font-bold text-slate-900">
              {statusData?.status ?? 'HEALTHY'}
            </span>
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-800 uppercase">
              {statusData?.mode ?? 'ENFORCING'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 truncate">
            {isStreaming ? 'Streaming telemetry every 3s' : 'Feed temporarily paused'}
          </p>
        </Card>

        {/* Metric 2: Today's Requests */}
        <Card className="col-span-1 sm:col-span-2 lg:col-span-2 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today's Requests
            </span>
            <ArrowPathIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
            {totalRequestsToday.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            +{sessionCounts.requests} in this SOC session
          </p>
        </Card>

        {/* Metric 3: Total Active Users */}
        <Card className="col-span-1 sm:col-span-2 lg:col-span-2 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Users
            </span>
            <UsersIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
            {activeEmployeesCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Staff in John, Alice, Pavan, Sara, Mike
          </p>
        </Card>

        {/* Metric 4: Allowed (Green) */}
        <Card className="col-span-1 sm:col-span-1 lg:col-span-2 p-4 border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Allowed
            </span>
            <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-700">
            {totalAllowed.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-emerald-600/80 font-medium">
            Risk &lt; 25 (Authorized)
          </p>
        </Card>

        {/* Metric 5: Warned (Yellow) */}
        <Card className="col-span-1 sm:col-span-1 lg:col-span-2 p-4 border-yellow-200 bg-yellow-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-850">
              Warned
            </span>
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-yellow-750">
            {totalWarned.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-yellow-850/80 font-medium">
            Risk 25-50 (Advisory)
          </p>
        </Card>

        {/* Metric 6: Restricted (Orange) */}
        <Card className="col-span-1 sm:col-span-1 lg:col-span-2 p-4 border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Restricted
            </span>
            <LockClosedIcon className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-amber-700">
            {totalRestricted.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-amber-600/80 font-medium">
            Risk 50-75 (Step-up Policy)
          </p>
        </Card>

        {/* Metric 7: Blocked (Red) */}
        <Card className="col-span-1 sm:col-span-1 lg:col-span-2 p-4 border-rose-200 bg-rose-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Blocked
            </span>
            <NoSymbolIcon className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-rose-700">
            {totalBlocked.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-rose-600/80 font-medium">
            Risk &gt; 75 (Perimeter Block)
          </p>
        </Card>

        {/* Metric 8: Enforcement Rate */}
        <Card className="col-span-1 sm:col-span-1 lg:col-span-2 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Threat Ratio
            </span>
            <span className="text-indigo-600 font-mono text-xs font-bold">%</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
            {(
              ((totalBlocked + totalRestricted + totalWarned) /
                Math.max(totalRequestsToday, 1)) *
              100
            ).toFixed(1)}
            %
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Non-routine access rate</p>
        </Card>
      </div>

      {/* Decision Rules Quick Reference Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-600">
            Firewall Automated Decision Rules:
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <strong>Risk &lt; 25</strong>: ALLOW (Green)
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-yellow-800 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              <strong>Risk 25-50</strong>: WARN (Yellow)
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <strong>Risk 50-75</strong>: RESTRICT (Orange)
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <strong>Risk &gt; 75</strong>: BLOCK (Red)
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <Card className="p-4 shadow-2xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Decision Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mr-2">
              <FunnelIcon className="h-3.5 w-3.5" />
              <span>Decision:</span>
            </div>
            {(['ALL', 'BLOCK', 'RESTRICT', 'WARN', 'ALLOW'] as const).map(
              (decision) => (
                <button
                  key={decision}
                  type="button"
                  onClick={() => setSelectedDecision(decision)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    selectedDecision === decision
                      ? decision === 'BLOCK'
                        ? 'bg-rose-600 text-white'
                        : decision === 'RESTRICT'
                          ? 'bg-amber-500 text-white'
                          : decision === 'WARN'
                            ? 'bg-yellow-500 text-slate-900'
                            : decision === 'ALLOW'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {decision}
                </button>
              ),
            )}
          </div>

          {/* Department Filter & Search Input */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Dept:</span>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Departments</option>
                {DEPARTMENTS.map((dept: MonitorDepartment) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-56">
              <input
                type="text"
                placeholder="Search employee, resource, indicator…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1 text-xs shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={handleClearTimeline}
              title="Clear timeline buffer"
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Live Event Timeline Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Live Event Timeline Feed
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 font-mono">
              {filteredEvents.length} events
            </span>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isStreaming ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
              }`}
            />
            <span>{isStreaming ? 'Auto-generating every 3s' : 'Stream Paused'}</span>
          </div>
        </div>

        {/* Security Cards Stream */}
        {filteredEvents.length > 0 ? (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <FirewallEventCard
                key={event.id}
                event={event}
                isNew={event.id === newestEventId}
              />
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
            <RadioIcon className="h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-800">
              No live events match current filters
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Adjust your decision or department filters, or click &quot;Simulate Request&quot; to inject a new event into the timeline.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedDecision('ALL')
                setSelectedDepartment('ALL')
                setSearchQuery('')
              }}
              className="mt-4 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              Reset Filters
            </button>
          </Card>
        )}
      </div>
    </div>
  )
}
