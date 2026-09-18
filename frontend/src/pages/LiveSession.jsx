import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSessionSocket } from '../ws/useSessionSocket';
import { endSessionApi } from '../api/sessions';
import { Navbar } from '../components/Navbar';
import { DoubtCard } from '../components/DoubtCard';
import { PollWidget } from '../components/PollWidget';
import { AttendanceBadge } from '../components/AttendanceBadge';
import { CreatePollModal } from '../components/CreatePollModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

import {
  Send,
  UserX,
  UserCheck,
  BarChart2,
  Search,
  CheckCircle,
  LogOut,
  Info,
  Sparkles,
} from 'lucide-react';

export const LiveSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const {
    user,
    token,
    isFaculty,
    isStudent,
    isAdmin,
  } = useAuth();

  const [doubtText, setDoubtText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [endingSession, setEndingSession] = useState(false);

  const {
    connected,
    sessionData,
    doubts,
    polls,
    attendance,
    attendanceCount,
    sessionEnded,
    error: socketError,

    submitDoubt,
    upvoteDoubt,
    bumpDoubt,
    resolveDoubt,

    // NEW: faculty answer
    answerDoubt,

    createPoll,
    respondPoll,
    closePoll,
  } = useSessionSocket(
    parseInt(sessionId, 10),
    token
  );

  /* -----------------------------------------
     STUDENT: ASK DOUBT
  ------------------------------------------ */

  const handleSendDoubt = (e) => {
    e.preventDefault();

    const cleanText = doubtText.trim();

    if (!cleanText) return;

    submitDoubt(cleanText, isAnonymous);

    setDoubtText('');
  };

  /* -----------------------------------------
     FACULTY: END SESSION
  ------------------------------------------ */

  const handleEndSession = async () => {
    if (
      !window.confirm(
        'Are you sure you want to end this live lecture for all participants?'
      )
    ) {
      return;
    }

    setEndingSession(true);

    try {
      await endSessionApi(sessionId);
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          'Failed to end session'
      );

      setEndingSession(false);
    }
  };

  /* -----------------------------------------
     FILTER + SEARCH DOUBTS
  ------------------------------------------ */

  const filteredDoubts = useMemo(() => {
    let list = [...doubts];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      list = list.filter((d) =>
        d.text?.toLowerCase().includes(q)
      );
    }

    // Filters
    if (filterTab === 'open') {
      list = list.filter(
        (d) => d.status === 'open'
      );
    }

    if (filterTab === 'resolved') {
      list = list.filter(
        (d) => d.status === 'resolved'
      );
    }

    if (filterTab === 'bumped') {
      list = list.filter(
        (d) => !!d.bumped_at
      );
    }

    if (filterTab === 'top') {
      list.sort(
        (a, b) =>
          (b.upvote_count || 0) -
          (a.upvote_count || 0)
      );
    }

    // Default sorting
    if (filterTab !== 'top') {
      list.sort((a, b) => {
        // Open first
        if (a.status !== b.status) {
          return a.status === 'open' ? -1 : 1;
        }

        // Re-raised first
        if (a.bumped_at && !b.bumped_at) {
          return -1;
        }

        if (!a.bumped_at && b.bumped_at) {
          return 1;
        }

        // Upvotes
        if (
          (b.upvote_count || 0) !==
          (a.upvote_count || 0)
        ) {
          return (
            (b.upvote_count || 0) -
            (a.upvote_count || 0)
          );
        }

        // Latest
        return (
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
        );
      });
    }

    return list;
  }, [
    doubts,
    filterTab,
    searchQuery,
  ]);

  const activePolls = polls.filter(
    (p) => p.status === 'open'
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#0D0F0D] flex flex-col selection:bg-[#9BE5E3]">

      <Navbar />

      {/* =========================================
          LIVE CLASSROOM HEADER
      ========================================= */}

      <div className="bg-white/95 border-b border-[#E4E8EE] sticky top-16 z-30 backdrop-blur-md shadow-sd-sm">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div className="flex items-center gap-3">

            {/* LIVE INDICATOR */}

            <div className="flex items-center gap-2">

              <span className="relative flex h-2.5 w-2.5">

                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    sessionEnded
                      ? 'bg-slate-400'
                      : 'bg-emerald-400'
                  }`}
                />

                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    sessionEnded
                      ? 'bg-slate-400'
                      : 'bg-emerald-500'
                  }`}
                />

              </span>

              <span className="text-xs font-extrabold uppercase tracking-wider">
                {sessionEnded
                  ? 'Class Finished'
                  : 'Live Classroom'}
              </span>

            </div>

            <div className="h-4 w-px bg-[#E4E8EE] hidden sm:block" />

            {/* SUBJECT */}

            <div className="flex flex-col">

              <h2 className="text-sm sm:text-base font-extrabold leading-tight">

                {sessionData?.timetable_entry?.subject ||
                  'Lecture in Session'}

              </h2>

              <span className="text-xs text-[#3D3F4A]">

                Section{' '}

                <strong>
                  {sessionData?.timetable_entry?.section ||
                    user?.section ||
                    '-'}
                </strong>

                {' • '}

                {sessionData?.faculty?.name
                  ? `Prof. ${sessionData.faculty.name}`
                  : 'Live Room'}

              </span>

            </div>

          </div>

          {/* RIGHT HEADER */}

          <div className="flex items-center gap-2.5 self-end sm:self-auto">

            <AttendanceBadge
              attendanceCount={attendanceCount}
              attendanceList={attendance}
              isFaculty={isFaculty}
            />

            {(isFaculty || isAdmin) &&
              !sessionEnded && (
                <Button
                  variant="danger"
                  size="sm"
                  disabled={endingSession}
                  onClick={handleEndSession}
                  icon={LogOut}
                >
                  End Session
                </Button>
              )}

            {isStudent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate('/student')
                }
              >
                Leave Room
              </Button>
            )}

          </div>

        </div>

      </div>

      {/* =========================================
          MAIN
      ========================================= */}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* =====================================
            LEFT COLUMN
        ===================================== */}

        <section className="lg:col-span-8 flex flex-col space-y-4">

          {/* SESSION ENDED */}

          {sessionEnded && (
            <Card className="text-center p-6 space-y-2 bg-[#FAFBFB]">

              <div className="w-10 h-10 rounded-full bg-[#9BE5E3]/40 text-[#1F7A78] flex items-center justify-center mx-auto">

                <CheckCircle className="w-5 h-5" />

              </div>

              <h3 className="text-base font-extrabold">
                This lecture session has ended
              </h3>

              <p className="text-xs text-[#3D3F4A] max-w-md mx-auto">

                All attendance, doubts, and poll
                results have been preserved.

              </p>

              <div className="pt-2">

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    navigate(
                      isFaculty
                        ? '/faculty'
                        : '/student'
                    )
                  }
                >
                  Return to Dashboard
                </Button>

              </div>

            </Card>
          )}

          {/* =====================================
              STUDENT ASK DOUBT
          ===================================== */}

          {isStudent && !sessionEnded && (
            <Card className="p-4 sm:p-5 shadow-sd-md bg-white border-[#E4E8EE]">

              <form onSubmit={handleSendDoubt}>

                <div className="flex items-center justify-between mb-2">

                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D3F4A] flex items-center gap-1.5">

                    <Sparkles className="w-3.5 h-3.5 text-[#3DA8A5]" />

                    Ask Your Question Silently

                  </span>

                  {/* ANONYMOUS */}

                  <label className="flex items-center gap-2 cursor-pointer select-none">

                    <span className="text-xs font-bold flex items-center gap-1">

                      {isAnonymous ? (
                        <>
                          <UserX className="w-3.5 h-3.5 text-[#3DA8A5]" />

                          <span className="text-[#3DA8A5]">
                            Anonymous Mode
                          </span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-[#3D3F4A]" />

                          <span>
                            Public Name
                          </span>
                        </>
                      )}

                    </span>

                    <div className="relative">

                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) =>
                          setIsAnonymous(
                            e.target.checked
                          )
                        }
                        className="sr-only"
                      />

                      <div
                        className={`w-9 h-5 rounded-full transition-colors ${
                          isAnonymous
                            ? 'bg-[#3DA8A5]'
                            : 'bg-[#D1D5DB]'
                        }`}
                      />

                      <div
                        className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
                          isAnonymous
                            ? 'translate-x-4'
                            : ''
                        }`}
                      />

                    </div>

                  </label>

                </div>

                {/* TEXTAREA */}

                <div className="relative">

                  <textarea
                    rows={2}
                    required
                    value={doubtText}
                    onChange={(e) =>
                      setDoubtText(e.target.value)
                    }
                    placeholder="Type your question here without disrupting the lecture flow..."
                    className="w-full bg-[#FAFBFB] border border-[#E4E8EE] rounded-2xl p-3.5 text-sm text-[#0D0F0D] placeholder-[#8A8B97] focus:outline-none focus:border-[#3DA8A5] focus:bg-white font-medium resize-none pr-12"
                    onKeyDown={(e) => {

                      if (
                        e.key === 'Enter' &&
                        !e.shiftKey
                      ) {
                        e.preventDefault();
                        handleSendDoubt(e);
                      }

                    }}
                  />

                  <button
                    type="submit"
                    disabled={!doubtText.trim()}
                    className="absolute right-2.5 bottom-3.5 p-2 rounded-xl text-white bg-[#3DA8A5] hover:bg-[#2B9592] transition-all shadow-sd-sm disabled:opacity-40 cursor-pointer"
                    title="Send Question"
                  >

                    <Send className="w-4 h-4" />

                  </button>

                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8A8B97] mt-2 px-1">

                  <span className="flex items-center gap-1 font-medium">

                    <Info className="w-3 h-3 text-[#3DA8A5]" />

                    {isAnonymous
                      ? 'Your identity is hidden from instructor and peers.'
                      : 'Your name will appear next to your question.'}

                  </span>

                  <span className="font-semibold">
                    Press Enter ↵
                  </span>

                </div>

              </form>

            </Card>
          )}

          {/* =====================================
              FILTER BAR
          ===================================== */}

          <div className="bg-white border border-[#E4E8EE] rounded-2xl p-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 shadow-sd-sm">

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">

              {[
                {
                  id: 'all',
                  label: `All (${doubts.length})`,
                },
                {
                  id: 'open',
                  label: `Open (${
                    doubts.filter(
                      (d) => d.status === 'open'
                    ).length
                  })`,
                },
                {
                  id: 'top',
                  label: 'Top Upvoted',
                },
                {
                  id: 'bumped',
                  label: 'Re-Raised',
                },
                {
                  id: 'resolved',
                  label: 'Resolved',
                },
              ].map((tab) => (

                <button
                  key={tab.id}
                  onClick={() =>
                    setFilterTab(tab.id)
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    filterTab === tab.id
                      ? 'bg-[#3DA8A5] text-white shadow-sd-sm'
                      : 'text-[#3D3F4A] hover:text-[#0D0F0D] hover:bg-[#F0F2F5]'
                  }`}
                >
                  {tab.label}
                </button>

              ))}

            </div>

            {/* SEARCH */}

            <div className="relative sm:w-52">

              <Search className="w-3.5 h-3.5 text-[#8A8B97] absolute left-3 top-2.5" />

              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="w-full bg-[#FAFBFB] border border-[#E4E8EE] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#0D0F0D] placeholder-[#8A8B97] focus:outline-none focus:border-[#3DA8A5] focus:bg-white font-medium"
              />

            </div>

          </div>

          {/* =====================================
              DOUBTS
          ===================================== */}

          <div className="space-y-3">

            {filteredDoubts.length === 0 ? (

              <Card className="p-12 text-center space-y-2 bg-white">

                <div className="w-12 h-12 rounded-2xl bg-[#F0F2F5] text-[#8A8B97] flex items-center justify-center mx-auto">

                  <Sparkles className="w-5 h-5 text-[#3DA8A5]" />

                </div>

                <h4 className="text-sm font-extrabold">
                  No doubts in this category
                </h4>

                <p className="text-xs text-[#3D3F4A] max-w-sm mx-auto">

                  {isStudent
                    ? 'Have a question? Type it silently in the box above!'
                    : 'Students have not asked any questions in this category yet.'}

                </p>

              </Card>

            ) : (

              filteredDoubts.map((doubt) => (

                <DoubtCard
                  key={doubt.id}
                  doubt={doubt}

                  onUpvote={upvoteDoubt}
                  onBump={bumpDoubt}
                  onResolve={resolveDoubt}

                  // NEW
                  onAnswer={answerDoubt}

                  isFaculty={
                    isFaculty || isAdmin
                  }

                  isStudent={isStudent}
                />

              ))

            )}

          </div>

        </section>

        {/* =====================================
            RIGHT COLUMN
        ===================================== */}

        <section className="lg:col-span-4 flex flex-col space-y-4">

          {/* FACULTY POLL CONTROL */}

          {(isFaculty || isAdmin) &&
            !sessionEnded && (

              <Card
                hover
                className="bg-gradient-to-br from-[#F6E49F]/30 via-white to-white border-[#E8CF82] p-5 shadow-sd-sm"
              >

                <div className="flex items-center gap-2 text-[#7A620E] text-xs font-extrabold uppercase tracking-wider mb-2">

                  <BarChart2 className="w-4 h-4" />

                  Instructor Controls

                </div>

                <h3 className="text-sm font-extrabold mb-1">
                  Comprehension Check-In
                </h3>

                <p className="text-xs text-[#3D3F4A] mb-4 leading-relaxed">

                  Broadcast a 1-click poll to check
                  whether students understood the
                  concept.

                </p>

                <Button
                  variant="warm"
                  size="sm"
                  className="w-full font-bold"
                  onClick={() =>
                    setShowCreatePollModal(true)
                  }
                  icon={BarChart2}
                >
                  + Launch Quick Poll
                </Button>

              </Card>
            )}

          {/* POLLS */}

          <div>

            <div className="flex items-center justify-between mb-3 px-1">

              <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">

                <BarChart2 className="w-3.5 h-3.5 text-[#3DA8A5]" />

                Live Classroom Polls

              </h3>

              {activePolls.length > 0 && (

                <Badge
                  variant="cyan"
                  size="sm"
                >
                  {activePolls.length} Active
                </Badge>

              )}

            </div>

            {polls.length === 0 ? (

              <Card className="p-8 text-center text-xs text-[#8A8B97] bg-white">

                No active or past polls in this
                session yet.

              </Card>

            ) : (

              <div className="space-y-3.5">

                {polls.map((poll) => (

                  <PollWidget
                    key={poll.id}
                    poll={poll}
                    onRespond={respondPoll}
                    onClose={closePoll}
                    isFaculty={
                      isFaculty || isAdmin
                    }
                    isStudent={isStudent}
                  />

                ))}

              </div>

            )}

          </div>

        </section>

      </main>

      {/* POLL MODAL */}

      <CreatePollModal
        isOpen={showCreatePollModal}
        onClose={() =>
          setShowCreatePollModal(false)
        }
        onCreatePoll={createPoll}
      />

    </div>
  );
};