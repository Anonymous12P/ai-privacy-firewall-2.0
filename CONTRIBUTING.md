# Contributing to AI Privacy Firewall

Thank you for your interest in contributing to the **AI Privacy Firewall** project! We welcome contributions from developers, security researchers, and data scientists across the open-source community.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it to understand our community standards.

---

## How Can I Contribute?

### 1. Reporting Bugs
- Use the GitHub Issue Tracker to search for existing issues before filing.
- Include a descriptive title, clear steps to reproduce, expected behavior, actual behavior, and error logs or screenshots.
- Specify your operating system, Python version, Node.js version, and environment details.

### 2. Suggesting Features
- Open a feature proposal issue detailing the motivation, use case, proposed architecture, and expected impact on UBA or firewall security.

### 3. Submitting Pull Requests (PRs)
- Fork the repository and create your feature branch from `main`:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- Keep PRs focused on a single concern or fix.
- Ensure all automated test suites pass (both frontend Vitest and backend Pytest).
- Follow standard Conventional Commits formatting (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).

---

## Local Development Workflow

### Prerequisites
- **Python:** 3.12+ (or 3.11+)
- **Node.js:** 20+ (Node 22 recommended)
- **Package Managers:** `pip`, `npm`
- **Docker:** Optional but recommended for containerized testing

### Backend Setup & Verification
```bash
# 1. Create and activate a virtual environment
cd backend
python -m venv .venv

# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# 2. Install dependencies with test extras
pip install --upgrade pip
pip install -r requirements.txt
pip install -e ".[dev]"

# 3. Execute Pytest suite
pytest -q
```

### Frontend Setup & Verification
```bash
# 1. Navigate to frontend and install dependencies
cd frontend
npm install

# 2. Verify static type checks & production build
npm run build

# 3. Execute Vitest test suite
npm test -- --run
```

---

## Coding Standards

### Python (Backend)
- Adhere strictly to **PEP 8** guidelines.
- Use explicit type annotations everywhere (Pydantic v2 schemas and strict typing).
- Format and lint code using `ruff` and `mypy`.
- Maintain clean modularity across API routes, services, repositories, and domain models.

### TypeScript / React (Frontend)
- Adhere to functional React components with strict TypeScript types (`strict: true`, `noUnusedLocals: true`).
- Follow the enterprise white cybersecurity design system:
  - Canvas: `#FFFFFF`
  - Secondary Surface: `#F8FAFC`
  - Borders: `#E2E8F0`
  - Cobalt Blue Primary: `#2563EB`
- Style exclusively with Tailwind CSS utility classes.
- Ensure all interactive buttons, badges, and modals are accessible (proper ARIA labels and keyboard focus states).

---

## Testing Guidelines

Every code modification must be accompanied by relevant test cases:
- **Backend:** Place unit and integration tests in `backend/tests/` using Pytest. Never leave unhandled database connection dependencies (use `conftest.py` SQLite isolated fallbacks when testing without live PostgreSQL).
- **Frontend:** Place unit tests in `frontend/src/**/*.test.ts` using Vitest and Mock Service Worker / mock contexts where applicable.

---

## Questions and Support

For questions, reach out to the project maintainer:
- **Lead Developer:** Pavan Jadhav ([pavan.jadhav@privacyshield.tech](mailto:pavan.jadhav@privacyshield.tech))
- **Repository:** [https://github.com/Anonymous12P/ai-privacy-firewalll](https://github.com/Anonymous12P/ai-privacy-firewalll)
