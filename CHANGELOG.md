# Changelog

All notable changes to the **AI Privacy Firewall** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-11-19

### Added
- **White Professional Enterprise Design System:** Refactored entire UI to commercial SaaS standard (#FFFFFF canvas, #F8FAFC surface, #E2E8F0 borders, #2563EB cobalt blue primary).
- **Interactive 3D AI Firewall Core:** Built zero-dependency Canvas 3D hardware-accelerated spatial visualizer (`AiFirewallCore3D.tsx`) with rotating concentric particle rings and live threat flux indicators.
- **Interactive 3D Digital Twin Network Graph:** Integrated spatial network topology visualization (`DigitalTwinNetwork3D.tsx`) tracking live connections between employee digital twins and infrastructure assets.
- **Dedicated Central AI Firewall Engine Page:** Created `/firewall-engine` featuring real-time threat scores, current risk levels, temporal attack curves, policy arbitration sliders, threat intensity heatmaps, and live request streams.
- **Multi-Vector CSV Export:** Functional client-side audit log exporter in `AuditLogsPage.tsx`.
- **Root Docker Compose Orchestration:** Added production-ready `docker-compose.yml` linking PostgreSQL 16, FastAPI backend, and Nginx frontend.

### Changed
- Replaced 18 fragmented sidebar routes with strictly the 11 mandated enterprise cybersecurity modules.
- Upgraded all metric cards, badges, data tables, and forms with hover elevation physics and WCAG AAA contrast compliance.
- Enhanced backend execution support enabling both `uvicorn app.main:app` and `uvicorn src.main:app`.
- Configured automated SQLite fallback in Pytest test harness (`backend/tests/conftest.py`).

### Fixed
- Fixed TypeScript `TS6133` unused import and variable warnings across all redesigned pages.
- Fixed registration signature mismatch in frontend auth form.
- Fixed UTF-16 Byte Order Mark (BOM) conflict in Pytest test collection.

---

## [1.1.0] - 2026-11-15

### Added
- **Ensemble Machine Learning Pipeline:** Integrated trained production classifiers (XGBoost, Random Forest, Decision Tree, Logistic Regression) on CERT Insider Threat r4.2 dataset.
- **Explainable AI (XAI) Engine:** Global and local SHAP feature attribution generation and ranking.
- **Adaptive Learning Engine:** Covariate concept drift detection, self-calibrating baselines, and analyst feedback loops.
- **Zero Trust Policy Arbitration Engine:** Deterministic rule matching evaluated against continuous AI anomaly scores.

### Changed
- Migrated API contracts to versioned `/api/v1` routes.
- Upgraded SQLAlchemy models with Alembic database migration revisions.

---

## [1.0.0] - 2026-11-08

### Added
- Initial release of the **AI Privacy Firewall** platform.
- FastAPI backend with asynchronous request routing and dependency injection.
- React 19 / Vite single-page application with responsive layouts.
- Stateless OAuth2 password bearer token authentication and password hashing.
- Initial Digital Twin model representation for enterprise personnel.
- Comprehensive unit and integration test suite.
