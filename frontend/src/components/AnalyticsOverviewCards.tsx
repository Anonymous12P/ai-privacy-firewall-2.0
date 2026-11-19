import {
  ArrowTrendingUpIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline'
import type { AnalyticsSummary } from '../types/api'
import { MetricCard } from './MetricCard'

export function AnalyticsOverviewCards({
  summary,
  topModel,
}: {
  summary: AnalyticsSummary
  topModel: string
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Total scans" value={summary.total_scans} icon={<QueueListIcon className="h-5 w-5" />} />
      <MetricCard label="Completed scans" value="—" detail="Not exposed by the analytics API" icon={<BoltIcon className="h-5 w-5" />} />
      <MetricCard label="Failed / pending" value="—" detail="Not exposed by the analytics API" icon={<ExclamationTriangleIcon className="h-5 w-5" />} />
      <MetricCard label="Average confidence" value={`${Math.round(summary.average_confidence * 100)}%`} icon={<ArrowTrendingUpIcon className="h-5 w-5" />} />
      <MetricCard label="High-risk predictions" value={summary.total_high_risk_predictions} />
      <MetricCard label="Average risk score" value="—" detail="Not exposed by the analytics API" />
      <MetricCard label="High-risk users" value={summary.top_risky_users.length} />
      <MetricCard label="Top prediction model" value={topModel} />
    </div>
  )
}
