import React, { useState } from 'react';
import {
  Users,
  X,
  Clock,
  CheckCircle,
} from 'lucide-react';

import { Badge } from './ui/Badge';

export const AttendanceBadge = ({
  attendanceCount,
  attendanceList = [],
  isFaculty,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F8FAFC] border border-[#E4E8EE] text-xs font-bold text-[#0D0F0D] transition-all shadow-sd-sm group cursor-pointer"
        title="View Attendance List"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>

          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>

        <Users className="w-3.5 h-3.5 text-[#3DA8A5]" />

        <span>
          <strong className="text-[#0D0F0D] font-extrabold">
            {attendanceCount}
          </strong>{' '}
          Present
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">

          <div className="bg-white border border-[#E4E8EE] rounded-4xl w-full max-w-md shadow-sd-xl overflow-hidden animate-in zoom-in-95 duration-150">

            {/* Header */}
            <div className="p-5 border-b border-[#F0F2F5] flex items-center justify-between bg-[#FAFBFB]">

              <div className="flex items-center gap-2.5">

                <div className="w-8 h-8 rounded-full bg-[#9BE5E3]/40 text-[#1F7A78] flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-[#0D0F0D]">
                    Live Attendance Roster
                  </h3>

                  <p className="text-[11px] text-[#8A8B97]">
                    Auto-verified via WebSocket connection
                  </p>
                </div>

              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-[#8A8B97] hover:text-[#0D0F0D] hover:bg-[#F0F2F5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

            {/* Students List */}
            <div className="p-4 max-h-96 overflow-y-auto divide-y divide-[#F0F2F5]">

              {attendanceList.length === 0 ? (

                <div className="text-center py-8 text-xs text-[#8A8B97]">
                  No attendance records recorded yet.
                </div>

              ) : (

                attendanceList.map((att, idx) => (

                  <div
                    key={`${att.student_id}-${idx}`}
                    className="py-2.5 flex items-center justify-between"
                  >

                    <div className="flex items-center gap-2.5">

                      <div className="w-7 h-7 rounded-full bg-[#3DA8A5]/10 text-[#3DA8A5] font-extrabold text-xs flex items-center justify-center">
                        #
                      </div>

                      <div>

                        {/* ONLY ROLL NUMBER */}
                        <p className="text-xs font-bold text-[#0D0F0D]">
                          {att.roll_number || 'Roll Number Not Available'}
                        </p>

                        <span className="text-[10px] text-[#8A8B97] flex items-center gap-1">

                          <Clock className="w-3 h-3" />

                          Joined at{' '}
                          {att.joined_at
                            ? new Date(
                                att.joined_at
                              ).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '--'}

                        </span>

                      </div>

                    </div>

                    <Badge
                      variant="success"
                      size="sm"
                      icon={CheckCircle}
                    >
                      Verified
                    </Badge>

                  </div>

                ))
              )}

            </div>

            {/* Footer */}
            <div className="p-3.5 bg-[#FAFBFB] border-t border-[#F0F2F5] text-center text-[11px] text-[#8A8B97] font-medium">
              Attendance is registered automatically the second a student opens the room.
            </div>

          </div>

        </div>
      )}
    </>
  );
};