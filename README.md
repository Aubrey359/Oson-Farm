# Oson Farm — Dairy Farm Management Platform

A web app that helps dairy farmers manage their operations: milk production tracking with charts, animal profiles, vaccination and medication records, feed consumption, and expense tracking.

## Features

- **Farmer accounts** — register/login with securely hashed passwords (bcrypt)
- **Dashboard** — per-animal daily milk production charts (Chart.js)
- **Animal profiles** — register animals, view herd with production share chart
- **Milk production** — record morning/evening milking sessions per animal
- **Expenses** — categorized expense tracking with running total
- **Vaccination records** — with next-due-date tracking
- **Medication records** — treatments, doses, veterinarian details
- **Feed consumption** — feed type, quantity, and cost per animal
- **Farmer profile & settings** — edit farm details, change password

## Tech Stack

- Node.js + Express 5
- EJS templates
- SQLite (better-sqlite3) — zero-config, auto-creates and seeds the database on first run
- express-session for auth sessions

## Run Locally

```bash
npm install
npm start
```

Then open http://localhost:3000.

On first run the database is created at `data/oson_farm.db` and seeded with demo data.

**Demo login:** `john@example.com` / `demo1234` (or `mary@example.com` / `demo1234`)

## Deploy to Render (free)

This repo includes a `render.yaml` blueprint:

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect the `Aubrey359/Oson-Farm` repository (branch: `trunk`).
3. Click **Apply** — Render builds and deploys automatically. `SESSION_SECRET` is generated for you.

> **Note on data persistence:** the free tier has an ephemeral disk, so the SQLite database resets to seed data on every deploy/restart. For persistent data, add a Render Disk (paid) mounted at `/var/data` and set the env var `DB_PATH=/var/data/oson_farm.db`.

## Configuration (environment variables)

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `SESSION_SECRET` | dev fallback | Session cookie signing secret — set in production |
| `DB_PATH` | `./data/oson_farm.db` | SQLite database file location |

## Project Structure

```
server.js              App entry point: Express setup, middleware, route mounting
db/
  index.js             SQLite connection + schema (auto-created on first run)
  seed.js              Demo data inserted into a brand-new database
  queries.js           Shared SQL statements (all parameterized)
  mysql-schema.sql     Original MySQL schema, kept for reference only
routes/
  auth.js              Register, login, logout
  farm.js              Dashboard, animal profiles, milk production
  records.js           Expenses, vaccination, medication, feed consumption
  account.js           Farmer profile, settings (password change)
lib/
  utils.js             Helpers that shape data for the Chart.js views
views/                 EJS page templates (partials start with _)
public/                Stylesheets and client-side JS served statically
```
