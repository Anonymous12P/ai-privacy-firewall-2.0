/**
 * Simulation engine for Sprint 13: Privacy Risk Scoring & Adaptive Threshold Tuning
 * Explainable Adaptive AI Privacy Firewall
 */

import type {
  CalibrationBin,
  CalibrationMetrics,
  DecisionBoundaryPoint,
  DecisionBoundarySample,
  DecompositionFactor,
  DepartmentPrivacyRisk,
  DepartmentThresholdOverride,
  FirewallDecision,
  FirewallThresholds,
  ProjectedImpact,
  RiskTier,
  RiskTrendDataPoint,
  RiskTrendState,
  RiskTuningSnapshot,
  RiskTuningSummaryData,
  ScoreDecomposition,
  SensitivityScenario,
  ThresholdChangeRecord,
  UserPrivacyRisk,
  UserRiskProgression,
} from '../types/riskTuning'

export function computeRiskTier(score: number): RiskTier {
  if (score >= 85) return 'CRITICAL'
  if (score >= 66) return 'HIGH'
  if (score >= 36) return 'MEDIUM'
  return 'LOW'
}

export function evaluateDecision(
  score: number,
  thresholds: Pick<FirewallThresholds, 'allowThreshold' | 'warnThreshold' | 'restrictThreshold' | 'blockThreshold'>,
): FirewallDecision {
  if (score <= thresholds.allowThreshold) return 'ALLOW'
  if (score <= thresholds.warnThreshold) return 'WARN'
  if (score <= thresholds.restrictThreshold) return 'RESTRICT'
  return 'BLOCK'
}

// 6 Core Digital Twin Departments
const RAW_DEPARTMENTS: Array<{
  department: string
  baselineScore: number
  userCount: number
  activeThreats: number
  strictness: 'Standard' | 'Elevated' | 'Maximum Lockdown'
  overrideActive: boolean
  standard: string
  rationale: string
  customAllow: number
  customWarn: number
  customRestrict: number
  customBlock: number
}> = [
  {
    department: 'Finance',
    baselineScore: 38,
    userCount: 28,
    activeThreats: 2,
    strictness: 'Elevated',
    overrideActive: true,
    standard: 'SOX §404 / GLBA',
    rationale: 'Stricter threshold on ledger and payroll databases to prevent unrecorded cash journal tampering.',
    customAllow: 30,
    customWarn: 55,
    customRestrict: 75,
    customBlock: 85,
  },
  {
    department: 'Healthcare',
    baselineScore: 34,
    userCount: 35,
    activeThreats: 1,
    strictness: 'Maximum Lockdown',
    overrideActive: true,
    standard: 'HIPAA §164.312',
    rationale: 'Zero-tolerance policy on electronic Protected Health Information (ePHI) bulk exfiltration.',
    customAllow: 25,
    customWarn: 48,
    customRestrict: 70,
    customBlock: 80,
  },
  {
    department: 'Human Resources',
    baselineScore: 28,
    userCount: 22,
    activeThreats: 1,
    strictness: 'Elevated',
    overrideActive: true,
    standard: 'GDPR Art. 9 & PII Privacy',
    rationale: 'Elevated scrutiny on employee salary bands, performance evaluations, and banking details.',
    customAllow: 32,
    customWarn: 60,
    customRestrict: 78,
    customBlock: 88,
  },
  {
    department: 'Engineering',
    baselineScore: 22,
    userCount: 94,
    activeThreats: 0,
    strictness: 'Standard',
    overrideActive: false,
    standard: 'SOC 2 Type II / Git Bastion',
    rationale: 'Balanced developer ergonomics while maintaining commit-signature cryptographic enforcement.',
    customAllow: 38,
    customWarn: 68,
    customRestrict: 84,
    customBlock: 92,
  },
  {
    department: 'Infrastructure',
    baselineScore: 26,
    userCount: 46,
    activeThreats: 1,
    strictness: 'Standard',
    overrideActive: false,
    standard: 'FedRAMP High / CIS Benchmarks',
    rationale: 'Multi-cloud Kubernetes cluster admin roles with bastion jump-host session verification.',
    customAllow: 35,
    customWarn: 65,
    customRestrict: 82,
    customBlock: 90,
  },
  {
    department: 'Security Operations',
    baselineScore: 16,
    userCount: 25,
    activeThreats: 0,
    strictness: 'Standard',
    overrideActive: false,
    standard: 'NIST CSF 2.0 / Zero Trust',
    rationale: 'High-privilege SOC analyst roles authorized for forensic triage and quarantine actions.',
    customAllow: 40,
    customWarn: 70,
    customRestrict: 85,
    customBlock: 95,
  },
]

// 6 Core Digital Twin Employees
const RAW_USERS: Array<{
  userId: string
  userName: string
  department: string
  role: string
  baseScore: number
  avatar: string
  trajectory: RiskTrendState
  anomalies: string[]
  explanation: string
}> = [
  {
    userId: 'EMP-1001',
    userName: 'Pavan',
    department: 'Engineering',
    role: 'Senior Software Engineer',
    baseScore: 14,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    trajectory: 'STABLE',
    anomalies: [],
    explanation: 'Compliant with developer baseline; authorized git repo access within standard working hours.',
  },
  {
    userId: 'EMP-1002',
    userName: 'John',
    department: 'Finance',
    role: 'Finance Analyst',
    baseScore: 78,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    trajectory: 'SPIKING',
    anomalies: ['USB Mass Storage', 'High API Burst', 'Off-hours Query'],
    explanation: 'Unusual bulk export on payroll database followed by an unencrypted USB insertion event.',
  },
  {
    userId: 'EMP-1003',
    userName: 'Alice',
    department: 'Human Resources',
    role: 'HR Director',
    baseScore: 54,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    trajectory: 'RISING',
    anomalies: ['After-hours Login', 'Mass File Download'],
    explanation: 'Off-hours access to executive compensation archives; elevated download volume detected.',
  },
  {
    userId: 'EMP-1004',
    userName: 'Sara',
    department: 'Healthcare',
    role: 'Clinical Research Lead',
    baseScore: 42,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    trajectory: 'STABILIZING',
    anomalies: ['Unrecognized Geo IP'],
    explanation: 'Clinical trial patient records accessed via regional research partner VPN; risk normalizing.',
  },
  {
    userId: 'EMP-1005',
    userName: 'Mike',
    department: 'Infrastructure',
    role: 'DevOps Lead',
    baseScore: 28,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    trajectory: 'DECLINING',
    anomalies: ['Multiple Failed Logins'],
    explanation: 'Resolved expired bastion SSH keys; login failure rate returned to zero baseline.',
  },
  {
    userId: 'EMP-1006',
    userName: 'Robert',
    department: 'Security Operations',
    role: 'SOC Incident Analyst',
    baseScore: 18,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    trajectory: 'STABLE',
    anomalies: [],
    explanation: 'Routine perimeter inspection and threat hunting query execution; low risk signature.',
  },
]

/**
 * Calculates projected decision impacts for given thresholds
 */
export function computeProjectedImpact(
  allow: number,
  warn: number,
  restrict: number,
  block: number,
): ProjectedImpact {
  // Model empirical beta distribution approximation of enterprise access requests
  // Normal operations cluster between 10-35, occasional anomalies spread into 50-95
  const allowRate = Math.min(95, Math.max(40, Number((allow * 1.8 + 12).toFixed(1))))
  const remaining = 100 - allowRate

  // Dynamic distribution according to interval spans
  const warnSpan = Math.max(5, warn - allow)
  const restrictSpan = Math.max(5, restrict - warn)
  const totalSpan = warnSpan + restrictSpan + Math.max(5, 100 - restrict)

  const warnRate = Number(((remaining * warnSpan) / totalSpan).toFixed(1))
  const restrictRate = Number(((remaining * restrictSpan) / totalSpan).toFixed(1))
  const blockRate = Number((100 - allowRate - warnRate - restrictRate).toFixed(1))

  // Stricter (lower) block/restrict thresholds slightly increase FPR, while reducing FNR
  const fpRate = Number(Math.max(0.4, Math.min(4.5, (100 - block) * 0.15 + (40 - allow) * 0.05)).toFixed(2))
  const fnRate = Number(Math.max(0.2, Math.min(3.0, (block - 75) * 0.06)).toFixed(2))

  return {
    allowRate,
    warnRate,
    restrictRate,
    blockRate,
    falsePositiveRate: fpRate,
    falseNegativeRate: fnRate,
  }
}

/**
 * Generates 10 explainable decomposition factors for a user
 */
export function generateScoreDecomposition(
  userId: string,
  userName: string,
  totalScore: number,
): ScoreDecomposition {
  const isHighRisk = totalScore >= 66
  const isMedRisk = totalScore >= 36 && totalScore < 66

  const factors: DecompositionFactor[] = [
    {
      name: 'USB Mass Storage Activity',
      category: 'Peripheral Device',
      rawValue: isHighRisk ? '1 Removable Drive Attached (Write/Copy)' : '0 Devices Attached',
      weight: 0.22,
      points: isHighRisk ? 24 : 0,
      shapValue: isHighRisk ? 0.38 : -0.15,
      direction: isHighRisk ? 'INCREASES_RISK' : 'DECREASES_RISK',
      description: isHighRisk
        ? 'Unsanctioned USB mass storage device connected during bulk record access.'
        : 'Zero removable storage mounts observed; device port access restricted.',
    },
    {
      name: 'File Access Volume Spike',
      category: 'Data Exfiltration',
      rawValue: isHighRisk ? '1,420 MB transferred (+380% vs baseline)' : isMedRisk ? '420 MB transferred (+45%)' : '45 MB (Within baseline)',
      weight: 0.18,
      points: isHighRisk ? 18 : isMedRisk ? 12 : 2,
      shapValue: isHighRisk ? 0.28 : isMedRisk ? 0.14 : -0.08,
      direction: isHighRisk || isMedRisk ? 'INCREASES_RISK' : 'NEUTRAL',
      description: isHighRisk
        ? 'High volume file read/export exceeding historical 99th percentile.'
        : 'File system throughput conforms to daily departmental activity.',
    },
    {
      name: 'After-Hours Access Anomaly',
      category: 'Temporal Behavior',
      rawValue: isHighRisk ? '02:45 AM (Non-standard shift)' : isMedRisk ? '10:15 PM (Weekend)' : '10:15 AM (Standard Shift)',
      weight: 0.14,
      points: isHighRisk ? 14 : isMedRisk ? 10 : 1,
      shapValue: isHighRisk ? 0.22 : isMedRisk ? 0.11 : -0.12,
      direction: isHighRisk || isMedRisk ? 'INCREASES_RISK' : 'DECREASES_RISK',
      description: isHighRisk
        ? 'Access requested outside active enterprise working hours (02:45 AM local).'
        : 'Request timestamp matches regular scheduled business operating window.',
    },
    {
      name: 'HTTP / API Request Burst Rate',
      category: 'Network Activity',
      rawValue: isHighRisk ? '320 req/min (Spike detected)' : isMedRisk ? '120 req/min' : '35 req/min (Normal)',
      weight: 0.12,
      points: isHighRisk ? 12 : isMedRisk ? 8 : 2,
      shapValue: isHighRisk ? 0.19 : isMedRisk ? 0.08 : -0.05,
      direction: isHighRisk || isMedRisk ? 'INCREASES_RISK' : 'NEUTRAL',
      description: isHighRisk
        ? 'Rapid programmatic script API invocation detected on protected endpoints.'
        : 'Standard interactive web UI browser telemetry recorded.',
    },
    {
      name: 'Consecutive Failed Logins',
      category: 'Authentication',
      rawValue: isHighRisk ? '4 consecutive failed attempts' : isMedRisk ? '2 failed attempts' : '0 failures',
      weight: 0.10,
      points: isHighRisk ? 10 : isMedRisk ? 6 : 0,
      shapValue: isHighRisk ? 0.15 : isMedRisk ? 0.07 : -0.10,
      direction: isHighRisk || isMedRisk ? 'INCREASES_RISK' : 'DECREASES_RISK',
      description: isHighRisk
        ? 'Multiple credential errors preceded current authenticated session.'
        : 'Clean authentication sequence on primary hardware token.',
    },
    {
      name: 'Role-to-Resource Sensitivity Mismatch',
      category: 'Authorization',
      rawValue: isHighRisk ? 'Cross-department ledger read (Level 4)' : isMedRisk ? 'Elevated HR salary tier' : 'Sanctioned role resource',
      weight: 0.09,
      points: isHighRisk ? 9 : isMedRisk ? 7 : 1,
      shapValue: isHighRisk ? 0.12 : isMedRisk ? 0.06 : -0.06,
      direction: isHighRisk || isMedRisk ? 'INCREASES_RISK' : 'NEUTRAL',
      description: isHighRisk
        ? 'Employee role does not typically access this asset category in normal workflows.'
        : 'Requested resource is within role access specification matrix.',
    },
    {
      name: 'Geographic Deviation & IP Trust',
      category: 'Perimeter Location',
      rawValue: isHighRisk ? 'Foreign ISP IP (Deviation: 94.2%)' : isMedRisk ? 'Domestic Commercial VPN' : 'Corporate HQ Subnet (10.0.4.0/24)',
      weight: 0.08,
      points: isHighRisk ? 8 : isMedRisk ? 6 : 1,
      shapValue: isHighRisk ? 0.11 : isMedRisk ? 0.05 : -0.09,
      direction: isHighRisk || isMedRisk ? 'INCREASES_RISK' : 'DECREASES_RISK',
      description: isHighRisk
        ? 'Egress IP originates from untrusted external ASN not on corporate whitelist.'
        : 'Originating IP matches corporate office leased line and zero-trust proxy.',
    },
    {
      name: 'Device Health & MDM Compliance',
      category: 'Endpoint Security',
      rawValue: isHighRisk ? 'BYOD Device (BitLocker Unknown)' : isMedRisk ? 'Managed Laptop (OS update pending)' : 'Fully Enrolled Corporate MDM',
      weight: 0.07,
      points: isHighRisk ? 6 : isMedRisk ? 4 : 0,
      shapValue: isHighRisk ? 0.08 : isMedRisk ? 0.04 : -0.07,
      direction: isHighRisk || isMedRisk ? 'INCREASES_RISK' : 'DECREASES_RISK',
      description: isHighRisk
        ? 'Missing corporate endpoint management profile and EDR telemetry agent.'
        : 'CrowdStrike Falcon active and disk encryption fully enforced.',
    },
    {
      name: 'Email External Exfiltration Signal',
      category: 'Messaging',
      rawValue: isHighRisk ? '3 attachments sent to personal domain' : isMedRisk ? '1 external recipient email' : '0 external messages',
      weight: 0.05,
      points: isHighRisk ? 5 : isMedRisk ? 3 : 0,
      shapValue: isHighRisk ? 0.06 : isMedRisk ? 0.02 : -0.04,
      direction: isHighRisk || isMedRisk ? 'INCREASES_RISK' : 'NEUTRAL',
      description: isHighRisk
        ? 'DLP gateway flagged email attachment transfer to non-company recipient.'
        : 'No unverified external message routing detected during session.',
    },
    {
      name: 'Session Duration Anomaly',
      category: 'Session State',
      rawValue: isHighRisk ? 'Continuous 14.5 hr session' : isMedRisk ? '9.8 hr session' : '3.2 hr active session',
      weight: 0.05,
      points: isHighRisk ? 4 : isMedRisk ? 2 : 1,
      shapValue: isHighRisk ? 0.04 : isMedRisk ? 0.01 : -0.03,
      direction: isHighRisk || isMedRisk ? 'INCREASES_RISK' : 'NEUTRAL',
      description: isHighRisk
        ? 'Excessively prolonged login without standard re-authentication challenge.'
        : 'Session age within configured 8-hour max idle threshold.',
    },
  ]

  // Calculate sum of factor points and adjust base score so base + points = totalScore
  const factorSum = factors.reduce((acc, f) => acc + f.points, 0)
  const baseScore = Math.max(5, Math.min(30, totalScore - factorSum + (isHighRisk ? 12 : 6)))

  return {
    userId,
    userName,
    baseScore,
    totalScore,
    factors,
    summaryExplanation: isHighRisk
      ? `User ${userName} presents a CRITICAL risk score of ${totalScore} primarily driven by USB Mass Storage insertion (+24 pts), bulk data export (+18 pts), and an off-hours access anomaly (+14 pts). Immediate containment or MFA step-up is recommended.`
      : isMedRisk
      ? `User ${userName} has an elevated risk score of ${totalScore} attributed to off-hours login (+10 pts) and moderate file transfer volume (+12 pts). Monitored under adaptive WARN threshold.`
      : `User ${userName} maintains a low risk score of ${totalScore}. Behavioral attributes align with established departmental baseline with no anomalous peripheral or exfiltration indicators.`,
  }
}

/**
 * Generates 6 Sensitivity Analysis Scenarios
 */
export function generateSensitivityScenarios(
  thresholds: FirewallThresholds,
): SensitivityScenario[] {
  return [
    {
      id: 'SENS-01',
      factorName: 'USB Mass Storage Device',
      category: 'Peripherals',
      baselineValue: 'Disabled / 0 Devices',
      perturbedValue: 'Enabled (Write Mount)',
      riskScoreDelta: +38,
      initialDecision: evaluateDecision(24, thresholds),
      newDecision: evaluateDecision(24 + 38, thresholds),
      sensitivityRating: 'Extreme',
      policyImpactDescription:
        'Connecting a removable drive instantly raises risk by 38 points, transitioning typical traffic from ALLOW to RESTRICT or BLOCK.',
    },
    {
      id: 'SENS-02',
      factorName: 'After-Hours Access Window',
      category: 'Temporal',
      baselineValue: '10:00 AM (Working Hours)',
      perturbedValue: '02:30 AM (Night Shift)',
      riskScoreDelta: +24,
      initialDecision: evaluateDecision(20, thresholds),
      newDecision: evaluateDecision(20 + 24, thresholds),
      sensitivityRating: 'High',
      policyImpactDescription:
        'Night-shift queries elevate risk by 24 points due to reduced human supervision and anomalous historical frequency.',
    },
    {
      id: 'SENS-03',
      factorName: 'Failed Login Sequence',
      category: 'Authentication',
      baselineValue: '0 Failures',
      perturbedValue: '5 Consecutive Failures',
      riskScoreDelta: +32,
      initialDecision: evaluateDecision(18, thresholds),
      newDecision: evaluateDecision(18 + 32, thresholds),
      sensitivityRating: 'High',
      policyImpactDescription:
        'A burst of authentication failures indicates credential stuffing or brute force, triggering step-up WARN/RESTRICT enforcement.',
    },
    {
      id: 'SENS-04',
      factorName: 'File Access Export Volume',
      category: 'Exfiltration',
      baselineValue: '50 MB (Typical Daily)',
      perturbedValue: '1,200 MB (Mass Export)',
      riskScoreDelta: +35,
      initialDecision: evaluateDecision(22, thresholds),
      newDecision: evaluateDecision(22 + 35, thresholds),
      sensitivityRating: 'Extreme',
      policyImpactDescription:
        'A 24x jump in data export volume triggers the data leakage threshold, causing immediate quarantine restriction.',
    },
    {
      id: 'SENS-05',
      factorName: 'Device Management Trust',
      category: 'Endpoint Security',
      baselineValue: 'Corporate MDM (Encrypted)',
      perturbedValue: 'Unmanaged Personal BYOD',
      riskScoreDelta: +21,
      initialDecision: evaluateDecision(16, thresholds),
      newDecision: evaluateDecision(16 + 21, thresholds),
      sensitivityRating: 'Moderate',
      policyImpactDescription:
        'Unenrolled endpoints lack compliance validation, applying a 21-point risk penalty and enforcing strict read-only access.',
    },
    {
      id: 'SENS-06',
      factorName: 'Geographic Deviation (Impossible Travel)',
      category: 'Network Perimeter',
      baselineValue: 'San Francisco HQ (Subnet 10.0.x)',
      perturbedValue: 'Eastern Europe Proxy (Tor/VPN)',
      riskScoreDelta: +42,
      initialDecision: evaluateDecision(25, thresholds),
      newDecision: evaluateDecision(25 + 42, thresholds),
      sensitivityRating: 'Extreme',
      policyImpactDescription:
        'An impossible travel anomaly (IP change within 30 minutes) drives risk delta of +42, forcing an immediate BLOCK decision.',
    },
  ]
}

/**
 * Generates calibration metrics and reliability curve
 */
export function generateCalibrationMetrics(
  jitter: number,
): CalibrationMetrics {
  const curve: CalibrationBin[] = [
    { confidenceDecile: 0.1, observedAccuracy: 0.12, idealAccuracy: 0.1, sampleCount: 140 },
    { confidenceDecile: 0.2, observedAccuracy: 0.21, idealAccuracy: 0.2, sampleCount: 220 },
    { confidenceDecile: 0.3, observedAccuracy: 0.31, idealAccuracy: 0.3, sampleCount: 310 },
    { confidenceDecile: 0.4, observedAccuracy: 0.39, idealAccuracy: 0.4, sampleCount: 420 },
    { confidenceDecile: 0.5, observedAccuracy: 0.52, idealAccuracy: 0.5, sampleCount: 580 },
    { confidenceDecile: 0.6, observedAccuracy: 0.61, idealAccuracy: 0.6, sampleCount: 750 },
    { confidenceDecile: 0.7, observedAccuracy: 0.72, idealAccuracy: 0.7, sampleCount: 940 },
    { confidenceDecile: 0.8, observedAccuracy: 0.81, idealAccuracy: 0.8, sampleCount: 1250 },
    { confidenceDecile: 0.9, observedAccuracy: 0.89, idealAccuracy: 0.9, sampleCount: 1680 },
    { confidenceDecile: 1.0, observedAccuracy: 0.97, idealAccuracy: 1.0, sampleCount: 2400 },
  ]

  return {
    confidenceCalibration: Number((95.4 + jitter * 0.4).toFixed(1)),
    brierScore: Number((0.078 + Math.abs(jitter) * 0.004).toFixed(3)),
    thresholdAccuracy: Number((96.8 + jitter * 0.3).toFixed(1)),
    falsePositiveRate: Number((1.8 + Math.abs(jitter) * 0.2).toFixed(2)),
    falseNegativeRate: Number((0.9 + Math.abs(jitter) * 0.1).toFixed(2)),
    decisionConsistency: Number((98.6 + jitter * 0.2).toFixed(1)),
    calibrationCurve: curve,
  }
}

/**
 * Generates decision boundary points along 0-100 spectrum
 */
export function generateDecisionBoundaryPoints(
  thresholds: FirewallThresholds,
): DecisionBoundaryPoint[] {
  const points: DecisionBoundaryPoint[] = []

  for (let score = 0; score <= 100; score += 2) {
    // Two-component Gaussian mixture: normal cluster (mean=20, sd=10) and anomaly cluster (mean=72, sd=12)
    const normalDensity = Math.exp(-0.5 * Math.pow((score - 20) / 10, 2)) * 85
    const anomalyDensity = Math.exp(-0.5 * Math.pow((score - 72) / 12, 2)) * 28
    const density = Number((normalDensity + anomalyDensity).toFixed(1))

    points.push({
      riskScore: score,
      density,
      cumulative: Number((Math.min(100, score * 1.05)).toFixed(1)),
      zone: evaluateDecision(score, thresholds),
    })
  }

  return points
}

/**
 * Generates active request samples mapped into decision zones
 */
export function generateActiveRequestSamples(
  thresholds: FirewallThresholds,
): DecisionBoundarySample[] {
  const samples = [
    { id: 'REQ-9101', userName: 'Pavan', department: 'Engineering', resource: 'GitLab /firewall-core', riskScore: 16, time: '10:42 AM' },
    { id: 'REQ-9102', userName: 'Sara', department: 'Healthcare', resource: 'Clinical Biometrics S3', riskScore: 44, time: '10:41 AM' },
    { id: 'REQ-9103', userName: 'John', department: 'Finance', resource: 'Payroll Ledger Database', riskScore: 82, time: '10:40 AM' },
    { id: 'REQ-9104', userName: 'Alice', department: 'Human Resources', resource: 'Exec Salary Benchmarks', riskScore: 58, time: '10:38 AM' },
    { id: 'REQ-9105', userName: 'Mike', department: 'Infrastructure', resource: 'Bastion SSH Cluster', riskScore: 31, time: '10:35 AM' },
    { id: 'REQ-9106', userName: 'Robert', department: 'Security Operations', resource: 'SIEM Log Vault', riskScore: 21, time: '10:33 AM' },
    { id: 'REQ-9107', userName: 'Guest Contractor', department: 'Engineering', resource: 'Production AWS IAM', riskScore: 94, time: '10:30 AM' },
  ]

  return samples.map((s) => ({
    ...s,
    decision: evaluateDecision(s.riskScore, thresholds),
  }))
}

/**
 * Generates 14-day risk progression trajectory per user
 */
export function generateUserRiskProgressions(
  users: UserPrivacyRisk[],
  thresholds: FirewallThresholds,
): Record<string, UserRiskProgression> {
  const progressions: Record<string, UserRiskProgression> = {}

  users.forEach((u) => {
    const history: RiskTrendDataPoint[] = []
    const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Today']

    let current = u.baselineRiskScore

    days.forEach((day, idx) => {
      if (u.userId === 'EMP-1002') {
        // John: Spiking trend
        if (idx < 8) current = 28 + (idx % 3) * 2
        else if (idx < 11) current = 45 + (idx - 8) * 8
        else current = 76 + (idx - 11) * 3
      } else if (u.userId === 'EMP-1003') {
        // Alice: Rising trend
        current = 24 + idx * 2.3
      } else if (u.userId === 'EMP-1004') {
        // Sara: Stabilizing
        if (idx < 6) current = 62 - idx * 2
        else current = 42 + (idx % 2) * 2
      } else if (u.userId === 'EMP-1005') {
        // Mike: Declining
        current = Math.max(20, 52 - idx * 2.4)
      } else {
        // Pavan & Robert: Stable
        current = u.baselineRiskScore + ((idx * 3) % 4) - 2
      }

      const scoreRounded = Math.max(5, Math.min(98, Math.round(current)))
      history.push({
        timestamp: `2026-11-${String(idx + 1).padStart(2, '0')}`,
        day,
        riskScore: scoreRounded,
        baseline: u.baselineRiskScore,
        departmentAvg: u.department === 'Finance' ? 42 : u.department === 'Engineering' ? 22 : 32,
        blockThreshold: thresholds.blockThreshold,
        eventMarker:
          u.userId === 'EMP-1002' && idx === 11
            ? 'USB Device Inserted'
            : u.userId === 'EMP-1003' && idx === 9
            ? 'Off-hours Query'
            : u.userId === 'EMP-1005' && idx === 4
            ? 'Key Expired'
            : undefined,
      })
    })

    progressions[u.userId] = {
      userId: u.userId,
      userName: u.userName,
      department: u.department,
      trajectoryState:
        u.userId === 'EMP-1002'
          ? 'SPIKING'
          : u.userId === 'EMP-1003'
          ? 'RISING'
          : u.userId === 'EMP-1004'
          ? 'STABILIZING'
          : u.userId === 'EMP-1005'
          ? 'DECLINING'
          : 'STABLE',
      currentScore: u.currentRiskScore,
      historyPoints: history,
      narrative:
        u.userId === 'EMP-1002'
          ? 'Rapid 3-day risk escalation from 32 to 78 following multiple anomalous bulk queries on payroll ledgers.'
          : u.userId === 'EMP-1003'
          ? 'Steady upward drift driven by after-hours compensation audits; remains below RESTRICT boundary.'
          : u.userId === 'EMP-1004'
          ? 'High initial risk post-VPN IP migration has stabilized into normal clinical baseline.'
          : u.userId === 'EMP-1005'
          ? 'Downward trajectory as failed authentication count resolved after key rotation.'
          : 'Consistent low-risk baseline conforming to established behavioral normality envelope.',
    }
  })

  return progressions
}

/**
 * Historical threshold adjustments ledger
 */
export const THRESHOLD_HISTORY_RECORDS: ThresholdChangeRecord[] = [
  {
    id: 'TH-084',
    timestamp: 'Today, 09:15 AM',
    previousThresholds: { allow: 38, warn: 68, restrict: 85, block: 92 },
    newThresholds: { allow: 35, warn: 65, restrict: 82, block: 90 },
    reason: 'Automated Bayesian drift compensation following spike in anomalous finance file transfers.',
    analystFeedback: 'Approved by Lead SOC Engineer (Robert). Stance slightly tightened to protect financial assets.',
    departmentImpact: 'Finance & Healthcare',
    status: 'APPLIED',
    stanceChange: 'TIGHTENED',
  },
  {
    id: 'TH-083',
    timestamp: 'Yesterday, 14:20 PM',
    previousThresholds: { allow: 32, warn: 62, restrict: 80, block: 88 },
    newThresholds: { allow: 38, warn: 68, restrict: 85, block: 92 },
    reason: 'Temporary relaxation for Engineering quarterly sprint merge & CI/CD deployment window.',
    analystFeedback: 'Requested by DevOps Lead (Mike) to prevent false positives on massive git repo checkouts.',
    departmentImpact: 'Engineering Only',
    status: 'APPLIED',
    stanceChange: 'RELAXED',
  },
  {
    id: 'TH-082',
    timestamp: '3 days ago',
    previousThresholds: { allow: 35, warn: 65, restrict: 82, block: 90 },
    newThresholds: { allow: 30, warn: 55, restrict: 75, block: 85 },
    reason: 'Pre-emptive hardening during external threat intelligence advisory on CVE-2026-4198 credential spray.',
    analystFeedback: 'Enterprise-wide emergency posture shift. Block threshold reduced to 85.',
    departmentImpact: 'Enterprise-wide',
    status: 'REVERTED',
    stanceChange: 'TIGHTENED',
  },
  {
    id: 'TH-081',
    timestamp: '1 week ago',
    previousThresholds: { allow: 35, warn: 65, restrict: 82, block: 90 },
    newThresholds: { allow: 35, warn: 65, restrict: 82, block: 90 },
    reason: 'Periodic weekly calibration audit. No significant covariate concept drift observed in baseline envelope.',
    analystFeedback: 'System maintained balanced default stance.',
    departmentImpact: 'All Departments',
    status: 'APPLIED',
    stanceChange: 'BALANCED',
  },
]

/**
 * Master simulation generator returning complete snapshot
 */
export function generateRiskTuningSnapshot(
  selectedUserId: string = 'EMP-1002',
  customThresholds?: Partial<FirewallThresholds>,
): RiskTuningSnapshot {
  const now = new Date()
  const sec = now.getSeconds()
  const microJitter = Math.sin(sec / 10) * 1.5

  // Baseline thresholds
  const thresholds: FirewallThresholds = {
    allowThreshold: customThresholds?.allowThreshold ?? 35,
    warnThreshold: customThresholds?.warnThreshold ?? 65,
    restrictThreshold: customThresholds?.restrictThreshold ?? 82,
    blockThreshold: customThresholds?.blockThreshold ?? 90,
    mode: customThresholds?.mode ?? 'ADAPTIVE',
    learningRate: customThresholds?.learningRate ?? 0.05,
    sensitivityFactor: customThresholds?.sensitivityFactor ?? 1.25,
    projectedImpact: computeProjectedImpact(
      customThresholds?.allowThreshold ?? 35,
      customThresholds?.warnThreshold ?? 65,
      customThresholds?.restrictThreshold ?? 82,
      customThresholds?.blockThreshold ?? 90,
    ),
  }

  // Generate Departments
  const departments: DepartmentPrivacyRisk[] = RAW_DEPARTMENTS.map((d) => {
    const avgScore = Math.max(10, Math.min(95, Math.round(d.baselineScore + microJitter * (d.department === 'Finance' ? 2 : 1))))
    return {
      department: d.department,
      avgRiskScore: avgScore,
      baselineRiskScore: d.baselineScore,
      riskTier: computeRiskTier(avgScore),
      userCount: d.userCount,
      activeThreats: d.activeThreats,
      allowThreshold: d.overrideActive ? d.customAllow : thresholds.allowThreshold,
      warnThreshold: d.overrideActive ? d.customWarn : thresholds.warnThreshold,
      restrictThreshold: d.overrideActive ? d.customRestrict : thresholds.restrictThreshold,
      blockThreshold: d.overrideActive ? d.customBlock : thresholds.blockThreshold,
      overrideActive: d.overrideActive,
      strictnessLevel: d.strictness,
    }
  })

  // Generate Users
  const users: UserPrivacyRisk[] = RAW_USERS.map((u) => {
    const isSelected = u.userId === selectedUserId
    const jitterVal = isSelected ? microJitter * 2 : microJitter
    const currentScore = Math.max(8, Math.min(96, Math.round(u.baseScore + jitterVal)))
    const adjustedScore = Math.max(5, Math.min(99, Math.round(currentScore * 1.04)))
    const confidence = Number((0.92 + (currentScore < 30 ? 0.05 : 0.02)).toFixed(2))

    return {
      userId: u.userId,
      userName: u.userName,
      department: u.department,
      role: u.role,
      currentRiskScore: currentScore,
      baselineRiskScore: u.baseScore,
      adjustedRiskScore: adjustedScore,
      confidence,
      riskTier: computeRiskTier(currentScore),
      explanation: u.explanation,
      avatar: u.avatar,
      lastActive: 'Just now',
      activeAnomalies: u.anomalies,
    }
  })

  // Score decompositions
  const scoreDecompositions: Record<string, ScoreDecomposition> = {}
  users.forEach((u) => {
    scoreDecompositions[u.userId] = generateScoreDecomposition(
      u.userId,
      u.userName,
      u.currentRiskScore,
    )
  })

  // Department Overrides
  const departmentOverrides: DepartmentThresholdOverride[] = RAW_DEPARTMENTS.map((d) => ({
    department: d.department,
    baselineAllow: thresholds.allowThreshold,
    baselineWarn: thresholds.warnThreshold,
    baselineRestrict: thresholds.restrictThreshold,
    baselineBlock: thresholds.blockThreshold,
    customAllow: d.customAllow,
    customWarn: d.customWarn,
    customRestrict: d.customRestrict,
    customBlock: d.customBlock,
    regulatoryStandard: d.standard,
    overrideEnabled: d.overrideActive,
    rationale: d.rationale,
    lastModified: '2026-11-14 18:30 UTC',
  }))

  // Decision Boundaries & Active Requests
  const decisionBoundaryPoints = generateDecisionBoundaryPoints(thresholds)
  const activeRequests = generateActiveRequestSamples(thresholds)

  // Sensitivity Scenarios & Calibration
  const sensitivityScenarios = generateSensitivityScenarios(thresholds)
  const calibration = generateCalibrationMetrics(microJitter)

  // Risk Progression Trajectories
  const userProgressions = generateUserRiskProgressions(users, thresholds)

  // Executive Summary Synthesis
  const sortedDepts = [...departments].sort((a, b) => b.avgRiskScore - a.avgRiskScore)
  const highestDept = sortedDepts[0]!
  const sortedUsers = [...users].sort((a, b) => b.currentRiskScore - a.currentRiskScore)
  const highestUser = sortedUsers[0]!

  const summary: RiskTuningSummaryData = {
    highestRiskDepartment: highestDept.department,
    highestRiskDeptScore: highestDept.avgRiskScore,
    highestRiskUser: highestUser.userName,
    highestRiskUserScore: highestUser.currentRiskScore,
    firewallStance:
      thresholds.blockThreshold <= 85
        ? 'CONSERVATIVE'
        : thresholds.blockThreshold >= 95
        ? 'PERMISSIVE'
        : 'BALANCED',
    thresholdTrend: 'TIGHTENED',
    fpRateDelta: -0.3,
    blockRateDelta: +1.2,
    executiveNarrative: `The firewall is currently operating in an ADAPTIVE, BALANCED posture with tightened overrides active on ${departments.filter((d) => d.overrideActive).length} departments. Department ${highestDept.department} exhibits the highest aggregate privacy risk (${highestDept.avgRiskScore}/100) due to concentrated high-privilege ledger access. User ${highestUser.userName} represents the highest individual risk point (${highestUser.currentRiskScore}/100, CRITICAL tier), triggering active RESTRICT quarantine under current decision boundaries.`,
    keyFindings: [
      `Department ${highestDept.department} shows highest overall privacy risk (${highestDept.avgRiskScore}/100) under SOX/GLBA scrutiny.`,
      'Decision thresholds recently tightened by 3 points in response to elevated peripheral mass storage events.',
      `Current False Positive Rate is well-calibrated at ${calibration.falsePositiveRate}% with a 96.8% threshold accuracy.`,
      `USB insertion is identified as the single highest sensitivity factor (+38 pts risk delta).`,
    ],
    recommendation:
      'Maintain elevated threshold overrides on Finance and Healthcare. Enforce hardware step-up verification for any user crossing the 65-point WARN boundary before granting bulk file export privileges.',
  }

  return {
    timestamp: now.toISOString(),
    users,
    departments,
    thresholds,
    decisionBoundaryPoints,
    activeRequests,
    sensitivityScenarios,
    calibration,
    thresholdHistory: THRESHOLD_HISTORY_RECORDS,
    userProgressions,
    departmentOverrides,
    scoreDecompositions,
    summary,
  }
}
