import React, { useMemo, useState } from 'react';
import {
  Search,
  ShieldCheck,
  Eye,
  CheckCircle,
  Flag,
  RotateCcw,
  MessageSquare,
  Users,
  CalendarDays,
} from 'lucide-react';

import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

import {
  getConductedClassesApi,
  getClassDoubtsApi,
  getDoubtIdentityApi,
  updateDoubtModerationApi,
} from '../../api/admin';


// ============================================================
// LOCAL DATE
// ============================================================

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};


// ============================================================
// COMPONENT
// ============================================================

export const DoubtMonitor = () => {

  // ----------------------------------------------------------
  // FILTERS
  // ----------------------------------------------------------

  const [date, setDate] = useState(getToday());
  const [year, setYear] = useState('');
  const [department, setDepartment] = useState('');
  const [section, setSection] = useState('');

  // ----------------------------------------------------------
  // FILTER OPTIONS
  // ----------------------------------------------------------

  const YEARS = ['1', '2', '3', '4'];

  const DEPARTMENTS = [
    'CSE',
    'CSM',
    'AIML',
    'AIDS',
    'ECE',
    'EEE',
    'IT',
  ];

  const SECTION_LETTERS = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
  ];


  // ----------------------------------------------------------
  // SECTION OPTIONS
  // ----------------------------------------------------------

  const sectionOptions = useMemo(() => {

    const years = year ? [year] : YEARS;

    const departments = department
      ? [department]
      : DEPARTMENTS;

    return years.flatMap((y) =>
      departments.flatMap((d) =>
        SECTION_LETTERS.map(
          (letter) => `${y}-${d}-${letter}`
        )
      )
    );

  }, [year, department]);


  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [classes, setClasses] = useState([]);

  const [selectedSession, setSelectedSession] =
    useState(null);

  const [doubts, setDoubts] = useState([]);

  const [loadingClasses, setLoadingClasses] =
    useState(false);

  const [loadingDoubts, setLoadingDoubts] =
    useState(false);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const [identity, setIdentity] =
    useState(null);

  const [savingId, setSavingId] =
    useState(null);

  // VERY IMPORTANT
  // Initially nothing should be displayed.
  // Results appear only after Find Classes.
  const [hasSearched, setHasSearched] =
    useState(false);


  // ==========================================================
  // YEAR CHANGE
  // ==========================================================

  const handleYearChange = (value) => {

    setYear(value);

    // Section must be selected again
    // because available sections change.
    setSection('');

    // Clear old search result.
    setClasses([]);

    setSelectedSession(null);

    setDoubts([]);

    setHasSearched(false);
  };


  // ==========================================================
  // DEPARTMENT CHANGE
  // ==========================================================

  const handleDepartmentChange = (value) => {

    setDepartment(value);

    setSection('');

    setClasses([]);

    setSelectedSession(null);

    setDoubts([]);

    setHasSearched(false);
  };


  // ==========================================================
  // SECTION CHANGE
  // ==========================================================

  const handleSectionChange = (value) => {

    setSection(value);

    // Don't show old results after changing filters.
    setClasses([]);

    setSelectedSession(null);

    setDoubts([]);

    setHasSearched(false);
  };


  // ==========================================================
  // DATE CHANGE
  // ==========================================================

  const handleDateChange = (value) => {

    setDate(value);

    setClasses([]);

    setSelectedSession(null);

    setDoubts([]);

    setHasSearched(false);
  };


  // ==========================================================
  // FIND CLASSES
  // ==========================================================

  const loadClasses = async () => {

    setLoadingClasses(true);

    setError('');

    // Clear old data before new search.
    setClasses([]);

    setSelectedSession(null);

    setDoubts([]);

    setIdentity(null);

    setSearch('');

    try {

      const params = {
        date,
      };

      if (year) {
        params.year = year;
      }

      if (department) {
        params.department = department;
      }

      if (section) {
        params.section = section;
      }


      const data =
        await getConductedClassesApi(params);


      setClasses(
        Array.isArray(data)
          ? data
          : []
      );

      // Only now show results.
      setHasSearched(true);

    } catch (err) {

      setHasSearched(true);

      setError(
        err.response?.data?.detail ||
        'Failed to load conducted classes'
      );

      setClasses([]);

    } finally {

      setLoadingClasses(false);
    }
  };


  // ==========================================================
  // SELECT PARTICULAR CLASS
  // ==========================================================

  const selectClass = async (item) => {

    setSelectedSession(item);

    setLoadingDoubts(true);

    setError('');

    setSearch('');

    setIdentity(null);

    try {

      const data =
        await getClassDoubtsApi(
          item.session_id
        );

      setDoubts(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        'Failed to load doubts'
      );

      setDoubts([]);

    } finally {

      setLoadingDoubts(false);
    }
  };


  // ==========================================================
  // UPDATE DOUBT
  // ==========================================================

  const updateDoubt = async (id, data) => {

    setSavingId(id);

    setError('');

    try {

      const updated =
        await updateDoubtModerationApi(
          id,
          data
        );

      setDoubts((previous) =>
        previous.map((doubt) =>
          doubt.id === id
            ? updated
            : doubt
        )
      );

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        'Failed to update doubt'
      );

    } finally {

      setSavingId(null);
    }
  };


  // ==========================================================
  // REVEAL STUDENT IDENTITY
  // ==========================================================

  const revealIdentity = async (id) => {

    setError('');

    try {

      const data =
        await getDoubtIdentityApi(id);

      setIdentity(data);

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        'Student identity is not available'
      );
    }
  };


  // ==========================================================
  // SEARCH INSIDE SELECTED CLASS
  // ==========================================================

  const filteredDoubts = useMemo(() => {

    const query =
      search.trim().toLowerCase();

    if (!query) {
      return doubts;
    }

    return doubts.filter((doubt) =>
      (doubt.text || '')
        .toLowerCase()
        .includes(query)
    );

  }, [doubts, search]);


  // ==========================================================
  // TOTAL MESSAGE COUNT
  // ==========================================================

  const totalMessages = classes.reduce(
    (total, item) =>
      total + (Number(item.doubt_count) || 0),
    0
  );


  // ==========================================================
  // TIME FORMAT
  // ==========================================================

  const formatTime = (value) => {

    if (!value) {
      return '--';
    }

    try {

      return new Date(value).toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      );

    } catch {

      return '--';
    }
  };


  // ==========================================================
  // DATE/TIME FORMAT
  // ==========================================================

  const formatDateTime = (value) => {

    if (!value) {
      return '--';
    }

    try {

      return new Date(value).toLocaleString();

    } catch {

      return '--';
    }
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="min-h-screen bg-[#F0F2F5] text-[#0D0F0D]">

      <Navbar />


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="mb-6">

          <Badge
            variant="warm"
            size="sm"
            icon={ShieldCheck}
          >
            Administrator Console
          </Badge>


          <h1 className="text-2xl sm:text-4xl font-extrabold mt-2">
            Doubt Monitor
          </h1>


          <p className="text-sm text-[#3D3F4A] mt-1">
            Review doubts and messages from classes
            that were actually conducted.
          </p>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (

          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">

            {error}

          </div>

        )}


        {/* ==================================================
            FILTER CARD
        ================================================== */}

        <Card className="p-5 mb-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">


            {/* DATE */}

            <label className="text-xs font-bold">

              <div className="flex items-center gap-1">

                <CalendarDays className="w-3 h-3" />

                Date

              </div>


              <input
                type="date"
                value={date}
                onChange={(e) =>
                  handleDateChange(e.target.value)
                }
                className="mt-1 w-full h-[42px] rounded-xl border border-[#DDE2E8] bg-white px-3 text-sm font-semibold outline-none focus:border-[#3DA8A5]"
              />

            </label>


            {/* YEAR */}

            <label className="text-xs font-bold">

              Year

              <select
                value={year}
                onChange={(e) =>
                  handleYearChange(e.target.value)
                }
                className="mt-1 w-full h-[42px] rounded-xl border border-[#DDE2E8] bg-white px-3 text-sm font-semibold text-[#3D3F4A] outline-none focus:border-[#3DA8A5] cursor-pointer"
              >

                <option value="">
                  All Years
                </option>

                {YEARS.map((y) => (

                  <option
                    key={y}
                    value={y}
                  >

                    {y}
                    {y === '1'
                      ? 'st'
                      : y === '2'
                      ? 'nd'
                      : y === '3'
                      ? 'rd'
                      : 'th'
                    } Year

                  </option>

                ))}

              </select>

            </label>


            {/* DEPARTMENT */}

            <label className="text-xs font-bold">

              Department

              <select
                value={department}
                onChange={(e) =>
                  handleDepartmentChange(
                    e.target.value
                  )
                }
                className="mt-1 w-full h-[42px] rounded-xl border border-[#DDE2E8] bg-white px-3 text-sm font-semibold text-[#3D3F4A] outline-none focus:border-[#3DA8A5] cursor-pointer"
              >

                <option value="">
                  All Departments
                </option>

                {DEPARTMENTS.map((dept) => (

                  <option
                    key={dept}
                    value={dept}
                  >
                    {dept}
                  </option>

                ))}

              </select>

            </label>


            {/* SECTION */}

            <label className="text-xs font-bold">

              Section

              <select
                value={section}
                onChange={(e) =>
                  handleSectionChange(
                    e.target.value
                  )
                }
                className="mt-1 w-full h-[42px] rounded-xl border border-[#DDE2E8] bg-white px-3 text-sm font-semibold text-[#3D3F4A] outline-none focus:border-[#3DA8A5] cursor-pointer"
              >

                <option value="">
                  All Sections
                </option>

                {sectionOptions.map((item) => (

                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>

                ))}

              </select>

            </label>


            {/* FIND CLASSES */}

            <div className="flex items-end">

              <Button
                variant="primary"
                className="w-full"
                onClick={loadClasses}
                disabled={loadingClasses}
              >

                {loadingClasses
                  ? 'Finding Classes...'
                  : 'Find Classes'}

              </Button>

            </div>

          </div>

        </Card>


        {/* ==================================================
            BEFORE FIND CLASSES
        ================================================== */}

        {!hasSearched && (

          <Card className="p-12">

            <div className="text-center">

              <Users className="w-12 h-12 mx-auto text-[#B6BBC4] mb-4" />

              <h2 className="font-extrabold text-lg">
                Find Conducted Classes
              </h2>

              <p className="text-sm text-[#8A8B97] mt-2">
                Select the date, year, department and
                section, then click
                <b> Find Classes </b>
                to view conducted classes.
              </p>

            </div>

          </Card>

        )}


        {/* ==================================================
            AFTER FIND CLASSES
        ================================================== */}

        {hasSearched && (

          <>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">


              {/* CONDUCTED CLASSES */}

              <Card className="p-5">

                <div className="flex items-center gap-4">

                  <div className="w-11 h-11 rounded-xl bg-[#E6FAF9] flex items-center justify-center">

                    <Users className="w-5 h-5 text-[#3DA8A5]" />

                  </div>


                  <div>

                    <div className="text-xs font-bold text-[#777]">
                      Conducted Classes
                    </div>

                    <div className="text-3xl font-extrabold mt-1">
                      {classes.length}
                    </div>

                    <div className="text-xs text-[#8A8B97] mt-1">
                      Classes conducted on selected date
                    </div>

                  </div>

                </div>

              </Card>


              {/* TOTAL MESSAGES */}

              <Card className="p-5">

                <div className="flex items-center gap-4">

                  <div className="w-11 h-11 rounded-xl bg-[#F1ECFF] flex items-center justify-center">

                    <MessageSquare className="w-5 h-5 text-[#805AD5]" />

                  </div>


                  <div>

                    <div className="text-xs font-bold text-[#777]">
                      Total Messages Sent
                    </div>

                    <div className="text-3xl font-extrabold mt-1">
                      {totalMessages}
                    </div>

                    <div className="text-xs text-[#8A8B97] mt-1">
                      Questions/doubts from all conducted classes
                    </div>

                  </div>

                </div>

              </Card>

            </div>


            {/* =================================================
                MAIN AREA
            ================================================= */}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">


              {/* =================================================
                  CONDUCTED CLASSES LIST
              ================================================= */}

              <Card className="lg:col-span-4 p-4">

                <div className="flex justify-between items-center mb-4">

                  <div>

                    <h2 className="font-extrabold">
                      Conducted Classes
                    </h2>

                    <p className="text-[11px] text-[#8A8B97] mt-0.5">
                      Click a class to view its questions
                    </p>

                  </div>


                  <span className="text-xs text-[#8A8B97]">
                    {classes.length} classes
                  </span>

                </div>


                {/* NO CLASSES */}

                {classes.length === 0 && (

                  <div className="p-8 text-center">

                    <CalendarDays className="w-9 h-9 mx-auto text-[#C0C4CC] mb-3" />

                    <div className="text-sm font-semibold text-[#666]">
                      No conducted classes
                    </div>

                    <div className="text-xs text-[#8A8B97] mt-1">
                      No classes were conducted for
                      the selected filters.
                    </div>

                  </div>

                )}


                {/* CLASS LIST */}

                {classes.map((item) => (

                  <button
                    key={item.session_id}
                    onClick={() =>
                      selectClass(item)
                    }
                    className={`w-full text-left p-4 rounded-2xl border mb-3 transition ${
                      selectedSession?.session_id ===
                      item.session_id
                        ? 'border-[#3DA8A5] bg-[#E6FAF9]'
                        : 'border-[#E4E8EE] bg-white hover:bg-[#F7F8F9]'
                    }`}
                  >

                    {/* SUBJECT */}

                    <div className="font-extrabold text-sm">
                      {item.subject}
                    </div>


                    {/* SECTION + FACULTY */}

                    <div className="text-xs text-[#666] mt-1">
                      {item.section}
                      {' • '}
                      {item.faculty_name}
                    </div>


                    {/* TIME */}

                    <div className="text-xs text-[#666] mt-1">

                      {formatTime(item.started_at)}

                      {' • '}

                      {item.ended_at
                        ? formatTime(item.ended_at)
                        : 'Ongoing'}

                    </div>


                    {/* MESSAGE COUNT */}

                    <div className="flex items-center gap-1 text-xs font-bold text-[#3DA8A5] mt-2">

                      <MessageSquare className="w-3.5 h-3.5" />

                      {item.doubt_count || 0}

                      {' '}

                      {Number(item.doubt_count) === 1
                        ? 'message'
                        : 'messages'}

                    </div>

                  </button>

                ))}

              </Card>


              {/* =================================================
                  QUESTIONS PANEL
              ================================================= */}

              <Card className="lg:col-span-8 p-5">


                {/* NO CLASS SELECTED */}

                {!selectedSession && (

                  <div className="py-20 text-center">

                    <MessageSquare className="w-12 h-12 mx-auto text-[#B9BEC7] mb-4" />

                    <h3 className="font-extrabold text-lg">
                      Select a Conducted Class
                    </h3>

                    <p className="text-sm text-[#8A8B97] mt-2">
                      Click a particular subject/class
                      on the left to view the questions
                      asked by students in that class.
                    </p>

                  </div>

                )}


                {/* SELECTED CLASS */}

                {selectedSession && (

                  <>

                    {/* HEADER */}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">

                      <div>

                        <div className="flex items-center gap-2">

                          <h2 className="font-extrabold text-xl">
                            {selectedSession.subject}
                          </h2>

                          <span className="px-2 py-1 rounded-full bg-[#E6FAF9] text-[#2C8D8A] text-[10px] font-bold">
                            Selected
                          </span>

                        </div>


                        <p className="text-xs text-[#666] mt-1">

                          {selectedSession.section}

                          {' • '}

                          {selectedSession.faculty_name}

                        </p>


                        <p className="text-xs font-bold text-[#3D3F4A] mt-2">

                          {selectedSession.doubt_count || 0}

                          {' '}

                          {Number(selectedSession.doubt_count) === 1
                            ? 'message'
                            : 'messages'}

                          {' '}sent by users in this class

                        </p>

                      </div>


                      {/* SEARCH */}

                      <div className="relative">

                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8A8B97]" />

                        <input
                          value={search}
                          onChange={(e) =>
                            setSearch(e.target.value)
                          }
                          placeholder="Search questions"
                          className="pl-9 pr-3 py-2 rounded-xl border border-[#DDE2E8] text-sm outline-none focus:border-[#3DA8A5]"
                        />

                      </div>

                    </div>


                    {/* LOADING */}

                    {loadingDoubts && (

                      <div className="py-12 text-center">

                        <div className="text-sm font-semibold">
                          Loading questions...
                        </div>

                      </div>

                    )}


                    {/* NO QUESTIONS */}

                    {!loadingDoubts &&
                      filteredDoubts.length === 0 && (

                        <div className="py-12 text-center">

                          <MessageSquare className="w-10 h-10 mx-auto text-[#C0C4CC] mb-3" />

                          <div className="text-sm font-semibold text-[#666]">
                            No questions found
                          </div>

                          <div className="text-xs text-[#8A8B97] mt-1">
                            No student doubts/messages
                            were recorded for this class.
                          </div>

                        </div>

                      )}


                    {/* QUESTIONS */}

                    {!loadingDoubts &&
                      filteredDoubts.map((doubt) => (

                        <div
                          key={doubt.id}
                          className="border border-[#E4E8EE] rounded-2xl p-4 mb-3 bg-white"
                        >

                          {/* DOUBT HEADER */}

                          <div className="flex justify-between gap-3">

                            <div className="text-xs font-extrabold">
                              Doubt #{doubt.id}
                            </div>


                            <div className="flex gap-2 text-[10px]">

                              <span className="px-2 py-1 rounded-full bg-[#F0F2F5]">
                                {doubt.status}
                              </span>

                              <span className="px-2 py-1 rounded-full bg-[#FEF9E8]">
                                {doubt.moderation_status}
                              </span>

                            </div>

                          </div>


                          {/* QUESTION */}

                          <p className="text-sm leading-6 mt-3">
                            {doubt.text}
                          </p>


                          {/* DETAILS */}

                          <div className="text-xs text-[#777] mt-2">

                            {formatDateTime(
                              doubt.created_at
                            )}

                            {' • '}

                            Upvotes: {doubt.upvote_count || 0}

                          </div>


                          {/* ACTIONS */}

                          <div className="flex flex-wrap gap-2 mt-4">


                            {/* IDENTITY */}

                            <Button
                              size="sm"
                              variant="outline"
                              icon={Eye}
                              onClick={() =>
                                revealIdentity(
                                  doubt.id
                                )
                              }
                            >
                              View Student Identity
                            </Button>


                            {/* RESOLVE */}

                            {doubt.status !== 'resolved' && (

                              <Button
                                size="sm"
                                variant="secondary"
                                icon={CheckCircle}
                                disabled={
                                  savingId === doubt.id
                                }
                                onClick={() =>
                                  updateDoubt(
                                    doubt.id,
                                    {
                                      status:
                                        'resolved',
                                    }
                                  )
                                }
                              >
                                Resolve
                              </Button>

                            )}


                            {/* FLAG */}

                            {doubt.moderation_status !==
                              'flagged' && (

                              <Button
                                size="sm"
                                variant="danger"
                                icon={Flag}
                                disabled={
                                  savingId === doubt.id
                                }
                                onClick={() =>
                                  updateDoubt(
                                    doubt.id,
                                    {
                                      moderation_status:
                                        'flagged',
                                      moderation_reason:
                                        'Flagged by administrator',
                                    }
                                  )
                                }
                              >
                                Flag
                              </Button>

                            )}


                            {/* MARK NORMAL */}

                            {doubt.moderation_status !==
                              'normal' && (

                              <Button
                                size="sm"
                                variant="outline"
                                icon={RotateCcw}
                                disabled={
                                  savingId === doubt.id
                                }
                                onClick={() =>
                                  updateDoubt(
                                    doubt.id,
                                    {
                                      moderation_status:
                                        'normal',
                                      moderation_reason:
                                        null,
                                    }
                                  )
                                }
                              >
                                Mark Normal
                              </Button>

                            )}

                          </div>

                        </div>

                      ))}

                  </>

                )}

              </Card>

            </div>

          </>

        )}


        {/* ==================================================
            STUDENT IDENTITY MODAL
        ================================================== */}

        {identity && (

          <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
            onClick={() => setIdentity(null)}
          >

            <div
              className="bg-white rounded-3xl p-6 w-full max-w-md"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <h3 className="text-lg font-extrabold mb-4">
                Student Identity
              </h3>


              <div className="space-y-3 text-sm">

                <div>
                  <b>Name:</b>{' '}
                  {identity.name || '—'}
                </div>

                <div>
                  <b>Email:</b>{' '}
                  {identity.email || '—'}
                </div>

                <div>
                  <b>Section:</b>{' '}
                  {identity.section || '—'}
                </div>

                <div>
                  <b>Student ID:</b>{' '}
                  {identity.student_id || '—'}
                </div>

              </div>


              <Button
                className="mt-5 w-full"
                onClick={() =>
                  setIdentity(null)
                }
              >
                Close
              </Button>

            </div>

          </div>

        )}

      </main>

    </div>
  );
};