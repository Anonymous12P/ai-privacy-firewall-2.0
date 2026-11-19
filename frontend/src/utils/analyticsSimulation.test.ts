import { describe, expect, it } from 'vitest'
import {
  computeConfusionMatrix,
  generate24HourTimeline,
  generateAnalyticsSnapshot,
} from './analyticsSimulation'

describe('analyticsSimulation & Intelligence Center Logic', () => {
  it('generates a complete, structurally sound snapshot with all 12 sections', () => {
    const snapshot = generateAnalyticsSnapshot()

    expect(snapshot.kpis.todayRequests).toBeGreaterThan(0)
    expect(snapshot.kpis.threatsDetected).toBeGreaterThan(0)
    expect(snapshot.kpis.blockedRequests).toBeGreaterThanOrEqual(0)
    expect(snapshot.kpis.modelAccuracy).toBeGreaterThan(90)
    expect(snapshot.kpis.falsePositiveRate).toBeLessThan(5)

    expect(snapshot.modelPerformance).toHaveLength(4)
    expect(snapshot.confusionMatrix.total).toBeGreaterThan(0)
    expect(snapshot.globalShap.length).toBeGreaterThanOrEqual(8)
    expect(snapshot.localEvents.length).toBeGreaterThan(0)
    expect(snapshot.radarImportance.length).toBe(9)
    expect(snapshot.threatDistribution).toHaveLength(4)
    expect(snapshot.departmentRisk).toHaveLength(6)
    expect(snapshot.timeline).toHaveLength(24)
    expect(snapshot.policyEffectiveness.length).toBeGreaterThan(0)
    expect(snapshot.modelDrift.status).toBeDefined()
    expect(snapshot.executiveSummary).toContain('Today the firewall processed')
    expect(snapshot.researchInfo.currentModel).toBeDefined()
  })

  it('maintains mathematical and semantic consistency across KPI metrics and charts', () => {
    const snapshot = generateAnalyticsSnapshot()

    // Threat distribution count matches threats detected
    const totalThreatDist = snapshot.threatDistribution.reduce((acc, curr) => acc + curr.count, 0)
    expect(totalThreatDist).toBe(snapshot.kpis.threatsDetected)

    // Highest risk department matches executive summary
    const topDept = snapshot.departmentRisk[0]!.department
    expect(snapshot.executiveSummary).toContain(`${topDept} department exhibited the highest average risk`)

    // Timeline requests sum equals todayRequests
    const timelineReqSum = snapshot.timeline.reduce((acc, p) => acc + p.requests, 0)
    expect(timelineReqSum).toBe(snapshot.kpis.todayRequests)
  })

  it('computes confusion matrix with verified mathematical formulas', () => {
    const matrix = computeConfusionMatrix(142, 1942)

    expect(matrix.total).toBe(matrix.tp + matrix.tn + matrix.fp + matrix.fn)
    expect(matrix.accuracy).toBeGreaterThan(98)
    expect(matrix.precision).toBeGreaterThan(94)
    expect(matrix.recall).toBeGreaterThan(98)
    expect(matrix.f1Score).toBeGreaterThan(95)
  })

  it('generates 24-hour timeline with diurnal distribution and boundary adjustments', () => {
    const timeline = generate24HourTimeline(2000, 150, 40)

    expect(timeline).toHaveLength(24)
    expect(timeline[0]!.time).toBe('00:00')
    expect(timeline[23]!.time).toBe('23:00')

    const sumReq = timeline.reduce((acc, p) => acc + p.requests, 0)
    const sumThreats = timeline.reduce((acc, p) => acc + p.threats, 0)
    const sumBlocks = timeline.reduce((acc, p) => acc + p.blocks, 0)

    expect(sumReq).toBe(2000)
    expect(sumThreats).toBe(150)
    expect(sumBlocks).toBe(40)
  })

  it('scales KPIs and distributions when filters are applied', () => {
    const unfiltered = generateAnalyticsSnapshot()
    const filtered = generateAnalyticsSnapshot({
      department: 'Finance',
      model: 'All',
      risk: 'All',
      decision: 'All',
      timeRange: '24h',
    })

    expect(filtered.kpis.todayRequests).toBeLessThan(unfiltered.kpis.todayRequests)
    expect(filtered.kpis.threatsDetected).toBeLessThanOrEqual(unfiltered.kpis.threatsDetected)
  })
})
