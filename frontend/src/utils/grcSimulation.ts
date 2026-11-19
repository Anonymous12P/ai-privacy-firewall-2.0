import type {
  AuditItem,
  BusinessImpactItem,
  ComplianceFramework,
  ComplianceGapItem,
  ComplianceTimelineEvent,
  ExecutiveGrcKPIs,
  ExecutiveRiskSummary,
  GRCSnapshot,
  HeatmapCell,
  PolicyComplianceItem,
  RemediationTaskItem,
  RiskImpact,
  RiskItem,
  RiskLikelihood,
  RiskSeverity,
  RiskTreatmentPlan,
  SecurityControl,
  VendorItem,
} from '../types/grc'

// Base enterprise risks
const BASE_RISKS: Omit<RiskItem, 'riskScore' | 'severity'>[] = [
  {
    id: 'RSK-2026-001',
    name: 'Unauthorized Cross-Department AI Training Data Access',
    businessUnit: 'AI Engineering',
    owner: 'Dr. Elena Rostova',
    category: 'Data Privacy',
    likelihood: 4,
    impact: 5,
    status: 'Open',
    treatmentStrategy: 'Mitigate',
    dueDate: '2026-12-15',
    description: 'Researchers attempting bulk exfiltration of unmasked training corpus over unauthorized local USB and personal VPN endpoints.',
    mitigationPlan: 'Enforce real-time behavioral firewall inspection on all S3 data lakes and mandatory hardware token verification.',
    affectedAssets: ['Training Cluster Delta-9', 'S3 Training Vault', 'JupyterHub Prod'],
  },
  {
    id: 'RSK-2026-002',
    name: 'Third-Party LLM API Key Exfiltration in Git Repositories',
    businessUnit: 'Research & Development',
    owner: 'Marcus Vance',
    category: 'Identity & Access',
    likelihood: 3,
    impact: 5,
    status: 'In Review',
    treatmentStrategy: 'Mitigate',
    dueDate: '2026-11-30',
    description: 'Developer workstations caching production API keys in plain text dotfiles or uncommitted local git branches.',
    mitigationPlan: 'Deploy automated pre-commit secret scanners and integrate HashiCorp Vault dynamic ephemeral tokens.',
    affectedAssets: ['GitHub Enterprise', 'CI/CD Runners', 'Secret Vault'],
  },
  {
    id: 'RSK-2026-003',
    name: 'Sub-Processor DPA Lapses for GPU Cloud Infrastructure',
    businessUnit: 'Infrastructure & Security',
    owner: 'Sophia Lin',
    category: 'Regulatory & Compliance',
    likelihood: 2,
    impact: 4,
    status: 'Open',
    treatmentStrategy: 'Transfer',
    dueDate: '2026-12-31',
    description: 'Specialized bare-metal GPU cloud vendor operating without updated EU Standard Contractual Clauses (SCCs).',
    mitigationPlan: 'Execute updated 2026 DPA amendment with legal audit warranty or migrate compute workloads.',
    affectedAssets: ['H100 Bare-Metal Fleet', 'EU Data Hub Frankfurt'],
  },
  {
    id: 'RSK-2026-004',
    name: 'Inference Gateway DDoS and Distributed Credential Stuffing',
    businessUnit: 'Product & UX',
    owner: 'Alex Rivera',
    category: 'Network Security',
    likelihood: 4,
    impact: 4,
    status: 'Open',
    treatmentStrategy: 'Mitigate',
    dueDate: '2026-12-05',
    description: 'High volume automated brute-force attacks targeting public customer model inference gateways.',
    mitigationPlan: 'Implement adaptive Cloudflare rate-limiting and AI firewall risk score blocking for sudden HTTP bursts.',
    affectedAssets: ['Inference API Gateway', 'Customer Auth Tenant'],
  },
  {
    id: 'RSK-2026-005',
    name: 'Insider Threat: Mass Download Before Departure',
    businessUnit: 'AI Engineering',
    owner: 'Sarah Jenkins',
    category: 'Insider Threat',
    likelihood: 3,
    impact: 4,
    status: 'In Review',
    treatmentStrategy: 'Mitigate',
    dueDate: '2026-11-25',
    description: 'Resigning researchers downloading proprietary model weights and benchmark datasets during off-hours.',
    mitigationPlan: 'Auto-isolate departing personnel through HR sync and restrict download caps to 500MB daily.',
    affectedAssets: ['Model Weight Registry', 'Employee MacBook Fleets'],
  },
  {
    id: 'RSK-2026-006',
    name: 'Unencrypted S3 Backup Replication in Secondary Region',
    businessUnit: 'Infrastructure & Security',
    owner: 'David Chen',
    category: 'Cloud Infrastructure',
    likelihood: 2,
    impact: 5,
    status: 'Mitigated',
    treatmentStrategy: 'Mitigate',
    dueDate: '2026-11-10',
    description: 'Disaster recovery replication bucket created without default KMS envelope encryption.',
    mitigationPlan: 'Applied AWS SCP policy requiring AES-256 KMS key encryption for all cross-region replication.',
    affectedAssets: ['us-west-2 DR Bucket', 'KMS Key Cluster'],
  },
  {
    id: 'RSK-2026-007',
    name: 'Vendor SaaS Telemetry Ingestion Over Plaintext Webhooks',
    businessUnit: 'Operations',
    owner: 'Rachel Adams',
    category: 'Third-Party Vendor',
    likelihood: 2,
    impact: 3,
    status: 'Accepted',
    treatmentStrategy: 'Accept',
    dueDate: '2027-01-15',
    description: 'Non-sensitive application health status sent to external uptime dashboard via plain HTTP endpoint.',
    mitigationPlan: 'Risk accepted due to absence of PII; vendor notified to enable TLS 1.3 in Q1 2027.',
    affectedAssets: ['Public Status Page', 'Webhook Dispatcher'],
  },
  {
    id: 'RSK-2026-008',
    name: 'Model Inversion and Adversarial Membership Inference',
    businessUnit: 'Research & Development',
    owner: 'Dr. Tariq Mansoor',
    category: 'AI Governance',
    likelihood: 3,
    impact: 3,
    status: 'Open',
    treatmentStrategy: 'Mitigate',
    dueDate: '2027-02-01',
    description: 'Potential reconstruction of private training records via differential prompt querying against public API.',
    mitigationPlan: 'Introduce differential privacy noise injection and prompt-level entropy monitoring in the AI firewall.',
    affectedAssets: ['Public Model Endpoints', 'Synthetic Evaluation Bench'],
  },
  {
    id: 'RSK-2026-009',
    name: 'Expired Root CA Certificate on Internal Docker Registry',
    businessUnit: 'Infrastructure & Security',
    owner: 'Sophia Lin',
    category: 'Cloud Infrastructure',
    likelihood: 1,
    impact: 4,
    status: 'Open',
    treatmentStrategy: 'Mitigate',
    dueDate: '2026-12-01',
    description: 'Internal private image registry certificate expiring within 30 days without automated Let’s Encrypt renewal.',
    mitigationPlan: 'Migrate certificate authority to cert-manager with auto-rotating Vault PKI engine.',
    affectedAssets: ['Harbor Container Registry', 'Kubernetes Node Agents'],
  },
  {
    id: 'RSK-2026-010',
    name: 'Privileged IAM Role Creep Across Core Research Accounts',
    businessUnit: 'Legal & Compliance',
    owner: 'Victoria Sterling',
    category: 'Identity & Access',
    likelihood: 4,
    impact: 3,
    status: 'Open',
    treatmentStrategy: 'Mitigate',
    dueDate: '2026-12-10',
    description: 'Over 45 engineering accounts possess AdministratorAccess in staging accounts with zero expiration policy.',
    mitigationPlan: 'Implement Okta Access Requests with Just-In-Time (JIT) 4-hour privilege elevation and automatic revocation.',
    affectedAssets: ['AWS Organizations', 'Okta Privileged Access'],
  },
  {
    id: 'RSK-2026-011',
    name: 'Non-Compliant Data Retention in Customer Support Logs',
    businessUnit: 'Product & UX',
    owner: 'Rachel Adams',
    category: 'Regulatory & Compliance',
    likelihood: 3,
    impact: 2,
    status: 'Open',
    treatmentStrategy: 'Mitigate',
    dueDate: '2026-11-28',
    description: 'Customer chat interactions retaining unredacted session tokens beyond GDPR 30-day mandate.',
    mitigationPlan: 'Build daily S3 lifecycle purge rule and redact auth headers at log ingestion proxy.',
    affectedAssets: ['Zendesk Data Sink', 'Elasticsearch Logs'],
  },
  {
    id: 'RSK-2026-012',
    name: 'Hardware Tampering on High-Density Edge Racks',
    businessUnit: 'Infrastructure & Security',
    owner: 'David Chen',
    category: 'Network Security',
    likelihood: 1,
    impact: 3,
    status: 'Mitigated',
    treatmentStrategy: 'Mitigate',
    dueDate: '2026-10-30',
    description: 'Physical server enclosures lacking biometric chassis intrusion sensors in secondary colocation cage.',
    mitigationPlan: 'Installed dual-factor biometric door locks and 24/7 CCTV tamper-alert sensors with data center provider.',
    affectedAssets: ['Equinix Cage DC-2', 'Edge Appliance Fleet'],
  },
  {
    id: 'RSK-2026-013',
    name: 'Unvetted Open Source Dependencies in Core Agent Harness',
    businessUnit: 'AI Engineering',
    owner: 'Marcus Vance',
    category: 'Third-Party Vendor',
    likelihood: 4,
    impact: 4,
    status: 'Open',
    treatmentStrategy: 'Mitigate',
    dueDate: '2026-12-20',
    description: 'Python package ecosystem importing unpinned dependencies susceptible to typosquatting or malicious injection.',
    mitigationPlan: 'Enforce private Artifactory PyPI proxy with Snyk software composition analysis and hash pin verification.',
    affectedAssets: ['Python Virtualenvs', 'Docker Base Images'],
  },
  {
    id: 'RSK-2026-014',
    name: 'Lack of Formal AI Bias Audits for Enterprise Customer Models',
    businessUnit: 'Legal & Compliance',
    owner: 'Victoria Sterling',
    category: 'AI Governance',
    likelihood: 2,
    impact: 4,
    status: 'Open',
    treatmentStrategy: 'Mitigate',
    dueDate: '2027-01-30',
    description: 'Enterprise clients requiring certified fairness metrics prior to healthcare and credit deployment.',
    mitigationPlan: 'Contract third-party algorithmic auditor and integrate IBM AIF360 fairness evaluation suites.',
    affectedAssets: ['Fine-Tuned Customer Checkpoints', 'Evaluation Pipeline'],
  },
  {
    id: 'RSK-2026-015',
    name: 'Unencrypted Laptop SSD During International Executive Travel',
    businessUnit: 'Operations',
    owner: 'Sarah Jenkins',
    category: 'Data Privacy',
    likelihood: 2,
    impact: 5,
    status: 'Mitigated',
    treatmentStrategy: 'Mitigate',
    dueDate: '2026-11-05',
    description: 'Executive loaner laptops potentially bypassing FileVault/BitLocker enforced MDM policies.',
    mitigationPlan: 'MDM zero-trust policy blocks all network access unless hardware full-disk encryption is verified active.',
    affectedAssets: ['Executive MacBooks', 'MDM Enrollment Profile'],
  },
]

function getSeverity(score: number): RiskSeverity {
  if (score >= 15) return 'Critical'
  if (score >= 10) return 'High'
  if (score >= 5) return 'Medium'
  return 'Low'
}

export function generateRisks(): RiskItem[] {
  return BASE_RISKS.map((base) => {
    const riskScore = base.likelihood * base.impact
    const severity = getSeverity(riskScore)
    return {
      ...base,
      riskScore,
      severity,
    }
  })
}

export function computeRiskHeatmap(risks: RiskItem[]): HeatmapCell[] {
  const cells: HeatmapCell[] = []

  for (let impact = 5; impact >= 1; impact--) {
    for (let likelihood = 1; likelihood <= 5; likelihood++) {
      const matchingRisks = risks.filter(
        (r) => r.likelihood === likelihood && r.impact === impact,
      )
      const score = likelihood * impact
      cells.push({
        likelihood: likelihood as RiskLikelihood,
        impact: impact as RiskImpact,
        severity: getSeverity(score),
        count: matchingRisks.length,
        riskIds: matchingRisks.map((r) => r.id),
      })
    }
  }

  return cells
}

export function generateFrameworks(): ComplianceFramework[] {
  return [
    {
      name: 'ISO 27001',
      version: '2022 Revision',
      description: 'Information Security Management System (ISMS) International Standard',
      overallScore: 96.2,
      controlsPassed: 90,
      controlsFailed: 2,
      controlsPending: 1,
      totalControls: 93,
      lastAssessment: '2026-10-14',
      nextAudit: '2027-04-12',
      status: 'Compliant',
      categories: [
        { name: 'Organizational', score: 98 },
        { name: 'People', score: 94 },
        { name: 'Physical', score: 97 },
        { name: 'Technological', score: 96 },
      ],
    },
    {
      name: 'NIST CSF',
      version: '2.0 Framework',
      description: 'National Institute of Standards and Technology Cybersecurity Framework',
      overallScore: 94.8,
      controlsPassed: 102,
      controlsFailed: 4,
      controlsPending: 2,
      totalControls: 108,
      lastAssessment: '2026-09-22',
      nextAudit: '2027-03-15',
      status: 'Compliant',
      categories: [
        { name: 'Govern', score: 95 },
        { name: 'Identify', score: 96 },
        { name: 'Protect', score: 98 },
        { name: 'Detect', score: 97 },
        { name: 'Respond', score: 92 },
        { name: 'Recover', score: 91 },
      ],
    },
    {
      name: 'SOC 2',
      version: 'Type II (2026)',
      description: 'AICPA Trust Services Criteria: Security, Confidentiality & Availability',
      overallScore: 97.4,
      controlsPassed: 76,
      controlsFailed: 1,
      controlsPending: 1,
      totalControls: 78,
      lastAssessment: '2026-10-01',
      nextAudit: '2026-12-18',
      status: 'Compliant',
      categories: [
        { name: 'Security', score: 99 },
        { name: 'Availability', score: 98 },
        { name: 'Confidentiality', score: 96 },
        { name: 'Privacy', score: 97 },
      ],
    },
    {
      name: 'GDPR',
      version: 'EU 2016/679',
      description: 'General Data Protection Regulation for Cross-Border AI Data Flows',
      overallScore: 92.5,
      controlsPassed: 37,
      controlsFailed: 2,
      controlsPending: 1,
      totalControls: 40,
      lastAssessment: '2026-08-19',
      nextAudit: '2027-02-10',
      status: 'Substantial',
      categories: [
        { name: 'Lawfulness & Consent', score: 96 },
        { name: 'Data Subject Rights', score: 90 },
        { name: 'Security & Encryption', score: 98 },
        { name: 'Cross-Border Transfer', score: 86 },
      ],
    },
    {
      name: 'HIPAA',
      version: 'Security & Privacy Rule',
      description: 'Health Insurance Portability and Accountability Act for Clinical Research Data',
      overallScore: 95.0,
      controlsPassed: 57,
      controlsFailed: 2,
      controlsPending: 1,
      totalControls: 60,
      lastAssessment: '2026-09-05',
      nextAudit: '2027-05-20',
      status: 'Compliant',
      categories: [
        { name: 'Administrative Safeguards', score: 96 },
        { name: 'Physical Safeguards', score: 98 },
        { name: 'Technical Safeguards', score: 94 },
        { name: 'Organizational Req', score: 92 },
      ],
    },
    {
      name: 'PCI-DSS',
      version: 'v4.0.1 Standard',
      description: 'Payment Card Industry Data Security Standard for Enterprise SaaS Billing',
      overallScore: 98.6,
      controlsPassed: 71,
      controlsFailed: 0,
      controlsPending: 1,
      totalControls: 72,
      lastAssessment: '2026-11-01',
      nextAudit: '2027-06-15',
      status: 'Compliant',
      categories: [
        { name: 'Secure Network', score: 100 },
        { name: 'Protect Cardholder Data', score: 99 },
        { name: 'Vulnerability Mgmt', score: 98 },
        { name: 'Access Control', score: 98 },
      ],
    },
  ]
}

export function generateControls(): SecurityControl[] {
  return [
    {
      id: 'AC-01',
      framework: 'NIST CSF',
      category: 'Access Control',
      description: 'Enforce hardware-bound MFA (FIDO2 / WebAuthn) on all internal and production portals.',
      owner: 'Sophia Lin',
      status: 'Implemented',
      evidence: 'Okta Adaptive MFA policy log #OKT-9810, 100% hardware token enrollment.',
      lastTested: '2026-11-12',
      automatedVerification: true,
    },
    {
      id: 'PR.DS-01',
      framework: 'NIST CSF',
      category: 'Data Security',
      description: 'All customer data at rest must be encrypted using customer-managed AWS KMS keys.',
      owner: 'David Chen',
      status: 'Implemented',
      evidence: 'AWS Config compliance rule s3-bucket-server-side-encryption-enabled passing on 100% buckets.',
      lastTested: '2026-11-14',
      automatedVerification: true,
    },
    {
      id: 'ISO-A.9.2',
      framework: 'ISO 27001',
      category: 'User Access Provisioning',
      description: 'Formal user registration, modification, and de-registration process integrated with HRIS.',
      owner: 'Sarah Jenkins',
      status: 'Implemented',
      evidence: 'BambooHR to Okta automated SCIM provisioning workflow verified quarterly.',
      lastTested: '2026-11-08',
      automatedVerification: true,
    },
    {
      id: 'ISO-A.12.1',
      framework: 'ISO 27001',
      category: 'Operations Security',
      description: 'Documented operating procedures and continuous telemetry anomaly detection.',
      owner: 'Dr. Elena Rostova',
      status: 'Implemented',
      evidence: 'AI Privacy Firewall behavioral stream inspecting 100% access requests.',
      lastTested: '2026-11-15',
      automatedVerification: true,
    },
    {
      id: 'CC6.1',
      framework: 'SOC 2',
      category: 'Logical & Physical Access',
      description: 'Logical access to production databases restricted to authorized VPN bastion hosts.',
      owner: 'Marcus Vance',
      status: 'Implemented',
      evidence: 'Tailscale Zero Trust WireGuard network access logs with auto-kill session timers.',
      lastTested: '2026-11-10',
      automatedVerification: true,
    },
    {
      id: 'CC7.2',
      framework: 'SOC 2',
      category: 'System Operations',
      description: 'Automated monitoring of anomalous system behavior and unauthorized configuration changes.',
      owner: 'Dr. Elena Rostova',
      status: 'Implemented',
      evidence: 'Datadog and Firewall Engine real-time alert trigger webhooks.',
      lastTested: '2026-11-13',
      automatedVerification: true,
    },
    {
      id: 'GDPR-Art32',
      framework: 'GDPR',
      category: 'Security of Processing',
      description: 'Pseudonymization and encryption of personal data in AI research training sets.',
      owner: 'Victoria Sterling',
      status: 'Partially Implemented',
      evidence: 'Differential privacy mask active for tabular data; unstructured text pipeline in testing.',
      lastTested: '2026-11-04',
      automatedVerification: false,
    },
    {
      id: 'GDPR-Art33',
      framework: 'GDPR',
      category: 'Breach Notification',
      description: 'Documented procedure to notify supervisory authorities of data breaches within 72 hours.',
      owner: 'Victoria Sterling',
      status: 'Implemented',
      evidence: 'Annual tabletop simulation run October 2026 with legal counsel; runbook verified.',
      lastTested: '2026-10-24',
      automatedVerification: false,
    },
    {
      id: 'HIPAA-164.312',
      framework: 'HIPAA',
      category: 'Technical Safeguards',
      description: 'Unique user identification and automatic emergency logoff on clinical endpoints.',
      owner: 'Sophia Lin',
      status: 'Implemented',
      evidence: '15-minute screen lock policy enforced via Jamf Pro / Microsoft Intune.',
      lastTested: '2026-11-02',
      automatedVerification: true,
    },
    {
      id: 'PCI-Req-3.4',
      framework: 'PCI-DSS',
      category: 'Cardholder Data Protection',
      description: 'Render PAN unreadable anywhere it is stored using strong one-way cryptographic hashes.',
      owner: 'David Chen',
      status: 'Implemented',
      evidence: 'Stripe Elements tokenization architecture; zero PAN stored on local infrastructure.',
      lastTested: '2026-10-18',
      automatedVerification: true,
    },
    {
      id: 'PR.IP-03',
      framework: 'NIST CSF',
      category: 'Information Protection',
      description: 'Configuration change management processes are in place and audited continuously.',
      owner: 'Marcus Vance',
      status: 'Testing',
      evidence: 'Terraform Cloud GitOps approval pipeline and drift detection agent.',
      lastTested: '2026-11-14',
      automatedVerification: true,
    },
    {
      id: 'ISO-A.15.1',
      framework: 'ISO 27001',
      category: 'Supplier Relationships',
      description: 'Information security requirements for mitigating risks associated with supplier access.',
      owner: 'Rachel Adams',
      status: 'Partially Implemented',
      evidence: 'Vendor security questionnaires on file for Tier 1 vendors; Tier 2 assessments underway.',
      lastTested: '2026-10-15',
      automatedVerification: false,
    },
  ]
}

export function generateAudits(): AuditItem[] {
  return [
    {
      id: 'AUD-2026-01',
      name: 'SOC 2 Type II Annual Surveillance Audit',
      auditor: 'PricewaterhouseCoopers (PwC)',
      framework: 'SOC 2',
      startDate: '2026-10-01',
      endDate: '2026-12-18',
      findings: { high: 0, medium: 2, low: 3 },
      status: 'In Progress',
      progress: 82,
      scope: 'Trust Services Criteria for Security, Availability, and Confidentiality across Cloud Infrastructure.',
    },
    {
      id: 'AUD-2026-02',
      name: 'ISO 27001:2022 Re-certification Audit',
      auditor: 'BSI Group Global',
      framework: 'ISO 27001',
      startDate: '2026-11-01',
      endDate: '2026-12-22',
      findings: { high: 0, medium: 1, low: 2 },
      status: 'Fieldwork Complete',
      progress: 94,
      scope: 'Global ISMS covering AI model training, corporate facilities, and software development lifecycle.',
    },
    {
      id: 'AUD-2026-03',
      name: 'GDPR Cross-Border AI Data Processing Audit',
      auditor: 'Internal GRC Office & Baker McKenzie',
      framework: 'GDPR',
      startDate: '2026-11-10',
      endDate: '2027-01-15',
      findings: { high: 1, medium: 2, low: 1 },
      status: 'In Progress',
      progress: 45,
      scope: 'Cross-border EU-to-US telemetry transfer and AI model weight derivation consent chains.',
    },
    {
      id: 'AUD-2026-04',
      name: 'HIPAA Security Rule Bi-Annual Risk Assessment',
      auditor: 'Coalfire Systems',
      framework: 'HIPAA',
      startDate: '2026-12-01',
      endDate: '2027-02-28',
      findings: { high: 0, medium: 0, low: 1 },
      status: 'Planning',
      progress: 15,
      scope: 'Protected Health Information (ePHI) processing environments in Clinical AI Lab.',
    },
  ]
}

export function generateComplianceGaps(): ComplianceGapItem[] {
  return [
    {
      id: 'GAP-001',
      framework: 'GDPR',
      controlId: 'GDPR-Art32',
      controlName: 'Unstructured Research Text Pseudonymization',
      implementedAspects: 'Structured relational data pseudonymized via cryptographic salt and hash.',
      missingAspects: 'Unstructured natural language prompt caches lack real-time regex entity redaction.',
      riskLevel: 'High',
      recommendedAction: 'Deploy Presidio NLP redaction filter inside AI Firewall proxy before log emission.',
      remediationOwner: 'Victoria Sterling',
      estimatedEffortDays: 14,
      progress: 65,
    },
    {
      id: 'GAP-002',
      framework: 'ISO 27001',
      controlId: 'ISO-A.15.1',
      controlName: 'Third-Party Vendor Tier 2 Security Assessments',
      implementedAspects: 'All Tier 1 hyperscalers (AWS, Datadog) verified with current SOC 2 Type II reports.',
      missingAspects: 'Nine Tier 2 boutique AI SaaS integrations lack completed SIG-Lite questionnaires.',
      riskLevel: 'Medium',
      recommendedAction: 'Send automated Whistic questionnaires and require responses prior to annual renewal.',
      remediationOwner: 'Rachel Adams',
      estimatedEffortDays: 21,
      progress: 40,
    },
    {
      id: 'GAP-003',
      framework: 'NIST CSF',
      controlId: 'PR.IP-03',
      controlName: 'Container Image Provenance & Cosign Signatures',
      implementedAspects: 'Vulnerability scanning active in CI/CD pipeline with Trivy.',
      missingAspects: 'Production Kubernetes admission controller does not reject unsigned container images.',
      riskLevel: 'High',
      recommendedAction: 'Enable Kyverno admission policy enforcing Sigstore Cosign verification for all pods.',
      remediationOwner: 'Marcus Vance',
      estimatedEffortDays: 7,
      progress: 80,
    },
    {
      id: 'GAP-004',
      framework: 'HIPAA',
      controlId: 'HIPAA-164.312',
      controlName: 'Automated Session Termination on High-GPU Workstations',
      implementedAspects: 'Standard macOS endpoints lock after 15 minutes of inactivity.',
      missingAspects: 'Linux deep learning cluster terminal sessions bypass screen lock timeouts.',
      riskLevel: 'Medium',
      recommendedAction: 'Push pam_shield and TMOUT=900 environment variable via Ansible playbook.',
      remediationOwner: 'David Chen',
      estimatedEffortDays: 3,
      progress: 90,
    },
    {
      id: 'GAP-005',
      framework: 'SOC 2',
      controlId: 'CC6.1',
      controlName: 'Quarterly User Access Recertification Automation',
      implementedAspects: 'Manual spreadsheet reviews conducted by department heads every 90 days.',
      missingAspects: 'Lack of automated revocation when managers fail to review within 14 calendar days.',
      riskLevel: 'Low',
      recommendedAction: 'Implement Okta Access Certification campaigns with auto-deprovisioning timers.',
      remediationOwner: 'Sarah Jenkins',
      estimatedEffortDays: 10,
      progress: 55,
    },
  ]
}

export function generateBusinessImpacts(): BusinessImpactItem[] {
  return [
    {
      id: 'BIA-001',
      businessProcess: 'Real-Time Customer Model Inference API',
      businessUnit: 'Product & UX',
      criticality: 'Tier 0 - Mission Critical',
      rto: '< 15 minutes',
      rpo: '< 0 seconds (active-active)',
      financialImpact: '$45,000 / hour downtime + SLA penalties',
      operationalImpact: 'Immediate service disruption for 1.2M enterprise API requests across global customers.',
      riskOwner: 'Alex Rivera',
      dependantSystems: ['Inference Gateway', 'K8s Cluster Alpha', 'Cloudflare Edge CDN', 'AWS Route53'],
    },
    {
      id: 'BIA-002',
      businessProcess: 'Enterprise Identity & Zero Trust Access Controller',
      businessUnit: 'Infrastructure & Security',
      criticality: 'Tier 0 - Mission Critical',
      rto: '< 30 minutes',
      rpo: '< 5 minutes',
      financialImpact: '$28,000 / hour in blocked engineering productivity',
      operationalImpact: '250 employees unable to access workstations, git repositories, or cloud consoles.',
      riskOwner: 'Sophia Lin',
      dependantSystems: ['Okta SSO', 'Tailscale Bastion', 'Vault Cluster', 'Active Directory Sync'],
    },
    {
      id: 'BIA-003',
      businessProcess: 'Frontier AI Model Training & Checkpoint Pipeline',
      businessUnit: 'AI Engineering',
      criticality: 'Tier 1 - Business Critical',
      rto: '< 2 hours',
      rpo: '< 30 minutes (last checkpoint)',
      financialImpact: '$18,000 / hour GPU cluster idle cost',
      operationalImpact: 'Delays model release milestones; potential checkpoint file corruption.',
      riskOwner: 'Dr. Elena Rostova',
      dependantSystems: ['H100 GPU Cluster', 'NVLink Fabric', 'Lustre High-Speed FS', 'S3 Checkpoint Bucket'],
    },
    {
      id: 'BIA-004',
      businessProcess: 'Enterprise Billing & Subscription Settlement',
      businessUnit: 'Finance & Operations',
      criticality: 'Tier 1 - Business Critical',
      rto: '< 4 hours',
      rpo: '< 1 hour',
      financialImpact: '$65,000 / day delayed cash collections',
      operationalImpact: 'Inability to bill enterprise overages or provision new high-tier customer seats.',
      riskOwner: 'Rachel Adams',
      dependantSystems: ['Stripe Invoicing', 'NetSuite ERP', 'Snowflake Usage Ledger', 'Postgres Billing DB'],
    },
    {
      id: 'BIA-005',
      businessProcess: 'Clinical Research Data Lake & Patient Consent Vault',
      businessUnit: 'Legal & Compliance',
      criticality: 'Tier 2 - Operational',
      rto: '< 8 hours',
      rpo: '< 24 hours',
      financialImpact: '$12,000 / day research hold delay',
      operationalImpact: 'Temporary suspension of academic clinical research benchmarking studies.',
      riskOwner: 'Victoria Sterling',
      dependantSystems: ['HIPAA Protected S3', 'Presidio De-ID Engine', 'Snowflake Clinical Schema'],
    },
  ]
}

export function generateTreatmentPlans(): RiskTreatmentPlan[] {
  return [
    {
      id: 'TRT-001',
      riskId: 'RSK-2026-001',
      riskName: 'Unauthorized Cross-Department AI Training Data Access',
      owner: 'Dr. Elena Rostova',
      strategy: 'Mitigate',
      tasks: [
        { id: 'T1', task: 'Deploy fine-grained behavioral policy on S3 data lakes', completed: true },
        { id: 'T2', task: 'Integrate hardware FIDO2 key step-up challenge for data pulls', completed: true },
        { id: 'T3', task: 'Conduct red-team exfiltration simulation across research subnets', completed: false },
        { id: 'T4', task: 'Finalize automated containment trigger in AI firewall engine', completed: false },
      ],
      status: 'In Progress',
      completionPct: 50,
      dueDate: '2026-12-15',
      budgetAllocated: '$45,000',
    },
    {
      id: 'TRT-002',
      riskId: 'RSK-2026-002',
      riskName: 'Third-Party LLM API Key Exfiltration in Git Repositories',
      owner: 'Marcus Vance',
      strategy: 'Mitigate',
      tasks: [
        { id: 'T1', task: 'Configure pre-commit git hooks with TruffleHog', completed: true },
        { id: 'T2', task: 'Revoke and rotate 100% legacy static keys across cloud providers', completed: true },
        { id: 'T3', task: 'Deploy HashiCorp Vault dynamic ephemeral token provider', completed: true },
        { id: 'T4', task: 'Automate weekly secret scan reports to engineering managers', completed: false },
      ],
      status: 'On Track',
      completionPct: 75,
      dueDate: '2026-11-30',
      budgetAllocated: '$20,000',
    },
    {
      id: 'TRT-003',
      riskId: 'RSK-2026-003',
      riskName: 'Sub-Processor DPA Lapses for GPU Cloud Infrastructure',
      owner: 'Victoria Sterling',
      strategy: 'Transfer',
      tasks: [
        { id: 'T1', task: 'Audit current vendor contract liability clauses', completed: true },
        { id: 'T2', task: 'Deliver 2026 Standard Contractual Clauses (SCC) amendment', completed: true },
        { id: 'T3', task: 'Procure cybersecurity indemnification insurance rider', completed: false },
      ],
      status: 'In Progress',
      completionPct: 66,
      dueDate: '2026-12-31',
      budgetAllocated: '$15,000',
    },
    {
      id: 'TRT-004',
      riskId: 'RSK-2026-004',
      riskName: 'Inference Gateway DDoS and Distributed Credential Stuffing',
      owner: 'Alex Rivera',
      strategy: 'Mitigate',
      tasks: [
        { id: 'T1', task: 'Enable Cloudflare Advanced Bot Management', completed: true },
        { id: 'T2', task: 'Tune rate limiting to 1,200 rpm per authenticated tenant', completed: true },
        { id: 'T3', task: 'Connect firewall burst detector to upstream IP ban rules', completed: true },
        { id: 'T4', task: 'Run distributed stress test at 50,000 req/sec', completed: true },
      ],
      status: 'On Track',
      completionPct: 100,
      dueDate: '2026-12-05',
      budgetAllocated: '$35,000',
    },
    {
      id: 'TRT-005',
      riskId: 'RSK-2026-005',
      riskName: 'Insider Threat: Mass Download Before Departure',
      owner: 'Sarah Jenkins',
      strategy: 'Mitigate',
      tasks: [
        { id: 'T1', task: 'Establish automated BambooHR resignation webhook trigger', completed: true },
        { id: 'T2', task: 'Cap daily outbound data transfer at 500MB during notice period', completed: true },
        { id: 'T3', task: 'Enforce real-time alert dispatch to CISO on USB plug-in events', completed: false },
      ],
      status: 'In Progress',
      completionPct: 67,
      dueDate: '2026-11-25',
      budgetAllocated: '$12,000',
    },
    {
      id: 'TRT-006',
      riskId: 'RSK-2026-010',
      riskName: 'Privileged IAM Role Creep Across Core Research Accounts',
      owner: 'Sophia Lin',
      strategy: 'Mitigate',
      tasks: [
        { id: 'T1', task: 'Enumerate all AdministratorAccess policies in AWS Organizations', completed: true },
        { id: 'T2', task: 'Build Just-In-Time (JIT) 4-hour elevation workflows in Okta', completed: false },
        { id: 'T3', task: 'Enforce dual approval for production cluster role assumptions', completed: false },
      ],
      status: 'Delayed',
      completionPct: 33,
      dueDate: '2026-12-10',
      budgetAllocated: '$18,000',
    },
  ]
}

export function generateVendors(): VendorItem[] {
  return [
    {
      id: 'VND-001',
      name: 'Amazon Web Services (AWS)',
      service: 'Cloud Infrastructure & S3 Data Storage',
      riskRating: 'Low',
      complianceStatus: 'Compliant',
      lastAssessment: '2026-10-15',
      contracts: ['Master Services Agreement', 'Enterprise Support', 'Business Associate Agreement (BAA)'],
      dataClassification: 'Restricted',
      securityScore: 98,
      soc2Status: 'SOC 2 Type II Current (Valid through Dec 2027)',
      dpaSigned: true,
    },
    {
      id: 'VND-002',
      name: 'Anthropic PBC',
      service: 'Frontier AI Model Evaluation & Claude API',
      riskRating: 'Low',
      complianceStatus: 'Compliant',
      lastAssessment: '2026-09-28',
      contracts: ['Commercial API Agreement', 'Data Privacy Addendum', 'Zero Data Retention (ZDR) Addendum'],
      dataClassification: 'Confidential',
      securityScore: 96,
      soc2Status: 'SOC 2 Type II Current',
      dpaSigned: true,
    },
    {
      id: 'VND-003',
      name: 'Snowflake Computing',
      service: 'Enterprise Data Warehouse & Telemetry Lake',
      riskRating: 'Low',
      complianceStatus: 'Compliant',
      lastAssessment: '2026-08-30',
      contracts: ['Enterprise MSA', 'Data Processing Agreement', 'BAA'],
      dataClassification: 'Restricted',
      securityScore: 97,
      soc2Status: 'SOC 2 Type II / ISO 27001 Certified',
      dpaSigned: true,
    },
    {
      id: 'VND-004',
      name: 'Datadog Inc.',
      service: 'Cloud Observability, SIEM & Application APM',
      riskRating: 'Medium',
      complianceStatus: 'Compliant',
      lastAssessment: '2026-09-12',
      contracts: ['SaaS Subscription Agreement', 'Standard DPA'],
      dataClassification: 'Internal',
      securityScore: 92,
      soc2Status: 'SOC 2 Type II Current',
      dpaSigned: true,
    },
    {
      id: 'VND-005',
      name: 'Equinix Data Centers',
      service: 'Physical Colocation & High-Density GPU Racks',
      riskRating: 'Low',
      complianceStatus: 'Compliant',
      lastAssessment: '2026-10-02',
      contracts: ['Cage Master Lease', 'Physical Security SLA', 'ISO 27001 Warranty'],
      dataClassification: 'Restricted',
      securityScore: 99,
      soc2Status: 'SOC 1 & SOC 2 Type II on file',
      dpaSigned: true,
    },
    {
      id: 'VND-006',
      name: 'DeepCompute Labs Ltd.',
      service: 'Specialized Liquid-Cooled H100 GPU Burst Capacity',
      riskRating: 'High',
      complianceStatus: 'Action Required',
      lastAssessment: '2026-11-01',
      contracts: ['Short-Term Master Compute Lease', 'Preliminary NDA'],
      dataClassification: 'Confidential',
      securityScore: 78,
      soc2Status: 'Pending SOC 2 Type II Report Delivery',
      dpaSigned: false,
    },
  ]
}

export function generatePolicies(): PolicyComplianceItem[] {
  return [
    {
      id: 'POL-001',
      name: 'Data Access & Zero Trust Architecture Policy',
      compliancePct: 98.4,
      violationsCount: 3,
      departments: ['AI Engineering', 'Infrastructure & Security', 'Product & UX'],
      trend: 'Improving',
      lastUpdated: '2026-10-10',
      mandatoryReviewDate: '2027-10-10',
    },
    {
      id: 'POL-002',
      name: 'Cryptographic Key Custody & Secrets Management',
      compliancePct: 96.8,
      violationsCount: 5,
      departments: ['Research & Development', 'AI Engineering'],
      trend: 'Stable',
      lastUpdated: '2026-09-15',
      mandatoryReviewDate: '2027-09-15',
    },
    {
      id: 'POL-003',
      name: 'Acceptable Use, BYOD & Endpoint Encryption Policy',
      compliancePct: 99.2,
      violationsCount: 1,
      departments: ['All Departments'],
      trend: 'Improving',
      lastUpdated: '2026-10-25',
      mandatoryReviewDate: '2027-10-25',
    },
    {
      id: 'POL-004',
      name: 'Frontier AI Model Safety & Governance Standard',
      compliancePct: 94.1,
      violationsCount: 8,
      departments: ['Research & Development', 'Legal & Compliance'],
      trend: 'Improving',
      lastUpdated: '2026-11-02',
      mandatoryReviewDate: '2027-05-02',
    },
    {
      id: 'POL-005',
      name: 'Incident Response & 72-Hour Breach Notification Procedure',
      compliancePct: 100.0,
      violationsCount: 0,
      departments: ['Infrastructure & Security', 'Legal & Compliance', 'Operations'],
      trend: 'Stable',
      lastUpdated: '2026-08-20',
      mandatoryReviewDate: '2027-08-20',
    },
    {
      id: 'POL-006',
      name: 'Physical Security & Clean Desk Policy',
      compliancePct: 97.6,
      violationsCount: 4,
      departments: ['Operations', 'Product & UX'],
      trend: 'Declining',
      lastUpdated: '2026-07-14',
      mandatoryReviewDate: '2027-07-14',
    },
  ]
}

export function generateRemediations(): RemediationTaskItem[] {
  return [
    {
      id: 'REM-001',
      task: 'Enforce hardware-bound FIDO2 step-up challenge on S3 training bucket downloads',
      riskId: 'RSK-2026-001',
      owner: 'Sophia Lin',
      priority: 'Critical',
      status: 'In Progress',
      progress: 75,
      estimatedCompletion: '2026-11-20',
    },
    {
      id: 'REM-002',
      task: 'Rotate and invalidate exposed developer API keys identified by TruffleHog scan',
      riskId: 'RSK-2026-002',
      owner: 'Marcus Vance',
      priority: 'High',
      status: 'Verification',
      progress: 95,
      estimatedCompletion: '2026-11-18',
    },
    {
      id: 'REM-003',
      task: 'Execute updated Standard Contractual Clauses (SCCs) with GPU cloud provider',
      riskId: 'RSK-2026-003',
      owner: 'Victoria Sterling',
      priority: 'High',
      status: 'In Progress',
      progress: 50,
      estimatedCompletion: '2026-12-05',
    },
    {
      id: 'REM-004',
      task: 'Configure adaptive rate limiting and AI firewall IP auto-containment rules',
      riskId: 'RSK-2026-004',
      owner: 'Alex Rivera',
      priority: 'High',
      status: 'Completed',
      progress: 100,
      estimatedCompletion: '2026-11-12',
    },
    {
      id: 'REM-005',
      task: 'Automate off-boarding data caps (500MB/day) through BambooHR webhook sync',
      riskId: 'RSK-2026-005',
      owner: 'Sarah Jenkins',
      priority: 'Medium',
      status: 'In Progress',
      progress: 60,
      estimatedCompletion: '2026-11-24',
    },
    {
      id: 'REM-006',
      task: 'Implement automated Let’s Encrypt renewal for internal Harbor container registry',
      riskId: 'RSK-2026-009',
      owner: 'David Chen',
      priority: 'Medium',
      status: 'In Progress',
      progress: 40,
      estimatedCompletion: '2026-11-28',
    },
    {
      id: 'REM-007',
      task: 'Deploy Okta Privileged Access Just-In-Time role elevation for AWS accounts',
      riskId: 'RSK-2026-010',
      owner: 'Sophia Lin',
      priority: 'High',
      status: 'Not Started',
      progress: 10,
      estimatedCompletion: '2026-12-12',
    },
    {
      id: 'REM-008',
      task: 'Configure S3 30-day lifecycle expiration rule for customer support chat logs',
      riskId: 'RSK-2026-011',
      owner: 'Rachel Adams',
      priority: 'Low',
      status: 'Verification',
      progress: 85,
      estimatedCompletion: '2026-11-22',
    },
  ]
}

export function generateTimeline(): ComplianceTimelineEvent[] {
  const months = [
    'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026',
    'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026',
    'Dec 2026', 'Jan 2027', 'Feb 2027', 'Mar 2027', 'Apr 2027', 'May 2027',
    'Jun 2027', 'Jul 2027', 'Aug 2027', 'Sep 2027', 'Oct 2027', 'Nov 2027',
  ]

  const events: ComplianceTimelineEvent[] = [
    { id: 'EVT-01', monthIndex: 0, monthLabel: months[0]!, year: 2025, type: 'Audit', title: 'SOC 2 Type II Fieldwork Closure', description: 'Annual SOC 2 Type II observation window concluded with zero material exceptions.', status: 'Completed', framework: 'SOC 2' },
    { id: 'EVT-02', monthIndex: 1, monthLabel: months[1]!, year: 2026, type: 'Policy', title: 'Zero Trust Policy v2.4 Rollout', description: 'Mandatory hardware MFA token binding enforced across all engineering employees.', status: 'Completed' },
    { id: 'EVT-03', monthIndex: 2, monthLabel: months[2]!, year: 2026, type: 'Control', title: 'AWS KMS Envelope Encryption Upgrade', description: 'Migrated 100% of production database storage to KMS customer-managed keys.', status: 'Completed', framework: 'NIST CSF' },
    { id: 'EVT-04', monthIndex: 3, monthLabel: months[3]!, year: 2026, type: 'Milestone', title: 'AI Model Governance Committee Formed', description: 'Formal ethics and privacy committee established for frontier model releases.', status: 'Completed' },
    { id: 'EVT-05', monthIndex: 4, monthLabel: months[4]!, year: 2026, type: 'Audit', title: 'ISO 27001 Surveillance Review', description: 'Semi-annual surveillance review completed with BSI Group.', status: 'Completed', framework: 'ISO 27001' },
    { id: 'EVT-06', monthIndex: 5, monthLabel: months[5]!, year: 2026, type: 'Incident', title: 'Simulated Red Team Ransomware Exercise', description: 'Annual incident response simulation testing enterprise containment automation.', status: 'Completed' },
    { id: 'EVT-07', monthIndex: 6, monthLabel: months[6]!, year: 2026, type: 'Control', title: 'Tailscale Zero Trust Mesh Deployment', description: 'Replaced legacy OpenVPN with WireGuard-based zero-trust network access.', status: 'Completed', framework: 'SOC 2' },
    { id: 'EVT-08', monthIndex: 7, monthLabel: months[7]!, year: 2026, type: 'Policy', title: 'Annual Policy Recertification', description: 'All employees completed compliance training and policy attestation.', status: 'Completed' },
    { id: 'EVT-09', monthIndex: 8, monthLabel: months[8]!, year: 2026, type: 'Audit', title: 'GDPR Sub-Processor Privacy Audit', description: 'Legal review of cross-border telemetry processing completed.', status: 'Completed', framework: 'GDPR' },
    { id: 'EVT-10', monthIndex: 9, monthLabel: months[9]!, year: 2026, type: 'Control', title: 'NIST CSF 2.0 Control Mapping', description: 'Updated enterprise risk registers to adhere to NIST CSF 2.0 Govern function.', status: 'Completed', framework: 'NIST CSF' },
    { id: 'EVT-11', monthIndex: 10, monthLabel: months[10]!, year: 2026, type: 'Audit', title: 'PCI-DSS v4.0.1 Readiness Assessment', description: 'Pre-assessment of payment tokenization pipelines.', status: 'Completed', framework: 'PCI-DSS' },
    { id: 'EVT-12', monthIndex: 11, monthLabel: months[11]!, year: 2026, type: 'Audit', title: 'SOC 2 Type II 2026 Active Fieldwork', description: 'PwC conducting on-site sampling and control verification.', status: 'In Progress', framework: 'SOC 2' },
    { id: 'EVT-13', monthIndex: 12, monthLabel: months[12]!, year: 2026, type: 'Milestone', title: 'SOC 2 Final Report Delivery', description: 'Expected final clean opinion report issued by PwC.', status: 'Upcoming', framework: 'SOC 2' },
    { id: 'EVT-14', monthIndex: 13, monthLabel: months[13]!, year: 2027, type: 'Policy', title: 'EU AI Act Compliance Framework Rollout', description: 'Mandatory risk categorization under high-risk AI system definitions.', status: 'Upcoming' },
    { id: 'EVT-15', monthIndex: 14, monthLabel: months[14]!, year: 2027, type: 'Audit', title: 'GDPR Authority Transparency Filing', description: 'Annual Data Protection Officer (DPO) report to Data Protection Commissioner.', status: 'Upcoming', framework: 'GDPR' },
    { id: 'EVT-16', monthIndex: 15, monthLabel: months[15]!, year: 2027, type: 'Audit', title: 'NIST CSF Annual Assessment', description: 'External third-party maturity scoring across all 6 core functions.', status: 'Upcoming', framework: 'NIST CSF' },
    { id: 'EVT-17', monthIndex: 16, monthLabel: months[16]!, year: 2027, type: 'Audit', title: 'ISO 27001 Triennial Recertification', description: 'Full recertification audit by accredited registrar.', status: 'Upcoming', framework: 'ISO 27001' },
    { id: 'EVT-18', monthIndex: 17, monthLabel: months[17]!, year: 2027, type: 'Audit', title: 'HIPAA Security Rule Comprehensive Audit', description: 'Coalfire evaluation of clinical research cloud infrastructure.', status: 'Upcoming', framework: 'HIPAA' },
    { id: 'EVT-19', monthIndex: 18, monthLabel: months[18]!, year: 2027, type: 'Audit', title: 'PCI-DSS Annual Report on Compliance (RoC)', description: 'Qualified Security Assessor (QSA) attestation of compliance.', status: 'Upcoming', framework: 'PCI-DSS' },
    { id: 'EVT-20', monthIndex: 19, monthLabel: months[19]!, year: 2027, type: 'Control', title: 'Post-Quantum Cryptography Migration Phase 1', description: 'Begin rolling ML-KEM and ML-DSA algorithm support in TLS proxies.', status: 'Upcoming' },
    { id: 'EVT-21', monthIndex: 20, monthLabel: months[20]!, year: 2027, type: 'Milestone', title: 'Enterprise Disaster Recovery Exercise', description: 'Live failover of inference gateway to secondary cloud region.', status: 'Upcoming' },
    { id: 'EVT-22', monthIndex: 21, monthLabel: months[21]!, year: 2027, type: 'Audit', title: 'Third-Party Vendor SIG Recertification', description: 'Annual risk re-evaluation for all Tier 1 and Tier 2 SaaS vendors.', status: 'Upcoming' },
    { id: 'EVT-23', monthIndex: 22, monthLabel: months[22]!, year: 2027, type: 'Policy', title: 'Annual Board Risk Review', description: 'Presentation of 2027 enterprise cyber risk posture to Board of Directors.', status: 'Upcoming' },
    { id: 'EVT-24', monthIndex: 23, monthLabel: months[23]!, year: 2027, type: 'Milestone', title: 'Global Trust Center v3 Release', description: 'Public compliance portal with automated NDA-gated auditor access.', status: 'Upcoming' },
  ]

  return events
}

export function computeGRCKPIs(
  risks: RiskItem[],
  frameworks: ComplianceFramework[],
  audits: AuditItem[],
  controls: SecurityControl[],
  remediations: RemediationTaskItem[],
): ExecutiveGrcKPIs {
  const openRisks = risks.filter((r) => r.status === 'Open' || r.status === 'In Review').length
  const criticalRisks = risks.filter((r) => r.severity === 'Critical').length

  const avgCompliance =
    frameworks.reduce((acc, f) => acc + f.overallScore, 0) / (frameworks.length || 1)
  const complianceScore = Math.round(avgCompliance * 10) / 10

  // Enterprise risk score: weighted combination of open risks and critical risks (0-100 scale, lower is better)
  const enterpriseRiskScore = Math.min(
    100,
    Math.round(criticalRisks * 8 + openRisks * 1.2 + 8),
  )

  const activeAudits = audits.filter(
    (a) => a.status === 'In Progress' || a.status === 'Fieldwork Complete' || a.status === 'Planning',
  ).length

  const totalAuditFindings = audits.reduce(
    (acc, a) => acc + a.findings.high + a.findings.medium + a.findings.low,
    0,
  )

  const controlsImplemented = controls.filter((c) => c.status === 'Implemented').length
  const totalControls = controls.length

  const activeRemediations = remediations.filter(
    (rem) => rem.status !== 'Completed',
  ).length

  // Overall security rating
  let rating = 'A'
  if (complianceScore >= 95 && enterpriseRiskScore <= 25) {
    rating = 'A+ (96.4)'
  } else if (complianceScore >= 90) {
    rating = 'A (92.1)'
  } else {
    rating = 'B+ (88.5)'
  }

  return {
    enterpriseRiskScore,
    complianceScore,
    openRisks,
    criticalRisks,
    activeAudits,
    controlsImplemented,
    totalControls,
    complianceFrameworks: frameworks.length,
    openFindings: totalAuditFindings,
    remediationTasks: activeRemediations,
    overallSecurityRating: rating,
    trend: {
      risk: -2.4, // improving risk
      compliance: 1.8,
      audits: 0,
      remediation: 3.2,
    },
  }
}

export function generateExecutiveSummary(
  kpis: ExecutiveGrcKPIs,
  risks: RiskItem[],
  audits: AuditItem[],
): ExecutiveRiskSummary {
  const criticalList = risks.filter((r) => r.severity === 'Critical').map((r) => r.name)
  const inProgressAudits = audits.filter((a) => a.status === 'In Progress').map((a) => a.name)

  return {
    generatedAt: new Date().toLocaleTimeString(),
    currentRiskPosture: `The enterprise security and governance posture remains robust with an overall compliance score of ${kpis.complianceScore}% across all 6 Tier 1 regulatory frameworks. Enterprise risk is controlled at index ${kpis.enterpriseRiskScore}/100 with active behavioral containment mediated by the AI Privacy Firewall.`,
    highestRisks: [
      criticalList[0] ?? 'Unauthorized Cross-Department AI Training Data Access',
      criticalList[1] ?? 'Third-Party LLM API Key Exfiltration in Git Repositories',
      'Unstructured Research Text Pseudonymization (GDPR Art. 32)',
    ],
    complianceIssues: [
      'GDPR cross-border transfer documentation requires updated Standard Contractual Clauses for GPU cloud burst capacity.',
      'Nine Tier 2 boutique SaaS vendors have pending SIG-Lite security question submissions.',
      'Unstructured natural language prompt caches require real-time entity redaction prior to long-term cold archive.',
    ],
    auditReadiness: `Active field audits (${inProgressAudits.join(', ')}) report 82%+ evidence verification completion with zero material weaknesses. Readiness rating is categorized as HIGH for SOC 2 Type II issuance.`,
    businessImpact: 'Tier 0 customer inference API and employee Zero Trust controllers operate with zero unmitigated single-points-of-failure. Mean recovery time objectives (RTO) remain under 15 minutes with verified hot-standby cloud redundancy.',
    recommendations: [
      'Accelerate deployment of hardware-bound FIDO2 step-up challenges on all research data lake extraction endpoints.',
      'Mandate automated secret scanning and ephemeral HashiCorp Vault credentials to neutralize git credential leaks.',
      'Enforce Kyverno container signature verification to prevent unsigned workload execution across production Kubernetes nodes.',
      'Conclude Tier 2 vendor questionnaires prior to Q1 2027 SaaS contract renewal milestones.',
    ],
  }
}

export function generateGRCSnapshot(): GRCSnapshot {
  const risks = generateRisks()
  const heatmap = computeRiskHeatmap(risks)
  const frameworks = generateFrameworks()
  const controls = generateControls()
  const audits = generateAudits()
  const gaps = generateComplianceGaps()
  const businessImpacts = generateBusinessImpacts()
  const treatmentPlans = generateTreatmentPlans()
  const vendors = generateVendors()
  const policies = generatePolicies()
  const remediations = generateRemediations()
  const timeline = generateTimeline()

  const kpis = computeGRCKPIs(risks, frameworks, audits, controls, remediations)
  const summary = generateExecutiveSummary(kpis, risks, audits)

  return {
    timestamp: new Date().toISOString(),
    kpis,
    risks,
    heatmap,
    frameworks,
    controls,
    audits,
    gaps,
    businessImpacts,
    treatmentPlans,
    vendors,
    policies,
    summary,
    remediations,
    timeline,
  }
}

// Export functions for CSV, JSON, and PDF
export function exportGRCToJSON(snapshot: GRCSnapshot) {
  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(snapshot, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute(
    'download',
    `grc_executive_report_${new Date().toISOString().slice(0, 10)}.json`,
  )
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

export function exportGRCToCSV(snapshot: GRCSnapshot) {
  const headers = [
    'Risk ID',
    'Risk Name',
    'Business Unit',
    'Owner',
    'Category',
    'Likelihood',
    'Impact',
    'Risk Score',
    'Severity',
    'Status',
    'Treatment Strategy',
    'Due Date',
  ]

  const rows = snapshot.risks.map((r) => [
    `"${r.id}"`,
    `"${r.name.replace(/"/g, '""')}"`,
    `"${r.businessUnit}"`,
    `"${r.owner}"`,
    `"${r.category}"`,
    r.likelihood,
    r.impact,
    r.riskScore,
    `"${r.severity}"`,
    `"${r.status}"`,
    `"${r.treatmentStrategy}"`,
    `"${r.dueDate}"`,
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute(
    'download',
    `enterprise_risk_register_${new Date().toISOString().slice(0, 10)}.csv`,
  )
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function exportGRCToPDF(snapshot: GRCSnapshot) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to generate the print-ready PDF executive report.')
    return
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>GRC Executive Risk & Compliance Report - OpenAI Research Labs</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #0f172a; line-height: 1.5; }
          h1 { color: #1e1b4b; font-size: 24px; margin-bottom: 4px; }
          .subtitle { color: #64748b; font-size: 13px; margin-bottom: 24px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
          .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .kpi-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
          .kpi-val { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px; }
          .section-title { font-size: 16px; font-weight: 700; color: #1e1b4b; margin-top: 24px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
          th { background: #f1f5f9; text-align: left; padding: 8px; border: 1px solid #cbd5e1; font-weight: 700; }
          td { padding: 8px; border: 1px solid #e2e8f0; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
          .badge-critical { background: #fee2e2; color: #991b1b; }
          .badge-high { background: #ffedd5; color: #9a3412; }
          .badge-medium { background: #fef9c3; color: #854d0e; }
          .badge-low { background: #dcfce7; color: #166534; }
          .summary-box { background: #f8fafc; border-left: 4px solid #4f46e5; padding: 14px; border-radius: 4px; font-size: 12px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Enterprise Governance, Risk & Compliance (GRC) Executive Report</h1>
        <div class="subtitle">AI Privacy Firewall Virtual Enterprise: OpenAI Research Labs | Generated: ${new Date().toLocaleString()}</div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title">Enterprise Risk Score</div>
            <div class="kpi-val">${snapshot.kpis.enterpriseRiskScore} / 100</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Compliance Score</div>
            <div class="kpi-val">${snapshot.kpis.complianceScore}%</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Security Rating</div>
            <div class="kpi-val">${snapshot.kpis.overallSecurityRating}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Active Audits</div>
            <div class="kpi-val">${snapshot.kpis.activeAudits} Frameworks</div>
          </div>
        </div>

        <div class="section-title">AI Executive Risk & Compliance Summary</div>
        <div class="summary-box">
          <p><strong>Current Posture:</strong> ${snapshot.summary.currentRiskPosture}</p>
          <p><strong>Audit Readiness:</strong> ${snapshot.summary.auditReadiness}</p>
          <p><strong>Business Impact:</strong> ${snapshot.summary.businessImpact}</p>
        </div>

        <div class="section-title">Active Regulatory Frameworks</div>
        <table>
          <thead>
            <tr>
              <th>Framework</th>
              <th>Version</th>
              <th>Overall Score</th>
              <th>Passed</th>
              <th>Failed</th>
              <th>Pending</th>
              <th>Status</th>
              <th>Next Audit</th>
            </tr>
          </thead>
          <tbody>
            ${snapshot.frameworks
              .map(
                (f) => `
              <tr>
                <td><strong>${f.name}</strong></td>
                <td>${f.version}</td>
                <td><strong>${f.overallScore}%</strong></td>
                <td>${f.controlsPassed}</td>
                <td>${f.controlsFailed}</td>
                <td>${f.controlsPending}</td>
                <td>${f.status}</td>
                <td>${f.nextAudit}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>

        <div class="section-title">Top Enterprise Risks (Sample)</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Risk Name</th>
              <th>Business Unit</th>
              <th>Owner</th>
              <th>Score</th>
              <th>Severity</th>
              <th>Strategy</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${snapshot.risks
              .slice(0, 8)
              .map(
                (r) => `
              <tr>
                <td><code>${r.id}</code></td>
                <td><strong>${r.name}</strong></td>
                <td>${r.businessUnit}</td>
                <td>${r.owner}</td>
                <td>${r.riskScore}/25</td>
                <td><span class="badge badge-${r.severity.toLowerCase()}">${r.severity}</span></td>
                <td>${r.treatmentStrategy}</td>
                <td>${r.status}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>

        <div class="section-title">Active Audit Engagements</div>
        <table>
          <thead>
            <tr>
              <th>Audit Name</th>
              <th>Auditor</th>
              <th>Framework</th>
              <th>High Findings</th>
              <th>Med Findings</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${snapshot.audits
              .map(
                (a) => `
              <tr>
                <td><strong>${a.name}</strong></td>
                <td>${a.auditor}</td>
                <td>${a.framework}</td>
                <td>${a.findings.high}</td>
                <td>${a.findings.medium}</td>
                <td>${a.progress}%</td>
                <td>${a.status}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
