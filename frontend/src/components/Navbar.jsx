import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
  Bell,
  LogOut,
  Calendar,
  Users,
  MessageSquarePlus,
  MessageCirclePlus,
  Radio,
  BookOpen,
  CheckCircle,
  Clock,
  ShieldCheck,
  GraduationCap,
  Sparkles
} from 'lucide-react';

import {
  getMyNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi
} from '../api/notifications';

import { Badge } from './ui/Badge';
import { Logo } from './ui/Logo';


export const Navbar = () => {

  const {
    user,
    logout,
    isAdmin,
    isFaculty,
    isStudent
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);


  // ============================================================
  // FETCH NOTIFICATIONS
  // ============================================================

  const fetchNotifications = async () => {

    if (!user) return;

    try {

      const data = await getMyNotificationsApi();

      setNotifications(data);

      setUnreadCount(
        data.filter((n) => !n.is_read).length
      );

    } catch {
      // Silent error
    }
  };


  useEffect(() => {

    fetchNotifications();

    const iv = setInterval(
      fetchNotifications,
      15000
    );

    return () => clearInterval(iv);

  }, [user]);


  // ============================================================
  // MARK ONE NOTIFICATION AS READ
  // ============================================================

  const handleMarkRead = async (id) => {

    try {

      await markNotificationReadApi(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, is_read: true }
            : n
        )
      );

      setUnreadCount((c) =>
        Math.max(0, c - 1)
      );

    } catch {
      // Silent error
    }
  };


  // ============================================================
  // MARK ALL NOTIFICATIONS AS READ
  // ============================================================

  const handleMarkAllRead = async () => {

    try {

      await markAllNotificationsReadApi();

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true
        }))
      );

      setUnreadCount(0);

    } catch {
      // Silent error
    }
  };


  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {

    logout();

    navigate('/login');

  };


  // ============================================================
  // NAVIGATION LINK
  // ============================================================

  const navLink = (
    to,
    label,
    Icon,
    exact = false
  ) => {

    const active = exact
      ? location.pathname === to
      : location.pathname.startsWith(to);

    return (

      <Link
        to={to}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
          active
            ? 'bg-[#9BE5E3]/30 text-[#1F7A78] border border-[#9BE5E3]/60'
            : 'text-[#3D3F4A] hover:text-[#0D0F0D] hover:bg-[#F0F2F5]'
        }`}
      >

        {Icon && (
          <Icon className="w-3.5 h-3.5" />
        )}

        {label}

      </Link>

    );
  };


  // ============================================================
  // ROLE BADGE
  // ============================================================

  const roleBadge = isAdmin ? (

    <Badge
      variant="warm"
      size="sm"
      icon={ShieldCheck}
    >
      Admin
    </Badge>

  ) : isFaculty ? (

    <Badge
      variant="cyan"
      size="sm"
      icon={Sparkles}
    >
      Faculty
    </Badge>

  ) : (

    <Badge
      variant="neutral"
      size="sm"
      icon={GraduationCap}
    >
      {user?.section || 'Student'}
    </Badge>

  );


  return (

    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E8EE] shadow-sd-sm">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-14">


          {/* =====================================================
              BRAND + NAVIGATION
          ====================================================== */}

          <div className="flex items-center gap-6">

            <Logo
              size="sm"
              subtitle="Classroom"
              href="/"
            />


            <nav className="hidden md:flex items-center gap-1">


              {/* =================================================
                  ADMIN NAVIGATION
              ================================================== */}

              {isAdmin && (

                <>

                  {navLink(
                    '/admin/users',
                    'Users',
                    Users
                  )}

                  {navLink(
                    '/admin/doubt-monitor',
                    'Doubt Monitor',
                    MessageSquarePlus
                  )}

                </>

              )}


              {/* =================================================
                  FACULTY NAVIGATION
              ================================================== */}

              {isFaculty && (

                <>

                  {navLink(
                    '/faculty',
                    'Hub',
                    Radio,
                    true
                  )}

                  {navLink(
                    '/faculty/timetable',
                    'Schedule',
                    Calendar
                  )}

                </>

              )}


              {/* =================================================
                  STUDENT NAVIGATION
              ================================================== */}

              {isStudent && (

                <>

                  {/* Portal */}

                  {navLink(
                    '/student',
                    'Portal',
                    BookOpen,
                    true
                  )}


                  {/* Timetable */}

                  {navLink(
                    '/student/timetable',
                    'Timetable',
                    Calendar
                  )}


                  {/* =================================================
                      ASK DOUBT
                  ================================================== */}

                  {navLink(
                    '/student/ask-faculty',
                    'Ask Doubt',
                    MessageCirclePlus
                  )}

                </>

              )}

            </nav>

          </div>


          {/* =====================================================
              RIGHT ACTIONS
          ====================================================== */}

          <div className="flex items-center gap-2.5">


            {/* =================================================
                ROLE BADGE
            ================================================== */}

            {roleBadge}


            {/* =================================================
                NOTIFICATIONS
            ================================================== */}

            <div className="relative">

              <button
                onClick={() =>
                  setShowNotifications(
                    !showNotifications
                  )
                }
                className="relative p-2 rounded-xl text-[#3D3F4A] hover:text-[#0D0F0D] hover:bg-[#F0F2F5] transition-colors cursor-pointer"
                title="Notifications"
              >

                <Bell className="w-4 h-4" />


                {unreadCount > 0 && (

                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#9BE5E3] text-[#0D0F0D] font-extrabold text-[9px] rounded-full flex items-center justify-center px-0.5 shadow-sd-xs">

                    {unreadCount > 9
                      ? '9+'
                      : unreadCount}

                  </span>

                )}

              </button>


              {/* =================================================
                  NOTIFICATION DROPDOWN
              ================================================== */}

              {showNotifications && (

                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E4E8EE] rounded-3xl shadow-sd-xl z-50 overflow-hidden">


                  {/* Drawer Header */}

                  <div
                    className="px-4 py-3 border-b border-[#F0F2F5] flex items-center justify-between"
                    style={{
                      background:
                        'linear-gradient(135deg, #FEF9E8 0%, #F5F7F8 100%)'
                    }}
                  >

                    <div className="flex items-center gap-2">

                      <Bell className="w-3.5 h-3.5 text-[#7A620E]" />

                      <span className="text-xs font-extrabold text-[#0D0F0D] uppercase tracking-wider">
                        Notifications
                      </span>


                      {unreadCount > 0 && (

                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#9BE5E3]/40 text-[#1F7A78] border border-[#9BE5E3]/50">

                          {unreadCount} new

                        </span>

                      )}

                    </div>


                    {unreadCount > 0 && (

                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[#1F7A78] hover:underline font-bold cursor-pointer"
                      >
                        Mark all read
                      </button>

                    )}

                  </div>


                  {/* Notifications List */}

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#F0F2F5]">


                    {notifications.length === 0 ? (

                      <div className="py-8 text-center text-xs text-[#8A8B97]">
                        No notifications yet
                      </div>

                    ) : (

                      notifications.map((n) => (

                        <div
                          key={n.id}
                          onClick={() =>
                            !n.is_read &&
                            handleMarkRead(n.id)
                          }
                          className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                            n.is_read
                              ? 'bg-white text-[#8A8B97]'
                              : 'bg-[#E6FAF9]/50 text-[#0D0F0D]'
                          } hover:bg-[#F5F7F8]`}
                        >

                          <div className="mt-0.5 flex-shrink-0">

                            {n.is_read ? (

                              <CheckCircle className="w-3.5 h-3.5 text-[#B8BAC4]" />

                            ) : (

                              <span className="w-2.5 h-2.5 rounded-full bg-[#3DA8A5] block shadow-sd-xs" />

                            )}

                          </div>


                          <div className="flex-1 min-w-0">

                            <p className="text-xs font-semibold leading-relaxed">
                              {n.message}
                            </p>


                            <span className="text-[10px] text-[#8A8B97] mt-0.5 flex items-center gap-1">

                              <Clock className="w-3 h-3" />

                              {new Date(
                                n.created_at
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }
                              )}

                            </span>

                          </div>

                        </div>

                      ))

                    )}

                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                USER INFORMATION
            ================================================== */}

            <div className="hidden sm:flex flex-col items-end pl-2.5 border-l border-[#E4E8EE]">

              <span className="text-xs font-bold text-[#0D0F0D] leading-tight">
                {user?.name}
              </span>

              <span className="text-[10px] text-[#8A8B97] font-medium leading-tight">
                {user?.email}
              </span>

            </div>


            {/* =================================================
                LOGOUT
            ================================================== */}

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[#8A8B97] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign Out"
            >

              <LogOut className="w-4 h-4" />

            </button>

          </div>

        </div>

      </div>

    </header>

  );

};