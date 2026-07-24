# API Standards

## Document Governance

This document defines the mandatory Application Programming Interface (API) engineering standards for the DairySphere PWA SaaS platform. It is strictly governed by `docs/01_PROJECT_CONSTITUTION.md` and `docs/00_AI_IMPLEMENTATION_PROTOCOL.md`.

---

# Purpose

This document establishes the permanent standards for designing, building, securing, and maintaining HTTP APIs across the DairySphere platform. Adherence to these standards guarantees consistent API behavior, strict multi-tenant security, predictable error handling, and robust integration contracts across all present and future enterprise modules.

---

# API Design Philosophy

APIs in DairySphere serve as the secure, authoritative interface between presentation clients, external integration boundaries, and core business services. API design prioritizes predictability, explicit type safety, transactional integrity, strict input validation, and non-revealing error handling over developer shorthand or implicit behavior.

---

# REST Design Principles

- **Resource-Oriented Architecture**: APIs must be structured around identifiable business resources rather than arbitrary function calls.
- **Standard HTTP Verbs**: Standard HTTP methods must be used according to their established semantic meanings:
  - `GET`: Retrieve resource representations (safe, idempotent).
  - `POST`: Create new resources or execute state transitions (non-idempotent).
  - `PUT`: Replace or update complete resource representations (idempotent).
  - `PATCH`: Perform partial resource updates.
  - `DELETE`: Remove resources or mark them as inactive (idempotent).
- **Stateless Execution**: Each API request must contain all context and authorization metadata required for execution without relying on server-side HTTP session state.

---

# URI Naming Standards

- **Lowercase and Hyphenated**: All URI paths must use lowercase letters with hyphens (`kebab-case`) separating words.
- **Plural Nouns for Collections**: Resource paths must use plural nouns to represent entity collections.
- **Hierarchical Nesting**: Nested resource URIs must reflect logical ownership relationships (e.g., `/api/v1/parents/{parentId}/children`).
- **No Verbs in URIs**: Resource endpoints must not contain verbs; action semantics are conveyed strictly via HTTP methods.

---

# API Versioning Standards

- **Explicit Path Versioning**: All public and internal API endpoints must include an explicit major version prefix in the URI path (e.g., `/api/v1/...`).
- **Non-Breaking Updates**: Minor additions (such as adding optional fields to response payloads) do not require a major version bump.
- **Major Version Isolation**: Breaking changes (such as field removals or altered data types) mandate a new major version path.

---

# Request Standards

- **Content-Type Specification**: Requests with body payloads must specify `Content-Type: application/json`.
- **UTF-8 Encoding**: All text data transmitted in request payloads must be UTF-8 encoded.
- **Explicit Payload Boundaries**: Request payloads must include only attributes defined in the API contract. Unrecognized or unexpected payload attributes must be rejected or stripped during validation.

---

# Response Standards

- **Standard Content-Type**: All API responses must return `Content-Type: application/json`.
- **Standard JSON Envelope**: API responses must adhere to a consistent root JSON envelope structure containing metadata and payload data attributes.
- **Predictable Null Handling**: Attributes with null values must be explicitly present or consistently omitted according to contract specifications.

---

# HTTP Status Code Standards

APIs must return accurate, standardized HTTP status codes reflecting request execution outcomes:

- `200 OK`: Successful retrieval or synchronous processing update.
- `201 Created`: Successful creation of a new resource.
- `204 No Content`: Successful execution with no return payload.
- `400 Bad Request`: Client input validation failure or malformed request payload.
- `401 Unauthorized`: Missing or invalid authentication credentials.
- `403 Forbidden`: Authenticated user lacks permission for the requested resource or tenant context.
- `404 Not Found`: Target resource or endpoint does not exist.
- `409 Conflict`: Request conflicts with current database state or unique constraints.
- `422 Unprocessable Entity`: Payload syntax is valid, but domain business rules were violated.
- `429 Too Many Requests`: Rate limit threshold exceeded.
- `500 Internal Server Error`: Unhandled server-side execution exception.

---

# Error Response Standards

- **Uniform Error Envelope**: All error responses (`4xx` and `5xx`) must return a standardized JSON error structure.
- **Error Attributes**: Error envelopes must include a high-level error code, a human-readable message, a unique request identifier, and an optional array of field-level validation errors.
- **Sanitized Messages**: Error messages returned to clients must never reveal database schemas, internal file paths, or system stack traces.

---

# Validation Standards

- **Mandatory Entry Point Validation**: API controllers must validate incoming request parameters, query strings, and body payloads before executing business logic.
- **Schema-Based Validation**: Payload validation must enforce strict data types, field presence, string length limits, numeric ranges, and format patterns.
- **Detailed Validation Feedback**: When validation fails, the response must identify the specific fields and validation rules that were violated.

---

# Authentication Standards

- **Token-Based Authentication**: API access requires a cryptographically verified bearer token or credential provided in the `Authorization` HTTP header.
- **Rejection of Unauthenticated Calls**: Endpoints requiring authentication must reject unauthenticated requests immediately with `401 Unauthorized`.

---

# Authorization Standards

- **Role and Permission Checks**: Every API endpoint must evaluate the caller's authorized permissions against the requested resource capability.
- **Tenant Context Verification**: Authorization middleware must verify that the requested resource belongs strictly to the caller's active tenant context.

---

# Pagination Standards

- **Mandatory Bounding**: All collection endpoints retrieving multiple records must enforce pagination. Unbounded queries are prohibited.
- **Standard Pagination Parameters**: Collection endpoints must accept standard query parameters for page offset/cursor and page size limits.
- **Pagination Metadata**: Response envelopes for paginated collections must include total record counts, page size, current page, and navigation indicators.

---

# Filtering Standards

- **Query-Based Filtering**: Collection filtering must be passed via explicit URL query parameters.
- **Exact & Range Match Standards**: Filters must support explicit equality and range comparison operators where domain requirements dictate.
- **Sanitized Parameter Parsing**: Filter keys and values must be strictly validated against allowed filter fields to prevent SQL injection or unindexed query execution.

---

# Sorting Standards

- **Explicit Sort Parameters**: Collection endpoints must accept a standard `sort` query parameter specifying target fields and order directions (e.g., ascending/descending).
- **Allowed Sort Whitelist**: Sorting is restricted exclusively to pre-indexed attributes defined in a domain whitelist.
- **Deterministic Default Sorting**: When no sort parameter is provided, endpoints must apply a deterministic default sort order.

---

# Search Standards

- **Parameter-Driven Search**: Search queries must be passed via standard `q` or `search` query parameters.
- **Input Sanitization**: Search terms must be sanitized to escape control characters before executing database queries.
- **Bounded Search Results**: Search endpoints must apply maximum result limits to maintain response time SLA limits.

---

# File Upload Standards

Pending Owner Specification

---

# Date & Time Standards

- **ISO-8601 UTC Format**: All dates, times, and timestamps exchanged via API requests and responses must use ISO-8601 formatting in UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **Date-Only Fields**: Calendar dates without time components must use standard `YYYY-MM-DD` formatting.

---

# Financial Data Standards

- **Fixed-Point Numeric Representation**: Monetary values and financial quantities must be transmitted as exact fixed-point numbers or numeric strings to prevent floating-point rounding errors.
- **Currency Indication**: Monetary representations must include or link to an explicit currency code.
- **Immutability Protection**: APIs must prohibit destructive updates or deletions of committed financial transaction endpoints.

---

# Idempotency Standards

- **Safe Verbs**: `GET`, `HEAD`, `OPTIONS`, `PUT`, and `DELETE` requests must be implemented to behave idempotently.
- **Idempotency Keys**: Critical state-altering `POST` endpoints (such as payment processing or ledger posting) must support unique idempotency keys in request headers to prevent duplicate execution upon retry.

---

# Transaction Standards

- **Atomic API Operations**: API endpoints that modify multiple database entities must execute entirely within an atomic database transaction.
- **Rollback on Failure**: Any failure during API handler execution must trigger a complete transaction rollback, ensuring zero partial state persistence.

---

# Performance Standards

- **Response Time SLAs**: API endpoints must be optimized to respond within acceptable latency boundaries under normal operational load.
- **Payload Minimization**: Responses must include only required attributes; clients must not be overburdened with unrequested domain metadata.
- **Gzip/Brotli Compression**: API servers must support HTTP payload compression for JSON responses exceeding minimal size thresholds.

---

# Rate Limiting Standards

Pending Owner Specification

---

# Logging Standards

- **Request & Response Correlation**: Every API request must be assigned or passed a unique Correlation/Request ID that persists across internal service and log entries.
- **Structured Log Generation**: API access logs must capture HTTP method, URI path, status code, execution duration, tenant ID, user ID, and request ID in structured JSON format.
- **Sensitive Data Masking**: Authentication credentials, secrets, tokens, and sensitive PII must be masked automatically in API logs.

---

# API Documentation Standards

- **Machine-Readable Specifications**: API contracts must be documented using standardized, machine-readable specifications (e.g., OpenAPI / Swagger).
- **Explicit Schema Declarations**: Documentation must specify all request parameters, payload schemas, headers, status codes, and error envelopes for every endpoint.

---

# API Testing Standards

Pending Owner Specification

---

# Deprecation Standards

- **Deprecation Header Notice**: Endpoints slated for retirement must return standard HTTP deprecation headers (`Deprecation: true`) and sunset timelines.
- **Advance Notice**: API endpoints must not be removed without prior deprecation notice periods and migration paths.

---

# Backward Compatibility Standards

- **Non-Destructive Changes**: Fields must not be removed or renamed in active API versions.
- **Additive Evolution**: New attributes added to existing response contracts must be optional or additive to maintain compatibility with existing client consumers.

---

# Future API Principles

- **Extensibility**: API standards must accommodate future enterprise modules cleanly without altering core routing conventions or error envelopes.
- **Contract Integrity**: Every future module API must pass automated validation checks against these standards before deployment.
