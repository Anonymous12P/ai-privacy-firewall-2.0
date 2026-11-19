import { Card } from '../Card'
import type { MitreTechnique } from '../../types/incident'

interface MitreAttackMatrixProps {
  techniques: MitreTechnique[]
}

const ALL_TACTICS: Array<{
  tactic: MitreTechnique['tactic']
  defaultId: string
  defaultName: string
}> = [
  { tactic: 'Credential Access', defaultId: 'T1078', defaultName: 'Valid Accounts' },
  { tactic: 'Persistence', defaultId: 'T1136', defaultName: 'Create Account' },
  { tactic: 'Privilege Escalation', defaultId: 'T1068', defaultName: 'Exploitation' },
  { tactic: 'Defense Evasion', defaultId: 'T1090', defaultName: 'Proxy / Anonymization' },
  { tactic: 'Discovery', defaultId: 'T1087', defaultName: 'Account Discovery' },
  { tactic: 'Lateral Movement', defaultId: 'T1021', defaultName: 'Remote Services' },
  { tactic: 'Collection', defaultId: 'T1005', defaultName: 'Data from Local System' },
  { tactic: 'Exfiltration', defaultId: 'T1052', defaultName: 'Exfiltration Over USB' },
  { tactic: 'Impact', defaultId: 'T1485', defaultName: 'Data Destruction' },
]

export function MitreAttackMatrix({ techniques }: MitreAttackMatrixProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            MITRE ATT&CK Matrix Mapping
          </h3>
          <p className="text-xs text-slate-500">
            Enterprise adversary behavior categorization mapped to tactical attack progression.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-rose-700">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Detected Technique
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            Not Observed
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
        {ALL_TACTICS.map((tacticObj) => {
          const match = techniques.find((t) => t.tactic === tacticObj.tactic && t.detected)

          return (
            <div
              key={tacticObj.tactic}
              className={`flex flex-col justify-between rounded-xl border p-3 text-xs transition ${
                match
                  ? 'border-rose-300 bg-rose-50/70 shadow-xs ring-1 ring-rose-200'
                  : 'border-slate-200/80 bg-slate-50/40 opacity-75'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {tacticObj.tactic}
                </span>

                <h4
                  className={`mt-1 font-bold ${
                    match ? 'text-rose-950' : 'text-slate-700'
                  }`}
                >
                  {match ? match.techniqueName : tacticObj.defaultName}
                </h4>

                <span
                  className={`mt-1 inline-block font-mono text-[10px] ${
                    match ? 'text-rose-700 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {match ? match.techniqueId : tacticObj.defaultId}
                </span>
              </div>

              {match && (
                <div className="mt-3 border-t border-rose-200/60 pt-2 text-[10px] text-rose-800">
                  <span className="font-semibold block">Confidence: {match.confidence}%</span>
                  <p className="mt-0.5 line-clamp-2 text-rose-700/90">{match.matchedIndicator}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
