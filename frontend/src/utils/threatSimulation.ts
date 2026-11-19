import type {
  CampaignIntelligenceRecord,
  ExecutiveThreatKPIs,
  ExecutiveThreatSummary,
  GlobalAttackPoint,
  GlobalThreatFeedItem,
  HuntingPrebuiltQuery,
  IocRecord,
  MalwareAnalysisRecord,
  MitreCoverageItem,
  RelationshipGraphNode,
  ThreatIntelSource,
  ThreatIntelligenceSnapshot,
  ThreatPrediction,
  ThreatTimelinePoint,
} from '../types/threatIntel'

export const INITIAL_THREAT_FEED: GlobalThreatFeedItem[] = [
  {
    id: 'THR-9011',
    name: 'Cobalt Strike Malleable C2 Beaconing',
    category: 'APT Activity',
    severity: 'Critical',
    confidence: 98.4,
    source: 'AlienVault OTX & Internal Firewall',
    country: 'Netherlands',
    countryCode: 'NL',
    timestamp: '2 mins ago',
    mitreTactic: 'Command & Control',
    mitreTechniqueId: 'T1071.001',
    threatActor: 'APT29 (Cozy Bear)',
    targetIndustry: 'Technology & AI Labs',
    status: 'Blocked',
    description: 'Encrypted asynchronous HTTPS beaconing detected targeting internal model weights repository.',
  },
  {
    id: 'THR-9012',
    name: 'LockBit 3.0 Extortion Ransomware Variant',
    category: 'Ransomware',
    severity: 'Critical',
    confidence: 96.8,
    source: 'CISA Alert AA24-110A',
    country: 'Russia',
    countryCode: 'RU',
    timestamp: '4 mins ago',
    mitreTactic: 'Impact',
    mitreTechniqueId: 'T1486',
    threatActor: 'LockBit Supporter Group',
    targetIndustry: 'Healthcare & Finance',
    status: 'Blocked',
    description: 'Automated VSS shadow copy deletion attempts intercepted by behavioral storage filter.',
  },
  {
    id: 'THR-9013',
    name: 'DarkVault-Infostealer Removable Drive Payload',
    category: 'Data Exfiltration',
    severity: 'Critical',
    confidence: 99.1,
    source: 'Internal Firewall Telemetry',
    country: 'United States',
    countryCode: 'US',
    timestamp: '7 mins ago',
    mitreTactic: 'Exfiltration',
    mitreTechniqueId: 'T1052.001',
    threatActor: 'Insider Threat / Malicious Actor',
    targetIndustry: 'OpenAI Research Labs (Finance)',
    status: 'Blocked',
    description: 'Hardware USB storage bulk export intercepted during non-business hours.',
  },
  {
    id: 'THR-9014',
    name: 'Volt Typhoon Living-off-the-Land Discovery',
    category: 'APT Activity',
    severity: 'High',
    confidence: 94.2,
    source: 'VirusTotal Intelligence',
    country: 'China',
    countryCode: 'CN',
    timestamp: '11 mins ago',
    mitreTactic: 'Discovery',
    mitreTechniqueId: 'T1087',
    threatActor: 'Volt Typhoon (Bronze Silhouette)',
    targetIndustry: 'Critical Infrastructure & Cloud Gateway',
    status: 'Active',
    description: 'WMI and PowerShell command burst querying Active Directory group memberships.',
  },
  {
    id: 'THR-9015',
    name: 'EvilGTL Spear-Phishing Credential Harvester',
    category: 'Phishing',
    severity: 'High',
    confidence: 91.5,
    source: 'AbuseIPDB',
    country: 'Germany',
    countryCode: 'DE',
    timestamp: '18 mins ago',
    mitreTactic: 'Credential Access',
    mitreTechniqueId: 'T1566.002',
    threatActor: 'Storm-0501',
    targetIndustry: 'Human Resources & Payroll',
    status: 'Mitigated',
    description: 'Reverse proxy AitM phishing domain mimicking corporate Single Sign-On portal.',
  },
  {
    id: 'THR-9016',
    name: 'Node Package PyPI Dependency Backdoor',
    category: 'Supply Chain Attack',
    severity: 'High',
    confidence: 95.0,
    source: 'NVD / CVE-2026-44819',
    country: 'Singapore',
    countryCode: 'SG',
    timestamp: '25 mins ago',
    mitreTactic: 'Initial Access',
    mitreTechniqueId: 'T1195.002',
    threatActor: 'Lazarus Group (Hidden Cobra)',
    targetIndustry: 'Software Engineering & DevOps',
    status: 'Monitoring',
    description: 'Malicious telemetry hook embedded in transit dependencies targeting developer machines.',
  },
]

export const INITIAL_IOCS: IocRecord[] = [
  {
    id: 'ioc-1',
    value: '185.220.101.44',
    type: 'IP Address',
    reputation: 'Malicious',
    firstSeen: '2026-11-10',
    lastSeen: '2026-11-15 09:42',
    detectionCount: 148,
    confidence: 99,
    malwareFamily: 'Cobalt Strike',
    associatedCampaign: 'Operation SilentVault',
    riskScore: 98,
    firewallMatches: 42,
    tags: ['Tor Exit', 'C2', 'CobaltStrike'],
    geo: 'Amsterdam, Netherlands',
  },
  {
    id: 'ioc-2',
    value: 'api-telemetry-sync.org',
    type: 'Domain',
    reputation: 'Malicious',
    firstSeen: '2026-11-12',
    lastSeen: '2026-11-15 08:15',
    detectionCount: 89,
    confidence: 95,
    malwareFamily: 'DarkVault-Stealer',
    associatedCampaign: 'TitanStealer Global',
    riskScore: 94,
    firewallMatches: 19,
    tags: ['Exfiltration', 'FastFlux', 'Phishing'],
    geo: 'Frankfurt, Germany',
  },
  {
    id: 'ioc-3',
    value: 'https://auth-gateway-verify.com/login/oauth/session',
    type: 'URL',
    reputation: 'High Risk',
    firstSeen: '2026-11-14',
    lastSeen: '2026-11-15 07:30',
    detectionCount: 64,
    confidence: 92,
    malwareFamily: 'EvilProxy',
    associatedCampaign: 'Storm-0501 Credential Spray',
    riskScore: 89,
    firewallMatches: 8,
    tags: ['AitM', 'CredentialHarvesting'],
    geo: 'Singapore',
  },
  {
    id: 'ioc-4',
    value: 'security-alert@internal-verify-payroll.net',
    type: 'Email',
    reputation: 'Suspicious',
    firstSeen: '2026-11-13',
    lastSeen: '2026-11-15 06:10',
    detectionCount: 31,
    confidence: 88,
    malwareFamily: 'PhishTrap',
    associatedCampaign: 'HR Payroll Lure',
    riskScore: 76,
    firewallMatches: 5,
    tags: ['SpoofedSender', 'SpearPhishing'],
    geo: 'United States',
  },
  {
    id: 'ioc-5',
    value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    type: 'SHA256',
    reputation: 'Malicious',
    firstSeen: '2026-11-01',
    lastSeen: '2026-11-15 09:12',
    detectionCount: 412,
    confidence: 100,
    malwareFamily: 'LockBit 3.0 Black',
    associatedCampaign: 'LockBit Ransom Campaign',
    riskScore: 99,
    firewallMatches: 67,
    tags: ['Ransomware', 'Locker', 'YARA-Hit'],
    geo: 'Global',
  },
  {
    id: 'ioc-6',
    value: '44d88612fea8a8f36de82e1278abb02f',
    type: 'MD5',
    reputation: 'Malicious',
    firstSeen: '2026-11-05',
    lastSeen: '2026-11-15 08:44',
    detectionCount: 187,
    confidence: 97,
    malwareFamily: 'DarkVault-Infostealer',
    associatedCampaign: 'Operation SilentVault',
    riskScore: 95,
    firewallMatches: 23,
    tags: ['Keylogger', 'TokenTheft'],
    geo: 'United States',
  },
  {
    id: 'ioc-7',
    value: 'win_update_service_x64.exe',
    type: 'File Name',
    reputation: 'Suspicious',
    firstSeen: '2026-11-08',
    lastSeen: '2026-11-15 04:22',
    detectionCount: 52,
    confidence: 89,
    malwareFamily: 'Masquerade Dropper',
    associatedCampaign: 'LivingOffTheLand-01',
    riskScore: 82,
    firewallMatches: 12,
    tags: ['Masquerading', 'ProcessHollowing'],
    geo: 'United States',
  },
  {
    id: 'ioc-8',
    value: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\NetHelperDrv',
    type: 'Registry Key',
    reputation: 'High Risk',
    firstSeen: '2026-11-09',
    lastSeen: '2026-11-15 03:15',
    detectionCount: 44,
    confidence: 94,
    malwareFamily: 'Rootkit-ShadowDriver',
    associatedCampaign: 'Volt Typhoon Recon',
    riskScore: 91,
    firewallMatches: 14,
    tags: ['Persistence', 'ServiceInstall'],
    geo: 'China',
  },
  {
    id: 'ioc-9',
    value: 'svchost_helper.exe',
    type: 'Process Name',
    reputation: 'Suspicious',
    firstSeen: '2026-11-11',
    lastSeen: '2026-11-15 02:40',
    detectionCount: 38,
    confidence: 86,
    malwareFamily: 'Trojan.MultiInject',
    associatedCampaign: 'Endpoint Beaconing',
    riskScore: 79,
    firewallMatches: 7,
    tags: ['ProcessInjection', 'DefenseEvasion'],
    geo: 'United States',
  },
  {
    id: 'ioc-10',
    value: 'CN=OpenAI Research Fake Staging Root, O=ThreatCorp, C=NL',
    type: 'Certificate',
    reputation: 'Malicious',
    firstSeen: '2026-11-04',
    lastSeen: '2026-11-15 01:10',
    detectionCount: 92,
    confidence: 96,
    malwareFamily: 'FakeCert MitM',
    associatedCampaign: 'AitM Proxy Infrastructure',
    riskScore: 93,
    firewallMatches: 18,
    tags: ['InvalidCert', 'SslInspectionAlert'],
    geo: 'Netherlands',
  },
]

export const INITIAL_MALWARE_LIST: MalwareAnalysisRecord[] = [
  {
    id: 'mal-01',
    name: 'DarkVault-Infostealer v4.2',
    sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    md5: '44d88612fea8a8f36de82e1278abb02f',
    malwareFamily: 'DarkVault',
    type: 'Credential & Session Stealer',
    riskScore: 96,
    sandboxVerdict: 'Malicious (C2 / Trojan)',
    networkActivity: [
      'Encrypted TLS POST to 185.220.101.44:443',
      'DNS query to api-telemetry-sync.org',
      'HTTP beaconing interval: 45 seconds jittered',
    ],
    registryChanges: [
      'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\TelemetryService',
      'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\DisableAntiSpyware = 1',
    ],
    persistence: 'Scheduled task "WindowsCacheOptimizer" executing every boot at SYSTEM level.',
    processesSpawned: ['cmd.exe /c whoami', 'powershell.exe -enc SQBFAFgA...', 'rundll32.exe'],
    droppedFiles: [
      'C:\\ProgramData\\svchost_payload.dll',
      'C:\\Users\\Public\\tokens_dump.tmp',
    ],
    dnsRequests: ['api-telemetry-sync.org', 'c2-gate-us-east.net', 'tor-exit-resolver.nl'],
    yaraMatches: ['rule_darkvault_heuristic_v4', 'detect_memory_hollowing_generic'],
    mitreTechniques: ['T1056.001 Keylogging', 'T1555 Credentials from Web Browsers', 'T1052 USB Exfiltration'],
  },
  {
    id: 'mal-02',
    name: 'LockBit 3.0 Black (C-Variant)',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    md5: 'd41d8cd98f00b204e9800998ecf8427e',
    malwareFamily: 'LockBit',
    type: 'Hybrid Encryption Locker',
    riskScore: 99,
    sandboxVerdict: 'Ransomware Locker',
    networkActivity: [
      'ARP sweep across subnet /24 seeking SMB shares (Port 445)',
      'Outbound Tor connection to lockbit777.onion',
    ],
    registryChanges: [
      'HKLM\\SYSTEM\\CurrentControlSet\\Control\\SafeBoot = Minimal',
      'WallPaper key modified to ransom message bitmap',
    ],
    persistence: 'Service installation: "LbLockerDaemon" with Recovery Restart action.',
    processesSpawned: ['vssadmin delete shadows /all /quiet', 'bcdedit /set {default} recoveryenabled No'],
    droppedFiles: ['C:\\README_RESTORE_FILES.txt', 'C:\\Windows\\System32\\lb_driver.sys'],
    dnsRequests: ['dns-beacon-pool.xyz', 'tor-gateway-route.net'],
    yaraMatches: ['rule_ransomware_lockbit3', 'detect_shadow_copy_tampering'],
    mitreTechniques: ['T1486 Data Encrypted for Impact', 'T1490 Inhibit System Recovery', 'T1021.002 SMB Access'],
  },
]

export const PREBUILT_HUNTS: HuntingPrebuiltQuery[] = [
  {
    id: 'hunt-01',
    name: 'Impossible Travel & Geovelocity Spikes',
    category: 'Impossible Travel',
    description: 'Identifies identities authenticating from distinct geographical locations requiring speed > 800 km/h.',
    querySyntax: 'event.type == "auth" && diff(geo.location) > 1000km && time_delta < 1h',
    matchingEvents: 3,
    users: ['Sara (Medical Researcher)', 'Mike (Infrastructure Engineer)'],
    devices: ['Unmanaged BYOD Laptop', 'Linux Terminal'],
    resources: ['Medical Records Archive (MongoDB)', 'Kubernetes Cluster'],
    timeline: [
      { time: '08:10:00', event: 'SSO Login in San Francisco, CA', user: 'Sara', severity: 'Low' },
      { time: '08:15:30', event: 'Impossible Travel Authentication from Singapore', user: 'Sara', severity: 'Critical' },
    ],
    riskScore: 88,
    confidence: 96,
    status: 'Detected',
  },
  {
    id: 'hunt-02',
    name: 'Removable USB Storage Volume Bulk Exfiltration',
    category: 'USB Exfiltration',
    description: 'Correlates mass database export queries with physical USB volume mount telemetry.',
    querySyntax: 'device.usb_mounted == true && access.operation == "Bulk Download" && access.risk >= 75',
    matchingEvents: 1,
    users: ['John (Finance Analyst)'],
    devices: ['Dell Latitude + SanDisk 128GB USB'],
    resources: ['Finance Database (Postgres)'],
    timeline: [
      { time: '02:14:22', event: 'USB Removable Drive Mounted', user: 'John', severity: 'High' },
      { time: '02:14:30', event: '45,000 ledger rows query executed', user: 'John', severity: 'Critical' },
      { time: '02:14:32', event: 'Firewall Policy Enforced: HARD BLOCK', user: 'John', severity: 'Critical' },
    ],
    riskScore: 94,
    confidence: 99,
    status: 'Detected',
  },
  {
    id: 'hunt-03',
    name: 'High-Entropy DNS Tunneling & C2 Beaconing',
    category: 'DNS Tunneling',
    description: 'Searches for abnormally long DNS subdomains indicative of covert C2 payload streaming.',
    querySyntax: 'dns.query_length > 60 && dns.entropy > 4.5 && dns.record_type == "TXT"',
    matchingEvents: 0,
    users: [],
    devices: [],
    resources: ['Edge DNS Resolvers'],
    timeline: [],
    riskScore: 15,
    confidence: 92,
    status: 'Clear',
  },
  {
    id: 'hunt-04',
    name: 'Monorepo Source Code Scraping Over Public VPN',
    category: 'Data Exfiltration',
    description: 'Detects rapid automated git clone operations originating from non-corporate VPN tunnels.',
    querySyntax: 'app.service == "GitLab" && git.operation == "clone" && network.vpn_type == "Public/Tor"',
    matchingEvents: 2,
    users: ['Emma (Data Scientist)'],
    devices: ['Tor Exit Node Terminal'],
    resources: ['GitLab Enterprise Monorepo'],
    timeline: [
      { time: '10:02:10', event: 'New SSH Key Registered from Netherlands', user: 'Emma', severity: 'High' },
      { time: '10:05:40', event: '18 GB Core AI Codebase Clone Intercepted', user: 'Emma', severity: 'Critical' },
    ],
    riskScore: 91,
    confidence: 98,
    status: 'Detected',
  },
  {
    id: 'hunt-05',
    name: 'Lateral Movement via WMI and SMB Remote Exec',
    category: 'Lateral Movement',
    description: 'Detects lateral traversal across application hosts using stolen administrative service tokens.',
    querySyntax: 'network.dst_port in [135, 445] && process.name in ["wmic.exe", "psexec.exe"]',
    matchingEvents: 0,
    users: [],
    devices: [],
    resources: ['Database Cluster'],
    timeline: [],
    riskScore: 10,
    confidence: 89,
    status: 'Clear',
  },
]

export const INITIAL_CAMPAIGNS: CampaignIntelligenceRecord[] = [
  {
    id: 'cmp-01',
    name: 'Operation SilentVault',
    threatActor: 'APT29 (Cozy Bear)',
    country: 'Russia',
    industryTargets: ['Artificial Intelligence Research', 'Defense Contracting', 'Financial Technology'],
    timeline: '2026-Q3 to Present (Active Campaign)',
    infrastructure: ['185.220.101.44', 'api-telemetry-sync.org', 'sec-token-validate.xyz'],
    malwareUsed: ['Cobalt Strike Beacon', 'DarkVault-Infostealer', 'Custom PyPI Backdoor'],
    objectives: 'Exfiltrate proprietary AI model weights, financial reserves, and confidential research docs.',
    mitreAttack: ['T1078 Valid Accounts', 'T1052 USB Exfiltration', 'T1071 C2 Communication'],
    confidence: 97,
    status: 'Active',
  },
  {
    id: 'cmp-02',
    name: 'TitanStealer Corporate Harvest',
    threatActor: 'Storm-0501 Cybercrime Syndicate',
    country: 'Eastern Europe',
    industryTargets: ['Healthcare Systems', 'Enterprise SaaS', 'Cloud Gateways'],
    timeline: '2026-10 to Present',
    infrastructure: ['auth-gateway-verify.com', '194.26.29.112'],
    malwareUsed: ['EvilProxy AitM', 'Infostealer.RedLine'],
    objectives: 'Harvest session cookies, bypass MFA via reverse proxy phishing, and compromise cloud tenancies.',
    mitreAttack: ['T1566 Phishing', 'T1556 Modify Authentication', 'T1530 Cloud Data Access'],
    confidence: 93,
    status: 'Active',
  },
  {
    id: 'cmp-03',
    name: 'Lazarus SwiftDrain Banking Wedge',
    threatActor: 'Lazarus Group (Hidden Cobra)',
    country: 'North Korea',
    industryTargets: ['Financial Ledgers', 'Cryptocurrency Escrow', 'Banking APIs'],
    timeline: '2026-08 to Present (Monitoring)',
    infrastructure: ['swift-relay-stage.lan', '103.225.88.14'],
    malwareUsed: ['FastCash.v2', 'BlindHawk Trojan'],
    objectives: 'Manipulate ledger databases and inject synthetic transaction payloads.',
    mitreAttack: ['T1195 Supply Chain', 'T1055 Process Injection', 'T1485 Data Destruction'],
    confidence: 91,
    status: 'Monitoring',
  },
]

export const RELATIONSHIP_NODES: RelationshipGraphNode[] = [
  {
    id: 'node-actor',
    label: 'APT29 (Cozy Bear)',
    type: 'actor',
    status: 'hostile',
    details: 'Nation-state advanced persistent threat group focused on high-value AI research exfiltration.',
    connectedTo: ['node-campaign'],
  },
  {
    id: 'node-campaign',
    label: 'Operation SilentVault',
    type: 'campaign',
    status: 'active',
    details: 'Coordinated espionage campaign utilizing AitM proxies and removable USB payloads.',
    connectedTo: ['node-malware', 'node-domain'],
  },
  {
    id: 'node-malware',
    label: 'DarkVault-Infostealer',
    type: 'malware',
    status: 'compromised',
    details: 'SHA256: a1b2c3d4... custom binary designed to scrape browser sessions and memory heaps.',
    connectedTo: ['node-domain', 'node-endpoint'],
  },
  {
    id: 'node-domain',
    label: 'api-telemetry-sync.org',
    type: 'domain',
    status: 'hostile',
    details: 'Fast-flux C2 destination resolving to rotating European Tor and VPS IP pools.',
    connectedTo: ['node-ip'],
  },
  {
    id: 'node-ip',
    label: '185.220.101.44 (Amsterdam)',
    type: 'ip',
    status: 'hostile',
    details: 'Hardened command server hosting listener on Port 443 with self-signed certificate.',
    connectedTo: ['node-endpoint'],
  },
  {
    id: 'node-endpoint',
    label: 'Dell Latitude (John - Finance)',
    type: 'endpoint',
    status: 'compromised',
    details: 'Employee workstation where unauthorized USB media was mounted at 02:14 AM.',
    connectedTo: ['node-firewall'],
  },
  {
    id: 'node-firewall',
    label: 'AI Privacy Firewall (Engine)',
    type: 'firewall',
    status: 'blocked',
    details: 'Behavioral ML model classified session as 94% threat. HARD BLOCK enforced.',
    connectedTo: ['node-database'],
  },
  {
    id: 'node-database',
    label: 'Finance Database (Postgres)',
    type: 'database',
    status: 'protected',
    details: 'Zero records leaked. Target asset quarantined and downstream data intact.',
    connectedTo: [],
  },
]

export const GLOBAL_ATTACK_POINTS: GlobalAttackPoint[] = [
  { country: 'United States', countryCode: 'US', lat: 37.77, lng: -122.41, attackCount: 384, campaign: 'Operation SilentVault', threatLevel: 'Critical', primaryThreatType: 'USB Exfiltration & AitM' },
  { country: 'Russia', countryCode: 'RU', lat: 55.75, lng: 37.61, attackCount: 842, campaign: 'Operation SilentVault', threatLevel: 'Critical', primaryThreatType: 'APT29 / Cobalt Strike C2' },
  { country: 'Netherlands', countryCode: 'NL', lat: 52.36, lng: 4.90, attackCount: 492, campaign: 'TitanStealer Global', threatLevel: 'High', primaryThreatType: 'Tor Proxy Relays' },
  { country: 'China', countryCode: 'CN', lat: 39.90, lng: 116.40, attackCount: 618, campaign: 'Volt Typhoon Recon', threatLevel: 'High', primaryThreatType: 'WMI Living-off-the-Land' },
  { country: 'Singapore', countryCode: 'SG', lat: 1.35, lng: 103.81, attackCount: 215, campaign: 'Lazarus SwiftDrain', threatLevel: 'High', primaryThreatType: 'Impossible Travel / Proxies' },
  { country: 'Germany', countryCode: 'DE', lat: 52.52, lng: 13.40, attackCount: 168, campaign: 'Storm-0501 Phish', threatLevel: 'Medium', primaryThreatType: 'Credential Phishing' },
  { country: 'North Korea', countryCode: 'KP', lat: 39.03, lng: 125.75, attackCount: 320, campaign: 'Lazarus SwiftDrain', threatLevel: 'Critical', primaryThreatType: 'Supply Chain Injection' },
  { country: 'Brazil', countryCode: 'BR', lat: -15.79, lng: -47.88, attackCount: 142, campaign: 'Banking Trojan Wave', threatLevel: 'Medium', primaryThreatType: 'Credential Spraying' },
]

export const MITRE_COVERAGE_DATA: MitreCoverageItem[] = [
  { tactic: 'Initial Access', techniqueId: 'T1566 / T1195', techniqueName: 'Phishing & Supply Chain', coverage: 'Covered', ruleCount: 14, detectionMechanism: 'Email Gateway + Behavioral Proxy Shield' },
  { tactic: 'Execution', techniqueId: 'T1059 / T1204', techniqueName: 'Command & Scripting Interpreter', coverage: 'Covered', ruleCount: 22, detectionMechanism: 'Endpoint Process Telemetry Monitor' },
  { tactic: 'Persistence', techniqueId: 'T1078 / T1136', techniqueName: 'Valid Accounts & Scheduled Tasks', coverage: 'Covered', ruleCount: 18, detectionMechanism: 'IAM & SSO Session Anomaly Engine' },
  { tactic: 'Privilege Escalation', techniqueId: 'T1068 / T1548', techniqueName: 'Abuse Elevation Control', coverage: 'Covered', ruleCount: 12, detectionMechanism: 'Role-Based Access Guardrail' },
  { tactic: 'Defense Evasion', techniqueId: 'T1090 / T1070', techniqueName: 'Proxy Relays & Indicator Tampering', coverage: 'Covered', ruleCount: 26, detectionMechanism: 'Anonymizing Network Filter' },
  { tactic: 'Credential Access', techniqueId: 'T1110 / T1555', techniqueName: 'Brute Force & Password Spraying', coverage: 'Covered', ruleCount: 31, detectionMechanism: 'Adaptive Behavioral Risk Index' },
  { tactic: 'Discovery', techniqueId: 'T1087 / T1082', techniqueName: 'Account & System Discovery', coverage: 'Partial', ruleCount: 9, detectionMechanism: 'REST API Burst Spike Analyzer' },
  { tactic: 'Lateral Movement', techniqueId: 'T1021 / T1550', techniqueName: 'Remote Services & Pass the Hash', coverage: 'Covered', ruleCount: 16, detectionMechanism: 'East-West Microsegmentation Firewall' },
  { tactic: 'Collection', techniqueId: 'T1005 / T1530', techniqueName: 'Data from Local & Cloud Repos', coverage: 'Covered', ruleCount: 28, detectionMechanism: 'Explainable AI Threat Classifier' },
  { tactic: 'Exfiltration', techniqueId: 'T1052 / T1048', techniqueName: 'Exfiltration Over USB & Alternative Net', coverage: 'Covered', ruleCount: 34, detectionMechanism: 'Adaptive Hardware & Payload Isolation' },
  { tactic: 'Command & Control', techniqueId: 'T1071 / T1095', techniqueName: 'Application Layer Protocol C2', coverage: 'Partial', ruleCount: 11, detectionMechanism: 'High-Entropy DNS & TLS Analyzer' },
  { tactic: 'Impact', techniqueId: 'T1486 / T1485', techniqueName: 'Data Encrypted / Wiped for Impact', coverage: 'Covered', ruleCount: 15, detectionMechanism: 'Zero-Trust Storage Integrity Lock' },
]

export const THREAT_INTEL_SOURCES: ThreatIntelSource[] = [
  { name: 'MITRE ATT&CK Enterprise', provider: 'MITRE Corporation', type: 'Open Source', status: 'Synchronized', lastSync: '10 mins ago', recordsIngested: 8420, trustScore: 99 },
  { name: 'CVE Vulnerability Database', provider: 'NIST NVD', type: 'Government', status: 'Synchronized', lastSync: '15 mins ago', recordsIngested: 24150, trustScore: 98 },
  { name: 'VirusTotal Threat Intelligence', provider: 'Google Cloud Security', type: 'Commercial', status: 'Online', lastSync: '1 min ago', recordsIngested: 184000, trustScore: 99 },
  { name: 'AlienVault OTX Pulse Stream', provider: 'AT&T Cybersecurity', type: 'Open Source', status: 'Online', lastSync: '3 mins ago', recordsIngested: 62400, trustScore: 94 },
  { name: 'AbuseIPDB Verified Blacklist', provider: 'AbuseIPDB Project', type: 'Commercial', status: 'Online', lastSync: '2 mins ago', recordsIngested: 41200, trustScore: 95 },
  { name: 'CISA Automated Threat Feeds', provider: 'US Cybersecurity & Infrastructure', type: 'Government', status: 'Synchronized', lastSync: '30 mins ago', recordsIngested: 12800, trustScore: 99 },
  { name: 'National Vulnerability Database (NVD)', provider: 'NIST Federal', type: 'Government', status: 'Synchronized', lastSync: '1 hour ago', recordsIngested: 95400, trustScore: 97 },
  { name: 'Internal AI Firewall Telemetry', provider: 'Explainable Adaptive Firewall', type: 'Internal', status: 'Online', lastSync: 'Real-time', recordsIngested: 384000, trustScore: 100 },
]

export function generate24HourThreatTimeline(): ThreatTimelinePoint[] {
  const points: ThreatTimelinePoint[] = []
  const hours = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
    '12:00', '14:00', '16:00', '18:00', '20:00', '22:00',
  ]

  hours.forEach((h, idx) => {
    const isPeak = idx >= 4 && idx <= 8
    const newThreats = Math.round(isPeak ? 18 + Math.sin(idx) * 6 : 8 + Math.cos(idx) * 3)
    const blockedThreats = Math.round(newThreats * 0.85)
    const investigatedThreats = Math.round(newThreats * 0.95)
    const resolvedThreats = Math.round(newThreats * 0.75)
    const iocMatches = Math.round(newThreats * 3.4)

    points.push({
      time: h,
      newThreats,
      blockedThreats,
      investigatedThreats,
      resolvedThreats,
      iocMatches,
    })
  })

  return points
}

let tickCounter = 0

export function generateThreatIntelligenceSnapshot(): ThreatIntelligenceSnapshot {
  tickCounter++

  const knownThreats = 1420 + tickCounter * 2
  const newThreatsToday = 84 + (tickCounter % 8)
  const activeCampaigns = 7
  const blockedCampaigns = 5
  const highSeverityThreats = 28 + (tickCounter % 3)
  const threatIntelSources = 8
  const avgConfidenceScore = +(96.4 + Math.sin(tickCounter * 0.2) * 0.4).toFixed(1)
  const activeHuntingSessions = 12
  const avgIocMatchRate = +(4.82 + Math.cos(tickCounter * 0.3) * 0.2).toFixed(2)
  const globalThreatIndex = Math.min(100, Math.round(72 + Math.sin(tickCounter * 0.4) * 4))

  const kpis: ExecutiveThreatKPIs = {
    knownThreats,
    newThreatsToday,
    activeCampaigns,
    blockedCampaigns,
    highSeverityThreats,
    threatIntelSources,
    avgConfidenceScore,
    activeHuntingSessions,
    avgIocMatchRate,
    globalThreatIndex,
    trend: {
      threats: +8.4,
      campaigns: +14.2,
      blocks: +9.1,
      confidence: +0.3,
      index: +2.5,
    },
  }

  const prediction: ThreatPrediction = {
    tomorrowVolume: Math.round(newThreatsToday * 1.12),
    volumeChangePercent: +12.0,
    likelyAttackType: 'Physical Media & Removable Drive Data Exfiltration',
    emergingMalware: 'DarkVault-Infostealer v4.2 Variant',
    highestRiskDept: 'Finance & Treasury Operations',
    expectedCampaign: 'Operation SilentVault (APT29)',
    predictedRiskTrend: 'Escalating',
    confidence: 94.6,
    probability: 88.5,
    explanation:
      'Predictive neural time-series model projects a 12% increase in off-hours exfiltration attempts over the next 24 hours. Removable storage and AitM credential harvesting are predicted to remain primary threat vectors.',
  }

  const summary: ExecutiveThreatSummary = {
    posture: globalThreatIndex >= 75 ? 'Critical' : 'Elevated',
    narrative: `Global threat posture is currently ${globalThreatIndex >= 75 ? 'CRITICAL' : 'ELEVATED'} (Threat Index: ${globalThreatIndex}/100). The primary adversary observed is APT29 (Cozy Bear) spearheading "Operation SilentVault" targeting Finance and Core AI IP assets. The Explainable Adaptive AI Privacy Firewall has successfully contained 100% of data exfiltration attempts through automated hardware USB isolation and session invalidation. Active threat hunting sessions are ongoing across 12 high-priority indicators.`,
    topThreatActor: 'APT29 (Cozy Bear / Midnight Blizzard)',
    mostTargetedAssets: [
      'Finance Database (Postgres)',
      'Medical Records Archive (MongoDB)',
      'GitLab Enterprise Monorepo',
    ],
    emergingRisks: [
      'AitM reverse-proxy phishing attempting Single Sign-On bypass',
      'Removable USB storage mounting during non-business hours',
      'Impossible travel anomalies via foreign Tor and VPN exit nodes',
    ],
    recommendedActions: [
      'Enforce strict hardware USB write-blocking across Finance and Engineering workstations.',
      'Mandate FIDO2 hardware tokens for all Single Sign-On authentications.',
      'Maintain automated edge gateway drop policies for known APT29 proxy subnets.',
    ],
    businessImpact: 'Zero unauthorized records exfiltrated. Regulatory posture under SOC 2 and HIPAA fully maintained.',
    confidenceLevel: 97.2,
  }

  return {
    timestamp: new Date().toLocaleTimeString(),
    kpis,
    threatFeed: INITIAL_THREAT_FEED,
    iocs: INITIAL_IOCS,
    malwareList: INITIAL_MALWARE_LIST,
    huntingQueries: PREBUILT_HUNTS,
    campaigns: INITIAL_CAMPAIGNS,
    relationshipNodes: RELATIONSHIP_NODES,
    attackMap: GLOBAL_ATTACK_POINTS,
    mitreCoverage: MITRE_COVERAGE_DATA,
    timeline: generate24HourThreatTimeline(),
    prediction,
    summary,
    sources: THREAT_INTEL_SOURCES,
  }
}

/**
 * Client-Side Exporters
 */
export function exportThreatIntelToJSON(snapshot: ThreatIntelligenceSnapshot): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `threat-intelligence-report-${Date.now()}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

export function exportThreatIntelToCSV(snapshot: ThreatIntelligenceSnapshot): void {
  const rows: string[] = []
  rows.push('Threat ID,Name,Category,Severity,Confidence,Threat Actor,Target Industry,Country,Status')
  snapshot.threatFeed.forEach((t) => {
    rows.push(
      `"${t.id}","${t.name}","${t.category}","${t.severity}",${t.confidence}%,"${t.threatActor}","${t.targetIndustry}","${t.country}","${t.status}"`
    )
  })
  rows.push('')
  rows.push('IOC Value,Type,Reputation,Risk Score,Detection Count,Malware Family,Campaign')
  snapshot.iocs.forEach((i) => {
    rows.push(
      `"${i.value}","${i.type}","${i.reputation}",${i.riskScore},${i.detectionCount},"${i.malwareFamily}","${i.associatedCampaign}"`
    )
  })

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', csvContent)
  downloadAnchor.setAttribute('download', `threat-intelligence-iocs-${Date.now()}.csv`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

export function exportThreatIntelToPDF(): void {
  window.print()
}
