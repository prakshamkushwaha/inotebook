# iNotebook — Full-stack note-taking app (JavaScript)

A responsive note-taking app built with **React (JavaScript/JSX)**, Tailwind CSS, Node.js, Express, and MongoDB. No TypeScript is used. Features include signup/login, JWT-protected notes, search, category filtering, editing, and deleting notes.

## Requirements
- Node.js 20 or newer (Node 20 LTS recommended)
- npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection URI

## 1. Install dependencies
Open PowerShell in the folder containing the root `package.json`:

```powershell
npm install
npm --prefix backend install
```

## 2. Configure the backend
Copy the example environment file:

```powershell
Copy-Item backend/.env.example backend/.env
notepad backend/.env
```

Fill in the values:

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inotebook
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5173
```

If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string. Keep `.env` private. You can generate a secret by running:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste that output as `JWT_SECRET`.

## 3. Configure the frontend
Create a `.env` file in the project root:

```powershell
Copy-Item .env.example .env
notepad .env
```

Ensure it contains:

```dotenv
VITE_API_URL=http://localhost:5000
```

## 4. Run the project
From the project root:

```powershell
npm run dev
```

Frontend: **http://localhost:5173**  
Backend: **http://localhost:5000**  
Health check: **http://localhost:5000/api/health**

Keep the terminal open while using the app. The backend starts after it connects to MongoDB.

## API routes
| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current account (JWT required) |
| GET | `/api/notes/fetchallnotes` | List current user's notes |
| POST | `/api/notes/addnote` | Create note |
| PUT | `/api/notes/updatenote/:id` | Update a note |
| DELETE | `/api/notes/deletenote/:id` | Delete a note |
| GET | `/api/health` | API health check |

## Troubleshooting
- **`MONGO_URI is missing`**: ensure `backend/.env` exists and contains `MONGO_URI`.
- **MongoDB connection error**: verify the URI, Atlas network access, and database user credentials.
- **Failed to fetch**: make sure both servers are running and `VITE_API_URL` and `CLIENT_ORIGIN` match the ports above. Restart the project after changing `.env`.
- **401 on notes**: sign in again.
- **Port already in use**: stop the older server process or change the port and matching environment values.
