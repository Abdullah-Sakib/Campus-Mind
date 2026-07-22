# CampusMind

A student academic management app: class routines, assignments/tasks, GPA tracking, and shareable study notes.

- **Frontend:** React Native (Expo) + React Navigation
- **Backend:** Node.js / Express
- **Database:** MongoDB (Mongoose)

## Project structure

```
campusmind/
├── backend/          Express + MongoDB REST API
└── frontend/          Expo React Native app
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI and a strong JWT_SECRET
npm run dev          # nodemon, or `npm start` for plain node
```

The API listens on `http://localhost:5001` by default. Health check: `GET /`.

### Auth

- `POST /api/auth/signup` — { fullName, studentId, university, department, semester, email, password }
- `POST /api/auth/login` — { emailOrStudentId, password }
- `POST /api/auth/google` — Google Sign-In hookup (send verified profile from client SDK)
- `POST /api/auth/forgot-password` — { email }
- `POST /api/auth/reset-password` — { token, password }
- `GET /api/auth/me` — requires Bearer token

### Courses / GPA (`/api/courses`, requires Bearer token)

- `GET /` — optional `?semester=4`
- `POST /` — { semester, courseName, creditHours, grade, status }
- `PUT /:id`, `DELETE /:id`
- `GET /gpa-summary` — cumulative GPA + per-semester breakdown

### Tasks (`/api/tasks`, requires Bearer token)

- `GET /` — optional `?status=pending|submitted`
- `POST /` — { title, type, course, dueDate, priority, progress, notes }
- `PUT /:id`, `DELETE /:id`

### Class Routine (`/api/routine`, requires Bearer token)

- `GET /` — optional `?day=Sat`
- `POST /` — { day, subject, type, room, startTime, endTime, colorTag }
- `PUT /:id`, `DELETE /:id`

### Study Notes (`/api/notes`, requires Bearer token)

- `GET /` — optional `?tag=Compiler`
- `POST /` — { title, tag, content, pages, sharedWithClassmates }
- `PUT /:id`, `DELETE /:id`

### Dashboard (`/api/home`, requires Bearer token)

- `GET /dashboard` — today's classes, upcoming deadlines, current GPA, due-today count

## 2. Frontend setup

```bash
cd frontend
npm install
```

Open `src/api/client.js` and set `API_BASE_URL` to point at your backend:

- iOS simulator: `http://localhost:5001/api` works fine.
- Android emulator: use `http://10.0.2.2:5001/api`.
- Physical device (Expo Go): use your computer's LAN IP, e.g. `http://192.168.1.23:5001/api`.

Then start Expo:

```bash
npm start
```

Scan the QR code with Expo Go, or press `i` / `a` for iOS/Android simulators.

## Screens included

- Log In / Create Account / Forgot Password (matches provided auth mockups)
- Home dashboard (today's classes, upcoming deadlines, GPA + due-today stats)
- Class Routine (day tabs) + Add Class
- Assignments/Tasks (All/Pending/Submitted filters, progress bars) + Add Task
- GPA Tracker (CGPA, per-course status, semester history) + Add Course (live grade-point calculator)
- Study Notes (tag filters, shared/private) + Add Note (tag creation, share toggle)

## Notes on the design

The color palette, card styles, and pill/badge styles are pulled directly from your Figma-style mockups: indigo header banner (`#2E2A78`), dark cards (`#15132B`) on a light background (`#EBEBF0`), with a violet primary accent (`#5A4FE0`). All of this lives in `frontend/src/theme/theme.js` if you want to adjust it.

## What you may want to add next

- Real Google OAuth integration on the frontend (the backend endpoint is ready to receive a verified profile)
- Push notifications for due-soon tasks
- Offline caching / optimistic updates
- Note attachments (images/files) — currently text-only
- Empty/first-run illustrations for a nicer zero-state
