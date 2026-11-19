import type { FirewallAction, MonitorEmployee, MonitorOperation } from '../types/api'
import type {
  BehavioralIndicatorState,
  FeatureContribution,
  LiveEngineEvaluation,
  ModelPrediction,
} from '../types/engine'
import {
  EMPLOYEES,
  EMPLOYEE_AFFINITY,
  getDecisionForRisk,
} from './monitorSimulation'

export const MODEL_BENCHMARK_DATA = [
  {
    model: 'DecisionTree',
    accuracy: 99.28,
    precision: 99.32,
    recall: 99.28,
    f1Score: 99.30,
  },
  {
    model: 'RandomForest',
    accuracy: 99.32,
    precision: 99.18,
    recall: 99.32,
    f1Score: 99.24,
  },
  {
    model: 'XGBoost',
    accuracy: 99.32,
    precision: 99.09,
    recall: 99.32,
    f1Score: 99.14,
  },
  {
    model: 'LogisticRegression',
    accuracy: 99.32,
    precision: 98.65,
    recall: 99.32,
    f1Score: 98.99,
  },
]

export const GLOBAL_FEATURE_IMPORTANCE_DATA = [
  { feature: 'Removable USB Storage', importance: 32.8, key: 'indicator.usb', rank: 1 },
  { feature: 'Behavioral Risk Index', importance: 21.5, key: 'behavioral_risk_index', rank: 2 },
  { feature: 'Mass Data Download', importance: 16.4, key: 'indicator.session', rank: 3 },
  { feature: 'Failed Login Velocity', importance: 11.2, key: 'indicator.login', rank: 4 },
  { feature: 'Impossible Travel Anomaly', importance: 8.7, key: 'indicator.geo', rank: 5 },
  { feature: 'Off-Hours Authentication', importance: 5.1, key: 'indicator.time', rank: 6 },
  { feature: 'HTTP API Burst Spikes', importance: 2.8, key: 'indicator.http', rank: 7 },
  { feature: 'Outbound Email Relay', importance: 1.5, key: 'indicator.email', rank: 8 },
]

let evaluationCounter = 2000

function pickRandom<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}

function roundToDecimals(val: number, decimals = 1): number {
  const factor = Math.pow(10, decimals)
  return Math.round(val * factor) / factor
}

export function generateLiveEngineEvaluation(forcedTier?: FirewallAction): LiveEngineEvaluation {
  evaluationCounter += 1
  const employee: MonitorEmployee = pickRandom(EMPLOYEES)
  const affinity = EMPLOYEE_AFFINITY[employee]

  // Decide tier with realistic SOC probability if not forced
  let tier = forcedTier
  if (!tier) {
    const roll = Math.random() * 100
    if (roll < 45) tier = 'ALLOW'
    else if (roll < 70) tier = 'WARN'
    else if (roll < 88) tier = 'RESTRICT'
    else tier = 'BLOCK'
  }

  // Setup indicators according to tier
  let usb = false
  let offHours = false
  let failedLogins = false
  let httpBurst = false
  let emailAttachment = false
  let massDownload = false
  let vpn = Math.random() < 0.4
  let byod = false
  let impossibleTravel = false

  let riskScore = 12
  let operation: MonitorOperation = pickRandom(['Read', 'Write'] as const)
  let resource = pickRandom(affinity.primaryResources)
  let device = affinity.defaultDevice

  if (tier === 'BLOCK') {
    riskScore = Math.floor(Math.random() * 23) + 77 // 77 - 99
    usb = Math.random() < 0.8
    massDownload = true
    impossibleTravel = Math.random() < 0.6
    failedLogins = Math.random() < 0.7
    offHours = Math.random() < 0.8
    emailAttachment = Math.random() < 0.5
    byod = Math.random() < 0.6
    operation = pickRandom(['Bulk Download', 'Export', 'Delete'] as const)
    resource = pickRandom([
      'Customer Database',
      'Medical Records',
      'Finance Database',
      'Source Code Repository',
      'Payroll Records',
    ] as const)
    if (byod) device = 'BYOD Personal Laptop (Unmanaged)'
  } else if (tier === 'RESTRICT') {
    riskScore = Math.floor(Math.random() * 25) + 51 // 51 - 75
    massDownload = Math.random() < 0.6
    offHours = Math.random() < 0.7
    failedLogins = Math.random() < 0.5
    byod = Math.random() < 0.5
    httpBurst = Math.random() < 0.4
    operation = pickRandom(['Bulk Download', 'Export', 'Modify'] as const)
    resource = pickRandom(affinity.primaryResources)
    if (byod) device = 'BYOD Device (Restricted Profile)'
  } else if (tier === 'WARN') {
    riskScore = Math.floor(Math.random() * 26) + 25 // 25 - 50
    offHours = Math.random() < 0.7
    httpBurst = Math.random() < 0.6
    byod = Math.random() < 0.4
    operation = pickRandom(['Read', 'Modify', 'Write'] as const)
    resource = pickRandom(affinity.primaryResources)
    if (byod) device = 'BYOD Mobile Device'
  } else {
    // ALLOW: Risk < 25
    riskScore = Math.floor(Math.random() * 22) + 2 // 2 - 23
    vpn = true
  }

  const decision = getDecisionForRisk(riskScore)

  // Construct 9 behavioral indicator states
  const indicatorStates: BehavioralIndicatorState[] = [
    {
      id: 'usb',
      name: 'Removable USB Storage',
      active: usb,
      severity: usb ? 'critical' : 'low',
      weight: 32.8,
      description: usb
        ? 'Mass USB storage device mounted during access window'
        : 'No removable hardware attached',
    },
    {
      id: 'offHours',
      name: 'Off-Hours Authentication',
      active: offHours,
      severity: offHours ? 'medium' : 'low',
      weight: 5.1,
      description: offHours
        ? 'Access request observed outside subject standard shift schedule'
        : 'Request within standard business hours',
    },
    {
      id: 'failedLogins',
      name: 'Failed Login Velocity',
      active: failedLogins,
      severity: failedLogins ? 'high' : 'low',
      weight: 11.2,
      description: failedLogins
        ? 'Multiple consecutive failed authentication challenges in prior 1h'
        : 'Single clean MFA authentication',
    },
    {
      id: 'httpBurst',
      name: 'HTTP Request Burst Spikes',
      active: httpBurst,
      severity: httpBurst ? 'medium' : 'low',
      weight: 2.8,
      description: httpBurst
        ? 'Elevated REST request velocity exceeding 80 calls/min'
        : 'Request rate within baseline tolerance',
    },
    {
      id: 'emailAttachment',
      name: 'Outbound Email Relay',
      active: emailAttachment,
      severity: emailAttachment ? 'high' : 'low',
      weight: 1.5,
      description: emailAttachment
        ? 'Simultaneous outbound SMTP data relay detected'
        : 'No external mail transmission active',
    },
    {
      id: 'massDownload',
      name: 'Mass Data Download',
      active: massDownload,
      severity: massDownload ? 'critical' : 'low',
      weight: 16.4,
      description: massDownload
        ? 'Bulk download payload volume exceeding 500 MB limit'
        : 'Standard single-record transaction volume',
    },
    {
      id: 'vpn',
      name: 'Corporate Ingress VPN',
      active: vpn,
      severity: 'low',
      weight: 1.0,
      description: vpn
        ? 'Encrypted WireGuard corporate VPN tunnel active'
        : 'Direct internal mesh connection',
    },
    {
      id: 'byod',
      name: 'Unmanaged BYOD Device',
      active: byod,
      severity: byod ? 'medium' : 'low',
      weight: 4.5,
      description: byod
        ? 'Device missing required enterprise MDM compliance certificate'
        : 'Hardware verified MDM enrolled workstation',
    },
    {
      id: 'impossibleTravel',
      name: 'Impossible Physical Travel',
      active: impossibleTravel,
      severity: impossibleTravel ? 'critical' : 'low',
      weight: 8.7,
      description: impossibleTravel
        ? 'Consecutive session ingress across 2,400 km in under 20 minutes'
        : 'Ingress IP geography consistent with assigned office location',
    },
  ]

  // Model-level predictions based on riskScore
  const isThreat = riskScore >= 50
  const isWarn = riskScore >= 25 && riskScore < 50

  const models: {
    logisticRegression: ModelPrediction
    decisionTree: ModelPrediction
    randomForest: ModelPrediction
    xgboost: ModelPrediction
  } = {
    logisticRegression: {
      name: 'LogisticRegression',
      prediction: isThreat ? 'THREAT' : 'ALLOW',
      confidence: roundToDecimals(0.88 + Math.random() * 0.1, 3),
      riskScore: Math.max(0, Math.min(100, riskScore + (Math.floor(Math.random() * 7) - 3))),
    },
    decisionTree: {
      name: 'DecisionTree',
      prediction: isThreat || isWarn ? 'THREAT' : 'ALLOW',
      confidence: roundToDecimals(0.92 + Math.random() * 0.07, 3),
      riskScore: Math.max(0, Math.min(100, riskScore + (Math.floor(Math.random() * 5) - 2))),
    },
    randomForest: {
      name: 'RandomForest',
      prediction: isThreat ? 'THREAT' : 'ALLOW',
      confidence: roundToDecimals(0.94 + Math.random() * 0.05, 3),
      riskScore: Math.max(0, Math.min(100, riskScore + (Math.floor(Math.random() * 5) - 2))),
    },
    xgboost: {
      name: 'XGBoost',
      prediction: isThreat ? 'THREAT' : 'ALLOW',
      confidence: roundToDecimals(0.95 + Math.random() * 0.04, 3),
      riskScore: Math.max(0, Math.min(100, riskScore + (Math.floor(Math.random() * 4) - 2))),
    },
  }

  // Feature Contributions (SHAP Attribution)
  const featureContributions: FeatureContribution[] = []
  if (usb) {
    featureContributions.push({
      feature: 'indicator.usb',
      label: 'USB Attached Mass Storage',
      weight: 0.38,
      impact: 'positive',
    })
  }
  if (massDownload) {
    featureContributions.push({
      feature: 'indicator.session',
      label: 'Mass Bulk Data Read Volume',
      weight: 0.28,
      impact: 'positive',
    })
  }
  if (impossibleTravel) {
    featureContributions.push({
      feature: 'indicator.geo',
      label: 'Impossible Geographic Ingress',
      weight: 0.22,
      impact: 'positive',
    })
  }
  if (failedLogins) {
    featureContributions.push({
      feature: 'indicator.login',
      label: 'Authentication Challenge Failures',
      weight: 0.17,
      impact: 'positive',
    })
  }
  if (offHours) {
    featureContributions.push({
      feature: 'indicator.time',
      label: 'Off-Hours Activity Deviation',
      weight: 0.11,
      impact: 'positive',
    })
  }
  if (byod) {
    featureContributions.push({
      feature: 'indicator.byod',
      label: 'Unmanaged Personal Hardware',
      weight: 0.09,
      impact: 'positive',
    })
  }
  if (httpBurst) {
    featureContributions.push({
      feature: 'indicator.http',
      label: 'Elevated REST Request Spike',
      weight: 0.07,
      impact: 'positive',
    })
  }
  if (vpn) {
    featureContributions.push({
      feature: 'indicator.vpn',
      label: 'Verified Corporate VPN Tunnel',
      weight: -0.15,
      impact: 'negative',
    })
  }
  if (featureContributions.length === 0) {
    featureContributions.push({
      feature: 'baseline.verified',
      label: 'Clean Role-Based Baseline Alignment',
      weight: -0.42,
      impact: 'negative',
    })
  }

  // Natural Language Explainability Rationale
  let explanationSummary = ''
  const reasons: string[] = []

  if (decision === 'BLOCK') {
    explanationSummary = `Access request by ${employee} to ${resource} was BLOCKED by the AI Privacy Firewall because multiple high-severity exfiltration vectors were detected concurrently.`
    if (usb) reasons.push('Removable USB mass storage device connected concurrent with privileged data transfer.')
    if (massDownload) reasons.push(`Data read velocity on ${resource} exceeds standard organizational quota by 480%.`)
    if (impossibleTravel) reasons.push('Geographic location anomaly indicates physical impossible travel between consecutive IP ingresses.')
    if (failedLogins) reasons.push('Multiple failed credential validations preceded this elevated operation.')
    if (reasons.length === 0) reasons.push('Multiple composite behavioral indicators exceeded the critical threat containment threshold.')
  } else if (decision === 'RESTRICT') {
    explanationSummary = `Access request by ${employee} to ${resource} was RESTRICTED under step-up governance policies to prevent potential unauthorized disclosure.`
    if (massDownload) reasons.push('Elevated download size warrants bandwidth throttling and real-time session recording.')
    if (offHours) reasons.push('Access requested outside employee primary working shift.')
    if (byod) reasons.push('Endpoint device is missing corporate MDM compliance certificates.')
    if (reasons.length === 0) reasons.push('Elevated risk score requires stepped-up secondary authentication challenge.')
  } else if (decision === 'WARN') {
    explanationSummary = `Access request by ${employee} to ${resource} was ALLOWED WITH WARNING ADVISORY due to minor statistical deviations from historical behavioral baseline.`
    if (httpBurst) reasons.push('High-frequency API requests observed across the service gateway.')
    if (offHours) reasons.push('Activity initiated outside standard business hours.')
    if (byod) reasons.push('Session originates from secondary non-MDM device profile.')
    if (reasons.length === 0) reasons.push('Access requested outside standard user behavioral baseline.')
  } else {
    explanationSummary = `Access request by ${employee} to ${resource} was fully ALLOWED. All behavioral telemetry, identity signatures, and device postures match the authorized baseline.`
    reasons.push('Identity and FIDO2 MFA credentials verified successfully.')
    reasons.push(`Target operation '${operation}' conforms to the assigned ${affinity.department} role.`)
    reasons.push('Zero anomalous exfiltration or hardware indicators detected.')
  }

  // Policies and enforcement actions
  let policyName = 'Standard Enterprise Role-Based Access Baseline'
  let enforcementAction = 'Permit normal transaction and log audit telemetry'
  let quarantineRequired = false

  if (decision === 'BLOCK') {
    policyName = 'Strict Mass Exfiltration Prevention Policy'
    enforcementAction = 'Immediate socket termination, credential lock, and SOC incident dispatch'
    quarantineRequired = true
  } else if (decision === 'RESTRICT') {
    policyName = 'Restricted PII Query & Export Governance Policy'
    enforcementAction = 'Impose read rate limiting, session watermark, and step-up biometric prompt'
  } else if (decision === 'WARN') {
    policyName = 'Off-Hours Resource Access Advisory Rule'
    enforcementAction = 'Notify SOC channel, issue advisory warning header, and flag session'
  }

  const now = new Date()
  const timestamp = now.toLocaleTimeString('en-US', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })

  return {
    id: `EVAL-${now.getTime().toString(36).toUpperCase()}-${evaluationCounter}`,
    timestamp,
    isoTimestamp: now.toISOString(),
    employee,
    department: affinity.department,
    resource,
    operation,
    device,
    ipAddress: `10.240.${Math.floor(Math.random() * 20) + 1}.${Math.floor(Math.random() * 250) + 1}`,
    indicators: {
      usb,
      offHours,
      failedLogins,
      httpBurst,
      emailAttachment,
      massDownload,
      vpn,
      byod,
      impossibleTravel,
    },
    indicatorStates,
    anomalyScore: roundToDecimals(riskScore / 100, 3),
    models,
    aggregatedThreatScore: riskScore,
    ensembleConfidence: roundToDecimals(0.92 + Math.random() * 0.06, 3),
    featureContributions,
    explanationSummary,
    reasons,
    decision,
    policyName,
    enforcementAction,
    quarantineRequired,
  }
}
