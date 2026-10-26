# Classifieds Backend REST API

REST API backend service for a classifieds board featuring JWT authentication, authorization, and resource ownership control.

## Overview

A pure JSON REST API built to serve client applications (web, mobile, etc.) over HTTP.

- **Anonymous visitors** can browse paginated announcements, filter by search query, sort results, and view individual announcement details.
- **Registered users** can create, update, and delete their own announcements.
- **Authentication** uses JWT access and refresh token pairs with refresh token rotation:
  - **Access token**: 15 minutes lifetime
  - **Refresh token**: 7 days lifetime

## Tech Stack

| Technology | Description |
| --- | --- |
| **Node.js & TypeScript** | Runtime environment & static typing |
| **Express 5** | Web framework |
| **Prisma 7** | PostgreSQL ORM (`@prisma/adapter-pg`) |
| **Zod 4** | Request/response schema validation |
| **bcrypt** | Password hashing |
| **jsonwebtoken** | JWT signing and verification |
| **@asteasolutions/zod-to-openapi** | OpenAPI 3.0 specification generator from Zod schemas |
| **swagger-ui-express** | Interactive Swagger UI documentation |
| **tsup & tsx** | TypeScript bundler for production & watcher for development |
| **Docker & Nginx** | Containerized PostgreSQL, pgAdmin 4, and reverse proxy |

---

## Getting Started

### 1. Configure Environment Variables

Copy the example environment file and adjust values if needed:

```bash
cp .env.example .env
```

```env
NODE_ENV="development"
NGINX_OUT_PORT=8080
JWT_SECRET=your-secret-key-at-least-256-bits-long

# Database URL for local development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/classifieds?schema=public

# PostgreSQL Docker container
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=classifieds

# pgAdmin 4 Docker container
PGADMIN_EMAIL=admin@local.org
PGADMIN_PASSWORD=rootroot
PGADMIN_PORT=8095
```

---

### 2. Development Environment

In development mode, PostgreSQL and pgAdmin run in Docker while the Node.js server runs locally with hot reload (`tsx watch`).

1. **Install dependencies:**

   ```bash
   # Yarn
   yarn install

   # npm
   npm install
   ```

2. **Start PostgreSQL & pgAdmin containers:**

   ```bash
   # Yarn
   yarn dev:db

   # npm
   npm run dev:db
   ```

3. **Generate Prisma Client & apply database migrations:**

   ```bash
   # Yarn
   yarn prisma:generate
   yarn prisma:migrate

   # npm
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. *(Optional)* **Seed the database with fake data:**

   ```bash
   # Yarn
   yarn seed

   # npm
   npm run seed
   ```

5. **Start the development server:**

   ```bash
   # Yarn
   yarn dev

   # npm
   npm run dev
   ```

> [!TIP]
> - **API Base URL (Dev):** `http://localhost:3000`
> - **Swagger UI (Dev):** `http://localhost:3000/api-docs`
> - **pgAdmin 4:** `http://localhost:8080/pgadmin`

---

### 3. Production Environment

You can run the production build either **via Docker Compose** (with Nginx reverse proxy, PostgreSQL, and automatic migration deployment) or **standalone** on the host.

#### Option A: Full Docker Production Stack (Recommended)

Builds the multi-stage production Docker image, runs `prisma migrate deploy`, and serves the app behind Nginx:

```bash
# Start production stack in detached mode
# Yarn
yarn prod:up

# npm
npm run prod:up
```

```bash
# Stop production stack
# Yarn
yarn prod:down

# npm
npm run prod:down
```

> [!IMPORTANT]
> When running via `prod:up`, the API is served through Nginx on `NGINX_OUT_PORT` (default `8080`):
> - **API Base URL (Prod Docker):** `http://localhost:8080`
> - **Swagger UI (Prod Docker):** `http://localhost:8080/api-docs`
> - **pgAdmin 4:** `http://localhost:8080/pgadmin`

#### Option B: Local Production Build & Start

Compile TypeScript to `dist/` with `tsup` and run the bundled server with Node.js:

```bash
# 1. Generate Prisma client, typecheck, and bundle into dist/
# Yarn
yarn build

# npm
npm run build

# 2. Apply pending migrations to the production database
# Yarn
yarn prisma:deploy

# npm
npm run prisma:deploy

# 3. Start the compiled server
# Yarn
yarn start

# npm
npm start
```

---

## Available Scripts

| Action | Command | Description |
| --- | --- | --- |
| **Development server** | `dev` | Start server with hot reload (`tsx watch`) |
| **Build for production** | `build` | Generate Prisma Client, typecheck, and bundle with `tsup` |
| **Start production** | `start` | Run compiled `dist/server.js` with source maps |
| **Typecheck** | `typecheck` | Run TypeScript compiler check (`tsc --noEmit`) |
| **Generate Prisma Client** | `prisma:generate` | Generate Prisma Client into `src/generated/prisma` |
| **Run dev migrations** | `prisma:migrate` | Create and apply migrations (`prisma migrate dev`) |
| **Deploy prod migrations** | `prisma:deploy` | Apply migrations in production (`prisma migrate deploy`) |
| **Prisma Studio** | `prisma:studio` | Open Prisma visual database browser |
| **Seed database** | `seed` | Populate database with fake users & announcements |
| **Start dev DB** | `dev:db` | Start PostgreSQL, pgAdmin, and Nginx via Docker Compose |
| **Stop dev DB** | `dev:db:stop` | Stop development Docker containers |
| **Start prod Docker** | `prod:up` | Build & start full production stack in Docker |
| **Stop prod Docker** | `prod:down` | Stop and remove production Docker containers |

---

## API Endpoints

### Auth (`/auth`)

| Method | Path | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Authenticate user and receive token pair | No |
| `POST` | `/auth/refresh` | Rotate refresh token and get new token pair | No |
| `POST` | `/auth/logout` | Revoke refresh token and log out | No |
| `GET` | `/auth/me` | Get current authenticated user profile | Yes (`Bearer`) |

### Announcements (`/announcements`)

| Method | Path | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/announcements` | List announcements with pagination, search, and sorting | No |
| `GET` | `/announcements/:id` | Get announcement details by ID | No |
| `POST` | `/announcements` | Create a new announcement | Yes (`Bearer`) |
| `PATCH` | `/announcements/:id` | Partially update own announcement | Yes (`Bearer`, Owner) |
| `DELETE` | `/announcements/:id` | Delete own announcement | Yes (`Bearer`, Owner) |

---

## Request Parameters & Validation

### `GET /announcements`

| Parameter | Location | Requirements |
| --- | --- | --- |
| `search` | `query` | Optional string, `1–100` chars (case-insensitive search in `title` & `description`) |
| `sort` | `query` | `newest` (default) or `oldest` |
| `page` | `query` | Positive integer (`>= 1`), default: `1` |
| `perPage` | `query` | Integer `1–100`, default: `10` |

### `POST /auth/register`

| Field | Requirements |
| --- | --- |
| `username` | Required string, `3–30` chars, alphanumeric and underscores (`^[a-zA-Z0-9_]+$`) |
| `email` | Required valid email address |
| `password` | Required string, minimum `6` characters |
| `name` | Required string, `2–255` characters |

### `POST /announcements`

| Field | Requirements |
| --- | --- |
| `title` | Required string, `5–50` characters |
| `description` | Required string, minimum `10` characters |
| `price` | Required positive number (`> 0`, max `99999999.99`) |
| `category` | Required string (case-insensitive): `SALE`, `SERVICE`, `JOB`, `OTHER` |

> [!NOTE]
> `PATCH /announcements/:id` uses the same field validation rules as `POST /announcements`, with all fields optional (at least one field must be provided).

---

## Database Schema (Prisma)

Defined in `prisma/schema.prisma` with three models:

- **`User`** — `id`, `username` (unique), `email` (unique), `password` (hashed), `name`, `createdAt`
- **`RefreshToken`** — `id`, `token` (unique), `userId` (`User` relation), `expiresAt`, `createdAt`
- **`Announcement`** — `id`, `title`, `description`, `price` (`Decimal(10, 2)`), `category` (`SALE | SERVICE | JOB | OTHER`), `userId` (`User` relation), `createdAt`, `updatedAt`

---

## Project Structure

```text
classifieds-backend/
├── nginx/
│   ├── nginx.dev.conf
│   └── nginx.prod.conf
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── requests/
│   ├── announcement.validations.http
│   ├── announcements.http
│   └── auth.http
├── src/
│   ├── config/
│   │   └── env.ts
│   ├── constants/
│   │   └── time.ts
│   ├── controllers/
│   │   ├── announcements.controller.ts
│   │   └── auth.controller.ts
│   ├── db/
│   │   └── prisma.ts
│   ├── errors/
│   │   └── http.error.ts
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   ├── error-handler.ts
│   │   ├── not-found.ts
│   │   └── validate.ts
│   ├── openapi/
│   │   ├── announcements.openapi.ts
│   │   ├── auth.openapi.ts
│   │   ├── helper.ts
│   │   ├── index.ts
│   │   └── registry.ts
│   ├── routes/
│   │   ├── announcements.routers.ts
│   │   └── auth.routes.ts
│   ├── services/
│   │   ├── announcements.service.ts
│   │   └── auth.service.ts
│   ├── validators/
│   │   ├── announcements.validator.ts
│   │   ├── auth.validator.ts
│   │   └── error.validator.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── compose.yml
├── compose.prod.yml
├── Dockerfile
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── tsup.config.ts
```
