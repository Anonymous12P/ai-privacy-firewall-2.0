import type {
  FirewallDecision,
  Incident,
  IncidentKPIs,
  IncidentPriority,
  IncidentSeverity,
} from '../types/incident'

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-8801',
    title: 'Unauthorized USB Data Exfiltration Attempt',
    summary:
      'High-velocity bulk export of sensitive ledger records from Finance Database to an unauthorized external USB flash drive during non-business hours.',
    severity: 'Critical',
    status: 'Open',
    priority: 'P1-Critical',
    department: 'Finance',
    affectedUser: 'John',
    role: 'Finance Analyst',
    targetResource: 'Finance Database (Postgres)',
    operation: 'Bulk Download',
    device: 'Dell Latitude (Unmanaged USB)',
    sourceIp: '192.168.10.45',
    country: 'United States',
    riskScore: 92,
    threatScore: 94,
    aiConfidence: 98.7,
    modelUsed: 'Ensemble (Random Forest + XGBoost)',
    firewallDecision: 'BLOCK',
    detectionRule: 'RULE-EXFIL-001: Physical Removable Media Exfiltration Prevention',
    triggeredPolicy: 'Strict Removable Media Data Exfiltration Prevention',
    createdTime: '2026-11-15 09:42:15',
    assignedAnalyst: 'Robert (Security Administrator)',
    investigationNotes: [
      'Initial behavioral trigger fired: USB storage mounted at 02:14 AM.',
      'Firewall behavioral engine detected 45,000 sensitive records queried in 12 seconds.',
      'Active hardware isolation invoked via automated policy enforcement.',
    ],
    tags: ['Exfiltration', 'USB', 'Off-Hours', 'Postgres', 'Finance'],
    behaviorIndicators: ['USB Storage Attached', 'After-Hours Login', 'Mass Download', 'HTTP API Burst'],
    evidenceScore: 96,
    aiSummary:
      'The employee attempted to access Finance Database using a BYOD endpoint outside business hours. USB storage was attached and a large outbound download was initiated. The Explainable AI model assigned a threat score of 94%. Policy "Strict Removable Media Data Exfiltration Prevention" triggered. Firewall blocked the request automatically. MITRE techniques indicate likely data exfiltration. Recommended containment actions have been generated.',
    timeline: [
      {
        id: 'tl-1',
        timestamp: '02:14:10',
        title: 'Authentication Succeeded',
        description: 'User John authenticated via Single Sign-On from local subnet.',
        type: 'auth',
        status: 'info',
        actor: 'Identity Provider (Okta)',
      },
      {
        id: 'tl-2',
        timestamp: '02:14:22',
        title: 'Removable USB Storage Mounted',
        description: 'SanDisk 128GB Ultra USB attached to local endpoint.',
        type: 'behavior',
        status: 'alert',
        actor: 'Endpoint MDM Agent',
      },
      {
        id: 'tl-3',
        timestamp: '02:14:30',
        title: 'Mass Data Download Initiated',
        description: 'Query requested 45,000 ledger rows from Finance Database.',
        type: 'behavior',
        status: 'alert',
        actor: 'PostgreSQL Gateway',
      },
      {
        id: 'tl-4',
        timestamp: '02:14:31',
        title: 'Firewall AI Model Evaluated',
        description: 'Ensemble model classified session as high-risk threat (Score: 94%).',
        type: 'firewall',
        status: 'warning',
        actor: 'Adaptive AI Engine',
      },
      {
        id: 'tl-5',
        timestamp: '02:14:32',
        title: 'Policy Enforced: BLOCK',
        description: 'Strict Removable Media Policy dropped all active TCP sockets.',
        type: 'policy',
        status: 'alert',
        actor: 'Firewall Enforcement Engine',
      },
      {
        id: 'tl-6',
        timestamp: '02:15:00',
        title: 'Administrator Assigned',
        description: 'SOC incident INC-2026-8801 routed to Robert (SecOps Admin).',
        type: 'investigation',
        status: 'info',
        actor: 'SOC Workflow Automation',
      },
    ],
    evidence: [
      {
        id: 'ev-1',
        category: 'Authentication Logs',
        title: 'SSO Session Telemetry',
        details: {
          'Protocol': 'SAML 2.0 / MFA Push',
          'Client IP': '192.168.10.45',
          'Geo': 'San Francisco, CA',
          'MFA Verified': true,
          'Auth Timestamp': '2026-11-15T02:14:10Z',
        },
        riskScore: 24,
        flagged: false,
      },
      {
        id: 'ev-2',
        category: 'Firewall Logs',
        title: 'Enforcement Drop Telemetry',
        details: {
          'Action': 'BLOCK (TCP RST)',
          'Bytes Intercepted': '14.8 MB',
          'Rule ID': 'RULE-EXFIL-001',
          'Latency': '2.4 ms',
          'Target Port': '5432 (Postgres)',
        },
        riskScore: 95,
        flagged: true,
      },
      {
        id: 'ev-3',
        category: 'Behavior Indicators',
        title: 'High-Velocity Data Streaming',
        details: {
          'USB Serial': '4C530001250918115201',
          'Volume Extracted': '45,000 rows',
          'Off-Hours Window': '02:14 AM (Outside 08:00-18:00)',
          'Burst Rate': '3,750 rows/sec',
        },
        riskScore: 98,
        flagged: true,
      },
      {
        id: 'ev-4',
        category: 'Network Connections',
        title: 'Socket Trace Analysis',
        details: {
          'Source Port': '49822',
          'Destination': 'db-finance.internal.lan:5432',
          'Packets Sent': '1,420',
          'Packets Dropped': '1,420',
          'Protocol': 'TLS 1.3',
        },
        riskScore: 88,
        flagged: true,
      },
    ],
    mitreMatrix: [
      {
        tactic: 'Credential Access',
        techniqueId: 'T1078',
        techniqueName: 'Valid Accounts',
        detected: true,
        confidence: 90,
        matchedIndicator: 'Legitimate credentials used during off-hours',
      },
      {
        tactic: 'Collection',
        techniqueId: 'T1005',
        techniqueName: 'Data from Local System',
        detected: true,
        confidence: 96,
        matchedIndicator: 'Bulk SQL dump query execution',
      },
      {
        tactic: 'Exfiltration',
        techniqueId: 'T1052.001',
        techniqueName: 'Exfiltration over Physical Medium: USB',
        detected: true,
        confidence: 99,
        matchedIndicator: 'Outbound write to mounted flash volume',
      },
      {
        tactic: 'Defense Evasion',
        techniqueId: 'T1070',
        techniqueName: 'Indicator Removal on Host',
        detected: false,
        confidence: 12,
        matchedIndicator: 'No log purging detected',
      },
      {
        tactic: 'Lateral Movement',
        techniqueId: 'T1021',
        techniqueName: 'Remote Services',
        detected: false,
        confidence: 15,
        matchedIndicator: 'Single-node access pattern',
      },
    ],
    attackGraph: [
      { id: 'ag-1', label: 'User', sublabel: 'John (Finance)', type: 'user', status: 'compromised', details: 'Off-hours credentials' },
      { id: 'ag-2', label: 'Endpoint', sublabel: 'Dell Laptop + USB', type: 'endpoint', status: 'compromised', details: 'Removable media attached' },
      { id: 'ag-3', label: 'Application', sublabel: 'Finance Portal', type: 'application', status: 'suspicious', details: 'Bulk export invoked' },
      { id: 'ag-4', label: 'Firewall', sublabel: 'AI Privacy Engine', type: 'firewall', status: 'blocked', details: 'HARD BLOCK ENFORCED' },
      { id: 'ag-5', label: 'Identity', sublabel: 'Okta / IAM', type: 'identity', status: 'protected', details: 'Privileges quarantined' },
      { id: 'ag-6', label: 'Database', sublabel: 'Postgres Cluster', type: 'database', status: 'protected', details: 'Data integrity preserved' },
      { id: 'ag-7', label: 'Sensitive Files', sublabel: 'Ledgers & Payroll', type: 'sensitive_files', status: 'protected', details: 'Zero records leaked' },
    ],
    behaviorTimeline: [
      { indicator: 'Login', detected: true, severity: 'Low', time: '02:14:10', description: 'SSO login verified' },
      { indicator: 'USB', detected: true, severity: 'Critical', time: '02:14:22', description: 'SanDisk USB mounted' },
      { indicator: 'VPN', detected: false, severity: 'Benign', time: '02:14:25', description: 'On-prem connection' },
      { indicator: 'HTTP Burst', detected: true, severity: 'High', time: '02:14:30', description: 'API query burst spike' },
      { indicator: 'Email', detected: false, severity: 'Benign', time: '02:14:30', description: 'No mail relay' },
      { indicator: 'Downloads', detected: true, severity: 'Critical', time: '02:14:30', description: '45,000 ledger rows' },
      { indicator: 'After Hours', detected: true, severity: 'Medium', time: '02:14:31', description: 'Session at 02:14 AM' },
      { indicator: 'Geo Change', detected: false, severity: 'Benign', time: '02:14:31', description: 'Local IP match' },
      { indicator: 'Failed Logins', detected: false, severity: 'Benign', time: '02:14:31', description: '0 failed attempts' },
    ],
    recommendations: [
      {
        id: 'rec-1',
        action: 'Quarantine Device & Revoke USB Permissions',
        priority: 'Critical',
        reason: 'Physical storage exfiltration attempts violate corporate data security baseline.',
        estimatedImpact: 'Terminates endpoint removable drive access without impacting cloud services.',
        executed: false,
      },
      {
        id: 'rec-2',
        action: 'Disable User Credentials in Okta',
        priority: 'High',
        reason: 'Prevent secondary credential abuse until analyst interview is concluded.',
        estimatedImpact: 'Suspends active SSO access across all 18 enterprise applications.',
        executed: false,
      },
      {
        id: 'rec-3',
        action: 'Force Password Reset & Hardware Token Re-binding',
        priority: 'High',
        reason: 'Eliminate potential credential compromise risks.',
        estimatedImpact: 'Requires employee to verify identity in person with Security Operations.',
        executed: false,
      },
      {
        id: 'rec-4',
        action: 'Notify Department Manager & Legal Counsel',
        priority: 'Medium',
        reason: 'Mandatory compliance reporting under SOC 2 Section CC6.8.',
        estimatedImpact: 'Dispatches automated summary digest to Finance Director.',
        executed: false,
      },
    ],
  },
  {
    id: 'INC-2026-8802',
    title: 'HIPAA Clinical Records Unauthorized Extraction',
    summary:
      'Attempted bulk retrieval of patient clinical records from unmanaged BYOD device with impossible travel telemetry detected.',
    severity: 'High',
    status: 'Investigating',
    priority: 'P2-High',
    department: 'Healthcare',
    affectedUser: 'Sara',
    role: 'Medical Researcher',
    targetResource: 'Medical Records Archive (MongoDB)',
    operation: 'Export',
    device: 'MacBook Air (Unregistered BYOD)',
    sourceIp: '185.220.101.5',
    country: 'Singapore',
    riskScore: 78,
    threatScore: 82,
    aiConfidence: 96.4,
    modelUsed: 'Random Forest',
    firewallDecision: 'RESTRICT',
    detectionRule: 'RULE-HIPAA-002: Protected Health Information Perimeter Shield',
    triggeredPolicy: 'HIPAA Patient Privacy & Clinical Data Isolation Policy',
    createdTime: '2026-11-15 08:15:30',
    assignedAnalyst: 'Emma (Security Auditor)',
    investigationNotes: [
      'Travel velocity anomaly: User was authenticated in California 45 minutes prior to Singapore connection.',
      'Firewall placed subject into RESTRICT mode: read-only masked telemetry with audit logging enabled.',
    ],
    tags: ['HIPAA', 'BYOD', 'Impossible Travel', 'Healthcare', 'MongoDB'],
    behaviorIndicators: ['BYOD Device', 'Impossible Travel', 'Failed Logins (x3)', 'Public VPN Relay'],
    evidenceScore: 92,
    aiSummary:
      'The employee accessed Medical Records Archive using an unmanaged BYOD device from Singapore, 45 minutes after domestic login. Multiple failed passwords preceded successful entry. The Explainable AI model flagged high risk (82%). Policy "HIPAA Patient Privacy Policy" triggered. Firewall restricted the request and enabled full payload logging.',
    timeline: [
      {
        id: 'tl-201',
        timestamp: '08:10:05',
        title: 'Failed Logins Detected',
        description: '3 consecutive password failures from Tor Exit Node IP.',
        type: 'auth',
        status: 'warning',
        actor: 'Identity Provider (Okta)',
      },
      {
        id: 'tl-202',
        timestamp: '08:12:18',
        title: 'Authentication Succeeded with BYOD',
        description: 'MFA prompt approved on secondary device.',
        type: 'auth',
        status: 'info',
        actor: 'Identity Provider (Okta)',
      },
      {
        id: 'tl-203',
        timestamp: '08:15:20',
        title: 'Impossible Travel Flagged',
        description: 'Physical displacement velocity: 12,500 km/h between sessions.',
        type: 'behavior',
        status: 'alert',
        actor: 'Behavioral GeoEngine',
      },
      {
        id: 'tl-204',
        timestamp: '08:15:30',
        title: 'Firewall Policy Enforced: RESTRICT',
        description: 'PII columns masked, download throttled to 10 records/min.',
        type: 'policy',
        status: 'warning',
        actor: 'Firewall Enforcement Engine',
      },
    ],
    evidence: [
      {
        id: 'ev-201',
        category: 'Network Connections',
        title: 'Geo-IP Anomalies',
        details: {
          'Previous IP': '64.120.45.12 (San Francisco, CA)',
          'Current IP': '185.220.101.5 (Singapore)',
          'Delta Time': '45 minutes',
          'ASN': 'Tor Exit Relay Provider',
        },
        riskScore: 94,
        flagged: true,
      },
    ],
    mitreMatrix: [
      {
        tactic: 'Defense Evasion',
        techniqueId: 'T1090',
        techniqueName: 'Proxy: Anonymizing Network',
        detected: true,
        confidence: 94,
        matchedIndicator: 'Known commercial VPN / Tor relay address',
      },
      {
        tactic: 'Credential Access',
        techniqueId: 'T1110',
        techniqueName: 'Brute Force: Password Spraying',
        detected: true,
        confidence: 88,
        matchedIndicator: 'Multiple failed attempts prior to successful token issue',
      },
    ],
    attackGraph: [
      { id: 'ag-21', label: 'User', sublabel: 'Sara (Research)', type: 'user', status: 'suspicious', details: 'Compromised credentials' },
      { id: 'ag-22', label: 'Endpoint', sublabel: 'Unmanaged BYOD', type: 'endpoint', status: 'compromised', details: 'Foreign exit node' },
      { id: 'ag-23', label: 'Application', sublabel: 'EHR Medical Portal', type: 'application', status: 'suspicious', details: 'Export request' },
      { id: 'ag-24', label: 'Firewall', sublabel: 'AI Privacy Engine', type: 'firewall', status: 'blocked', details: 'RESTRICT & MASK ENFORCED' },
      { id: 'ag-25', label: 'Identity', sublabel: 'Okta Directory', type: 'identity', status: 'protected', details: 'Audit stream active' },
      { id: 'ag-26', label: 'Database', sublabel: 'MongoDB Cluster', type: 'database', status: 'protected', details: 'Patient records masked' },
      { id: 'ag-27', label: 'Sensitive Files', sublabel: 'Clinical Notes', type: 'sensitive_files', status: 'protected', details: 'Zero leakage' },
    ],
    behaviorTimeline: [
      { indicator: 'Login', detected: true, severity: 'Medium', time: '08:12:18', description: 'SSO via foreign IP' },
      { indicator: 'USB', detected: false, severity: 'Benign', time: '08:12:20', description: 'No USB storage' },
      { indicator: 'VPN', detected: true, severity: 'High', time: '08:12:25', description: 'Anonymizing proxy' },
      { indicator: 'HTTP Burst', detected: false, severity: 'Benign', time: '08:12:30', description: 'Normal HTTP cadence' },
      { indicator: 'Email', detected: false, severity: 'Benign', time: '08:12:30', description: 'No email dispatch' },
      { indicator: 'Downloads', detected: true, severity: 'Medium', time: '08:15:20', description: 'Filtered query batch' },
      { indicator: 'After Hours', detected: false, severity: 'Benign', time: '08:15:20', description: 'Business hours' },
      { indicator: 'Geo Change', detected: true, severity: 'Critical', time: '08:15:30', description: 'Impossible Travel (SG)' },
      { indicator: 'Failed Logins', detected: true, severity: 'High', time: '08:10:05', description: '3 failed attempts' },
    ],
    recommendations: [
      {
        id: 'rec-21',
        action: 'Revoke User Session & Invalidate Tokens',
        priority: 'Critical',
        reason: 'Impossible travel strongly indicates session token theft or man-in-the-middle attack.',
        estimatedImpact: 'Forces immediate re-authentication with hardware FIDO2 key.',
        executed: false,
      },
      {
        id: 'rec-22',
        action: 'Block Foreign Subnet on Edge Gateway',
        priority: 'High',
        reason: 'Prevent persistent reconnaissance from anonymizing proxy pool.',
        estimatedImpact: 'Drops incoming traffic from ASN across all perimeter interfaces.',
        executed: false,
      },
    ],
  },
  {
    id: 'INC-2026-8803',
    title: 'Off-Hours High-Velocity API Burst Spike',
    summary:
      'Sudden burst of 850 Kubernetes deployment manifest queries outside change management window.',
    severity: 'Medium',
    status: 'Contained',
    priority: 'P3-Medium',
    department: 'Infrastructure',
    affectedUser: 'Mike',
    role: 'Infrastructure Engineer',
    targetResource: 'Kubernetes Cluster (Production)',
    operation: 'Write',
    device: 'Linux Workstation (Corporate MDM)',
    sourceIp: '10.0.12.88',
    country: 'United States',
    riskScore: 48,
    threatScore: 52,
    aiConfidence: 94.2,
    modelUsed: 'XGBoost',
    firewallDecision: 'WARN',
    detectionRule: 'RULE-BURST-004: Off-Hours High-Velocity API Burst Advisory',
    triggeredPolicy: 'Off-Hours High-Velocity API Burst Advisory',
    createdTime: '2026-11-15 03:22:10',
    assignedAnalyst: 'Mike (SecOps Lead)',
    investigationNotes: [
      'Automated pipeline retry script malfunctioned during scheduled nightly backup.',
      'Analyst confirmed no malicious intent; script timeout parameter adjusted.',
    ],
    tags: ['Kubernetes', 'API Burst', 'Infrastructure', 'Off-Hours'],
    behaviorIndicators: ['HTTP Burst Spikes', 'After-Hours Window'],
    evidenceScore: 84,
    aiSummary:
      'High-frequency REST API calls were observed against production cluster secrets at 03:22 AM. Threat score evaluated at 52%. Firewall issued a WARN decision with automated rate-limiting. Verified as misconfigured CI/CD retry loop.',
    timeline: [
      {
        id: 'tl-301',
        timestamp: '03:20:00',
        title: 'CI/CD Worker Sync Started',
        description: 'Nightly reconciliation job triggered by GitLab pipeline.',
        type: 'auth',
        status: 'info',
        actor: 'GitLab Runner Agent',
      },
      {
        id: 'tl-302',
        timestamp: '03:22:10',
        title: 'HTTP Burst Velocity Spike',
        description: '850 requests/sec generated against Kubernetes API.',
        type: 'behavior',
        status: 'warning',
        actor: 'Adaptive AI Engine',
      },
      {
        id: 'tl-303',
        timestamp: '03:22:12',
        title: 'Rate-Limit Invoked: WARN',
        description: 'Connection throttled to 20 req/s to prevent resource exhaustion.',
        type: 'policy',
        status: 'info',
        actor: 'Firewall Enforcement Engine',
      },
    ],
    evidence: [],
    mitreMatrix: [],
    attackGraph: [
      { id: 'ag-31', label: 'User', sublabel: 'Mike (DevOps)', type: 'user', status: 'protected', details: 'Verified corporate ID' },
      { id: 'ag-32', label: 'Endpoint', sublabel: 'CI/CD Node', type: 'endpoint', status: 'suspicious', details: 'Loop execution' },
      { id: 'ag-33', label: 'Application', sublabel: 'GitLab CI', type: 'application', status: 'suspicious', details: 'Manifest sync' },
      { id: 'ag-34', label: 'Firewall', sublabel: 'AI Privacy Engine', type: 'firewall', status: 'blocked', details: 'THROTTLE APPLIED' },
      { id: 'ag-35', label: 'Identity', sublabel: 'Service Token', type: 'identity', status: 'protected', details: 'Scoped permissions' },
      { id: 'ag-36', label: 'Database', sublabel: 'Kube Etcd', type: 'database', status: 'protected', details: 'Load balanced' },
      { id: 'ag-37', label: 'Sensitive Files', sublabel: 'Secrets Manifest', type: 'sensitive_files', status: 'protected', details: 'Zero leakage' },
    ],
    behaviorTimeline: [
      { indicator: 'Login', detected: true, severity: 'Benign', time: '03:20:00', description: 'Service account auth' },
      { indicator: 'USB', detected: false, severity: 'Benign', time: '03:20:00', description: 'No USB' },
      { indicator: 'VPN', detected: false, severity: 'Benign', time: '03:20:00', description: 'Internal VPC' },
      { indicator: 'HTTP Burst', detected: true, severity: 'High', time: '03:22:10', description: '850 req/s burst' },
      { indicator: 'Email', detected: false, severity: 'Benign', time: '03:22:10', description: 'No email' },
      { indicator: 'Downloads', detected: false, severity: 'Benign', time: '03:22:10', description: 'No bulk download' },
      { indicator: 'After Hours', detected: true, severity: 'Low', time: '03:22:10', description: 'Nightly window' },
      { indicator: 'Geo Change', detected: false, severity: 'Benign', time: '03:22:10', description: 'Internal IP' },
      { indicator: 'Failed Logins', detected: false, severity: 'Benign', time: '03:22:10', description: '0 failed attempts' },
    ],
    recommendations: [
      {
        id: 'rec-31',
        action: 'Tune CI/CD Exponential Backoff Parameter',
        priority: 'Medium',
        reason: 'Prevents synthetic API burst spikes from tripping security alerts.',
        estimatedImpact: 'Reconfigures retry logic in manifest repository.',
        executed: true,
      },
    ],
  },
  {
    id: 'INC-2026-8804',
    title: 'Proprietary Git Repository Source Code Scraping',
    summary:
      'Rapid sequential git clone operations targeting core AI model weights and firewall algorithms from unknown foreign endpoint.',
    severity: 'Critical',
    status: 'Open',
    priority: 'P1-Critical',
    department: 'Engineering',
    affectedUser: 'Emma',
    role: 'Data Scientist',
    targetResource: 'GitLab Enterprise Monorepo',
    operation: 'Export',
    device: 'Linux (Tor Exit Node)',
    sourceIp: '194.26.29.112',
    country: 'Netherlands',
    riskScore: 89,
    threatScore: 91,
    aiConfidence: 97.8,
    modelUsed: 'Ensemble (Random Forest + XGBoost)',
    firewallDecision: 'BLOCK',
    detectionRule: 'RULE-IP-005: Intellectual Property Code Integrity Shield',
    triggeredPolicy: 'Proprietary Source Code Repository Integrity Policy',
    createdTime: '2026-11-15 10:05:40',
    assignedAnalyst: 'Robert (Security Administrator)',
    investigationNotes: [
      'Anomalous SSH key addition detected 3 minutes before bulk git clone.',
      'Firewall dropped SSH handshake and revoked token immediately.',
    ],
    tags: ['IP Theft', 'GitLab', 'Code Scraping', 'Engineering', 'Tor'],
    behaviorIndicators: ['Public VPN / Proxy', 'Large Outbound Clone', 'Failed Logins (x5)', 'Impossible Travel'],
    evidenceScore: 98,
    aiSummary:
      'Subject attempted to scrape proprietary source repositories via SSH tunnel originating from an overseas proxy. AI model identified anomalous access velocity (Score: 91%). Policy "Proprietary Source Code Repository Integrity Policy" dropped the connection.',
    timeline: [
      {
        id: 'tl-401',
        timestamp: '10:02:10',
        title: 'New SSH Key Registered',
        description: 'ED25519 key added from web interface.',
        type: 'auth',
        status: 'warning',
        actor: 'GitLab Security',
      },
      {
        id: 'tl-402',
        timestamp: '10:05:40',
        title: 'Full Monorepo Clone Triggered',
        description: '18 GB codebase repository pull requested.',
        type: 'behavior',
        status: 'alert',
        actor: 'GitLab Server',
      },
      {
        id: 'tl-403',
        timestamp: '10:05:42',
        title: 'Firewall Policy Enforced: BLOCK',
        description: 'Connection reset, IP blacklisted across edge.',
        type: 'policy',
        status: 'alert',
        actor: 'Firewall Enforcement Engine',
      },
    ],
    evidence: [],
    mitreMatrix: [
      {
        tactic: 'Collection',
        techniqueId: 'T1530',
        techniqueName: 'Data from Cloud Storage Object',
        detected: true,
        confidence: 94,
        matchedIndicator: 'Bulk source repository archiving',
      },
      {
        tactic: 'Exfiltration',
        techniqueId: 'T1048',
        techniqueName: 'Exfiltration Over Alternative Protocol',
        detected: true,
        confidence: 96,
        matchedIndicator: 'Outbound encrypted SSH tunnel',
      },
    ],
    attackGraph: [
      { id: 'ag-41', label: 'User', sublabel: 'Emma (Data Science)', type: 'user', status: 'compromised', details: 'Stolen token' },
      { id: 'ag-42', label: 'Endpoint', sublabel: 'Hostile Proxy Node', type: 'endpoint', status: 'compromised', details: 'Foreign exit IP' },
      { id: 'ag-43', label: 'Application', sublabel: 'GitLab Enterprise', type: 'application', status: 'suspicious', details: 'Clone initiated' },
      { id: 'ag-44', label: 'Firewall', sublabel: 'AI Privacy Engine', type: 'firewall', status: 'blocked', details: 'HARD BLOCK ACTIVE' },
      { id: 'ag-45', label: 'Identity', sublabel: 'SSH Keystore', type: 'identity', status: 'protected', details: 'Key revoked' },
      { id: 'ag-46', label: 'Database', sublabel: 'Git Repositories', type: 'database', status: 'protected', details: 'Tree intact' },
      { id: 'ag-47', label: 'Sensitive Files', sublabel: 'AI Model Weights', type: 'sensitive_files', status: 'protected', details: 'Zero leakage' },
    ],
    behaviorTimeline: [
      { indicator: 'Login', detected: true, severity: 'High', time: '10:02:10', description: 'Foreign IP auth' },
      { indicator: 'USB', detected: false, severity: 'Benign', time: '10:02:10', description: 'No physical media' },
      { indicator: 'VPN', detected: true, severity: 'Critical', time: '10:02:15', description: 'Known Tor relay' },
      { indicator: 'HTTP Burst', detected: false, severity: 'Benign', time: '10:05:40', description: 'Standard clone rate' },
      { indicator: 'Email', detected: false, severity: 'Benign', time: '10:05:40', description: 'No email' },
      { indicator: 'Downloads', detected: true, severity: 'Critical', time: '10:05:40', description: '18 GB codebase' },
      { indicator: 'After Hours', detected: false, severity: 'Benign', time: '10:05:40', description: 'Daytime' },
      { indicator: 'Geo Change', detected: true, severity: 'Critical', time: '10:05:40', description: 'Netherlands IP' },
      { indicator: 'Failed Logins', detected: true, severity: 'High', time: '10:01:00', description: '5 failed passwords' },
    ],
    recommendations: [
      {
        id: 'rec-41',
        action: 'Revoke Compromised Personal Access Token & SSH Keys',
        priority: 'Critical',
        reason: 'Prevents rogue automated tooling from accessing git projects.',
        estimatedImpact: 'Immediately invalidates all API and git credentials.',
        executed: false,
      },
    ],
  },
  {
    id: 'INC-2026-8805',
    title: 'Payroll API Mass Export Advisory',
    summary:
      'HR system query requesting employee salary and tax records exported to external staging server.',
    severity: 'Medium',
    status: 'Investigating',
    priority: 'P3-Medium',
    department: 'Human Resources',
    affectedUser: 'Alice',
    role: 'HR Manager',
    targetResource: 'Payroll API / HR Portal',
    operation: 'Bulk Download',
    device: 'ThinkPad X1 (Corporate Managed)',
    sourceIp: '10.0.14.22',
    country: 'United States',
    riskScore: 56,
    threatScore: 58,
    aiConfidence: 92.5,
    modelUsed: 'Decision Tree',
    firewallDecision: 'WARN',
    detectionRule: 'RULE-HR-003: Confidential Employee Compensation Guardrail',
    triggeredPolicy: 'Confidential Compensation Data Access Policy',
    createdTime: '2026-11-15 09:12:00',
    assignedAnalyst: 'Robert (Security Administrator)',
    investigationNotes: [
      'Alice confirmed quarterly tax filing process; requested temporary privilege extension.',
    ],
    tags: ['Payroll', 'HR', 'Compensation', 'Internal'],
    behaviorIndicators: ['Mass Download', 'Sensitive Resource Query'],
    evidenceScore: 78,
    aiSummary:
      'Bulk download of sensitive payroll records was flagged by the decision tree classifier. Threat score: 58%. Firewall issued a warning challenge requiring confirmation code.',
    timeline: [],
    evidence: [],
    mitreMatrix: [],
    attackGraph: [],
    behaviorTimeline: [],
    recommendations: [],
  },
  {
    id: 'INC-2026-8806',
    title: 'Routine Pull Request Code Sync',
    summary:
      'Standard developer git fetch and code review operation within expected branch parameters.',
    severity: 'Low',
    status: 'Resolved',
    priority: 'P4-Low',
    department: 'Engineering',
    affectedUser: 'Pavan',
    role: 'Senior Software Engineer',
    targetResource: 'GitLab Enterprise Monorepo',
    operation: 'Read',
    device: 'MacBook Pro MDM',
    sourceIp: '10.0.8.14',
    country: 'United States',
    riskScore: 12,
    threatScore: 10,
    aiConfidence: 99.1,
    modelUsed: 'Ensemble',
    firewallDecision: 'ALLOW',
    detectionRule: 'RULE-BASELINE-99: Standard Enterprise Role-Based Access Baseline',
    triggeredPolicy: 'Standard Enterprise Role-Based Access Baseline',
    createdTime: '2026-11-15 08:30:00',
    closedTime: '2026-11-15 08:35:00',
    assignedAnalyst: 'Robert (Security Administrator)',
    investigationNotes: ['Audited as benign authorized engineering workflow. Case closed.'],
    tags: ['Baseline', 'Allowed', 'Engineering', 'Resolved'],
    behaviorIndicators: ['Corporate MDM Device', 'Dedicated VPN IP'],
    evidenceScore: 99,
    aiSummary:
      'Routine access request fully verified under enterprise baseline policies. All telemetry normal. Zero threat flags.',
    timeline: [],
    evidence: [],
    mitreMatrix: [],
    attackGraph: [],
    behaviorTimeline: [],
    recommendations: [],
  },
]

export function computeIncidentKPIs(incidents: Incident[]): IncidentKPIs {
  const criticalIncidents = incidents.filter((i) => i.severity === 'Critical').length
  const highIncidents = incidents.filter((i) => i.severity === 'High').length
  const openCases = incidents.filter((i) => i.status === 'Open').length
  const investigating = incidents.filter((i) => i.status === 'Investigating').length
  const resolved = incidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length

  const containedCount = incidents.filter(
    (i) =>
      i.status === 'Contained' ||
      i.status === 'Resolved' ||
      i.status === 'Closed' ||
      i.firewallDecision === 'BLOCK' ||
      i.firewallDecision === 'RESTRICT',
  ).length
  const containmentSuccessRate =
    incidents.length > 0 ? Number(((containedCount / incidents.length) * 100).toFixed(1)) : 99.4

  return {
    criticalIncidents,
    highIncidents,
    openCases,
    investigating,
    resolved,
    mttd: '1.2 min',
    mttr: '4.8 min',
    containmentSuccessRate,
  }
}

let simulatedIncidentCounter = 8807

const SIMULATED_EMPLOYEES = [
  { name: 'John', dept: 'Finance', role: 'Finance Analyst', res: 'Finance Database (Postgres)', op: 'Bulk Download' },
  { name: 'Sara', dept: 'Healthcare', role: 'Medical Researcher', res: 'Medical Records Archive (MongoDB)', op: 'Export' },
  { name: 'Mike', dept: 'Infrastructure', role: 'Infrastructure Engineer', res: 'Kubernetes Cluster (Production)', op: 'Write' },
  { name: 'Emma', dept: 'Engineering', role: 'Data Scientist', res: 'GitLab Enterprise Monorepo', op: 'Export' },
  { name: 'Alice', dept: 'Human Resources', role: 'HR Manager', res: 'Payroll API / HR Portal', op: 'Bulk Download' },
  { name: 'Pavan', dept: 'Engineering', role: 'Senior Software Engineer', res: 'Customer CRM Database', op: 'Read' },
]

export function generateSimulatedIncident(counter?: number): Incident {
  const num = counter ?? simulatedIncidentCounter++
  const emp = SIMULATED_EMPLOYEES[Math.floor(Math.random() * SIMULATED_EMPLOYEES.length)]!
  const isHighSeverity = Math.random() > 0.4
  const severity: IncidentSeverity = isHighSeverity ? (Math.random() > 0.5 ? 'Critical' : 'High') : 'Medium'
  const priority: IncidentPriority = severity === 'Critical' ? 'P1-Critical' : severity === 'High' ? 'P2-High' : 'P3-Medium'
  const threatScore = severity === 'Critical' ? 88 + Math.floor(Math.random() * 10) : severity === 'High' ? 70 + Math.floor(Math.random() * 15) : 40 + Math.floor(Math.random() * 20)
  const riskScore = threatScore - Math.floor(Math.random() * 5)
  const decision: FirewallDecision = threatScore >= 75 ? 'BLOCK' : threatScore >= 50 ? 'RESTRICT' : 'WARN'

  const id = `INC-2026-${num}`
  const now = new Date()
  const timeStr = now.toISOString().replace('T', ' ').slice(0, 19)

  return {
    id,
    title: `Suspicious ${emp.op} on ${emp.res}`,
    summary: `Real-time anomaly detected during ${emp.op.toLowerCase()} operation on ${emp.res} by ${emp.name} (${emp.role}).`,
    severity,
    status: 'Open',
    priority,
    department: emp.dept,
    affectedUser: emp.name,
    role: emp.role,
    targetResource: emp.res,
    operation: emp.op,
    device: 'Corporate Managed Laptop (Anomalous IP)',
    sourceIp: `10.0.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 250)}`,
    country: 'United States',
    riskScore,
    threatScore,
    aiConfidence: +(94 + Math.random() * 5).toFixed(1),
    modelUsed: 'Ensemble (Random Forest + XGBoost)',
    firewallDecision: decision,
    detectionRule: `RULE-ANOMALY-${num}: Adaptive Behavioral Anomaly Defense`,
    triggeredPolicy: `Automated ${emp.dept} Perimeter Defense Policy`,
    createdTime: timeStr,
    assignedAnalyst: 'Robert (Security Administrator)',
    investigationNotes: [
      `Automated AI alert generated at ${now.toLocaleTimeString()}.`,
      `Firewall evaluated telemetry indicators and assigned decision: ${decision}.`,
    ],
    tags: [emp.dept, emp.op, decision, 'Live Detection'],
    behaviorIndicators: ['HTTP Burst', 'Unusual Query Volume', 'Off-Hours Anomaly'],
    evidenceScore: +(85 + Math.random() * 12).toFixed(0),
    aiSummary: `Autonomous detection alert: ${emp.name} attempted ${emp.op} against ${emp.res}. The Explainable AI model flagged high threat velocity (${threatScore}%). Decision: ${decision}. Containment recommendations queued for SOC review.`,
    timeline: [
      {
        id: `tl-${num}-1`,
        timestamp: now.toLocaleTimeString(),
        title: 'Telemetry Anomaly Detected',
        description: `Firewall evaluated request for ${emp.name} with score ${threatScore}%.`,
        type: 'firewall',
        status: 'warning',
        actor: 'Adaptive AI Engine',
      },
      {
        id: `tl-${num}-2`,
        timestamp: now.toLocaleTimeString(),
        title: `Policy Enforced: ${decision}`,
        description: `Firewall applied ${decision} action to protect ${emp.res}.`,
        type: 'policy',
        status: decision === 'BLOCK' ? 'alert' : 'warning',
        actor: 'Firewall Enforcement Engine',
      },
    ],
    evidence: [
      {
        id: `ev-${num}-1`,
        category: 'Firewall Logs',
        title: 'Action Telemetry',
        details: {
          'Action': decision,
          'Resource': emp.res,
          'User': emp.name,
          'Threat Score': `${threatScore}%`,
        },
        riskScore,
        flagged: true,
      },
    ],
    mitreMatrix: [
      {
        tactic: 'Collection',
        techniqueId: 'T1005',
        techniqueName: 'Data from Local System',
        detected: true,
        confidence: 90,
        matchedIndicator: 'Data access outside routine profile',
      },
    ],
    attackGraph: [
      { id: `ag-${num}-1`, label: 'User', sublabel: emp.name, type: 'user', status: 'suspicious', details: 'Active session' },
      { id: `ag-${num}-2`, label: 'Endpoint', sublabel: 'Managed Laptop', type: 'endpoint', status: 'suspicious', details: 'Telemetry streamed' },
      { id: `ag-${num}-3`, label: 'Application', sublabel: 'Gateway Portal', type: 'application', status: 'suspicious', details: `${emp.op} invoked` },
      { id: `ag-${num}-4`, label: 'Firewall', sublabel: 'AI Privacy Engine', type: 'firewall', status: 'blocked', details: `${decision} ACTIVE` },
      { id: `ag-${num}-5`, label: 'Identity', sublabel: 'Okta SSO', type: 'identity', status: 'protected', details: 'Quarantine available' },
      { id: `ag-${num}-6`, label: 'Database', sublabel: emp.res, type: 'database', status: 'protected', details: 'Target asset guarded' },
      { id: `ag-${num}-7`, label: 'Sensitive Files', sublabel: 'Asset Storage', type: 'sensitive_files', status: 'protected', details: 'Zero breach' },
    ],
    behaviorTimeline: [
      { indicator: 'Login', detected: true, severity: 'Low', time: now.toLocaleTimeString(), description: 'Active auth' },
      { indicator: 'USB', detected: false, severity: 'Benign', time: now.toLocaleTimeString(), description: 'No USB detected' },
      { indicator: 'VPN', detected: false, severity: 'Benign', time: now.toLocaleTimeString(), description: 'Internal IP' },
      { indicator: 'HTTP Burst', detected: true, severity: 'High', time: now.toLocaleTimeString(), description: 'Burst rate detected' },
      { indicator: 'Email', detected: false, severity: 'Benign', time: now.toLocaleTimeString(), description: 'No email' },
      { indicator: 'Downloads', detected: true, severity: 'Medium', time: now.toLocaleTimeString(), description: 'Query payload' },
      { indicator: 'After Hours', detected: false, severity: 'Benign', time: now.toLocaleTimeString(), description: 'Daytime' },
      { indicator: 'Geo Change', detected: false, severity: 'Benign', time: now.toLocaleTimeString(), description: 'Domestic' },
      { indicator: 'Failed Logins', detected: false, severity: 'Benign', time: now.toLocaleTimeString(), description: '0 failed attempts' },
    ],
    recommendations: [
      {
        id: `rec-${num}-1`,
        action: 'Review Employee Access Entitlements',
        priority: 'High',
        reason: 'Verify business authorization for requested sensitive asset.',
        estimatedImpact: 'Re-evaluates role-based access policy.',
        executed: false,
      },
    ],
  }
}

/**
 * Frontend Exporters for Incident Response Center
 */
export function exportIncidentsToJSON(incidents: Incident[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(incidents, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `soc-incidents-${Date.now()}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

export function exportIncidentsToCSV(incidents: Incident[]): void {
  const rows: string[] = []
  rows.push('Incident ID,Title,Severity,Status,Priority,Department,Affected User,Resource,Threat Score,Decision,Created Time,Assigned Analyst')
  incidents.forEach((i) => {
    rows.push(
      `"${i.id}","${i.title}","${i.severity}","${i.status}","${i.priority}","${i.department}","${i.affectedUser}","${i.targetResource}",${i.threatScore},"${i.firewallDecision}","${i.createdTime}","${i.assignedAnalyst}"`
    )
  })

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', csvContent)
  downloadAnchor.setAttribute('download', `soc-incidents-${Date.now()}.csv`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

export function exportIncidentReportPDF(): void {
  window.print()
}
