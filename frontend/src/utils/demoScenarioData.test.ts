import { describe, expect, it } from 'vitest'
import {
  DEMO_SCENARIOS,
  exportAllScenariosAsJson,
  exportScenarioAsJson,
  exportScenariosAsCsv,
  getAllScenarios,
  getScenarioById,
  getScenariosByCategory,
} from './demoScenarioData'

describe('demoScenarioData', () => {
  it('contains exactly 8 preset scenarios spanning all core research scenarios', () => {
    const scenarios = getAllScenarios()
    expect(scenarios.length).toBe(8)
    const ids = scenarios.map((s) => s.id)
    expect(ids).toContain('scenario-usb-exfiltration')
    expect(ids).toContain('scenario-after-hours-access')
    expect(ids).toContain('scenario-finance-risk')
    expect(ids).toContain('scenario-healthcare-access')
    expect(ids).toContain('scenario-benign-developer')
    expect(ids).toContain('scenario-failed-logins')
    expect(ids).toContain('scenario-geo-anomaly')
    expect(ids).toContain('scenario-policy-adaptation')
  })

  it('validates each scenario structure and data integrity', () => {
    for (const scenario of DEMO_SCENARIOS) {
      expect(scenario.title).toBeTruthy()
      expect(['threat', 'benign', 'anomaly', 'adaptation']).toContain(scenario.category)
      expect(['Low', 'Medium', 'High', 'Critical']).toContain(scenario.severity)
      expect(scenario.actor.name).toBeTruthy()
      expect(scenario.actor.department).toBeTruthy()
      expect(scenario.request.resource).toBeTruthy()
      expect(scenario.behaviorTelemetry.behavioralRiskIndex).toBeGreaterThanOrEqual(0)
      expect(scenario.behaviorTelemetry.behavioralRiskIndex).toBeLessThanOrEqual(1)
      expect(['ALLOW', 'WARN', 'RESTRICT', 'BLOCK']).toContain(scenario.aiEvaluation.thresholdBand)
      expect(scenario.aiEvaluation.threatProbability).toBeGreaterThanOrEqual(0)
      expect(scenario.aiEvaluation.threatProbability).toBeLessThanOrEqual(1)
      expect(scenario.explainability.topFactors.length).toBeGreaterThan(0)
      expect(['ALLOW', 'WARN', 'RESTRICT', 'BLOCK']).toContain(scenario.policyDecision.action)
      expect(scenario.auditLog.tamperProofHash.startsWith('sha256:')).toBe(true)
    }
  })

  it('correctly retrieves scenario by ID and handles invalid ID', () => {
    const usb = getScenarioById('scenario-usb-exfiltration')
    expect(usb).toBeDefined()
    expect(usb?.title).toContain('USB Mass Exfiltration')

    const invalid = getScenarioById('non-existent-id')
    expect(invalid).toBeUndefined()
  })

  it('correctly filters scenarios by category', () => {
    const threats = getScenariosByCategory('threat')
    expect(threats.length).toBeGreaterThanOrEqual(3)
    for (const t of threats) {
      expect(t.category).toBe('threat')
    }

    const all = getScenariosByCategory('all')
    expect(all.length).toBe(8)
  })

  it('exports valid JSON for individual scenario and full collection', () => {
    const first = DEMO_SCENARIOS[0]
    const singleJson = exportScenarioAsJson(first)
    const parsedSingle = JSON.parse(singleJson)
    expect(parsedSingle.id).toBe(first.id)

    const allJson = exportAllScenariosAsJson()
    const parsedAll = JSON.parse(allJson)
    expect(parsedAll.scenarioCount).toBe(8)
    expect(Array.isArray(parsedAll.scenarios)).toBe(true)
    expect(parsedAll.scenarios.length).toBe(8)
  })

  it('exports valid CSV formatted summary with header and all 8 rows', () => {
    const csv = exportScenariosAsCsv()
    const lines = csv.trim().split('\n')
    expect(lines.length).toBe(9) // 1 header + 8 rows
    expect(lines[0]).toContain('id,title,category,severity')
    expect(lines[1]).toContain('scenario-usb-exfiltration')
  })
})
