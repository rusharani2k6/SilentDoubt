# SilentDoubt (SD) 🤫🎓
> *"Ask your doubts silently" — Real-time collaborative classroom doubt resolution & polling platform*

---

## 📖 Overview

**SilentDoubt** is a real-time web application designed to eliminate classroom anxiety and optimize live lecture interactions. It allows students to submit questions **silently and anonymously**, upvote peer questions, re-raise (bump) unanswered doubts, and participate in live polls without disrupting the instructor. Instructors can monitor live attendance, manage incoming questions, resolve doubts, and check classroom pulse through instant polls.

---

## ⚡ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React (Vite) + Tailwind CSS | Fast modern UI with Lucide icons |
| **Backend** | FastAPI (Python 3.10+) | Asynchronous REST & WebSocket server |
| **Real-Time** | Native FastAPI WebSockets | Room-based real-time events with per-recipient anonymity filtering |
| **Database** | SQLite + SQLAlchemy 2.0 | Zero configuration database (swappable to PostgreSQL) |
| **Auth** | JWT (`python-jose` + `passlib[bcrypt]`) | Role-based access control (Admin, Faculty, Student) |

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
cd silentdoubt/backend

# (Optional) Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed initial database with demo users & timetables
python seed_data.py

# Start backend server on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API Swagger Docs will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 2. Frontend Setup

```bash
cd silentdoubt/frontend

# Install node dependencies
npm install

# Start Vite development server on port 5173
npm run dev
```

Frontend application will be accessible at: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Demo Personas & Credentials

The Login page includes **1-Click Quick Fill** buttons for immediate testing:

| Persona | Email | Password | Role / Section |
|---|---|---|---|
| 👑 **System Admin** | `admin@silentdoubt.edu` | `admin123` | `admin` |
| 👨‍🏫 **Faculty (Dr. Sarah Smith)** | `faculty@silentdoubt.edu` | `faculty123` | `faculty` |
| 🎓 **Student 1 (Alex Rivera)** | `alex@silentdoubt.edu` | `student123` | `student` (`2-CSM-F`) |
| 🎓 **Student 2 (Priya Sharma)** | `priya@silentdoubt.edu` | `student123` | `student` (`2-CSM-F`) |

---

## 🎯 Key Features

1. **Anonymous Real-Time Doubts**:
   - Students can toggle the Anonymity switch.
   - When anonymous, the server strips student identity (`student_id`, `student_name`) for faculty and peers, but acknowledges the student on their own screen (`You (Anonymous)`).
2. **1-Click Upvotes & Dynamic Ranking**:
   - Students upvote questions; the feed dynamically sorts by highest upvotes and recent bumps.
3. **Re-Raise / Bump Unresolved Questions**:
   - Students can bump an open doubt to bring it back to the instructor's attention.
4. **Faculty 1-Click Resolve**:
   - Instructors can resolve doubts with one click, visually updating across all student screens.
5. **Live Interactive Polls**:
   - Instructors launch custom or preset polls with real-time percentage progress bars.
   - Students vote instantly and see live classroom response distributions.
6. **Automatic Attendance**:
   - Students are marked present the exact moment they join the live room via WebSocket.
7. **Timetable & Course Management**:
   - Admin scheduler maps courses, faculties, sections, and class times.
   - Automatic alerts are dispatched to student dashboards when a lecture goes live.

---

## 🧪 Running Automated E2E Tests

Run the full end-to-end backend and real-time WebSocket test suite:

```bash
cd silentdoubt/backend
python test_backend.py
```


## Clean local run

### Backend (PowerShell)
```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python seed_data.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

If PowerShell blocks activation, run the backend with `venv\Scripts\python.exe` directly.

### Frontend (second terminal)
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite proxy sends `/api` and `/ws` requests to the FastAPI server.

### Demo accounts
- Admin: `admin@silentdoubt.edu` / `admin123`
- Faculty: `faculty@silentdoubt.edu` / `faculty123`
- Student: `alex@silentdoubt.edu` / `student123`

The Admin navigation now includes **Doubt Monitor**. It shows only actually conducted sessions, lets the admin filter by date/year/department/section, inspect doubts, reveal the submitting student's identity, resolve doubts, and flag/clear moderation status.

### Important
The project intentionally does not include `venv`, `node_modules`, or a generated SQLite database. Run `python seed_data.py` once after installing backend dependencies. If you are replacing an older project that already has `silentdoubt.db`, delete that old database before seeding so the schema is recreated cleanly.
