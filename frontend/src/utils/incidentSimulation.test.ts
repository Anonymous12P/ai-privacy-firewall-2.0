import { describe, expect, it } from 'vitest'
import {
  INITIAL_INCIDENTS,
  computeIncidentKPIs,
  generateSimulatedIncident,
} from './incidentSimulation'

describe('incidentSimulation & SOC Case Management Engine', () => {
  it('loads initial incident repository with complete forensic details', () => {
    expect(INITIAL_INCIDENTS.length).toBeGreaterThanOrEqual(6)

    const criticalInc = INITIAL_INCIDENTS.find((i) => i.id === 'INC-2026-8801')
    expect(criticalInc).toBeDefined()
    expect(criticalInc?.severity).toBe('Critical')
    expect(criticalInc?.firewallDecision).toBe('BLOCK')
    expect(criticalInc?.timeline.length).toBeGreaterThan(0)
    expect(criticalInc?.evidence.length).toBeGreaterThan(0)
    expect(criticalInc?.attackGraph.length).toBe(7)
    expect(criticalInc?.behaviorTimeline.length).toBe(9)
    expect(criticalInc?.mitreMatrix.length).toBeGreaterThan(0)
    expect(criticalInc?.recommendations.length).toBeGreaterThan(0)
  })

  it('computes accurate executive incident KPIs', () => {
    const kpis = computeIncidentKPIs(INITIAL_INCIDENTS)

    expect(kpis.criticalIncidents).toBeGreaterThanOrEqual(2)
    expect(kpis.highIncidents).toBeGreaterThanOrEqual(1)
    expect(kpis.openCases).toBeGreaterThanOrEqual(2)
    expect(kpis.mttd).toBe('1.2 min')
    expect(kpis.mttr).toBe('4.8 min')
    expect(kpis.containmentSuccessRate).toBeGreaterThan(50)
  })

  it('generates a valid realistic simulated incident with consistent fields', () => {
    const newInc = generateSimulatedIncident(9999)

    expect(newInc.id).toBe('INC-2026-9999')
    expect(['Critical', 'High', 'Medium', 'Low']).toContain(newInc.severity)
    expect(['ALLOW', 'WARN', 'RESTRICT', 'BLOCK']).toContain(newInc.firewallDecision)
    expect(newInc.threatScore).toBeGreaterThanOrEqual(0)
    expect(newInc.riskScore).toBeGreaterThanOrEqual(0)
    expect(newInc.attackGraph).toHaveLength(7)
    expect(newInc.behaviorTimeline).toHaveLength(9)
    expect(newInc.timeline.length).toBeGreaterThan(0)
  })
})
