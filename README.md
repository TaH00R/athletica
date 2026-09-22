# Freshers' Cup

Freshers' Cup is a full-stack sports management and live-score website for IIIT Guwahati.

The project is split into:

- `backend/` — Spring Boot REST API, PostgreSQL, Flyway, JWT authentication
- `frontend/` — Next.js + TypeScript + Tailwind CSS

## Tech Stack

### Backend

- Java 21
- Spring Boot 4.1.1
- Spring Security
- JWT authentication
- Spring Data JPA
- PostgreSQL
- Flyway
- Lombok
- WebSocket
- Actuator
- Swagger / OpenAPI

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Browser-side API client
- Environment-based backend URL

---

# 1. Project Structure

A typical layout is:

```text
freshers-cup/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env.local
│   └── ...
└── README.md
```

Keep backend and frontend environment files separate.

---

# 2. Prerequisites

Install:

- Java 21
- Maven
- PostgreSQL
- Node.js
- npm
- Git

Verify the tools:

```bash
java -version
mvn -version
node -version
npm -version
psql --version
```

---

# 3. Clone the Repository

```bash
git clone https://github.com/TaH00R/spark
cd freshers-cup
```

Then open two terminals:

```text
Terminal 1 -> backend
Terminal 2 -> frontend
```

---

# 4. PostgreSQL Setup

Create a PostgreSQL database.

Using `psql`:

```sql
CREATE DATABASE freshers_cup;
```

Then connect to it:

```bash
psql -U postgres -d freshers_cup
```

You can also use pgAdmin.

## Database Credentials

You will need:

```text
Database name: freshers_cup
Username: postgres
Password: <your-postgres-password>
Host: localhost
Port: 5432
```

Do not commit database passwords to Git.

---

# 5. Backend Environment Variables

The backend should read secrets and deployment-specific values from environment variables instead of hardcoding them.

A useful production/local variable set is:

```text
DB_URL
DB_USERNAME
DB_PASSWORD

JWT_SECRET
JWT_EXPIRATION_MS

FRONTEND_URL
```

Example local values:

```text
DB_URL=jdbc:postgresql://localhost:5432/freshers_cup
DB_USERNAME=postgres
DB_PASSWORD=your_password

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRATION_MS=86400000

FRONTEND_URL=http://localhost:3000
```

Never commit real secrets.

---

# 6. Backend `application.properties`

Create:

```text
backend/src/main/resources/application.properties
```

Use environment-variable placeholders so the same application can run locally and in production.

Example:

```properties
spring.application.name=freshers-cup-backend

server.port=${PORT:6967}

spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false

spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true

app.jwt-secret=${JWT_SECRET}
app.jwt-expiration-milliseconds=${JWT_EXPIRATION_MS:86400000}

app.frontend-url=${FRONTEND_URL:http://localhost:3000}
```

### Important

If your existing Java configuration uses different property names, keep those names.

For example, if your `JwtService` currently reads:

```java
@Value("${app.jwt-expiration-milliseconds}")
```

then the property must remain:

```properties
app.jwt-expiration-milliseconds=${JWT_EXPIRATION_MS:86400000}
```

Do not randomly rename properties in `application.properties` without updating the corresponding Java configuration.

---

# 7. Local Backend Configuration

For local development, you have two reasonable options.

## Option A — Use environment variables

Set the variables in your shell before starting Spring Boot.

### Windows PowerShell

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/freshers_cup"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET="your_long_random_secret"
$env:JWT_EXPIRATION_MS="86400000"
$env:FRONTEND_URL="http://localhost:3000"
```

Then:

```bash
mvn spring-boot:run
```

## Option B — IDE environment configuration

In IntelliJ IDEA / VS Code, add the same variables to the Spring Boot run configuration.

This keeps secrets outside the repository.

---

# 8. Flyway

Flyway manages database schema migrations.

Migration files normally live under:

```text
backend/src/main/resources/db/migration/
```

Example:

```text
V1__create_admins.sql
V2__create_sports.sql
V3__create_teams.sql
V4__create_players.sql
...
```

On application startup, Flyway checks which migrations have already been applied and runs pending migrations.

## Important Rule

Do not use:

```properties
spring.jpa.hibernate.ddl-auto=update
```

in production when Flyway is controlling the schema.

The recommended setup for this project is:

```properties
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
```

JPA validates the schema while Flyway owns schema changes.

---

# 9. Seed / Test Data

After the database schema has been created, insert your test data.

The current test dataset is intended to contain:

```text
Sports:       9
Teams:        27
Players:      108
Matches:      27
Player stats: 88
```

The sports are:

```text
Cricket
Football
Volleyball
Basketball (girls)
Basketball (boys)
Tennis
Table Tennis
Carrom
Chess
```

Use your project seed SQL only after the Flyway migrations have created the required tables.

Verify the counts:

```sql
SELECT
    (SELECT COUNT(*) FROM sports) AS sports,
    (SELECT COUNT(*) FROM teams) AS teams,
    (SELECT COUNT(*) FROM players) AS players,
    (SELECT COUNT(*) FROM matches) AS matches,
    (SELECT COUNT(*) FROM player_stats) AS player_stats;
```

Expected result:

```text
sports | teams | players | matches | player_stats
-------+-------+---------+---------+-------------
9      | 27    | 108     | 27      | 88
```

After seeding, recalculate standings for each sport through the backend:

```text
POST /api/standings/1/recalculate
POST /api/standings/2/recalculate
POST /api/standings/3/recalculate
...
POST /api/standings/9/recalculate
```

Do not manually create standings or leaderboard totals unless the backend specifically requires it.

---

# 10. Admin Accounts

The backend supports multiple admin accounts.

The `admins` table contains:

```text
id
username
password
role
enabled
```

A typical setup is:

```text
admin
sportsadmin
matchadmin
statsadmin
```

Every enabled account with:

```text
role = ADMIN
```

can authenticate and use protected admin APIs.

## Passwords

Passwords must be stored as encoded password hashes.

Do not put plaintext passwords into the database.

Example:

```sql
INSERT INTO admins (username, password, role, enabled)
VALUES (
    'admin2',
    '<BCrypt_HASH>',
    'ADMIN',
    true
);
```

For quick testing, you can copy the existing encoded password from an already-working admin account:

```sql
INSERT INTO admins (username, password, role, enabled)
SELECT
    'admin2',
    password,
    'ADMIN',
    true
FROM admins
WHERE username = 'admin';
```

Then verify:

```sql
SELECT id, username, role, enabled
FROM admins
ORDER BY id;
```

---

# 11. Start the Backend

From:

```bash
cd backend
```

Run:

```bash
mvn spring-boot:run
```

The development backend runs on:

```text
http://localhost:6967
```

---

# 12. Backend API

The major public endpoints include:

```text
GET /api/sports
GET /api/sports/active
GET /api/sports/{id}

GET /api/teams
GET /api/teams/{id}
GET /api/teams/sport/{sportId}

GET /api/players
GET /api/players/{id}
GET /api/players/team/{teamId}
GET /api/players/team/{teamId}/active

GET /api/matches
GET /api/matches/{id}
GET /api/matches/live
GET /api/matches/upcoming
GET /api/matches/completed
GET /api/matches/sport/{sportId}
GET /api/matches/sport/{sportId}/live

GET /api/player-stats
GET /api/player-stats/{id}
GET /api/player-stats/player/{playerId}
GET /api/player-stats/match/{matchId}
GET /api/player-stats/match/{matchId}/type/{statType}

GET /api/standings/{sportId}

GET /api/leaderboards/{sportId}
GET /api/leaderboards/{sportId}/top
```

Authentication:

```text
POST /api/auth/login
```

Admin mutations:

```text
POST /api/**
PUT /api/**
DELETE /api/**
```

GET requests are publicly accessible.

---

# 13. Swagger / OpenAPI

When enabled, Swagger UI is available at:

```text
http://localhost:6967/swagger-ui/index.html
```

OpenAPI JSON is available under:

```text
/v3/api-docs
```

Use Swagger during development to verify the API before debugging frontend issues.

---

# 14. Frontend Environment

The frontend uses:

```text
NEXT_PUBLIC_API_URL
```

Create:

```text
frontend/.env.local
```

For local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:6967
```

Restart Next.js after changing `.env.local`.

---

# 15. Start the Frontend

From:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:3000
```

---

# 16. Frontend API Architecture

API calls should go through the centralized API layer.

The intended structure is:

```text
src/
├── types/
│   ├── sports.ts
│   ├── teams.ts
│   ├── players.ts
│   ├── matches.ts
│   ├── stats.ts
│   ├── standings.ts
│   ├── leaderboard.ts
│   └── auth.ts
│
└── lib/
    └── api.ts
```

The flow is:

```text
types
  ↓
lib/api.ts
  ↓
pages/components
```

Types describe API data.

`api.ts` performs requests.

Pages and components render the returned data.

Do not duplicate API fetch logic and response types inside individual pages.

---

# 17. Frontend Admin Authentication

The frontend stores the admin JWT after a successful login.

The API client sends:

```text
Authorization: Bearer <JWT>
```

for protected admin mutations.

Typical flow:

```text
/admin
   ↓
POST /api/auth/login
   ↓
JWT returned
   ↓
admin_token stored
   ↓
Admin dashboard
   ↓
POST / PUT / DELETE requests
   ↓
Authorization: Bearer <JWT>
```

Do not expose the JWT secret to the frontend.

The frontend only receives the generated token.

---

# 18. CORS

The backend must allow requests from the frontend.

Local:

```text
http://localhost:3000
```

Production:

```text
https://<your-frontend-domain>
```

Use an environment variable such as:

```text
FRONTEND_URL
```

instead of hardcoding the production domain.

When deploying, make sure the backend CORS configuration includes the exact deployed frontend origin.

---

# 19. Local Development Checklist

Start PostgreSQL.

Create the database:

```sql
CREATE DATABASE freshers_cup;
```

Start the backend:

```bash
cd backend
mvn spring-boot:run
```

Check:

```text
http://localhost:6967
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Then test in this order:

```text
1. Backend starts
2. Flyway migrations succeed
3. Database tables exist
4. Test data exists
5. GET /api/sports works
6. Frontend loads
7. Admin login works
8. Admin POST/PUT/DELETE works
9. Live matches work
10. Standings and leaderboard work
```

---

# 20. Production Environment Variables

Never deploy with development secrets.

The backend production environment should contain values equivalent to:

```text
DB_URL=jdbc:postgresql://<production-host>:5432/<database>
DB_USERNAME=<production-db-user>
DB_PASSWORD=<production-db-password>

JWT_SECRET=<long-random-secret>
JWT_EXPIRATION_MS=86400000

FRONTEND_URL=https://<production-frontend-domain>
PORT=<platform-provided-port-if-required>
```

The frontend production environment should contain:

```text
NEXT_PUBLIC_API_URL=https://<production-backend-domain>
```

Do not put database credentials or `JWT_SECRET` in `NEXT_PUBLIC_*` variables.

Anything beginning with `NEXT_PUBLIC_` is intended to be available to browser-side code.

---

# 21. Generate a Strong JWT Secret

Use a cryptographically random value for production.

For example, with OpenSSL:

```bash
openssl rand -base64 64
```

Use the generated output as:

```text
JWT_SECRET=<generated-value>
```

Never commit this value.

Do not reuse a development JWT secret in production.

---

# 22. Production Database

Create a PostgreSQL database through your chosen hosting provider.

Collect:

```text
host
port
database name
username
password
```

Convert those values into the JDBC URL expected by Spring Boot.

Example:

```text
jdbc:postgresql://db.example.com:5432/freshers_cup
```

Set:

```text
DB_URL=jdbc:postgresql://db.example.com:5432/freshers_cup
DB_USERNAME=<username>
DB_PASSWORD=<password>
```

Make sure the deployment platform can reach the database over the network.

---

# 23. Deploy the Backend

Use any Java/Spring Boot hosting provider that supports:

- Java 21
- Maven builds
- Environment variables
- PostgreSQL connectivity
- Long-running web services
- WebSocket support if live updates are used in production

Typical build command:

```bash
mvn clean package -DskipTests
```

The generated JAR is under:

```text
target/
```

Typical start command:

```bash
java -jar target/<your-jar-name>.jar
```

If your provider supplies a `PORT` environment variable, keep:

```properties
server.port=${PORT:6967}
```

so the service uses the provider's port in production and `6967` locally.

---

# 24. Deploy the Frontend

Build the Next.js application:

```bash
npm run build
```

Set the production environment variable:

```text
NEXT_PUBLIC_API_URL=https://<production-backend-domain>
```

Deploy the frontend through your chosen Next.js-compatible hosting provider.

Do not use:

```text
http://localhost:6967
```

in production.

---

# 25. Deployment Order

Deploy in this order:

```text
PostgreSQL
   ↓
Backend
   ↓
Backend migrations
   ↓
Backend health/API test
   ↓
Frontend
   ↓
Update backend FRONTEND_URL
   ↓
Update frontend NEXT_PUBLIC_API_URL
   ↓
Test admin login
   ↓
Test public pages
   ↓
Test live matches
```

This avoids the classic "frontend is deployed but it's still calling localhost" disaster.

---

# 26. Production First-Time Setup

After the backend is deployed:

### 1. Confirm migrations

Check backend startup logs for successful Flyway execution.

### 2. Confirm the API

Test:

```text
GET https://<backend-domain>/api/sports
```

### 3. Create admin accounts

Insert encoded-password admin rows into the production `admins` table.

### 4. Add production data

Insert your Freshers' Cup sports, teams, players, matches, and stats.

### 5. Recalculate standings

Call:

```text
POST /api/standings/{sportId}/recalculate
```

for every active sport that requires standings.

### 6. Connect frontend

Set:

```text
NEXT_PUBLIC_API_URL=https://<backend-domain>
```

### 7. Test login

Use:

```text
/admin
```

and verify an admin can log in and perform CRUD operations.

---

# 27. Environment Files and Git

Your repository should contain templates, not real secrets.

Good:

```text
.env.example
```

Example:

```env
DB_URL=jdbc:postgresql://localhost:5432/freshers_cup
DB_USERNAME=postgres
DB_PASSWORD=
JWT_SECRET=
JWT_EXPIRATION_MS=86400000
FRONTEND_URL=http://localhost:3000
```

Frontend:

```text
frontend/.env.example
```

```env
NEXT_PUBLIC_API_URL=http://localhost:6967
```

Do not commit:

```text
.env
.env.local
.env.production
```

when they contain real secrets.

---

# 28. `.gitignore`

Make sure your repository ignores local secrets and generated files.

Example:

```gitignore
.env
.env.*
!.env.example

target/
node_modules/
.next/
out/

*.log
```

If your repository needs a specific environment file committed for the frontend, use an example file containing placeholders rather than actual secrets.

---

# 29. Health Check

Actuator is enabled in the backend stack.

A useful production health endpoint is:

```text
GET /actuator/health
```

Example:

```text
https://<backend-domain>/actuator/health
```

Use this to quickly determine whether the backend service is alive.

If your production security policy should restrict actuator endpoints, configure that separately rather than exposing sensitive actuator endpoints publicly.

---

# 30. WebSocket / Live Updates

The application includes WebSocket support for live match updates.

Local:

```text
http://localhost:6967
```

Production:

```text
https://<backend-domain>
```

Your hosting provider must support WebSocket connections for live updates to work correctly.

If the REST API works but live updates do not, check:

```text
1. WebSocket support on the hosting provider
2. Production WebSocket URL
3. CORS/origin configuration
4. Reverse proxy configuration
5. Browser console errors
```

---

# 31. Troubleshooting

## Backend cannot connect to PostgreSQL

Check:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

Then verify PostgreSQL is running and the database exists.

---

## Flyway fails on startup

Check:

```text
backend/src/main/resources/db/migration/
```

Make sure migrations:

```text
- have unique version numbers
- are named correctly
- execute in the expected order
- match the JPA entities
```

Do not casually edit an already-applied migration in a shared/production database. Create a new migration for schema changes.

---

## Frontend shows network errors

Check:

```text
NEXT_PUBLIC_API_URL
```

Local:

```text
http://localhost:6967
```

Production:

```text
https://<backend-domain>
```

Also check browser DevTools → Network.

---

## Admin login fails

Check:

```text
1. Username exists
2. Admin is enabled
3. Password is encoded correctly
4. Role is ADMIN
5. JWT configuration is correct
```

Database check:

```sql
SELECT id, username, role, enabled
FROM admins;
```

---

## Admin can log in but cannot POST/PUT/DELETE

Check that the request contains:

```text
Authorization: Bearer <JWT>
```

and that the authenticated user has:

```text
ROLE_ADMIN
```

Your security configuration protects:

```text
POST /api/**
PUT /api/**
DELETE /api/**
```

while GET requests are public.

---

## CORS error after deployment

Check:

```text
FRONTEND_URL
```

and make sure it exactly matches the deployed frontend origin.

For example:

```text
https://freshers-cup.vercel.app
```

is different from:

```text
https://www.freshers-cup.vercel.app
```

---

# 32. Production Safety Checklist

Before making the website public:

```text
[ ] Production PostgreSQL database created
[ ] Production database credentials stored as environment variables
[ ] JWT_SECRET replaced with a strong random secret
[ ] JWT_SECRET is not committed to Git
[ ] Frontend uses production API URL
[ ] Backend CORS allows production frontend
[ ] Flyway migrations succeed
[ ] JPA uses ddl-auto=validate
[ ] Admin passwords are hashed
[ ] Only intended admin accounts are enabled
[ ] Public GET endpoints work
[ ] Admin authentication works
[ ] POST/PUT/DELETE protection works
[ ] WebSocket/live updates work
[ ] Health endpoint works
[ ] Production test data verified
[ ] Standings recalculated
[ ] Mobile UI tested
[ ] Desktop UI tested
```

---

# 33. Recommended Development Workflow

For backend changes:

```bash
cd backend
mvn clean package
mvn spring-boot:run
```

For frontend changes:

```bash
cd frontend
npm install
npm run dev
```

For a schema change:

```text
1. Create a new Flyway migration
2. Start the backend
3. Verify Flyway succeeds
4. Verify the API
5. Verify the frontend
6. Test admin CRUD
```

For a new API feature:

```text
1. Backend entity / DTO
2. Repository
3. Service
4. Controller
5. API type
6. Centralized API method
7. Frontend component/page
```

Keep API types and API request code centralized.

---

# 34. Final Architecture

```text
                         ┌──────────────────────┐
                         │      Next.js         │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │
                         HTTPS / REST / WebSocket
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Spring Boot       │
                         │       Backend        │
                         ├──────────────────────┤
                         │ Controllers           │
                         │ Services              │
                         │ Spring Security       │
                         │ JWT                   │
                         │ WebSocket             │
                         │ Flyway                │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     PostgreSQL       │
                         │                      │
                         │ admins               │
                         │ sports               │
                         │ teams                │
                         │ players              │
                         │ matches              │
                         │ player_stats         │
                         │ standings             │
                         └──────────────────────┘
```

---

# 35. Quick Start

For someone who already has the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd freshers-cup
```

Create the PostgreSQL database:

```sql
CREATE DATABASE freshers_cup;
```

Configure backend environment variables:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_EXPIRATION_MS
FRONTEND_URL
```

Start backend:

```bash
cd backend
mvn spring-boot:run
```

Configure:

```text
frontend/.env.local
```

with:

```env
NEXT_PUBLIC_API_URL=http://localhost:6967
```

Start frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/admin
```

Backend:

```text
http://localhost:6967
```

Swagger:

```text
http://localhost:6967/swagger-ui/index.html
```

---

# 36. Before Committing

Run:

```bash
git status
```

Make sure you have not accidentally staged:

```text
.env
.env.local
database passwords
JWT secrets
production credentials
```

Then commit your changes normally.

