import type { FirewallAction } from './api'

export type OrgDepartment =
  | 'Engineering'
  | 'Security'
  | 'HR'
  | 'Finance'
  | 'Legal'
  | 'Marketing'
  | 'DevOps'
  | 'Infrastructure'
  | 'Cloud'
  | 'SOC'
  | 'Threat Intelligence'
  | 'AI Research'
  | 'Compliance'
  | 'Security Operations'
  | 'Data Privacy & Compliance'
  | 'Identity & Access Management'
  | 'Cloud Operations'
  | 'Human Resources'
  | 'Healthcare'

export type OrgEmployeeName =
  | 'Vikas Rathod'
  | 'Pavan Jadhav'
  | 'Ghanshyam Sapkal'
  | 'Himanshu Gond'
  | 'Vaibhav Deshmukh'
  | 'Pratik Akkanawaru'
  | 'Saurabh Talape'
  | 'Ram Rajurkar'
  | string

export interface EmployeeProfile {
  id: string
  name: string
  role: string
  designation: string
  department: OrgDepartment
  email: string
  phone: string
  avatar: string
  device: string
  currentDevice: string
  status: 'Active' | 'Investigating' | 'Under Watch' | 'Suspended'
  location: string
  lastLogin: string
  riskScore: number
  behaviorScore: number
  riskLevel: 'Low' | 'Medium' | 'Elevated' | 'High' | 'Critical'
  mfaEnabled: boolean
  currentSession?: string
  behaviorTimeline: {
    time: string
    event: string
    type: 'auth' | 'access' | 'anomaly' | 'policy'
    severity: 'info' | 'warning' | 'alert'
  }[]
  recentRequests: {
    id: string
    timestamp: string
    resource: string
    action: string
    decision: FirewallAction
    reason: string
  }[]
  firewallDecisions: {
    allowed: number
    warned: number
    restricted: number
    blocked: number
  }
}

export type ResourceClassification =
  | 'Public'
  | 'Internal'
  | 'Confidential'
  | 'Restricted / PII'
  | 'Top Secret / Trade Secret'

export interface ResourceProfile {
  id: string
  name: string
  type: 'database' | 'application' | 'server'
  department: OrgDepartment | 'Enterprise Core'
  classification: ResourceClassification
  confidentiality: 'Low' | 'Moderate' | 'High' | 'Strict'
  owner: string
  endpoint: string
  currentSessions: number
  accessPolicies: string[]
  auditLogs: {
    id: string
    timestamp: string
    subject: string
    action: string
    decision: FirewallAction
    riskScore: number
  }[]
  blockedRequestsCount: number
  connectedSystems: string[]
}

export interface TopologyNode {
  id: string
  label: string
  category: 'internet' | 'gateway' | 'application' | 'firewall' | 'identity' | 'asset' | 'server'
  tier: 1 | 2 | 3 | 4 | 5 | 6
  iconName: string
  owner: string
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  firewallPolicies: string[]
  connectedSystems: string[]
  allowedUsers: string[]
  blockedAttempts: number
  description: string
  status: 'ONLINE' | 'PROTECTED' | 'INSPECTING' | 'SECURED'
}
