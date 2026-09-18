import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import {
  AuthProvider,
  useAuth
} from './context/AuthContext';

import { ProtectedRoute } from './components/ProtectedRoute';

// ============================================================
// PAGES
// ============================================================

// Landing / Login
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';

// Admin
import { Users as AdminUsers } from './pages/admin/Users';
import { DoubtMonitor } from './pages/admin/DoubtMonitor';

// Faculty
import { FacultyDashboard } from './pages/faculty/Dashboard';
import { FacultyTimetable } from './pages/faculty/Timetable';

// Student
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentTimetable } from './pages/student/Timetable';
import { StudentNotifications } from './pages/student/Notifications';
import { AskFaculty } from './pages/student/AskFaculty';

// Live Session
import { LiveSession } from './pages/LiveSession';


// ============================================================
// ROOT ROUTE
// ============================================================

const RootRoute = () => {
  const {
    user,
    isAuthenticated,
    loading
  } = useAuth();

  // ----------------------------------------------------------
  // AUTH LOADING
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center text-xs font-bold text-[#3D3F4A]">
        Loading DoubtFlow...
      </div>
    );
  }

  // ----------------------------------------------------------
  // NOT LOGGED IN
  // ----------------------------------------------------------

  if (!isAuthenticated) {
    return <Landing />;
  }

  // ----------------------------------------------------------
  // ADMIN
  // ----------------------------------------------------------

  if (user?.role === 'admin') {
    return (
      <Navigate
        to="/admin/users"
        replace
      />
    );
  }

  // ----------------------------------------------------------
  // FACULTY
  // ----------------------------------------------------------

  if (user?.role === 'faculty') {
    return (
      <Navigate
        to="/faculty"
        replace
      />
    );
  }

  // ----------------------------------------------------------
  // STUDENT
  // ----------------------------------------------------------

  if (user?.role === 'student') {
    return (
      <Navigate
        to="/student"
        replace
      />
    );
  }

  return <Landing />;
};


// ============================================================
// MAIN APP
// ============================================================

function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Routes>

          {/* ==================================================
              ROOT
          ================================================== */}

          <Route
            path="/"
            element={<RootRoute />}
          />


          {/* ==================================================
              LOGIN
          ================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />


          {/* ==================================================
              ADMIN ROUTES
          ================================================== */}

          <Route
            path="/admin/doubt-monitor"
            element={
              <ProtectedRoute
                allowedRoles={['admin']}
              >
                <DoubtMonitor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminUsers />
              </ProtectedRoute>
            }
          />


          {/* ==================================================
              FACULTY ROUTES
          ================================================== */}

          <Route
            path="/faculty"
            element={
              <ProtectedRoute
                allowedRoles={['faculty', 'admin']}
              >
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/faculty/timetable"
            element={
              <ProtectedRoute
                allowedRoles={['faculty', 'admin']}
              >
                <FacultyTimetable />
              </ProtectedRoute>
            }
          />


          {/* ==================================================
              STUDENT ROUTES
          ================================================== */}

          <Route
            path="/student"
            element={
              <ProtectedRoute
                allowedRoles={['student']}
              >
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/timetable"
            element={
              <ProtectedRoute
                allowedRoles={['student']}
              >
                <StudentTimetable />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute
                allowedRoles={['student']}
              >
                <StudentNotifications />
              </ProtectedRoute>
            }
          />


          {/* ==================================================
              ASK FACULTY - NEW
          ================================================== */}

          <Route
            path="/student/ask-faculty"
            element={
              <ProtectedRoute
                allowedRoles={['student']}
              >
                <AskFaculty />
              </ProtectedRoute>
            }
          />


          {/* ==================================================
              SHARED LIVE SESSION
          ================================================== */}

          <Route
            path="/session/:sessionId"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'faculty',
                  'student',
                  'admin'
                ]}
              >
                <LiveSession />
              </ProtectedRoute>
            }
          />


          {/* ==================================================
              CATCH ALL
          ================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}


export default App;