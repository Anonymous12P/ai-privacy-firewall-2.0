/**
 * Threat Score & Risk Utilities
 * 
 * Standardized scale:
 *  0 - 20 : Low (Normal)
 * 21 - 40 : Medium (Warning)
 * 41 - 60 : Elevated
 * 61 - 80 : High
 * 81 - 100: Critical
 * 
 * Always formats as `X/100`.
 */

export type ThreatLevel = 'Low' | 'Medium' | 'Elevated' | 'High' | 'Critical'

/**
 * Normalizes any score input into an integer in [0, 100].
 * If the input is in float range [0.0, 1.0] and <= 1.0, converts it to 0-100 scale.
 */
export function normalizeThreatScore(score: number | undefined | null): number {
  if (score === undefined || score === null || isNaN(score)) return 0
  let normalized = score
  if (normalized > 0 && normalized <= 1.0) {
    normalized = normalized * 100
  }
  return Math.min(100, Math.max(0, Math.round(normalized)))
}

/**
 * Displays the threat score in standard `X/100` format.
 */
export function formatThreatScore(score: number | undefined | null): string {
  const norm = normalizeThreatScore(score)
  return `${norm}/100`
}

/**
 * Categorizes a normalized score (0-100) into its Threat Level.
 */
export function getThreatLevel(score: number | undefined | null): ThreatLevel {
  const norm = normalizeThreatScore(score)
  if (norm <= 20) return 'Low'
  if (norm <= 40) return 'Medium'
  if (norm <= 60) return 'Elevated'
  if (norm <= 80) return 'High'
  return 'Critical'
}

/**
 * Returns Tailwind CSS badge classes corresponding to threat score.
 */
export function getThreatBadgeClasses(score: number | undefined | null): {
  badge: string
  dot: string
  text: string
  border: string
  bg: string
} {
  const level = getThreatLevel(score)
  switch (level) {
    case 'Critical':
      return {
        badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold',
        dot: 'bg-rose-500',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/30',
        bg: 'bg-rose-500/10',
      }
    case 'High':
      return {
        badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-semibold',
        dot: 'bg-orange-500',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-500/30',
        bg: 'bg-orange-500/10',
      }
    case 'Elevated':
      return {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold',
        dot: 'bg-amber-500',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
      }
    case 'Medium':
      return {
        badge: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 font-medium',
        dot: 'bg-yellow-500',
        text: 'text-yellow-600 dark:text-yellow-400',
        border: 'border-yellow-500/30',
        bg: 'bg-yellow-500/10',
      }
    case 'Low':
    default:
      return {
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium',
        dot: 'bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
      }
  }
}
