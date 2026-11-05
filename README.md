# HireFlow

HireFlow is a job application platform where employers post jobs and employees find and apply for them.

## Features

- Browse open jobs and company profiles without signing in.
- Create employee or employer accounts with role-based access.
- Manage profiles, job listings, applications, and application statuses.
- Get notifications for applications, status changes, and chat messages.
- Chat privately when an application is eligible.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Java 25, Spring Boot, Spring Data JPA
- **Database:** PostgreSQL 16, Flyway
- **Local services:** Podman Compose, Adminer

## Project Structure

```text
backend/     Spring Boot API and Flyway migrations
frontend/    React application and frontend tests
docker-compose.yml
             Local PostgreSQL and Adminer services
```

Backend code is organized by feature. Frontend feature modules contain their pages, API calls, and types.

## Run Locally

### Requirements

- Java 25 (LTS)
- Node.js 24 LTS and npm
- Podman and Podman Compose

### 1. Start the database

From the project root:

```bash
podman compose up -d
```

PostgreSQL is available at `localhost:5432`. Adminer is available at <http://localhost:8081>.
For local development, the database credentials are `admin` / `admin` and the database name is `hireflow_db`.

### 2. Start the backend

In a terminal:

```bash
cd backend
./mvnw spring-boot:run
```

The API runs at <http://localhost:8080>. Flyway applies database migrations on startup.
The `GET /health` endpoint checks backend and database connectivity.

### 3. Start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. The frontend uses `http://localhost:8080/api` by default.
Set `VITE_API_BASE_URL` to use a different API URL. For a different frontend origin, configure
the backend's `CORS_ALLOWED_ORIGINS`.

## Tests and Build

Backend tests require the local PostgreSQL service:

```bash
cd backend
./mvnw test
```

Frontend checks:

```bash
cd frontend
npm test
npm run lint
npm run build
```

## Configuration

Backend settings are in `backend/src/main/resources/application.properties`. The database URL,
username, and password are configured there; `DATABASE_URL` and `DATABASE_USERNAME` can override
the local defaults. Set a strong `JWT_SECRET` for deployments; `CORS_ALLOWED_ORIGINS` configures
allowed browser origins.

Do not use the example database credentials or JWT defaults in production.
