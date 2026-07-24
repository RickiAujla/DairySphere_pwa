# Coding Standards

## Document Governance

This document defines the mandatory software engineering and coding standards for the DairySphere PWA SaaS platform. It is strictly governed by `docs/01_PROJECT_CONSTITUTION.md` and `docs/00_AI_IMPLEMENTATION_PROTOCOL.md`.

---

# Purpose

This document provides clear, non-negotiable guidelines for writing, structuring, and maintaining source code across all layers of the DairySphere PWA SaaS codebase. Every engineer and AI system contributing to this project must adhere strictly to these standards to ensure long-term maintainability, type safety, security, and performance.

---

# Coding Philosophy

Code in DairySphere is written for real, production-grade enterprise operations. Correctness, readability, type safety, and architectural consistency take absolute precedence over implementation speed or clever tricks. Code must be explicit, predictable, and robust.

---

# Clean Code Principles

- **Self-Documenting Names**: Variable, function, class, and component names must clearly convey intent without requiring explanatory comments for basic operations.
- **Small, Single-Purpose Functions**: Functions must be short, focused on a single logical task, and operate at a consistent level of abstraction.
- **No Unused Code**: Dead code, commented-out logic, unused imports, and unreferenced variables are strictly forbidden in production commits.
- **Explicit Conditionals**: Avoid obscure implicit coercions; write explicit, deterministic boolean evaluations.

---

# SOLID Principles

- **Single Responsibility Principle (SRP)**: Every module, class, service, or component must have one, and only one, reason to change.
- **Open/Closed Principle (OCP)**: Code modules must be open for extension via composition or abstraction, but closed for modification.
- **Liskov Substitution Principle (LSP)**: Subtypes and interface implementations must be fully substitutable for their base types without altering system correctness.
- **Interface Segregation Principle (ISP)**: Clients must not be forced to depend on interfaces containing methods they do not use.
- **Dependency Inversion Principle (DIP)**: High-level policy modules must not depend on low-level implementation details; both must depend on abstractions.

---

# DRY Principles

- **Don't Repeat Yourself**: Business logic, domain rules, validation formulas, and data transformations must exist in exactly one authoritative place.
- **Avoid Premature Abstraction**: Shared utilities should only be created when duplicate logic is genuinely identical across multiple domain contexts, not merely similar in visual representation.

---

# KISS Principles

- **Keep It Simple, Stupid**: Prefer clean, simple, readable designs over complex, overly generalized abstractions.
- **No Over-Engineering**: Build strictly what is required by approved specifications without adding speculative complexity or unrequested features.

---

# Project Structure Standards

- **Domain-Driven Organization**: Feature files are grouped logically by domain module or operational context.
- **Clean Architectural Separation**: Clear boundaries exist between presentation components, state management hooks, business services, and data access layers.
- **Flat Depth**: Avoid deeply nested folder structures (max 3-4 directory levels beneath `src/`).

---

# Folder Organization Standards

- `src/components`: Generic, domain-independent reusable visual UI components.
- `src/modules`: Feature-specific modules containing views, domain components, services, and hooks.
- `src/lib` or `src/utils`: Pure utility functions, helper constants, and shared libraries.
- `src/types`: Shared TypeScript interface definitions, enums, and type aliases.

---

# File Naming Standards

- **TypeScript Source Files**: Use `camelCase` for utilities, services, and helper modules (e.g., `formatCurrency.ts`, `authService.ts`).
- **React Components**: Use `PascalCase` for React component files (e.g., `Button.tsx`, `HeaderDrawer.tsx`).
- **Type Definition Files**: Use `camelCase` ending with `.types.ts` or centralized inside `types.ts`.
- **CSS / Style Files**: Global styles defined strictly in `index.css` via Tailwind CSS; no modular `.css` or `.module.css` files.

---

# Variable Naming Standards

- **Descriptive Nouns**: Variables must use clear `camelCase` nouns or adjectives (e.g., `activeTenantId`, `userPermissions`).
- **Boolean Variables**: Booleans must be prefixed with indicator verbs (e.g., `isLoading`, `hasPermission`, `canSubmit`).
- **Constants**: Global or module-level immutable constants use `UPPER_SNAKE_CASE` (e.g., `MAX_PAGINATION_LIMIT`).

---

# Function Naming Standards

- **Verb-Noun Construction**: Function names must begin with an explicit action verb describing what the function does (e.g., `calculateTotalYield`, `validateTenantContext`, `fetchUserProfile`).
- **Event Handlers**: React event handler props use `onAction` (e.g., `onSubmit`, `onToggleDrawer`); internal handler functions use `handleAction` (e.g., `handleSubmit`, `handleToggleDrawer`).

---

# Component Naming Standards

- **PascalCase**: All React component functions and export identifiers must use `PascalCase`.
- **Descriptive Context**: Component names must convey function and visual role (e.g., `TenantSelectorModal`, `MilkYieldDataTable`).

---

# Module Naming Standards

- **Singular/Plural Consistency**: Module directories use lowercase `kebab-case` or `camelCase` representing the domain feature (e.g., `milk-production`, `quality-control`).

---

# TypeScript Standards

- **Strict Type Checking**: TypeScript `strict` mode is enabled. The `any` type is strictly forbidden.
- **Top-Level Imports**: All `import` statements must reside at the top of the file.
- **Explicit Imports**: Use named imports exclusively; wildcard (`import *`) imports are prohibited unless required by third-party library boundaries.
- **Standard Enums**: Use standard `enum` declarations for fixed value enumerations; `const enum` is strictly forbidden.
- **No Type Import of Enums**: Enum values used at runtime must not be imported using `import type`.

---

# React Standards

- **Functional Components**: All React components must be written as functional components using standard React hooks.
- **Hook Rules**: Adhere strictly to the Rules of Hooks. Hooks must only be called at the top level of React functions.
- **Stable Dependencies**: `useEffect` dependency arrays must only contain primitive values or stabilized references. Never update state unconditionally inside `useEffect` bodies to avoid infinite re-render loops.
- **No Direct DOM Manipulation**: Use React state and refs instead of direct DOM manipulation.

---

# Backend Standards

- **Stateless Execution**: Server request handlers and service layers must remain stateless to support scalable execution.
- **Single Port Binding**: Express/Node server must bind strictly to host `0.0.0.0` and port `3000`.
- **Middleware Flow**: Pass control cleanly through middleware chains (`req`, `res`, `next`) with explicit error propagation.

---

# Error Handling Standards

- **No Error Suppression**: Silencing, ignoring, or swallowing errors (`catch (e) {}`) is strictly prohibited.
- **Root Cause Preservation**: Caught errors must be logged with context or wrapped in domain-specific exception types preserving original cause stack traces.
- **User-Safe Messaging**: Internal exceptions are caught and mapped to safe, standardized, user-friendly error envelopes before reaching client callers.

---

# Validation Standards

- **Dual-Boundary Validation**: Validate inputs at client presentation boundaries for UX and mandate strict server-side schema validation before processing.
- **Fail Fast**: Reject invalid payloads immediately before executing business logic or hitting database layers.

---

# Logging Standards

- **Structured Output**: System logs use structured formats capturing timestamps (UTC), log levels, request IDs, user IDs, and tenant context.
- **Sanitization**: Passwords, API tokens, cryptographic keys, and sensitive personally identifiable information (PII) must be scrubbed automatically from logs.

---

# Database Access Standards

- **Parameterized Queries**: All database queries must use parameterized inputs to prevent SQL injection vulnerabilities.
- **Explicit Projection**: Queries must project specific required attributes rather than selecting wildcards (`SELECT *`).
- **Transactional Atomicity**: Multi-record mutations must execute within explicit ACID transaction blocks.

---

# API Layer Standards

- **RESTful Endpoints**: API routes follow consistent RESTful naming conventions and standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`).
- **Standard Envelopes**: Responses adhere to standard JSON envelopes containing status, metadata, data payloads, or structured error details.

---

# Business Logic Standards

- **Isolation in Services**: Business rules, formulas, and state transition logic must reside in pure service layers, completely decoupled from HTTP controllers or React components.
- **Determinism**: Business logic functions must produce deterministic results for identical inputs.

---

# Service Layer Standards

- **Stateless Service Class/Functions**: Services expose clean async methods handling transaction boundaries, domain rules, and repository coordination.
- **Interface Contracts**: Services operate against defined domain interfaces for predictability and testability.

---

# Repository Layer Standards

- **Data Abstraction**: Repositories encapsulate database queries, object mapping, and data access mechanics away from business services.
- **No Leakage**: Database-specific query syntax must not leak into service or presentation layers.

---

# Dependency Injection Standards

- **Loose Coupling**: Higher-level services receive required data access or utility dependencies via function parameters or constructor injection rather than direct hardcoding.

---

# State Management Standards

- **Single Source of Truth**: Global state (auth, active tenant, layout) is centralized; view-specific state remains local to the rendering component.
- **Immutability**: State updates must be immutable; direct mutation of state objects is strictly prohibited.

---

# Reusable Component Standards

- **Visual Independence**: Reusable primitives in `src/components` must be domain-agnostic, accepting styling and callbacks purely via props.
- **Accessibility**: Reusable controls must support keyboard navigation, ARIA attributes, and WCAG AA color contrast standards.

---

# Performance Standards

- **Code Splitting**: Route-level components must be lazy-loaded to optimize initial bundle payloads.
- **Bounded Collections**: All query results and UI lists must enforce pagination or rendering virtualization.
- **No Unnecessary Re-Renders**: Use React.memo or stable callbacks where heavy visual subtrees depend on unchanged props.

---

# Code Documentation Standards

- **Self-Documenting Code First**: Write clear code rather than relying on comments to explain confusing logic.
- **JSDoc for Public APIs**: Use JSDoc comments on exported shared utilities, service contracts, and complex domain interfaces.

---

# Testing Standards

Pending Owner Specification

---

# Refactoring Standards

- **Behavior Preservation**: Refactoring must improve internal code structure without altering external function, behavior, or API contracts.
- **Regression Verification**: Every refactoring pass must be validated against existing system functionality to verify zero regressions.

---

# Deprecation Standards

- **Explicit Tagging**: Obsolete functions or interfaces must be marked with `@deprecated` comments indicating the recommended replacement.
- **Non-Breaking Transition**: Deprecated code must not be deleted until all dependent modules have been safely migrated and verified.

---

# Code Review Standards

- **Strict Inspection**: Every pull request or code addition must be reviewed for adherence to this document, `docs/01_PROJECT_CONSTITUTION.md`, and security standards.
- **Zero Warnings**: Code must compile cleanly with zero TypeScript errors or linter warnings before merge approval.

---

# Definition of Done

A task or feature is considered complete ONLY when:
1. Every instruction in the approved prompt is 100% satisfied.
2. Code strictly complies with this document and all project governance files.
3. The application builds cleanly (`npm run build`) without errors or warnings.
4. No unapproved features, placeholder codes, or demo data were introduced.
5. Work is reported clearly and execution stops immediately.
