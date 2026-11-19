import type {
  FirewallAction,
  FirewallLiveEvent,
  MonitorDepartment,
  MonitorEmployee,
  MonitorIndicator,
  MonitorOperation,
  MonitorResource,
} from '../types/api'

export const EMPLOYEES: readonly MonitorEmployee[] = [
  'Vikas Rathod',
  'Pavan Jadhav',
  'Ghanshyam Sapkal',
  'Himanshu Gond',
  'Vaibhav Deshmukh',
  'Pratik Akkanawaru',
  'Saurabh Talape',
  'Ram Rajurkar',
] as const

export const DEPARTMENTS: readonly MonitorDepartment[] = [
  'Engineering',
  'Finance',
  'Human Resources',
  'Healthcare',
  'Infrastructure',
  'Security Operations',
] as const

export const RESOURCES: readonly MonitorResource[] = [
  // Sensitive Databases (8)
  'Customer Database',
  'Finance Database',
  'Medical Records',
  'Payroll Records',
  'Employee Records',
  'Source Code Repository',
  'Research Documents',
  'Analytics Warehouse',
  // Applications (8)
  'HR Portal',
  'Payroll System',
  'Finance Dashboard',
  'GitLab',
  'Jira',
  'Customer CRM',
  'Analytics Platform',
  'Email Gateway',
  // Infrastructure Servers (8)
  'Web Server',
  'API Gateway',
  'Identity Provider',
  'Database Cluster',
  'Storage Cluster',
  'Redis Cache',
  'Kubernetes Cluster',
  'Logging Server',
] as const

export const OPERATIONS: readonly MonitorOperation[] = [
  'Read',
  'Write',
  'Export',
  'Delete',
  'Modify',
  'Bulk Download',
] as const

export const BEHAVIOR_INDICATORS: readonly MonitorIndicator[] = [
  'USB Connected',
  'After Hours',
  'Impossible Travel',
  'BYOD Device',
  'Large Download',
  'Failed Logins',
  'HTTP Burst',
  'VPN',
  'Email Attachment',
] as const

export const EMPLOYEE_AFFINITY: Record<
  string,
  {
    department: MonitorDepartment
    defaultDevice: string
    primaryResources: MonitorResource[]
  }
> = {
  'Vikas Rathod': {
    department: 'Security Operations',
    defaultDevice: 'Dell Latitude 7440 (EDR Protected, Secure Boot)',
    primaryResources: ['Identity Provider', 'Logging Server', 'Customer Database', 'API Gateway'],
  },
  'Pavan Jadhav': {
    department: 'Engineering',
    defaultDevice: 'MacBook Pro M3 Max (Encrypted Corporate MDM)',
    primaryResources: ['Source Code Repository', 'GitLab', 'Kubernetes Cluster', 'Analytics Warehouse'],
  },
  'Ghanshyam Sapkal': {
    department: 'Infrastructure',
    defaultDevice: 'ThinkPad X1 Carbon (Hardware TPM 2.0)',
    primaryResources: ['API Gateway', 'Database Cluster', 'Redis Cache', 'Kubernetes Cluster'],
  },
  'Himanshu Gond': {
    department: 'Security Operations',
    defaultDevice: 'Alienware M16 R2 (Sandboxed Workstation)',
    primaryResources: ['Research Documents', 'Storage Cluster', 'Logging Server'],
  },
  'Vaibhav Deshmukh': {
    department: 'Finance',
    defaultDevice: 'HP EliteBook 840 G10 (BitLocker Encrypted)',
    primaryResources: ['Finance Database', 'Finance Dashboard', 'Payroll Records'],
  },
  'Pratik Akkanawaru': {
    department: 'Engineering',
    defaultDevice: 'MacBook Air M2 (MDM Managed)',
    primaryResources: ['Source Code Repository', 'GitLab', 'Jira'],
  },
  'Saurabh Talape': {
    department: 'Human Resources',
    defaultDevice: 'Dell Precision 5680 (Zero Trust Enforced)',
    primaryResources: ['Employee Records', 'HR Portal', 'Payroll System'],
  },
  'Ram Rajurkar': {
    department: 'Infrastructure',
    defaultDevice: 'MacBook Pro 14 (Corporate Zero Trust)',
    primaryResources: ['Analytics Warehouse', 'Customer CRM', 'Customer Database'],
  },
}

/**
 * Strict decision rule determination:
 * Risk < 25    => ALLOW
 * Risk 25-50   => WARN
 * Risk 50-75   => RESTRICT
 * Risk > 75    => BLOCK
 */
export function getDecisionForRisk(risk: number): FirewallAction {
  if (risk < 25) {
    return 'ALLOW'
  }
  if (risk <= 50) {
    return 'WARN'
  }
  if (risk <= 75) {
    return 'RESTRICT'
  }
  return 'BLOCK'
}

function pickRandom<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}

function pickRandomSubset<T>(array: readonly T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function roundToDecimals(value: number, decimals = 1): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

export function generateRealisticScenario(
  employee: MonitorEmployee,
  tier?: FirewallAction,
): {
  riskScore: number
  indicators: MonitorIndicator[]
  policy: string
  reasons: string[]
  device: string
  operation: MonitorOperation
  resource: MonitorResource
} {
  const affinity = EMPLOYEE_AFFINITY[employee] || EMPLOYEE_AFFINITY['Vikas Rathod']!

  // If no tier specified, pick with SOC distribution: ~45% Allow, 25% Warn, 18% Restrict, 12% Block
  let selectedTier = tier
  if (!selectedTier) {
    const roll = Math.random() * 100
    if (roll < 45) selectedTier = 'ALLOW'
    else if (roll < 70) selectedTier = 'WARN'
    else if (roll < 88) selectedTier = 'RESTRICT'
    else selectedTier = 'BLOCK'
  }

  if (selectedTier === 'BLOCK') {
    // Risk > 75
    const riskScore = Math.floor(Math.random() * 24) + 76 // 76 - 99
    const severePool: MonitorIndicator[] = [
      'USB Connected',
      'Impossible Travel',
      'Large Download',
      'Email Attachment',
      'Failed Logins',
      'After Hours',
    ]
    const indicators = pickRandomSubset(severePool, 2, 4)
    const severeOps: MonitorOperation[] = ['Bulk Download', 'Export', 'Delete']
    const operation = pickRandom(severeOps)

    // For a block, often target high sensitive databases outside normal bounds
    const sensitiveDbs: MonitorResource[] = [
      'Customer Database',
      'Finance Database',
      'Medical Records',
      'Payroll Records',
      'Analytics Warehouse',
      'Source Code Repository',
    ]
    const resource = pickRandom(sensitiveDbs)

    const reasons: string[] = []
    if (indicators.includes('USB Connected')) {
      reasons.push('Removable USB mass storage detected concurrent with privileged data transfer.')
    }
    if (indicators.includes('Impossible Travel')) {
      reasons.push('Ingress IP geolocations denote impossible physical transit speed within 15 minutes.')
    }
    if (indicators.includes('Large Download') || operation === 'Bulk Download') {
      reasons.push(`Abnormal volumetric transfer of ${resource} exceeding baseline quotas by 480%.`)
    }
    if (indicators.includes('Failed Logins')) {
      reasons.push('Burst of invalid credentials preceding elevated operation attempt.')
    }
    if (indicators.includes('Email Attachment')) {
      reasons.push('Attempt to transmit sensitive internal payload via external email relay.')
    }
    if (reasons.length === 0) {
      reasons.push('Critical multi-vector anomaly triggering automated zero-trust perimeter block.')
    }

    const policies = [
      'Strict Mass Exfiltration Prevention Policy',
      'Zero-Trust Boundary Lockdown Policy',
      'Sensitive Data Destruction Protection Shield',
      'Critical Perimeter Breach Quarantine',
    ]

    return {
      riskScore,
      indicators,
      policy: pickRandom(policies),
      reasons,
      device: indicators.includes('BYOD Device') ? 'BYOD Device (Unmanaged)' : affinity.defaultDevice,
      operation,
      resource,
    }
  }

  if (selectedTier === 'RESTRICT') {
    // Risk 50 - 75
    const riskScore = Math.floor(Math.random() * 25) + 51 // 51 - 75
    const moderatePool: MonitorIndicator[] = [
      'Large Download',
      'After Hours',
      'VPN',
      'Failed Logins',
      'BYOD Device',
    ]
    const indicators = pickRandomSubset(moderatePool, 2, 3)
    const modOps: MonitorOperation[] = ['Bulk Download', 'Export', 'Modify', 'Write']
    const operation = pickRandom(modOps)
    const resource = pickRandom(affinity.primaryResources)

    const reasons: string[] = []
    if (indicators.includes('Large Download')) {
      reasons.push(`High-volume object read observed on sensitive ${resource} partition.`)
    }
    if (indicators.includes('After Hours')) {
      reasons.push('Privileged session authenticated outside normal shift parameters.')
    }
    if (indicators.includes('BYOD Device')) {
      reasons.push('Endpoint missing hardware compliance verification certificate.')
    }
    if (reasons.length === 0) {
      reasons.push('Behavioral profile divergence warrants step-up isolation and rate limits.')
    }

    const policies = [
      'Restricted PII Query & Export Governance',
      'Elevated Data Mutation Guard Policy',
      'Controlled Medical Records Access Filter',
      'Anomalous Session Isolation Policy',
    ]

    return {
      riskScore,
      indicators,
      policy: pickRandom(policies),
      reasons,
      device: indicators.includes('BYOD Device') ? 'BYOD Device' : affinity.defaultDevice,
      operation,
      resource,
    }
  }

  if (selectedTier === 'WARN') {
    // Risk 25 - 50
    const riskScore = Math.floor(Math.random() * 26) + 25 // 25 - 50
    const warnPool: MonitorIndicator[] = [
      'After Hours',
      'HTTP Burst',
      'BYOD Device',
      'VPN',
    ]
    const indicators = pickRandomSubset(warnPool, 1, 2)
    const warnOps: MonitorOperation[] = ['Read', 'Modify', 'Write']
    const operation = pickRandom(warnOps)
    const resource = pickRandom(affinity.primaryResources)

    const reasons: string[] = []
    if (indicators.includes('HTTP Burst')) {
      reasons.push('Unusual high-frequency API request burst rate detected on service gateway.')
    }
    if (indicators.includes('After Hours')) {
      reasons.push('Session timing is outside subject standard operating schedule.')
    }
    if (indicators.includes('BYOD Device')) {
      reasons.push('Non-standard personal device connected through guest gateway.')
    }
    if (reasons.length === 0) {
      reasons.push('Minor statistical deviation from historical behavioral baseline.')
    }

    const policies = [
      'Off-Hours Resource Access Advisory Rule',
      'Elevated HTTP Burst Rate Warning Policy',
      'Non-Compliant Device Observation Baseline',
      'Secondary Channel Activity Advisory',
    ]

    return {
      riskScore,
      indicators,
      policy: pickRandom(policies),
      reasons,
      device: indicators.includes('BYOD Device') ? 'BYOD Device' : affinity.defaultDevice,
      operation,
      resource,
    }
  }

  // ALLOW: Risk < 25
  const riskScore = Math.floor(Math.random() * 22) + 2 // 2 - 23
  const allowPool: MonitorIndicator[] = ['VPN']
  const hasVpn = Math.random() < 0.35
  const indicators: MonitorIndicator[] = hasVpn ? [allowPool[0]!] : []
  const allowOps: MonitorOperation[] = ['Read', 'Write']
  const operation = pickRandom(allowOps)
  const resource = pickRandom(affinity.primaryResources)

  const reasons = [
    `Subject identity verified with valid MFA session token for ${affinity.department}.`,
    `Access to ${resource} matches sanctioned organizational role baseline.`,
  ]

  const policies = [
    'Standard Enterprise Role-Based Access Baseline',
    'Routine Infrastructure Access Authorization',
    'Authorized Data Reader Policy',
    'Corporate Core Service Access Policy',
  ]

  return {
    riskScore,
    indicators,
    policy: pickRandom(policies),
    reasons,
    device: affinity.defaultDevice,
    operation,
    resource,
  }
}

let eventCounter = 1000

export function generateLiveFirewallEvent(forcedTier?: FirewallAction): FirewallLiveEvent {
  eventCounter += 1
  const employee = pickRandom(EMPLOYEES)
  const affinity = EMPLOYEE_AFFINITY[employee] || EMPLOYEE_AFFINITY['Vikas Rathod']!
  const scenario = generateRealisticScenario(employee, forcedTier)
  const decision = getDecisionForRisk(scenario.riskScore)

  // High confidence in calibrated AI classifier (88% to 99%)
  const aiConfidence = roundToDecimals(0.88 + Math.random() * 0.11, 3)
  const threatScore = scenario.riskScore

  const now = new Date()
  const timestamp = now.toLocaleTimeString('en-US', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })

  return {
    id: `EVT-${Date.now().toString(36).toUpperCase()}-${eventCounter}`,
    employeeName: employee,
    department: affinity.department,
    requestedResource: scenario.resource,
    operation: scenario.operation,
    deviceType: scenario.device,
    riskScore: scenario.riskScore,
    threatScore,
    aiConfidence,
    firewallDecision: decision,
    policyTriggered: scenario.policy,
    behaviorIndicators: scenario.indicators,
    reasons: scenario.reasons,
    timestamp,
  }
}

/**
 * Seed an initial array of events so the SOC timeline has immediate context.
 */
export function generateInitialEvents(count = 6): FirewallLiveEvent[] {
  const tiers: FirewallAction[] = ['BLOCK', 'WARN', 'RESTRICT', 'ALLOW', 'ALLOW', 'WARN']
  const events: FirewallLiveEvent[] = []

  for (let i = 0; i < count; i++) {
    const tier = tiers[i % tiers.length]
    const event = generateLiveFirewallEvent(tier)
    // Offset timestamps slightly into the past
    const offsetSeconds = (count - i) * 12
    const past = new Date(Date.now() - offsetSeconds * 1000)
    event.timestamp = past.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    })
    events.push(event)
  }

  return events
}
