import { describe, expect, it } from 'vitest'
import {
  INITIAL_IOCS,
  MITRE_COVERAGE_DATA,
  RELATIONSHIP_NODES,
  generate24HourThreatTimeline,
  generateThreatIntelligenceSnapshot,
} from './threatSimulation'

describe('threatSimulation & Threat Intelligence Center Engine', () => {
  it('generates a full enterprise Threat Intelligence snapshot with all 13 sections', () => {
    const snapshot = generateThreatIntelligenceSnapshot()

    expect(snapshot.kpis.knownThreats).toBeGreaterThan(1000)
    expect(snapshot.kpis.newThreatsToday).toBeGreaterThan(0)
    expect(snapshot.kpis.activeCampaigns).toBeGreaterThan(0)
    expect(snapshot.kpis.threatIntelSources).toBe(8)
    expect(snapshot.kpis.globalThreatIndex).toBeGreaterThan(50)
    expect(snapshot.kpis.globalThreatIndex).toBeLessThanOrEqual(100)

    expect(snapshot.threatFeed.length).toBeGreaterThanOrEqual(6)
    expect(snapshot.iocs.length).toBeGreaterThanOrEqual(10)
    expect(snapshot.malwareList.length).toBeGreaterThanOrEqual(2)
    expect(snapshot.huntingQueries.length).toBeGreaterThanOrEqual(5)
    expect(snapshot.campaigns.length).toBeGreaterThanOrEqual(3)
    expect(snapshot.relationshipNodes.length).toBe(8)
    expect(snapshot.attackMap.length).toBeGreaterThanOrEqual(8)
    expect(snapshot.mitreCoverage.length).toBe(12)
    expect(snapshot.timeline.length).toBe(12)
    expect(snapshot.prediction.likelyAttackType).toBeDefined()
    expect(snapshot.summary.topThreatActor).toContain('APT29')
    expect(snapshot.sources.length).toBe(8)
  })

  it('provides comprehensive IOC coverage across required indicator types', () => {
    const types = INITIAL_IOCS.map((i) => i.type)
    expect(types).toContain('IP Address')
    expect(types).toContain('Domain')
    expect(types).toContain('URL')
    expect(types).toContain('Email')
    expect(types).toContain('SHA256')
    expect(types).toContain('MD5')
    expect(types).toContain('File Name')
    expect(types).toContain('Registry Key')
    expect(types).toContain('Process Name')
    expect(types).toContain('Certificate')
  })

  it('maintains relationship graph traversal integrity', () => {
    expect(RELATIONSHIP_NODES).toHaveLength(8)
    const actorNode = RELATIONSHIP_NODES.find((n) => n.type === 'actor')
    const firewallNode = RELATIONSHIP_NODES.find((n) => n.type === 'firewall')
    const dbNode = RELATIONSHIP_NODES.find((n) => n.type === 'database')

    expect(actorNode).toBeDefined()
    expect(firewallNode).toBeDefined()
    expect(dbNode).toBeDefined()
    expect(firewallNode?.status).toBe('blocked')
    expect(dbNode?.status).toBe('protected')
  })

  it('contains full MITRE ATT&CK 12-tactic enterprise coverage', () => {
    expect(MITRE_COVERAGE_DATA).toHaveLength(12)
    const tactics = MITRE_COVERAGE_DATA.map((m) => m.tactic)
    expect(tactics).toContain('Initial Access')
    expect(tactics).toContain('Execution')
    expect(tactics).toContain('Persistence')
    expect(tactics).toContain('Privilege Escalation')
    expect(tactics).toContain('Defense Evasion')
    expect(tactics).toContain('Credential Access')
    expect(tactics).toContain('Discovery')
    expect(tactics).toContain('Lateral Movement')
    expect(tactics).toContain('Collection')
    expect(tactics).toContain('Exfiltration')
    expect(tactics).toContain('Command & Control')
    expect(tactics).toContain('Impact')
  })

  it('generates 24-hour threat timeline with consistent progression', () => {
    const timeline = generate24HourThreatTimeline()
    expect(timeline.length).toBe(12)
    timeline.forEach((pt) => {
      expect(pt.newThreats).toBeGreaterThan(0)
      expect(pt.blockedThreats).toBeLessThanOrEqual(pt.newThreats + 5)
    })
  })
})
