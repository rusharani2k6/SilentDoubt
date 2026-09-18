import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { Navbar } from '../../components/Navbar';

import {
  getMyTimetableApi,
  createTimetableApi,
  deleteTimetableApi,
} from '../../api/timetable';

import {
  startSessionApi,
  getActiveSessionApi,
  endSessionApi,
} from '../../api/sessions';

import {
  getFacultyQuestionsApi,
  answerQuestionApi,
} from '../../api/questions';

import {
  Radio,
  Play,
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Users,
  MessageSquare,
  RefreshCw,
  Plus,
  X,
  Trash2,
  HelpCircle,
  Send,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';


export const FacultyDashboard = () => {

  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [timetable, setTimetable] = useState([]);

  const [activeSession, setActiveSession] = useState(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState(null);

  const [lastUpdated, setLastUpdated] = useState(null);

  const [showAddClass, setShowAddClass] = useState(false);


  // ============================================================
  // STUDENT QUESTIONS STATE
  // ============================================================

  const [studentQuestions, setStudentQuestions] = useState([]);

  const [questionsLoading, setQuestionsLoading] = useState(false);

  const [answerLoading, setAnswerLoading] = useState(null);

  const [answerText, setAnswerText] = useState({});

  const [questionsError, setQuestionsError] = useState(null);


  // ============================================================
  // ADD CLASS FORM
  // ============================================================

  const [classForm, setClassForm] = useState({
    class_date: '',
    section: '',
    subject: '',
    assigned_faculty_name: '',
    start_time: '',
    end_time: '',
  });


  // ============================================================
  // TODAY
  // ============================================================

  const todayName = useMemo(() => {

    return new Date().toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
      }
    );

  }, []);


  const todayDate = useMemo(() => {

    return new Date().toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );

  }, []);


  // ============================================================
  // TODAY'S CLASSES
  // ============================================================

  const todaysClasses = useMemo(() => {

    return timetable
      .filter((entry) => {

        if (entry.class_date) {

          const todayISO =
            new Date()
              .toISOString()
              .split('T')[0];

          return (
            entry.class_date === todayISO
          );

        }

        return (
          entry.day_of_week?.toLowerCase() ===
          todayName.toLowerCase()
        );

      })
      .sort((a, b) => {

        return String(
          a.start_time
        ).localeCompare(
          String(b.start_time)
        );

      });

  }, [timetable, todayName]);


  // ============================================================
  // WEEKLY CLASSES
  // ============================================================

  const weeklyClasses = useMemo(() => {

    const dayOrder = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };

    return [...timetable].sort((a, b) => {

      const dayA =
        dayOrder[a.day_of_week] || 99;

      const dayB =
        dayOrder[b.day_of_week] || 99;

      if (dayA !== dayB) {

        return dayA - dayB;

      }

      return String(
        a.start_time
      ).localeCompare(
        String(b.start_time)
      );

    });

  }, [timetable]);


  // ============================================================
  // PENDING QUESTIONS COUNT
  // ============================================================

  const pendingQuestionsCount = useMemo(() => {

    return studentQuestions.filter(
      (question) =>
        question.status === 'pending'
    ).length;

  }, [studentQuestions]);


  // ============================================================
  // LOAD STUDENT QUESTIONS
  // ============================================================

  const loadStudentQuestions = async (
    showLoader = true
  ) => {

    if (showLoader) {

      setQuestionsLoading(true);

    }

    setQuestionsError(null);

    try {

      const response =
        await getFacultyQuestionsApi();


      const questionsData =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];


      setStudentQuestions(
        questionsData
      );

    } catch (err) {

      console.error(
        'Faculty questions error:',
        err
      );


      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error;


      setQuestionsError(
        backendMessage ||
        err?.message ||
        'Failed to load student questions.'
      );

    } finally {

      if (showLoader) {

        setQuestionsLoading(false);

      }

    }

  };


  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  const loadDashboard = async () => {

    setLoading(true);

    setError(null);

    try {

      const [
        timetableResponse,
        activeSessionResponse,
      ] = await Promise.all([

        getMyTimetableApi(),

        getActiveSessionApi(),

      ]);


      const timetableData =
        Array.isArray(timetableResponse)
          ? timetableResponse
          : Array.isArray(
              timetableResponse?.data
            )
            ? timetableResponse.data
            : [];


      setTimetable(
        timetableData
      );


      setActiveSession(
        activeSessionResponse?.data ||
        activeSessionResponse ||
        null
      );


      setLastUpdated(
        new Date()
      );

    } catch (err) {

      console.error(
        'Faculty dashboard error:',
        err
      );


      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error;


      setError(
        backendMessage ||
        err?.message ||
        'Failed to load faculty dashboard.'
      );

    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    loadDashboard();

    loadStudentQuestions();

  }, []);


  // ============================================================
  // REFRESH ACTIVE SESSION
  // ============================================================

  useEffect(() => {

    const interval =
      setInterval(() => {

        getActiveSessionApi()

          .then((response) => {

            const data =
              response?.data ||
              response ||
              null;

            setActiveSession(data);

          })

          .catch(() => {});

      }, 15000);


    return () => {

      clearInterval(interval);

    };

  }, []);


  // ============================================================
  // REFRESH STUDENT QUESTIONS
  // ============================================================

  useEffect(() => {

    const interval =
      setInterval(() => {

        loadStudentQuestions(false);

      }, 15000);


    return () => {

      clearInterval(interval);

    };

  }, []);


  // ============================================================
  // ANSWER TEXT CHANGE
  // ============================================================

  const handleAnswerChange = (
    questionId,
    value
  ) => {

    setAnswerText(
      (previous) => ({

        ...previous,

        [questionId]: value,

      })
    );

  };


  // ============================================================
  // ANSWER STUDENT QUESTION
  // ============================================================

  const handleAnswerQuestion = async (
    questionId
  ) => {

    const answer =
      String(
        answerText[questionId] || ''
      ).trim();


    if (!answer) {

      setQuestionsError(
        'Please enter an answer before sending.'
      );

      return;

    }


    setAnswerLoading(
      questionId
    );

    setQuestionsError(null);


    try {

      await answerQuestionApi(
        questionId,
        answer
      );


      // Clear textarea
      setAnswerText(
        (previous) => {

          const updated = {
            ...previous,
          };

          delete updated[questionId];

          return updated;

        }
      );


      // Reload questions
      await loadStudentQuestions(false);

    } catch (err) {

      console.error(
        'Answer question error:',
        err
      );


      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error;


      setQuestionsError(
        backendMessage ||
        err?.message ||
        'Unable to send answer.'
      );

    } finally {

      setAnswerLoading(null);

    }

  };


  // ============================================================
  // OPEN ADD CLASS
  // ============================================================

  const openAddClass = () => {

    const todayISO =
      new Date()
        .toISOString()
        .split('T')[0];


    setClassForm({

      class_date:
        todayISO,

      section:
        '',

      subject:
        '',

      assigned_faculty_name:
        '',

      start_time:
        '',

      end_time:
        '',

    });


    setError(null);

    setShowAddClass(true);

  };


  // ============================================================
  // CLOSE ADD CLASS
  // ============================================================

  const closeAddClass = () => {

    if (actionLoading) {

      return;

    }

    setShowAddClass(false);

  };


  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleFormChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setClassForm(
      (previous) => ({

        ...previous,

        [name]: value,

      })
    );

  };


  // ============================================================
  // GET DAY NAME
  // ============================================================

  const getDayName = (dateString) => {

    if (!dateString) {

      return '';

    }


    const date =
      new Date(
        `${dateString}T00:00:00`
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return '';

    }


    return date.toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
      }
    );

  };


  // ============================================================
  // ADD CLASS
  // ============================================================

  const handleAddClass = async (
    event
  ) => {

    event.preventDefault();

    setError(null);


    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (
      !classForm.class_date ||
      !classForm.section.trim() ||
      !classForm.subject.trim() ||
      !classForm.start_time ||
      !classForm.end_time
    ) {

      setError(
        'Please fill all required Add Class fields.'
      );

      return;

    }


    // ----------------------------------------------------------
    // TIME VALIDATION
    // ----------------------------------------------------------

    if (
      classForm.start_time >=
      classForm.end_time
    ) {

      setError(
        'End time must be after start time.'
      );

      return;

    }


    // ----------------------------------------------------------
    // DAY
    // ----------------------------------------------------------

    const dayOfWeek =
      getDayName(
        classForm.class_date
      );


    if (!dayOfWeek) {

      setError(
        'Unable to determine the day from selected date.'
      );

      return;

    }


    setActionLoading(true);


    try {

      /*
       * IMPORTANT
       *
       * assigned_faculty_name is OPTIONAL.
       *
       * If the faculty name is entered,
       * send it to the backend.
       *
       * If it is blank,
       * do NOT send the field.
       *
       * This allows backend to automatically
       * assign the logged-in faculty.
       */

      const payload = {

        class_date:
          classForm.class_date,

        section:
          classForm.section.trim(),

        subject:
          classForm.subject.trim(),

        day_of_week:
          dayOfWeek,

        start_time:
          classForm.start_time,

        end_time:
          classForm.end_time,

      };


      // --------------------------------------------------------
      // OPTIONAL FACULTY NAME
      // --------------------------------------------------------

      if (
        classForm.assigned_faculty_name.trim()
      ) {

        payload.assigned_faculty_name =
          classForm.assigned_faculty_name.trim();

      }


      console.log(
        'Creating timetable entry:',
        payload
      );


      await createTimetableApi(
        payload
      );


      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      setShowAddClass(false);


      setClassForm({

        class_date:
          '',

        section:
          '',

        subject:
          '',

        assigned_faculty_name:
          '',

        start_time:
          '',

        end_time:
          '',

      });


      await loadDashboard();


    } catch (err) {

      console.error(
        'Add class error:',
        err
      );


      console.error(
        'Backend response:',
        err?.response?.data
      );


      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error;


      setError(

        backendMessage ||

        err?.message ||

        'Unable to add class.'

      );

    } finally {

      setActionLoading(false);

    }

  };


  // ============================================================
  // DELETE CLASS
  // ============================================================

  const handleDeleteClass = async (
    entryId
  ) => {

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this class?'
      );


    if (!confirmed) {

      return;

    }


    setActionLoading(true);

    setError(null);


    try {

      await deleteTimetableApi(
        entryId
      );


      await loadDashboard();


    } catch (err) {

      console.error(
        'Delete class error:',
        err
      );


      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message;


      setError(

        backendMessage ||

        err?.message ||

        'Unable to delete class.'

      );

    } finally {

      setActionLoading(false);

    }

  };


  // ============================================================
  // START SESSION
  // ============================================================

  const handleStartSession = async (
    timetableEntryId
  ) => {

    setActionLoading(true);

    setError(null);


    try {

      const response =
        await startSessionApi(
          timetableEntryId
        );


      const session =
        response?.data ||
        response;


      if (!session?.id) {

        throw new Error(
          'Session ID was not returned by the server.'
        );

      }


      setActiveSession(
        session
      );


      navigate(
        `/session/${session.id}`
      );


    } catch (err) {

      console.error(
        'Start session error:',
        err
      );


      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message;


      setError(

        backendMessage ||

        err?.message ||

        'Unable to start the class.'

      );

    } finally {

      setActionLoading(false);

    }

  };


  // ============================================================
  // END SESSION
  // ============================================================

  const handleEndSession = async (
    sessionId
  ) => {

    const confirmed =
      window.confirm(
        'Are you sure you want to end this class?'
      );


    if (!confirmed) {

      return;

    }


    setActionLoading(true);

    setError(null);


    try {

      await endSessionApi(
        sessionId
      );


      setActiveSession(null);


      await loadDashboard();


    } catch (err) {

      console.error(
        'End session error:',
        err
      );


      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message;


      setError(

        backendMessage ||

        err?.message ||

        'Unable to end the class.'

      );

    } finally {

      setActionLoading(false);

    }

  };


  // ============================================================
  // OPEN LIVE ROOM
  // ============================================================

  const openLiveRoom = () => {

    if (!activeSession?.id) {

      return;

    }


    navigate(
      `/session/${activeSession.id}`
    );

  };


  // ============================================================
  // CHECK LIVE ENTRY
  // ============================================================

  const isEntryLive = (
    entry
  ) => {

    return (
      activeSession?.timetable_entry_id ===
      entry.id
    );

  };


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-[#F0F2F5]">

        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          <div className="flex flex-col items-center justify-center">

            <div className="w-10 h-10 border-4 border-[#3DA8A5] border-t-transparent rounded-full animate-spin mb-4" />

            <p className="text-sm font-semibold text-[#3D3F4A]">

              Loading your faculty dashboard...

            </p>

          </div>

        </main>

      </div>

    );

  }


  // ============================================================
  // DASHBOARD
  // ============================================================

  return (

    <div className="min-h-screen bg-[#F0F2F5] text-[#0D0F0D] flex flex-col">

      <Navbar />


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">


        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <Badge
                variant="blue"
                size="sm"
                icon={Sparkles}
              >

                Faculty Teaching Hub

              </Badge>

            </div>


            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">

              Faculty Dashboard

            </h1>


            <p className="text-sm text-[#3D3F4A] mt-2">

              Manage your classes, start live sessions,
              and handle student doubts.

            </p>

          </div>


          <div className="flex items-center gap-2">

            <div className="flex items-center gap-2 text-xs text-[#6B6D78]">

              <Calendar className="w-4 h-4" />

              <span>
                {todayDate}
              </span>


              {lastUpdated && (

                <button
                  onClick={loadDashboard}
                  disabled={loading}
                  className="ml-2 p-2 rounded-xl hover:bg-white transition"
                  title="Refresh"
                >

                  <RefreshCw className="w-4 h-4" />

                </button>

              )}

            </div>


            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openAddClass}
              disabled={actionLoading}
            >

              Add Class

            </Button>

          </div>

        </div>


        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">

            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />

            <div className="flex-1">

              <p className="text-sm font-semibold">
                {error}
              </p>

            </div>

          </div>

        )}


        {/* ======================================================
            QUESTIONS ERROR
        ====================================================== */}

        {questionsError && (

          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-start gap-3">

            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />

            <div className="flex-1">

              <p className="text-sm font-semibold">

                {questionsError}

              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                setQuestionsError(null)
              }
              className="p-1 rounded-lg hover:bg-amber-100"
            >

              <X className="w-4 h-4" />

            </button>

          </div>

        )}


        {/* ======================================================
            ADD CLASS MODAL
        ====================================================== */}

        {showAddClass && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            onMouseDown={(event) => {

              if (
                event.target === event.currentTarget &&
                !actionLoading
              ) {

                closeAddClass();

              }

            }}
          >

            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E4E8EE] overflow-hidden">


              {/* HEADER */}

              <div className="px-6 py-5 border-b border-[#E4E8EE] flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-extrabold">

                    Add Class

                  </h2>


                  <p className="text-xs text-[#7B7D88] mt-1">

                    Create a class for the selected date.

                  </p>

                </div>


                <button
                  type="button"
                  onClick={closeAddClass}
                  disabled={actionLoading}
                  className="p-2 rounded-xl hover:bg-[#F0F2F5] transition disabled:opacity-50"
                >

                  <X className="w-5 h-5" />

                </button>

              </div>


              {/* FORM */}

              <form
                onSubmit={handleAddClass}
                className="p-6"
              >

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">


                  {/* DATE */}

                  <div>

                    <label className="block text-xs font-extrabold mb-2">

                      Class Date
                      <span className="text-rose-500 ml-1">
                        *
                      </span>

                    </label>


                    <input
                      type="date"
                      name="class_date"
                      value={
                        classForm.class_date
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                      disabled={actionLoading}
                      className="w-full px-4 py-3 rounded-xl border border-[#DDE2E8] bg-white text-sm outline-none focus:border-[#3DA8A5] focus:ring-2 focus:ring-[#3DA8A5]/20 disabled:bg-[#F0F2F5]"
                    />


                    {classForm.class_date && (

                      <p className="text-[11px] text-[#7B7D88] mt-2">

                        {getDayName(
                          classForm.class_date
                        )}

                      </p>

                    )}

                  </div>


                  {/* SECTION */}

                  <div>

                    <label className="block text-xs font-extrabold mb-2">

                      Section
                      <span className="text-rose-500 ml-1">
                        *
                      </span>

                    </label>


                    <input
                      type="text"
                      name="section"
                      value={
                        classForm.section
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Example: 4-CSM-C"
                      required
                      disabled={actionLoading}
                      className="w-full px-4 py-3 rounded-xl border border-[#DDE2E8] bg-white text-sm outline-none focus:border-[#3DA8A5] focus:ring-2 focus:ring-[#3DA8A5]/20 disabled:bg-[#F0F2F5]"
                    />

                  </div>


                  {/* SUBJECT */}

                  <div>

                    <label className="block text-xs font-extrabold mb-2">

                      Subject
                      <span className="text-rose-500 ml-1">
                        *
                      </span>

                    </label>


                    <input
                      type="text"
                      name="subject"
                      value={
                        classForm.subject
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Example: Reinforcement Learning"
                      required
                      disabled={actionLoading}
                      className="w-full px-4 py-3 rounded-xl border border-[#DDE2E8] bg-white text-sm outline-none focus:border-[#3DA8A5] focus:ring-2 focus:ring-[#3DA8A5]/20 disabled:bg-[#F0F2F5]"
                    />

                  </div>


                  {/* ASSIGNED FACULTY NAME */}

                  <div>

                    <label className="block text-xs font-extrabold mb-2">

                      Assigned Faculty Name

                      <span className="text-[#7B7D88] font-medium ml-1">
                        (Optional)
                      </span>

                    </label>


                    <input
                      type="text"
                      name="assigned_faculty_name"
                      value={
                        classForm.assigned_faculty_name
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Enter faculty name"
                      disabled={actionLoading}
                      className="w-full px-4 py-3 rounded-xl border border-[#DDE2E8] bg-white text-sm outline-none focus:border-[#3DA8A5] focus:ring-2 focus:ring-[#3DA8A5]/20 disabled:bg-[#F0F2F5]"
                    />


                    <p className="text-[11px] text-[#7B7D88] mt-2">

                      Leave blank to automatically assign
                      the class to the logged-in faculty.

                    </p>

                  </div>


                  {/* START TIME */}

                  <div>

                    <label className="block text-xs font-extrabold mb-2">

                      Start Time
                      <span className="text-rose-500 ml-1">
                        *
                      </span>

                    </label>


                    <input
                      type="time"
                      name="start_time"
                      value={
                        classForm.start_time
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                      disabled={actionLoading}
                      className="w-full px-4 py-3 rounded-xl border border-[#DDE2E8] bg-white text-sm outline-none focus:border-[#3DA8A5] focus:ring-2 focus:ring-[#3DA8A5]/20 disabled:bg-[#F0F2F5]"
                    />

                  </div>


                  {/* END TIME */}

                  <div>

                    <label className="block text-xs font-extrabold mb-2">

                      End Time
                      <span className="text-rose-500 ml-1">
                        *
                      </span>

                    </label>


                    <input
                      type="time"
                      name="end_time"
                      value={
                        classForm.end_time
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                      disabled={actionLoading}
                      className="w-full px-4 py-3 rounded-xl border border-[#DDE2E8] bg-white text-sm outline-none focus:border-[#3DA8A5] focus:ring-2 focus:ring-[#3DA8A5]/20 disabled:bg-[#F0F2F5]"
                    />

                  </div>

                </div>


                {/* SELECTED DATE */}

                {classForm.class_date && (

                  <div className="mt-5 p-4 rounded-2xl bg-[#F0F2F5] border border-[#E4E8EE]">

                    <div className="flex items-center gap-3">

                      <Calendar className="w-5 h-5 text-[#3DA8A5]" />

                      <div>

                        <p className="text-xs font-extrabold">

                          Selected Date

                        </p>


                        <p className="text-sm font-bold mt-0.5">

                          {new Date(
                            `${classForm.class_date}T00:00:00`
                          ).toLocaleDateString(
                            'en-IN',
                            {
                              weekday: 'long',
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            }
                          )}

                        </p>

                      </div>

                    </div>

                  </div>

                )}


                {/* ACTIONS */}

                <div className="flex justify-end gap-3 mt-6">

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={closeAddClass}
                    disabled={actionLoading}
                  >

                    Cancel

                  </Button>


                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={actionLoading}
                  >

                    {actionLoading
                      ? 'Adding...'
                      : 'Add Class'}

                  </Button>

                </div>

              </form>

            </div>

          </div>

        )}


        {/* ======================================================
            ACTIVE LIVE CLASS
        ====================================================== */}

        {activeSession && (

          <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#3DA8A5] shadow-lg">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#9BE5E3]/40 border border-[#9BE5E3] text-xs font-extrabold mb-3">

                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

                  LIVE CLASS

                </div>


                <h2 className="text-2xl sm:text-3xl font-extrabold">

                  {activeSession?.timetable_entry?.subject ||
                    activeSession?.subject ||
                    'Live Classroom'}

                </h2>


                <div className="flex flex-wrap gap-3 mt-3">

                  {(
                    activeSession?.timetable_entry?.section ||
                    activeSession?.section
                  ) && (

                    <span className="px-3 py-1 rounded-full bg-[#F0F2F5] border border-[#E4E8EE] text-xs font-bold">

                      Section{' '}

                      {activeSession?.timetable_entry?.section ||
                        activeSession?.section}

                    </span>

                  )}


                  <span className="flex items-center gap-1.5 text-xs text-[#5D5F69]">

                    <Clock className="w-3.5 h-3.5" />

                    Started{' '}

                    {activeSession?.started_at

                      ? new Date(
                          activeSession.started_at
                        ).toLocaleTimeString(
                          [],
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )

                      : '--'}

                  </span>

                </div>

              </div>


              <div className="flex flex-wrap gap-3">

                <Button
                  variant="primary"
                  size="md"
                  iconRight={ArrowRight}
                  onClick={openLiveRoom}
                >

                  Enter Live Room

                </Button>


                <Button
                  variant="danger"
                  size="md"
                  disabled={actionLoading}
                  onClick={() =>
                    handleEndSession(
                      activeSession.id
                    )
                  }
                >

                  End Class

                </Button>

              </div>

            </div>

          </div>

        )}


        {/* ======================================================
            STATISTICS
        ====================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          <StatCard
            label="Today's Classes"
            value={String(
              todaysClasses.length
            )}
            icon={Calendar}
            color="cyan"
            description={`${todayName} schedule`}
          />


          <StatCard
            label="Assigned Classes"
            value={String(
              timetable.length
            )}
            icon={BookOpen}
            color="warm"
            description="Your assigned classes"
          />


          <StatCard
            label="Pending Doubts"
            value={String(
              pendingQuestionsCount
            )}
            icon={HelpCircle}
            color="primary"
            description="Student questions waiting"
          />

        </div>


        {/* ======================================================
            TODAY'S CLASSES
        ====================================================== */}

        <section className="mb-10">

          <div className="flex items-center justify-between mb-4">

            <div>

              <h2 className="text-lg font-extrabold">

                Today's Classes

              </h2>


              <p className="text-xs text-[#7B7D88] mt-1">

                {todayName} — start a scheduled class
                when you are ready.

              </p>

            </div>

          </div>


          {todaysClasses.length === 0 ? (

            <Card className="py-14 text-center">

              <Calendar className="w-10 h-10 mx-auto mb-4 text-[#8A8B97]" />


              <h3 className="font-extrabold text-base">

                No classes scheduled today

              </h3>


              <p className="text-xs text-[#8A8B97] mt-2">

                Click "Add Class" to create your timetable.

              </p>

            </Card>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {todaysClasses.map(
                (entry) => {

                  const live =
                    isEntryLive(entry);


                  return (

                    <Card
                      key={entry.id}
                      className={`flex flex-col justify-between ${
                        live
                          ? 'border-2 border-[#3DA8A5]'
                          : ''
                      }`}
                    >

                      <div>

                        <div className="flex items-center justify-between mb-4">

                          <Badge
                            variant={
                              live
                                ? 'cyan'
                                : 'neutral'
                            }
                            size="sm"
                          >

                            {live
                              ? 'LIVE NOW'
                              : 'TODAY'}

                          </Badge>


                          <span className="text-xs font-bold text-[#5D5F69]">

                            {entry.section}

                          </span>

                        </div>


                        <h3 className="text-lg font-extrabold leading-snug mb-3">

                          {entry.subject}

                        </h3>


                        <div className="space-y-2 text-xs text-[#5D5F69]">

                          <div className="flex items-center gap-2">

                            <Clock className="w-4 h-4 text-[#3DA8A5]" />

                            <span className="font-semibold">

                              {entry.start_time}

                              {' - '}

                              {entry.end_time}

                            </span>

                          </div>


                          <div className="flex items-center gap-2">

                            <Users className="w-4 h-4 text-[#8A8B97]" />

                            <span>

                              Section {entry.section}

                            </span>

                          </div>

                        </div>

                      </div>


                      <div className="pt-5 mt-5 border-t border-[#F0F2F5]">

                        {live ? (

                          <Button
                            variant="cyan"
                            size="sm"
                            className="w-full"
                            icon={Radio}
                            onClick={openLiveRoom}
                          >

                            Open Live Class

                          </Button>

                        ) : (

                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full"
                            icon={Play}
                            disabled={
                              actionLoading ||
                              Boolean(activeSession)
                            }
                            onClick={() =>
                              handleStartSession(
                                entry.id
                              )
                            }
                          >

                            {activeSession
                              ? 'Another Class Is Live'
                              : 'Start Class'}

                          </Button>

                        )}

                      </div>

                    </Card>

                  );

                }
              )}

            </div>

          )}

        </section>


        {/* ======================================================
            STUDENT QUESTIONS
        ====================================================== */}

        <section className="mb-10">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-lg font-extrabold">

                  Student Questions

                </h2>


                {pendingQuestionsCount > 0 && (

                  <Badge
                    variant="cyan"
                    size="sm"
                  >

                    {pendingQuestionsCount} Pending

                  </Badge>

                )}

              </div>


              <p className="text-xs text-[#7B7D88] mt-1">

                Answer doubts submitted by students through Ask Doubt.

              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                loadStudentQuestions()
              }
              disabled={questionsLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#DDE2E8] bg-white text-xs font-bold text-[#3D3F4A] hover:bg-[#F0F2F5] transition disabled:opacity-50"
            >

              <RefreshCw
                className={`w-4 h-4 ${
                  questionsLoading
                    ? 'animate-spin'
                    : ''
                }`}
              />

              Refresh Questions

            </button>

          </div>


          {questionsLoading ? (

            <Card className="py-14 text-center">

              <Loader2 className="w-8 h-8 mx-auto mb-4 text-[#3DA8A5] animate-spin" />


              <h3 className="font-extrabold text-base">

                Loading student questions...

              </h3>


              <p className="text-xs text-[#8A8B97] mt-2">

                Please wait.

              </p>

            </Card>

          ) : studentQuestions.length === 0 ? (

            <Card className="py-14 text-center">

              <HelpCircle className="w-10 h-10 mx-auto mb-4 text-[#8A8B97]" />


              <h3 className="font-extrabold text-base">

                No student questions yet

              </h3>


              <p className="text-xs text-[#8A8B97] mt-2">

                Questions submitted through Ask Doubt will appear here.

              </p>

            </Card>

          ) : (

            <div className="space-y-4">

              {studentQuestions.map(
                (question) => {

                  const isPending =
                    question.status === 'pending';

                  const currentAnswer =
                    answerText[question.id] || '';

                  const isAnswering =
                    answerLoading === question.id;


                  return (

                    <Card
                      key={question.id}
                      className={`p-0 overflow-hidden ${
                        isPending
                          ? 'border-2 border-[#9BE5E3]'
                          : ''
                      }`}
                    >

                      {/* QUESTION HEADER */}

                      <div className="px-5 py-4 border-b border-[#E4E8EE] bg-white">

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">

                          <div className="flex items-start gap-3">

                            <div className="w-10 h-10 rounded-xl bg-[#F0F2F5] flex items-center justify-center flex-shrink-0">

                              <HelpCircle className="w-5 h-5 text-[#3DA8A5]" />

                            </div>


                            <div>

                              <div className="flex flex-wrap items-center gap-2">

                                <span className="text-sm font-extrabold">

                                  {question.subject}

                                </span>


                                <Badge
                                  variant={
                                    isPending
                                      ? 'warm'
                                      : 'cyan'
                                  }
                                  size="sm"
                                >

                                  {isPending
                                    ? 'PENDING'
                                    : 'ANSWERED'}

                                </Badge>

                              </div>


                              <div className="flex flex-wrap items-center gap-3 mt-1">

                                <span className="text-xs font-semibold text-[#6B6D78]">

                                  {question.is_anonymous
                                    ? 'Anonymous Student'
                                    : (
                                      question.student_name ||
                                      'Student'
                                    )}

                                </span>


                                {question.created_at && (

                                  <span className="flex items-center gap-1 text-[11px] text-[#8A8B97]">

                                    <Clock className="w-3 h-3" />

                                    {new Date(
                                      question.created_at
                                    ).toLocaleString(
                                      'en-IN',
                                      {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      }
                                    )}

                                  </span>

                                )}

                              </div>

                            </div>

                          </div>

                        </div>

                      </div>


                      {/* QUESTION BODY */}

                      <div className="px-5 py-5">

                        <div className="p-4 rounded-2xl bg-[#F8FAFB] border border-[#E4E8EE]">

                          <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#7B7D88] mb-2">

                            Student Question

                          </p>


                          <p className="text-sm text-[#2F313A] leading-relaxed whitespace-pre-wrap">

                            {question.question}

                          </p>

                        </div>


                        {/* ANSWERED */}

                        {!isPending && question.answer && (

                          <div className="mt-4 p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-200">

                            <div className="flex items-center gap-2 mb-2">

                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />

                              <p className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-700">

                                Your Answer

                              </p>

                            </div>


                            <p className="text-sm text-[#2F313A] leading-relaxed whitespace-pre-wrap">

                              {question.answer}

                            </p>


                            {question.answered_at && (

                              <p className="text-[11px] text-[#6B6D78] mt-3">

                                Answered on{' '}

                                {new Date(
                                  question.answered_at
                                ).toLocaleString(
                                  'en-IN',
                                  {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}

                              </p>

                            )}

                          </div>

                        )}


                        {/* ANSWER FORM */}

                        {isPending && (

                          <div className="mt-4">

                            <label className="block text-xs font-extrabold mb-2">

                              Write Your Answer

                            </label>


                            <textarea
                              value={currentAnswer}
                              onChange={(event) =>
                                handleAnswerChange(
                                  question.id,
                                  event.target.value
                                )
                              }
                              placeholder="Type your answer to the student..."
                              rows={4}
                              maxLength={5000}
                              disabled={isAnswering}
                              className="w-full px-4 py-3 rounded-2xl border border-[#DDE2E8] bg-white text-sm outline-none resize-y focus:border-[#3DA8A5] focus:ring-2 focus:ring-[#3DA8A5]/20 disabled:bg-[#F0F2F5]"
                            />


                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">

                              <span className="text-[11px] text-[#8A8B97]">

                                {currentAnswer.length}/5000 characters

                              </span>


                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                icon={
                                  isAnswering
                                    ? Loader2
                                    : Send
                                }
                                disabled={
                                  isAnswering ||
                                  !currentAnswer.trim()
                                }
                                onClick={() =>
                                  handleAnswerQuestion(
                                    question.id
                                  )
                                }
                              >

                                {isAnswering
                                  ? 'Sending...'
                                  : 'Send Answer'}

                              </Button>

                            </div>

                          </div>

                        )}

                      </div>

                    </Card>

                  );

                }
              )}

            </div>

          )}

        </section>


        {/* ======================================================
            WEEKLY SCHEDULE
        ====================================================== */}

        <section>

          <div className="flex items-center justify-between mb-4">

            <div>

              <h2 className="text-lg font-extrabold">

                Weekly Teaching Schedule

              </h2>


              <p className="text-xs text-[#7B7D88] mt-1">

                All classes assigned to your faculty profile.

              </p>

            </div>


            <Button
              variant="outline"
              size="sm"
              icon={Calendar}
              onClick={() =>
                navigate(
                  '/faculty/timetable'
                )
              }
            >

              Full Timetable

            </Button>

          </div>


          {weeklyClasses.length === 0 ? (

            <Card className="py-14 text-center">

              <BookOpen className="w-10 h-10 mx-auto mb-4 text-[#8A8B97]" />


              <h3 className="font-extrabold">

                No timetable assigned

              </h3>


              <p className="text-xs text-[#8A8B97] mt-2">

                Click "Add Class" to create your timetable.

              </p>

            </Card>

          ) : (

            <div className="space-y-3">

              {weeklyClasses.map(
                (entry) => {

                  const live =
                    isEntryLive(entry);


                  return (

                    <div
                      key={entry.id}
                      className={`bg-white border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                        live
                          ? 'border-[#3DA8A5] shadow-sm'
                          : 'border-[#E4E8EE]'
                      }`}
                    >

                      <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-2xl bg-[#F0F2F5] flex items-center justify-center flex-shrink-0">

                          {live ? (

                            <Radio className="w-5 h-5 text-[#3DA8A5]" />

                          ) : (

                            <BookOpen className="w-5 h-5 text-[#6B6D78]" />

                          )}

                        </div>


                        <div>

                          <div className="flex flex-wrap items-center gap-2 mb-1">

                            <span className="text-sm font-extrabold">

                              {entry.subject}

                            </span>


                            {live && (

                              <Badge
                                variant="cyan"
                                size="sm"
                              >

                                LIVE

                              </Badge>

                            )}

                          </div>


                          <div className="flex flex-wrap gap-3 text-xs text-[#6B6D78]">

                            <span className="font-bold">

                              {entry.day_of_week}

                            </span>


                            {entry.class_date && (

                              <span className="flex items-center gap-1">

                                <Calendar className="w-3 h-3" />

                                {new Date(
                                  `${entry.class_date}T00:00:00`
                                ).toLocaleDateString(
                                  'en-IN',
                                  {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  }
                                )}

                              </span>

                            )}


                            <span className="flex items-center gap-1">

                              <Clock className="w-3 h-3" />

                              {entry.start_time}

                              {' - '}

                              {entry.end_time}

                            </span>


                            <span>

                              {entry.section}

                            </span>

                          </div>

                        </div>

                      </div>


                      <div className="flex items-center gap-3">

                        {live ? (

                          <Button
                            variant="cyan"
                            size="sm"
                            onClick={
                              openLiveRoom
                            }
                          >

                            Open Live Room

                          </Button>

                        ) : (

                          <span className="text-[11px] font-bold text-[#8A8B97]">

                            Scheduled

                          </span>

                        )}


                        <button
                          type="button"
                          disabled={
                            actionLoading
                          }
                          onClick={() =>
                            handleDeleteClass(
                              entry.id
                            )
                          }
                          className="p-2 rounded-xl text-rose-500 border border-rose-200 hover:bg-rose-50 transition disabled:opacity-50"
                          title="Delete class"
                        >

                          <Trash2 className="w-4 h-4" />

                        </button>

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </section>


        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="mt-10 p-5 rounded-2xl bg-white border border-[#E4E8EE]">

          <div className="flex items-start gap-3">

            <MessageSquare className="w-5 h-5 text-[#3DA8A5] mt-0.5" />


            <div>

              <p className="text-sm font-extrabold">

                How SilentDoubt works

              </p>


              <p className="text-xs text-[#6B6D78] mt-1 leading-relaxed">

                Add class → select date → optionally enter
                an assigned faculty name → class is assigned
                accordingly → start the scheduled class →
                students join the live room → students submit
                doubts silently → doubts appear in your live
                classroom → resolve them → end the class.

              </p>

            </div>

          </div>

        </div>


      </main>

    </div>

  );

};