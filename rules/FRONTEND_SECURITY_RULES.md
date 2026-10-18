# Auti AIgnosis — Frontend Security Governance Rules (FRONTEND_SECURITY_RULES.md)

> **CORE PRINCIPLE**  
> The client-side single page application (SPA) executes in an untrusted runtime environment. Frontend access restrictions are strictly for user experience; **backend authorization is mandatory**.

---

## 1. Cross-Site Scripting (XSS) Prevention
1. **Raw HTML Rendering Forbidden**:
   - `dangerouslySetInnerHTML` is strictly prohibited throughout the React codebase.
   - All user inputs (caregiver names, child names, medical history notes, clinician notes) must be rendered as escaped text nodes.
2. **Dynamic URL Sanitization**:
   External links or redirection targets must be validated against an approved protocol scheme (`https://`). Disallow `javascript:` pseudo-protocols.
3. **Third-Party Script Quarantine**:
   Do not load unpinned, untrusted third-party CDN scripts or analytics trackers that could exfiltrate patient screening inputs.

---

## 2. Sensitive Storage & State Hygiene
1. **No PHI in Persistent Browser Storage**:
   - Never persist full screening questionnaire responses, medical notes, or clinical diagnoses in `localStorage` or `sessionStorage`.
   - Store access tokens in memory or standard scoped storage; clear all tokens immediately upon user logout.
2. **No Sensitive Data in URL Query Parameters**:
   - Never pass patient IDs, phone numbers, OTPs, or screening indications in URL query strings (e.g., `?phone=+919876543210` or `?result=High`).
   - Query strings are logged in browser histories, proxy caches, and referrer headers.
3. **No Console Logging of PHI**:
   Production frontend builds must strip `console.log` statements containing user objects, screening scores, or auth tokens.

---

## 3. Defense Against Client-Side Privilege Escalation
1. **Frontend Role Checks vs Backend Authority**:
   - Conditionally rendering clinician workspace tabs or administrator controls based on `user.role` provides navigation clarity, but is NEVER considered a security boundary.
   - Tampering with client memory or localStorage tokens must fail cleanly against the backend API with HTTP 403 Forbidden.
2. **Session Termination**:
   - Trigger comprehensive state reset on logout: clear cached patient records, clear tokens, and redirect to the landing page.

---

## 4. Accessibility & Multilingual Integrity
1. **WCAG 2.1 AA Compliance**:
   All interactive elements must support keyboard navigation, clear focus outlines, and appropriate ARIA attributes.
2. **Clinical Translation Fidelity**:
   Screening questionnaire statements in Kannada (ಕನ್ನಡ) and Hindi (हिन्दी) must maintain semantic clinical equivalence to validated AQ-10/Q-CHAT phrasing to prevent skewed user inputs.
