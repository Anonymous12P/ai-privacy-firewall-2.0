# Security Policy

## Supported Versions

We release security patches and stability updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| 1.1.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

---

## Reporting a Vulnerability

The **AI Privacy Firewall** team takes security vulnerabilities and insider privacy concerns seriously. We appreciate your efforts to responsibly disclose findings.

### Disclosure Process
1. **Do NOT open a public issue.** Public disclosure exposes active enterprise deployments to unmitigated risk.
2. Email your vulnerability report directly to:
   - **Security Contact:** Pavan Jadhav ([pavan.jadhav@privacyshield.tech](mailto:pavan.jadhav@privacyshield.tech))
3. Include the following details:
   - Vulnerability category (e.g., authentication bypass, injection, rate-limit evasion, UBA model inversion)
   - Step-by-step reproduction instructions or a minimal Proof of Concept (PoC)
   - Potential impact and affected endpoints
4. **Response Timeline:**
   - **Acknowledgment:** Within 24-48 hours.
   - **Triage & Assessment:** Within 3-5 business days.
   - **Patch Release:** Coordinated release within 14 business days.

---

## Security Architecture & Best Practices

The application is engineered according to the **NIST SP 800-207 Zero Trust Architecture**:

- **Authentication:** Password hashing enforced using salted Argon2 / BCrypt; session assertions verified via cryptographically signed JWT bearer tokens (`HS256`).
- **Authorization & RBAC:** Role-based access control guards sensitive administration, telemetry streaming, and enforcement routes.
- **SQL Injection Prevention:** Fully parameterized queries enforced via SQLAlchemy ORM and typed Pydantic v2 schemas.
- **Cross-Origin Resource Sharing (CORS):** Strict domain origin white-listing in FastAPI middleware (`backend/app/main.py`).
- **Autonomous Enforcement:** High-risk exfiltration attempts (>75% threat score) are dropped at the TCP/TLS network edge with immediate token invalidation.
