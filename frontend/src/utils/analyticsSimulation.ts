import type {
  AIResearchInfo,
  AnalyticsFilters,
  AnalyticsSnapshot,
  ConfusionMatrixData,
  DepartmentRiskRecord,
  ExecutiveKPIs,
  LocalExplanationEvent,
  ModelBenchmarkMetric,
  ModelDriftData,
  PolicyEffectivenessRecord,
  RadarFeatureImportance,
  ShapFeatureGlobal,
  ThreatDistribution,
  TimelinePoint,
} from '../types/analytics'

export const BASE_RESEARCH_INFO: AIResearchInfo = {
  currentModel: 'Ensemble (Random Forest + XGBoost)',
  trainingDataset: 'CERT Insider Threat Dataset r4.2',
  trainingSamples: 331147,
  validationSamples: 82787,
  inferenceTime: '3.82 ms',
  lastRetrained: '2026-11-14 02:00 UTC',
}

export const INITIAL_MODEL_BENCHMARKS: ModelBenchmarkMetric[] = [
  {
    model: 'Random Forest',
    accuracy: 99.35,
    precision: 99.21,
    recall: 99.34,
    f1Score: 99.27,
    rocAuc: 99.88,
  },
  {
    model: 'XGBoost',
    accuracy: 99.32,
    precision: 99.12,
    recall: 99.30,
    f1Score: 99.21,
    rocAuc: 99.84,
  },
  {
    model: 'Decision Tree',
    accuracy: 99.24,
    precision: 99.18,
    recall: 99.22,
    f1Score: 99.20,
    rocAuc: 99.65,
  },
  {
    model: 'Logistic Regression',
    accuracy: 99.18,
    precision: 98.72,
    recall: 99.15,
    f1Score: 98.93,
    rocAuc: 99.41,
  },
]

export const BASE_GLOBAL_SHAP: ShapFeatureGlobal[] = [
  { feature: 'USB Connected', key: 'usb', shapValue: 0.342, percentage: 32.8, direction: 'positive', color: '#ef4444' },
  { feature: 'Risk Score', key: 'riskScore', shapValue: 0.224, percentage: 21.5, direction: 'positive', color: '#f97316' },
  { feature: 'Mass Download', key: 'massDownload', shapValue: 0.171, percentage: 16.4, direction: 'positive', color: '#eab308' },
  { feature: 'Failed Logins', key: 'failedLogins', shapValue: 0.117, percentage: 11.2, direction: 'positive', color: '#f43f5e' },
  { feature: 'Impossible Travel', key: 'impossibleTravel', shapValue: 0.091, percentage: 8.7, direction: 'positive', color: '#8b5cf6' },
  { feature: 'Off Hours', key: 'afterHours', shapValue: 0.053, percentage: 5.1, direction: 'positive', color: '#6366f1' },
  { feature: 'HTTP Burst', key: 'httpBurst', shapValue: 0.029, percentage: 2.8, direction: 'positive', color: '#06b6d4' },
  { feature: 'Email Attachment', key: 'email', shapValue: 0.016, percentage: 1.5, direction: 'positive', color: '#14b8a6' },
  { feature: 'BYOD', key: 'byod', shapValue: 0.012, percentage: 1.1, direction: 'positive', color: '#a855f7' },
  { feature: 'VPN', key: 'vpn', shapValue: -0.058, percentage: 5.5, direction: 'negative', color: '#10b981' },
]

export const BASE_RADAR_IMPORTANCE: RadarFeatureImportance[] = [
  { indicator: 'USB', importance: 92, fullMark: 100 },
  { indicator: 'BYOD', importance: 48, fullMark: 100 },
  { indicator: 'HTTP Burst', importance: 62, fullMark: 100 },
  { indicator: 'Failed Login', importance: 78, fullMark: 100 },
  { indicator: 'VPN', importance: 35, fullMark: 100 },
  { indicator: 'Off Hours', importance: 71, fullMark: 100 },
  { indicator: 'Email', importance: 54, fullMark: 100 },
  { indicator: 'Risk Score', importance: 88, fullMark: 100 },
  { indicator: 'Mass Download', importance: 82, fullMark: 100 },
]

export const LOCAL_EXPLANATION_EVENTS: LocalExplanationEvent[] = [
  {
    id: 'evt-sec-8841',
    timestamp: 'Just now',
    employee: 'John (Finance Analyst)',
    department: 'Finance',
    resource: 'Finance Database (Postgres)',
    decision: 'BLOCK',
    riskScore: 89,
    threatScore: 92,
    baseValue: 12.5,
    finalScore: 92.0,
    waterfallSteps: [
      { name: 'Baseline Risk', impact: 12.5, runningTotal: 12.5, type: 'base' },
      { name: 'USB Connected', impact: 36.0, runningTotal: 48.5, type: 'positive' },
      { name: 'Off-Hours Login', impact: 18.5, runningTotal: 67.0, type: 'positive' },
      { name: 'Mass Download', impact: 15.0, runningTotal: 82.0, type: 'positive' },
      { name: 'HTTP Burst Spike', impact: 12.5, runningTotal: 94.5, type: 'positive' },
      { name: 'Verified VPN', impact: -2.5, runningTotal: 92.0, type: 'negative' },
      { name: 'Threat Score', impact: 92.0, runningTotal: 92.0, type: 'result' },
    ],
    topPositive: [
      { feature: 'Removable USB Storage Drive', contribution: 36.0, percentage: 44.2 },
      { feature: 'Off-Hours Authentication (02:14 AM)', contribution: 18.5, percentage: 22.7 },
      { feature: 'Bulk Export / Mass Download', contribution: 15.0, percentage: 18.4 },
    ],
    topNegative: [
      { feature: 'Encrypted Corporate VPN Tunnel', contribution: -2.5, percentage: 100 },
    ],
  },
  {
    id: 'evt-sec-8842',
    timestamp: '1 min ago',
    employee: 'Sara (Medical Researcher)',
    department: 'Healthcare',
    resource: 'Medical Records Archive (MongoDB)',
    decision: 'RESTRICT',
    riskScore: 68,
    threatScore: 71,
    baseValue: 12.5,
    finalScore: 71.0,
    waterfallSteps: [
      { name: 'Baseline Risk', impact: 12.5, runningTotal: 12.5, type: 'base' },
      { name: 'BYOD Laptop', impact: 24.0, runningTotal: 36.5, type: 'positive' },
      { name: 'Impossible Travel', impact: 28.5, runningTotal: 65.0, type: 'positive' },
      { name: 'Failed Logins (x3)', impact: 9.0, runningTotal: 74.0, type: 'positive' },
      { name: 'MDM Enrolled Profile', impact: -3.0, runningTotal: 71.0, type: 'negative' },
      { name: 'Threat Score', impact: 71.0, runningTotal: 71.0, type: 'result' },
    ],
    topPositive: [
      { feature: 'Impossible Travel Anomaly (US -> SG in 45m)', contribution: 28.5, percentage: 46.3 },
      { feature: 'Unregistered BYOD Endpoint', contribution: 24.0, percentage: 39.0 },
      { feature: 'Repeated Failed Passwords (x3)', contribution: 9.0, percentage: 14.6 },
    ],
    topNegative: [
      { feature: 'Active MDM Profile Validation', contribution: -3.0, percentage: 100 },
    ],
  },
  {
    id: 'evt-sec-8843',
    timestamp: '3 mins ago',
    employee: 'Mike (Infrastructure Engineer)',
    department: 'Infrastructure',
    resource: 'Production Kubernetes Cluster',
    decision: 'WARN',
    riskScore: 44,
    threatScore: 46,
    baseValue: 12.5,
    finalScore: 46.0,
    waterfallSteps: [
      { name: 'Baseline Risk', impact: 12.5, runningTotal: 12.5, type: 'base' },
      { name: 'HTTP Burst Spikes', impact: 21.0, runningTotal: 33.5, type: 'positive' },
      { name: 'Off-Hours Deployment', impact: 16.5, runningTotal: 50.0, type: 'positive' },
      { name: 'Hardware 2FA Key', impact: -4.0, runningTotal: 46.0, type: 'negative' },
      { name: 'Threat Score', impact: 46.0, runningTotal: 46.0, type: 'result' },
    ],
    topPositive: [
      { feature: 'High-Velocity HTTP Burst Spikes', contribution: 21.0, percentage: 56.0 },
      { feature: 'Off-Hours Cluster Manifest Sync', contribution: 16.5, percentage: 44.0 },
    ],
    topNegative: [
      { feature: 'FIDO2 Hardware Key Verified', contribution: -4.0, percentage: 100 },
    ],
  },
  {
    id: 'evt-sec-8844',
    timestamp: '5 mins ago',
    employee: 'Pavan (Senior Software Engineer)',
    department: 'Engineering',
    resource: 'GitLab Enterprise Monorepo',
    decision: 'ALLOW',
    riskScore: 14,
    threatScore: 12,
    baseValue: 12.5,
    finalScore: 12.0,
    waterfallSteps: [
      { name: 'Baseline Risk', impact: 12.5, runningTotal: 12.5, type: 'base' },
      { name: 'Corporate Device', impact: -4.5, runningTotal: 8.0, type: 'negative' },
      { name: 'Static VPN IP', impact: -3.0, runningTotal: 5.0, type: 'negative' },
      { name: 'Routine Pull Request', impact: 7.0, runningTotal: 12.0, type: 'positive' },
      { name: 'Threat Score', impact: 12.0, runningTotal: 12.0, type: 'result' },
    ],
    topPositive: [
      { feature: 'Monorepo Code Fetch', contribution: 7.0, percentage: 100 },
    ],
    topNegative: [
      { feature: 'Corporate Managed MacBook Pro', contribution: -4.5, percentage: 60 },
      { feature: 'Trusted Dedicated VPN IP', contribution: -3.0, percentage: 40 },
    ],
  },
]

export const BASE_POLICY_EFFECTIVENESS: PolicyEffectivenessRecord[] = [
  {
    id: 'pol-exfil-01',
    name: 'Strict Removable Media Data Exfiltration Prevention',
    category: 'Exfiltration',
    matches: 284,
    blocks: 279,
    falsePositives: 2,
    executionTimeMs: 1.8,
    effectivenessRate: 98.2,
  },
  {
    id: 'pol-hipaa-02',
    name: 'HIPAA Patient Privacy & Clinical Data Isolation Policy',
    category: 'Compliance',
    matches: 196,
    blocks: 182,
    falsePositives: 3,
    executionTimeMs: 2.1,
    effectivenessRate: 92.9,
  },
  {
    id: 'pol-source-05',
    name: 'Proprietary Source Code Repository Integrity Policy',
    category: 'IP Protection',
    matches: 148,
    blocks: 139,
    falsePositives: 1,
    executionTimeMs: 2.4,
    effectivenessRate: 93.9,
  },
  {
    id: 'pol-offhours-04',
    name: 'Off-Hours High-Velocity API Burst Advisory',
    category: 'Threat Defense',
    matches: 114,
    blocks: 76,
    falsePositives: 4,
    executionTimeMs: 2.7,
    effectivenessRate: 66.7,
  },
  {
    id: 'pol-byod-03',
    name: 'Unmanaged BYOD Perimeter Observation Rule',
    category: 'Zero Trust',
    matches: 98,
    blocks: 34,
    falsePositives: 5,
    executionTimeMs: 3.1,
    effectivenessRate: 34.7,
  },
]

export const BASE_DEPARTMENTS: Array<{ name: string; baseRisk: number; baseIncidents: number }> = [
  { name: 'Finance', baseRisk: 42.6, baseIncidents: 38 },
  { name: 'Healthcare', baseRisk: 38.2, baseIncidents: 29 },
  { name: 'Infrastructure', baseRisk: 31.4, baseIncidents: 24 },
  { name: 'Engineering', baseRisk: 22.8, baseIncidents: 19 },
  { name: 'Human Resources', baseRisk: 18.5, baseIncidents: 12 },
  { name: 'Security Operations', baseRisk: 14.1, baseIncidents: 6 },
]

export function generate24HourTimeline(totalRequests: number, totalThreats: number, totalBlocks: number): TimelinePoint[] {
  const points: TimelinePoint[] = []
  const rawFactors = [
    0.015, 0.01, 0.008, 0.008, 0.012, 0.025, // 00-05
    0.045, 0.065, 0.085, 0.095, 0.09, 0.075,  // 06-11
    0.07, 0.08, 0.085, 0.08, 0.065, 0.05,    // 12-17
    0.035, 0.025, 0.02, 0.018, 0.015, 0.012,  // 18-23
  ]
  const sumRaw = rawFactors.reduce((a, b) => a + b, 0)
  const hourlyFactors = rawFactors.map((f) => f / sumRaw)

  let runningReq = 0
  let runningThreats = 0
  let runningBlocks = 0

  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0') + ':00'
    const factor = hourlyFactors[i] ?? 1 / 24

    if (i === 23) {
      const req = Math.max(0, totalRequests - runningReq)
      const threats = Math.max(0, totalThreats - runningThreats)
      const blocks = Math.max(0, totalBlocks - runningBlocks)
      points.push({ time: hour, requests: req, threats, blocks })
    } else {
      const req = Math.round(totalRequests * factor)
      const threats = Math.max(0, Math.min(totalThreats - runningThreats, Math.round(totalThreats * factor)))
      const blocks = Math.max(0, Math.min(totalBlocks - runningBlocks, Math.round(totalBlocks * factor)))
      runningReq += req
      runningThreats += threats
      runningBlocks += blocks
      points.push({ time: hour, requests: req, threats, blocks })
    }
  }

  return points
}

export function computeConfusionMatrix(totalThreats: number, totalRequests: number): ConfusionMatrixData {
  // Enterprise certified benchmark: ~99.3% accuracy, low FPR
  const actualPositives = totalThreats
  const actualNegatives = Math.max(10, totalRequests - totalThreats)

  // TP: ~99.3% of actual threats detected
  const tp = Math.round(actualPositives * 0.993)
  const fn = Math.max(0, actualPositives - tp)

  // FP: ~0.35% of actual normal
  const fp = Math.max(1, Math.round(actualNegatives * 0.0035))
  const tn = Math.max(1, actualNegatives - fp)

  const total = tp + tn + fp + fn
  const accuracy = Number((((tp + tn) / total) * 100).toFixed(2))
  const precision = Number(((tp / (tp + fp)) * 100).toFixed(2))
  const recall = Number(((tp / (tp + fn)) * 100).toFixed(2))
  const f1Score = Number(((2 * (precision * recall)) / (precision + recall)).toFixed(2))

  return {
    tp,
    tn,
    fp,
    fn,
    total,
    accuracy,
    precision,
    recall,
    f1Score,
  }
}

let tickCount = 0

/**
 * Creates an internally coherent AnalyticsSnapshot that updates smoothly every 3 seconds.
 */
export function generateAnalyticsSnapshot(filters?: AnalyticsFilters): AnalyticsSnapshot {
  tickCount++

  // Small organic variations
  const reqBase = 1942 + (tickCount * 4) + Math.floor(Math.sin(tickCount) * 6)
  const threatBase = 142 + Math.floor(tickCount * 0.4) + (tickCount % 5 === 0 ? 1 : 0)
  const blockBase = 31 + Math.floor(tickCount * 0.15)
  const fpRate = +(0.42 + (Math.sin(tickCount * 0.5) * 0.04)).toFixed(2)
  const accuracy = +(99.32 + (Math.cos(tickCount * 0.3) * 0.03)).toFixed(2)
  const avgRisk = +(24.8 + (Math.sin(tickCount * 0.2) * 0.6)).toFixed(1)
  const avgTime = +(4.2 + (Math.sin(tickCount * 0.7) * 0.3)).toFixed(2)
  const policyMatches = 840 + (tickCount * 2)

  // Filter multipliers
  let filterMultiplier = 1.0
  if (filters?.department && filters.department !== 'All') filterMultiplier *= 0.35
  if (filters?.model && filters.model !== 'All') filterMultiplier *= 0.75
  if (filters?.risk && filters.risk !== 'All') filterMultiplier *= 0.45
  if (filters?.decision && filters.decision !== 'All') filterMultiplier *= 0.3
  if (filters?.timeRange === '1h') filterMultiplier *= 0.08
  if (filters?.timeRange === '7d') filterMultiplier *= 6.2
  if (filters?.timeRange === '30d') filterMultiplier *= 24.5

  const todayRequests = Math.max(10, Math.round(reqBase * filterMultiplier))
  const threatsDetected = Math.max(1, Math.round(threatBase * filterMultiplier))
  const blockedRequests = Math.max(0, Math.round(blockBase * filterMultiplier))
  const adjustedMatches = Math.max(1, Math.round(policyMatches * filterMultiplier))

  const kpis: ExecutiveKPIs = {
    todayRequests,
    threatsDetected,
    blockedRequests,
    falsePositiveRate: fpRate,
    modelAccuracy: accuracy,
    avgRiskScore: avgRisk,
    avgDecisionTimeMs: avgTime,
    policyMatches: adjustedMatches,
    delta: {
      requests: +12.4,
      threats: -3.8,
      blocks: +2.1,
      fpRate: -0.05,
      accuracy: +0.04,
      riskScore: -1.2,
      time: -0.15,
      policies: +8.6,
    },
  }

  // Model benchmarks with slight fluctuation
  const modelPerformance = INITIAL_MODEL_BENCHMARKS.map((m, idx) => {
    const shift = (Math.sin(tickCount + idx) * 0.03)
    return {
      ...m,
      accuracy: +(m.accuracy + shift).toFixed(2),
      precision: +(m.precision + shift * 0.8).toFixed(2),
      recall: +(m.recall + shift * 0.5).toFixed(2),
      f1Score: +(m.f1Score + shift * 0.6).toFixed(2),
      rocAuc: +(m.rocAuc + shift * 0.2).toFixed(2),
    }
  })

  // Confusion matrix
  const confusionMatrix = computeConfusionMatrix(threatsDetected, todayRequests)

  // Threat distribution: Critical, High, Medium, Low
  const critCount = Math.max(1, Math.round(threatsDetected * 0.18))
  const highCount = Math.max(1, Math.round(threatsDetected * 0.32))
  const medCount = Math.max(1, Math.round(threatsDetected * 0.35))
  const lowCount = Math.max(0, threatsDetected - (critCount + highCount + medCount))

  const threatDistribution: ThreatDistribution[] = [
    { level: 'Critical', count: critCount, percentage: Math.round((critCount / threatsDetected) * 100), color: '#ef4444' },
    { level: 'High', count: highCount, percentage: Math.round((highCount / threatsDetected) * 100), color: '#f97316' },
    { level: 'Medium', count: medCount, percentage: Math.round((medCount / threatsDetected) * 100), color: '#eab308' },
    { level: 'Low', count: lowCount, percentage: Math.round((lowCount / threatsDetected) * 100), color: '#10b981' },
  ]

  // Department Risk Heatmap
  const departmentRisk: DepartmentRiskRecord[] = BASE_DEPARTMENTS.map((dept, idx) => {
    const riskFluct = +(dept.baseRisk + Math.sin(tickCount + idx) * 1.5).toFixed(1)
    const incidents = Math.max(1, Math.round(dept.baseIncidents * (filterMultiplier > 2 ? filterMultiplier * 0.5 : 1)))
    const blocked = Math.round(incidents * 0.65)
    const warnings = Math.round(incidents * 0.35)

    let riskCategory: DepartmentRiskRecord['riskCategory'] = 'Low'
    if (riskFluct >= 40) riskCategory = 'Critical'
    else if (riskFluct >= 30) riskCategory = 'High'
    else if (riskFluct >= 20) riskCategory = 'Medium'

    return {
      department: dept.name,
      avgRisk: riskFluct,
      blocked,
      warnings,
      incidents,
      riskCategory,
    }
  }).sort((a, b) => b.avgRisk - a.avgRisk)

  // Timeline
  const timeline = generate24HourTimeline(todayRequests, threatsDetected, blockedRequests)

  // Policy effectiveness
  const policyEffectiveness = BASE_POLICY_EFFECTIVENESS.map((p) => {
    const mult = Math.max(0.2, filterMultiplier)
    const matches = Math.round(p.matches * mult)
    const blocks = Math.round(p.blocks * mult)
    const fps = Math.max(0, Math.round(p.falsePositives * (mult > 1 ? 1.5 : 1)))
    const effectivenessRate = matches > 0 ? Number(((blocks / matches) * 100).toFixed(1)) : 100.0
    return {
      ...p,
      matches,
      blocks,
      falsePositives: fps,
      effectivenessRate,
    }
  })

  // Model Drift
  const yesterdayAccuracy = 99.35
  const todayAccuracy = accuracy
  const diff = +(todayAccuracy - yesterdayAccuracy).toFixed(2)
  let driftStatus: ModelDriftData['status'] = 'Stable'
  if (diff < -0.15) driftStatus = 'Retraining Needed'
  else if (diff < -0.05) driftStatus = 'Slight Drift'

  const modelDrift: ModelDriftData = {
    yesterdayAccuracy,
    todayAccuracy,
    difference: diff,
    status: driftStatus,
    driftMetric: 'Population Stability Index (PSI = 0.018)',
    lastDriftCheck: 'Continuous (eval window: 24h)',
  }

  // Highest risk department
  const highestRiskDept = departmentRisk[0]?.department ?? 'Finance'
  const bestModel = modelPerformance.reduce((prev, curr) => (curr.accuracy > prev.accuracy ? curr : prev)).model

  const executiveSummary = `Today the firewall processed ${todayRequests.toLocaleString()} access requests. ${threatsDetected.toLocaleString()} were classified as suspicious. ${blockedRequests.toLocaleString()} were blocked. ${bestModel} achieved the highest accuracy. USB storage and After-Hours Login were the strongest predictors. ${highestRiskDept} department exhibited the highest average risk. Overall platform health remains excellent.`

  return {
    timestamp: new Date().toLocaleTimeString(),
    kpis,
    modelPerformance,
    confusionMatrix,
    globalShap: BASE_GLOBAL_SHAP,
    localEvents: LOCAL_EXPLANATION_EVENTS,
    radarImportance: BASE_RADAR_IMPORTANCE,
    threatDistribution,
    departmentRisk,
    timeline,
    policyEffectiveness,
    modelDrift,
    executiveSummary,
    researchInfo: BASE_RESEARCH_INFO,
  }
}

/**
 * Frontend Exporters
 */
export function exportAnalyticsToJSON(snapshot: AnalyticsSnapshot): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `ai-privacy-firewall-analytics-${Date.now()}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

export function exportAnalyticsToCSV(snapshot: AnalyticsSnapshot): void {
  const rows: string[] = []
  rows.push('Metric,Value')
  rows.push(`Today Requests,${snapshot.kpis.todayRequests}`)
  rows.push(`Threats Detected,${snapshot.kpis.threatsDetected}`)
  rows.push(`Blocked Requests,${snapshot.kpis.blockedRequests}`)
  rows.push(`False Positive Rate,${snapshot.kpis.falsePositiveRate}%`)
  rows.push(`Model Accuracy,${snapshot.kpis.modelAccuracy}%`)
  rows.push(`Average Risk Score,${snapshot.kpis.avgRiskScore}`)
  rows.push(`Average Decision Time,${snapshot.kpis.avgDecisionTimeMs} ms`)
  rows.push(`Policy Matches,${snapshot.kpis.policyMatches}`)
  rows.push('')
  rows.push('Department,Average Risk,Blocked,Warnings,Incidents,Risk Category')
  snapshot.departmentRisk.forEach((dept) => {
    rows.push(`"${dept.department}",${dept.avgRisk},${dept.blocked},${dept.warnings},${dept.incidents},${dept.riskCategory}`)
  })
  rows.push('')
  rows.push('Model,Accuracy %,Precision %,Recall %,F1-Score %,ROC-AUC %')
  snapshot.modelPerformance.forEach((m) => {
    rows.push(`"${m.model}",${m.accuracy},${m.precision},${m.recall},${m.f1Score},${m.rocAuc}`)
  })

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', csvContent)
  downloadAnchor.setAttribute('download', `ai-privacy-firewall-analytics-${Date.now()}.csv`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

export function exportAnalyticsToPDF(): void {
  window.print()
}
