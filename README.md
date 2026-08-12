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
- Assignments/Tasks (All/Pending/Submitted filters, progress bars, tap-to-toggle Pending↔Submitted status) + Add Task
- GPA Tracker (CGPA, per-course status, semester history) + Add Course (live grade-point calculator)
- Study Notes (tag filters, shared/private) + Add Note (tag creation, share toggle)
- Profile (read-only, reached via the profile menu)
- Important Documents (upload/view/delete PDFs, JPGs, PNGs)
- Projects (text-based project entries with PDF/image attachments, add/edit/delete)

## What's new since the last build

- **Profile menu** replaces the old top-bar `+` button on every tab screen. Tapping it opens an Android-style popup menu with Profile, Important Documents, Projects, and Logout.
- **Floating Action Buttons** — the `+` that used to live in each screen's header now sits as a proper FAB in the bottom-right corner of Routine, Tasks, GPA, and Notes (the screens where creating something makes sense). Home has no FAB since there's nothing to create there.
- **Centralized 401 handling** — any API call that comes back `401 Unauthorized` now triggers an automatic logout + redirect to Login, with a "Session expired" alert. This lives in `src/utils/authEvents.js` + the axios interceptor in `src/api/client.js`, so individual screens never need to catch auth errors themselves.
- **Back-stack safety** — logging out (or being logged out by a 401) swaps the entire navigator tree from the authenticated stack to the auth stack, so the Android back button can't return to a protected screen afterward.
- **Task status toggle** — tap the Pending/Submitted pill on any task card to flip its status. Updates optimistically and reverts with an error alert if the API call fails.
- **Deadline notifications** — local Android notifications (via `expo-notifications`) fire the evening before a task is due, the morning it's due, and immediately for anything freshly overdue. Tapping a notification jumps to the Tasks tab. Scheduling logic lives in `src/utils/notifications.js` and runs whenever Home or Tasks loads.
- **Important Documents & Projects** are backed by new `Document` and `Project` models on the backend, with file uploads handled by `multer` and served from `/uploads`. Every document/project/task/note query is already scoped to `req.user._id` server-side — a user genuinely cannot fetch another user's data by guessing an ID.

## Setup notes for the new features

```bash
cd frontend
npm install    # picks up expo-document-picker, expo-image-picker, expo-notifications
```

```bash
cd backend
npm install    # picks up multer
```

- **File storage**: uploaded documents and project attachments are stored locally on disk under `backend/uploads/` and served via `express.static`. This is the simplest option for a student project but isn't durable across redeploys — if you later move to a host with an ephemeral filesystem (e.g. some free tiers), swap `middleware/upload.js` for a Cloudinary or S3-backed storage engine; the rest of the code (models, routes, frontend) won't need to change since they just store/read a URL.
- **Notifications on Android**: `expo-notifications` will prompt for permission the first time the app opens. Since this is Expo SDK 51, local (non-push) scheduled notifications work fine in Expo Go on Android — no custom dev build required.
- **Image/PDF pickers**: `expo-document-picker` uses Android's Storage Access Framework, so no broad storage permission is requested. `expo-image-picker` will ask for photo-library access only when a user taps "Add Image" on a project.

## Known limitations / good next steps

- The profile popup menu is positioned with a fixed offset from the top of the screen; it looks right on standard phone sizes but hasn't been tuned against every possible header height.
- Project editing (`AddProjectScreen` in edit mode) re-fetches the whole project list to find the one being edited, since there's no single-project `GET` endpoint yet — fine at student-project scale, but worth adding a `GET /api/projects/:id` route if the list grows large.
- Notification "already notified" tracking for overdue tasks is in-memory only (resets on app restart), so if a task is still overdue after a restart you may get a second overdue notification for it. Easy to persist to AsyncStorage if that matters to you.

## Notes on the design

The color palette, card styles, and pill/badge styles are pulled directly from your Figma-style mockups: indigo header banner (`#2E2A78`), dark cards (`#15132B`) on a light background (`#EBEBF0`), with a violet primary accent (`#5A4FE0`). All of this lives in `frontend/src/theme/theme.js` if you want to adjust it.

## What you may want to add next

- Real Google OAuth integration on the frontend (the backend endpoint is ready to receive a verified profile)
- Push notifications for due-soon tasks
- Offline caching / optimistic updates
- Note attachments (images/files) — currently text-only
- Empty/first-run illustrations for a nicer zero-state
