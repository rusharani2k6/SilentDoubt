import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import { getMyTimetableApi } from '../../api/timetable';
import { Calendar, Clock, User, GraduationCap } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

export const StudentTimetable = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTimetableApi().then(setEntries).finally(() => setLoading(false));
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#0D0F0D] flex flex-col selection:bg-[#9BE5E3]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm" icon={GraduationCap}>
              Section {user?.section}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0D0F0D] tracking-tight">
            Class Timetable
          </h1>
          <p className="text-xs sm:text-sm text-[#3D3F4A] mt-1">
            Weekly class schedule and lecture slots for section {user?.section}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {days.map((day) => {
            const dayEntries = entries.filter((e) => e.day_of_week.toLowerCase() === day.toLowerCase());
            return (
              <Card key={day} className="flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F0F2F5]">
                  <h3 className="font-extrabold text-base text-[#0D0F0D]">{day}</h3>
                  <Badge variant="neutral" size="sm">
                    {dayEntries.length} {dayEntries.length === 1 ? 'Class' : 'Classes'}
                  </Badge>
                </div>

                {dayEntries.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#8A8B97]">
                    No classes scheduled
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayEntries.map((e) => (
                      <div
                        key={e.id}
                        className="p-3.5 rounded-2xl bg-[#FAFBFB] border border-[#E4E8EE] hover:border-[#3DA8A5] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-[#8A8B97] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {e.start_time} - {e.end_time}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-[#0D0F0D] leading-snug">{e.subject}</h4>
                        <p className="text-xs text-[#3D3F4A] mt-1 flex items-center gap-1 font-medium">
                          <User className="w-3 h-3 text-[#8A8B97]" />
                          Prof. {e.faculty ? e.faculty.name : 'Faculty Assigned'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};
