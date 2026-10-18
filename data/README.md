# Auti AIgnosis — Dataset Documentation (data/README.md)

> **MANDATORY NOTICE**  
> This dataset is designated as a **screening classification dataset**. It is **NOT** a clinical diagnostic dataset. All records represent behavioral screening scores and demographic indicators for AI-assisted triage research.

---

## 1. Dataset Overview & Provenance
- **Dataset Title**: Auti AIgnosis Behavioral Screening Dataset
- **Version**: `v1.0.0`
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0) / Research & Clinical Demonstration License.
- **Reference Paradigms**:
  - Baron-Cohen et al., *Autism Spectrum Quotient (AQ-10) Child & Adolescent Instruments*
  - Allison et al., *Quantitative Checklist for Autism in Toddlers (Q-CHAT)*
  - Thabtah, F. (2017), *Autism Spectrum Disorder Screening Data for Children and Adolescents*, UCI Machine Learning Repository.

---

## 2. Target Variable Definition
- **Target Feature**: `screening_indication`
- **Data Type**: Integer (`0` or `1`)
- **Semantic Definition**:
  - `0`: **Lower Screening Indication** (Behavioral profile aligned with typical developmental milestones).
  - `1`: **Higher Screening Indication** (Behavioral indicators warrant clinical consultation with a developmental specialist).
- **Clinical Demarcation**:
  The target variable signifies a **screening indication only**. It does **NOT** represent a formal, definitive, or medical diagnosis of Autism Spectrum Disorder.

---

## 3. Feature Inventory & Clinical Domains
The dataset comprises 25 predictor variables across behavioral and demographic dimensions:

### 3.1 20-Item Questionnaire Features (`Q1` – `Q20`)
Scored as binary discrete indicators (`0` = milestone observed/typical, `1` = atypical or elevated screening indicator):
- **Communication Domain**:
  - `Q1`: Name response / orienting to verbal cues (Reverse scored)
  - `Q5`: Gestural communication (waving, pointing) (Reverse scored)
  - `Q9`: Repetitive vocalizations or echolalia
  - `Q13`: Conversational reciprocity and turn-taking (Reverse scored)
- **Social Interaction Domain**:
  - `Q2`: Direct eye contact reciprocity (Reverse scored)
  - `Q6`: Peer socialization affinity (Reverse scored)
  - `Q10`: Shared enjoyment and smiling reciprocity (Reverse scored)
  - `Q14`: Joint attention and following points (Reverse scored)
- **Sensory Responses Domain**:
  - `Q3`: Hypersensitivity to everyday noises
  - `Q7`: Tactile aversion to specific fabrics or food textures
  - `Q11`: Visual fascination with spinning objects or lights
  - `Q15`: Unusual pain or thermal sensitivity
- **Repetitive Behaviors Domain**:
  - `Q4`: Motor mannerisms (hand flapping, spinning, rocking)
  - `Q8`: Inflexible insistence on sameness or rigid routines
  - `Q12`: Intense, narrow preoccupation with specific topics
  - `Q16`: Lining up objects or repetitive ordering
- **Daily-Life & Motor Skills Domain**:
  - `Q17`: Age-appropriate independent self-dressing (Reverse scored)
  - `Q18`: Fine motor coordination (using utensils, pencil grasp) (Reverse scored)
  - `Q19`: Adaptation to sudden transitions (Reverse scored)
  - `Q20`: Environmental safety awareness (Reverse scored)

### 3.2 Demographic & Clinical Covariates
- `age`: Child age in years (Range: `2` – `16` years)
- `gender`: Biological sex / gender (`m`, `f`)
- `jaundice`: History of neonatal jaundice (`yes`, `no`)
- `family_history`: Documented family history of neurodevelopmental conditions (`yes`, `no`)
- `ethnicity`: Broad demographic background

---

## 4. Preprocessing & Leakage Prevention Pipeline
All preprocessing is executed via `ColumnTransformer` strictly within the training split:
```
Raw Dataset (1200 rows)
       ↓
Stratified Train/Test Split (80% Train: 960 rows | 20% Held-Out Test: 240 rows, seed=42)
       ↓
ColumnTransformer (Fit on Train ONLY):
├── Numerical ('age'): StandardScaler()
├── Categorical ('gender', 'jaundice', 'family_history', 'ethnicity'): OneHotEncoder(sparse=False)
└── Behavioral ('Q1'-'Q20'): Passthrough
       ↓
Preprocessed Outputs:
├── /data/processed/train_features.csv (960 rows)
└── /data/processed/test_features.csv (240 rows)
```

---

## 5. Statistical Profile & Class Balance
- **Total Records**: `1,200`
- **Class 0 (Lower Indication)**: `780` records (`65.0%`)
- **Class 1 (Higher Indication)**: `420` records (`35.0%`)
- **Missing Values**: `0` (100% complete)
- **Duplicate Records**: `0`

---

## 6. Known Limitations
1. **Screening Tool Scope**: This dataset models behavioral screening tools (AQ-10/Q-CHAT) and does not replace longitudinal clinical observations.
2. **Cultural & Linguistic Factors**: Behavioral manifestations of joint attention and eye contact can vary across cultural backgrounds; questions must be contextualized by the clinician.
3. **Age Range**: Validated primarily for children and adolescents aged 2 to 16. Not validated for adults or infants below 18 months.
