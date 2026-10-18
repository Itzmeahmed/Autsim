# Auti AIgnosis — Clinical Safety Governance Rules (CLINICAL_SAFETY_RULES.md)

> **STATUTORY CLINICAL SAFETY DIRECTIVE**  
> Auti AIgnosis is an **AI-assisted autism screening and clinical triage system**.  
> It does **NOT diagnose autism** or any developmental condition. A formal diagnosis can only be made through comprehensive clinical evaluation by licensed developmental pediatricians, child psychiatrists, or clinical psychologists using standardized multi-disciplinary diagnostic assessments (e.g., ADOS-2, ADI-R, CARS).

---

## 1. Absolute Clinical Prohibitions
Under no circumstances may any component of the system:
1. **Never Claim Diagnosis**: The platform must never state or imply:
   - *"The child has autism."*
   - *"You are diagnosed with Autism Spectrum Disorder."*
   - *"Autism confirmed."*
2. **Never Prescribe or Recommend Medication**: The AI model or interface must never recommend pharmacological interventions, dosages, or off-label pharmaceuticals.
3. **Never Direct Autonomous Therapy**: The AI must not prescribe rigid behavioral therapy schedules without human clinical oversight.
4. **Never Claim Mathematical Certainty**: Machine learning confidence probabilities must never be phrased as "100% certainty" or "clinical proof".
5. **Never Triage Acute Psychiatric or Physical Emergencies**: The platform is strictly for scheduled developmental screening.

---

## 2. Mandatory Statutory Clinical Notice
Every user-facing screening result view, PDF export, or clinical summary card MUST prominently display the following verbatim notice:

> **IMPORTANT CLINICAL NOTICE**  
> *"This screening result is for screening support and informational purposes only. It is not a medical diagnosis and should not replace evaluation by a qualified healthcare professional."*

The notice must:
- Appear with high visual contrast above the fold.
- Be rendered in the caregiver's selected language (English, Kannada, or Hindi).
- Be non-dismissible on the screening outcome summary.

---

## 3. Approved Clinical Terminology
The platform strictly mandates calibrated, non-alarmist terminology:

| Forbidden Phrase | Required Clinical Replacement |
|---|---|
| "Autism Positive" | "Higher Screening Indication" |
| "Autism Negative" / "Normal" | "Lower Screening Indication" |
| "Autism Probability / Score" | "Screening Indication Likelihood Score" |
| "Diagnosis Report" | "Developmental Screening Profile" |
| "Doctor's Assessment" | "Clinical Consultation Note" |

---

## 4. Emergency & Acute Crisis Escalation Protocol
If a parent or caregiver expresses acute distress, self-harm, aggression, or a severe medical condition in free-text fields or clinical notes:
1. The platform must display an immediate banner directing the caregiver to:
   - **Emergency Medical Services**: Dial `112` (India) / `911` (US) / `999` (UK)
   - **Mental Health & Crisis Helplines**: Tele-MANAS `14416` (India) or local emergency departments.
2. The AI must refrain from conversational speculation or algorithmic intervention during emergency situations.

---

## 5. Clinician-in-the-Loop Architecture
1. **Direct Bridge to Verified Specialists**:
   The AI screening output is merely the precursor to the core value of the platform: connecting parents to verified developmental pediatricians and child psychologists.
2. **Clinical Verification Gate**:
   Only clinicians whose medical registration and credentials have been verified by platform administrators may receive consultations and document observations.
3. **Clinical Autonomy**:
   Clinicians have complete autonomy to disagree with, contextualize, or overturn the AI screening indication based on their direct physical and behavioral examination of the child.
