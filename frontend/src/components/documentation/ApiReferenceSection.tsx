import { useState } from 'react'
import {
  CheckIcon,
  ClipboardDocumentIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline'

interface ApiEndpoint {
  id: string
  method: 'GET' | 'POST'
  path: string
  title: string
  description: string
  requestBody?: string
  responseBody: string
  curlExample: string
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'evaluate',
    method: 'POST',
    path: '/api/firewall/evaluate',
    title: 'Evaluate Access Request',
    description: 'Vectorizes behavioral indicators, invokes champion AI model (or specified architecture), computes P(threat|x), and calibrates deterministic firewall decision.',
    requestBody: `{
  "subject_id": "PSF0133",
  "resource": "Customer Database (Vault)",
  "action": "Bulk Download",
  "features": {
    "indicator.usb": 5.0,
    "indicator.session": 86400.0,
    "indicator.login": 12.0,
    "indicator.file": 50.0,
    "behavioral_risk_index": 1.0,
    "component_score.usb": 1.0,
    "component_score.session": 1.0
  },
  "model_name": "XGBoost"
}`,
    responseBody: `{
  "id": "fe-20261116-092143",
  "decision": "BLOCK",
  "confidence": 0.984,
  "risk_score": 0.984,
  "explanation": "High threat detected with 98.4% confidence using XGBoost.",
  "matched_policy": "Zero-Tolerance Removable Media Isolation",
  "model_used": "XGBoost",
  "timestamp": "2026-11-16T09:21:43.120Z",
  "reasons": [
    "Removable storage activity exceeds threshold",
    "Session length indicates after-hours exfiltration staging"
  ]
}`,
    curlExample: `curl -X POST "http://localhost:8000/api/firewall/evaluate" \\
  -H "Content-Type: application/json" \\
  -d '{"subject_id": "PSF0133", "resource": "Customer DB", "features": {"indicator.usb": 5.0, "behavioral_risk_index": 1.0}}'`,
  },
  {
    id: 'enforce',
    method: 'POST',
    path: '/api/firewall/enforce',
    title: 'Enforce Policy Intercept',
    description: 'Enforces firewall decision synchronously. In ACTIVE mode, decisions of BLOCK raise an immediate HTTP 403 barrier.',
    requestBody: `{
  "subject_id": "PSF0133",
  "resource": "Customer Database (Vault)",
  "action": "Bulk Download",
  "features": {
    "indicator.usb": 5.0,
    "behavioral_risk_index": 1.0
  }
}`,
    responseBody: `{
  "status": "enforced",
  "decision": "BLOCK",
  "blocked": true,
  "enforcement_mode": "ACTIVE",
  "event_id": "EVT-20261116-0214-BLK"
}`,
    curlExample: `curl -X POST "http://localhost:8000/api/firewall/enforce" \\
  -H "Content-Type: application/json" \\
  -d '{"subject_id": "PSF0133", "resource": "Customer DB", "features": {"indicator.usb": 5.0}}'`,
  },
  {
    id: 'policies',
    method: 'GET',
    path: '/api/firewall/policies',
    title: 'List Firewall Policies',
    description: 'Returns all configured deterministic policy tiers, rule conditions, action thresholds, and sensitivity bands.',
    responseBody: `[
  {
    "id": "pol-high-confidence-block",
    "name": "High-Confidence Threat Intercept",
    "action": "BLOCK",
    "min_confidence": 0.85,
    "rules": ["threat_probability >= 0.85"],
    "enabled": true
  },
  {
    "id": "pol-moderate-warn",
    "name": "Moderate Risk Warning",
    "action": "WARN",
    "min_confidence": 0.40,
    "rules": ["0.40 <= threat_probability < 0.70"],
    "enabled": true
  }
]`,
    curlExample: `curl -X GET "http://localhost:8000/api/firewall/policies" -H "Accept: application/json"`,
  },
  {
    id: 'audit',
    method: 'GET',
    path: '/api/firewall/audit',
    title: 'Query Cryptographic Audit Logs',
    description: 'Retrieves immutable audit event records verified with SHA-256 hash chains for forensic inspection and regulatory compliance.',
    responseBody: `[
  {
    "event_id": "EVT-20261116-0214-BLK",
    "timestamp": "2026-11-16T02:14:19.421Z",
    "subject_id": "PSF0133",
    "decision": "BLOCK",
    "model_name": "XGBoost",
    "threat_probability": 0.984,
    "tamper_proof_hash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
  }
]`,
    curlExample: `curl -X GET "http://localhost:8000/api/firewall/audit?limit=10" -H "Accept: application/json"`,
  },
  {
    id: 'status',
    method: 'GET',
    path: '/api/firewall/status',
    title: 'Live Engine Telemetry Status',
    description: 'Reports firewall health, operational mode (ACTIVE vs MONITOR), total evaluations count, block rate, and runtime version.',
    responseBody: `{
  "status": "online",
  "engine_version": "2.4.0-adaptive",
  "mode": "ACTIVE",
  "total_evaluations": 1420,
  "total_blocks": 18,
  "uptime_seconds": 86400,
  "champion_model": "XGBoost"
}`,
    curlExample: `curl -X GET "http://localhost:8000/api/firewall/status" -H "Accept: application/json"`,
  },
  {
    id: 'model-pipeline',
    method: 'GET',
    path: '/api/firewall/model-pipeline',
    title: 'Inspect Serialized Model Pipeline',
    description: 'Returns empirical model comparison benchmarks across all 4 architectures, global TreeSHAP rankings, and calibrated decision bands.',
    responseBody: `{
  "champion_model": "XGBoost",
  "dataset_summary": {
    "total_records": 33466,
    "train_records": 23426,
    "test_records": 5020,
    "feature_dimensions": 33
  },
  "models": [
    {
      "model_name": "XGBoost",
      "roc_auc": 0.9781,
      "pr_auc": 0.9998,
      "f1": 0.9914,
      "status": "Production Champion"
    }
  ],
  "global_feature_importance": [
    {"feature": "behavioral_risk_index", "importance": 0.342},
    {"feature": "component_score.usb", "importance": 0.285}
  ]
}`,
    curlExample: `curl -X GET "http://localhost:8000/api/firewall/model-pipeline" -H "Accept: application/json"`,
  },
]

export function ApiReferenceSection() {
  const [activeEndpointId, setActiveEndpointId] = useState<string>('evaluate')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const activeEndpoint = API_ENDPOINTS.find((e) => e.id === activeEndpointId) ?? API_ENDPOINTS[0]

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              REST API Reference
            </span>
            <span className="text-xs text-slate-500">6 Core Firewall Endpoints</span>
          </div>
          <h2 className="mt-1 text-base font-bold text-slate-900">
            OpenAPI & REST Service Contracts
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive reference for synchronous access evaluation, policy arbitration, immutable auditing, and model inspection.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
          <CodeBracketIcon className="h-4 w-4" />
          <span>FastAPI / Swagger Spec</span>
        </div>
      </div>

      {/* Endpoint Selector Tabs */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {API_ENDPOINTS.map((endpoint) => {
          const isSelected = endpoint.id === activeEndpointId
          return (
            <button
              key={endpoint.id}
              type="button"
              onClick={() => setActiveEndpointId(endpoint.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition border cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span
                className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                  endpoint.method === 'POST'
                    ? isSelected ? 'bg-indigo-700 text-white' : 'bg-emerald-100 text-emerald-800'
                    : isSelected ? 'bg-indigo-700 text-white' : 'bg-sky-100 text-sky-800'
                }`}
              >
                {endpoint.method}
              </span>
              <span>{endpoint.path.replace('/api/firewall', '')}</span>
            </button>
          )
        })}
      </div>

      {/* Active Endpoint Details */}
      <div className="mt-4 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-extrabold ${
                activeEndpoint.method === 'POST' ? 'bg-emerald-600 text-white' : 'bg-sky-600 text-white'
              }`}
            >
              {activeEndpoint.method}
            </span>
            <span className="font-mono text-sm font-bold text-slate-900">{activeEndpoint.path}</span>
          </div>
          <h3 className="mt-2 text-sm font-bold text-slate-800">{activeEndpoint.title}</h3>
          <p className="mt-1 text-xs text-slate-600">{activeEndpoint.description}</p>
        </div>

        {/* Curl Example */}
        <div className="rounded-xl border border-slate-200 bg-slate-900 p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
            <span className="text-slate-400 font-semibold">Example cURL Request</span>
            <button
              type="button"
              onClick={() => handleCopy('curl', activeEndpoint.curlExample)}
              className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              {copiedId === 'curl' ? <CheckIcon className="h-3 w-3 text-emerald-400" /> : <ClipboardDocumentIcon className="h-3 w-3" />}
              <span>{copiedId === 'curl' ? 'Copied' : 'Copy cURL'}</span>
            </button>
          </div>
          <pre className="mt-2.5 overflow-x-auto font-mono text-xs text-sky-300 select-all">
            {activeEndpoint.curlExample}
          </pre>
        </div>

        {/* Request and Response Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeEndpoint.requestBody && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-xs font-bold text-slate-700">JSON Request Body</span>
              <pre className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3 font-mono text-[11px] text-slate-800">
                {activeEndpoint.requestBody}
              </pre>
            </div>
          )}

          <div className={`rounded-xl border border-slate-200 bg-white p-4 ${!activeEndpoint.requestBody ? 'lg:col-span-2' : ''}`}>
            <span className="text-xs font-bold text-slate-700">JSON Response (HTTP 200 OK)</span>
            <pre className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3 font-mono text-[11px] text-emerald-700">
              {activeEndpoint.responseBody}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
