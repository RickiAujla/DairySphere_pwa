# Database Standards

## Document Governance

This document defines the mandatory database engineering standards for the DairySphere PWA SaaS platform. It is governed strictly by `docs/01_PROJECT_CONSTITUTION.md` and `docs/00_AI_IMPLEMENTATION_PROTOCOL.md`.

---

# Database Philosophy

Database integrity is the highest priority of the DairySphere platform. The database serves as the single source of truth for all enterprise operational and financial data. Systems are designed to ensure data safety, consistency, durability, and strict transactional correctness over speed or implementation convenience.

---

# Database Design Principles

- **Strict Normalization**: Database entities must adhere to 3rd Normal Form (3NF) by default to prevent data redundancy and update anomalies, unless explicit owner-approved performance requirements justify controlled denormalization.
- **Relational Integrity**: All entity relationships must be explicitly enforced at the database level using relational constraints rather than relying solely on application-level logic.
- **Non-Destructive Persistence**: Operational and financial records are permanent. Deletion of historical records is prohibited unless mandated by explicit retention or compliance policies approved by the project owner.
- **ACID Compliance**: All multi-step mutations and financial state updates must execute within strict atomic, consistent, isolated, and durable transaction boundaries.

---

# Naming Standards

- **Consistency**: All database object identifiers must follow a uniform, lower-case, underscore-separated (snake_case) convention.
- **Pluralization**: Table names must use plural nouns representing collections of records.
- **Column Naming**: Columns must use singular, descriptive nouns or verbs indicating their exact function without ambiguous abbreviations.
- **Foreign Key Naming**: Foreign key columns must combine the singular target entity name and the target primary key attribute.
- **Constraint Naming**: Explicit, standardized prefixing must be applied to all constraint definitions (e.g., primary keys, foreign keys, unique indices, check constraints).

---

# Primary Key Standards

- **Surrogate Keys**: Every database table must possess a surrogate primary key column that uniquely identifies each record.
- **Uniqueness & Immutability**: Primary key values must be globally unique, immutable, non-null, and permanently assigned upon record creation.
- **No Natural Primary Keys**: Business identifiers or domain attributes (such as emails or codes) must not serve as primary keys; they must be implemented as unique constrained attributes.

---

# Foreign Key Standards

- **Explicit Enforcement**: Every child-to-parent relationship must be explicitly enforced through foreign key constraints at the database level.
- **Referential Actions**: Foreign key deletion and update rules must be declared explicitly (e.g., restricting deletion of parent records when active child records exist).
- **Index Alignment**: Foreign key columns must be indexed to maintain join efficiency and prevent table scans during relational queries.

---

# Relationship Standards

- **One-to-Many Relationships**: Represented via foreign key references placed in the child table.
- **Many-to-Many Relationships**: Represented exclusively through dedicated junction tables enforcing composite primary keys and foreign key constraints to both parent entities.
- **One-to-One Relationships**: Enforced via unique foreign key constraints linking dependent entity attributes to parent entities.

---

# Constraint Standards

- **Nullability Control**: Columns must be defined as non-null by default unless optional value states are explicitly required by approved domain rules.
- **Domain Value Validation**: Value boundaries, ranges, and state enumerations must be protected using check constraints at the database boundary.
- **Fail-Fast Defense**: Constraint violations must raise immediate database-level errors, blocking invalid mutations before persistence.

---

# Unique Constraint Standards

- **Business Identity Protection**: Natural identifiers and unique business attributes must be protected by unique constraints.
- **Composite Uniqueness**: Multi-column uniqueness rules (e.g., scope-bound codes or multi-attribute keys) must be enforced through composite unique constraints.
- **Tenant Scope Alignment**: Unique constraints in multi-tenant contexts must incorporate the tenant identifier attribute to prevent cross-tenant collisions.

---

# Indexing Standards

- **Query-Driven Design**: Indices must be created based on actual query patterns, filtering attributes, join conditions, and sorting directives.
- **Primary & Foreign Key Coverage**: All primary keys and foreign key columns must be indexed.
- **Index Minimization**: Unnecessary indices must be avoided to prevent write throughput degradation during insert, update, and delete operations.

---

# Transaction Standards

- **Atomic Boundaries**: Any operation modifying multiple tables or records must execute within an explicit database transaction block.
- **Isolation Levels**: Transactions must operate at isolation levels that prevent dirty reads, non-repeatable reads, and phantom reads for critical domain operations.
- **Error Rollback**: Any unhandled exception or constraint failure during transaction execution must trigger an immediate, complete rollback.

---

# Financial Data Standards

- **Immutability**: Financial records, ledger entries, and transactional balances are permanently immutable once committed.
- **Numeric Precision**: Financial amounts, quantities, and monetary balances must use exact fixed-point numeric types to eliminate rounding errors.
- **Audit Traceability**: Financial entries must maintain full audit linkage to originating operational events, user identifiers, and timestamp metadata.

---

# Historical Data Standards

- **Record Preservation**: Historical operational states must be preserved to support retroactive reporting, auditing, and compliance verification.
- **State Versioning**: Changes to stateful domain entities must preserve previous record versions or append historical change entries.
- **Non-Alteration**: Past operational records must not be updated or modified once finalized.

---

# Audit Data Standards

- **System-Wide Auditability**: Every mutation (creation, modification, status transition) must generate immutable audit metadata.
- **Mandatory Audit Attributes**: Audit records must capture created timestamp, created user identifier, updated timestamp, updated user identifier, and tenant context.
- **Append-Only Preservation**: Audit logs must be append-only and protected from modification or deletion.

---

# Soft Delete Standards

Pending Owner Specification

---

# Timestamp Standards

- **Timezone Uniformity**: All timestamp attributes must be recorded in Coordinated Universal Time (UTC) with timezone information.
- **Automatic Assignment**: Creation and update timestamps must be populated automatically by database defaults or system triggers.
- **ISO Standard Formatting**: Timestamp representations exchanged between database and application layers must adhere to standard ISO-8601 formatting.

---

# Multi Tenant Standards

- **Tenant Isolation**: Database entities containing tenant-specific operational data must include a mandatory tenant identifier column.
- **Query Scoping**: All queries, updates, and deletes must explicitly filter by tenant identifier to enforce absolute data isolation.
- **Constraint Boundaries**: Foreign key and unique constraints must preserve tenant scoping boundaries across all database objects.

---

# Performance Standards

- **Bounded Query Results**: Unbounded SELECT queries are strictly prohibited; all result sets must be constrained by explicit pagination or limit parameters.
- **N+1 Query Prevention**: Query structures must utilize explicit joins or eager batch fetching to eliminate N+1 query execution patterns.
- **Execution Plan Review**: Complex queries must be evaluated against database execution plans to verify proper index utilization and avoid full table scans.

---

# Query Standards

- **Parameterization**: All database queries must use parameterized inputs to prevent SQL injection vulnerabilities.
- **Explicit Projection**: Queries must project only required columns rather than selecting wildcards (`SELECT *`).
- **Deterministic Sorting**: Queries requiring ordered output must specify explicit, deterministic ORDER BY criteria.

---

# Migration Standards

- **Version-Controlled Schemas**: All database schema changes must be defined in immutable, version-controlled migration files.
- **Forward & Backward Compatibility**: Schema migrations must be tested to ensure non-breaking forward deployment and safe rollback capability.
- **Zero Data Loss**: Migrations modifying existing column structures or types must preserve existing production data without loss or corruption.

---

# Backup Philosophy

Pending Owner Specification

---

# Restore Philosophy

Pending Owner Specification

---

# Archiving Philosophy

Pending Owner Specification

---

# Data Integrity Standards

- **Database-Enforced Rules**: Data validity rules must be enforced at the database layer, ensuring integrity regardless of access channel.
- **Referential Completeness**: Orphaned records or dangling foreign references are strictly forbidden.
- **Data Type Strictness**: Column data types must strictly match domain semantics without loose text storage for structured types.

---

# Validation Standards

- **Dual-Layer Validation**: Database constraints serve as the final defense line, backing up application-level input validation.
- **Type & Boundary Checks**: Data values must be validated for type correctness, length, format, and numerical range prior to persistence.
- **Explicit Error Messages**: Failed database validations must produce identifiable constraint violation codes for clean application handling.

---

# Future Scalability Standards

- **Decoupled Domains**: Schema modules must remain logically decoupled to allow horizontal database partitioning or sharding if required in future phases.
- **Extensibility without Mutation**: Future capabilities must be accommodated by extending schemas with new tables or non-breaking attributes without altering existing table structures.
- **Stateless Application Coupling**: Database connections must be managed via efficient connection pools decoupled from stateless application server processes.
