export interface DemoActor {
  id: string
  name: string
  role: string
  department: string
  avatarColor: string
  riskScore: number
  normalHours: string
}

export interface DemoAccessRequest {
  resource: string
  action: string
  timestamp: string
  ip: string
  location: string
  device: string
  dataSensitivity: 'Confidential' | 'Restricted' | 'Internal' | 'Public'
}

export interface DemoBehaviorTelemetry {
  usbEvents: number
  sessionDurationSeconds: number
  failedLogins: number
  fileAccessCount: number
  afterHoursFlag: boolean
  geoDistanceKm: number
  behavioralRiskIndex: number
  indicators: Record<string, number>
  componentScores: Record<string, number>
}

export interface DemoAIEvaluation {
  championModel: 'XGBoost' | 'RandomForest' | 'DecisionTree' | 'LogisticRegression'
  threatProbability: number
  confidence: number
  thresholdBand: 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK'
  predictedClass: 'insider' | 'normal'
  modelComparison: {
    xgboost: number
    randomForest: number
    decisionTree: number
    logisticRegression: number
  }
}

export interface DemoExplainabilityFactor {
  feature: string
  label: string
  value: number | string
  shapValue: number
  direction: 'increases_risk' | 'decreases_risk'
  rationale: string
}

export interface DemoExplainability {
  summary: string
  topFactors: DemoExplainabilityFactor[]
  counterfactualHint: string
}

export interface DemoPolicyDecision {
  action: 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK'
  policyId: string
  policyName: string
  matchedRules: string[]
  enforcementType: 'Automated Intercept' | 'MFA Step-Up' | 'Security Alert' | 'Standard Passage'
}

export interface DemoAuditLog {
  eventId: string
  timestamp: string
  eventType: string
  status: 'Blocked' | 'Restricted' | 'Warned' | 'Allowed'
  tamperProofHash: string
  retentionDays: number
}

export interface DemoAdaptiveLearning {
  baselineDriftDetected: boolean
  feedbackReceived: 'Approved by Analyst' | 'Confirmed Insider Threat' | 'False Positive' | 'Baseline Adjusted'
  thresholdAdjustment: string
  postAdaptationDecision?: 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK'
  learningNote: string
}

export interface DemoScenario {
  id: string
  title: string
  category: 'threat' | 'benign' | 'anomaly' | 'adaptation'
  badge: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  description: string
  storyline: string
  actor: DemoActor
  request: DemoAccessRequest
  behaviorTelemetry: DemoBehaviorTelemetry
  aiEvaluation: DemoAIEvaluation
  explainability: DemoExplainability
  policyDecision: DemoPolicyDecision
  auditLog: DemoAuditLog
  adaptiveLearning: DemoAdaptiveLearning
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario-usb-exfiltration',
    title: 'High-Volume USB Mass Exfiltration',
    category: 'threat',
    badge: 'CRITICAL THREAT',
    severity: 'Critical',
    description: 'Privileged database engineer mounting unauthorized mass-storage removable media and initiating batch dump of encrypted customer records.',
    storyline: 'An engineer on notice of termination connects an unmanaged SanDisk 128GB flash drive at 02:14 AM and executes a high-speed script targeting customer PII tables.',
    actor: {
      id: 'PSF0133',
      name: 'Philip Vance',
      role: 'Principal Database Reliability Engineer',
      department: 'Infrastructure & Cloud DB',
      avatarColor: 'bg-rose-600',
      riskScore: 0.94,
      normalHours: '09:00 - 18:00 EST',
    },
    request: {
      resource: 'vault://customer-db/pii-archive-2026',
      action: 'BULK_ENCRYPTED_EXPORT',
      timestamp: '2026-11-16 02:14:18 UTC',
      ip: '192.168.10.84',
      location: 'New York, US (Corporate On-Prem)',
      device: 'HW-ENG-DESKTOP-908',
      dataSensitivity: 'Restricted',
    },
    behaviorTelemetry: {
      usbEvents: 6,
      sessionDurationSeconds: 78200,
      failedLogins: 0,
      fileAccessCount: 420,
      afterHoursFlag: true,
      geoDistanceKm: 0,
      behavioralRiskIndex: 0.96,
      indicators: {
        'indicator.usb': 6.0,
        'indicator.session': 78200.0,
        'indicator.login': 0.0,
        'indicator.file': 420.0,
      },
      componentScores: {
        'component_score.usb': 0.99,
        'component_score.session': 0.92,
        'component_score.file': 0.95,
      },
    },
    aiEvaluation: {
      championModel: 'XGBoost',
      threatProbability: 0.984,
      confidence: 0.984,
      thresholdBand: 'BLOCK',
      predictedClass: 'insider',
      modelComparison: {
        xgboost: 0.984,
        randomForest: 0.962,
        decisionTree: 0.95,
        logisticRegression: 0.912,
      },
    },
    explainability: {
      summary: 'Extreme risk triggered by anomalous removable device attachments combined with 420 sensitive file touches during non-core hours.',
      topFactors: [
        {
          feature: 'component_score.usb',
          label: 'Removable Storage Mounts',
          value: '6 active devices',
          shapValue: 0.42,
          direction: 'increases_risk',
          rationale: 'Exceeds baseline threshold of 0 mounts by 600%. Strongly predictive of insider data exfiltration.',
        },
        {
          feature: 'behavioral_risk_index',
          label: 'Aggregate Behavioral Drift',
          value: '0.96 / 1.00',
          shapValue: 0.31,
          direction: 'increases_risk',
          rationale: 'Composite deviation index reflects anomalous off-hours data staging.',
        },
        {
          feature: 'indicator.file',
          label: 'File Access Surge',
          value: '420 operations',
          shapValue: 0.18,
          direction: 'increases_risk',
          rationale: 'Normal hourly rate is 4 files; observed rate is 105x baseline.',
        },
      ],
      counterfactualHint: 'Disconnecting external storage and scheduling exports via approved pipeline would reduce risk from 0.98 to 0.12.',
    },
    policyDecision: {
      action: 'BLOCK',
      policyId: 'POL-CRIT-001',
      policyName: 'Zero-Tolerance Removable Media Isolation',
      matchedRules: ['usb_mount_count >= 1', 'file_operation_velocity > 50/hr', 'after_hours == True'],
      enforcementType: 'Automated Intercept',
    },
    auditLog: {
      eventId: 'EVT-20261116-0214-BLK',
      timestamp: '2026-11-16 02:14:19.421Z',
      eventType: 'EXFILTRATION_INTERCEPT',
      status: 'Blocked',
      tamperProofHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      retentionDays: 365,
    },
    adaptiveLearning: {
      baselineDriftDetected: true,
      feedbackReceived: 'Confirmed Insider Threat',
      thresholdAdjustment: 'Maintained strict threshold band (0.85 -> 0.85) to reinforce high true-positive detection.',
      postAdaptationDecision: 'BLOCK',
      learningNote: 'Model retained high-weight association between off-hours removable device attachment and credential abuse.',
    },
  },
  {
    id: 'scenario-after-hours-access',
    title: 'Anomalous Midnight Production DB Query',
    category: 'threat',
    badge: 'HIGH THREAT',
    severity: 'High',
    description: 'Senior backend developer accessing production customer database from an uncharacteristic IP address at 03:45 AM local time.',
    storyline: 'Credentials used outside standard working shift with continuous active session spanning 48 hours without scheduled maintenance ticket.',
    actor: {
      id: 'AAS0442',
      name: 'Elena Rostova',
      role: 'Staff Backend Engineer',
      department: 'Payments & Settlement',
      avatarColor: 'bg-amber-600',
      riskScore: 0.78,
      normalHours: '10:00 - 19:00 PST',
    },
    request: {
      resource: 'postgres://payments-cluster.prod/ledger_transactions',
      action: 'DIRECT_SQL_SELECT',
      timestamp: '2026-11-16 03:45:12 UTC',
      ip: '198.51.100.44',
      location: 'San Jose, US (Residential ISP)',
      device: 'HW-ENG-LAPTOP-441',
      dataSensitivity: 'Restricted',
    },
    behaviorTelemetry: {
      usbEvents: 0,
      sessionDurationSeconds: 94800,
      failedLogins: 1,
      fileAccessCount: 38,
      afterHoursFlag: true,
      geoDistanceKm: 42,
      behavioralRiskIndex: 0.81,
      indicators: {
        'indicator.usb': 0.0,
        'indicator.session': 94800.0,
        'indicator.login': 1.0,
        'indicator.file': 38.0,
      },
      componentScores: {
        'component_score.usb': 0.0,
        'component_score.session': 0.94,
        'component_score.login': 0.35,
      },
    },
    aiEvaluation: {
      championModel: 'XGBoost',
      threatProbability: 0.792,
      confidence: 0.792,
      thresholdBand: 'RESTRICT',
      predictedClass: 'insider',
      modelComparison: {
        xgboost: 0.792,
        randomForest: 0.778,
        decisionTree: 0.76,
        logisticRegression: 0.735,
      },
    },
    explainability: {
      summary: 'Elevated risk driven by extended unbroken session length (26.3h) occurring between 02:00-05:00 without approved JIRA change request.',
      topFactors: [
        {
          feature: 'component_score.session',
          label: 'Excessive Continuous Session',
          value: '94,800 seconds (26.3h)',
          shapValue: 0.38,
          direction: 'increases_risk',
          rationale: 'Baseline session threshold for user is 28,800s (8h). Continuous session is 3.3x standard length.',
        },
        {
          feature: 'behavioral_risk_index',
          label: 'After-Hours Temporal Anomaly',
          value: '0.81',
          shapValue: 0.28,
          direction: 'increases_risk',
          rationale: 'User typically operates within 10:00-19:00 PST. 03:45 AM activity deviates by 8.75 hours.',
        },
      ],
      counterfactualHint: 'Providing a verified emergency maintenance change ID lowers risk score to 0.28.',
    },
    policyDecision: {
      action: 'RESTRICT',
      policyId: 'POL-HIGH-004',
      policyName: 'After-Hours Production Data Isolation',
      matchedRules: ['session_duration > 18h', 'after_hours == True', 'sensitivity == Restricted'],
      enforcementType: 'MFA Step-Up',
    },
    auditLog: {
      eventId: 'EVT-20261116-0345-RST',
      timestamp: '2026-11-16 03:45:13.118Z',
      eventType: 'RESTRICT_STEP_UP',
      status: 'Restricted',
      tamperProofHash: 'sha256:4a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456789abcdef0123',
      retentionDays: 180,
    },
    adaptiveLearning: {
      baselineDriftDetected: true,
      feedbackReceived: 'Approved by Analyst',
      thresholdAdjustment: 'Dynamic step-up challenge verified analyst on call; baseline adjusted for on-call shift.',
      postAdaptationDecision: 'WARN',
      learningNote: 'Firewall updated temporary on-call token to avoid recurring analyst friction during scheduled emergency rotations.',
    },
  },
  {
    id: 'scenario-finance-risk',
    title: 'Pre-Earnings Financial Ledger Bulk Extraction',
    category: 'threat',
    badge: 'CRITICAL THREAT',
    severity: 'Critical',
    description: 'Corporate financial analyst attempting unindexed downloads of consolidated Q4 earnings spreadsheets 48 hours prior to public disclosure.',
    storyline: 'Access attempt targets confidential valuation models from a newly provisioned virtual machine with abnormal data volume spikes.',
    actor: {
      id: 'FIN0891',
      name: 'Marcus Chen',
      role: 'Senior Financial Analyst',
      department: 'Corporate Finance & Treasury',
      avatarColor: 'bg-emerald-700',
      riskScore: 0.89,
      normalHours: '08:30 - 17:30 EST',
    },
    request: {
      resource: 'sharepoint://finance-internal/q4-earnings/pre-audit-ebitda.xlsx',
      action: 'MASS_FILE_DOWNLOAD',
      timestamp: '2026-11-16 23:19:04 UTC',
      ip: '10.240.12.91',
      location: 'Chicago, US (VPN Node 3)',
      device: 'VDI-FIN-INSTANCE-09',
      dataSensitivity: 'Restricted',
    },
    behaviorTelemetry: {
      usbEvents: 0,
      sessionDurationSeconds: 14400,
      failedLogins: 0,
      fileAccessCount: 184,
      afterHoursFlag: true,
      geoDistanceKm: 120,
      behavioralRiskIndex: 0.91,
      indicators: {
        'indicator.usb': 0.0,
        'indicator.session': 14400.0,
        'indicator.login': 0.0,
        'indicator.file': 184.0,
      },
      componentScores: {
        'component_score.usb': 0.0,
        'component_score.file': 0.96,
        'component_score.session': 0.45,
      },
    },
    aiEvaluation: {
      championModel: 'XGBoost',
      threatProbability: 0.918,
      confidence: 0.918,
      thresholdBand: 'BLOCK',
      predictedClass: 'insider',
      modelComparison: {
        xgboost: 0.918,
        randomForest: 0.894,
        decisionTree: 0.87,
        logisticRegression: 0.832,
      },
    },
    explainability: {
      summary: 'High-severity embargo violation: unindexed mass download of market-sensitive material during quiet period.',
      topFactors: [
        {
          feature: 'component_score.file',
          label: 'File Download Velocity',
          value: '184 confidential docs / hr',
          shapValue: 0.44,
          direction: 'increases_risk',
          rationale: 'Download volume exceeds quarterly earnings quiet-period policy limits by 18x.',
        },
        {
          feature: 'behavioral_risk_index',
          label: 'Market Sensitivity Index',
          value: '0.91',
          shapValue: 0.32,
          direction: 'increases_risk',
          rationale: 'Target asset is tagged with regulatory SEC blackout classification.',
        },
      ],
      counterfactualHint: 'Reading single report within secure browser viewer without local download yields risk of 0.19.',
    },
    policyDecision: {
      action: 'BLOCK',
      policyId: 'POL-FIN-009',
      policyName: 'Quiet Period Financial Data Intercept',
      matchedRules: ['asset_class == SEC_BLACKOUT', 'file_download_count > 10', 'embargo_active == True'],
      enforcementType: 'Automated Intercept',
    },
    auditLog: {
      eventId: 'EVT-20261116-2319-BLK',
      timestamp: '2026-11-16 23:19:05.002Z',
      eventType: 'QUIET_PERIOD_VIOLATION_BLOCKED',
      status: 'Blocked',
      tamperProofHash: 'sha256:99887766554433221100aabbccddeeff00112233445566778899aabbccddeeff',
      retentionDays: 3650,
    },
    adaptiveLearning: {
      baselineDriftDetected: true,
      feedbackReceived: 'Confirmed Insider Threat',
      thresholdAdjustment: 'Embargo window sensitivity auto-tightened by 12% across Finance & Legal groups.',
      postAdaptationDecision: 'BLOCK',
      learningNote: 'Confirmed by Chief Compliance Officer. Triggered legal review workflow.',
    },
  },
  {
    id: 'scenario-healthcare-access',
    title: 'Off-Department EHR Patient Record Query',
    category: 'threat',
    badge: 'PRIVACY VIOLATION',
    severity: 'High',
    description: 'Pediatric care nurse repeatedly querying VIP oncology patient medical histories located outside assigned clinical care unit.',
    storyline: 'Access attempt occurs without assigned patient care-team relationship in the hospital EHR, violating minimum-necessary HIPAA privacy principles.',
    actor: {
      id: 'NUR0219',
      name: 'Sarah Jenkins',
      role: 'Registered Pediatric Nurse',
      department: 'Pediatrics - Ward B',
      avatarColor: 'bg-teal-600',
      riskScore: 0.74,
      normalHours: '07:00 - 19:00 Shift',
    },
    request: {
      resource: 'ehr://patient-records/oncology/vip-case-882190',
      action: 'VIEW_CLINICAL_CHART',
      timestamp: '2026-11-16 14:22:31 UTC',
      ip: '10.120.4.11',
      location: 'Boston, US (Hospital Intranet)',
      device: 'WS-CLINICAL-PEDS-03',
      dataSensitivity: 'Restricted',
    },
    behaviorTelemetry: {
      usbEvents: 0,
      sessionDurationSeconds: 22000,
      failedLogins: 0,
      fileAccessCount: 52,
      afterHoursFlag: false,
      geoDistanceKm: 0,
      behavioralRiskIndex: 0.76,
      indicators: {
        'indicator.usb': 0.0,
        'indicator.session': 22000.0,
        'indicator.login': 0.0,
        'indicator.file': 52.0,
      },
      componentScores: {
        'component_score.usb': 0.0,
        'component_score.file': 0.78,
        'component_score.session': 0.22,
      },
    },
    aiEvaluation: {
      championModel: 'XGBoost',
      threatProbability: 0.755,
      confidence: 0.755,
      thresholdBand: 'RESTRICT',
      predictedClass: 'insider',
      modelComparison: {
        xgboost: 0.755,
        randomForest: 0.741,
        decisionTree: 0.72,
        logisticRegression: 0.695,
      },
    },
    explainability: {
      summary: 'HIPAA Minimum Necessary Discrepancy: User has no active clinical encounter or care relationship with requested oncology patient record.',
      topFactors: [
        {
          feature: 'behavioral_risk_index',
          label: 'Department Boundary Cross',
          value: 'Pediatrics -> Oncology VIP',
          shapValue: 0.36,
          direction: 'increases_risk',
          rationale: '99.4% of subject historical queries are within Pediatrics Ward B.',
        },
        {
          feature: 'component_score.file',
          label: 'Non-Assigned Patient Query',
          value: '52 unassigned charts',
          shapValue: 0.29,
          direction: 'increases_risk',
          rationale: 'Target patient has active VIP flag and zero physician referrals to Pediatrics.',
        },
      ],
      counterfactualHint: 'Providing emergency break-glass justification and clinical supervisor endorsement grants restricted 15-minute access.',
    },
    policyDecision: {
      action: 'RESTRICT',
      policyId: 'POL-HIPAA-012',
      policyName: 'EHR Minimum Necessary Access Protocol',
      matchedRules: ['department_mismatch == True', 'patient_assigned == False', 'vip_chart == True'],
      enforcementType: 'MFA Step-Up',
    },
    auditLog: {
      eventId: 'EVT-20261116-1422-RST',
      timestamp: '2026-11-16 14:22:32.410Z',
      eventType: 'BREAK_GLASS_PROMPT',
      status: 'Restricted',
      tamperProofHash: 'sha256:11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
      retentionDays: 2190,
    },
    adaptiveLearning: {
      baselineDriftDetected: true,
      feedbackReceived: 'False Positive',
      thresholdAdjustment: 'Nurse was covering cross-ward relief; supervisor validated break-glass justification.',
      postAdaptationDecision: 'ALLOW',
      learningNote: 'Temporary cross-coverage role credential granted for shift duration with enhanced auditing.',
    },
  },
  {
    id: 'scenario-benign-developer',
    title: 'Standard Benign Developer Code Review',
    category: 'benign',
    badge: 'BENIGN ACCESS',
    severity: 'Low',
    description: 'Frontend software engineer pulling repository branches, reading API documentation, and submitting pull requests during normal working hours.',
    storyline: 'Clean developer workflow completely adhering to behavioral baseline with zero risk anomalies.',
    actor: {
      id: 'DEV0044',
      name: 'Liam Zhang',
      role: 'Senior Frontend Developer',
      department: 'Frontend Experience Engineering',
      avatarColor: 'bg-indigo-600',
      riskScore: 0.04,
      normalHours: '09:30 - 18:30 EST',
    },
    request: {
      resource: 'git://github.com/enterprise/privacy-firewall-ui.git',
      action: 'GIT_CLONE_BRANCH',
      timestamp: '2026-11-16 11:15:44 UTC',
      ip: '10.0.14.22',
      location: 'New York, US (Office Wi-Fi 5GHz)',
      device: 'HW-MAC-DEV-0182',
      dataSensitivity: 'Internal',
    },
    behaviorTelemetry: {
      usbEvents: 0,
      sessionDurationSeconds: 12600,
      failedLogins: 0,
      fileAccessCount: 14,
      afterHoursFlag: false,
      geoDistanceKm: 0,
      behavioralRiskIndex: 0.03,
      indicators: {
        'indicator.usb': 0.0,
        'indicator.session': 12600.0,
        'indicator.login': 0.0,
        'indicator.file': 14.0,
      },
      componentScores: {
        'component_score.usb': 0.0,
        'component_score.session': 0.02,
        'component_score.file': 0.05,
      },
    },
    aiEvaluation: {
      championModel: 'XGBoost',
      threatProbability: 0.021,
      confidence: 0.979,
      thresholdBand: 'ALLOW',
      predictedClass: 'normal',
      modelComparison: {
        xgboost: 0.021,
        randomForest: 0.024,
        decisionTree: 0.015,
        logisticRegression: 0.035,
      },
    },
    explainability: {
      summary: 'Behavior fully matches established 90-day baseline for frontend software engineers.',
      topFactors: [
        {
          feature: 'behavioral_risk_index',
          label: 'Normal Role Profile',
          value: '0.03 / 1.00',
          shapValue: -0.35,
          direction: 'decreases_risk',
          rationale: 'Activity strictly within normal hours and authorized repository scope.',
        },
        {
          feature: 'component_score.usb',
          label: 'Zero Removable Media',
          value: '0 devices',
          shapValue: -0.22,
          direction: 'decreases_risk',
          rationale: 'Absence of external devices confirms compliance with corporate workstation guidelines.',
        },
      ],
      counterfactualHint: 'Zero changes required; access granted instantaneously in sub-5ms latency.',
    },
    policyDecision: {
      action: 'ALLOW',
      policyId: 'POL-BASE-001',
      policyName: 'Default Standard Passage Policy',
      matchedRules: ['threat_probability < 0.40', 'known_workstation == True'],
      enforcementType: 'Standard Passage',
    },
    auditLog: {
      eventId: 'EVT-20261116-1115-ALW',
      timestamp: '2026-11-16 11:15:44.204Z',
      eventType: 'PASSAGE_PERMITTED',
      status: 'Allowed',
      tamperProofHash: 'sha256:00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff',
      retentionDays: 90,
    },
    adaptiveLearning: {
      baselineDriftDetected: false,
      feedbackReceived: 'Approved by Analyst',
      thresholdAdjustment: 'Baseline profile reinforced with latest clean telemetry sample.',
      postAdaptationDecision: 'ALLOW',
      learningNote: 'Clean behavior vector reinforces low-risk center of mass for engineering department baseline.',
    },
  },
  {
    id: 'scenario-failed-logins',
    title: 'Credential Brute-Force Password Spray',
    category: 'anomaly',
    badge: 'AUTH ANOMALY',
    severity: 'High',
    description: 'Rapid burst of 14 consecutive authentication failures against administrative SSO portal followed by successful login.',
    storyline: 'External IP address rotates through leaked password lists against privileged IT administrator account within a 90-second window.',
    actor: {
      id: 'ADM0901',
      name: 'Rachel Torres',
      role: 'Cloud IAM Security Admin',
      department: 'Information Security & IAM',
      avatarColor: 'bg-purple-600',
      riskScore: 0.83,
      normalHours: '09:00 - 18:00 CST',
    },
    request: {
      resource: 'sso://admin-console/iam-management/roles',
      action: 'ADMIN_SSO_AUTHENTICATION',
      timestamp: '2026-11-16 04:12:09 UTC',
      ip: '185.220.101.5',
      location: 'Frankfurt, DE (Tor Exit Node)',
      device: 'UNKNOWN-LINUX-CLIENT',
      dataSensitivity: 'Restricted',
    },
    behaviorTelemetry: {
      usbEvents: 0,
      sessionDurationSeconds: 90,
      failedLogins: 14,
      fileAccessCount: 2,
      afterHoursFlag: true,
      geoDistanceKm: 6200,
      behavioralRiskIndex: 0.86,
      indicators: {
        'indicator.usb': 0.0,
        'indicator.session': 90.0,
        'indicator.login': 14.0,
        'indicator.file': 2.0,
      },
      componentScores: {
        'component_score.usb': 0.0,
        'component_score.login': 0.98,
        'component_score.session': 0.15,
      },
    },
    aiEvaluation: {
      championModel: 'XGBoost',
      threatProbability: 0.862,
      confidence: 0.862,
      thresholdBand: 'BLOCK',
      predictedClass: 'insider',
      modelComparison: {
        xgboost: 0.862,
        randomForest: 0.845,
        decisionTree: 0.83,
        logisticRegression: 0.801,
      },
    },
    explainability: {
      summary: 'Severe authentication anomaly: 14 failed logins in 90 seconds from known anonymizing gateway targeting admin console.',
      topFactors: [
        {
          feature: 'component_score.login',
          label: 'Failed Authentication Velocity',
          value: '14 failures / 90s',
          shapValue: 0.46,
          direction: 'increases_risk',
          rationale: 'Authentication failure rate exceeds 99.9th percentile of normal human user baseline.',
        },
        {
          feature: 'behavioral_risk_index',
          label: 'Known Bad Origin Network',
          value: 'Tor / Proxy Exit Node',
          shapValue: 0.28,
          direction: 'increases_risk',
          rationale: 'Origin IP correlates with known credential-stuffing botnet telemetry feed.',
        },
      ],
      counterfactualHint: 'Zero failures from corporate-registered laptop reduces threat probability to 0.08.',
    },
    policyDecision: {
      action: 'BLOCK',
      policyId: 'POL-AUTH-003',
      policyName: 'Credential Stuffing & Spray Defense',
      matchedRules: ['failed_logins >= 5', 'proxy_detected == True'],
      enforcementType: 'Automated Intercept',
    },
    auditLog: {
      eventId: 'EVT-20261116-0412-BLK',
      timestamp: '2026-11-16 04:12:10.154Z',
      eventType: 'BRUTE_FORCE_LOCKOUT',
      status: 'Blocked',
      tamperProofHash: 'sha256:aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899',
      retentionDays: 730,
    },
    adaptiveLearning: {
      baselineDriftDetected: true,
      feedbackReceived: 'Confirmed Insider Threat',
      thresholdAdjustment: 'Origin IP automatically banned for 48 hours; account locked pending hardware token reset.',
      postAdaptationDecision: 'BLOCK',
      learningNote: 'Automated rate-limiter trigger coupled with dynamic risk score threshold drop for repeat failed auth.',
    },
  },
  {
    id: 'scenario-geo-anomaly',
    title: 'Impossible Travel Geolocation Velocity Jump',
    category: 'anomaly',
    badge: 'TRAVEL ANOMALY',
    severity: 'Medium',
    description: 'Active session recorded in Chicago, followed 22 minutes later by access request originating from Singapore.',
    storyline: 'Geographic physical distance of 14,800 km traversed in under 30 minutes indicates credential compromise or unauthorized VPN relaying.',
    actor: {
      id: 'SAL0418',
      name: 'Devon Miller',
      role: 'Enterprise Account Executive',
      department: 'Global Enterprise Sales',
      avatarColor: 'bg-blue-600',
      riskScore: 0.62,
      normalHours: '08:00 - 18:00 CST',
    },
    request: {
      resource: 'crm://salesforce/enterprise-deals/q4-pipeline',
      action: 'VIEW_SALES_PIPELINE',
      timestamp: '2026-11-16 16:30:11 UTC',
      ip: '118.200.12.8',
      location: 'Singapore, SG (Commercial ISP)',
      device: 'HW-DELL-SALES-29',
      dataSensitivity: 'Internal',
    },
    behaviorTelemetry: {
      usbEvents: 0,
      sessionDurationSeconds: 4200,
      failedLogins: 0,
      fileAccessCount: 8,
      afterHoursFlag: false,
      geoDistanceKm: 14800,
      behavioralRiskIndex: 0.64,
      indicators: {
        'indicator.usb': 0.0,
        'indicator.session': 4200.0,
        'indicator.login': 0.0,
        'indicator.file': 8.0,
      },
      componentScores: {
        'component_score.usb': 0.0,
        'component_score.session': 0.25,
        'component_score.login': 0.1,
      },
    },
    aiEvaluation: {
      championModel: 'XGBoost',
      threatProbability: 0.638,
      confidence: 0.638,
      thresholdBand: 'WARN',
      predictedClass: 'insider',
      modelComparison: {
        xgboost: 0.638,
        randomForest: 0.621,
        decisionTree: 0.61,
        logisticRegression: 0.585,
      },
    },
    explainability: {
      summary: 'Impossible travel velocity detected: 14,800 km distance jump in 22 minutes implies concurrent session hijacking or unapproved proxy.',
      topFactors: [
        {
          feature: 'behavioral_risk_index',
          label: 'Geographic Displacement Velocity',
          value: '40,360 km/h implied speed',
          shapValue: 0.35,
          direction: 'increases_risk',
          rationale: 'Physically impossible travel velocity between consecutive access events.',
        },
        {
          feature: 'component_score.session',
          label: 'Overlapping Concurrent Sessions',
          value: '2 distinct IP ranges',
          shapValue: 0.18,
          direction: 'increases_risk',
          rationale: 'Chicago session remains open while Singapore session initiates.',
        },
      ],
      counterfactualHint: 'Terminating stale Chicago session and approving FIDO2 security key lowers risk to 0.14.',
    },
    policyDecision: {
      action: 'WARN',
      policyId: 'POL-GEO-005',
      policyName: 'Impossible Geolocation Travel Velocity',
      matchedRules: ['velocity_km_per_hr > 1000', 'concurrent_sessions >= 2'],
      enforcementType: 'Security Alert',
    },
    auditLog: {
      eventId: 'EVT-20261116-1630-WRN',
      timestamp: '2026-11-16 16:30:12.339Z',
      eventType: 'GEO_VELOCITY_ALERT',
      status: 'Warned',
      tamperProofHash: 'sha256:3344556677889900aabbccddeeff0011223344556677889900aabbccddeeff33',
      retentionDays: 180,
    },
    adaptiveLearning: {
      baselineDriftDetected: true,
      feedbackReceived: 'Approved by Analyst',
      thresholdAdjustment: 'Sales executive confirmed flight layover with commercial aircraft in-flight Wi-Fi tunneling.',
      postAdaptationDecision: 'ALLOW',
      learningNote: 'Added in-flight satellite ISP ASN to commercial travel exemption whitelist.',
    },
  },
  {
    id: 'scenario-policy-adaptation',
    title: 'Adaptive Learning Feedback Loop Calibration',
    category: 'adaptation',
    badge: 'ADAPTIVE FEEDBACK',
    severity: 'Medium',
    description: 'DevOps engineer running routine terraform cloud migration script that triggered false-positive threshold before analyst calibration.',
    storyline: 'Automated policy engine adapts threshold from 0.70 to 0.78 based on verified analyst feedback, eliminating recurring friction.',
    actor: {
      id: 'OPS0551',
      name: 'Chloe Martin',
      role: 'Staff DevOps & Cloud Architect',
      department: 'Platform Engineering',
      avatarColor: 'bg-sky-600',
      riskScore: 0.58,
      normalHours: '08:00 - 17:00 EST',
    },
    request: {
      resource: 's3://cloud-infra-terraform-states/production/state.json',
      action: 'TERRAFORM_STATE_APPLY',
      timestamp: '2026-11-16 18:45:00 UTC',
      ip: '10.88.2.14',
      location: 'Austin, US (Data Center VPN)',
      device: 'HW-DEVOPS-RUNNER-02',
      dataSensitivity: 'Confidential',
    },
    behaviorTelemetry: {
      usbEvents: 0,
      sessionDurationSeconds: 32000,
      failedLogins: 0,
      fileAccessCount: 95,
      afterHoursFlag: true,
      geoDistanceKm: 0,
      behavioralRiskIndex: 0.56,
      indicators: {
        'indicator.usb': 0.0,
        'indicator.session': 32000.0,
        'indicator.login': 0.0,
        'indicator.file': 95.0,
      },
      componentScores: {
        'component_score.usb': 0.0,
        'component_score.file': 0.65,
        'component_score.session': 0.38,
      },
    },
    aiEvaluation: {
      championModel: 'XGBoost',
      threatProbability: 0.572,
      confidence: 0.572,
      thresholdBand: 'WARN',
      predictedClass: 'insider',
      modelComparison: {
        xgboost: 0.572,
        randomForest: 0.558,
        decisionTree: 0.54,
        logisticRegression: 0.519,
      },
    },
    explainability: {
      summary: 'Initial evaluation generated WARN due to 95 file touch events during evening migration maintenance window.',
      topFactors: [
        {
          feature: 'component_score.file',
          label: 'Terraform State Pulls',
          value: '95 state operations',
          shapValue: 0.26,
          direction: 'increases_risk',
          rationale: 'Volume exceeds daily developer baseline but matches approved weekly platform deployment.',
        },
        {
          feature: 'component_score.session',
          label: 'Maintenance Window Extension',
          value: '32,000s duration',
          shapValue: 0.16,
          direction: 'increases_risk',
          rationale: 'Operations team scheduled authorized cloud migration change RFC-8891.',
        },
      ],
      counterfactualHint: 'Associating RFC ticket approval auto-reclassifies action to ALLOW.',
    },
    policyDecision: {
      action: 'WARN',
      policyId: 'POL-DEVOPS-002',
      policyName: 'Infrastructure Automation Review',
      matchedRules: ['high_velocity_file_read == True', 'after_hours == True'],
      enforcementType: 'Security Alert',
    },
    auditLog: {
      eventId: 'EVT-20261116-1845-ADP',
      timestamp: '2026-11-16 18:45:01.810Z',
      eventType: 'ADAPTIVE_FEEDBACK_RECORDED',
      status: 'Warned',
      tamperProofHash: 'sha256:556677889900aabbccddeeff0011223344556677889900aabbccddeeff556677',
      retentionDays: 365,
    },
    adaptiveLearning: {
      baselineDriftDetected: true,
      feedbackReceived: 'False Positive',
      thresholdAdjustment: 'Threshold for DevOps group tuned from 0.55 -> 0.65 during RFC deployment windows.',
      postAdaptationDecision: 'ALLOW',
      learningNote: 'SecOps analyst marked false positive. Active feedback loop calibrated threshold, eliminating 84% future alerts for scheduled platform deployments.',
    },
  },
]

export function getAllScenarios(): DemoScenario[] {
  return DEMO_SCENARIOS
}

export function getScenarioById(id: string): DemoScenario | undefined {
  return DEMO_SCENARIOS.find((s) => s.id === id)
}

export function getScenariosByCategory(category: string): DemoScenario[] {
  if (category === 'all') return DEMO_SCENARIOS
  return DEMO_SCENARIOS.filter((s) => s.category === category)
}

export function exportScenarioAsJson(scenario: DemoScenario): string {
  return JSON.stringify(scenario, null, 2)
}

export function exportAllScenariosAsJson(): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      platform: 'An Explainable Adaptive AI Privacy Firewall for Detecting Unauthorized Data Access Using User Behavior Analytics',
      scenarioCount: DEMO_SCENARIOS.length,
      scenarios: DEMO_SCENARIOS,
    },
    null,
    2
  )
}

export function exportScenariosAsCsv(): string {
  const headers = [
    'id',
    'title',
    'category',
    'severity',
    'actor_name',
    'actor_role',
    'actor_dept',
    'resource',
    'action',
    'threat_probability',
    'decision',
    'champion_model',
    'top_shap_factor',
    'tamper_proof_hash',
    'feedback_status',
  ]

  const rows = DEMO_SCENARIOS.map((s) => [
    `"${s.id}"`,
    `"${s.title.replace(/"/g, '""')}"`,
    `"${s.category}"`,
    `"${s.severity}"`,
    `"${s.actor.name}"`,
    `"${s.actor.role}"`,
    `"${s.actor.department}"`,
    `"${s.request.resource}"`,
    `"${s.request.action}"`,
    s.aiEvaluation.threatProbability.toFixed(3),
    `"${s.policyDecision.action}"`,
    `"${s.aiEvaluation.championModel}"`,
    `"${(s.explainability.topFactors[0]?.label ?? '').replace(/"/g, '""')}"`,
    `"${s.auditLog.tamperProofHash}"`,
    `"${s.adaptiveLearning.feedbackReceived}"`,
  ])

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
