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
- Node.js 24 LTS (recommended; the frontend tests use native TypeScript support)
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

## Job and Application Workflow

HireFlow supports two role-specific workflows:

- Employers can create job listings and review all jobs created by their company.
- Employers can see applicant counts, review profiles and cover letters, and update each application to applied, reviewing, shortlisted, accepted, or rejected.
- Employers can close their own listings to stop applications, then permanently delete closed listings and their applications after confirming.
- Employees can browse open jobs, view job details, submit one immutable application per job, and review their submitted cover letters.
- Visitors can browse open jobs but must log in with an employee account to apply.
- Authentication uses a 30-minute JWT returned by login or registration. The frontend renews it while users are active and logs them out after 30 minutes of inactivity, with a session-ended popup.
- TanStack React Query manages server state while Auth Context exposes the current signed-in user.

### How to use HireFlow

The navbar uses icons with labels underneath for browsing jobs, your role-specific workspace, notifications,
profile, and logout. On smaller screens, these controls sit in a row below the HireFlow logo and account name.

1. Start the database, backend, and frontend using the setup guide below, then open `http://localhost:5173`.
2. Select **Register**, choose Employee or Employer, and enter an email and a password of at least eight characters.
   Employees provide their full name; employers provide their company name.
3. After registration, log in with that email and password. The selected account role controls the workspace and protected actions.

**Employee workflow**

1. Open your profile and maintain your name, location, phone number, and summary.
2. Browse open jobs, open a listing to read requirements and salary details, and view its company profile.
3. Enter a cover letter and apply. Only one application per employee per job is allowed; submitted applications and cover letters cannot be edited.
4. Open your application history to review submissions and their current status.

**Employer workflow**

1. Open your company profile and maintain the company name, description, website, and location.
2. Open **My jobs**, select **Create a job**, and enter the title, description, location, employment type, and optional requirements/salary range.
3. Open a listing's applicants to review cover letters and applicant profiles, then update application statuses.
4. Close a listing when no more applications should be accepted. Existing applications remain available for review.
5. Delete a closed listing only when it is no longer needed: confirmation permanently removes both the listing and its applications.

Visitors can browse jobs and company information without an account, but must log in as an employee to apply.
Use **Logout** to end a session manually, especially on a shared computer.

### Notifications

- Both roles have a **Notifications** bell beside Profile. Its red badge counts all unread notifications,
  not just the current page; it disappears at zero (counts above 99 display as `99+`).
- Employers receive one notification for each new application, including the applicant name, job title,
  and applicant total at the time of submission. Opening it goes to that job's applicant list, where the
  current total is available.
- Employees receive a notification whenever an employer changes their application status. Opening it
  goes to the matching entry in **My applications**, showing its current status and submitted cover letter.
  Saving the same status again does not create another notification.
- Opening an individual notification marks only that item as read and reduces the unread count once.
  Read notifications remain available until deleted using their Delete button. Unread items cannot be deleted.
- Notifications and read state are stored in the database, so they survive reloads and logins.
  The bell/list refresh every 30 seconds and when the window regains focus; delivery is not push-based.
  Notifications are paginated in groups of 20, newest first.
- Only the signed-in recipient can list, read, or delete their notifications. Existing applications are
  not backfilled: notifications start with new applications/status changes after this feature is installed.
- Permanently deleting a closed job also removes its applications and related notifications, avoiding links
  to deleted records. Closing a job alone does not remove notifications or application history.
- Backend startup applies Flyway migrations automatically; restart the backend before using new features.

### Application chats

- Both roles have a **Messages** inbox in the navbar. Each chat is private to the applicant and the
  employer who owns the job; applying alone does not unlock it.
- Setting an application to **Reviewing**, **Shortlisted**, or **Accepted** unlocks its chat and shows
  **Open chat** on both application lists. Once unlocked, history stays available even if the status later
  changes to Applied or Rejected. **Rejected makes the chat read-only for both participants**: messages
  can still be read and their notifications cleared, but neither side can send new messages.
  Changing back to Reviewing, Shortlisted, or Accepted resumes messaging. Returning an already unlocked
  application to Applied preserves its existing messaging behavior. Existing applications currently in an eligible status are unlocked
  by migration V6; earlier status history is not available for backfilling.
- Users can send text messages of up to 5,000 characters, including questions, email addresses, phone
  numbers, and CV links. Direct file uploads are not supported. Share only information you are
  comfortable disclosing to the other participant.
- Each new message adds one unread notification for the other participant, linking directly to the chat.
  Viewing the conversation marks its message notifications through the newest fetched message as read without
  consuming unrelated application/status notifications or newer messages not yet fetched. The existing notification bell
  still refreshes every 30 seconds; open conversations refresh every 5 seconds (not WebSocket push).
- Messages are stored in the database and survive reloads and logins. Conversations load the latest
  50 messages first; **Load older messages** retrieves earlier history.
- Closing a job preserves existing chats and their application-based messaging permissions; rejected
  applications stay read-only even when the job is closed. Permanently deleting a closed job also permanently
  removes its applications, messages, and associated notifications.
- API: authenticated participants use `GET /api/chats`, `GET /api/chats/{applicationId}`,
  `GET /api/chats/{applicationId}/messages?beforeId={messageId}`,
  `POST /api/chats/{applicationId}/messages` with `{"body":"..."}`, and
  `PATCH /api/chats/{applicationId}/read?throughMessageId={messageId}`.
- Backend startup applies Flyway migration V6 automatically. Restart the backend before using chat.

### How sessions work

- Both employee and employer JWTs have a default lifetime of **1,800,000 milliseconds (30 minutes)**.
- Mouse/pointer movement, clicks, typing, scrolling, and touch input count as activity.
  Merely leaving a page open, focusing a tab, or background API requests does not.
- The frontend checks the session every second and renews a valid JWT through `POST /api/auth/renew` when there has been activity since it was issued.
  Renewal is throttled to at most once per minute per tab. There is no long-lived refresh token, and an expired JWT cannot be renewed.
- After **30 consecutive minutes without activity**, the app clears authentication and cached data, redirects to login, and displays:
  "You have been logged out after 30 minutes of inactivity. Please log in again."
- An expired/invalid token or an authenticated API response with HTTP 401 also ends the session and shows an expiry alert.
  Connection failures are reported rather than silently extending the session; users must log in again if the token expires.
- Authentication and the last-activity timestamp are stored in browser local storage. Reloading does not restart the inactivity countdown;
  activity and logout are shared across tabs of the same browser/origin. Switching accounts also updates other tabs.
- Browser sleep or background-tab throttling may delay the popup until the browser resumes. The old deadline is checked **before** accepting new activity or sending an API request.
- Existing browser sessions without an activity timestamp must log in again after this update.
- The API remains stateless: logout removes browser credentials but does not revoke an already copied JWT.
  Non-browser API clients must renew their own valid token when needed.

### Application architecture

- Backend code is organized by feature (`auth`, `job`, `employee`, `employer`, `notification`, `chat`); controllers,
  services, and repositories stay with their feature, and Java package names match their source folders.
  Feature-specific transport types live in `dto` subpackages and persistence models in `entity` subpackages.
- Frontend feature modules own their pages, API calls, types, and feature-specific queries. `app` composes
  routes and the auth-aware application shell, while `shared` contains cross-cutting UI and utilities;
  role-to-profile navigation is centralized in the auth feature.
- The React router serves public pages and role-protected employee/employer workspaces.
- Auth Context handles login state and session monitoring; Axios attaches the bearer JWT and handles authentication failures.
- TanStack React Query fetches/caches jobs, profiles, and applications, and refreshes affected data after updates.
- Spring Security validates JWT signatures/expiry and enforces roles. Services use the authenticated account for ownership checks;
  employee/employer identities are not accepted from client-supplied user IDs.
- Spring Data JPA stores users, profiles, jobs, and applications in PostgreSQL. Flyway applies versioned schema migrations on backend startup.
- SweetAlert2 displays success/error messages, session-ended alerts, and destructive-action confirmations.

The main frontend routes are:

```text
/jobs                   Open job listings
/jobs/:jobId            Job details and employee application form
/jobs/:jobId/company    Company profile for a listing
/login                  Sign in
/register               Create an account
/employee/profile       Employee profile
/employer/profile       Company profile
/employer/jobs          Employer job dashboard
/employer/jobs/new      Job creation form
/employer/jobs/:jobId/applications  Employer applicant review
/employer/jobs/:jobId/applications/:applicationId/profile  Applicant profile
/employee/applications  Employee application history
/employee/notifications Employee notifications
/employer/notifications Employer notifications
```

The corresponding backend endpoints are:

```text
GET  /api/jobs
GET  /api/jobs/{jobId}
POST /api/employer/jobs
GET  /api/employer/jobs
PATCH /api/employer/jobs/{jobId}/status
DELETE /api/employer/jobs/{jobId}
GET  /api/employer/jobs/{jobId}/applications
PATCH /api/employer/jobs/{jobId}/applications/{applicationId}/status
POST /api/employee/jobs/{jobId}/applications
GET  /api/employee/applications
GET  /api/notifications?page=0
PATCH /api/notifications/{id}/read
DELETE /api/notifications/{id}
GET  /api/employee/profile
POST /api/employee/profile
PATCH /api/employee/profile
GET  /api/employer/profile
POST /api/employer/profile
PATCH /api/employer/profile
```

Profile endpoints identify the current user from the JWT. Do not add a user ID,
`/update`, or `/amend` suffix to these URLs.

Authentication endpoints:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/renew
```

To test with Postman:

```text
1. POST http://localhost:8080/api/auth/login with:
   {
     "email": "user@example.com",
     "password": "your-password"
   }
2. Copy the token property from the JSON response.
3. In Postman, select Authorization > Bearer Token and paste the token.
4. Call an endpoint for that user's role.
```

Each employee or employer login returns that user's own signed token:

```json
{
  "token": "<jwt-token>",
  "email": "user@example.com",
  "displayName": "Example User",
  "role": "EMPLOYEE",
  "message": "Login successful"
}
```

For production, set a unique secret of at least 32 bytes:

```text
JWT_SECRET=<strong-random-secret>
JWT_EXPIRATION_MS=1800000
```

`JWT_EXPIRATION_MS` overrides the backend default; remove any old `86400000` override to use 30-minute JWTs.
The browser inactivity limit is defined by `INACTIVITY_TIMEOUT_MS` in
`frontend/src/features/auth/sessionMonitor.ts` and is independent of that backend override.
Keep the default JWT lifetime for the documented renewal behavior. Restart the backend after changing its environment.

Job creation validates required fields, employment type, non-negative salary values, and salary range order. Applications are accepted only for open jobs, require a cover letter, and reject duplicate applications by the same employee.

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

The frontend calls `http://localhost:8080/api` by default. To change it, set
`VITE_API_BASE_URL` before starting Vite (or in `frontend/.env.local`):

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api
```

If the frontend uses another origin, set `CORS_ALLOWED_ORIGINS` on the backend
to the permitted frontend origin(s), separated by commas. Its default is `http://localhost:5173`.
Vite environment changes require restarting the development server or rebuilding production assets.

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

Run session tests and lint:

```bash
npm test
npm run lint
```

The frontend tests use a simulated clock to check the exact inactivity boundary,
active-session renewal beyond 30 minutes, restored sessions, sleep/wake behavior,
invalid tokens, and renewal errors without a real 30-minute wait.
Backend authentication integration tests require the local PostgreSQL database. From the project root:

```bash
cd backend
./mvnw -Dtest=AuthFlowTests test
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
