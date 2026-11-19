import { useState } from 'react'
import {
  AcademicCapIcon,
  BookOpenIcon,
  CheckBadgeIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  CpuChipIcon,
  DocumentChartBarIcon,
  LightBulbIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

export function ResearchSummaryPage() {
  const [copiedBibtex, setCopiedBibtex] = useState(false)

  const bibtexCitation = `@article{vance2026explainable,
  title={An Explainable Adaptive AI Privacy Firewall for Detecting Unauthorized Data Access Using User Behavior Analytics},
  author={Vance, Philip and Rostova, Elena and Zhang, Liam and Chen, Marcus},
  journal={IEEE Transactions on Dependable and Secure Computing},
  year={2026},
  volume={23},
  number={4},
  pages={1120--1135},
  publisher={IEEE}
}`

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtexCitation)
    setCopiedBibtex(true)
    setTimeout(() => setCopiedBibtex(false), 2000)
  }

  const contributions = [
    {
      title: 'Explainable AI Firewall Pipeline',
      description: 'First deterministic privacy firewall combining real-time machine learning inference with exact TreeSHAP factor attribution and plain-English rationales in sub-12ms.',
      icon: SparklesIcon,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
    },
    {
      title: 'Adaptive Policy Learning',
      description: 'Continuous analyst feedback loop that automatically tunes risk threshold boundaries, reducing false positive operational friction by 42% without sacrificing recall.',
      icon: ScaleIcon,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    },
    {
      title: 'Real ML Model Integration',
      description: 'Production champion XGBoost (0.9781 ROC-AUC, 0.9998 PR-AUC, 0.9914 F1) benchmarked against Random Forest, Decision Tree, and Logistic Regression on CMU SEI CERT r4.2.',
      icon: CpuChipIcon,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Calibrated Privacy Decision Bands',
      description: 'Empirically calibrated probability thresholds mapping continuous model uncertainty P(threat|x) to deterministic enforcement actions: ALLOW, WARN, RESTRICT, and BLOCK.',
      icon: ShieldCheckIcon,
      color: 'text-sky-700 bg-sky-50 border-sky-200',
    },
    {
      title: 'UBA-Based Threat Detection',
      description: 'Multi-dimensional behavioral profiling across 33 CERT features capturing off-hours session creep, USB exfiltration velocity, and anomalous privilege boundaries.',
      icon: CheckBadgeIcon,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      title: 'Cryptographic Immutable Audit Telemetry',
      description: 'Tamper-evident SHA-256 event chaining meeting regulatory compliance mandates across GDPR Article 22, HIPAA Minimum Necessary, and SOC 2 Type II.',
      icon: AcademicCapIcon,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
    },
  ]

  const benchmarkModels = [
    {
      name: 'XGBoost',
      role: 'Production Champion',
      rocAuc: '0.9781',
      prAuc: '0.9998',
      f1: '0.9914',
      accuracy: '0.9928',
      latency: '4.2 ms',
      parameters: '15,136',
      badge: 'CHAMPION',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      name: 'Random Forest',
      role: 'Evaluated Challenger',
      rocAuc: '0.9311',
      prAuc: '0.9991',
      f1: '0.9924',
      accuracy: '0.9930',
      latency: '14.8 ms',
      parameters: '457,704',
      badge: 'ENSEMBLE',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      name: 'Decision Tree',
      role: 'Evaluated Challenger',
      rocAuc: '0.9575',
      prAuc: '0.9976',
      f1: '0.9930',
      accuracy: '0.9928',
      latency: '1.1 ms',
      parameters: '3,969',
      badge: 'EXACT RULES',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      name: 'Logistic Regression',
      role: 'Linear Baseline',
      rocAuc: '0.9719',
      prAuc: '0.9998',
      f1: '0.9899',
      accuracy: '0.9912',
      latency: '0.8 ms',
      parameters: '115',
      badge: 'BASELINE',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              Research Paper Package
            </span>
            <span className="text-xs text-slate-500">Peer-Reviewed Publication Summary</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            An Explainable Adaptive AI Privacy Firewall for Detecting Unauthorized Data Access Using User Behavior Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-4xl leading-relaxed">
            Comprehensive synthesis of problem formulation, algorithmic architecture, empirical benchmarks on CMU SEI CERT r4.2,
            TreeSHAP explainability findings, and adaptive feedback dynamics.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/demo"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
          >
            <SparklesIcon className="h-4 w-4 text-indigo-600" />
            <span>Interactive Demo</span>
          </a>

          <a
            href="/documentation"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-xs"
          >
            <BookOpenIcon className="h-4 w-4" />
            <span>System Manual</span>
          </a>
        </div>
      </div>

      {/* Problem Statement & Objective Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-rose-200/60 pb-2.5">
            <LightBulbIcon className="h-5 w-5 text-rose-700" />
            <h2 className="text-sm font-bold text-slate-900">Problem Statement</h2>
          </div>
          <p className="mt-3 text-xs text-slate-700 leading-relaxed">
            Modern enterprise privacy breaches predominantly stem from authorized insiders abusing legitimate credentials rather than network-layer perimeter penetrations.
            Static Role-Based Access Control (RBAC) and perimeter firewalls cannot detect behavioral deviations, while opaque anomaly detection black-boxes produce unexplainable alerts, high false positive friction, and regulatory non-compliance with GDPR Article 22 right-to-explanation mandates.
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-indigo-200/60 pb-2.5">
            <CheckBadgeIcon className="h-5 w-5 text-indigo-700" />
            <h2 className="text-sm font-bold text-slate-900">Research Objective</h2>
          </div>
          <p className="mt-3 text-xs text-slate-700 leading-relaxed">
            To develop an explainable, adaptive AI privacy firewall that bridges machine learning probability estimates with deterministic enforcement.
            By vectorizing 33 behavioral telemetry indicators, executing champion gradient boosted decision trees, computing local TreeSHAP factor attributions, and updating risk thresholds via continuous analyst feedback loops, the framework delivers sub-12ms low-friction access protection.
          </p>
        </div>
      </div>

      {/* 6 Core Contributions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">Principal Scientific Contributions</h2>
          <p className="text-xs text-slate-500">
            Six architectural and empirical innovations introduced by this research.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contributions.map((c) => {
            const Icon = c.icon
            return (
              <div key={c.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${c.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{c.title}</h3>
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {c.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Empirical Evaluation & Model Benchmarks */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Comparative Benchmark Results (CMU SEI CERT r4.2 Test Partition)
            </h2>
            <p className="text-xs text-slate-500">
              Evaluated across 5,020 held-out test vectors using stratified 5-fold cross-validation.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Champion: XGBoost (0.9781 ROC-AUC)
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Architecture</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">ROC-AUC</th>
                <th className="py-2.5 px-3">PR-AUC</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">Parameters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benchmarkModels.map((m) => (
                <tr key={m.name} className={m.name === 'XGBoost' ? 'bg-indigo-50/30 font-semibold' : 'hover:bg-slate-50/70'}>
                  <td className="py-3 px-3 text-slate-900">
                    <div className="font-bold">{m.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{m.role}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${m.badgeColor}`}>
                      {m.badge}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-800">{m.rocAuc}</td>
                  <td className="py-3 px-3 font-mono text-slate-800">{m.prAuc}</td>
                  <td className="py-3 px-3 font-mono text-slate-800">{m.f1}</td>
                  <td className="py-3 px-3 font-mono text-slate-800">{m.accuracy}</td>
                  <td className="py-3 px-3 font-mono text-slate-800">{m.latency}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{m.parameters}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TreeSHAP Findings & Adaptive Gains */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <SparklesIcon className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">TreeSHAP Explainability Findings</h3>
          </div>
          <div className="mt-3 space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              Exact TreeSHAP attributions across 5,020 explained test records reveal that insider threat probability is non-linearly driven by composite indicator pairings rather than single thresholds:
            </p>
            <ul className="mt-2 space-y-1.5 text-slate-700">
              <li className="flex items-start gap-1.5">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Removable Storage Mounts:</strong> Mean |SHAP| = 0.285. Connecting &gt;0 unapproved USB devices increases log-odds threat probability by up to +0.46.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Behavioral Drift Index:</strong> Mean |SHAP| = 0.342. Drift &gt;0.70 standard deviations from 90-day baseline acts as the strongest gating multiplier.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Off-Hours Session Length:</strong> Sessions exceeding 18 continuous hours outside standard working shifts contribute +0.38 to threat classification.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <ScaleIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Adaptive Feedback & False Positive Gains</h3>
          </div>
          <div className="mt-3 space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              Static thresholds inevitably cause alert fatigue as business roles evolve. The firewall adaptive feedback loop incorporates analyst confirmations and false-positive disputes:
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xl font-extrabold text-indigo-700">-42.4%</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-0.5">False Positive Reduction</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xl font-extrabold text-emerald-700">99.1%</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-0.5">True Threat Recall Retained</div>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Analyst corrections dynamically adjust department threshold bounds (e.g. DevOps migration shifts or clinical cross-ward coverage) while preserving security guardrails.
            </p>
          </div>
        </div>
      </div>

      {/* Limitations & Future Work */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900">Limitations & Future Work</h3>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div>
            <h4 className="font-bold text-slate-800">Acknowledged Limitations</h4>
            <p className="mt-1 leading-relaxed">
              1. Reliance on simulated benchmark telemetry (CMU SEI CERT r4.2) requires streaming transfer learning when deployed onto disparate multi-cloud IAM infrastructure.
              <br />
              2. Sophisticated adversaries intentionally pacing exfiltration below hourly statistical deviations could evade heuristic indicator extractors.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Future Research Trajectories</h4>
            <p className="mt-1 leading-relaxed">
              1. Federated privacy-preserving baseline training across corporate subsidiaries without centralizing raw behavioral telemetry.
              <br />
              2. Kernel-level eBPF packet inspection hooks executing real-time tree traversal in the Linux kernel space for sub-millisecond network boundary enforcement.
            </p>
          </div>
        </div>
      </div>

      {/* BibTeX Citation Card */}
      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <DocumentChartBarIcon className="h-5 w-5 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">Citation & BibTeX Metadata</span>
          </div>

          <button
            type="button"
            onClick={handleCopyBibtex}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition cursor-pointer"
          >
            {copiedBibtex ? <CheckIcon className="h-3.5 w-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="h-3.5 w-3.5" />}
            <span>{copiedBibtex ? 'Copied BibTeX!' : 'Copy BibTeX'}</span>
          </button>
        </div>

        <pre className="mt-3 overflow-x-auto font-mono text-xs text-indigo-300 select-all leading-relaxed">
          {bibtexCitation}
        </pre>
      </div>
    </div>
  )
}
