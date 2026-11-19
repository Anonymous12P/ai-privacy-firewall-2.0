import { Button } from './Button'
import { Card } from './Card'
export function AdminError({ onRetry }: { onRetry: () => void }) { return <Card><p className="text-sm text-rose-700">Unable to load administrative data.</p><Button className="mt-4" onClick={onRetry}>Retry</Button></Card> }
