import { Card } from '../components/Card'
export function PlaceholderPage({ title }: { title: string }) { return <><h1 className="text-3xl font-bold text-slate-900">{title}</h1><Card className="mt-6"><p className="text-slate-500">This workspace is ready for the {title.toLowerCase()} experience.</p></Card></> }
