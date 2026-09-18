import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import { getMyTimetableApi } from '../../api/timetable';
import { getActiveSessionApi } from '../../api/sessions';
import {
  GraduationCap,
  Radio,
  ArrowRight,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Sparkles,
  MessageSquareOff,
  Flame,
  BookOpen
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [timetable, setTimetable] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [ttData, actData] = await Promise.all([
        getMyTimetableApi(),
        getActiveSessionApi()
      ]);
      setTimetable(ttData);
      setActiveSession(actData);
    } catch (err) {
      console.error('Error loading student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
    const interval = setInterval(loadStudentData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#0D0F0D] flex flex-col selection:bg-[#9BE5E3]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="cyan" size="sm" icon={GraduationCap}>
                Section {user?.section || 'General'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0D0F0D] tracking-tight">
              Welcome back, {user?.name.split(' ')[0]}!
            </h1>
            <p className="text-xs sm:text-sm text-[#3D3F4A] mt-1">
              Join active lectures, submit doubts without hesitation, and vote in live classroom polls.
            </p>
          </div>
        </div>

        {/* Live Active Class Alert Banner */}
        {activeSession ? (
          <div className="mb-8 p-6 sm:p-8 rounded-4xl bg-white border-2 border-[#3DA8A5] shadow-sd-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-[#9BE5E3]/30 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-[#9BE5E3]/40 text-[#0D0F0D] border border-[#9BE5E3] mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  CLASS IN SESSION RIGHT NOW
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D0F0D]">
                  {activeSession.timetable_entry?.subject || 'Class Lecture'}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#3D3F4A] mt-2 font-medium">
                  <span className="flex items-center gap-1.5 font-semibold text-[#0D0F0D]">
                    <User className="w-3.5 h-3.5 text-[#3DA8A5]" />
                    Prof. {activeSession.faculty?.name || 'Instructor'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8A8B97]" />
                    Started at {new Date(activeSession.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="bg-[#F0F2F5] px-2.5 py-0.5 rounded-full font-bold text-[#0D0F0D] border border-[#E4E8EE]">
                    Section {activeSession.timetable_entry?.section}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="font-extrabold"
                icon={Radio}
                iconRight={ArrowRight}
                onClick={() => navigate(`/session/${activeSession.id}`)}
              >
                Join Live Class
              </Button>
            </div>
          </div>
        ) : (
          <Card className="mb-8 p-6 text-center flex flex-col items-center justify-center py-10 bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#F0F2F5] text-[#8A8B97] flex items-center justify-center mb-3">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#0D0F0D] mb-1">No Active Session Right Now</h3>
            <p className="text-xs text-[#3D3F4A] max-w-md">
              When your professor launches a live session for section <strong>{user?.section}</strong>, the "Join Class" button will automatically appear here.
            </p>
          </Card>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <StatCard
            label="Section Courses"
            value={timetable.length.toString()}
            icon={BookOpen}
            color="cyan"
            description="Enrolled this semester"
          />
          <StatCard
            label="Identity Protection"
            value="100% Anon"
            icon={ShieldCheck}
            color="warm"
            description="Guaranteed privacy switch"
          />
          <StatCard
            label="Live Attendance"
            value="Auto-Sync"
            icon={Clock}
            color="primary"
            description="Marked on room entry"
          />
        </div>

        {/* Scheduled Courses */}
        <div>
          <h2 className="text-base font-extrabold text-[#0D0F0D] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#3DA8A5]" />
            Your Weekly Course Schedule
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {timetable.map((item) => (
              <Card
                key={item.id}
                hover
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <Badge variant="cyan" size="sm">
                      {item.day_of_week}
                    </Badge>
                    <span className="text-xs text-[#8A8B97] flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {item.start_time} - {item.end_time}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#0D0F0D] mb-2 leading-snug">
                    {item.subject}
                  </h3>

                  <p className="text-xs text-[#3D3F4A] flex items-center gap-1.5 mb-4 font-medium">
                    <User className="w-3.5 h-3.5 text-[#8A8B97]" />
                    Prof. {item.faculty ? item.faculty.name : 'Faculty Assigned'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0F2F5] text-xs font-bold text-[#8A8B97]">
                  Section {item.section}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
