# Auti AIgnosis — Code Quality Governance Rules (CODE_QUALITY_RULES.md)

> **CORE PRINCIPLE**  
> Clinical healthcare codebases require precision, readability, static type safety, and maintainability. Technical debt in medical software risks patient safety.

---

## 1. Backend Standards (Python 3.10+)
1. **Type Annotations**:
   - All function signatures, method parameters, and return types must include explicit PEP 484 type annotations.
   - Pydantic v2 models must be utilized for all external input/output schemas.
2. **Style & Linting**:
   - Code must conform to PEP 8 conventions.
   - Clean, modular file organization under `backend/app/` (`api/`, `core/`, `models/`, `schemas/`, `services/`, `ml/`).
3. **Docstring & Comment Integrity**:
   - All modules, classes, and public functions must feature descriptive docstrings explaining business rationale, parameters, return values, and clinical safety implications.
   - Preserve existing comments and docstrings unless explicitly refactoring behavior.

---

## 2. Frontend Standards (TypeScript & React)
1. **TypeScript Strict Mode**:
   - `tsconfig.json` must enforce strict typing (`"strict": true`).
   - The use of `any` is strictly discouraged; define explicit interfaces or types for all API payloads and component props.
2. **Component Architecture**:
   - Keep UI components focused and modular under `frontend/src/components/` and `frontend/src/pages/`.
   - Separate state management, UI presentation, and API networking logic.
3. **Localization Safety**:
   - Never hardcode user-facing strings; map all text through the localization dictionary (`i18n`) supporting English, Kannada, and Hindi.

---

## 3. Error Handling & Logging
1. **Never Swallow Exceptions**:
   - Bare `except:` clauses are prohibited. Catch specific exception classes (`ValueError`, `HTTPException`, `SQLAlchemyError`).
2. **Structured Logging**:
   - Use standardized log levels (`DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`).
   - Log actionable operational metadata without exposing patient personal data.
