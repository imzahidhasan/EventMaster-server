# 🛠️ EventMaster — Backend API (Express + MongoDB)

**EventMaster** is a full-featured event management web application where users can create, view, join, update, and delete events.  
This is the **backend (server)** of the project, built using **Node.js**, **Express**, and **MongoDB** with **JWT authentication**.

---

## 📦 Tech Stack

- ⚙️ Node.js + Express
- 🔒 JWT Authentication (with HTTP-only cookies)
- 🗃️ MongoDB + Mongoose
- 🍪 Cookie Parser
- 🌐 CORS-enabled API for frontend integration

---

## 🔐 Authentication Features

- ✅ Custom login & registration with hashed passwords (bcrypt)
- ✅ JWT issued on login and stored in **HTTP-only cookie**
- ✅ Protected routes using middleware (`requireAuth`)
- ✅ Authenticated users can:
  - Add events
  - Join events (only once)
  - View their own events
  - Update or delete their events

---

## 📁 Project Structure

```
server/
│
├── middleware/         # JWT auth checker
├── models/            # Mongoose schemas
├── routes/            # Express routers
├── .env               # Env vars (JWT_SECRET, Mongo URI)
├── server.js          # Entry point
└── package.json
```

---

## ⚙️ Environment Setup

Create a `.env` file in the root:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
```

## 🚀 Server Startup Process

1. **Install dependencies:**
    ```bash
    npm install
    ```

2. **Install nodemon for development (optional):**
    ```bash
    npm install -g nodemon
    ```

3. **Start the development server:**
    ```bash
    npm run dev
    ```
    or with nodemon:
    ```bash
    nodemon server.js
    ```
    or without nodemon:
    ```bash
    node server.js
    ```

4. **Server will start on:**
    ```
    http://localhost:5000
    ```

5. **Verify connection:**
    - MongoDB connection established
    - JWT middleware loaded
    - API routes registered
    - Server listening on specified port