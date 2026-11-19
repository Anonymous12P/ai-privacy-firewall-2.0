export function Alert({ children, tone = 'error' }: { children: string; tone?: 'error' | 'info' }) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-xs font-medium border shadow-2xs ${
        tone === 'error'
          ? 'bg-rose-50 border-rose-200/90 text-rose-800'
          : 'bg-blue-50 border-blue-200/90 text-blue-800'
      }`}
      role="alert"
    >
      {children}
    </div>
  )
}
