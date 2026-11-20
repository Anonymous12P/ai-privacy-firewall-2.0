import type {
  EmployeeProfile,
  OrgDepartment,
  ResourceProfile,
  TopologyNode,
} from '../types/organization'

export const ENTERPRISE_OVERVIEW = {
  companyName: 'AI Privacy Firewall Research Lab',
  researchLabName: 'AI Privacy Firewall Research Lab',
  employeeCount: 100,
  departmentCount: 13,
  applicationCount: 24,
  serverCount: 38,
  databaseCount: 16,
  securityStatus: 'Protected' as const,
  location: 'Cyber City, Hinjawadi Phase 1, Pune & Secure Multi-Region Cloud',
  complianceStandards: ['ISO 27001', 'SOC 2 Type II', 'NIST CSF', 'GDPR', 'CERT-In', 'HIPAA'],
}

export const DEPARTMENTS: {
  name: OrgDepartment
  lead: string
  headcount: number
  description: string
  sensitiveAssetsCount: number
}[] = [
  {
    name: 'Engineering',
    lead: 'Pavan Jadhav',
    headcount: 19,
    description: 'Core AI firewall model development, UBA behavioral algorithms, and platform architecture.',
    sensitiveAssetsCount: 4,
  },
  {
    name: 'Security',
    lead: 'Saurabh Talape',
    headcount: 9,
    description: 'Enterprise zero-trust security posture, IAM governance, and privileged credential defense.',
    sensitiveAssetsCount: 3,
  },
  {
    name: 'SOC',
    lead: 'Vikas Rathod',
    headcount: 7,
    description: '24/7 Security Operations Center, real-time threat interception, telemetry triage, and incident containment.',
    sensitiveAssetsCount: 4,
  },
  {
    name: 'Threat Intelligence',
    lead: 'Himanshu Gond',
    headcount: 4,
    description: 'Insider threat modeling, MITRE ATT&CK mapping, and continuous threat hunt workflows.',
    sensitiveAssetsCount: 3,
  },
  {
    name: 'Compliance',
    lead: 'Vaibhav Deshmukh',
    headcount: 5,
    description: 'Data protection governance, GDPR/DPDP regulatory compliance, immutable audit ledger, and policy verification.',
    sensitiveAssetsCount: 3,
  },
  {
    name: 'DevOps',
    lead: 'Ghanshyam Sapkal',
    headcount: 7,
    description: 'Zero-trust edge gateways, multi-region Kubernetes clusters, and automated CI/CD security scanning.',
    sensitiveAssetsCount: 3,
  },
  {
    name: 'Cloud',
    lead: 'Pratik Akkanawaru',
    headcount: 8,
    description: 'Cloud security architecture, AWS/GCP multi-tenant isolation, encrypted storage tiers, and VPC transit mesh.',
    sensitiveAssetsCount: 3,
  },
  {
    name: 'Infrastructure',
    lead: 'Arjun Verma',
    headcount: 6,
    description: 'Physical datacenters, edge gateways, core network routing, hardware security modules, and hardware firewalls.',
    sensitiveAssetsCount: 2,
  },
  {
    name: 'AI Research',
    lead: 'Dr. Elena Rostova',
    headcount: 9,
    description: 'Deep learning anomaly detection, explainable AI TreeSHAP formulations, and privacy-preserving federated models.',
    sensitiveAssetsCount: 3,
  },
  {
    name: 'HR',
    lead: 'Ananya Sharma',
    headcount: 7,
    description: 'Human resources, employee onboarding lifecycle, behavioral risk reviews, and organizational policy education.',
    sensitiveAssetsCount: 2,
  },
  {
    name: 'Finance',
    lead: 'Rohan Mehra',
    headcount: 7,
    description: 'Financial operations, enterprise budgeting, SOC 2 billing integrity, and commercial financial compliance.',
    sensitiveAssetsCount: 2,
  },
  {
    name: 'Legal',
    lead: 'Pooja Kulkarni',
    headcount: 5,
    description: 'Corporate privacy law, statutory compliance, intellectual property protection, and customer data rights.',
    sensitiveAssetsCount: 2,
  },
  {
    name: 'Marketing',
    lead: 'Aditya Nair',
    headcount: 7,
    description: 'Technical brand advocacy, developer relations, enterprise outreach, and cybersecurity research publication.',
    sensitiveAssetsCount: 1,
  },
]

export const EMPLOYEES: EmployeeProfile[] = [
  {
    "id": "EMP-1001",
    "name": "Pavan Jadhav",
    "role": "Principal AI Architect",
    "designation": "Principal AI Architect",
    "department": "Engineering",
    "email": "pavan.jadhav@firewall.internal",
    "phone": "+91 98200 10000",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Active",
    "location": "Pune HQ - Tech Park Tower A",
    "lastLogin": "Today, 08:10 AM",
    "riskScore": 18,
    "behaviorScore": 94,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8000-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:10 AM",
        "event": "Lead AI architect baseline",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-701",
        "timestamp": "10:15 AM",
        "resource": "Engineering Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Lead AI architect baseline"
      },
      {
        "id": "REQ-702",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-703",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 350,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1002",
    "name": "Vikas Rathod",
    "role": "Lead SOC Analyst",
    "designation": "Lead SOC Analyst",
    "department": "SOC",
    "email": "vikas.rathod@firewall.internal",
    "phone": "+91 98207 10031",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Active",
    "location": "Pune HQ - SecOps War Room",
    "lastLogin": "Today, 09:17 AM",
    "riskScore": 14,
    "behaviorScore": 96,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8001-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:17 AM",
        "event": "Lead SOC analyst baseline",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for SOC Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-704",
        "timestamp": "10:15 AM",
        "resource": "SOC Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Lead SOC analyst baseline"
      },
      {
        "id": "REQ-705",
        "timestamp": "09:50 AM",
        "resource": "SOC Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-706",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 363,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1003",
    "name": "Ghanshyam Sapkal",
    "role": "Senior DevOps Engineer",
    "designation": "Senior DevOps Engineer",
    "department": "DevOps",
    "email": "ghanshyam.sapkal@firewall.internal",
    "phone": "+91 98214 10062",
    "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Active",
    "location": "Pune HQ - AI Research Lab",
    "lastLogin": "Today, 10:24 AM",
    "riskScore": 16,
    "behaviorScore": 95,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8002-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:24 AM",
        "event": "DevOps cluster lead baseline",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for DevOps Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-707",
        "timestamp": "10:15 AM",
        "resource": "DevOps Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: DevOps cluster lead baseline"
      },
      {
        "id": "REQ-708",
        "timestamp": "09:50 AM",
        "resource": "DevOps Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-709",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 376,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1004",
    "name": "Pratik Akkanawaru",
    "role": "Senior Cloud Architect",
    "designation": "Senior Cloud Architect",
    "department": "Cloud",
    "email": "pratik.akkanawaru@firewall.internal",
    "phone": "+91 98221 10093",
    "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Active",
    "location": "Bangalore Center - Cloud Campus",
    "lastLogin": "Today, 08:31 AM",
    "riskScore": 12,
    "behaviorScore": 97,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8003-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:31 AM",
        "event": "Cloud architecture baseline",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Cloud Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-710",
        "timestamp": "10:15 AM",
        "resource": "Cloud Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Cloud architecture baseline"
      },
      {
        "id": "REQ-711",
        "timestamp": "09:50 AM",
        "resource": "Cloud Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-712",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 389,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1005",
    "name": "Saurabh Talape",
    "role": "IAM Security Specialist",
    "designation": "IAM Security Specialist",
    "department": "Security",
    "email": "saurabh.talape@firewall.internal",
    "phone": "+91 98228 10124",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Active",
    "location": "Bangalore Center - Zero Trust Lab",
    "lastLogin": "Today, 09:38 AM",
    "riskScore": 15,
    "behaviorScore": 95,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8004-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:38 AM",
        "event": "IAM admin baseline",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Security Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-713",
        "timestamp": "10:15 AM",
        "resource": "Security Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: IAM admin baseline"
      },
      {
        "id": "REQ-714",
        "timestamp": "09:50 AM",
        "resource": "Security Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-715",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 402,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1006",
    "name": "Vaibhav Deshmukh",
    "role": "Data Protection Officer",
    "designation": "Data Protection Officer",
    "department": "Compliance",
    "email": "vaibhav.deshmukh@firewall.internal",
    "phone": "+91 98235 10155",
    "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Under Watch",
    "location": "Mumbai Tech Hub - Tier 4 Datacenter",
    "lastLogin": "Today, 10:40 AM",
    "riskScore": 26,
    "behaviorScore": 74,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8005-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "10:40 AM",
        "event": "Audit compliance telemetry check",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Compliance Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-716",
        "timestamp": "10:15 AM",
        "resource": "Compliance Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Audit compliance telemetry check"
      },
      {
        "id": "REQ-717",
        "timestamp": "09:50 AM",
        "resource": "Compliance Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-718",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 235,
      "warned": 17,
      "restricted": 4,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1007",
    "name": "Himanshu Gond",
    "role": "Senior Threat Hunter",
    "designation": "Senior Threat Hunter",
    "department": "Threat Intelligence",
    "email": "himanshu.gond@firewall.internal",
    "phone": "+91 98242 10186",
    "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Investigating",
    "location": "Hyderabad Campus - Innovation Center",
    "lastLogin": "Today, 09:38 AM",
    "riskScore": 54,
    "behaviorScore": 48,
    "riskLevel": "High",
    "mfaEnabled": true,
    "currentSession": "SES-8006-RESTRICTED (Quarantined Sandbox)",
    "behaviorTimeline": [
      {
        "time": "09:38 AM",
        "event": "Malware sandbox detonation session",
        "type": "anomaly",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Threat Intelligence Production DB",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-719",
        "timestamp": "10:15 AM",
        "resource": "Threat Intelligence Production DB",
        "action": "modify",
        "decision": "RESTRICT",
        "reason": "AI Behavioral Engine: Malware sandbox detonation session"
      },
      {
        "id": "REQ-720",
        "timestamp": "09:50 AM",
        "resource": "Threat Intelligence Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-721",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 122,
      "warned": 30,
      "restricted": 15,
      "blocked": 5
    }
  },
  {
    "id": "EMP-1008",
    "name": "Ram Rajurkar",
    "role": "Data Platform Engineer",
    "designation": "Data Platform Engineer",
    "department": "Engineering",
    "email": "ram.rajurkar@firewall.internal",
    "phone": "+91 98249 10217",
    "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Suspended",
    "location": "Remote - Secure Zero-Trust WireGuard",
    "lastLogin": "Today, 07:54 AM",
    "riskScore": 86,
    "behaviorScore": 14,
    "riskLevel": "Critical",
    "mfaEnabled": false,
    "currentSession": "SES-8007-REVOKED (Access Terminated by AI Policy)",
    "behaviorTimeline": [
      {
        "time": "07:54 AM",
        "event": "Mass bulk export from protected S3 vault",
        "type": "policy",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Secure S3 Vault & PII Store",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "alert"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-722",
        "timestamp": "10:15 AM",
        "resource": "Secure S3 Vault & PII Store",
        "action": "bulk_export",
        "decision": "BLOCK",
        "reason": "AI Behavioral Engine: Mass bulk export from protected S3 vault"
      },
      {
        "id": "REQ-723",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "BLOCK",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-724",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 50,
      "warned": 45,
      "restricted": 23,
      "blocked": 25
    }
  },
  {
    "id": "EMP-1009",
    "name": "Kavita Rao",
    "role": "Treasury Operations Analyst",
    "designation": "Treasury Operations Analyst",
    "department": "Finance",
    "email": "kavita.rao@firewall.internal",
    "phone": "+91 98256 10248",
    "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Suspended",
    "location": "Pune HQ - Tech Park Tower A",
    "lastLogin": "Today, 08:56 AM",
    "riskScore": 88,
    "behaviorScore": 12,
    "riskLevel": "Critical",
    "mfaEnabled": false,
    "currentSession": "SES-8008-REVOKED (Access Terminated by AI Policy)",
    "behaviorTimeline": [
      {
        "time": "08:56 AM",
        "event": "Unusual Wire Transfer & Off-hours Mass Export",
        "type": "policy",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Secure S3 Vault & PII Store",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "alert"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-725",
        "timestamp": "10:15 AM",
        "resource": "Secure S3 Vault & PII Store",
        "action": "bulk_export",
        "decision": "BLOCK",
        "reason": "AI Behavioral Engine: Unusual Wire Transfer & Off-hours Mass Export"
      },
      {
        "id": "REQ-726",
        "timestamp": "09:50 AM",
        "resource": "Finance Shared Drive",
        "action": "read",
        "decision": "BLOCK",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-727",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 35,
      "warned": 46,
      "restricted": 24,
      "blocked": 26
    }
  },
  {
    "id": "EMP-1010",
    "name": "Devendra Joshi",
    "role": "Site Reliability Engineer",
    "designation": "Site Reliability Engineer",
    "department": "DevOps",
    "email": "devendra.joshi@firewall.internal",
    "phone": "+91 98263 10279",
    "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Suspended",
    "location": "Pune HQ - SecOps War Room",
    "lastLogin": "Today, 06:40 AM",
    "riskScore": 84,
    "behaviorScore": 16,
    "riskLevel": "Critical",
    "mfaEnabled": false,
    "currentSession": "SES-8009-REVOKED (Access Terminated by AI Policy)",
    "behaviorTimeline": [
      {
        "time": "06:40 AM",
        "event": "Attempted Privilege Escalation to Root Secrets",
        "type": "policy",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Secure S3 Vault & PII Store",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "alert"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-728",
        "timestamp": "10:15 AM",
        "resource": "Secure S3 Vault & PII Store",
        "action": "bulk_export",
        "decision": "BLOCK",
        "reason": "AI Behavioral Engine: Attempted Privilege Escalation to Root Secrets"
      },
      {
        "id": "REQ-729",
        "timestamp": "09:50 AM",
        "resource": "DevOps Shared Drive",
        "action": "read",
        "decision": "BLOCK",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-730",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 40,
      "warned": 47,
      "restricted": 25,
      "blocked": 27
    }
  },
  {
    "id": "EMP-1011",
    "name": "Siddharth Patel",
    "role": "Security Operations Specialist",
    "designation": "Security Operations Specialist",
    "department": "Security",
    "email": "siddharth.patel@firewall.internal",
    "phone": "+91 98270 10310",
    "avatar": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Suspended",
    "location": "Pune HQ - AI Research Lab",
    "lastLogin": "Today, 07:42 AM",
    "riskScore": 92,
    "behaviorScore": 10,
    "riskLevel": "Critical",
    "mfaEnabled": false,
    "currentSession": "SES-8010-REVOKED (Access Terminated by AI Policy)",
    "behaviorTimeline": [
      {
        "time": "07:42 AM",
        "event": "Multiple Failed Logins & Malicious API Payload",
        "type": "policy",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Secure S3 Vault & PII Store",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "alert"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-731",
        "timestamp": "10:15 AM",
        "resource": "Secure S3 Vault & PII Store",
        "action": "bulk_export",
        "decision": "BLOCK",
        "reason": "AI Behavioral Engine: Multiple Failed Logins & Malicious API Payload"
      },
      {
        "id": "REQ-732",
        "timestamp": "09:50 AM",
        "resource": "Security Shared Drive",
        "action": "read",
        "decision": "BLOCK",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-733",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 45,
      "warned": 48,
      "restricted": 26,
      "blocked": 28
    }
  },
  {
    "id": "EMP-1012",
    "name": "Meera Nambiar",
    "role": "Cloud Storage Administrator",
    "designation": "Cloud Storage Administrator",
    "department": "Cloud",
    "email": "meera.nambiar@firewall.internal",
    "phone": "+91 98277 10341",
    "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Suspended",
    "location": "Bangalore Center - Cloud Campus",
    "lastLogin": "Today, 08:44 AM",
    "riskScore": 82,
    "behaviorScore": 18,
    "riskLevel": "Critical",
    "mfaEnabled": false,
    "currentSession": "SES-8011-REVOKED (Access Terminated by AI Policy)",
    "behaviorTimeline": [
      {
        "time": "08:44 AM",
        "event": "Bulk Download of Encrypted S3 Bucket Keys",
        "type": "policy",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Secure S3 Vault & PII Store",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "alert"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-734",
        "timestamp": "10:15 AM",
        "resource": "Secure S3 Vault & PII Store",
        "action": "bulk_export",
        "decision": "BLOCK",
        "reason": "AI Behavioral Engine: Bulk Download of Encrypted S3 Bucket Keys"
      },
      {
        "id": "REQ-735",
        "timestamp": "09:50 AM",
        "resource": "Cloud Shared Drive",
        "action": "read",
        "decision": "BLOCK",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-736",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 50,
      "warned": 49,
      "restricted": 27,
      "blocked": 29
    }
  },
  {
    "id": "EMP-1013",
    "name": "Arjun Verma",
    "role": "Director of Infrastructure",
    "designation": "Director of Infrastructure",
    "department": "Infrastructure",
    "email": "arjun.verma@firewall.internal",
    "phone": "+91 98284 10372",
    "avatar": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Investigating",
    "location": "Bangalore Center - Zero Trust Lab",
    "lastLogin": "Today, 07:21 AM",
    "riskScore": 64,
    "behaviorScore": 38,
    "riskLevel": "High",
    "mfaEnabled": true,
    "currentSession": "SES-8012-RESTRICTED (Quarantined Sandbox)",
    "behaviorTimeline": [
      {
        "time": "07:21 AM",
        "event": "Unregistered Bastion SSH Ingress Detected",
        "type": "anomaly",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Infrastructure Production DB",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-737",
        "timestamp": "10:15 AM",
        "resource": "Infrastructure Production DB",
        "action": "modify",
        "decision": "RESTRICT",
        "reason": "AI Behavioral Engine: Unregistered Bastion SSH Ingress Detected"
      },
      {
        "id": "REQ-738",
        "timestamp": "09:50 AM",
        "resource": "Infrastructure Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-739",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 104,
      "warned": 36,
      "restricted": 13,
      "blocked": 3
    }
  },
  {
    "id": "EMP-1014",
    "name": "Dr. Elena Rostova",
    "role": "Lead AI Research Scientist",
    "designation": "Lead AI Research Scientist",
    "department": "AI Research",
    "email": "elena.rostova@firewall.internal",
    "phone": "+91 98291 10403",
    "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Investigating",
    "location": "Mumbai Tech Hub - Tier 4 Datacenter",
    "lastLogin": "Today, 08:24 AM",
    "riskScore": 52,
    "behaviorScore": 49,
    "riskLevel": "High",
    "mfaEnabled": false,
    "currentSession": "SES-8013-RESTRICTED (Quarantined Sandbox)",
    "behaviorTimeline": [
      {
        "time": "08:24 AM",
        "event": "Exporting 4GB Model Weights via External Host",
        "type": "anomaly",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for AI Research Production DB",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-740",
        "timestamp": "10:15 AM",
        "resource": "AI Research Production DB",
        "action": "modify",
        "decision": "RESTRICT",
        "reason": "AI Behavioral Engine: Exporting 4GB Model Weights via External Host"
      },
      {
        "id": "REQ-741",
        "timestamp": "09:50 AM",
        "resource": "AI Research Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-742",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 111,
      "warned": 37,
      "restricted": 14,
      "blocked": 4
    }
  },
  {
    "id": "EMP-1015",
    "name": "Rajesh Kulkarni",
    "role": "Backend Staff Engineer",
    "designation": "Backend Staff Engineer",
    "department": "Engineering",
    "email": "rajesh.kulkarni@firewall.internal",
    "phone": "+91 98298 10434",
    "avatar": "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Investigating",
    "location": "Hyderabad Campus - Innovation Center",
    "lastLogin": "Today, 09:27 AM",
    "riskScore": 58,
    "behaviorScore": 44,
    "riskLevel": "High",
    "mfaEnabled": true,
    "currentSession": "SES-8014-RESTRICTED (Quarantined Sandbox)",
    "behaviorTimeline": [
      {
        "time": "09:27 AM",
        "event": "Sudden Surge in Production Database Queries",
        "type": "anomaly",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Production DB",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-743",
        "timestamp": "10:15 AM",
        "resource": "Engineering Production DB",
        "action": "modify",
        "decision": "RESTRICT",
        "reason": "AI Behavioral Engine: Sudden Surge in Production Database Queries"
      },
      {
        "id": "REQ-744",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-745",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 118,
      "warned": 38,
      "restricted": 15,
      "blocked": 5
    }
  },
  {
    "id": "EMP-1016",
    "name": "Sneha Deshmukh",
    "role": "Senior Talent Partner",
    "designation": "Senior Talent Partner",
    "department": "HR",
    "email": "sneha.deshmukh@firewall.internal",
    "phone": "+91 98305 10465",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Investigating",
    "location": "Remote - Secure Zero-Trust WireGuard",
    "lastLogin": "Today, 10:30 AM",
    "riskScore": 48,
    "behaviorScore": 52,
    "riskLevel": "High",
    "mfaEnabled": false,
    "currentSession": "SES-8015-RESTRICTED (Quarantined Sandbox)",
    "behaviorTimeline": [
      {
        "time": "10:30 AM",
        "event": "Off-hours Access to Confidential Executive Payroll",
        "type": "anomaly",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for HR Production DB",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-746",
        "timestamp": "10:15 AM",
        "resource": "HR Production DB",
        "action": "modify",
        "decision": "RESTRICT",
        "reason": "AI Behavioral Engine: Off-hours Access to Confidential Executive Payroll"
      },
      {
        "id": "REQ-747",
        "timestamp": "09:50 AM",
        "resource": "HR Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-748",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 125,
      "warned": 24,
      "restricted": 16,
      "blocked": 6
    }
  },
  {
    "id": "EMP-1017",
    "name": "Manish Tiwari",
    "role": "Tier 2 SOC Analyst",
    "designation": "Tier 2 SOC Analyst",
    "department": "SOC",
    "email": "manish.tiwari@firewall.internal",
    "phone": "+91 98312 10496",
    "avatar": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Investigating",
    "location": "Pune HQ - Tech Park Tower A",
    "lastLogin": "Today, 07:33 AM",
    "riskScore": 62,
    "behaviorScore": 40,
    "riskLevel": "High",
    "mfaEnabled": true,
    "currentSession": "SES-8016-RESTRICTED (Quarantined Sandbox)",
    "behaviorTimeline": [
      {
        "time": "07:33 AM",
        "event": "Repeated Anomalous Policy Overrides in Quarantine",
        "type": "anomaly",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for SOC Production DB",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-749",
        "timestamp": "10:15 AM",
        "resource": "SOC Production DB",
        "action": "modify",
        "decision": "RESTRICT",
        "reason": "AI Behavioral Engine: Repeated Anomalous Policy Overrides in Quarantine"
      },
      {
        "id": "REQ-750",
        "timestamp": "09:50 AM",
        "resource": "SOC Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-751",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 132,
      "warned": 25,
      "restricted": 9,
      "blocked": 3
    }
  },
  {
    "id": "EMP-1018",
    "name": "Ananya Sharma",
    "role": "VP of Human Resources",
    "designation": "VP of Human Resources",
    "department": "HR",
    "email": "ananya.sharma@firewall.internal",
    "phone": "+91 98319 10527",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Investigating",
    "location": "Pune HQ - SecOps War Room",
    "lastLogin": "Today, 08:36 AM",
    "riskScore": 44,
    "behaviorScore": 56,
    "riskLevel": "High",
    "mfaEnabled": false,
    "currentSession": "SES-8017-RESTRICTED (Quarantined Sandbox)",
    "behaviorTimeline": [
      {
        "time": "08:36 AM",
        "event": "Unrecognized VPN Ingress from Foreign IP ASN",
        "type": "anomaly",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for HR Production DB",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-752",
        "timestamp": "10:15 AM",
        "resource": "HR Production DB",
        "action": "modify",
        "decision": "RESTRICT",
        "reason": "AI Behavioral Engine: Unrecognized VPN Ingress from Foreign IP ASN"
      },
      {
        "id": "REQ-753",
        "timestamp": "09:50 AM",
        "resource": "HR Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-754",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 139,
      "warned": 26,
      "restricted": 10,
      "blocked": 4
    }
  },
  {
    "id": "EMP-1019",
    "name": "Varun Saxena",
    "role": "Full Stack Developer",
    "designation": "Full Stack Developer",
    "department": "Engineering",
    "email": "varun.saxena@firewall.internal",
    "phone": "+91 98326 10558",
    "avatar": "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Investigating",
    "location": "Pune HQ - AI Research Lab",
    "lastLogin": "Today, 09:39 AM",
    "riskScore": 68,
    "behaviorScore": 34,
    "riskLevel": "High",
    "mfaEnabled": true,
    "currentSession": "SES-8018-RESTRICTED (Quarantined Sandbox)",
    "behaviorTimeline": [
      {
        "time": "09:39 AM",
        "event": "Git Repository Mirroring via Non-standard Protocol",
        "type": "anomaly",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Production DB",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-755",
        "timestamp": "10:15 AM",
        "resource": "Engineering Production DB",
        "action": "modify",
        "decision": "RESTRICT",
        "reason": "AI Behavioral Engine: Git Repository Mirroring via Non-standard Protocol"
      },
      {
        "id": "REQ-756",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-757",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 86,
      "warned": 27,
      "restricted": 11,
      "blocked": 5
    }
  },
  {
    "id": "EMP-1020",
    "name": "Ritu Agarwal",
    "role": "Senior Financial Controller",
    "designation": "Senior Financial Controller",
    "department": "Finance",
    "email": "ritu.agarwal@firewall.internal",
    "phone": "+91 98333 10589",
    "avatar": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Investigating",
    "location": "Bangalore Center - Cloud Campus",
    "lastLogin": "Today, 10:42 AM",
    "riskScore": 50,
    "behaviorScore": 50,
    "riskLevel": "High",
    "mfaEnabled": false,
    "currentSession": "SES-8019-RESTRICTED (Quarantined Sandbox)",
    "behaviorTimeline": [
      {
        "time": "10:42 AM",
        "event": "Accessing Unsanctioned Financial Audit Tables",
        "type": "anomaly",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Finance Production DB",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-758",
        "timestamp": "10:15 AM",
        "resource": "Finance Production DB",
        "action": "modify",
        "decision": "RESTRICT",
        "reason": "AI Behavioral Engine: Accessing Unsanctioned Financial Audit Tables"
      },
      {
        "id": "REQ-759",
        "timestamp": "09:50 AM",
        "resource": "Finance Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-760",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 93,
      "warned": 28,
      "restricted": 12,
      "blocked": 6
    }
  },
  {
    "id": "EMP-1021",
    "name": "Karan Malhotra",
    "role": "Infrastructure Automation Engineer",
    "designation": "Infrastructure Automation Engineer",
    "department": "DevOps",
    "email": "karan.malhotra@firewall.internal",
    "phone": "+91 98340 10620",
    "avatar": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Investigating",
    "location": "Bangalore Center - Zero Trust Lab",
    "lastLogin": "Today, 07:45 AM",
    "riskScore": 72,
    "behaviorScore": 30,
    "riskLevel": "High",
    "mfaEnabled": true,
    "currentSession": "SES-8020-RESTRICTED (Quarantined Sandbox)",
    "behaviorTimeline": [
      {
        "time": "07:45 AM",
        "event": "Unauthorized Modification to Ingress WAF Rules",
        "type": "anomaly",
        "severity": "alert"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for DevOps Production DB",
        "type": "access",
        "severity": "warning"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-761",
        "timestamp": "10:15 AM",
        "resource": "DevOps Production DB",
        "action": "modify",
        "decision": "RESTRICT",
        "reason": "AI Behavioral Engine: Unauthorized Modification to Ingress WAF Rules"
      },
      {
        "id": "REQ-762",
        "timestamp": "09:50 AM",
        "resource": "DevOps Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-763",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 100,
      "warned": 29,
      "restricted": 13,
      "blocked": 3
    }
  },
  {
    "id": "EMP-1022",
    "name": "Rohan Mehra",
    "role": "Head of Finance",
    "designation": "Head of Finance",
    "department": "Finance",
    "email": "rohan.mehra@firewall.internal",
    "phone": "+91 98347 10651",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Under Watch",
    "location": "Mumbai Tech Hub - Tier 4 Datacenter",
    "lastLogin": "Today, 10:40 AM",
    "riskScore": 28,
    "behaviorScore": 72,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8021-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "10:40 AM",
        "event": "Accessing Billing Reports from New Geolocation",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Finance Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-764",
        "timestamp": "10:15 AM",
        "resource": "Finance Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Accessing Billing Reports from New Geolocation"
      },
      {
        "id": "REQ-765",
        "timestamp": "09:50 AM",
        "resource": "Finance Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-766",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 291,
      "warned": 13,
      "restricted": 2,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1023",
    "name": "Pooja Kulkarni",
    "role": "General Legal Counsel",
    "designation": "General Legal Counsel",
    "department": "Legal",
    "email": "pooja.kulkarni@firewall.internal",
    "phone": "+91 98354 10682",
    "avatar": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Under Watch",
    "location": "Hyderabad Campus - Innovation Center",
    "lastLogin": "Today, 09:45 AM",
    "riskScore": 24,
    "behaviorScore": 76,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8022-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "09:45 AM",
        "event": "Rapid Multi-file NDA Download Sequence",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Legal Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-767",
        "timestamp": "10:15 AM",
        "resource": "Legal Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Rapid Multi-file NDA Download Sequence"
      },
      {
        "id": "REQ-768",
        "timestamp": "09:50 AM",
        "resource": "Legal Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-769",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 182,
      "warned": 14,
      "restricted": 3,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1024",
    "name": "Aditya Nair",
    "role": "Head of Marketing",
    "designation": "Head of Marketing",
    "department": "Marketing",
    "email": "aditya.nair@firewall.internal",
    "phone": "+91 98361 10713",
    "avatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Under Watch",
    "location": "Remote - Secure Zero-Trust WireGuard",
    "lastLogin": "Today, 10:50 AM",
    "riskScore": 32,
    "behaviorScore": 68,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8023-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "10:50 AM",
        "event": "Campaign Asset Sync Exceeding Hourly Bandwidth",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Marketing Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-770",
        "timestamp": "10:15 AM",
        "resource": "Marketing Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Campaign Asset Sync Exceeding Hourly Bandwidth"
      },
      {
        "id": "REQ-771",
        "timestamp": "09:50 AM",
        "resource": "Marketing Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-772",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 193,
      "warned": 15,
      "restricted": 4,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1025",
    "name": "Shreya Ghosal",
    "role": "Content Strategy Lead",
    "designation": "Content Strategy Lead",
    "department": "Marketing",
    "email": "shreya.ghosal@firewall.internal",
    "phone": "+91 98368 10744",
    "avatar": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Under Watch",
    "location": "Pune HQ - Tech Park Tower A",
    "lastLogin": "Today, 09:15 AM",
    "riskScore": 22,
    "behaviorScore": 78,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8024-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "09:15 AM",
        "event": "CMS API Access Outside Normal Working Window",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Marketing Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-773",
        "timestamp": "10:15 AM",
        "resource": "Marketing Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: CMS API Access Outside Normal Working Window"
      },
      {
        "id": "REQ-774",
        "timestamp": "09:50 AM",
        "resource": "Marketing Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-775",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 204,
      "warned": 16,
      "restricted": 2,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1026",
    "name": "Naveen Reddy",
    "role": "Senior Frontend Engineer",
    "designation": "Senior Frontend Engineer",
    "department": "Engineering",
    "email": "naveen.reddy@firewall.internal",
    "phone": "+91 98375 10775",
    "avatar": "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Under Watch",
    "location": "Pune HQ - SecOps War Room",
    "lastLogin": "Today, 10:20 AM",
    "riskScore": 36,
    "behaviorScore": 64,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8025-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "10:20 AM",
        "event": "Staging Environment Token Generated from Laptop",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-776",
        "timestamp": "10:15 AM",
        "resource": "Engineering Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Staging Environment Token Generated from Laptop"
      },
      {
        "id": "REQ-777",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-778",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 215,
      "warned": 17,
      "restricted": 3,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1027",
    "name": "Tanvi Shah",
    "role": "Distributed Systems Engineer",
    "designation": "Distributed Systems Engineer",
    "department": "Engineering",
    "email": "tanvi.shah@firewall.internal",
    "phone": "+91 98382 10806",
    "avatar": "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Under Watch",
    "location": "Pune HQ - AI Research Lab",
    "lastLogin": "Today, 09:25 AM",
    "riskScore": 34,
    "behaviorScore": 66,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8026-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "09:25 AM",
        "event": "Telemetry Port Forwarding Session Active",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-779",
        "timestamp": "10:15 AM",
        "resource": "Engineering Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Telemetry Port Forwarding Session Active"
      },
      {
        "id": "REQ-780",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-781",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 226,
      "warned": 18,
      "restricted": 4,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1028",
    "name": "Deepak Shenoy",
    "role": "AppSec Vulnerability Engineer",
    "designation": "AppSec Vulnerability Engineer",
    "department": "Security",
    "email": "deepak.shenoy@firewall.internal",
    "phone": "+91 98389 10837",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Under Watch",
    "location": "Bangalore Center - Cloud Campus",
    "lastLogin": "Today, 10:30 AM",
    "riskScore": 38,
    "behaviorScore": 62,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8027-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "10:30 AM",
        "event": "Burp Suite Ingress Scanner Active on QA API",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Security Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-782",
        "timestamp": "10:15 AM",
        "resource": "Security Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Burp Suite Ingress Scanner Active on QA API"
      },
      {
        "id": "REQ-783",
        "timestamp": "09:50 AM",
        "resource": "Security Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-784",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 237,
      "warned": 19,
      "restricted": 2,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1029",
    "name": "Priya Swaminathan",
    "role": "NLP Research Engineer",
    "designation": "NLP Research Engineer",
    "department": "AI Research",
    "email": "priya.swaminathan@firewall.internal",
    "phone": "+91 98396 10868",
    "avatar": "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Under Watch",
    "location": "Bangalore Center - Zero Trust Lab",
    "lastLogin": "Today, 09:35 AM",
    "riskScore": 25,
    "behaviorScore": 75,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8028-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "09:35 AM",
        "event": "Embedding Vector Store Query Frequency High",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for AI Research Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-785",
        "timestamp": "10:15 AM",
        "resource": "AI Research Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Embedding Vector Store Query Frequency High"
      },
      {
        "id": "REQ-786",
        "timestamp": "09:50 AM",
        "resource": "AI Research Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-787",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 248,
      "warned": 20,
      "restricted": 3,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1030",
    "name": "Kunal Kamra",
    "role": "Kubernetes Mesh Engineer",
    "designation": "Kubernetes Mesh Engineer",
    "department": "Cloud",
    "email": "kunal.kamra@firewall.internal",
    "phone": "+91 98403 10899",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Under Watch",
    "location": "Mumbai Tech Hub - Tier 4 Datacenter",
    "lastLogin": "Today, 10:40 AM",
    "riskScore": 30,
    "behaviorScore": 70,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8029-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "10:40 AM",
        "event": "kubectl Config Pulled to Secondary Workstation",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Cloud Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-788",
        "timestamp": "10:15 AM",
        "resource": "Cloud Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: kubectl Config Pulled to Secondary Workstation"
      },
      {
        "id": "REQ-789",
        "timestamp": "09:50 AM",
        "resource": "Cloud Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-790",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 259,
      "warned": 21,
      "restricted": 4,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1031",
    "name": "Aarti Bhat",
    "role": "Regulatory Audit Specialist",
    "designation": "Regulatory Audit Specialist",
    "department": "Compliance",
    "email": "aarti.bhat@firewall.internal",
    "phone": "+91 98410 10930",
    "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Under Watch",
    "location": "Hyderabad Campus - Innovation Center",
    "lastLogin": "Today, 09:45 AM",
    "riskScore": 23,
    "behaviorScore": 77,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8030-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "09:45 AM",
        "event": "Audit Log Parser Triggering Repetitive Read",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Compliance Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-791",
        "timestamp": "10:15 AM",
        "resource": "Compliance Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Audit Log Parser Triggering Repetitive Read"
      },
      {
        "id": "REQ-792",
        "timestamp": "09:50 AM",
        "resource": "Compliance Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-793",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 270,
      "warned": 12,
      "restricted": 2,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1032",
    "name": "Sameer Khan",
    "role": "Incident Response Handler",
    "designation": "Incident Response Handler",
    "department": "SOC",
    "email": "sameer.khan@firewall.internal",
    "phone": "+91 98417 10961",
    "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Under Watch",
    "location": "Remote - Secure Zero-Trust WireGuard",
    "lastLogin": "Today, 10:50 AM",
    "riskScore": 35,
    "behaviorScore": 65,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8031-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "10:50 AM",
        "event": "Triage Ticket Escalation to External Webhook",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for SOC Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-794",
        "timestamp": "10:15 AM",
        "resource": "SOC Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Triage Ticket Escalation to External Webhook"
      },
      {
        "id": "REQ-795",
        "timestamp": "09:50 AM",
        "resource": "SOC Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-796",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 281,
      "warned": 13,
      "restricted": 3,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1033",
    "name": "Swati Mohanty",
    "role": "IP & Trademark Attorney",
    "designation": "IP & Trademark Attorney",
    "department": "Legal",
    "email": "swati.mohanty@firewall.internal",
    "phone": "+91 98424 10992",
    "avatar": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Under Watch",
    "location": "Pune HQ - Tech Park Tower A",
    "lastLogin": "Today, 09:15 AM",
    "riskScore": 27,
    "behaviorScore": 73,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8032-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "09:15 AM",
        "event": "Document Vault Accessed from Mobile Hotspot",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Legal Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-797",
        "timestamp": "10:15 AM",
        "resource": "Legal Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Document Vault Accessed from Mobile Hotspot"
      },
      {
        "id": "REQ-798",
        "timestamp": "09:50 AM",
        "resource": "Legal Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-799",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 292,
      "warned": 14,
      "restricted": 4,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1034",
    "name": "Nitin Gadkari",
    "role": "Network Operations Lead",
    "designation": "Network Operations Lead",
    "department": "Infrastructure",
    "email": "nitin.gadkari@firewall.internal",
    "phone": "+91 98431 11023",
    "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Under Watch",
    "location": "Pune HQ - SecOps War Room",
    "lastLogin": "Today, 10:20 AM",
    "riskScore": 39,
    "behaviorScore": 61,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8033-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "10:20 AM",
        "event": "BGP Routing Table Check During Maintenance",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Infrastructure Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-800",
        "timestamp": "10:15 AM",
        "resource": "Infrastructure Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: BGP Routing Table Check During Maintenance"
      },
      {
        "id": "REQ-801",
        "timestamp": "09:50 AM",
        "resource": "Infrastructure Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-802",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 183,
      "warned": 15,
      "restricted": 2,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1035",
    "name": "Rashmi Sen",
    "role": "QA Automation Architect",
    "designation": "QA Automation Architect",
    "department": "Engineering",
    "email": "rashmi.sen@firewall.internal",
    "phone": "+91 98438 11054",
    "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Under Watch",
    "location": "Pune HQ - AI Research Lab",
    "lastLogin": "Today, 09:25 AM",
    "riskScore": 29,
    "behaviorScore": 71,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8034-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "09:25 AM",
        "event": "Automated Selenium Test Emulating User Spikes",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-803",
        "timestamp": "10:15 AM",
        "resource": "Engineering Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Automated Selenium Test Emulating User Spikes"
      },
      {
        "id": "REQ-804",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-805",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 194,
      "warned": 16,
      "restricted": 3,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1036",
    "name": "Abhishek Bachchan",
    "role": "Malware Reverse Engineer",
    "designation": "Malware Reverse Engineer",
    "department": "Threat Intelligence",
    "email": "abhishek.bachchan@firewall.internal",
    "phone": "+91 98445 11085",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Under Watch",
    "location": "Bangalore Center - Cloud Campus",
    "lastLogin": "Today, 10:30 AM",
    "riskScore": 37,
    "behaviorScore": 63,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8035-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "10:30 AM",
        "event": "Isolated Sandbox Sample Executed in Lab",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Threat Intelligence Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-806",
        "timestamp": "10:15 AM",
        "resource": "Threat Intelligence Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Isolated Sandbox Sample Executed in Lab"
      },
      {
        "id": "REQ-807",
        "timestamp": "09:50 AM",
        "resource": "Threat Intelligence Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-808",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 205,
      "warned": 17,
      "restricted": 4,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1037",
    "name": "Divya Pillai",
    "role": "Computer Vision Scientist",
    "designation": "Computer Vision Scientist",
    "department": "AI Research",
    "email": "divya.pillai@firewall.internal",
    "phone": "+91 98452 11116",
    "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Under Watch",
    "location": "Bangalore Center - Zero Trust Lab",
    "lastLogin": "Today, 09:35 AM",
    "riskScore": 26,
    "behaviorScore": 74,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8036-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "09:35 AM",
        "event": "Dataset Annotation Batch Download Flagged",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for AI Research Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-809",
        "timestamp": "10:15 AM",
        "resource": "AI Research Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Dataset Annotation Batch Download Flagged"
      },
      {
        "id": "REQ-810",
        "timestamp": "09:50 AM",
        "resource": "AI Research Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-811",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 216,
      "warned": 18,
      "restricted": 2,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1038",
    "name": "Harshavardhan Rao",
    "role": "Terraform Cloud Specialist",
    "designation": "Terraform Cloud Specialist",
    "department": "Cloud",
    "email": "harshavardhan.rao@firewall.internal",
    "phone": "+91 98459 11147",
    "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Under Watch",
    "location": "Mumbai Tech Hub - Tier 4 Datacenter",
    "lastLogin": "Today, 10:40 AM",
    "riskScore": 31,
    "behaviorScore": 69,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8037-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "10:40 AM",
        "event": "Drift Detection Triggered on Non-Prod Cluster",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Cloud Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-812",
        "timestamp": "10:15 AM",
        "resource": "Cloud Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Drift Detection Triggered on Non-Prod Cluster"
      },
      {
        "id": "REQ-813",
        "timestamp": "09:50 AM",
        "resource": "Cloud Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-814",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 227,
      "warned": 19,
      "restricted": 3,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1039",
    "name": "Komal Singhania",
    "role": "People Operations Lead",
    "designation": "People Operations Lead",
    "department": "HR",
    "email": "komal.singhania@firewall.internal",
    "phone": "+91 98466 11178",
    "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Under Watch",
    "location": "Hyderabad Campus - Innovation Center",
    "lastLogin": "Today, 09:45 AM",
    "riskScore": 24,
    "behaviorScore": 76,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8038-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "09:45 AM",
        "event": "Employee Directory Search Rate Spike",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for HR Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-815",
        "timestamp": "10:15 AM",
        "resource": "HR Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Employee Directory Search Rate Spike"
      },
      {
        "id": "REQ-816",
        "timestamp": "09:50 AM",
        "resource": "HR Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-817",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 238,
      "warned": 20,
      "restricted": 4,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1040",
    "name": "Girish Karnad",
    "role": "Embedded Firmware Engineer",
    "designation": "Embedded Firmware Engineer",
    "department": "Engineering",
    "email": "girish.karnad@firewall.internal",
    "phone": "+91 98473 11209",
    "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Under Watch",
    "location": "Remote - Secure Zero-Trust WireGuard",
    "lastLogin": "Today, 10:50 AM",
    "riskScore": 33,
    "behaviorScore": 67,
    "riskLevel": "Medium",
    "mfaEnabled": true,
    "currentSession": "SES-8039-EVAL (Conditional Access Lease)",
    "behaviorTimeline": [
      {
        "time": "10:50 AM",
        "event": "Hardware JTAG Interface Connection Reported",
        "type": "anomaly",
        "severity": "warning"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Analytics Engine",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-818",
        "timestamp": "10:15 AM",
        "resource": "Engineering Analytics Engine",
        "action": "query",
        "decision": "WARN",
        "reason": "AI Behavioral Engine: Hardware JTAG Interface Connection Reported"
      },
      {
        "id": "REQ-819",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-820",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 249,
      "warned": 21,
      "restricted": 2,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1041",
    "name": "Aarav Mehta",
    "role": "Senior Backend Engineer",
    "designation": "Senior Backend Engineer",
    "department": "Engineering",
    "email": "aarav.mehta@firewall.internal",
    "phone": "+91 98480 11240",
    "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Active",
    "location": "Pune HQ - Tech Park Tower A",
    "lastLogin": "Today, 09:20 AM",
    "riskScore": 8,
    "behaviorScore": 97,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8040-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:20 AM",
        "event": "Routine Microservice PR Merged",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-821",
        "timestamp": "10:15 AM",
        "resource": "Engineering Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Routine Microservice PR Merged"
      },
      {
        "id": "REQ-822",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-823",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 370,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1042",
    "name": "Diya Sen",
    "role": "Machine Learning Engineer",
    "designation": "Machine Learning Engineer",
    "department": "AI Research",
    "email": "diya.sen@firewall.internal",
    "phone": "+91 98487 11271",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Active",
    "location": "Pune HQ - SecOps War Room",
    "lastLogin": "Today, 10:27 AM",
    "riskScore": 11,
    "behaviorScore": 95,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8041-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:27 AM",
        "event": "PyTorch Model Checkpoint Synchronized",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for AI Research Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-824",
        "timestamp": "10:15 AM",
        "resource": "AI Research Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: PyTorch Model Checkpoint Synchronized"
      },
      {
        "id": "REQ-825",
        "timestamp": "09:50 AM",
        "resource": "AI Research Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-826",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 383,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1043",
    "name": "Kabir Das",
    "role": "Security Governance Analyst",
    "designation": "Security Governance Analyst",
    "department": "Security",
    "email": "kabir.das@firewall.internal",
    "phone": "+91 98494 11302",
    "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Active",
    "location": "Pune HQ - AI Research Lab",
    "lastLogin": "Today, 08:34 AM",
    "riskScore": 6,
    "behaviorScore": 98,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8042-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:34 AM",
        "event": "Weekly Access Certification Completed",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Security Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-827",
        "timestamp": "10:15 AM",
        "resource": "Security Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Weekly Access Certification Completed"
      },
      {
        "id": "REQ-828",
        "timestamp": "09:50 AM",
        "resource": "Security Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-829",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 396,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1044",
    "name": "Ishita Roy",
    "role": "Compliance Associate",
    "designation": "Compliance Associate",
    "department": "Legal",
    "email": "ishita.roy@firewall.internal",
    "phone": "+91 98501 11333",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Active",
    "location": "Bangalore Center - Cloud Campus",
    "lastLogin": "Today, 09:41 AM",
    "riskScore": 9,
    "behaviorScore": 96,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8043-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:41 AM",
        "event": "Vendor Privacy Agreement Reviewed",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Legal Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-830",
        "timestamp": "10:15 AM",
        "resource": "Legal Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Vendor Privacy Agreement Reviewed"
      },
      {
        "id": "REQ-831",
        "timestamp": "09:50 AM",
        "resource": "Legal Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-832",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 409,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1045",
    "name": "Rohan Chawla",
    "role": "CI/CD Pipeline Specialist",
    "designation": "CI/CD Pipeline Specialist",
    "department": "DevOps",
    "email": "rohan.chawla@firewall.internal",
    "phone": "+91 98508 11364",
    "avatar": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Active",
    "location": "Bangalore Center - Zero Trust Lab",
    "lastLogin": "Today, 10:48 AM",
    "riskScore": 14,
    "behaviorScore": 94,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8044-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:48 AM",
        "event": "GitHub Actions Runner Image Updated",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for DevOps Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-833",
        "timestamp": "10:15 AM",
        "resource": "DevOps Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: GitHub Actions Runner Image Updated"
      },
      {
        "id": "REQ-834",
        "timestamp": "09:50 AM",
        "resource": "DevOps Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-835",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 422,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1046",
    "name": "Neha Kapoor",
    "role": "Brand Designer",
    "designation": "Brand Designer",
    "department": "Marketing",
    "email": "neha.kapoor@firewall.internal",
    "phone": "+91 98515 11395",
    "avatar": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Active",
    "location": "Mumbai Tech Hub - Tier 4 Datacenter",
    "lastLogin": "Today, 08:10 AM",
    "riskScore": 7,
    "behaviorScore": 98,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8045-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:10 AM",
        "event": "Figma Asset Bundle Uploaded to Cloud",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Marketing Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-836",
        "timestamp": "10:15 AM",
        "resource": "Marketing Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Figma Asset Bundle Uploaded to Cloud"
      },
      {
        "id": "REQ-837",
        "timestamp": "09:50 AM",
        "resource": "Marketing Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-838",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 435,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1047",
    "name": "Vikram Singhania",
    "role": "Systems Administrator",
    "designation": "Systems Administrator",
    "department": "Infrastructure",
    "email": "vikram.singhania@firewall.internal",
    "phone": "+91 98522 11426",
    "avatar": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Active",
    "location": "Hyderabad Campus - Innovation Center",
    "lastLogin": "Today, 09:17 AM",
    "riskScore": 12,
    "behaviorScore": 95,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8046-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:17 AM",
        "event": "NTP Time Synchronization Health Check",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Infrastructure Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-839",
        "timestamp": "10:15 AM",
        "resource": "Infrastructure Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: NTP Time Synchronization Health Check"
      },
      {
        "id": "REQ-840",
        "timestamp": "09:50 AM",
        "resource": "Infrastructure Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-841",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 448,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1048",
    "name": "Zara Khan",
    "role": "SOC Shift Lead",
    "designation": "SOC Shift Lead",
    "department": "SOC",
    "email": "zara.khan@firewall.internal",
    "phone": "+91 98529 11457",
    "avatar": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Active",
    "location": "Remote - Secure Zero-Trust WireGuard",
    "lastLogin": "Today, 10:24 AM",
    "riskScore": 10,
    "behaviorScore": 96,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8047-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:24 AM",
        "event": "Shift Handoff Log Submitted Successfully",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for SOC Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-842",
        "timestamp": "10:15 AM",
        "resource": "SOC Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Shift Handoff Log Submitted Successfully"
      },
      {
        "id": "REQ-843",
        "timestamp": "09:50 AM",
        "resource": "SOC Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-844",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 461,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1049",
    "name": "Amitabh Sen",
    "role": "Cloud FinOps Analyst",
    "designation": "Cloud FinOps Analyst",
    "department": "Cloud",
    "email": "amitabh.sen@firewall.internal",
    "phone": "+91 98536 11488",
    "avatar": "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Active",
    "location": "Pune HQ - Tech Park Tower A",
    "lastLogin": "Today, 08:31 AM",
    "riskScore": 8,
    "behaviorScore": 97,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8048-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:31 AM",
        "event": "Monthly AWS Savings Plan Evaluated",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Cloud Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-845",
        "timestamp": "10:15 AM",
        "resource": "Cloud Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Monthly AWS Savings Plan Evaluated"
      },
      {
        "id": "REQ-846",
        "timestamp": "09:50 AM",
        "resource": "Cloud Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-847",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 474,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1050",
    "name": "Pooja Hegde",
    "role": "Talent Acquisition Specialist",
    "designation": "Talent Acquisition Specialist",
    "department": "HR",
    "email": "pooja.hegde@firewall.internal",
    "phone": "+91 98543 11519",
    "avatar": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Active",
    "location": "Pune HQ - SecOps War Room",
    "lastLogin": "Today, 09:38 AM",
    "riskScore": 5,
    "behaviorScore": 99,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8049-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:38 AM",
        "event": "Candidate Interview Assessment Submitted",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for HR Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-848",
        "timestamp": "10:15 AM",
        "resource": "HR Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Candidate Interview Assessment Submitted"
      },
      {
        "id": "REQ-849",
        "timestamp": "09:50 AM",
        "resource": "HR Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-850",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 487,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1051",
    "name": "Suraj Sharma",
    "role": "Frontend Engineer",
    "designation": "Frontend Engineer",
    "department": "Engineering",
    "email": "suraj.sharma@firewall.internal",
    "phone": "+91 98550 11550",
    "avatar": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Active",
    "location": "Pune HQ - AI Research Lab",
    "lastLogin": "Today, 10:45 AM",
    "riskScore": 13,
    "behaviorScore": 94,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8050-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:45 AM",
        "event": "Tailwind Design System Tokens Updated",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-851",
        "timestamp": "10:15 AM",
        "resource": "Engineering Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Tailwind Design System Tokens Updated"
      },
      {
        "id": "REQ-852",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-853",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 500,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1052",
    "name": "Bhavna Patel",
    "role": "Accounts Payable Lead",
    "designation": "Accounts Payable Lead",
    "department": "Finance",
    "email": "bhavna.patel@firewall.internal",
    "phone": "+91 98557 11581",
    "avatar": "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Active",
    "location": "Bangalore Center - Cloud Campus",
    "lastLogin": "Today, 08:52 AM",
    "riskScore": 10,
    "behaviorScore": 96,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8051-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:52 AM",
        "event": "Vendor Invoice Batch Verified",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Finance Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-854",
        "timestamp": "10:15 AM",
        "resource": "Finance Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Vendor Invoice Batch Verified"
      },
      {
        "id": "REQ-855",
        "timestamp": "09:50 AM",
        "resource": "Finance Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-856",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 513,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1053",
    "name": "Gaurav Chopra",
    "role": "OSINT Threat Analyst",
    "designation": "OSINT Threat Analyst",
    "department": "Threat Intelligence",
    "email": "gaurav.chopra@firewall.internal",
    "phone": "+91 98564 11612",
    "avatar": "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Active",
    "location": "Bangalore Center - Zero Trust Lab",
    "lastLogin": "Today, 09:14 AM",
    "riskScore": 15,
    "behaviorScore": 93,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8052-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:14 AM",
        "event": "Public IOC Feeds Ingested to Vector DB",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Threat Intelligence Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-857",
        "timestamp": "10:15 AM",
        "resource": "Threat Intelligence Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Public IOC Feeds Ingested to Vector DB"
      },
      {
        "id": "REQ-858",
        "timestamp": "09:50 AM",
        "resource": "Threat Intelligence Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-859",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 526,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1054",
    "name": "Kiran Bedi",
    "role": "Data Governance Auditor",
    "designation": "Data Governance Auditor",
    "department": "Compliance",
    "email": "kiran.bedi@firewall.internal",
    "phone": "+91 98571 11643",
    "avatar": "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Active",
    "location": "Mumbai Tech Hub - Tier 4 Datacenter",
    "lastLogin": "Today, 10:21 AM",
    "riskScore": 9,
    "behaviorScore": 96,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8053-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:21 AM",
        "event": "Quarterly DPDP Compliance Checklist Filed",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Compliance Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-860",
        "timestamp": "10:15 AM",
        "resource": "Compliance Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Quarterly DPDP Compliance Checklist Filed"
      },
      {
        "id": "REQ-861",
        "timestamp": "09:50 AM",
        "resource": "Compliance Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-862",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 539,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1055",
    "name": "Mohit Raina",
    "role": "Penetration Tester",
    "designation": "Penetration Tester",
    "department": "Security",
    "email": "mohit.raina@firewall.internal",
    "phone": "+91 98578 11674",
    "avatar": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Active",
    "location": "Hyderabad Campus - Innovation Center",
    "lastLogin": "Today, 08:28 AM",
    "riskScore": 17,
    "behaviorScore": 92,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8054-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:28 AM",
        "event": "Authorized Scope Penetration Test Logged",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Security Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-863",
        "timestamp": "10:15 AM",
        "resource": "Security Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Authorized Scope Penetration Test Logged"
      },
      {
        "id": "REQ-864",
        "timestamp": "09:50 AM",
        "resource": "Security Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-865",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 552,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1056",
    "name": "Pallavi Shinde",
    "role": "Data Scientist",
    "designation": "Data Scientist",
    "department": "AI Research",
    "email": "pallavi.shinde@firewall.internal",
    "phone": "+91 98585 11705",
    "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Active",
    "location": "Remote - Secure Zero-Trust WireGuard",
    "lastLogin": "Today, 09:35 AM",
    "riskScore": 12,
    "behaviorScore": 95,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8055-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:35 AM",
        "event": "Feature Store Exploration Notebook Saved",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for AI Research Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-866",
        "timestamp": "10:15 AM",
        "resource": "AI Research Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Feature Store Exploration Notebook Saved"
      },
      {
        "id": "REQ-867",
        "timestamp": "09:50 AM",
        "resource": "AI Research Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-868",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 565,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1057",
    "name": "Naveen Jindal",
    "role": "Storage Systems Engineer",
    "designation": "Storage Systems Engineer",
    "department": "Infrastructure",
    "email": "naveen.jindal@firewall.internal",
    "phone": "+91 98592 11736",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Active",
    "location": "Pune HQ - Tech Park Tower A",
    "lastLogin": "Today, 10:42 AM",
    "riskScore": 11,
    "behaviorScore": 96,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8056-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:42 AM",
        "event": "Ceph Storage Cluster Health Healthy",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Infrastructure Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-869",
        "timestamp": "10:15 AM",
        "resource": "Infrastructure Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Ceph Storage Cluster Health Healthy"
      },
      {
        "id": "REQ-870",
        "timestamp": "09:50 AM",
        "resource": "Infrastructure Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-871",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 578,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1058",
    "name": "Radhika Apte",
    "role": "Platform Security Engineer",
    "designation": "Platform Security Engineer",
    "department": "Engineering",
    "email": "radhika.apte@firewall.internal",
    "phone": "+91 98599 11767",
    "avatar": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Active",
    "location": "Pune HQ - SecOps War Room",
    "lastLogin": "Today, 08:49 AM",
    "riskScore": 14,
    "behaviorScore": 94,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8057-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:49 AM",
        "event": "Vault Secret Rotation Cycle Completed",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-872",
        "timestamp": "10:15 AM",
        "resource": "Engineering Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Vault Secret Rotation Cycle Completed"
      },
      {
        "id": "REQ-873",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-874",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 591,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1059",
    "name": "Sanjay Dutt",
    "role": "Site Reliability Engineer",
    "designation": "Site Reliability Engineer",
    "department": "Cloud",
    "email": "sanjay.dutt@firewall.internal",
    "phone": "+91 98606 11798",
    "avatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Active",
    "location": "Pune HQ - AI Research Lab",
    "lastLogin": "Today, 09:11 AM",
    "riskScore": 16,
    "behaviorScore": 93,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8058-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:11 AM",
        "event": "Datadog Alert Thresholds Tuned",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Cloud Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-875",
        "timestamp": "10:15 AM",
        "resource": "Cloud Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Datadog Alert Thresholds Tuned"
      },
      {
        "id": "REQ-876",
        "timestamp": "09:50 AM",
        "resource": "Cloud Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-877",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 354,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1060",
    "name": "Simran Kaur",
    "role": "Product Marketing Manager",
    "designation": "Product Marketing Manager",
    "department": "Marketing",
    "email": "simran.kaur@firewall.internal",
    "phone": "+91 98613 11829",
    "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Active",
    "location": "Bangalore Center - Cloud Campus",
    "lastLogin": "Today, 10:18 AM",
    "riskScore": 6,
    "behaviorScore": 98,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8059-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:18 AM",
        "event": "Product Release Notes Drafted",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Marketing Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-878",
        "timestamp": "10:15 AM",
        "resource": "Marketing Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Product Release Notes Drafted"
      },
      {
        "id": "REQ-879",
        "timestamp": "09:50 AM",
        "resource": "Marketing Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-880",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 367,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1061",
    "name": "Tushar Gandhi",
    "role": "Release Engineer",
    "designation": "Release Engineer",
    "department": "DevOps",
    "email": "tushar.gandhi@firewall.internal",
    "phone": "+91 98620 11860",
    "avatar": "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Active",
    "location": "Bangalore Center - Zero Trust Lab",
    "lastLogin": "Today, 08:25 AM",
    "riskScore": 13,
    "behaviorScore": 94,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8060-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:25 AM",
        "event": "v2.4.0 Canary Deployment Verified",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for DevOps Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-881",
        "timestamp": "10:15 AM",
        "resource": "DevOps Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: v2.4.0 Canary Deployment Verified"
      },
      {
        "id": "REQ-882",
        "timestamp": "09:50 AM",
        "resource": "DevOps Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-883",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 380,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1062",
    "name": "Urmila Matondkar",
    "role": "Junior Security Analyst",
    "designation": "Junior Security Analyst",
    "department": "SOC",
    "email": "urmila.matondkar@firewall.internal",
    "phone": "+91 98627 11891",
    "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Active",
    "location": "Mumbai Tech Hub - Tier 4 Datacenter",
    "lastLogin": "Today, 09:32 AM",
    "riskScore": 8,
    "behaviorScore": 97,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8061-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:32 AM",
        "event": "Triage Queue Cleared on Schedule",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for SOC Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-884",
        "timestamp": "10:15 AM",
        "resource": "SOC Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Triage Queue Cleared on Schedule"
      },
      {
        "id": "REQ-885",
        "timestamp": "09:50 AM",
        "resource": "SOC Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-886",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 393,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1063",
    "name": "Vinay Pathak",
    "role": "Financial Analyst",
    "designation": "Financial Analyst",
    "department": "Finance",
    "email": "vinay.pathak@firewall.internal",
    "phone": "+91 98634 11922",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Active",
    "location": "Hyderabad Campus - Innovation Center",
    "lastLogin": "Today, 10:39 AM",
    "riskScore": 9,
    "behaviorScore": 96,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8062-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:39 AM",
        "event": "Quarterly OPEX Forecast Updated",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Finance Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-887",
        "timestamp": "10:15 AM",
        "resource": "Finance Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Quarterly OPEX Forecast Updated"
      },
      {
        "id": "REQ-888",
        "timestamp": "09:50 AM",
        "resource": "Finance Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-889",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 406,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1064",
    "name": "Yashasvi Jaiswal",
    "role": "Full Stack Engineer",
    "designation": "Full Stack Engineer",
    "department": "Engineering",
    "email": "yashasvi.jaiswal@firewall.internal",
    "phone": "+91 98641 11953",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Active",
    "location": "Remote - Secure Zero-Trust WireGuard",
    "lastLogin": "Today, 08:46 AM",
    "riskScore": 11,
    "behaviorScore": 95,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8063-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:46 AM",
        "event": "GraphQL Schema Deprecation Handled",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-890",
        "timestamp": "10:15 AM",
        "resource": "Engineering Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: GraphQL Schema Deprecation Handled"
      },
      {
        "id": "REQ-891",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-892",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 419,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1065",
    "name": "Zoya Akhtar",
    "role": "Legal Operations Manager",
    "designation": "Legal Operations Manager",
    "department": "Legal",
    "email": "zoya.akhtar@firewall.internal",
    "phone": "+91 98648 11984",
    "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Active",
    "location": "Pune HQ - Tech Park Tower A",
    "lastLogin": "Today, 09:53 AM",
    "riskScore": 7,
    "behaviorScore": 98,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8064-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:53 AM",
        "event": "Corporate Bylaws Repository Backed Up",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Legal Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-893",
        "timestamp": "10:15 AM",
        "resource": "Legal Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Corporate Bylaws Repository Backed Up"
      },
      {
        "id": "REQ-894",
        "timestamp": "09:50 AM",
        "resource": "Legal Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-895",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 432,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1066",
    "name": "Akash Ambani",
    "role": "Cryptographic Systems Engineer",
    "designation": "Cryptographic Systems Engineer",
    "department": "Security",
    "email": "akash.ambani@firewall.internal",
    "phone": "+91 98655 12015",
    "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Active",
    "location": "Pune HQ - SecOps War Room",
    "lastLogin": "Today, 10:15 AM",
    "riskScore": 15,
    "behaviorScore": 93,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8065-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:15 AM",
        "event": "Hardware Security Module Key Verified",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Security Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-896",
        "timestamp": "10:15 AM",
        "resource": "Security Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Hardware Security Module Key Verified"
      },
      {
        "id": "REQ-897",
        "timestamp": "09:50 AM",
        "resource": "Security Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-898",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 445,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1067",
    "name": "Barkha Dutt",
    "role": "Communications Director",
    "designation": "Communications Director",
    "department": "Marketing",
    "email": "barkha.dutt@firewall.internal",
    "phone": "+91 98662 12046",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Active",
    "location": "Pune HQ - AI Research Lab",
    "lastLogin": "Today, 08:22 AM",
    "riskScore": 8,
    "behaviorScore": 97,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8066-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:22 AM",
        "event": "Quarterly Security Bulletin Published",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Marketing Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-899",
        "timestamp": "10:15 AM",
        "resource": "Marketing Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Quarterly Security Bulletin Published"
      },
      {
        "id": "REQ-900",
        "timestamp": "09:50 AM",
        "resource": "Marketing Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-901",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 458,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1068",
    "name": "Chetan Bhagat",
    "role": "Technical Writer",
    "designation": "Technical Writer",
    "department": "Engineering",
    "email": "chetan.bhagat@firewall.internal",
    "phone": "+91 98669 12077",
    "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Active",
    "location": "Bangalore Center - Cloud Campus",
    "lastLogin": "Today, 09:29 AM",
    "riskScore": 6,
    "behaviorScore": 98,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8067-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:29 AM",
        "event": "API Documentation Updated on GitBook",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-902",
        "timestamp": "10:15 AM",
        "resource": "Engineering Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: API Documentation Updated on GitBook"
      },
      {
        "id": "REQ-903",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-904",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 471,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1069",
    "name": "Disha Patani",
    "role": "Employee Experience Lead",
    "designation": "Employee Experience Lead",
    "department": "HR",
    "email": "disha.patani@firewall.internal",
    "phone": "+91 98676 12108",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Active",
    "location": "Bangalore Center - Zero Trust Lab",
    "lastLogin": "Today, 10:36 AM",
    "riskScore": 5,
    "behaviorScore": 99,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8068-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:36 AM",
        "event": "Wellness Program Metrics Compiled",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for HR Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-905",
        "timestamp": "10:15 AM",
        "resource": "HR Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Wellness Program Metrics Compiled"
      },
      {
        "id": "REQ-906",
        "timestamp": "09:50 AM",
        "resource": "HR Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-907",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 484,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1070",
    "name": "Esha Deol",
    "role": "Research Scientist",
    "designation": "Research Scientist",
    "department": "AI Research",
    "email": "esha.deol@firewall.internal",
    "phone": "+91 98683 12139",
    "avatar": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Active",
    "location": "Mumbai Tech Hub - Tier 4 Datacenter",
    "lastLogin": "Today, 08:43 AM",
    "riskScore": 12,
    "behaviorScore": 95,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8069-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:43 AM",
        "event": "TreeSHAP Local Explanation Validated",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for AI Research Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-908",
        "timestamp": "10:15 AM",
        "resource": "AI Research Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: TreeSHAP Local Explanation Validated"
      },
      {
        "id": "REQ-909",
        "timestamp": "09:50 AM",
        "resource": "AI Research Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-910",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 497,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1071",
    "name": "Farhan Akhtar",
    "role": "Multi-Cloud Architect",
    "designation": "Multi-Cloud Architect",
    "department": "Cloud",
    "email": "farhan.akhtar@firewall.internal",
    "phone": "+91 98690 12170",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Active",
    "location": "Hyderabad Campus - Innovation Center",
    "lastLogin": "Today, 09:50 AM",
    "riskScore": 14,
    "behaviorScore": 94,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8070-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:50 AM",
        "event": "Cross-Region VPC Peering Configured",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Cloud Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-911",
        "timestamp": "10:15 AM",
        "resource": "Cloud Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Cross-Region VPC Peering Configured"
      },
      {
        "id": "REQ-912",
        "timestamp": "09:50 AM",
        "resource": "Cloud Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-913",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 510,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1072",
    "name": "Gauri Shinde",
    "role": "Privacy Risk Assessor",
    "designation": "Privacy Risk Assessor",
    "department": "Compliance",
    "email": "gauri.shinde@firewall.internal",
    "phone": "+91 98697 12201",
    "avatar": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Active",
    "location": "Remote - Secure Zero-Trust WireGuard",
    "lastLogin": "Today, 10:12 AM",
    "riskScore": 10,
    "behaviorScore": 96,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8071-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:12 AM",
        "event": "DPIA Assessment Signed Off",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Compliance Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-914",
        "timestamp": "10:15 AM",
        "resource": "Compliance Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: DPIA Assessment Signed Off"
      },
      {
        "id": "REQ-915",
        "timestamp": "09:50 AM",
        "resource": "Compliance Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-916",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 523,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1073",
    "name": "Hrithik Roshan",
    "role": "Senior Incident Responder",
    "designation": "Senior Incident Responder",
    "department": "SOC",
    "email": "hrithik.roshan@firewall.internal",
    "phone": "+91 98704 12232",
    "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Active",
    "location": "Pune HQ - Tech Park Tower A",
    "lastLogin": "Today, 08:19 AM",
    "riskScore": 13,
    "behaviorScore": 94,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8072-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:19 AM",
        "event": "False Positive Rule Suppressed",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for SOC Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-917",
        "timestamp": "10:15 AM",
        "resource": "SOC Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: False Positive Rule Suppressed"
      },
      {
        "id": "REQ-918",
        "timestamp": "09:50 AM",
        "resource": "SOC Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-919",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 536,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1074",
    "name": "Ileana DCruz",
    "role": "Tax Compliance Specialist",
    "designation": "Tax Compliance Specialist",
    "department": "Finance",
    "email": "ileana.dcruz@firewall.internal",
    "phone": "+91 98711 12263",
    "avatar": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Active",
    "location": "Pune HQ - SecOps War Room",
    "lastLogin": "Today, 09:26 AM",
    "riskScore": 7,
    "behaviorScore": 98,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8073-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:26 AM",
        "event": "GST Filing Reconciliation Verified",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Finance Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-920",
        "timestamp": "10:15 AM",
        "resource": "Finance Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: GST Filing Reconciliation Verified"
      },
      {
        "id": "REQ-921",
        "timestamp": "09:50 AM",
        "resource": "Finance Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-922",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 549,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1075",
    "name": "Javed Akhtar",
    "role": "Cyber Threat Analyst",
    "designation": "Cyber Threat Analyst",
    "department": "Threat Intelligence",
    "email": "javed.akhtar@firewall.internal",
    "phone": "+91 98718 12294",
    "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Active",
    "location": "Pune HQ - AI Research Lab",
    "lastLogin": "Today, 10:33 AM",
    "riskScore": 16,
    "behaviorScore": 93,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8074-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:33 AM",
        "event": "Dark Web Threat Actor Report Logged",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Threat Intelligence Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-923",
        "timestamp": "10:15 AM",
        "resource": "Threat Intelligence Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Dark Web Threat Actor Report Logged"
      },
      {
        "id": "REQ-924",
        "timestamp": "09:50 AM",
        "resource": "Threat Intelligence Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-925",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 562,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1076",
    "name": "Kriti Sanon",
    "role": "API Platform Engineer",
    "designation": "API Platform Engineer",
    "department": "Engineering",
    "email": "kriti.sanon@firewall.internal",
    "phone": "+91 98725 12325",
    "avatar": "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Active",
    "location": "Bangalore Center - Cloud Campus",
    "lastLogin": "Today, 08:40 AM",
    "riskScore": 11,
    "behaviorScore": 95,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8075-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:40 AM",
        "event": "REST Endpoint Latency Benchmark Done",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-926",
        "timestamp": "10:15 AM",
        "resource": "Engineering Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: REST Endpoint Latency Benchmark Done"
      },
      {
        "id": "REQ-927",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-928",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 575,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1077",
    "name": "Lucky Ali",
    "role": "Data Center Tech",
    "designation": "Data Center Tech",
    "department": "Infrastructure",
    "email": "lucky.ali@firewall.internal",
    "phone": "+91 98732 12356",
    "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Active",
    "location": "Bangalore Center - Zero Trust Lab",
    "lastLogin": "Today, 09:47 AM",
    "riskScore": 9,
    "behaviorScore": 96,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8076-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:47 AM",
        "event": "Fiber Optic Switch Diagnostic Normal",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Infrastructure Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-929",
        "timestamp": "10:15 AM",
        "resource": "Infrastructure Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Fiber Optic Switch Diagnostic Normal"
      },
      {
        "id": "REQ-930",
        "timestamp": "09:50 AM",
        "resource": "Infrastructure Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-931",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 588,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1078",
    "name": "Madhuri Dixit",
    "role": "Zero Trust Architect",
    "designation": "Zero Trust Architect",
    "department": "Security",
    "email": "madhuri.dixit@firewall.internal",
    "phone": "+91 98739 12387",
    "avatar": "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Active",
    "location": "Mumbai Tech Hub - Tier 4 Datacenter",
    "lastLogin": "Today, 10:54 AM",
    "riskScore": 14,
    "behaviorScore": 94,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8077-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:54 AM",
        "event": "Mutual TLS Policy Enforced on Mesh",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Security Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-932",
        "timestamp": "10:15 AM",
        "resource": "Security Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Mutual TLS Policy Enforced on Mesh"
      },
      {
        "id": "REQ-933",
        "timestamp": "09:50 AM",
        "resource": "Security Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-934",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 351,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1079",
    "name": "Naseeruddin Shah",
    "role": "Database Administrator",
    "designation": "Database Administrator",
    "department": "Engineering",
    "email": "naseeruddin.shah@firewall.internal",
    "phone": "+91 98746 12418",
    "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Active",
    "location": "Hyderabad Campus - Innovation Center",
    "lastLogin": "Today, 08:16 AM",
    "riskScore": 12,
    "behaviorScore": 95,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8078-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:16 AM",
        "event": "PostgreSQL Autovacuum Optimization Done",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-935",
        "timestamp": "10:15 AM",
        "resource": "Engineering Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: PostgreSQL Autovacuum Optimization Done"
      },
      {
        "id": "REQ-936",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-937",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 364,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1080",
    "name": "Om Puri",
    "role": "DevSecOps Specialist",
    "designation": "DevSecOps Specialist",
    "department": "DevOps",
    "email": "om.puri@firewall.internal",
    "phone": "+91 98753 12449",
    "avatar": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Active",
    "location": "Remote - Secure Zero-Trust WireGuard",
    "lastLogin": "Today, 09:23 AM",
    "riskScore": 15,
    "behaviorScore": 93,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8079-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:23 AM",
        "event": "SonarQube Static Analysis Zero Flaws",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for DevOps Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-938",
        "timestamp": "10:15 AM",
        "resource": "DevOps Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: SonarQube Static Analysis Zero Flaws"
      },
      {
        "id": "REQ-939",
        "timestamp": "09:50 AM",
        "resource": "DevOps Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-940",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 377,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1081",
    "name": "Pankaj Tripathi",
    "role": "MLOps Engineer",
    "designation": "MLOps Engineer",
    "department": "AI Research",
    "email": "pankaj.tripathi@firewall.internal",
    "phone": "+91 98760 12480",
    "avatar": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Active",
    "location": "Pune HQ - Tech Park Tower A",
    "lastLogin": "Today, 10:30 AM",
    "riskScore": 10,
    "behaviorScore": 96,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8080-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:30 AM",
        "event": "Kubeflow Model Serving Pipeline Green",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for AI Research Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-941",
        "timestamp": "10:15 AM",
        "resource": "AI Research Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Kubeflow Model Serving Pipeline Green"
      },
      {
        "id": "REQ-942",
        "timestamp": "09:50 AM",
        "resource": "AI Research Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-943",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 390,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1082",
    "name": "Qasim Ali",
    "role": "SOC Threat Hunter",
    "designation": "SOC Threat Hunter",
    "department": "Security",
    "email": "qasim.ali@firewall.internal",
    "phone": "+91 98767 12511",
    "avatar": "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Active",
    "location": "Pune HQ - SecOps War Room",
    "lastLogin": "Today, 08:37 AM",
    "riskScore": 16,
    "behaviorScore": 93,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8081-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:37 AM",
        "event": "IOC Sweep Completed Clean",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Security Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-944",
        "timestamp": "10:15 AM",
        "resource": "Security Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: IOC Sweep Completed Clean"
      },
      {
        "id": "REQ-945",
        "timestamp": "09:50 AM",
        "resource": "Security Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-946",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 403,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1083",
    "name": "Ranbir Kapoor",
    "role": "Mobile Security Engineer",
    "designation": "Mobile Security Engineer",
    "department": "Engineering",
    "email": "ranbir.kapoor@firewall.internal",
    "phone": "+91 98774 12542",
    "avatar": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Active",
    "location": "Pune HQ - AI Research Lab",
    "lastLogin": "Today, 09:44 AM",
    "riskScore": 13,
    "behaviorScore": 94,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8082-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:44 AM",
        "event": "iOS Keychain Entitlements Verified",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-947",
        "timestamp": "10:15 AM",
        "resource": "Engineering Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: iOS Keychain Entitlements Verified"
      },
      {
        "id": "REQ-948",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-949",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 416,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1084",
    "name": "Sonam Kapoor",
    "role": "Community Evangelist",
    "designation": "Community Evangelist",
    "department": "Marketing",
    "email": "sonam.kapoor@firewall.internal",
    "phone": "+91 98781 12573",
    "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Active",
    "location": "Bangalore Center - Cloud Campus",
    "lastLogin": "Today, 10:51 AM",
    "riskScore": 7,
    "behaviorScore": 98,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8083-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:51 AM",
        "event": "Discord Security Workshop Hosted",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Marketing Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-950",
        "timestamp": "10:15 AM",
        "resource": "Marketing Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Discord Security Workshop Hosted"
      },
      {
        "id": "REQ-951",
        "timestamp": "09:50 AM",
        "resource": "Marketing Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-952",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 429,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1085",
    "name": "Tabu Hashmi",
    "role": "Ethics & Privacy Officer",
    "designation": "Ethics & Privacy Officer",
    "department": "Compliance",
    "email": "tabu.hashmi@firewall.internal",
    "phone": "+91 98788 12604",
    "avatar": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Active",
    "location": "Bangalore Center - Zero Trust Lab",
    "lastLogin": "Today, 08:13 AM",
    "riskScore": 8,
    "behaviorScore": 97,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8084-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:13 AM",
        "event": "AI Fairness Metric Checklist Passed",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Compliance Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-953",
        "timestamp": "10:15 AM",
        "resource": "Compliance Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: AI Fairness Metric Checklist Passed"
      },
      {
        "id": "REQ-954",
        "timestamp": "09:50 AM",
        "resource": "Compliance Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-955",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 442,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1086",
    "name": "Utkarsh Sharma",
    "role": "Cloud Security Engineer",
    "designation": "Cloud Security Engineer",
    "department": "Cloud",
    "email": "utkarsh.sharma@firewall.internal",
    "phone": "+91 98795 12635",
    "avatar": "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Active",
    "location": "Mumbai Tech Hub - Tier 4 Datacenter",
    "lastLogin": "Today, 09:20 AM",
    "riskScore": 14,
    "behaviorScore": 94,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8085-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:20 AM",
        "event": "AWS GuardDuty Findings Cleared",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Cloud Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-956",
        "timestamp": "10:15 AM",
        "resource": "Cloud Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: AWS GuardDuty Findings Cleared"
      },
      {
        "id": "REQ-957",
        "timestamp": "09:50 AM",
        "resource": "Cloud Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-958",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 455,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1087",
    "name": "Vidya Balan",
    "role": "HR Business Partner",
    "designation": "HR Business Partner",
    "department": "HR",
    "email": "vidya.balan@firewall.internal",
    "phone": "+91 98802 12666",
    "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Active",
    "location": "Hyderabad Campus - Innovation Center",
    "lastLogin": "Today, 10:27 AM",
    "riskScore": 6,
    "behaviorScore": 98,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8086-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:27 AM",
        "event": "Annual Compliance Training Verified",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for HR Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-959",
        "timestamp": "10:15 AM",
        "resource": "HR Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Annual Compliance Training Verified"
      },
      {
        "id": "REQ-960",
        "timestamp": "09:50 AM",
        "resource": "HR Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-961",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 468,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1088",
    "name": "Waseem Akram",
    "role": "Distributed Cache Engineer",
    "designation": "Distributed Cache Engineer",
    "department": "Engineering",
    "email": "waseem.akram@firewall.internal",
    "phone": "+91 98809 12697",
    "avatar": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Active",
    "location": "Remote - Secure Zero-Trust WireGuard",
    "lastLogin": "Today, 08:34 AM",
    "riskScore": 11,
    "behaviorScore": 95,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8087-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:34 AM",
        "event": "Redis Cluster Shard Health Checked",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-962",
        "timestamp": "10:15 AM",
        "resource": "Engineering Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Redis Cluster Shard Health Checked"
      },
      {
        "id": "REQ-963",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-964",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 481,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1089",
    "name": "Xavier Dsouza",
    "role": "Hardware Security Engineer",
    "designation": "Hardware Security Engineer",
    "department": "Infrastructure",
    "email": "xavier.dsouza@firewall.internal",
    "phone": "+91 98816 12728",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Active",
    "location": "Pune HQ - Tech Park Tower A",
    "lastLogin": "Today, 09:41 AM",
    "riskScore": 10,
    "behaviorScore": 96,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8088-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:41 AM",
        "event": "Secure Enclave Attestation Confirmed",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Infrastructure Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-965",
        "timestamp": "10:15 AM",
        "resource": "Infrastructure Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Secure Enclave Attestation Confirmed"
      },
      {
        "id": "REQ-966",
        "timestamp": "09:50 AM",
        "resource": "Infrastructure Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-967",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 494,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1090",
    "name": "Yamini Reddy",
    "role": "Research Fellow",
    "designation": "Research Fellow",
    "department": "AI Research",
    "email": "yamini.reddy@firewall.internal",
    "phone": "+91 98823 12759",
    "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Active",
    "location": "Pune HQ - SecOps War Room",
    "lastLogin": "Today, 10:48 AM",
    "riskScore": 9,
    "behaviorScore": 96,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8089-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:48 AM",
        "event": "Differential Privacy Budget Tracked",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for AI Research Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-968",
        "timestamp": "10:15 AM",
        "resource": "AI Research Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Differential Privacy Budget Tracked"
      },
      {
        "id": "REQ-969",
        "timestamp": "09:50 AM",
        "resource": "AI Research Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-970",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 507,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1091",
    "name": "Zakir Khan",
    "role": "Backend Systems Engineer",
    "designation": "Backend Systems Engineer",
    "department": "Engineering",
    "email": "zakir.khan@firewall.internal",
    "phone": "+91 98830 12790",
    "avatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Active",
    "location": "Pune HQ - AI Research Lab",
    "lastLogin": "Today, 08:10 AM",
    "riskScore": 12,
    "behaviorScore": 95,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8090-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:10 AM",
        "event": "Kafka Consumer Lag Resolved",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-971",
        "timestamp": "10:15 AM",
        "resource": "Engineering Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Kafka Consumer Lag Resolved"
      },
      {
        "id": "REQ-972",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-973",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 520,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1092",
    "name": "Aditi Rao Hydari",
    "role": "Contract Specialist",
    "designation": "Contract Specialist",
    "department": "Legal",
    "email": "aditi.rao.hydari@firewall.internal",
    "phone": "+91 98837 12821",
    "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Active",
    "location": "Bangalore Center - Cloud Campus",
    "lastLogin": "Today, 09:17 AM",
    "riskScore": 8,
    "behaviorScore": 97,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8091-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:17 AM",
        "event": "Master Service Agreement Approved",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Legal Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-974",
        "timestamp": "10:15 AM",
        "resource": "Legal Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Master Service Agreement Approved"
      },
      {
        "id": "REQ-975",
        "timestamp": "09:50 AM",
        "resource": "Legal Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-976",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 533,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1093",
    "name": "Boman Irani",
    "role": "Chief Risk Officer",
    "designation": "Chief Risk Officer",
    "department": "Security",
    "email": "boman.irani@firewall.internal",
    "phone": "+91 98844 12852",
    "avatar": "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Active",
    "location": "Bangalore Center - Zero Trust Lab",
    "lastLogin": "Today, 10:24 AM",
    "riskScore": 11,
    "behaviorScore": 95,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8092-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:24 AM",
        "event": "Quarterly Risk Heatmap Approved",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Security Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-977",
        "timestamp": "10:15 AM",
        "resource": "Security Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Quarterly Risk Heatmap Approved"
      },
      {
        "id": "REQ-978",
        "timestamp": "09:50 AM",
        "resource": "Security Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-979",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 546,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1094",
    "name": "Chitrangada Singh",
    "role": "Risk Analyst",
    "designation": "Risk Analyst",
    "department": "Finance",
    "email": "chitrangada.singh@firewall.internal",
    "phone": "+91 98851 12883",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Active",
    "location": "Mumbai Tech Hub - Tier 4 Datacenter",
    "lastLogin": "Today, 08:31 AM",
    "riskScore": 9,
    "behaviorScore": 96,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8093-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:31 AM",
        "event": "Audit Reconciliation Approved",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Finance Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-980",
        "timestamp": "10:15 AM",
        "resource": "Finance Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Audit Reconciliation Approved"
      },
      {
        "id": "REQ-981",
        "timestamp": "09:50 AM",
        "resource": "Finance Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-982",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 559,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1095",
    "name": "Dhanush Raja",
    "role": "AI Pipeline Engineer",
    "designation": "AI Pipeline Engineer",
    "department": "Engineering",
    "email": "dhanush.raja@firewall.internal",
    "phone": "+91 98858 12914",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Air M2 (Privileged Workstation)",
    "currentDevice": "MacBook Air M2",
    "status": "Active",
    "location": "Hyderabad Campus - Innovation Center",
    "lastLogin": "Today, 09:38 AM",
    "riskScore": 14,
    "behaviorScore": 94,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8094-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:38 AM",
        "event": "Inference Latency Optimized to 8ms",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Engineering Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-983",
        "timestamp": "10:15 AM",
        "resource": "Engineering Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Inference Latency Optimized to 8ms"
      },
      {
        "id": "REQ-984",
        "timestamp": "09:50 AM",
        "resource": "Engineering Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-985",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 572,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1096",
    "name": "Fatima Sana Shaikh",
    "role": "Digital Marketing Specialist",
    "designation": "Digital Marketing Specialist",
    "department": "Marketing",
    "email": "fatima.sana.shaikh@firewall.internal",
    "phone": "+91 98865 12945",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Precision 5680 (AI Workstation)",
    "currentDevice": "Dell Precision 5680",
    "status": "Active",
    "location": "Remote - Secure Zero-Trust WireGuard",
    "lastLogin": "Today, 10:45 AM",
    "riskScore": 7,
    "behaviorScore": 98,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8095-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:45 AM",
        "event": "Ad Campaign Tracking Secured",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for Marketing Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-986",
        "timestamp": "10:15 AM",
        "resource": "Marketing Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Ad Campaign Tracking Secured"
      },
      {
        "id": "REQ-987",
        "timestamp": "09:50 AM",
        "resource": "Marketing Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-988",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 585,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1097",
    "name": "Gulshan Devaiah",
    "role": "Security Engineer",
    "designation": "Security Engineer",
    "department": "SOC",
    "email": "gulshan.devaiah@firewall.internal",
    "phone": "+91 98872 12976",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "device": "Dell Latitude 7440 (EDR Protected, Secure Boot)",
    "currentDevice": "Dell Latitude 7440",
    "status": "Active",
    "location": "Pune HQ - Tech Park Tower A",
    "lastLogin": "Today, 08:52 AM",
    "riskScore": 13,
    "behaviorScore": 94,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8096-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:52 AM",
        "event": "Firewall Rule Regression Tested",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for SOC Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-989",
        "timestamp": "10:15 AM",
        "resource": "SOC Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Firewall Rule Regression Tested"
      },
      {
        "id": "REQ-990",
        "timestamp": "09:50 AM",
        "resource": "SOC Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-991",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 598,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1098",
    "name": "Huma Qureshi",
    "role": "AI Ethics Specialist",
    "designation": "AI Ethics Specialist",
    "department": "AI Research",
    "email": "huma.qureshi@firewall.internal",
    "phone": "+91 98879 13007",
    "avatar": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    "device": "MacBook Pro M3 Max (Encrypted Corporate MDM)",
    "currentDevice": "MacBook Pro M3 Max",
    "status": "Active",
    "location": "Pune HQ - SecOps War Room",
    "lastLogin": "Today, 09:14 AM",
    "riskScore": 8,
    "behaviorScore": 97,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8097-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "09:14 AM",
        "event": "Model Explainability SHAP Review",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for AI Research Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-992",
        "timestamp": "10:15 AM",
        "resource": "AI Research Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Model Explainability SHAP Review"
      },
      {
        "id": "REQ-993",
        "timestamp": "09:50 AM",
        "resource": "AI Research Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-994",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 361,
      "warned": 1,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1099",
    "name": "Imran Khan",
    "role": "Build Infrastructure Engineer",
    "designation": "Build Infrastructure Engineer",
    "department": "DevOps",
    "email": "imran.khan@firewall.internal",
    "phone": "+91 98886 13038",
    "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    "device": "Lenovo ThinkPad X1 Carbon (Zero-Trust Enrolled)",
    "currentDevice": "Lenovo ThinkPad X1",
    "status": "Active",
    "location": "Pune HQ - AI Research Lab",
    "lastLogin": "Today, 10:21 AM",
    "riskScore": 12,
    "behaviorScore": 95,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8098-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "10:21 AM",
        "event": "Docker Buildkit Cache Tuned",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for DevOps Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-995",
        "timestamp": "10:15 AM",
        "resource": "DevOps Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Docker Buildkit Cache Tuned"
      },
      {
        "id": "REQ-996",
        "timestamp": "09:50 AM",
        "resource": "DevOps Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-997",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 374,
      "warned": 2,
      "restricted": 0,
      "blocked": 0
    }
  },
  {
    "id": "EMP-1100",
    "name": "Jacqueline Fernandez",
    "role": "Compensation Analyst",
    "designation": "Compensation Analyst",
    "department": "HR",
    "email": "jacqueline.fernandez@firewall.internal",
    "phone": "+91 98893 13069",
    "avatar": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
    "device": "HP EliteBook 840 G10 (Hardware TPM 2.0)",
    "currentDevice": "HP EliteBook 840",
    "status": "Active",
    "location": "Bangalore Center - Cloud Campus",
    "lastLogin": "Today, 08:28 AM",
    "riskScore": 6,
    "behaviorScore": 98,
    "riskLevel": "Low",
    "mfaEnabled": true,
    "currentSession": "SES-8099-ACTIVE (Hardware FIDO2 Token)",
    "behaviorTimeline": [
      {
        "time": "08:28 AM",
        "event": "Salary Benchmarking File Stored",
        "type": "auth",
        "severity": "info"
      },
      {
        "time": "10:15 AM",
        "event": "Policy decision evaluated for HR Internal Portal",
        "type": "access",
        "severity": "info"
      },
      {
        "time": "11:30 AM",
        "event": "UBA real-time anomaly score calculated",
        "type": "policy",
        "severity": "info"
      }
    ],
    "recentRequests": [
      {
        "id": "REQ-998",
        "timestamp": "10:15 AM",
        "resource": "HR Internal Portal",
        "action": "read",
        "decision": "ALLOW",
        "reason": "AI Behavioral Engine: Salary Benchmarking File Stored"
      },
      {
        "id": "REQ-999",
        "timestamp": "09:50 AM",
        "resource": "HR Shared Drive",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Department Access Matrix Verified"
      },
      {
        "id": "REQ-1000",
        "timestamp": "09:20 AM",
        "resource": "Telemetry Streamer",
        "action": "read",
        "decision": "ALLOW",
        "reason": "Standard Enterprise Ingress"
      }
    ],
    "firewallDecisions": {
      "allowed": 387,
      "warned": 0,
      "restricted": 0,
      "blocked": 0
    }
  }
]

export const APPLICATIONS: ResourceProfile[] = [
  {
    id: 'APP-01',
    name: 'AI Privacy Firewall Console',
    type: 'application',
    department: 'Engineering',
    classification: 'Top Secret / Trade Secret',
    confidentiality: 'Strict',
    owner: 'Pavan Jadhav (Principal AI Architect)',
    endpoint: 'https://firewall.internal',
    currentSessions: 42,
    accessPolicies: ['Zero Trust mTLS Enforcement', 'Role Based Access Control (RBAC)', 'Continuous Behavioral Verification'],
    connectedSystems: ['Kubernetes Cluster', 'API Gateway', 'Identity Provider'],
    blockedRequestsCount: 18,
    auditLogs: [
      { id: 'AUD-301', timestamp: '10:14 AM', subject: 'Pavan Jadhav', action: 'read', decision: 'ALLOW', riskScore: 18 },
      { id: 'AUD-302', timestamp: '09:42 AM', subject: 'Vikas Rathod', action: 'query', decision: 'ALLOW', riskScore: 14 },
    ],
  },
  {
    id: 'APP-02',
    name: 'SecOps Threat Hunting Command Center',
    type: 'application',
    department: 'SOC',
    classification: 'Confidential',
    confidentiality: 'High',
    owner: 'Vikas Rathod (Lead SOC Analyst)',
    endpoint: 'https://secops.internal',
    currentSessions: 19,
    accessPolicies: ['SOC Analyst Cleared Role Only', 'Hardware Token MFA Required'],
    connectedSystems: ['SIEM / Event Ingestion', 'Quarantine Controller'],
    blockedRequestsCount: 4,
    auditLogs: [
      { id: 'AUD-310', timestamp: '10:05 AM', subject: 'Vikas Rathod', action: 'modify', decision: 'ALLOW', riskScore: 14 },
    ],
  },
  {
    id: 'APP-03',
    name: 'Kubernetes Multi-Cloud Console',
    type: 'application',
    department: 'DevOps',
    classification: 'Top Secret / Trade Secret',
    confidentiality: 'Strict',
    owner: 'Ghanshyam Sapkal (Senior DevOps Engineer)',
    endpoint: 'https://k8s-console.internal',
    currentSessions: 28,
    accessPolicies: ['Cluster Admin Certificate Required', 'IP Whitelist Constraint'],
    connectedSystems: ['Kubernetes Cluster', 'HashiCorp Vault'],
    blockedRequestsCount: 22,
    auditLogs: [
      { id: 'AUD-320', timestamp: '09:12 AM', subject: 'Ghanshyam Sapkal', action: 'modify', decision: 'ALLOW', riskScore: 16 },
    ],
  },
  {
    id: 'APP-04',
    name: 'Threat Hunter Workbench',
    type: 'application',
    department: 'Threat Intelligence',
    classification: 'Confidential',
    confidentiality: 'High',
    owner: 'Himanshu Gond (Senior Threat Hunter)',
    endpoint: 'https://hunting.internal',
    currentSessions: 12,
    accessPolicies: ['Threat Hunter Isolation Rule', 'Sandbox Network Confinement'],
    connectedSystems: ['Threat Intel Store', 'Redis Cache'],
    blockedRequestsCount: 8,
    auditLogs: [
      { id: 'AUD-330', timestamp: '09:20 AM', subject: 'Himanshu Gond', action: 'query', decision: 'ALLOW', riskScore: 54 },
    ],
  },
  {
    id: 'APP-05',
    name: 'Compliance & Audit Ledger',
    type: 'application',
    department: 'Compliance',
    classification: 'Restricted / PII',
    confidentiality: 'High',
    owner: 'Vaibhav Deshmukh (Data Protection Officer)',
    endpoint: 'https://compliance.internal',
    currentSessions: 16,
    accessPolicies: ['DPO Immutable Audit Policy', 'GDPR/DPDP Export Controls'],
    connectedSystems: ['Audit Trail Store', 'Identity Provider'],
    blockedRequestsCount: 1,
    auditLogs: [
      { id: 'AUD-340', timestamp: '08:50 AM', subject: 'Vaibhav Deshmukh', action: 'read', decision: 'ALLOW', riskScore: 26 },
    ],
  },
  {
    id: 'APP-06',
    name: 'Identity & Access Manager',
    type: 'application',
    department: 'Security',
    classification: 'Top Secret / Trade Secret',
    confidentiality: 'Strict',
    owner: 'Saurabh Talape (IAM Security Specialist)',
    endpoint: 'https://iam.internal',
    currentSessions: 65,
    accessPolicies: ['IAM Administrative Controls', 'Session Duration Boundaries'],
    connectedSystems: ['Identity Provider', 'Redis Cache'],
    blockedRequestsCount: 12,
    auditLogs: [
      { id: 'AUD-350', timestamp: '09:40 AM', subject: 'Saurabh Talape', action: 'query', decision: 'ALLOW', riskScore: 15 },
    ],
  },
]

export const INFRASTRUCTURE: ResourceProfile[] = [
  {
    id: 'SRV-01',
    name: 'Kubernetes Cluster (k8s-prod-pune)',
    type: 'server',
    department: 'Infrastructure',
    classification: 'Top Secret / Trade Secret',
    confidentiality: 'Strict',
    owner: 'Ghanshyam Sapkal (Senior DevOps Engineer)',
    endpoint: 'k8s.internal:6443',
    currentSessions: 85,
    accessPolicies: ['Kubernetes Cluster Admin Policy', 'Node Attestation RBAC'],
    connectedSystems: ['API Gateway', 'Database Cluster', 'Storage Cluster'],
    blockedRequestsCount: 9,
    auditLogs: [
      { id: 'AUD-401', timestamp: '09:05 AM', subject: 'Ghanshyam Sapkal', action: 'modify', decision: 'ALLOW', riskScore: 16 },
    ],
  },
  {
    id: 'SRV-02',
    name: 'API Gateway & Reverse Proxy',
    type: 'server',
    department: 'Cloud',
    classification: 'Confidential',
    confidentiality: 'High',
    owner: 'Pratik Akkanawaru (Senior Cloud Architect)',
    endpoint: 'api-gateway.internal:443',
    currentSessions: 140,
    accessPolicies: ['Rate Limiting Policy (100 req/sec)', 'Bearer JWT Introspection'],
    connectedSystems: ['Kubernetes Cluster', 'AI Model Registry'],
    blockedRequestsCount: 42,
    auditLogs: [
      { id: 'AUD-402', timestamp: '09:30 AM', subject: 'Pratik Akkanawaru', action: 'read', decision: 'ALLOW', riskScore: 12 },
    ],
  },
  {
    id: 'SRV-03',
    name: 'Redis Distributed Feature Cache',
    type: 'server',
    department: 'Engineering',
    classification: 'Internal',
    confidentiality: 'Moderate',
    owner: 'Pavan Jadhav (Principal AI Architect)',
    endpoint: 'redis-cache.internal:6379',
    currentSessions: 94,
    accessPolicies: ['In-Memory Cache Encryption at Rest', 'VPC Subnet Isolation'],
    connectedSystems: ['Kubernetes Cluster', 'AI Model Registry'],
    blockedRequestsCount: 0,
    auditLogs: [
      { id: 'AUD-403', timestamp: '09:40 AM', subject: 'Pavan Jadhav', action: 'read', decision: 'ALLOW', riskScore: 18 },
    ],
  },
  {
    id: 'SRV-04',
    name: 'AI Model Registry & Weights Store',
    type: 'server',
    department: 'AI Research',
    classification: 'Top Secret / Trade Secret',
    confidentiality: 'Strict',
    owner: 'Pavan Jadhav (Principal AI Architect)',
    endpoint: 'models.internal:5000',
    currentSessions: 18,
    accessPolicies: ['Read-Only Model Pull Guard', 'SHA256 Model Integrity Verification'],
    connectedSystems: ['Kubernetes Cluster', 'Audit Trail Store'],
    blockedRequestsCount: 3,
    auditLogs: [
      { id: 'AUD-404', timestamp: '10:00 AM', subject: 'Pavan Jadhav', action: 'read', decision: 'ALLOW', riskScore: 18 },
    ],
  },
]

export const SENSITIVE_ASSETS: ResourceProfile[] = [
  {
    id: 'DB-01',
    name: 'Secure Vault & Customer Records (S3 Bucket)',
    type: 'database',
    department: 'SOC',
    classification: 'Restricted / PII',
    confidentiality: 'Strict',
    owner: 'Vikas Rathod (Lead SOC Analyst)',
    endpoint: 's3://secure-vault.firewall.internal',
    currentSessions: 18,
    accessPolicies: ['Mass Exfiltration Interception Rule', 'Removable Media Block Guard'],
    connectedSystems: ['API Gateway', 'SecOps Command Center'],
    blockedRequestsCount: 14,
    auditLogs: [
      { id: 'AUD-501', timestamp: '07:42 AM', subject: 'Ram Rajurkar', action: 'bulk_export', decision: 'BLOCK', riskScore: 86 },
    ],
  },
  {
    id: 'DB-02',
    name: 'Audit Trail Store (PostgreSQL Timescale)',
    type: 'database',
    department: 'Compliance',
    classification: 'Top Secret / Trade Secret',
    confidentiality: 'Strict',
    owner: 'Vaibhav Deshmukh (Data Protection Officer)',
    endpoint: 'postgresql://audit.firewall.internal:5432/audit_trail',
    currentSessions: 32,
    accessPolicies: ['Append-Only Ledger Policy', 'Cryptographic Digest Verification'],
    connectedSystems: ['Kubernetes Cluster', 'API Gateway'],
    blockedRequestsCount: 2,
    auditLogs: [
      { id: 'AUD-502', timestamp: '09:35 AM', subject: 'Vaibhav Deshmukh', action: 'read', decision: 'ALLOW', riskScore: 26 },
    ],
  },
  {
    id: 'DB-03',
    name: 'Feature Store & Behavior Vectors',
    type: 'database',
    department: 'Engineering',
    classification: 'Confidential',
    confidentiality: 'High',
    owner: 'Pavan Jadhav (Principal AI Architect)',
    endpoint: 'postgresql://features.firewall.internal:5432/feature_store',
    currentSessions: 24,
    accessPolicies: ['AI Model Pipeline Read Only', 'Temporal Window Isolation'],
    connectedSystems: ['AI Model Registry', 'Kubernetes Cluster'],
    blockedRequestsCount: 1,
    auditLogs: [
      { id: 'AUD-503', timestamp: '09:55 AM', subject: 'Pavan Jadhav', action: 'read', decision: 'ALLOW', riskScore: 18 },
    ],
  },
  {
    id: 'DB-04',
    name: 'Threat Intel & IOC Vector Database',
    type: 'database',
    department: 'Threat Intelligence',
    classification: 'Confidential',
    confidentiality: 'High',
    owner: 'Himanshu Gond (Senior Threat Hunter)',
    endpoint: 'postgresql://threats.firewall.internal:5432/threat_intel',
    currentSessions: 15,
    accessPolicies: ['Malware Sandbox Airgap', 'Threat Intel Analyst Access'],
    connectedSystems: ['Threat Hunting Workbench'],
    blockedRequestsCount: 6,
    auditLogs: [
      { id: 'AUD-504', timestamp: '09:20 AM', subject: 'Himanshu Gond', action: 'modify', decision: 'ALLOW', riskScore: 54 },
    ],
  },
]

export const TOPOLOGY_NODES: TopologyNode[] = [
  {
    id: 'node-ext',
    label: 'Public Internet / External Ingress',
    category: 'internet',
    tier: 1,
    iconName: 'GlobeAltIcon',
    owner: 'External Clients & Remote Workers',
    riskLevel: 'High',
    firewallPolicies: ['Ingress DDOS Mitigation', 'SSL/TLS 1.3 Termination'],
    connectedSystems: ['node-waf'],
    allowedUsers: ['All Authenticated Sessions'],
    blockedAttempts: 240,
    description: 'Inbound public traffic routed through global CDN and edge points of presence.',
    status: 'INSPECTING',
  },
  {
    id: 'node-waf',
    label: 'Cloud Edge WAF & Reverse Proxy',
    category: 'gateway',
    tier: 2,
    iconName: 'ShieldCheckIcon',
    owner: 'Ghanshyam Sapkal (Senior DevOps Engineer)',
    riskLevel: 'Low',
    firewallPolicies: ['Layer 7 WAF Protection', 'IP Reputation Filtering'],
    connectedSystems: ['node-firewall', 'node-idp'],
    allowedUsers: ['Authorized Employee TLS Sessions'],
    blockedAttempts: 88,
    description: 'Edge security gateway terminating mTLS and filtering malformed requests.',
    status: 'PROTECTED',
  },
  {
    id: 'node-idp',
    label: 'Zero Trust Identity Provider (OIDC/SAML)',
    category: 'identity',
    tier: 3,
    iconName: 'KeyIcon',
    owner: 'Saurabh Talape (IAM Security Specialist)',
    riskLevel: 'Low',
    firewallPolicies: ['FIDO2 Biometric MFA Policy', 'Adaptive Session Timeouts'],
    connectedSystems: ['node-firewall'],
    allowedUsers: ['Vikas Rathod', 'Pavan Jadhav', 'Ghanshyam Sapkal', 'Himanshu Gond', 'Vaibhav Deshmukh', 'Pratik Akkanawaru', 'Saurabh Talape', 'Ram Rajurkar'],
    blockedAttempts: 12,
    description: 'Central identity authentication service asserting employee JWT tokens.',
    status: 'ONLINE',
  },
  {
    id: 'node-firewall',
    label: 'Explainable AI Privacy Firewall Engine',
    category: 'firewall',
    tier: 4,
    iconName: 'CpuChipIcon',
    owner: 'Pavan Jadhav (Principal AI Architect)',
    riskLevel: 'Low',
    firewallPolicies: ['UBA Behavioral Anomaly Detection', 'TreeSHAP Real-Time Explanation', 'Policy Rule Arbitration'],
    connectedSystems: ['node-k8s', 'node-s3', 'node-db-audit'],
    allowedUsers: ['Core Security Interception Services'],
    blockedAttempts: 18,
    description: 'Real-time adaptive AI privacy firewall making microsecond-level ALLOW/WARN/BLOCK decisions.',
    status: 'PROTECTED',
  },
  {
    id: 'node-k8s',
    label: 'Production Kubernetes Workloads',
    category: 'server',
    tier: 5,
    iconName: 'ServerStackIcon',
    owner: 'Ghanshyam Sapkal (Senior DevOps Engineer)',
    riskLevel: 'Medium',
    firewallPolicies: ['Container Network Segmentation', 'Egress Data Loss Prevention'],
    connectedSystems: ['node-s3', 'node-db-audit'],
    allowedUsers: ['Engineering Services', 'SOC Analysts'],
    blockedAttempts: 6,
    description: 'Microservice mesh hosting backend APIs, ML inference daemons, and WebSocket streamers.',
    status: 'ONLINE',
  },
  {
    id: 'node-s3',
    label: 'Protected Corporate S3 Vault',
    category: 'asset',
    tier: 6,
    iconName: 'CircleStackIcon',
    owner: 'Vikas Rathod (Lead SOC Analyst)',
    riskLevel: 'Critical',
    firewallPolicies: ['Mass Exfiltration Block', 'Removable Media Quarantine'],
    connectedSystems: [],
    allowedUsers: ['Vikas Rathod', 'Vaibhav Deshmukh'],
    blockedAttempts: 14,
    description: 'Encrypted S3 bucket housing corporate financial models, sensitive telemetry, and employee PII.',
    status: 'SECURED',
  },
]
