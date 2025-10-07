# Student Management System

This is a full-stack Student Management System built with React (Vite), Node.js/Express, and PostgreSQL.

## Features

- **Authentication**: JWT-based login
- **Students**: Create, read, update, soft-delete (deactivate)
- **Search & Pagination**: Server-side filtering with `ILIKE`, page/limit
- **Validation**: Client-side checks + backend validation
- **UI/UX**: Material UI, light/dark mode toggle, responsive layout
- **Observability**: Basic request logging and structured error handling

## Tech Stack

- **Frontend:** React, Vite, Material UI, React Router, Axios, Context API
- **Backend:** Node.js, Express, PostgreSQL, JWT, bcrypt
- **Database:** PostgreSQL
- **Testing:**
  - Backend: Jest, Supertest
  - Frontend: React Testing Library, Vitest

## Project Structure

```
project-root/
├── backend/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   └── .env.example
├── database/
│   └── schema.sql
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- PostgreSQL 13+ (local or Docker)

### 1. Database Setup

Create the database and run the schema with seeds. Pick one method:

- psql (Windows PowerShell / Command Prompt)
  ```bash
  psql -U postgres -h localhost -c "CREATE DATABASE student_management;"
  psql -U postgres -h localhost -d student_management -f "database/schema.sql"
  ```

- pgAdmin
  - Create DB `student_management` → open Query Tool → run `database/schema.sql`.

- Docker (if Postgres runs in a container)
  ```bash
  docker exec -i <postgres_container> psql -U postgres -d student_management < database/schema.sql
  ```

Notes:
- The schema includes a dev-only truncate block to clear tables before reseeding.
- The schema seeds an `admin` user and sample students (active + deactivated).

### 2. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file from the `.env.example` and update the variables:
    ```env
    PORT=5000
    DATABASE_URL=postgres://postgres:<password>@localhost:5432/student_management
    JWT_SECRET=change_me_in_production
    NODE_ENV=development
    ```
4.  Start the server:
    ```bash
    npm start
    ```
    The backend will be running at `http://localhost:5000`.

### 3. Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file from the `.env.example`:
    ```env
    VITE_API_BASE_URL=http://localhost:5000/api
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will be running at `http://localhost:5173`.

## API Endpoints

- `POST /api/auth/login`: Authenticate user and get JWT.
- `GET /api/students`: Get active students with search and pagination.
  
  Query params:
  - `search` (string, optional)
  - `page` (number, default 1)
  - `limit` (number, default 10)
- `GET /api/students/:id`: Get a single student.
- `POST /api/students`: Add a new student.
- `PUT /api/students/:id`: Update a student.
- `DELETE /api/students/:id`: Soft delete (deactivate) a student.

Response shape for list:
```json
{
  "students": [ { "id": 1, "name": "...", "is_active": true, ... } ],
  "pagination": { "total": 42, "page": 1, "limit": 10, "totalPages": 5 }
}
```

Auth: Include `Authorization: Bearer <token>` header for protected routes.
## Credentials & Access

- Seeded admin user (from schema):
  - username: `admin`
  - password: `password123` (placeholder; update in production!)

## Troubleshooting

- `psql: not recognized` → Install PostgreSQL and add `psql` to PATH, or use pgAdmin.
- 401 Unauthorized from API → Ensure you are logged in and the `Authorization` header is present.
- CORS errors → Confirm backend `PORT` and frontend `VITE_API_BASE_URL` match and backend uses CORS.
- Empty students list → Only `is_active = true` students are listed; check DB data and filters.

## Security Notes

- Do not commit real secrets. Use `.env` locally and a secret manager in production.
- JWTs are stored in `localStorage` for simplicity; consider `httpOnly` cookies for stronger security.

## Scripts

- Backend: `npm start` (dev), `npm test`
- Frontend: `npm run dev` (dev server), `npm test`


## Testing

### Backend

To run the backend tests:

```bash
cd backend
npm test
```

### Frontend

To run the frontend tests:

```bash
cd frontend
npm test
```
