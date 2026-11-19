import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Alert } from '../components/Alert'
import { Card } from '../components/Card'
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal'
import { HistoryDetailsDrawer } from '../components/HistoryDetailsDrawer'
import { HistoryEmptyState } from '../components/HistoryEmptyState'
import { HistoryFilters, type HistoryFilterValues } from '../components/HistoryFilters'
import { HistoryPagination } from '../components/HistoryPagination'
import { HistoryTable } from '../components/HistoryTable'
import { LoadingState } from '../components/LoadingState'
import { useDeleteHistory, useHistory, useHistoryItem } from '../hooks/useHistory'
import type { RiskLevel } from '../types/api'

const pageSize = 20
const initialFilters: HistoryFilterValues = { status: 'all', risk: 'all', model: '', search: '' }

export function HistoryPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(initialFilters)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const query = useHistory({ page, pageSize, sortOrder: 'desc', riskLevel: filters.risk === 'all' ? undefined : filters.risk as RiskLevel })
  const selected = useHistoryItem(selectedId)
  const deletion = useDeleteHistory()
  const scans = useMemo(() => (query.data?.items ?? []).filter((scan) => {
    const matchesStatus = filters.status === 'all' || scan.status === filters.status
    const matchesRisk = filters.risk === 'all' || scan.risk_level === filters.risk
    const matchesModel = !filters.model || scan.model_name?.toLowerCase().includes(filters.model.toLowerCase())
    const matchesSearch = !filters.search || scan.url?.toLowerCase().includes(filters.search.toLowerCase())
    return matchesStatus && matchesRisk && matchesModel && matchesSearch
  }), [filters, query.data?.items])
  const deletedScanId = deletion.variables

  function confirmDelete() {
    if (!deleteId) return
    deletion.mutate(deleteId, {
      onSuccess: () => { setDeleteId(null); toast.success('Scan deleted successfully.') },
      onError: () => toast.error('Unable to delete this scan.'),
    })
  }

  return <div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold text-slate-900">Scan history</h1><p className="mt-2 text-slate-500">Review, inspect, and manage your previous scans.</p></div><span className="text-sm text-slate-500">{query.data?.total ?? 0} total scans</span></div>
    <Card className="mt-8"><HistoryFilters values={filters} onChange={(values) => { setPage(1); setFilters(values) }} /></Card>
    <div className="mt-6">{query.isLoading ? <LoadingState /> : query.isError ? <Alert>Unable to load scan history. Please try again.</Alert> : scans.length === 0 ? <Card><HistoryEmptyState /></Card> : <><HistoryTable scans={scans} onView={(scan) => setSelectedId(scan.scan_id)} onDelete={(scan) => setDeleteId(scan.scan_id)} /><div className="mt-6"><HistoryPagination page={query.data?.page ?? page} pageSize={pageSize} total={query.data?.total ?? 0} onPageChange={setPage} /></div></>}</div>
    <HistoryDetailsDrawer scan={selected.data ?? null} onClose={() => setSelectedId(null)} />
    <DeleteConfirmationModal open={Boolean(deleteId)} busy={deletion.isPending && deletedScanId === deleteId} onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
  </div>
}
