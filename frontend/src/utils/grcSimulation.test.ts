import { describe, expect, it } from 'vitest'
import {
  computeGRCKPIs,
  computeRiskHeatmap,
  generateAudits,
  generateBusinessImpacts,
  generateComplianceGaps,
  generateControls,
  generateFrameworks,
  generateGRCSnapshot,
  generatePolicies,
  generateRemediations,
  generateRisks,
  generateTimeline,
  generateTreatmentPlans,
  generateVendors,
} from './grcSimulation'

describe('GRC Simulation Engine', () => {
  it('generates a complete and consistent GRC snapshot', () => {
    const snapshot = generateGRCSnapshot()

    expect(snapshot).toBeDefined()
    expect(snapshot.kpis.enterpriseRiskScore).toBeGreaterThanOrEqual(0)
    expect(snapshot.kpis.enterpriseRiskScore).toBeLessThanOrEqual(100)
    expect(snapshot.kpis.complianceScore).toBeGreaterThanOrEqual(50)
    expect(snapshot.kpis.complianceScore).toBeLessThanOrEqual(100)
    expect(snapshot.risks.length).toBeGreaterThanOrEqual(10)
    expect(snapshot.frameworks.length).toBe(6)
    expect(snapshot.audits.length).toBeGreaterThanOrEqual(3)
    expect(snapshot.vendors.length).toBeGreaterThanOrEqual(5)
    expect(snapshot.summary.recommendations.length).toBeGreaterThan(0)
  })

  it('computes a complete 5x5 heatmap with exactly 25 cells', () => {
    const risks = generateRisks()
    const heatmap = computeRiskHeatmap(risks)

    expect(heatmap.length).toBe(25)

    // Verify cell coordinate coverage (Likelihood 1..5 x Impact 1..5)
    for (let impact = 1; impact <= 5; impact++) {
      for (let likelihood = 1; likelihood <= 5; likelihood++) {
        const cell = heatmap.find(
          (c) => c.impact === impact && c.likelihood === likelihood,
        )
        expect(cell).toBeDefined()
        expect(cell?.count).toBeGreaterThanOrEqual(0)
        expect(cell?.severity).toBeDefined()
      }
    }

    // Total count of risks in heatmap should equal risks array length
    const totalCountInHeatmap = heatmap.reduce((acc, c) => acc + c.count, 0)
    expect(totalCountInHeatmap).toBe(risks.length)
  })

  it('calculates executive KPIs mathematically consistent with underlying entities', () => {
    const risks = generateRisks()
    const frameworks = generateFrameworks()
    const audits = generateAudits()
    const controls = generateControls()
    const remediations = generateRemediations()

    const kpis = computeGRCKPIs(risks, frameworks, audits, controls, remediations)

    const expectedOpenRisks = risks.filter(
      (r) => r.status === 'Open' || r.status === 'In Review',
    ).length
    const expectedCriticalRisks = risks.filter((r) => r.severity === 'Critical').length

    expect(kpis.openRisks).toBe(expectedOpenRisks)
    expect(kpis.criticalRisks).toBe(expectedCriticalRisks)
    expect(kpis.complianceFrameworks).toBe(frameworks.length)
    expect(kpis.controlsImplemented).toBe(
      controls.filter((c) => c.status === 'Implemented').length,
    )
    expect(kpis.totalControls).toBe(controls.length)
  })

  it('generates 24 distinct monthly events for the compliance timeline', () => {
    const timeline = generateTimeline()

    expect(timeline.length).toBe(24)
    expect(timeline[0]?.year).toBe(2025)
    expect(timeline[timeline.length - 1]?.year).toBe(2027)

    const types = new Set(timeline.map((t) => t.type))
    expect(types.has('Audit')).toBe(true)
    expect(types.has('Policy')).toBe(true)
    expect(types.has('Control')).toBe(true)
    expect(types.has('Milestone')).toBe(true)
  })

  it('verifies all sub-entities have valid attributes and relations', () => {
    const gaps = generateComplianceGaps()
    const businessImpacts = generateBusinessImpacts()
    const treatmentPlans = generateTreatmentPlans()
    const vendors = generateVendors()
    const policies = generatePolicies()

    expect(gaps.length).toBeGreaterThan(0)
    expect(businessImpacts.length).toBeGreaterThan(0)
    expect(treatmentPlans.length).toBeGreaterThan(0)
    expect(vendors.length).toBeGreaterThan(0)
    expect(policies.length).toBeGreaterThan(0)

    // Verify vendors have valid ratings and data classifications
    for (const v of vendors) {
      expect(['Critical', 'High', 'Medium', 'Low']).toContain(v.riskRating)
      expect(['Confidential', 'Restricted', 'Internal', 'Public']).toContain(
        v.dataClassification,
      )
      expect(v.securityScore).toBeGreaterThanOrEqual(0)
      expect(v.securityScore).toBeLessThanOrEqual(100)
    }

    // Verify business impact items have valid RTO/RPO
    for (const b of businessImpacts) {
      expect(b.rto).toBeDefined()
      expect(b.rpo).toBeDefined()
      expect(b.financialImpact).toBeDefined()
    }
  })
})
