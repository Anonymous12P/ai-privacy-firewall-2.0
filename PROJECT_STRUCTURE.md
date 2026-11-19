# Project Structure: AI Privacy Firewall

This document provides a comprehensive overview of the **AI Privacy Firewall** repository architecture and directory layout.

```
ai-privacy-firewall/
├── .github/                       # GitHub Actions workflows & issue templates
├── backend/                       # FastAPI application, ML engine, and persistence
│   ├── alembic/                   # Database migrations (Alembic)
│   ├── app/                       # Core backend source package
│   │   ├── api/                   # REST API routes and endpoint controllers
│   │   │   ├── admin.py           # Admin controls and tenant oversight
│   │   │   ├── analytics.py       # Aggregated scan and risk analytics
│   │   │   ├── auth.py            # User registration and token authentication
│   │   │   ├── firewall.py        # Central firewall evaluation, enforcement, policy & audit APIs
│   │   │   ├── health.py          # Service health check endpoint
│   │   │   ├── history.py         # Evaluation history queries
│   │   │   ├── router.py          # Central v1 API router assembly
│   │   │   └── scan.py            # Targeted privacy scan execution
│   │   ├── auth/                  # JWT generation, verification, and password hashing
│   │   ├── core/                  # Global application configuration, constants, and dependencies
│   │   ├── dataset_inventory/     # Data cataloging and source verification
│   │   ├── dataset_subset/        # CERT r4.2 subsetting utilities
│   │   ├── db/                    # SQLAlchemy database engine, session, and declarative base
│   │   ├── experiments/           # ML experiment execution, benchmark evaluation, and tracking
│   │   ├── explainability/        # Global & local SHAP explainer pipelines
│   │   ├── features/              # Feature extraction, temporal encoding, and tabular transformation
│   │   ├── middleware/            # Security headers, logging, and CORS middleware
│   │   ├── ml/                    # Machine learning model architectures, training, and validation
│   │   │   ├── balancer.py        # Class balancing & SMOTE / undersampling utilities
│   │   │   ├── dataset.py         # Parquet / CSV dataset loaders
│   │   │   ├── exporter.py        # Model serialization (joblib)
│   │   │   ├── pipeline.py        # End-to-end ML inference pipeline
│   │   │   ├── preprocessor.py    # Standard scaling & categorical encoders
│   │   │   └── validator.py       # Metrics validation & test partition splits
│   │   ├── models/                # SQLAlchemy database ORM entities (User, Scan, AuditEvent)
│   │   ├── repositories/          # Data access layer repositories
│   │   ├── schemas/               # Pydantic v2 validation and serialization schemas
│   │   ├── services/              # Domain business logic
│   │   │   ├── ai_engine.py       # ML inference & anomaly scoring engine
│   │   │   ├── audit_service.py   # Immutable audit log generation
│   │   │   ├── auth_service.py    # User provisioning & credential verification
│   │   │   ├── behavior_service.py# UBA baseline tracking and anomaly derivation
│   │   │   ├── enforcement_engine.py # Autonomous TCP RST and token revocation
│   │   │   ├── explainability_engine.py # SHAP attribution generation
│   │   │   ├── firewall_service.py# Orchestrator uniting AI, UBA, policy, and enforcement
│   │   │   └── policy_engine.py   # Zero Trust rule evaluation and arbitration
│   │   └── utils/                 # Logging, date parsing, and security utilities
│   ├── data/                      # Training data and serialized models
│   │   ├── experiments/default/   # Trained production models (.joblib), SHAP reports, and metrics
│   │   └── raw/cert_r4.2/         # CMU CERT Insider Threat r4.2 dataset records
│   ├── tests/                     # 522+ automated backend test suites (Pytest)
│   ├── Dockerfile                 # Backend production container specification
│   ├── pyproject.toml             # Python package configuration and build requirements
│   └── requirements.txt           # Production and development pip dependencies
├── frontend/                      # React 19, TypeScript, and Vite single-page application
│   ├── src/                       # Frontend source package
│   │   ├── api/                   # Axios client configuration and request interceptors
│   │   ├── components/            # Reusable UI component library (White Enterprise Design)
│   │   │   ├── adaptive/          # Adaptive baseline cards and drift charts
│   │   │   ├── engine/            # Interactive 3D AI Firewall Core canvas component
│   │   │   ├── twin/              # Interactive 3D Digital Twin Network graph component
│   │   │   ├── Alert.tsx          # Inline alert notifications
│   │   │   ├── Button.tsx         # Accessible cobalt blue action buttons
│   │   │   ├── Card.tsx           # Rounded-2xl white card containers
│   │   │   ├── FirewallActionBadge.tsx # ALLOW / WARN / RESTRICT / BLOCK status badges
│   │   │   ├── Input.tsx          # Enterprise form text inputs
│   │   │   ├── MetricCard.tsx     # Floating KPI summary cards
│   │   │   ├── Navbar.tsx         # Top application header with live telemetry indicator
│   │   │   ├── RiskBadge.tsx      # Low / Medium / High / Critical status badges
│   │   │   └── Sidebar.tsx        # 11-module persistent enterprise navigation bar
│   │   ├── data/                  # Enterprise tenant data and 8 authorized employee profiles
│   │   ├── hooks/                 # React custom hooks (useAuth, useFirewall, useAnalytics)
│   │   ├── layouts/               # Layout wrappers (DashboardLayout, AuthLayout)
│   │   ├── pages/                 # 11 Dedicated enterprise page modules
│   │   │   ├── AdaptiveLearningPage.tsx # Baseline drift & feedback loops
│   │   │   ├── AiAnalyticsPage.tsx      # Classifier benchmarks, ROC/PR, confusion matrix
│   │   │   ├── AuditLogsPage.tsx        # Searchable audit table with CSV export
│   │   │   ├── DashboardPage.tsx        # Enterprise SOC command console
│   │   │   ├── DigitalTwinPage.tsx      # Persona profiles & 3D network topology
│   │   │   ├── EmployeesPage.tsx        # Monitored personnel roster & security dossier
│   │   │   ├── FirewallEnginePage.tsx   # Central AI Firewall Engine & 3D Core
│   │   │   ├── LiveMonitoringPage.tsx   # Real-time streaming surveillance
│   │   │   ├── LoginPage.tsx            # Secure credential authentication
│   │   │   ├── PolicyEnginePage.tsx     # Zero Trust policy decision simulator
│   │   │   ├── RegisterPage.tsx         # Account provisioning
│   │   │   ├── SettingsPage.tsx         # Platform governance & polling intervals
│   │   │   └── UbaPage.tsx              # User Behavior Analytics center
│   │   ├── routes/                # Route guarding (ProtectedRoute, PublicRoute)
│   │   ├── services/              # API abstraction services (firewall, auth, policies)
│   │   ├── store/                 # React Context providers (AuthContext, SettingsContext)
│   │   ├── types/                 # TypeScript type definitions and interfaces
│   │   ├── utils/                 # Simulation algorithms and error formatters
│   │   ├── App.tsx                # Central routing table and legacy URL redirects
│   │   ├── index.css              # Global styles, Tailwind directives, and custom scrollbars
│   │   └── main.tsx               # Application bootstrap with TanStack Query provider
│   ├── Dockerfile                 # Multi-stage frontend container (Node 22 -> Nginx 1.27)
│   ├── nginx.conf                 # Nginx SPA fallback configuration
│   ├── package.json               # Node.js dependencies and build scripts
│   └── vite.config.ts             # Vite bundler configuration
├── docs/                          # Comprehensive academic and architectural research documentation
│   ├── 01_Project_Requirements.md # Functional and non-functional specifications
│   ├── 02_Research_Notes.md       # Literature survey & methodology
│   ├── 03_Architecture.md         # Micro-architecture and component interaction
│   ├── 04_API_Design.md           # REST endpoint specifications
│   ├── 05_Dataset.md              # CERT r4.2 schema breakdown
│   ├── 06_Dataset_Analysis.md     # Statistical distribution & class imbalance analysis
│   ├── 07_Feature_Engineering.md  # 30+ engineered temporal and behavioral indicators
│   ├── 08_Machine_Learning.md     # Model mathematical formulation
│   ├── 09_Model_Training.md       # Hyperparameter tuning and loss curves
│   ├── 10_Explainable_AI.md       # SHAP TreeExplainer & KernelExplainer design
│   ├── 11_Dataset_Subsetting.md   # Stratified subsetting methodology
│   └── 12_Experimental_Evaluation.md # Rigorous test set validation reports
├── docker-compose.yml             # Orchestration for PostgreSQL, Backend, and Frontend
├── LICENSE                        # MIT License (Pavan Jadhav)
├── README.md                      # Primary repository documentation
├── ARCHITECTURE.md                # System architectural deep-dive
├── INSTALLATION.md                # Multi-platform installation guide
├── CONTRIBUTING.md                # Contribution guidelines
├── CODE_OF_CONDUCT.md             # Contributor Covenant Code of Conduct
├── SECURITY.md                    # Vulnerability reporting and disclosure policy
├── CHANGELOG.md                   # SemVer release history
└── ROADMAP.md                     # Engineering roadmap & future scope
```
