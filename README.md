# HireFlow

HireFlow is a full-stack job tracking application built with a Spring Boot backend, PostgreSQL database, Flyway migrations, and a React + Vite + TypeScript frontend.

---

## Tech Stack

### Backend

- Java 21
- Spring Boot
- Maven
- Spring Data JPA
- PostgreSQL
- Flyway

### Frontend

- React
- TypeScript
- Vite
- npm

### Database / Tools

- PostgreSQL 16
- Adminer
- Podman
- Podman Compose
- Git

---

## Prerequisites

Install the following before running the project locally:

- Git
- Java 21
- Node.js
- npm
- Podman
- Podman Compose

Check Java:

```bash
java -version
javac -version
```

Expected Java version:

```text
21
```

Check Node and npm:

```bash
node -v
npm -v
```

Check Podman:

```bash
podman --version
podman compose version
```

---

## Local Setup Guide

Follow these steps to run the project on a new local machine.

---

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/hireflow.git
```

Go into the project folder:

```bash
cd hireflow
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## 2. Start PostgreSQL and Adminer

From the project root, start the local database services:

```bash
podman compose up -d
```

Check that the containers are running:

```bash
podman compose ps
```

You should see containers similar to:

```text
hireflow-db
hireflow-adminer
```

---

## 3. Database Details

The local PostgreSQL database uses these credentials:

```text
Database: hireflow_db
Username: admin
Password: admin
Host: localhost
Port: 5432
```

The backend connects to the database using:

```text
jdbc:postgresql://localhost:5432/hireflow_db
```

---

## 4. Open Adminer

Adminer is available at:

```text
http://localhost:8081
```

Use these login details:

```text
System: PostgreSQL
Server: postgres
Username: admin
Password: admin
Database: hireflow_db
```

Important:

```text
Server: postgres
```

Do not use:

```text
Server: hireflow_db
```

`postgres` is the compose service name.  
`hireflow_db` is the database name.

---

## 5. Run the Backend

Open a terminal from the project root.

Go into the backend folder:

```bash
cd backend
```

Check Maven and Java:

```bash
./mvnw --version
```

Make sure Maven is using Java 21.

Start the backend:

```bash
./mvnw clean spring-boot:run
```

The backend should start at:

```text
http://localhost:8080
```

Flyway migrations run automatically when the backend starts.

---

## 6. Run the Frontend

Open a second terminal from the project root.

Go into the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend should start at:

```text
http://localhost:5173
```

If Vite uses a different port, check the terminal output.

---

## 7. Local URLs

```text
Backend:  http://localhost:8080
Frontend: http://localhost:5173
Adminer:  http://localhost:8081
Database: localhost:5432
```

---

## Backend Configuration

Backend configuration is located at:

```text
backend/src/main/resources/application.properties
```

Example local configuration:

```properties
spring.application.name=hireflow

spring.datasource.url=jdbc:postgresql://localhost:5432/hireflow_db
spring.datasource.username=admin
spring.datasource.password=admin
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false

spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration

server.port=8080
```

---

## Flyway Migrations

Flyway migration files are stored in:

```text
backend/src/main/resources/db/migration/
```

Migration files should follow this naming format:

```text
V1__create_core_tables.sql
V2__create_jobs_table.sql
V3__add_indexes.sql
```

Important:

Do not edit old migrations after they have already been applied.

Create a new migration file instead.

---

## Useful Podman Commands

Start services:

```bash
podman compose up -d
```

Stop services:

```bash
podman compose down
```

Stop services and delete database volume:

```bash
podman compose down -v
```

Warning: this deletes local PostgreSQL data.

Restart services:

```bash
podman compose restart
```

Check running services:

```bash
podman compose ps
```

View all logs:

```bash
podman compose logs
```

View PostgreSQL logs:

```bash
podman compose logs postgres
```

View Adminer logs:

```bash
podman compose logs adminer
```

---

## Backend Commands

From the backend folder:

```bash
cd backend
```

Run backend:

```bash
./mvnw clean spring-boot:run
```

Run tests:

```bash
./mvnw test
```

Build backend:

```bash
./mvnw clean package
```

Clean backend build files:

```bash
./mvnw clean
```

---

## Frontend Commands

From the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Build frontend:

```bash
npm run build
```

Preview frontend production build:

```bash
npm run preview
```

---

## Git Ignore

Make sure generated files and local-only files are not committed.

Recommended `.gitignore`:

```gitignore
# OS files
.DS_Store
Thumbs.db

# IDE/editor
.vscode/
.idea/
*.iml

# Java / Maven
target/
*.class
*.log

# Maven wrapper files should be included
!mvnw
!mvnw.cmd
!.mvn/wrapper/maven-wrapper.jar

# Environment files
.env
.env.*
!.env.example

# Node / frontend
node_modules/
dist/
build/
coverage/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Podman / Docker local data
docker-data/
podman-data/
postgres-data/

# Archives
*.zip

# Temporary files
*.tmp
*.swp
```

Do not commit these files or folders:

```text
backend/target
frontend/node_modules
frontend/dist
.env
*.zip
```

---

## Push to GitHub

If this is the first time pushing the project:

```bash
git init
git add .
git commit -m "Initial HireFlow project setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hireflow.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

If the remote already exists:

```bash
git add .
git commit -m "Update project setup"
git push
```

---

## Before Pushing

Check Git status:

```bash
git status
```

Make sure these are not included:

```text
frontend/node_modules
backend/target
backend.zip
.env
```

If they appear, remove them from Git tracking:

```bash
git rm -r --cached frontend/node_modules
git rm -r --cached backend/target
git rm --cached backend.zip
```

Then commit again:

```bash
git add .
git commit -m "Remove generated files from repository"
git push
```

---

## Troubleshooting

### Backend Cannot Connect to Database

Check if services are running:

```bash
podman compose ps
```

If they are not running:

```bash
podman compose up -d
```

Check that the backend database URL is:

```text
jdbc:postgresql://localhost:5432/hireflow_db
```

---

### Adminer Login Fails

Use:

```text
System: PostgreSQL
Server: postgres
Username: admin
Password: admin
Database: hireflow_db
```

Do not use `hireflow_db` as the server.

---

### Maven Uses the Wrong Java Version

Check:

```bash
cd backend
./mvnw --version
```

If it does not show Java 21, fix your Java environment.

Temporary Java 21 fix:

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
```

Verify:

```bash
java -version
javac -version
./mvnw --version
```

---

### Frontend Dependencies Missing

Run:

```bash
cd frontend
npm install
```

---

### PostgreSQL Port 5432 Already in Use

Another PostgreSQL instance may already be using port `5432`.

Option 1: stop the other PostgreSQL service.

Option 2: change the port mapping in `docker-compose.yml`.

Example:

```yaml
ports:
  - "5433:5432"
```

Then update backend config:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5433/hireflow_db
```

---

### Backend Port 8080 Already in Use

Change this in:

```text
backend/src/main/resources/application.properties
```

Example:

```properties
server.port=8082
```

---

### Frontend Port 5173 Already in Use

Vite may automatically choose a different port.

Check the output after running:

```bash
npm run dev
```

---

## Reset Local Database

Warning: this deletes your local PostgreSQL data.

From the project root:

```bash
podman compose down -v
podman compose up -d
```

Then restart the backend:

```bash
cd backend
./mvnw clean spring-boot:run
```

Flyway will run migrations again on the fresh database.

---

## License

This project is for personal learning and development.
