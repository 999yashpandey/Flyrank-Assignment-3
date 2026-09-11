# To-Do List API — MERN, now with SQLite (no MongoDB)

Express + React + Node. Storage has moved from an in-memory array to a
real **SQLite** database (`tasks.db`), using `better-sqlite3`. The API
itself didn't change — same endpoints, same request/response shapes —
only where the data lives. Restarting the server no longer wipes your
tasks.

```
mern-todo/
├── backend/
│   ├── server.js      Express routes — now run SQL instead of array ops
│   ├── db.js           opens/creates tasks.db, creates the table, seeds it
│   ├── tasks.db         the actual database file (created on first run)
│   ├── openapi.json     OpenAPI spec for Swagger UI
│   └── package.json
└── frontend/            React app that talks to the API (bonus)
```

## Endpoints (unchanged)

| Method | Path         | Does what                     | Success | Failure |
|--------|--------------|--------------------------------|---------|---------|
| GET    | `/`          | API info                       | 200     | —       |
| GET    | `/health`    | Health check                   | 200     | —       |
| GET    | `/tasks`     | List all tasks                 | 200     | —       |
| GET    | `/tasks/:id` | Get one task                   | 200     | 404     |
| POST   | `/tasks`     | Create a task (`{"title": ""}`)| 201     | 400     |
| PUT    | `/tasks/:id` | Update title and/or done       | 200     | 400/404 |
| DELETE | `/tasks/:id` | Delete a task                  | 204     | 404     |

A task looks like: `{ "id": 1, "title": "Buy milk", "done": false }`

## What changed under the hood

- `db.js` opens (or creates) `tasks.db`, creates the `tasks` table if it
  doesn't exist, and seeds 3 example tasks **only if the table is
  empty** — so re-running the server never duplicates them.
- Every route in `server.js` that used to touch an array now runs a
  prepared SQL statement instead (`SELECT`, `INSERT`, `UPDATE`,
  `DELETE`). The 404 error body is now exactly `{ "error": "Task not
  found" }`, matching the assignment spec.
- `tasks.db` is gitignored — it's a generated file, not source code.
  Each person running this app gets their own local database.

## Run the backend

```bash
cd backend
npm install
npm start          # or: npm run dev, with nodemon auto-restart
```

The first time you run it, you'll see `Seeded tasks.db with 3 example
tasks` in the console, and a `tasks.db` file will appear in `backend/`.
Restart it again — that message won't reappear, and your tasks are
still there.

- API: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/docs`

## Run the frontend (optional bonus)

```bash
cd frontend
npm install
npm start
```
