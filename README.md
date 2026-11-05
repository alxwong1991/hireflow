# HireFlow

A job application web app where employees find jobs and employers manage listings
and applicants. Built as a personal learning project.

## Features

- Browse open jobs and company profiles without signing in.
- Register as an employee or employer, with role-specific profiles and workspaces.
- Create job listings, apply with a cover letter, and manage application statuses.
- Receive notifications for applications, status changes, and chat messages.
- Chat privately when an application reaches an eligible status.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Backend | Java 25, Spring Boot, Spring Data JPA |
| Database | PostgreSQL 16, Flyway |
| Local development | Podman Compose, Adminer |
| Testing | JUnit, Node.js test runner, Oxlint |

## Architecture

The React frontend communicates with the Spring Boot API. The API handles
authentication, application rules, and database access.

```text
React UI → Feature API → Shared HTTP client
                            ↓ REST / JSON
Spring Security → Controller → Service → Repository → PostgreSQL
```

- **Frontend:** feature modules own their pages, API calls, and types.
- **Backend:** feature-organized packages contain controllers, services,
  repositories, DTOs, and entities.
- **Database:** PostgreSQL stores application data; Flyway migrations run on
  backend startup.

### Project Structure

```text
backend/
  src/main/java/.../hireflow/  # Feature packages and API
  src/main/resources/          # Configuration and Flyway migrations
  src/test/                    # Backend integration tests
frontend/
  src/app/                     # App shell and routes
  src/features/                # Feature pages, APIs, and types
  src/lib/                     # Shared API client
  tests/                       # Frontend tests
docker-compose.yml             # Local PostgreSQL and Adminer
```

## Local Setup

### 1. Prerequisites

- Java 25 (LTS)
- Node.js 24 LTS and npm
- Podman with a Compose provider

### 2. Clone the repository

```bash
git clone https://github.com/alxwong1991/hireflow.git
cd hireflow
```

### 3. Start PostgreSQL

From the project root:

```bash
podman compose up -d postgres
```

The local database is `hireflow_db` on port `5432`, with the development
credentials `admin` / `admin`. Adminer is available at <http://localhost:8081>;
use `postgres` as its server name.

### 4. Run the backend

In a terminal:

```bash
cd backend
./mvnw spring-boot:run
```

The API runs at <http://localhost:8080>. Flyway applies migrations on startup.
The `GET /health` endpoint checks backend and database connectivity.

### 5. Run the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. By default, the frontend calls
`http://localhost:8080/api`. Set `VITE_API_BASE_URL` to use another API URL;
configure `CORS_ALLOWED_ORIGINS` if the frontend uses a different origin.

## Try the App

1. Register as an employee or employer.
2. Complete the role-specific profile.
3. Employers can create a job and review applicants; employees can browse jobs
   and apply with a cover letter.
4. Update an application status to explore notifications and eligible chats.

Visitors can browse open jobs, but need an employee account to apply.

## Tests

Backend integration tests require the local PostgreSQL database:

```bash
cd backend
./mvnw test
```

Frontend tests, lint, and production build:

```bash
cd frontend
npm test
npm run lint
npm run build
```

## Configuration and Security

Backend defaults and environment-variable overrides are in
`backend/src/main/resources/application.properties`. Set a strong `JWT_SECRET`
and appropriate database credentials and `CORS_ALLOWED_ORIGINS` for deployments.
Do not use the local database credentials or development JWT default in production.

JWTs last 30 minutes by default. The browser renews an active session and ends it
after 30 minutes without activity. Sign-out removes the browser's token; it does
not revoke a copied token before expiry.
