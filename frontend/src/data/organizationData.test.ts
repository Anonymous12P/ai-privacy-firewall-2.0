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
    expect(ENTERPRISE_OVERVIEW.companyName).toBe('AI Privacy Firewall Research Lab')
    expect(ENTERPRISE_OVERVIEW.employeeCount).toBe(100)
    expect(ENTERPRISE_OVERVIEW.departmentCount).toBe(13)
    expect(ENTERPRISE_OVERVIEW.securityStatus).toBe('Protected')
    expect(ENTERPRISE_OVERVIEW.complianceStandards).toContain('ISO 27001')
  })

  it('contains the core 13 organizational departments', () => {
    const deptNames = DEPARTMENTS.map((d) => d.name)
    expect(DEPARTMENTS).toHaveLength(13)
    expect(deptNames).toContain('Engineering')
    expect(deptNames).toContain('Security')
    expect(deptNames).toContain('SOC')
    expect(deptNames).toContain('Threat Intelligence')
    expect(deptNames).toContain('Compliance')
    expect(deptNames).toContain('DevOps')
    expect(deptNames).toContain('Cloud')
    expect(deptNames).toContain('Infrastructure')
    expect(deptNames).toContain('AI Research')
    expect(deptNames).toContain('HR')
    expect(deptNames).toContain('Finance')
    expect(deptNames).toContain('Legal')
    expect(deptNames).toContain('Marketing')
  })

  it('contains 100 enterprise employees including designated personas with valid distribution', () => {
    const employeeNames = EMPLOYEES.map((e) => e.name)
    expect(employeeNames).toHaveLength(100)
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

    // Validate realistic distribution: ~65 Normal, ~20 Warning, ~10 High, ~5 Critical
    const activeCount = EMPLOYEES.filter((e) => e.status === 'Active').length
    const watchCount = EMPLOYEES.filter((e) => e.status === 'Under Watch').length
    const investigatingCount = EMPLOYEES.filter((e) => e.status === 'Investigating').length
    const suspendedCount = EMPLOYEES.filter((e) => e.status === 'Suspended').length

    expect(activeCount).toBe(65)
    expect(watchCount).toBe(20)
    expect(investigatingCount).toBe(10)
    expect(suspendedCount).toBe(5)

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
      expect(['Low', 'Medium', 'Elevated', 'High', 'Critical']).toContain(emp.riskLevel)
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
