# Auti AIgnosis — Deployment Governance Rules (DEPLOYMENT_RULES.md)

> **CORE PRINCIPLE**  
> Clinical healthcare platforms must follow a strict, gated deployment pipeline. Code must never be promoted directly from local development to production.

---

## 1. Staged Deployment Gates

```
Development
     ↓ (Local linting, type checks, unit tests)
Testing
     ↓ (Pytest suite, ML validation, frontend build)
Security Review
     ↓ (Dependency vulnerability scan, secret audit, IDOR checks)
Staging
     ↓ (Pre-production smoke testing, role switching verification)
Final Verification
     ↓ (Administrator sign-off)
Production
```

---

## 2. Production Environment Requirements
1. **Transport Encryption**:
   - Enforce HTTPS across all domain endpoints with TLS 1.3. Plain HTTP requests must return 301 Permanent Redirect to HTTPS.
2. **Environment Variable Isolation**:
   - Production secrets (`SECRET_KEY`, `DATABASE_URL`, SMS gateway tokens) must be injected via secure secret managers (e.g., AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault).
   - `.env` files must NEVER be copied into container images or checked into source control.
3. **Database Network Isolation**:
   - Database instances must be hosted in private VPC subnets without public internet IPs.
   - Connections accepted solely from authorized application worker instances via security groups.
4. **Health & Liveness Monitoring**:
   - Container orchestrators (Docker, Kubernetes) must monitor `/api/health`.
   - Health check probes must verify database connectivity and ML model availability.

---

## 3. Zero-Downtime & Rollback Strategy
1. **Blue/Green or Rolling Deployments**:
   - Deploy new versions alongside active instances; switch traffic only after health checks report 200 OK.
2. **Automated Rollback**:
   - If health check failures or error rates exceed 1% within 5 minutes of release, automatically revert traffic to the previous known good deployment.
3. **Pre-Deployment Migrations**:
   - Database schema migrations must be backward-compatible with the immediately preceding application version.
