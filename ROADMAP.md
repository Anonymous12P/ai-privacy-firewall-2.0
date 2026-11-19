# Project Roadmap: AI Privacy Firewall

This document outlines the strategic engineering milestones, feature priorities, and technical roadmap for the **AI Privacy Firewall** platform.

---

## Current Release: v1.2.0 (Production Ready) :white_check_mark:

- [x] **White Professional Enterprise UI/UX:** Commercial SaaS design inspired by Microsoft Defender XDR and CrowdStrike Falcon.
- [x] **Interactive 3D Spatial Visualizers:** Hardware-accelerated Canvas 3D AI Firewall Core and Digital Twin Network Topology.
- [x] **Ensemble Machine Learning:** Trained production models (XGBoost, Random Forest, Decision Tree, Logistic Regression) with sub-2ms inference SLA.
- [x] **Explainable AI (XAI):** Global and local SHAP feature importance reporting.
- [x] **Real-Time UBA Telemetry:** 3-second streaming surveillance across USB, VPN, downloads, and HTTP rates.
- [x] **Deterministic Zero Trust Arbitration:** Autonomous ALLOW, WARN, and BLOCK enforcement.
- [x] **Tamper-Evident Audit Logging:** Searchable compliance log table with instant CSV export.
- [x] **Automated Test Coverage:** 522 passed backend tests, 123 passed frontend tests.

---

## Phase 1: Enterprise Directory & Cloud Identity (v1.3 - Q1 2027)

- [ ] **Active Directory & LDAP Integration:** Direct synchronization with Microsoft Active Directory and Azure Entra ID for employee profile sync and automated role-to-cohort mapping.
- [ ] **SAML 2.0 & OIDC SSO:** Enterprise single sign-on supporting Okta, Ping Identity, and Microsoft Authenticator.
- [ ] **Fine-Grained ABAC (Attribute-Based Access Control):** Policy rules incorporating dynamic environmental context (device health, geolocation, IP risk reputation).

---

## Phase 2: SIEM Integration & Cloud Infrastructure (v2.0 - Q2 2027)

- [ ] **SIEM Log Forwarders:** Out-of-the-box Syslog, CEF (Common Event Format), and JSON telemetry streaming to:
  - Splunk Enterprise Security
  - IBM QRadar SIEM
  - Microsoft Sentinel
- [ ] **Terraform & Helm Deployments:** Pre-packaged Infrastructure-as-Code (IaC) modules for one-click deployment on:
  - AWS (ECS Fargate + RDS PostgreSQL)
  - Azure (Azure Container Apps + Azure Database for PostgreSQL)
  - Kubernetes (K8s DaemonSet for host peripheral auditing)

---

## Phase 3: Advanced AI & Privacy Enhancing Tech (v2.5 - Q3 2027)

- [ ] **Federated Learning (FL):** Decentralized model training allowing multi-branch enterprise organizations to train shared threat detection weights without transmitting raw behavioral logs off-premise.
- [ ] **GenAI SOC Copilot / LLM Security Assistant:** Natural language incident investigation interface enabling security analysts to query complex exfiltration trails using plain English.
- [ ] **Self-Supervised Autoencoder Anomaly Detection:** Deep learning autoencoders for zero-shot detection of novel, previously unseen insider exfiltration vectors.

---

## Submitting Roadmap Proposals

Have an idea or need an integration for your security stack? Please open a feature proposal on GitHub or submit a Pull Request following our [Contributing Guide](CONTRIBUTING.md).
