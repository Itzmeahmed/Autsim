# Auti AIgnosis – Design Requirements Document (DRD)

## 1. Design Philosophy & Healthcare Tone
The visual interface for **Auti AIgnosis** is designed with a patient-first, calming, clinical healthcare ethos:
- **Cleanliness & White Space**: Primary `#FFFFFF` canvas with subtle slate borders (`border-slate-200`) and soft shadows (`shadow-xs`).
- **Zero Distraction**: Eliminates dark gaming styles, crypto themes, and generic AI templates in favor of reassuring, accessible clinical typography.
- **Cognitive Ease**: Large touch targets, clear visual indication badges, progress metrics, and minimal friction for parents navigating stressful assessments.

---

## 2. Color Palette & Design Tokens

| Token | Hex Value | Semantic Usage |
|---|---|---|
| Canvas Background | `#FFFFFF` / `#F8FAFC` | Primary screens and dashboard canvas |
| Primary Healthcare Teal | `#0F766E` / `#0D9488` | Primary actions, CTAs, navigation highlights |
| Dark Neutral Text | `#0F172A` / `#1E293B` | High-contrast readable headings and labels |
| Secondary Text | `#64748B` | Supporting descriptions and metadata |
| Higher Indication Warning | `#B45309` / `#FEF3C7` | Cautionary screening indication banner |
| Lower Indication Success | `#047857` / `#D1FAE5` | Typical development screening indicator |
| Neutral Borders | `#E2E8F0` | Card borders and input boundaries |

---

## 3. Responsive Layout Guidelines
- **Mobile Devices ($\le 768\text{px}$)**:
  - Sticky bottom navigation bar (`BottomNav.tsx`) for primary actions.
  - Full-width step cards for the 20-item screening questionnaire.
  - Vertically stacked clinician cards with one-tap booking modals.
- **Tablet & Desktop ($\ge 1024\text{px}$)**:
  - Top navigation bar with quick role-switcher pill and language selector.
  - Multi-column dashboards for patient summaries and clinical queues.
  - Side-by-side screening comparison views for clinicians.
