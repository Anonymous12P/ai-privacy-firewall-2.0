import {
  BuildingOffice2Icon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { DepartmentPrivacyRisk, RiskTier, UserPrivacyRisk } from '../../types/riskTuning'

interface PrivacyRiskScoreCardProps {
  users: UserPrivacyRisk[]
  departments: DepartmentPrivacyRisk[]
  selectedUserId: string
  onSelectUser: (userId: string) => void
}

function getTierBadge(tier: RiskTier) {
  switch (tier) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
        icon: ShieldExclamationIcon,
      }
    case 'HIGH':
      return {
        bg: 'bg-orange-50 text-orange-700 border-orange-200',
        dot: 'bg-orange-500',
        icon: ExclamationTriangleIcon,
      }
    case 'MEDIUM':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        icon: ExclamationTriangleIcon,
      }
    case 'LOW':
    default:
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        icon: ShieldCheckIcon,
      }
  }
}

export function PrivacyRiskScoreCard({
  users,
  departments,
  selectedUserId,
  onSelectUser,
}: PrivacyRiskScoreCardProps) {
  const selectedUser = users.find((u) => u.userId === selectedUserId) ?? users[0]!
  const selectedUserTier = getTierBadge(selectedUser.riskTier)
  const TierIcon = selectedUserTier.icon

  return (
    <div className="space-y-6">
      {/* Active User Privacy Risk Score Hero Card */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <img
              src={selectedUser.avatar}
              alt={selectedUser.userName}
              className="h-14 w-14 rounded-2xl border-2 border-indigo-200 object-cover shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{selectedUser.userName}</h3>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-600">
                  {selectedUser.userId}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${selectedUserTier.bg}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${selectedUserTier.dot}`} />
                  {selectedUser.riskTier} TIER
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {selectedUser.role} • <span className="font-semibold text-slate-700">{selectedUser.department}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Subject Selector:</span>
            <div className="flex flex-wrap gap-1">
              {users.map((u) => (
                <button
                  key={u.userId}
                  type="button"
                  onClick={() => onSelectUser(u.userId)}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    u.userId === selectedUserId
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {u.userName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Current Risk Score
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={`text-2xl font-black ${
                  selectedUser.currentRiskScore >= 85
                    ? 'text-red-600'
                    : selectedUser.currentRiskScore >= 66
                    ? 'text-orange-600'
                    : selectedUser.currentRiskScore >= 36
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {selectedUser.currentRiskScore}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Baseline Norm
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">
                {selectedUser.baselineRiskScore}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Adjusted Bayesian Score
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-700">
                {selectedUser.adjustedRiskScore}
              </span>
              <span className="text-xs text-indigo-400">prior wt</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Model Confidence
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">
                {(selectedUser.confidence * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-emerald-600 font-semibold">calibrated</span>
            </div>
          </div>
        </div>

        {/* Narrative Explanation */}
        <div className="mt-4 rounded-xl border border-slate-200/60 bg-slate-50/80 p-3.5">
          <div className="flex items-start gap-2.5">
            <TierIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
            <div className="text-xs">
              <span className="font-bold text-slate-900">Explainable Rationale: </span>
              <span className="text-slate-600">{selectedUser.explanation}</span>
              {selectedUser.activeAnomalies.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">Active Anomalies:</span>
                  {selectedUser.activeAnomalies.map((anom) => (
                    <span
                      key={anom}
                      className="rounded-md bg-red-100/70 px-2 py-0.5 text-[10px] font-bold text-red-800"
                    >
                      {anom}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Department Aggregate Privacy Risk Matrix */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BuildingOffice2Icon className="h-5 w-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Department Privacy Risk Aggregates
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            {departments.length} Digital Twin Organizational Units
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {departments.map((dept) => {
            const tierBadge = getTierBadge(dept.riskTier)
            return (
              <div
                key={dept.department}
                className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-indigo-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate" title={dept.department}>
                    {dept.department}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${tierBadge.dot}`}
                    title={`Tier: ${dept.riskTier}`}
                  />
                </div>

                <div className="mt-2 flex items-baseline gap-1.5">
                  <span
                    className={`text-xl font-black ${
                      dept.avgRiskScore >= 66
                        ? 'text-red-600'
                        : dept.avgRiskScore >= 36
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {dept.avgRiskScore}
                  </span>
                  <span className="text-[10px] text-slate-400">avg</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                  <span className="flex items-center gap-1">
                    <UserGroupIcon className="h-3 w-3 text-slate-400" />
                    {dept.userCount}
                  </span>
                  {dept.overrideActive ? (
                    <span className="rounded bg-indigo-50 px-1 text-[9px] font-bold text-indigo-700">
                      OVERRIDE
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Standard</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
