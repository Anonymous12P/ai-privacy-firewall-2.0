# Installation & Deployment Guide: AI Privacy Firewall

This guide provides end-to-end instructions for deploying the **AI Privacy Firewall** across local development environments and production Docker containers.

---

## 1. System Requirements

### Hardware Prerequisites
- **CPU:** 4+ cores recommended (for ML inference and live telemetry simulation)
- **RAM:** 8 GB minimum (16 GB recommended)
- **Disk Space:** 5 GB free disk space

### Software Prerequisites
| Component | Minimum Version | Recommended Version |
| :--- | :--- | :--- |
| **Python** | 3.11+ | Python 3.12 |
| **Node.js** | 20.0+ | Node.js 22 LTS |
| **npm** | 10.0+ | npm 10.9+ |
| **Docker Engine** | 24.0+ | Latest Docker Desktop |
| **Git** | 2.30+ | Latest Git SCM |

---

## 2. Docker Deployment (Recommended)

The simplest and most reliable method to deploy the complete stack (PostgreSQL 16, FastAPI Backend, and Nginx-served React Frontend) is using Docker Compose.

### Step 1: Clone the Repository
```bash
git clone https://github.com/Anonymous12P/ai-privacy-firewalll.git
cd ai-privacy-firewalll
```

### Step 2: Configure Environment
Copy the example environment configuration:
```bash
# On Linux/macOS:
cp backend/.env.example .env

# On Windows PowerShell:
Copy-Item backend\.env.example .env
```

### Step 3: Build & Start Containers
```bash
docker compose up --build -d
```

### Step 4: Verify Container Health
```bash
docker compose ps
```
All three containers (`ai_privacy_firewall_db`, `ai_privacy_firewall_backend`, `ai_privacy_firewall_frontend`) should report healthy status.

### Step 5: Access the Platform
- **Enterprise Web UI:** [http://localhost](http://localhost) (or [http://localhost:80](http://localhost:80))
- **Backend REST API:** [http://localhost:8000](http://localhost:8000)
- **Swagger Interactive API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Service Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

### Useful Docker Commands
```bash
# View live streaming container logs
docker compose logs -f

# View logs for a specific service (e.g. backend)
docker compose logs -f backend

# Stop the stack without deleting database data
docker compose down

# Stop the stack and remove persistent volumes
docker compose down -v
```

---

## 3. Local Bare-Metal Setup

For development, testing, and debugging, you can run the backend and frontend directly on your host operating system.

### 3.1 Backend Setup (FastAPI & ML Engine)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment:**
   ```bash
   # Linux / macOS:
   python3 -m venv .venv
   source .venv/bin/activate

   # Windows PowerShell:
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. **Install dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   pip install -e ".[dev]"
   ```

4. **Configure environment variables:**
   ```bash
   # Windows PowerShell:
   Copy-Item .env.example .env

   # Linux / macOS:
   cp .env.example .env
   ```

5. **Initialize Database Migrations:**
   ```bash
   alembic upgrade head
   ```

6. **Start the FastAPI Backend:**
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *(Note: `uvicorn src.main:app --reload` is also fully supported via our backward-compatibility alias).*

---

### 3.2 Frontend Setup (React 19 & Vite)

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Windows PowerShell:
   Copy-Item .env.example .env

   # Linux / macOS:
   cp .env.example .env
   ```
   *Ensure `VITE_API_URL=http://localhost:8000/api/v1` is defined.*

4. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   The frontend will boot on `http://localhost:5173`.

---

## 4. Verification & Testing

Verify that your local setup is operating with 100% test integrity.

### Run Backend Unit & Integration Tests (Pytest)
```bash
cd backend
pytest -q
```
*Expected: 522 passed, 1 skipped in ~15-60s.*

### Run Frontend Static Typecheck & Build
```bash
cd frontend
npm run build
```
*Expected: `tsc -b && vite build` succeeds with 0 errors.*

### Run Frontend Unit Tests (Vitest)
```bash
cd frontend
npm test -- --run
```
*Expected: 19 test files passed, 123 tests passed.*
