import { describe, expect, it } from 'vitest'
import {
  APPLICATIONS,
  DEPARTMENTS,
  EMPLOYEES,
  ENTERPRISE_OVERVIEW,
  INFRASTRUCTURE,
  SENSITIVE_ASSETS,
  TOPOLOGY_NODES,
} from './organizationData'

describe('Digital Twin Organization Data Integrity', () => {
  it('validates enterprise overview metadata', () => {
    expect(ENTERPRISE_OVERVIEW.companyName).toBe('Privacy Shield Technologies Pvt. Ltd.')
    expect(ENTERPRISE_OVERVIEW.employeeCount).toBe(8)
    expect(ENTERPRISE_OVERVIEW.departmentCount).toBe(6)
    expect(ENTERPRISE_OVERVIEW.securityStatus).toBe('Protected')
    expect(ENTERPRISE_OVERVIEW.complianceStandards).toContain('ISO 27001')
  })

  it('contains the core organizational departments', () => {
    const deptNames = DEPARTMENTS.map((d) => d.name)
    expect(deptNames).toContain('Security Operations')
    expect(deptNames).toContain('Engineering')
    expect(deptNames).toContain('Infrastructure')
    expect(deptNames).toContain('Threat Intelligence')
    expect(deptNames).toContain('Data Privacy & Compliance')
    expect(deptNames).toContain('Identity & Access Management')
  })

  it('contains strictly the 8 designated enterprise employee personas with full profiles', () => {
    const employeeNames = EMPLOYEES.map((e) => e.name)
    expect(employeeNames).toHaveLength(8)
    expect(employeeNames).toEqual(
      expect.arrayContaining([
        'Vikas Rathod',
        'Pavan Jadhav',
        'Ghanshyam Sapkal',
        'Himanshu Gond',
        'Vaibhav Deshmukh',
        'Pratik Akkanawaru',
        'Saurabh Talape',
        'Ram Rajurkar',
      ]),
    )

    EMPLOYEES.forEach((emp) => {
      expect(emp.id).toBeDefined()
      expect(typeof emp.role).toBe('string')
      expect(typeof emp.department).toBe('string')
      expect(typeof emp.designation).toBe('string')
      expect(typeof emp.email).toBe('string')
      expect(typeof emp.phone).toBe('string')
      expect(typeof emp.device).toBe('string')
      expect(typeof emp.currentDevice).toBe('string')
      expect(typeof emp.status).toBe('string')
      expect(typeof emp.location).toBe('string')
      expect(typeof emp.lastLogin).toBe('string')
      expect(emp.riskScore).toBeGreaterThanOrEqual(0)
      expect(emp.riskScore).toBeLessThanOrEqual(100)
      expect(emp.behaviorScore).toBeGreaterThanOrEqual(0)
      expect(emp.behaviorScore).toBeLessThanOrEqual(100)
      expect(['Low', 'Medium', 'High', 'Critical']).toContain(emp.riskLevel)
      expect(emp.behaviorTimeline.length).toBeGreaterThan(0)
      expect(emp.recentRequests.length).toBeGreaterThan(0)
      expect(emp.firewallDecisions.allowed).toBeGreaterThanOrEqual(0)
    })
  })

  it('contains enterprise applications and infrastructure', () => {
    expect(APPLICATIONS.length).toBeGreaterThanOrEqual(4)
    expect(INFRASTRUCTURE.length).toBeGreaterThanOrEqual(4)
    expect(SENSITIVE_ASSETS.length).toBeGreaterThanOrEqual(4)
    expect(TOPOLOGY_NODES.length).toBeGreaterThanOrEqual(5)
  })
})
