import { Link } from 'react-router-dom'
export function NotFoundPage() { return <main className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="text-6xl font-bold text-indigo-600">404</h1><p className="mt-3 text-slate-500">Page not found.</p><Link className="mt-6 inline-block text-indigo-600" to="/">Return home</Link></div></main> }
