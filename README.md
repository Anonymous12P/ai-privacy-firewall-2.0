# AI Privacy Firewall

<div align="center">

```
  █████╗ ██╗    ██████╗ ██████╗ ██╗██╗   ██╗ █████╗  ██████╗██╗   ██╗
 ██╔══██╗██║    ██╔══██╗██╔══██╗██║██║   ██║██╔══██╗██╔════╝╚██╗ ██╔╝
 ███████║██║    ██████╔╝██████╔╝██║██║   ██║███████║██║      ╚████╔╝ 
 ██╔══██║██║    ██╔═══╝ ██╔══██╗██║╚██╗ ██╔╝██╔══██║██║       ╚██╔╝  
 ██║  ██║██║    ██║     ██║  ██║██║ ╚████╔╝ ██║  ██║╚██████╗   ██║   
 ╚═╝  ╚═╝╚═╝    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝   ╚═╝   
 ███████╗██╗██████╗ ███████╗██╗    ██╗ █████╗ ██╗     ██╗            
 ██╔════╝██║██╔══██╗██╔════╝██║    ██║██╔══██╗██║     ██║            
 █████╗  ██║██████╔╝█████╗  ██║ █╗ ██║███████║██║     ██║            
 ██╔══╝  ██║██╔══██╗██╔══╝  ██║███╗██║██╔══██║██║     ██║            
 ██║     ██║██║  ██║███████╗╚███╔███╔╝██║  ██║███████╗███████╗       
 ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝       
```

### An Explainable Adaptive AI Privacy Firewall for Detecting Unauthorized Data Access Using User Behavior Analytics (UBA)

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-24+-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-Ensemble-EB5424?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://xgboost.readthedocs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br/>

[Project Overview](#project-overview) •
[Core Features](#core-features) •
[System Architecture](#system-architecture) •
[ML Pipeline](#machine-learning-pipeline) •
[Installation](#installation) •
[Docker Deployment](#docker-deployment) •
[API Reference](#api-documentation) •
[Documentation](#documentation)

</div>

---

## Project Overview

The **AI Privacy Firewall** is an enterprise-grade cybersecurity platform that shifts organizational defense from traditional perimeter inspection to **continuous, behavioral, Zero Trust data access arbitration**. 

### Why Was It Developed?
Modern enterprise breaches rarely occur through blunt network intrusion. Instead, compromised credentials, privilege abuse, and insider threats cause the most catastrophic data exfiltration events. Once an employee or compromised identity is inside the network, traditional firewalls treat them as trusted entities, granting unrestricted access to sensitive documents, customer databases, and proprietary source code.

### What Problem Does It Solve?
Traditional firewalls monitor packet headers (IP addresses, ports, protocols). They have **zero semantic understanding** of:
- *Who* is accessing the data.
- *Whether* this volume or time of day is abnormal for that person.
- *Whether* sensitive records are being dumped to a removable USB storage peripheral.
- *Why* a security decision was made (lack of explainability).

### How Does It Work?
The AI Privacy Firewall ingests live per-employee behavioral telemetry (keystrokes, logins, VPN sessions, USB attachments, download velocity, and HTTP burst frequencies), normalizes and vectorizes 30+ indicators, scores the access attempt through an ensemble of supervised machine learning classifiers (**XGBoost**, **Random Forest**, **Decision Tree**, **Logistic Regression**), explains the classification via **SHAP (SHapley Additive exPlanations)**, and arbitrates access using a deterministic Zero Trust policy engine (`ALLOW`, `WARN`, `BLOCK`).

---

## Problem Statement

Current enterprise security models suffer from critical blind spots:

1. **Perimeter-Only Inspection:** Firewalls and WAFs guard external boundaries. They are blind to authenticated employees moving laterally or exfiltrating data.
2. **Authorized User Abuse:** Malicious or compromised insiders legitimately possess valid credentials, bypassing multi-factor authentication (MFA) and single sign-on (SSO).
3. **High False Positive Rates:** Heuristic rule-based security software generates thousands of spurious alerts, causing alert fatigue for SOC analysts.
4. **Opaque "Black-Box" AI:** Existing machine learning intrusion detection systems cannot explain *why* an alert was generated, hindering rapid incident response and regulatory compliance (GDPR, HIPAA, SOC 2).

---

## Proposed Solution

The **Explainable Adaptive AI Privacy Firewall** resolves these vulnerabilities by uniting:

* **User Behavior Analytics (UBA):** Continuous, multi-dimensional modeling of employee behavioral baselines across department cohorts.
* **Supervised Ensemble Learning:** An active production pipeline achieving **99.32% test accuracy** and **0.978 ROC-AUC** with sub-2ms inference SLA.
* **Explainable AI (XAI):** Mathematically rigorous local and global feature attribution using SHAP TreeExplainer.
* **Deterministic Zero Trust Arbitration:** Autonomous policy enforcement (`BLOCK` with TCP RST, `WARN` with step-up MFA challenge, or `ALLOW`).
* **Digital Employee Twin:** Real-time state synchronization tracking hardware endpoints, active sessions, locations, and behavioral drift.

---

## Core Features

| Feature | Description |
| :--- | :--- |
| **User Behavior Analytics (UBA)** | Continuously models individual and departmental behavioral baselines, tracking volume velocity, off-hours activity, peripheral access, and anomalous deviations. |
| **AI Firewall Engine** | The central command surface. Displays real-time threat scores, current risk levels, temporal attack curves, policy arbitration sliders, threat heatmaps, and streaming packet telemetry. |
| **Digital Twin** | Virtual security replica of monitored employees showing assigned devices, live sessions, physical geolocations, threat scores, and interactive 3D network topology. |
| **Policy Engine** | Zero Trust governance engine evaluating real-time threat scores against deterministic compliance rules with interactive threshold adjustment. |
| **AI Analytics & Benchmarks** | Comprehensive ML evaluation center showing Model Comparison, ROC Curves (AUC 0.991), PR Curves, Confusion Matrix, and Global Feature Importance. |
| **Adaptive Learning** | Longitudinal concept drift monitoring, self-calibrating baselines, adaptive risk weighting, and closed-loop analyst feedback ingestion. |
| **Audit Logs** | Tamper-evident compliance table recording actor, action, timestamp, decision, risk tier, device, and IP address, complete with instant CSV export. |
| **Live Monitoring** | Real-time surveillance grid displaying live employee activity, threat score, login state, USB status, VPN connection, download velocity, HTTP request rate, geo-location, and status. |
| **Authentication & RBAC** | Stateless JWT bearer token authentication, bcrypt/Argon2 password hashing, and role-based route guards for SOC analysts and administrators. |

---

## System Architecture

```mermaid
graph TD
    subgraph ClientLayer ["1. Presentation Layer (React 19 + TypeScript)"]
        User(["SOC Security Analyst / Admin"])
        SPA["Enterprise Web Console<br/>(Tailwind CSS + 3D Canvas Telemetry)"]
        User -->|Interacts / Monitors| SPA
    end

    subgraph GatewayLayer ["2. Gateway & Authentication (FastAPI)"]
        Nginx["Nginx Reverse Proxy<br/>(Port 80)"]
        Gateway["FastAPI Gateway Engine<br/>(Port 8000)"]
        AuthService["OAuth2 / JWT Bearer Authentication"]
        SPA -->|REST API / JSON| Nginx
        Nginx -->|Reverse Proxy /api/v1| Gateway
        Gateway --> AuthService
    end

    subgraph AnalyticsPipeline ["3. UBA & Feature Pipeline"]
        Collector["Activity Telemetry Collector"]
        FeatureEngine["Feature Extraction & Temporal Encoding<br/>(30+ Dimensional Vectors)"]
        UBA["User Behavior Analytics (UBA)<br/>(Cohort Baseline Drift Scoring)"]
        Twin["Digital Twin State Engine<br/>(Endpoint & Session Synchronization)"]
        
        AuthService --> Collector
        Collector --> FeatureEngine
        FeatureEngine --> UBA
        FeatureEngine --> Twin
    end

    subgraph IntelligenceLayer ["4. Machine Learning & Explainability"]
        AIOrchestrator["AI Threat Inference Engine"]
        XGBoost["XGBoost Classifier (Production 99.32%)"]
        RandomForest["Random Forest (Verification Ensemble)"]
        DecisionTree["Decision Tree (Fast-Path)"]
        LogisticReg["Logistic Regression (Baseline)"]
        SHAP["SHAP Explainability Engine<br/>(Feature Attribution Weights)"]

        UBA --> AIOrchestrator
        AIOrchestrator --> XGBoost
        AIOrchestrator --> RandomForest
        AIOrchestrator --> DecisionTree
        AIOrchestrator --> LogisticReg
        AIOrchestrator --> SHAP
    end

    subgraph GovernanceLayer ["5. Zero Trust Policy & Enforcement"]
        PolicyEngine["Zero Trust Policy Engine"]
        Arbitration{"Decision Arbitration<br/>(ALLOW / WARN / BLOCK)"}
        Enforcement["Autonomous Enforcement Engine<br/>(TCP Reset / Revoke Token)"]
        AuditService["Tamper-Evident Audit Service"]

        AIOrchestrator --> PolicyEngine
        SHAP --> PolicyEngine
        PolicyEngine --> Arbitration
        Arbitration -->|Threat Score >= 0.75| Enforcement
        Arbitration -->|Threat Score < 0.75| AuditService
        Enforcement --> AuditService
    end

    subgraph StorageLayer ["6. Persistence & Artifacts"]
        Postgres[(PostgreSQL 16 Database<br/>Users, Scans, Audit Events)]
        ModelStore[(Model Registry<br/>Serialized .joblib & SHAP Reports)]
        AuditService --> Postgres
        AIOrchestrator -.-> ModelStore
    end
```

---

## Working Flow

```mermaid
flowchart TD
    A([Employee Session Initiation]) --> B[OAuth2 Login & MFA Verification]
    B --> C[Live Activity Telemetry Collection]
    C --> D[Feature Extraction: USB, VPN, Downloads, HTTP Rate, Off-Hours]
    D --> E[UBA Baseline Comparison vs. Department Cohort]
    E --> F[Machine Learning Ensemble Inference XGBoost]
    F --> G[Generate Threat Probability Score 0.0 - 1.0]
    G --> H[SHAP Explainability Feature Attribution]
    H --> I{Policy Threshold Evaluation}
    I -->|Score >= 0.75| J[Decision: BLOCK - Autonomous TCP Reset]
    I -->|0.40 <= Score < 0.75| K[Decision: WARN - Step-Up MFA Challenge]
    I -->|Score < 0.40| L[Decision: ALLOW - Verified Zero Trust Access]
    J --> M[Live Dashboard Streaming Alert]
    K --> M
    L --> M
    M --> N[(Immutable PostgreSQL Audit Log)]
```

---

## Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** | Modern component lifecycle, server/client optimization, and state management. |
| **Language (Frontend)**| **TypeScript 5.5+** | Strict static type safety, zero undefined errors, typed API contracts. |
| **Build Tool** | **Vite 8.3** | Blazing-fast development server and optimized Rollup production bundler. |
| **Styling & Theme** | **Tailwind CSS v4** | Enterprise White Cyber design system (#FFFFFF, #F8FAFC, #2563EB). |
| **Charts & Graphs** | **Recharts 3.10** | High-performance, animated SVG and Canvas visualizations. |
| **Backend Framework** | **FastAPI 0.115+** | High-concurrency asynchronous Python API with automatic OpenAPI / Swagger generation. |
| **Language (Backend)** | **Python 3.12** | Core language for machine learning, data engineering, and REST routing. |
| **Data Validation** | **Pydantic v2** | Strict request/response schema parsing and compilation to Rust core. |
| **ORM & Persistence** | **SQLAlchemy 2.0** | Robust relational mapping, query builder, and connection pooling. |
| **Database** | **PostgreSQL 16** | Production relational storage for user credentials, scans, and audit trails. |
| **Migrations** | **Alembic** | Automated database schema versioning and migration rollouts. |
| **Machine Learning** | **XGBoost 3.4**, **Scikit-Learn** | Gradient boosted trees, random forests, decision trees, and logistic regression. |
| **Explainable AI (XAI)**| **SHAP 0.51+** | Cooperative game theory feature attributions (Shapley values). |
| **Testing** | **Pytest**, **Vitest** | Comprehensive test harnesses (522 backend tests, 123 frontend tests). |
| **Containerization** | **Docker & Docker Compose**| Multi-stage container builds and unified orchestration. |

---

## Machine Learning Pipeline

```
+----------------------------------------------------------------------------------------------------+
|                                    MACHINE LEARNING PIPELINE                                       |
+----------------------------------------------------------------------------------------------------+
| 1. DATASET:          CMU CERT Insider Threat Dataset r4.2 (Logons, Devices, HTTP, File, Email)     |
| 2. PREPROCESSING:    Data cleaning, timestamp alignment, missing value imputation, categorical OHE |
| 3. FEATURE ENG:      30+ dynamic behavioral & temporal indicators (velocity, off-hours, USB flag)  |
| 4. BALANCING:        Class imbalance resolution via stratified downsampling & temporal splitting    |
| 5. TRAINING:         Multi-model cross-validation with grid hyperparameter tuning                  |
| 6. EVALUATION:       F1-score, Precision-Recall AUC, ROC-AUC, and Confusion Matrix benchmarking    |
| 7. EXPLAINABILITY:   TreeExplainer SHAP attribution generation for local & global decisions        |
| 8. INFERENCE:        Sub-2ms continuous prediction yielding threat probability score P in [0.0, 1.0] |
+----------------------------------------------------------------------------------------------------+
```

### Model Performance Comparison on CERT Test Partition

| Model Architecture | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Inference Latency | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **XGBoost** | **99.32%** | **99.09%** | **99.32%** | **0.991** | **0.978** | **1.62 ms** | **Active Production Primary** |
| **Random Forest** | 99.32% | 99.18% | 99.32% | 0.992 | 0.931 | 1.30 ms | Verification Ensemble |
| **Decision Tree** | 99.28% | 99.32% | 99.28% | 0.993 | 0.763 | 1.28 ms | Fast-Path Fallback |
| **Logistic Regression**| 99.32% | 98.65% | 99.32% | 0.990 | 0.972 | 1.40 ms | Linear Baseline |

---

## Project Structure

```
ai-privacy-firewall/
├── backend/                       # FastAPI application & ML inference engine
│   ├── alembic/                   # Database migrations
│   ├── app/                       # Core backend source package
│   │   ├── api/                   # REST API routes (auth, firewall, analytics, health, scan)
│   │   ├── auth/                  # JWT security and password hashing
│   │   ├── core/                  # Settings, constants, and dependency injection
│   │   ├── db/                    # SQLAlchemy engine, session, and models
│   │   ├── experiments/           # Benchmark runners and model evaluation
│   │   ├── explainability/        # SHAP explainer pipelines
│   │   ├── features/              # Feature extraction and temporal transformations
│   │   ├── ml/                    # Classifier definitions, pipelines, and preprocessors
│   │   ├── models/                # Database entities (User, Scan, AuditEvent)
│   │   ├── schemas/               # Pydantic validation schemas
│   │   └── services/              # Business logic (FirewallService, PolicyEngine, UBA)
│   ├── data/                      # Serialized models (.joblib) & CERT r4.2 datasets
│   ├── tests/                     # 522+ unit and integration test suites
│   ├── Dockerfile                 # Backend production container
│   ├── pyproject.toml             # Python build configuration
│   └── requirements.txt           # Python dependencies
├── frontend/                      # React 19 + TypeScript + Vite SPA
│   ├── src/                       # Frontend source package
│   │   ├── api/                   # Axios HTTP client with auth interceptors
│   │   ├── components/            # Reusable UI component library (White Enterprise Theme)
│   │   │   ├── engine/            # Interactive 3D AI Firewall Core canvas component
│   │   │   ├── twin/              # Interactive 3D Digital Twin Network topology component
│   │   │   └── ...                # MetricCard, Card, Badges, Buttons, Inputs
│   │   ├── data/                  # Organization profile & 8 monitored employee records
│   │   ├── hooks/                 # React custom hooks
│   │   ├── layouts/               # DashboardLayout, AuthLayout
│   │   ├── pages/                 # 11 Dedicated enterprise page modules
│   │   ├── store/                 # React Context providers (Auth, Settings)
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── App.tsx                # Central router configuration
│   │   └── index.css              # Global styles, Tailwind directives, and custom scrollbars
│   ├── Dockerfile                 # Multi-stage frontend container (Node 22 -> Nginx)
│   ├── package.json               # Node.js dependencies
│   └── vite.config.ts             # Vite configuration
├── docs/                          # Comprehensive technical and academic documentation
├── docker-compose.yml             # Unified production orchestration
├── LICENSE                        # MIT License
├── README.md                      # Primary repository documentation
├── ARCHITECTURE.md                # System architectural deep-dive
├── INSTALLATION.md                # Multi-platform installation guide
├── CONTRIBUTING.md                # Contribution guidelines
├── CODE_OF_CONDUCT.md             # Contributor Covenant Code of Conduct
├── SECURITY.md                    # Vulnerability disclosure policy
├── CHANGELOG.md                   # SemVer release history
└── ROADMAP.md                     # Engineering roadmap & future milestones
```

---

## Installation

### Prerequisites
- Python 3.12+ (or Python 3.11+)
- Node.js 20+ (Node.js 22 LTS recommended)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Anonymous12P/ai-privacy-firewalll.git
cd ai-privacy-firewalll
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Linux / macOS:
source .venv/bin/activate

# Install dependencies:
pip install --upgrade pip
pip install -r requirements.txt
pip install -e ".[dev]"

# Configure environment variables:
# Windows PowerShell:
Copy-Item .env.example .env
# Linux / macOS:
cp .env.example .env

# Run backend:
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend will be live at `http://127.0.0.1:8000`. Swagger documentation available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Configure environment variables:
# Windows PowerShell:
Copy-Item .env.example .env
# Linux / macOS:
cp .env.example .env

# Run frontend:
npm run dev
```
Frontend development console will be accessible at `http://localhost:5173`.

---

## Docker Deployment

Deploy the complete multi-tier enterprise stack (PostgreSQL 16, FastAPI Backend, and Nginx SPA) with a single command:

```bash
# Build and start all services in the background:
docker compose up --build -d

# Check running container health:
docker compose ps

# Follow live aggregated service logs:
docker compose logs -f

# Follow backend service logs only:
docker compose logs -f backend

# Stop the containers without losing database volume data:
docker compose down

# Teardown containers and remove persistent volumes:
docker compose down -v
```

### Container Endpoints:
- **Web Application:** `http://localhost` (Port 80)
- **FastAPI REST API:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **Healthcheck:** `http://localhost:8000/health`

---

## Configuration

The platform is configured via environment variables defined in `.env` files:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | SQLAlchemy connection string | `postgresql+psycopg2://postgres:postgres@localhost:5432/firewall_db` |
| `JWT_SECRET_KEY` | Cryptographic secret for signing tokens | `your-secure-32-char-random-secret-key-here` |
| `JWT_ALGORITHM` | Algorithm for token signatures | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifespan | `60` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifespan | `7` |
| `ENVIRONMENT` | Deployment environment | `production` (or `development`) |
| `CORS_ORIGINS` | Permitted cross-origin hosts | `http://localhost,http://localhost:5173,http://127.0.0.1:5173` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:8000/api/v1` |

---

## Screenshots

<div align="center">

### 1. SecOps Authentication & Console Sign In
*Clean enterprise login and credential verification with role-based routing.*
```
[ Screenshot Placeholder: SecOps Console Login Page (White Theme) ]
```

### 2. Security Operations Command Dashboard
*Top 6 KPI metrics, 24h threat trend, employee risk summaries, and real-time live feed.*
```
[ Screenshot Placeholder: Security Operations Dashboard ]
```

### 3. Central AI Firewall Engine with 3D Core
*Interactive Canvas 3D threat core, real-time decision engine, and live packet stream.*
```
[ Screenshot Placeholder: AI Firewall Engine & 3D Core ]
```

### 4. User Behavior Analytics (UBA) Center
*Behavioral baseline comparison, risk timeline, activity heatmap, and SHAP feature ranking.*
```
[ Screenshot Placeholder: User Behavior Analytics (UBA) Screen ]
```

### 5. Employee Digital Twin Center
*Virtual employee persona, hardware endpoints, active sessions, and 3D network topology.*
```
[ Screenshot Placeholder: Digital Twin & 3D Network Topology ]
```

### 6. AI Analytics & Classifier Benchmarks
*Supervised model comparison table, ROC curve (0.991 AUC), PR curve, and confusion matrix.*
```
[ Screenshot Placeholder: AI Analytics & Model Performance ]
```

### 7. Zero Trust Policy Engine
*Interactive threat score slider, instant rule arbitration, and governance catalog.*
```
[ Screenshot Placeholder: Policy Engine & Decision Rules ]
```

### 8. Immutable Security Audit Logs
*Multi-vector data table with instant CSV export, risk filters, and search.*
```
[ Screenshot Placeholder: Enterprise Audit Logs Table ]
```

### 9. Monitored Personnel Directory
*Roster of 8 authorized employees with contact info, device IDs, and security dossier.*
```
[ Screenshot Placeholder: Employee Security Directory ]
```

</div>

---

## API Documentation

The backend exposes fully typed REST endpoints under `/api/v1`:

### Authentication Endpoints
- `POST /api/v1/auth/register` — Register a new enterprise user.
- `POST /api/v1/auth/login` — Authenticate credentials and receive JWT access + refresh tokens.

### Firewall Evaluation & Policy Endpoints
- `POST /api/v1/firewall/evaluate` — Evaluate access attempt through the complete pipeline without dropping connections (passive audit mode).
- `POST /api/v1/firewall/enforce` — Actively evaluate and enforce policy (returns `403 Forbidden` if threat score $\ge$ threshold).
- `GET /api/v1/firewall/policies` — List all active Zero Trust governance rules.
- `GET /api/v1/firewall/status` — Retrieve platform operational status, mode, and latency metrics.
- `GET /api/v1/firewall/model-pipeline` — Retrieve ML model benchmarks, global SHAP values, and dataset metadata.

### Audit & Analytics Endpoints
- `GET /api/v1/firewall/audit` — Query historical evaluation and enforcement events with pagination and filtering.
- `GET /api/v1/analytics` — Get overall system scan summary analytics.
- `GET /api/v1/analytics/risk` — Get risk-tier and prediction distributions.
- `GET /api/v1/analytics/models` — Get individual model usage and inference statistics.

### Health Endpoints
- `GET /health` — Service readiness check (`{"status": "ok"}`).

---

## Future Enhancements

The platform is architected to scale into larger hybrid enterprise environments:

* **Cloud Native Deployments:** Pre-packaged Terraform and Helm charts for AWS (ECS Fargate + RDS), Azure (Container Apps), and GCP.
* **Enterprise SIEM Forwarders:** Native CEF (Common Event Format) and Syslog streaming to **Splunk Enterprise Security**, **IBM QRadar**, and **Microsoft Sentinel**.
* **Identity Provider Synchronization:** Bi-directional sync with **Microsoft Active Directory (AD)**, Azure Entra ID, and Okta via SCIM and LDAP.
* **Federated Learning (FL):** Decentralized model training allowing multiple geographically separated corporate branches to collaboratively improve UBA anomaly detection weights without exposing raw employee logs.
* **LLM Security Assistant / GenAI Copilot:** Retrieval-Augmented Generation (RAG) assistant allowing SOC analysts to query exfiltration trails using natural language.

---

## Documentation

For deep technical details, explore our documentation suite:

* [Architecture Deep Dive](ARCHITECTURE.md) — Exhaustive system micro-architecture and data flows.
* [Installation & Deployment Guide](INSTALLATION.md) — Step-by-step setup for Linux, macOS, Windows, and Docker.
* [Project Directory Structure](PROJECT_STRUCTURE.md) — Comprehensive guide to every folder and file.
* [Project Engineering Roadmap](ROADMAP.md) — Upcoming release milestones and feature priorities.
* [Contributing Guidelines](CONTRIBUTING.md) — Pull request workflow and coding standards.
* [Security Policy](SECURITY.md) — Vulnerability reporting and disclosure protocols.
* [Changelog](CHANGELOG.md) — Version release history following SemVer.

---

## Contributing

Contributions are welcome! Please review our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## Author & Academic Attribution

<div align="center">

### Project Developed By
**Pavan Jadhav**  
*B.Tech in Computer Science & Engineering*  
Lead Security Architect & Full Stack Engineer  

**Target Organization Tenant:**  
`Privacy Shield Technologies Pvt. Ltd.`  
*AI Privacy Firewall Research Lab*  

[![GitHub](https://img.shields.io/badge/GitHub-Anonymous12P-181717?style=flat&logo=github)](https://github.com/Anonymous12P)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin)](https://linkedin.com)

</div>
