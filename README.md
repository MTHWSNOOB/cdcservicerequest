# CDC Service Request System

A service request management system for CDC, built with Vue 3 (frontend) and Node.js/Express/Prisma (backend), containerized with Docker.

---

## 🚀 Quick Start (Docker)

### Requirements
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be installed and running

### Steps

```bash
# 1. Clone the repository
git clone <your-github-repo-url>
cd "cdc service request"

# 2. Create backend environment file
cp backend/.env.example backend/.env

# 3. Build and start everything
docker compose up --build
```

That's it! Docker will automatically:
- Build the frontend and backend
- Run database migrations
- Seed the database with default data and admin account

---

## 🌐 Access the App

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost       |
| Backend  | http://localhost:3000  |

---

## 🔑 Default Accounts

| Role  | Email           | Password   |
|-------|-----------------|------------|
| Admin | admin@cdh.gov   | admin123   |
| User  | user@cdh.gov    | user123    |

> ⚠️ **Change these passwords immediately after first login in production!**

---

## 🛠️ Docker Commands

```bash
# Start in background (detached mode)
docker compose up --build -d

# Stop all containers
docker compose down

# View logs
docker compose logs -f

# Rebuild after code changes
docker compose up --build

# Reset everything (deletes database data!)
docker compose down -v
```

---

## 📁 Project Structure

```
cdc service request/
├── docker-compose.yml       # Orchestrates all services
├── backend/                 # Node.js + Express + Prisma API
│   ├── Dockerfile
│   ├── .env.example         # Copy to .env and configure
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── seed.ts          # Default data and accounts
│   │   └── migrations/      # Database migration history
│   └── src/
└── fronend/                 # Vue 3 + Vite frontend
    ├── Dockerfile
    └── src/
```

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env` and update the values:

| Variable       | Description                          | Default                  |
|----------------|--------------------------------------|--------------------------|
| `PORT`         | Backend API port                     | `3000`                   |
| `NODE_ENV`     | Environment                          | `production`             |
| `DATABASE_URL` | SQLite database path (inside Docker) | `file:/app/data/dev.db`  |
| `JWT_SECRET`   | Secret key for JWT tokens            | **Change this!**         |

---

## 🗄️ Database

- **Type:** SQLite (file-based, no separate DB server needed)
- **Location:** Stored in a Docker volume (`backend-data`) — persists across restarts
- **Migrations:** Run automatically on container start
- **Seeding:** Admin and sample accounts created automatically on first run

> To reset the database: `docker compose down -v` then `docker compose up --build`
