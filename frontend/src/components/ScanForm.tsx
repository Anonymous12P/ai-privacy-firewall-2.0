import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from './Button'
import { Input } from './Input'
import type { ScanRequest } from '../types/api'

const scanFormSchema = z.object({
  url: z.string().url('Enter a valid URL.'),
  featuresJson: z.string().min(1, 'Enter at least one numeric feature.').refine((value) => {
    try {
      return isNumericFeatureRecord(JSON.parse(value) as unknown)
    } catch {
      return false
    }
  }, 'Use JSON with numeric values, for example {"feature_a": 1}.'),
})

type ScanFormValues = z.input<typeof scanFormSchema>

export function ScanForm({ onSubmit, disabled }: { onSubmit: (request: ScanRequest) => void; disabled: boolean }) {
  const form = useForm<ScanFormValues>({
    resolver: zodResolver(scanFormSchema),
    defaultValues: { url: '', featuresJson: '{"feature_a": 1}' },
  })
  const submit = (values: ScanFormValues) => {
    onSubmit({ url: values.url, features: JSON.parse(values.featuresJson) as Record<string, number> })
  }
  return <form className="grid gap-5" onSubmit={form.handleSubmit(submit)}>
    <Input label="URL to scan" type="url" placeholder="https://example.com" {...form.register('url')} error={form.formState.errors.url?.message} disabled={disabled} />
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">Feature vector
      <textarea className="min-h-28 rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm outline-none ring-indigo-500 focus:ring-2 disabled:opacity-60" {...form.register('featuresJson')} disabled={disabled} aria-describedby="features-help" />
      <span id="features-help" className="text-xs font-normal text-slate-500">Required by the prediction API. Enter JSON numeric features matching the selected model.</span>
      {form.formState.errors.featuresJson && <span className="text-xs text-rose-600">{form.formState.errors.featuresJson.message}</span>}
    </label>
    <Button type="submit" disabled={disabled}>{disabled ? 'Submitting…' : 'Start scan'}</Button>
  </form>
}

function isNumericFeatureRecord(value: unknown): value is Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const entries = Object.entries(value)
  return entries.length > 0 && entries.every(([, item]) => typeof item === 'number' && Number.isFinite(item))
}
