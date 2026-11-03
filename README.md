# Identity & Access Management (IAM) Platform

A modular Identity and Access Management platform built with **Java 17,
Spring Boot, Spring Security, PostgreSQL, and React.js**. The project
focuses on secure authentication, authorization, token lifecycle
management, session control, and protection against common
authentication attacks.

## Overview

The platform provides **16 REST API endpoints** and **6+ security
capabilities** covering user management, authentication, authorization,
session management, and administrative operations.

### Key capabilities

-   **User management:** User registration and administrative user
    management.
-   **Authentication:** Login and logout flows with password hashing
    using BCrypt.
-   **JWT authentication:** Token generation and validation for
    protected API access.
-   **Refresh-token security:** Refresh-token rotation, hashed token
    storage, and replay/reuse detection.
-   **Session management:** Multiple login sessions and session
    revocation.
-   **Role-based access control (RBAC):** `USER`, `ADMIN`, and `AUDITOR`
    roles.
-   **Account lockout:** Exponential timed lockout after repeated failed
    login attempts, starting at 5 minutes and capped at 24 hours.
-   **API rate limiting:** Bucket4j with an in-memory
    `ConcurrentHashMap`-based bucket store, configured for 100 requests
    per minute.
-   **Account workflows:** Email verification and password recovery.
-   **Audit logging:** Records authentication-related events for
    traceability.

## Technology stack

  Area                  Technology
  --------------------- -------------------------------
  Language              Java 17
  Backend framework     Spring Boot 4.1.1
  Security              Spring Security
  Authentication        JSON Web Tokens (JWT)
  Password hashing      BCrypt
  Database              PostgreSQL
  Persistence           Spring Data JPA / Hibernate
  Database migrations   Flyway (V1--V4)
  Rate limiting         Bucket4j, `ConcurrentHashMap`
  Build tool            Maven
  Testing               JUnit, Mockito
  Frontend              React.js

## Architecture

``` text
React.js Frontend
       |
       v
Spring Boot REST API
       |
       +-- User Management
       +-- Authentication
       +-- JWT Authentication Filter
       +-- Role-Based Authorization
       +-- Refresh Token Management
       +-- Session Management
       +-- Account Lockout
       +-- API Rate Limiting
       +-- Audit Logging
       |
       v
PostgreSQL
       |
       +-- Users and Roles
       +-- User-Role Relationships
       +-- Refresh Tokens
       +-- Account Tokens
       +-- User Sessions
       +-- Login Attempts
       +-- Audit Events
```

The backend is organized as a modular Spring Boot application. Flyway
migrations manage database schema changes.

## Security design

### JWT and session validation

-   Authenticated requests use JWT bearer tokens.
-   JWTs are associated with a session identifier.
-   The authentication filter checks the associated session so revoked
    sessions cannot continue to authenticate.
-   Role-based authorization protects restricted resources.

### Refresh-token lifecycle

-   Refresh tokens are stored as hashes rather than in plaintext.
-   Refresh-token rotation replaces the previous token during refresh.
-   Reuse/replay detection helps identify attempts to reuse an
    already-rotated token.
-   Sessions can be revoked.

### Exponential account lockout

Repeated failed login attempts trigger progressively longer timed
lockouts.

  Lockout cycle       Duration
  --------------- ------------
  1                  5 minutes
  2                 10 minutes
  3                 20 minutes
  4                 40 minutes
  5                 80 minutes

The lockout duration is capped at **24 hours**. Successful
authentication resets the relevant failure/lockout counters according to
the implemented authentication flow.

### API rate limiting

The rate limiter uses Bucket4j and an in-memory `ConcurrentHashMap` to
maintain request buckets. The configured limit is **100 requests per
minute**.

> This is an in-memory, single-instance implementation. Bucket state is
> not shared between multiple application instances and is lost when the
> application restarts.

## Database

The application uses PostgreSQL. Flyway migration scripts are maintained
under the backend resources migration directory and currently include
migration versions **V1 through V4**.

The database includes entities/tables for core users and roles, refresh
tokens, account tokens, sessions, login attempts, and audit events.

## Getting started

### Prerequisites

-   Java 17
-   Maven
-   PostgreSQL
-   Node.js and npm (for the React frontend)

### 1. Clone the repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>
```

### 2. Create the PostgreSQL database

Create a database for the application. For example:

``` sql
CREATE DATABASE iam_db;
```

### 3. Configure the backend

Update the backend `application.properties` (or the corresponding
environment-specific configuration) with your local PostgreSQL
connection details.

Example:

``` properties
spring.datasource.url=jdbc:postgresql://localhost:5432/iam_db
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

Set the JWT signing secret and any other required application secrets
using your project's existing configuration keys. Do not commit real
passwords, signing secrets, or other credentials to Git.

Ensure Flyway is enabled and configured as in the project. The
application uses Flyway migrations to manage the schema.

### 4. Run the backend

From the backend project directory:

``` bash
./mvnw spring-boot:run
```

On Windows:

``` powershell
mvnw.cmd spring-boot:run
```

If the Maven wrapper is not included, use:

``` bash
mvn spring-boot:run
```

The backend is configured to run locally on port `8080` in the current
development setup.

### 5. Run the frontend

From the React frontend directory:

``` bash
npm install
npm start
```

Use the frontend's existing scripts if the project uses a different
development command (for example, `npm run dev`).

## Running tests

Run the backend test suite from the backend project directory:

``` bash
./mvnw test
```

On Windows:

``` powershell
mvnw.cmd test
```

The test suite includes coverage for authentication and security
behavior such as session validation, multiple login sessions,
refresh-token rotation and replay detection, and account lockout. Test
results may vary as the project evolves.

## API overview

The project contains **16 REST API endpoints** across its user,
authentication, session, and administrative functionality.

The exact endpoint paths, HTTP methods, request bodies, and response
formats should be taken from the current controller implementations. See
the backend controller classes for the authoritative API contract.

## Project status

-   Backend and React frontend developed for local execution.
-   PostgreSQL persistence and Flyway migrations V1--V4.
-   Security-focused unit and integration tests.
-   Not currently presented as a publicly deployed application; run
    locally using the instructions above.

## Future improvements

Potential next steps include:

-   Deploying the backend, frontend, and database.
-   Moving rate-limit state to a shared store if the application is
    scaled across multiple instances.
-   Adding API documentation with OpenAPI/Swagger.
-   Adding CI workflows for automated build and test execution.
-   Adding monitoring and operational metrics.

## Author

**Rajroushan Singh**
