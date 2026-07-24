# DairySphere Project Constitution

## Document Purpose

This document defines the highest-level governing principles, policies, architectures, and standards for the DairySphere project. It serves as the supreme authority for all current and future architectural, database, software, quality, and governance decisions across the entire project lifecycle.

---

## Project Identity

Project Name: DairySphere  
Application Type: Production-Ready Progressive Web Application (PWA)  
Project Category: Professional Dairy Management SaaS ERP  

This project is intended for real business operations and production use.

This project is NOT:
- Demo
- Prototype
- Tutorial
- Boilerplate
- Practice Project
- Sample Project
- MVP

---

## Vision

To build a production-grade, highly secure, scalable, and modular desktop-first Progressive Web Application SaaS ERP for enterprise dairy operations, maintaining zero-compromise data integrity, auditability, and financial protection.

---

## Mission

To deliver a robust, maintainable, and reliable enterprise software platform for dairy management that complies strictly with approved business specifications, preserves historical business and financial data, and eliminates shortcuts, workarounds, or temporary implementations.

---

## Business Objectives

Pending Owner Specification

---

## Project Scope

The approved scope of DairySphere is strictly limited to requirements explicitly requested and approved by the project owner. Every feature, module, workflow, and rule must trace directly to approved documentation.

---

## Out Of Scope

- Unapproved or invented modules, features, fields, settings, workflows, calculations, or reports.
- Demo data, mock data, fake users, sample transactions, or placeholder implementations.
- Third-party APIs, external SaaS, or third-party business service integrations unless explicitly requested and approved by the project owner.
- Temporary fixes, workarounds, shortcuts, or bypasses of system validations.

---

## Core Principles

- Correctness over speed.
- Protection of existing functionality.
- Uncompromising database and data integrity.
- Total preservation of financial and historical data.
- Strict modularity and consistency across the entire system.
- Zero tolerance for temporary fixes, placeholders, or fake implementations.

---

## Development Principles

- Production-ready standards for every line of code.
- Read and analyze existing codebase and dependencies before modifying any code.
- Never rewrite working code without explicit authorization.
- Modify only necessary files within approved task boundaries.
- Maintain full compatibility with existing modules and verify absence of regressions.

---

## Documentation Principles

- Comprehensive, accurate, and up-to-date technical documentation.
- All documentation governed strictly by this Constitution and `docs/00_AI_IMPLEMENTATION_PROTOCOL.md`.
- Clear marking of unspecified business details with `Pending Owner Specification`.
- No assumptions, guesswork, or invented industry defaults in technical documents.

---

## Requirement Management Policy

Only requirements explicitly approved by the project owner are valid.

Never invent:
- Modules
- Features
- Fields
- Settings
- Workflows
- Business Rules
- Calculations
- Reports
- Relationships
- Permissions
- Screens
- Buttons
- Validations

If information is missing, stop, ask, and mark with `Pending Owner Specification`.

---

## Change Management Policy

- Every change must be planned, analyzed for dependencies, and evaluated for regression impact before execution.
- No automatic continuation to subsequent development phases or tasks without explicit owner review and approval.
- Any change affecting existing modules or schemas requires prior approval and clear impact reporting.

---

## Database Philosophy

Database integrity has the highest priority.
- Never redesign existing database structures without authorization.
- Never break table relationships or foreign keys.
- Never lose historical business records.
- Preserve transactional integrity and atomicity across all operations.
- Non-destructive data policy: preserve historical records permanently.

---

## Financial Data Philosophy

Financial history is immutable and permanently protected.
- Every financial entry must be transaction-safe and fully auditable.
- Financial records must never be deleted, overwritten, or modified post-commit.
- Double-entry precision and ledger integrity must be strictly enforced.

---

## Security Philosophy

- Production-grade access control, role permissions, and data isolation.
- Complete auditability across all administrative and operational actions.
- No hardcoded secrets, bypassable checks, or silenced error logs.

---

## Architecture Philosophy

- Modular, decoupled, desktop-first Progressive Web Application (PWA) SaaS architecture.
- Clean separation between frontend layout shell, state management, and backend services.
- Single-port container reverse proxy routing on port 3000.
- High scalability without unnecessary architectural complexity.

---

## User Experience Philosophy

- Desktop-first professional ERP design for data-dense enterprise workflows.
- Responsive mobile browser support for operational input and viewing.
- Consistent typography, spacing, navigation framing, and layout rhythm without visual cliches or unrequested clutter.

---

## Quality Standards

- 100% production-quality implementation.
- Zero console errors, unhandled exceptions, or silenced warnings.
- Complete adherence to linting, build verification, and strict type safety.

---

## Coding Philosophy

- Clear, readable, maintainable TypeScript code.
- Explicit imports, top-level type definitions, and standard enum declarations.
- Modular component structure preventing monolithic, oversized files.
- No duplicate logic, parallel implementations, or bypassable validations.

---

## Validation Philosophy

- Strict input validation on both client and server boundaries.
- Clear, explicit error messages explaining failure causes without hiding root causes.
- Never suppress, silence, or bypass validation failures.

---

## Testing Philosophy

Pending Owner Specification

---

## Deployment Philosophy

- Standalone production build compatibility (`npm run build`).
- Single entry point server executing cleanly on port 3000.
- Strict environment variable declaration via `.env.example`.

---

## Long-Term Maintenance Philosophy

- Architected for multi-year enterprise lifecycle.
- Backward compatibility and structural stability for all existing modules.
- Clean documentation history and strict versioning of system specifications.

---

## AI Usage Policy

- The AI operates strictly as the permanent Lead Software Architect, Database Architect, Backend Engineer, Frontend Engineer, PWA Engineer, QA Engineer, Security Reviewer, and Code Reviewer.
- Mandatory compliance with `docs/00_AI_IMPLEMENTATION_PROTOCOL.md` on every turn.
- The AI is strictly forbidden from making assumptions, inventing features, or creating mock/demo data.

---

## Project Governance

- This Constitution is the supreme authority of the DairySphere project.
- If any prompt, instruction, or proposed code conflicts with this document, stop and report the conflict immediately.
- The project owner holds sole authority for requirement approvals and scope modifications.

---

## Definition Of Done

A task is considered complete ONLY when:
1. Every requested requirement in the approved prompt is 100% satisfied.
2. No unapproved features, code, or documentation were added.
3. Code compiles cleanly without errors or warnings.
4. Data integrity, financial rules, and module compatibility are verified.
5. Work is reported clearly, and execution stops immediately without auto-advancing to future tasks.

---

## Final Authority

This document is the highest authority of the DairySphere project. No instruction, implementation, or shortcut may violate or bypass this Constitution.
