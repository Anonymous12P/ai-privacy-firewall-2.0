import { Button } from './Button'

export function AdminPagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages <= 1) return null
  return <div className="flex items-center justify-between pt-4 text-sm text-slate-500"><span>Page {page} of {pages}</span><div className="flex gap-2"><Button className="bg-slate-100 text-slate-700 hover:bg-slate-200" disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</Button><Button className="bg-slate-100 text-slate-700 hover:bg-slate-200" disabled={page === pages} onClick={() => onChange(page + 1)}>Next</Button></div></div>
}
