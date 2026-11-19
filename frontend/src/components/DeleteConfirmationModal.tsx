import { Button } from './Button'
import { Modal } from './Modal'

export function DeleteConfirmationModal({ open, busy, onCancel, onConfirm }: { open: boolean; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <Modal open={open} title="Delete scan?" onClose={onCancel}><p className="text-sm text-slate-500">This scan will be permanently removed from history.</p><div className="mt-6 flex justify-end gap-3"><Button className="bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={onCancel}>Cancel</Button><Button className="bg-rose-600 hover:bg-rose-500" disabled={busy} onClick={onConfirm}>{busy ? 'Deleting…' : 'Delete'}</Button></div></Modal>
}
