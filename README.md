# Skill Exchange

A beginner full‑stack app where SRM students can list the skills they **offer** and **need**, get automatic matches, connect with each other, and chat in real time.

## Features
- **SRM-only auth**: signup/login restricted to `@srmist.edu.in`
- **Profile skills**: update “skills offered” and “skills needed”
- **Automatic matches**: finds users who offer what you need
- **Connection requests**: send, accept, reject, disconnect
- **Chat**: message your connections
- **Real-time messaging**: Socket.IO delivers messages instantly when the receiver is online

## Tech stack
- **Frontend**: React (CRA), React Router, Axios, Socket.IO Client, React Hot Toast
- **Backend**: Node.js, Express, Mongoose/MongoDB, JWT, Socket.IO

## Project structure
- `src/`: React frontend
- `backend/`: Express API + Socket.IO server

## Prerequisites
- Node.js + npm
- MongoDB:
  - **Local MongoDB** at `mongodb://127.0.0.1:27017` (recommended for local dev), or
  - MongoDB Atlas (make sure network/IP access is configured)

## Environment variables
Create `backend/.env` (see `backend/.env.example`).

- **`MONGO_URI`**: Mongo connection string
- **`JWT_SECRET`**: secret used to sign/verify JWTs (recommended to set)
- **`PORT`**: backend port (default `5000`)

Optional frontend env:
- **`REACT_APP_API_URL`**: backend origin for Socket.IO (defaults to `http://localhost:5000`)

## Run locally

### 1) Start backend
From `backend/`:

```bash
node server.js
```

Backend runs on `http://localhost:5000`.

### 2) Start frontend
From repo root:

```bash
npm install
npm start
```

Frontend runs on `http://localhost:3000`.

## API overview
Base URL: `http://localhost:5000/api`

- **Auth**
  - `POST /auth/signup`
  - `POST /auth/login`
- **Users**
  - `PUT /users/profile`
  - `GET /users/matches`
  - `POST /users/connect`
  - `GET /users/requests`
  - `POST /users/accept`
  - `POST /users/reject`
  - `GET /users/connections`
  - `POST /users/disconnect`
- **Chat**
  - `GET /chat/:connectionId`
  - `POST /chat/send`

## Socket.IO (real-time)
- Socket server runs on `http://localhost:5000`
- Client connects with:
  - `auth: { token }` where `token` is the JWT from login
- Server emits:
  - `newMessage` to the receiver when they’re online

## Deployment notes (quick checklist)
- Use a production MongoDB (Atlas) and configure network access
- Set a strong `JWT_SECRET`
- Restrict CORS + Socket.IO origins to your frontend domain
- Set frontend API base URL / environment variables to point to your deployed backend
