import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Alert } from '../components/Alert'
import { Card } from '../components/Card'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { ScanForm } from '../components/ScanForm'
import { ScanResultCard } from '../components/ScanResultCard'
import { useCreateScan, useScanStatus } from '../hooks/useScan'
import type { ScanRequest } from '../types/api'

export function ScanPage() {
  const [scanId, setScanId] = useState<string | null>(null)
  const createScan = useCreateScan()
  const scanStatus = useScanStatus(scanId)
  useEffect(() => {
    if (scanStatus.data?.status === 'COMPLETED') toast.success('Scan completed.')
    if (scanStatus.data?.status === 'FAILED') toast.error(scanStatus.data.error ?? 'Scan failed.')
  }, [scanStatus.data?.status, scanStatus.data?.error])

  const submit = (request: ScanRequest) => {
    setScanId(null)
    createScan.mutate(request, {
      onSuccess: (response) => { setScanId(response.scan_id); toast.info('Scan queued for processing.') },
      onError: () => toast.error('Unable to submit the scan.'),
    })
  }
  const scan = scanStatus.data ?? createScan.data
  const isProcessing = Boolean(scan && (scan.status === 'PENDING' || scan.status === 'RUNNING'))
  return <div className="mx-auto max-w-4xl"><div><h1 className="text-3xl font-bold text-slate-900">New scan</h1><p className="mt-2 text-slate-500">Analyze a URL using the configured privacy model.</p></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card><h2 className="text-lg font-semibold text-slate-900">Scan details</h2><p className="mt-1 text-sm text-slate-500">The backend processes scans asynchronously and returns a status for polling.</p><div className="mt-6"><ScanForm onSubmit={submit} disabled={createScan.isPending || isProcessing} /></div>{createScan.isError && <div className="mt-4"><Alert>Unable to submit the scan. Please check the API and try again.</Alert></div>}</Card>
      <div className="grid content-start gap-4">{isProcessing && <LoadingOverlay label={scan?.status === 'RUNNING' ? 'Prediction in progress…' : 'Scan queued…'} />}{scan && <ScanResultCard scan={scan} />}{scanStatus.isError && <Alert>Unable to retrieve the latest scan status.</Alert>}</div>
    </div>
  </div>
}
