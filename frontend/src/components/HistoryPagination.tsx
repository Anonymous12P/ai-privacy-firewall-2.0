import { Button } from './Button'

export function HistoryPagination({ page, pageSize, total, onPageChange }: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500"><span>Page {page} of {pages}</span><div className="flex gap-2"><Button className="bg-slate-100 text-slate-700 hover:bg-slate-200" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button><Button className="bg-slate-100 text-slate-700 hover:bg-slate-200" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Next</Button></div></div>
}
