import type {
  AdaptiveLearningSnapshot,
  AdaptiveSummary,
  AdaptiveThresholdItem,
  AnomalyTrendItem,
  BehaviorBeforeAfter,
  BaselineTimelineStage,
  DriftTrendDataPoint,
  FeedbackLoopEvent,
  PrivacyRiskScore,
  UserBaselineProfile,
} from '../types/adaptiveLearning'

export const BASE_USERS: Omit<
  UserBaselineProfile,
  'currentThreatScore' | 'baselineThreatScore'
>[] = [
  {
    userId: 'EMP-1001',
    userName: 'Pavan',
    department: 'Engineering',
    role: 'Lead Security Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    baselineStrength: 98,
    confidence: 0.96,
    sampleWindowDays: 120,
    driftCategory: 'Stabilized',
    metrics: {
      loginTime: { baseline: '09:00 - 18:00', current: '09:42 AM', deviationPct: 4.2 },
      usbUsage: { baseline: 0.0, current: 0.0, deviationPct: 0.0, unit: 'events/wk' },
      fileAccessVolume: { baseline: 45, current: 52, deviationPct: 15.5, unit: 'MB/day' },
      emailActivity: { baseline: 18, current: 16, deviationPct: -11.1, unit: 'msgs/day' },
      httpActivity: { baseline: 85, current: 92, deviationPct: 8.2, unit: 'req/min' },
      sessionDuration: { baseline: 8.2, current: 8.0, deviationPct: -2.4, unit: 'hours' },
      failedLogins: { baseline: 0.05, current: 0.0, deviationPct: -100.0, unit: 'fails/mo' },
      deviceTrust: { baseline: 99, current: 98, deviationPct: -1.0, unit: 'MDM Score' },
      geoConsistency: { baseline: 99.5, current: 99.2, deviationPct: -0.3, unit: '% San Francisco' },
      riskHistory: { meanScore: 12, peakScore: 24, trend: 'Stable' },
    },
  },
  {
    userId: 'EMP-1002',
    userName: 'John',
    department: 'Finance',
    role: 'Finance Analyst',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    baselineStrength: 88,
    confidence: 0.89,
    sampleWindowDays: 75,
    driftCategory: 'Suspicious',
    metrics: {
      loginTime: { baseline: '08:45 - 17:30', current: '09:15 AM', deviationPct: 6.8 },
      usbUsage: { baseline: 0.0, current: 1.0, deviationPct: 100.0, unit: 'events/wk' },
      fileAccessVolume: { baseline: 120, current: 480, deviationPct: 300.0, unit: 'MB/day' },
      emailActivity: { baseline: 28, current: 42, deviationPct: 50.0, unit: 'msgs/day' },
      httpActivity: { baseline: 60, current: 240, deviationPct: 300.0, unit: 'req/min' },
      sessionDuration: { baseline: 7.8, current: 9.6, deviationPct: 23.0, unit: 'hours' },
      failedLogins: { baseline: 0.2, current: 2.0, deviationPct: 900.0, unit: 'fails/mo' },
      deviceTrust: { baseline: 95, current: 94, deviationPct: -1.1, unit: 'MDM Score' },
      geoConsistency: { baseline: 98.0, current: 94.2, deviationPct: -3.8, unit: '% San Francisco' },
      riskHistory: { meanScore: 42, peakScore: 68, trend: 'Elevating' },
    },
  },
  {
    userId: 'EMP-1003',
    userName: 'Alice',
    department: 'Human Resources',
    role: 'HR Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    baselineStrength: 94,
    confidence: 0.94,
    sampleWindowDays: 90,
    driftCategory: 'Normal',
    metrics: {
      loginTime: { baseline: '08:30 - 17:00', current: '08:50 AM', deviationPct: 3.5 },
      usbUsage: { baseline: 0.0, current: 0.0, deviationPct: 0.0, unit: 'events/wk' },
      fileAccessVolume: { baseline: 35, current: 38, deviationPct: 8.5, unit: 'MB/day' },
      emailActivity: { baseline: 45, current: 40, deviationPct: -11.1, unit: 'msgs/day' },
      httpActivity: { baseline: 40, current: 42, deviationPct: 5.0, unit: 'req/min' },
      sessionDuration: { baseline: 7.5, current: 7.6, deviationPct: 1.3, unit: 'hours' },
      failedLogins: { baseline: 0.1, current: 0.0, deviationPct: -100.0, unit: 'fails/mo' },
      deviceTrust: { baseline: 98, current: 98, deviationPct: 0.0, unit: 'MDM Score' },
      geoConsistency: { baseline: 99.0, current: 99.0, deviationPct: 0.0, unit: '% San Francisco' },
      riskHistory: { meanScore: 18, peakScore: 28, trend: 'Stable' },
    },
  },
  {
    userId: 'EMP-1004',
    userName: 'Sara',
    department: 'Healthcare',
    role: 'Clinical Research Specialist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    baselineStrength: 92,
    confidence: 0.93,
    sampleWindowDays: 90,
    driftCategory: 'Stabilized',
    metrics: {
      loginTime: { baseline: '08:00 - 16:30', current: '08:12 AM', deviationPct: 2.1 },
      usbUsage: { baseline: 0.0, current: 0.0, deviationPct: 0.0, unit: 'events/wk' },
      fileAccessVolume: { baseline: 80, current: 95, deviationPct: 18.7, unit: 'MB/day' },
      emailActivity: { baseline: 15, current: 14, deviationPct: -6.7, unit: 'msgs/day' },
      httpActivity: { baseline: 55, current: 58, deviationPct: 5.4, unit: 'req/min' },
      sessionDuration: { baseline: 8.0, current: 8.1, deviationPct: 1.2, unit: 'hours' },
      failedLogins: { baseline: 0.0, current: 0.0, deviationPct: 0.0, unit: 'fails/mo' },
      deviceTrust: { baseline: 99, current: 99, deviationPct: 0.0, unit: 'MDM Score' },
      geoConsistency: { baseline: 100.0, current: 100.0, deviationPct: 0.0, unit: '% Clinical Vault' },
      riskHistory: { meanScore: 21, peakScore: 35, trend: 'Declining' },
    },
  },
  {
    userId: 'EMP-1005',
    userName: 'Dr. Elena Rostova',
    department: 'Engineering',
    role: 'Lead AI Research Scientist',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    baselineStrength: 96,
    confidence: 0.95,
    sampleWindowDays: 110,
    driftCategory: 'Normal',
    metrics: {
      loginTime: { baseline: '10:00 - 20:00', current: '10:30 AM', deviationPct: 5.0 },
      usbUsage: { baseline: 0.0, current: 0.0, deviationPct: 0.0, unit: 'events/wk' },
      fileAccessVolume: { baseline: 2500, current: 3100, deviationPct: 24.0, unit: 'MB/day' },
      emailActivity: { baseline: 12, current: 15, deviationPct: 25.0, unit: 'msgs/day' },
      httpActivity: { baseline: 320, current: 380, deviationPct: 18.7, unit: 'req/min' },
      sessionDuration: { baseline: 9.5, current: 10.2, deviationPct: 7.3, unit: 'hours' },
      failedLogins: { baseline: 0.1, current: 0.0, deviationPct: -100.0, unit: 'fails/mo' },
      deviceTrust: { baseline: 97, current: 97, deviationPct: 0.0, unit: 'MDM Score' },
      geoConsistency: { baseline: 98.2, current: 98.0, deviationPct: -0.2, unit: '% San Francisco / GPU Cluster' },
      riskHistory: { meanScore: 26, peakScore: 48, trend: 'Stable' },
    },
  },
  {
    userId: 'EMP-1006',
    userName: 'Marcus Vance',
    department: 'Engineering',
    role: 'Staff Platform Architect',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    baselineStrength: 85,
    confidence: 0.88,
    sampleWindowDays: 60,
    driftCategory: 'Sudden Spike',
    metrics: {
      loginTime: { baseline: '09:30 - 18:30', current: '02:40 AM', deviationPct: 140.0 },
      usbUsage: { baseline: 0.0, current: 2.0, deviationPct: 200.0, unit: 'events/wk' },
      fileAccessVolume: { baseline: 220, current: 1850, deviationPct: 740.0, unit: 'MB/day' },
      emailActivity: { baseline: 22, current: 5, deviationPct: -77.0, unit: 'msgs/day' },
      httpActivity: { baseline: 95, current: 850, deviationPct: 794.0, unit: 'req/min' },
      sessionDuration: { baseline: 8.0, current: 14.5, deviationPct: 81.2, unit: 'hours' },
      failedLogins: { baseline: 0.3, current: 4.0, deviationPct: 1233.0, unit: 'fails/mo' },
      deviceTrust: { baseline: 96, current: 72, deviationPct: -25.0, unit: 'MDM Score (BYOD Ingress)' },
      geoConsistency: { baseline: 97.0, current: 64.0, deviationPct: -34.0, unit: '% Unknown Proxy' },
      riskHistory: { meanScore: 58, peakScore: 89, trend: 'Elevating' },
    },
  },
]

export function generateUserBaselines(): UserBaselineProfile[] {
  return BASE_USERS.map((u) => {
    let baselineThreatScore = 15
    let currentThreatScore = 18

    if (u.driftCategory === 'Suspicious') {
      baselineThreatScore = 32
      currentThreatScore = 64
    } else if (u.driftCategory === 'Sudden Spike') {
      baselineThreatScore = 24
      currentThreatScore = 88
    } else if (u.driftCategory === 'Normal') {
      baselineThreatScore = 20
      currentThreatScore = 25
    }

    return {
      ...u,
      baselineThreatScore,
      currentThreatScore,
    }
  })
}

export function generateDriftTrends(user: UserBaselineProfile): DriftTrendDataPoint[] {
  const points: DriftTrendDataPoint[] = []
  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Day 14']

  const baseThreshold = 50
  const isSpike = user.driftCategory === 'Sudden Spike'
  const isSuspicious = user.driftCategory === 'Suspicious'

  for (let i = 0; i < days.length; i++) {
    const timeIndex = i + 1
    const normalDrift = Math.round(10 + Math.sin(i * 0.4) * 4)

    let suspiciousDrift = 12
    let currentRiskScore = 15

    if (isSpike) {
      if (i >= 10) {
        suspiciousDrift = Math.min(95, 45 + (i - 9) * 12)
        currentRiskScore = Math.min(96, 50 + (i - 9) * 11)
      } else {
        suspiciousDrift = 14 + i * 2
        currentRiskScore = 18 + i
      }
    } else if (isSuspicious) {
      suspiciousDrift = Math.min(75, 20 + i * 3.5)
      currentRiskScore = Math.min(70, 22 + i * 3)
    } else {
      suspiciousDrift = Math.round(14 + Math.cos(i * 0.3) * 3)
      currentRiskScore = Math.round(16 + Math.sin(i * 0.5) * 4)
    }

    // Adaptive threshold evolution (learned threshold adapts upwards or downwards)
    const adaptedThreshold = isSuspicious || isSpike
      ? Math.max(35, baseThreshold - (i >= 8 ? (i - 7) * 2 : 0))
      : Math.min(65, baseThreshold + Math.floor(i * 0.5))

    points.push({
      timeIndex,
      timestamp: `2026-11-${String(i + 1).padStart(2, '0')}`,
      label: days[i]!,
      normalDrift,
      suspiciousDrift,
      currentRiskScore,
      baselineThreshold: baseThreshold,
      adaptedThreshold,
    })
  }

  return points
}

export function generatePrivacyRiskScores(): PrivacyRiskScore[] {
  return [
    {
      userId: 'EMP-1001',
      userName: 'Pavan',
      department: 'Engineering',
      score: 18,
      tier: 'Low',
      piiAccessRate: 2.1,
      crossDeptAccessFreq: 1,
      bulkEgressVelocityMb: 12,
      consentCompliancePct: 99.4,
      explanation: 'Verified developer identity with zero unauthorized cross-department data requests. Code repository access strictly strictly conforms to Engineering role.',
    },
    {
      userId: 'EMP-1002',
      userName: 'John',
      department: 'Finance',
      score: 68,
      tier: 'High',
      piiAccessRate: 18.5,
      crossDeptAccessFreq: 9,
      bulkEgressVelocityMb: 480,
      consentCompliancePct: 86.2,
      explanation: 'Elevated bulk payroll ledger reads and attempted CSV exports without step-up approval. High-frequency queries trigger automated throttle restrictions.',
    },
    {
      userId: 'EMP-1003',
      userName: 'Alice',
      department: 'Human Resources',
      score: 24,
      tier: 'Low',
      piiAccessRate: 14.0,
      crossDeptAccessFreq: 2,
      bulkEgressVelocityMb: 35,
      consentCompliancePct: 98.8,
      explanation: 'Legitimate employee records access conforming to HR role baseline. All sensitive salary records masked by privacy firewall proxy.',
    },
    {
      userId: 'EMP-1004',
      userName: 'Sara',
      department: 'Healthcare',
      score: 32,
      tier: 'Medium',
      piiAccessRate: 24.2,
      crossDeptAccessFreq: 0,
      bulkEgressVelocityMb: 95,
      consentCompliancePct: 97.5,
      explanation: 'Authorized clinical trial records inspection. High PII volume is expected for clinical research but monitored under strict HIPAA telemetry rules.',
    },
    {
      userId: 'EMP-1005',
      userName: 'Dr. Elena Rostova',
      department: 'Engineering',
      score: 44,
      tier: 'Medium',
      piiAccessRate: 8.4,
      crossDeptAccessFreq: 4,
      bulkEgressVelocityMb: 3100,
      consentCompliancePct: 94.0,
      explanation: 'High data velocity due to model checkpoint downloads (3.1 GB). Low privacy risk because training dataset contains only de-identified synthetic corpora.',
    },
    {
      userId: 'EMP-1006',
      userName: 'Marcus Vance',
      department: 'Engineering',
      score: 89,
      tier: 'Critical',
      piiAccessRate: 46.8,
      crossDeptAccessFreq: 14,
      bulkEgressVelocityMb: 1850,
      consentCompliancePct: 62.0,
      explanation: 'Multiple high-risk indicators: unmanaged BYOD device, off-hours session (02:40 AM), removable USB storage attached, and bulk customer database exfiltration attempt.',
    },
  ]
}

export function generateAdaptiveThresholds(): AdaptiveThresholdItem[] {
  return [
    {
      id: 'THR-001',
      ruleName: 'Bulk File Egress Quota (AI Engineering)',
      department: 'Engineering',
      previousThreshold: 500,
      updatedThreshold: 2500,
      direction: 'Relaxed',
      trigger: 'Analyst Feedback',
      delta: 2000,
      adaptedAt: '12m ago',
      reason: 'Confirmed false positives on legitimate LLM checkpoint derivation. Machine learning engineers routinely require multi-gigabyte weight synchronization.',
    },
    {
      id: 'THR-002',
      ruleName: 'Off-Hours Login Restriction (Finance)',
      department: 'Finance',
      previousThreshold: 45,
      updatedThreshold: 25,
      direction: 'Tightened',
      trigger: 'Repeated True Positives',
      delta: -20,
      adaptedAt: '34m ago',
      reason: 'Confirmed unauthorized midnight ledger access attempt. Lowered threshold to immediately enforce step-up hardware token challenge on off-hours sessions.',
    },
    {
      id: 'THR-003',
      ruleName: 'HTTP Request Rate Limit (Inference Gateways)',
      department: 'Engineering',
      previousThreshold: 120,
      updatedThreshold: 350,
      direction: 'Relaxed',
      trigger: 'Department Shift',
      delta: 230,
      adaptedAt: '1h ago',
      reason: 'Automated CI/CD load testing agents elevated standard baseline request velocity. Shift acknowledged by SecOps committee.',
    },
    {
      id: 'THR-004',
      ruleName: 'Removable USB Storage Enforcement (All Departments)',
      department: 'All',
      previousThreshold: 70,
      updatedThreshold: 40,
      direction: 'Tightened',
      trigger: 'Repeated True Positives',
      delta: -30,
      adaptedAt: '2h ago',
      reason: 'Zero-trust physical containment update: USB mass storage devices now trigger automatic session quarantine regardless of user privilege level.',
    },
    {
      id: 'THR-005',
      ruleName: 'Cross-Department Healthcare Query Limit',
      department: 'Healthcare',
      previousThreshold: 15,
      updatedThreshold: 5,
      direction: 'Tightened',
      trigger: 'Analyst Feedback',
      delta: -10,
      adaptedAt: '3h ago',
      reason: 'HIPAA compliance audit finding: clinical researchers must obtain dual authorization prior to querying non-assigned patient registries.',
    },
  ]
}

export function generateFeedbackLoopEvents(): FeedbackLoopEvent[] {
  return [
    {
      id: 'FBK-401',
      timestamp: 'Today, 11:42 AM',
      analyst: 'Sarah Jenkins (SecOps Analyst)',
      alertId: 'ALT-8812',
      user: 'Dr. Elena Rostova',
      feedbackType: 'Marked False Positive',
      policyAction: 'Policy Relaxed',
      modelWeightShift: 'Random Forest threshold adjusted +15% for AI Engineering',
      status: 'Committed',
    },
    {
      id: 'FBK-402',
      timestamp: 'Today, 10:18 AM',
      analyst: 'Sophia Lin (Lead Incident Responder)',
      alertId: 'ALT-8809',
      user: 'Marcus Vance',
      feedbackType: 'Confirmed True Positive',
      policyAction: 'Policy Tightened',
      modelWeightShift: 'XGBoost USB & Off-Hours feature weight boosted from 0.28 to 0.42',
      status: 'Committed',
    },
    {
      id: 'FBK-403',
      timestamp: 'Today, 09:35 AM',
      analyst: 'Pavan (Lead Security Architect)',
      alertId: 'ALT-8794',
      user: 'John',
      feedbackType: 'Benign Workload Drift',
      policyAction: 'Baseline Updated',
      modelWeightShift: 'Updated Finance monthly close window to allow elevated query burst',
      status: 'Committed',
    },
    {
      id: 'FBK-404',
      timestamp: 'Yesterday, 16:50 PM',
      analyst: 'David Chen (GRC Auditor)',
      alertId: 'ALT-8761',
      user: 'Sara',
      feedbackType: 'Privilege Creep Detected',
      policyAction: 'Model Confidence Adjusted',
      modelWeightShift: 'Bayesian prior updated for Healthcare cross-region data transfers',
      status: 'Committed',
    },
  ]
}

export function generateBehaviorComparison(
  user: UserBaselineProfile,
): BehaviorBeforeAfter[] {
  const isElevated = user.driftCategory === 'Sudden Spike' || user.driftCategory === 'Suspicious'

  return [
    {
      metric: 'Workstation Login Ingress Window',
      oldBehavior: '09:00 - 18:00 (San Francisco PST)',
      currentBehavior: String(user.metrics.loginTime.current),
      expectedBaseline: 'Standard shift with < 15 min variation',
      varianceDelta: `+${user.metrics.loginTime.deviationPct}% deviation`,
      decisionBefore: 'ALLOW',
      decisionAfter: isElevated ? 'RESTRICT' : 'ALLOW',
      driverFeature: 'indicator.time (Off-Hours Deviation)',
    },
    {
      metric: 'Data Download & Egress Volume',
      oldBehavior: `${user.metrics.fileAccessVolume.baseline} MB/day historical average`,
      currentBehavior: `${user.metrics.fileAccessVolume.current} MB/day active rate`,
      expectedBaseline: `${Number(user.metrics.fileAccessVolume.baseline) * 1.5} MB max threshold`,
      varianceDelta: `+${user.metrics.fileAccessVolume.deviationPct}% surge`,
      decisionBefore: 'ALLOW',
      decisionAfter: isElevated ? 'BLOCK' : 'ALLOW',
      driverFeature: 'indicator.session (Mass Bulk Download)',
    },
    {
      metric: 'Removable Storage Media Attachment',
      oldBehavior: 'Zero USB events recorded in 90 days',
      currentBehavior: `${user.metrics.usbUsage.current} USB mass storage device connected`,
      expectedBaseline: 'Strict Zero-USB Corporate Baseline',
      varianceDelta: Number(user.metrics.usbUsage.current) === 0 ? 'Clean (0.0%)' : 'Violation Detected',
      decisionBefore: 'ALLOW',
      decisionAfter: Number(user.metrics.usbUsage.current) > 0 ? 'BLOCK' : 'ALLOW',
      driverFeature: 'indicator.usb (Hardware Attached Storage)',
    },
    {
      metric: 'API Query Transaction Velocity',
      oldBehavior: `${user.metrics.httpActivity.baseline} requests/min normal baseline`,
      currentBehavior: `${user.metrics.httpActivity.current} requests/min observed burst`,
      expectedBaseline: `${Number(user.metrics.httpActivity.baseline) * 2} req/min throttle ceiling`,
      varianceDelta: `+${user.metrics.httpActivity.deviationPct}% frequency change`,
      decisionBefore: 'ALLOW',
      decisionAfter: isElevated ? 'WARN' : 'ALLOW',
      driverFeature: 'indicator.http (Elevated REST Request Spike)',
    },
    {
      metric: 'Endpoint Hardware & MDM Trust State',
      oldBehavior: 'Corporate MacBook M3 (100% Enrolled)',
      currentBehavior: user.driftCategory === 'Sudden Spike' ? 'Unmanaged Linux BYOD Hardware' : 'Enrolled MDM Workstation',
      expectedBaseline: 'Hardware FIDO2 Token + Jamf Pro Compliance',
      varianceDelta: user.driftCategory === 'Sudden Spike' ? 'MDM Certificate Absent' : 'Verified (0.0% Delta)',
      decisionBefore: 'ALLOW',
      decisionAfter: user.driftCategory === 'Sudden Spike' ? 'BLOCK' : 'ALLOW',
      driverFeature: 'indicator.byod (Hardware Trust Ingress)',
    },
  ]
}

export function generateAnomalyTrends(): AnomalyTrendItem[] {
  return [
    {
      id: 'ANM-901',
      user: 'Marcus Vance',
      department: 'Engineering',
      anomalyType: 'Off-Hours Bulk Checkpoint Exfiltration',
      score: 89,
      trend: 'Spiking',
      decision: 'BLOCK',
      timestamp: 'Just now',
    },
    {
      id: 'ANM-902',
      user: 'John',
      department: 'Finance',
      anomalyType: 'High-Velocity SQL Extraction Burst',
      score: 68,
      trend: 'Increasing',
      decision: 'RESTRICT',
      timestamp: '3m ago',
    },
    {
      id: 'ANM-903',
      user: 'Dr. Elena Rostova',
      department: 'Engineering',
      anomalyType: 'Synthetic Model Training Download',
      score: 44,
      trend: 'Stabilizing',
      decision: 'WARN',
      timestamp: '8m ago',
    },
    {
      id: 'ANM-904',
      user: 'Sara',
      department: 'Healthcare',
      anomalyType: 'Cross-Registry Clinical Search',
      score: 32,
      trend: 'Decaying',
      decision: 'ALLOW',
      timestamp: '14m ago',
    },
    {
      id: 'ANM-905',
      user: 'Pavan',
      department: 'Engineering',
      anomalyType: 'GitLab Security Key Rotation',
      score: 18,
      trend: 'Stabilizing',
      decision: 'ALLOW',
      timestamp: '22m ago',
    },
  ]
}

export function generateBaselineTimeline(
  user: UserBaselineProfile,
): BaselineTimelineStage[] {
  return [
    {
      phase: 'Phase 1: Cold Start Ingestion',
      timeframe: 'Weeks 1 – 2 (Day 1 to 14)',
      status: 'Established',
      observedPattern: 'Zero-prior behavioral initialization. Standard enterprise role-based template applied.',
      baselineImpact: 'Model confidence set to 0.70 baseline. Sensitive access prompts mandatory step-up challenges.',
      thresholdDelta: 'Base threshold 50.0',
    },
    {
      phase: 'Phase 2: Statistical Convergence',
      timeframe: 'Weeks 3 – 6 (Day 15 to 42)',
      status: 'Established',
      observedPattern: 'Daily Gaussian distribution formed for login times, transaction frequency, and typical data reads.',
      baselineImpact: 'Confidence elevated to 0.88. False positive rate decreased by 64% as role habits stabilized.',
      thresholdDelta: 'Threshold adapted to 55.0 (+5.0)',
    },
    {
      phase: 'Phase 3: Workload Evolution & Drift',
      timeframe: 'Weeks 7 – 10 (Day 43 to 70)',
      status: 'Evolving',
      observedPattern: `${user.userName} engaged in ${user.department} quarterly milestones, increasing daily data access by 25%.`,
      baselineImpact: 'Adaptive filter differentiated benign project velocity from malicious exfiltration via closed-loop feedback.',
      thresholdDelta: 'Threshold dynamically relaxed for department',
    },
    {
      phase: 'Phase 4: Real-Time Active Adaptation',
      timeframe: 'Current Rolling 30 Days',
      status: 'Active Adaptation',
      observedPattern: user.driftCategory === 'Sudden Spike'
        ? 'Active anomaly detected: abrupt deviation from learned baseline triggers immediate automated quarantine.'
        : 'Continuous Bayesian weight updates preserve high detection accuracy while preventing alert fatigue.',
      baselineImpact: `Current baseline confidence: ${(user.confidence * 100).toFixed(1)}% across ${user.sampleWindowDays} sample days.`,
      thresholdDelta: `Current adapted threshold: ${user.currentThreatScore > 50 ? 'Tightened (Auto-Containment)' : 'Stable Operational'}`,
    },
  ]
}

export function generateAdaptiveSummary(
  activeUser: UserBaselineProfile,
  thresholds: AdaptiveThresholdItem[],
  feedbackEvents: FeedbackLoopEvent[],
): AdaptiveSummary {
  const isSpike = activeUser.driftCategory === 'Sudden Spike' || activeUser.driftCategory === 'Suspicious'

  return {
    generatedAt: new Date().toLocaleTimeString(),
    userRiskTrends: isSpike
      ? `User ${activeUser.userName} (${activeUser.role}) exhibits ${activeUser.driftCategory.toLowerCase()} risk drift (+${activeUser.currentThreatScore - activeUser.baselineThreatScore} score delta). Primary deviation drivers: elevated session data volume and non-standard authentication times.`
      : `User ${activeUser.userName} (${activeUser.role}) maintains a highly stabilized behavioral profile with only ${activeUser.metrics.loginTime.deviationPct}% temporal deviation and 0.0% unauthorized hardware activity.`,
    deptBaselineShift: `The ${activeUser.department} department baseline shifted over the past 30 days due to ${thresholds[0]?.ruleName ?? 'bulk workload adjustments'}, leading to a dynamic threshold adaptation from ${thresholds[0]?.previousThreshold} to ${thresholds[0]?.updatedThreshold}.`,
    usbNormalizationInsight: activeUser.metrics.usbUsage.current === 0
      ? 'Removable USB media baseline remains at zero across all corporate workstations. Any new physical media attachment will immediately be classified as a high-severity exfiltration vector.'
      : 'Unsanctioned USB mass storage device connection detected concurrent with privileged file access. This behavior violates the zero-trust hardware profile and is quarantined.',
    policyFeedbackTuning: `SecOps closed-loop feedback has committed ${feedbackEvents.length} policy calibrations today. Most recent: "${feedbackEvents[0]?.feedbackType}" for ${feedbackEvents[0]?.user}, triggering an automated ${feedbackEvents[0]?.policyAction.toLowerCase()}.`,
    conceptDriftMetric: `Concept drift score: 0.042 (Low Covariate Shift). Model ensemble (Logistic Regression, Decision Tree, Random Forest, XGBoost) retains 96.4% cross-validation accuracy without requiring full offline retraining.`,
  }
}

export function generateAdaptiveLearningSnapshot(
  selectedUserId?: string,
): AdaptiveLearningSnapshot {
  const users = generateUserBaselines()
  const activeUser =
    users.find((u) => u.userId === selectedUserId) ?? users[0]!

  const driftTrends = generateDriftTrends(activeUser)
  const privacyScores = generatePrivacyRiskScores()
  const thresholds = generateAdaptiveThresholds()
  const feedbackEvents = generateFeedbackLoopEvents()
  const comparison = generateBehaviorComparison(activeUser)
  const anomalies = generateAnomalyTrends()
  const summary = generateAdaptiveSummary(activeUser, thresholds, feedbackEvents)
  const timelineStages = generateBaselineTimeline(activeUser)

  return {
    timestamp: new Date().toISOString(),
    selectedUserId: activeUser.userId,
    users,
    activeUser,
    driftTrends,
    privacyScores,
    thresholds,
    feedbackEvents,
    comparison,
    anomalies,
    summary,
    timelineStages,
  }
}
