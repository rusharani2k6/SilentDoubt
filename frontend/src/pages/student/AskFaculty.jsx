import React, { useEffect, useState } from 'react';

import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

import { getMyTimetableApi } from '../../api/timetable';
import {
  createQuestionApi,
  getMyQuestionsApi
} from '../../api/questions';

import {
  MessageCircleQuestion,
  User,
  BookOpen,
  ArrowRight,
  X,
  Send,
  ShieldCheck,
  Clock,
  CheckCircle2,
  MessageCircle,
  Loader2
} from 'lucide-react';


export const AskFaculty = () => {

  const [timetable, setTimetable] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [question, setQuestion] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // ============================================================
  // LOAD STUDENT TIMETABLE
  // ============================================================

  const loadTimetable = async () => {

    setLoading(true);

    try {

      const data = await getMyTimetableApi();

      setTimetable(
        Array.isArray(data) ? data : []
      );

    } catch (err) {

      console.error(
        'Error loading timetable:',
        err
      );

      setTimetable([]);

    } finally {

      setLoading(false);

    }
  };


  // ============================================================
  // LOAD STUDENT QUESTIONS
  // ============================================================

  const loadQuestions = async () => {

    setQuestionsLoading(true);

    try {

      const data = await getMyQuestionsApi();

      setQuestions(
        Array.isArray(data) ? data : []
      );

    } catch (err) {

      console.error(
        'Error loading questions:',
        err
      );

      setQuestions([]);

    } finally {

      setQuestionsLoading(false);

    }
  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    loadTimetable();
    loadQuestions();

  }, []);


  // ============================================================
  // REMOVE DUPLICATE SUBJECT + FACULTY COMBINATIONS
  // ============================================================

  const subjects = Array.from(
    new Map(
      timetable.map((item) => [
        `${item.subject}-${item.faculty?.id || item.faculty?.name}`,
        item
      ])
    ).values()
  );


  // ============================================================
  // OPEN ASK DOUBT FORM
  // ============================================================

  const handleAskDoubt = (item) => {

    setSelectedSubject(item);
    setQuestion('');

  };


  // ============================================================
  // CLOSE ASK DOUBT FORM
  // ============================================================

  const handleCloseForm = () => {

    if (submitting) {
      return;
    }

    setSelectedSubject(null);
    setQuestion('');

  };


  // ============================================================
  // SUBMIT QUESTION
  // ============================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!selectedSubject) {
      return;
    }

    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      return;
    }

    const facultyId = selectedSubject.faculty?.id;

    // ----------------------------------------------------------
    // Faculty ID is required by backend
    // ----------------------------------------------------------

    if (!facultyId) {

      alert(
        'Faculty information is not available for this subject.'
      );

      return;
    }

    setSubmitting(true);

    try {

      // --------------------------------------------------------
      // Send question to backend
      // --------------------------------------------------------

      await createQuestionApi({

        faculty_id: facultyId,

        subject: selectedSubject.subject,

        question: cleanQuestion,

        is_anonymous: true

      });


      // --------------------------------------------------------
      // Success
      // --------------------------------------------------------

      alert(
        'Your doubt has been sent to the faculty successfully.'
      );


      // --------------------------------------------------------
      // Close modal
      // --------------------------------------------------------

      setSelectedSubject(null);
      setQuestion('');


      // --------------------------------------------------------
      // Refresh questions
      // --------------------------------------------------------

      await loadQuestions();

    } catch (err) {

      console.error(
        'Error submitting question:',
        err
      );

      const message =
        err?.response?.data?.detail ||
        'Failed to send your doubt. Please try again.';

      alert(message);

    } finally {

      setSubmitting(false);

    }
  };


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (dateString) => {

    if (!dateString) {
      return '';
    }

    try {

      return new Date(dateString).toLocaleString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      );

    } catch {

      return '';

    }
  };


  return (

    <div className="min-h-screen bg-[#F0F2F5] text-[#0D0F0D] flex flex-col">

      <Navbar />


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">


        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div className="mb-8">

          <div className="flex items-center gap-2 mb-2">

            <Badge
              variant="cyan"
              size="sm"
              icon={MessageCircleQuestion}
            >
              Ask Faculty
            </Badge>

          </div>


          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

            <div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Ask Your Faculty
              </h1>

              <p className="text-xs sm:text-sm text-[#3D3F4A] mt-2 max-w-2xl">
                Have a doubt about any subject? Select your subject and
                send your question directly to the faculty.
              </p>

            </div>


            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E4E8EE]">

              <ShieldCheck className="w-4 h-4 text-[#3DA8A5]" />

              <span className="text-xs font-bold text-[#3D3F4A]">
                Ask anonymously
              </span>

            </div>

          </div>

        </div>


        {/* =====================================================
            SUBJECTS SECTION
        ====================================================== */}

        <div className="mb-10">

          <div className="flex items-center justify-between mb-5">

            <div>

              <h2 className="text-lg font-extrabold">
                Your Subjects
              </h2>

              <p className="text-xs text-[#8A8B97] mt-1">
                Choose a subject to ask your faculty.
              </p>

            </div>

          </div>


          {/* ===================================================
              LOADING
          ==================================================== */}

          {loading && (

            <div className="flex items-center justify-center py-20">

              <div className="text-center">

                <div className="w-10 h-10 border-4 border-[#9BE5E3] border-t-[#3DA8A5] rounded-full animate-spin mx-auto mb-4"></div>

                <p className="text-xs font-bold text-[#8A8B97]">
                  Loading your subjects...
                </p>

              </div>

            </div>

          )}


          {/* ===================================================
              NO SUBJECTS
          ==================================================== */}

          {!loading && subjects.length === 0 && (

            <Card className="p-10 text-center">

              <div className="w-14 h-14 rounded-2xl bg-[#F0F2F5] flex items-center justify-center mx-auto mb-4">

                <BookOpen className="w-7 h-7 text-[#8A8B97]" />

              </div>

              <h3 className="text-base font-extrabold mb-2">
                No Subjects Found
              </h3>

              <p className="text-xs text-[#8A8B97] max-w-md mx-auto">
                Your timetable does not contain any subjects yet.
                Please check your timetable or contact the administrator.
              </p>

            </Card>

          )}


          {/* ===================================================
              SUBJECT CARDS
          ==================================================== */}

          {!loading && subjects.length > 0 && (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {subjects.map((item) => (

                <Card
                  key={`${item.subject}-${item.faculty?.id || item.faculty?.name}`}
                  hover
                  className="flex flex-col justify-between"
                >

                  <div>

                    {/* Subject Icon */}

                    <div className="flex items-start justify-between mb-5">

                      <div className="w-11 h-11 rounded-2xl bg-[#E6FAF9] text-[#1F7A78] flex items-center justify-center">

                        <BookOpen className="w-5 h-5" />

                      </div>


                      <Badge
                        variant="cyan"
                        size="sm"
                      >
                        Subject
                      </Badge>

                    </div>


                    {/* Subject */}

                    <h2 className="text-lg font-extrabold text-[#0D0F0D] leading-snug mb-3">
                      {item.subject}
                    </h2>


                    {/* Faculty */}

                    <div className="flex items-center gap-2 text-xs text-[#3D3F4A] mb-5">

                      <User className="w-3.5 h-3.5 text-[#8A8B97]" />

                      <span className="font-medium">
                        Prof. {item.faculty?.name || 'Faculty Assigned'}
                      </span>

                    </div>

                  </div>


                  {/* Ask Button */}

                  <div className="pt-4 border-t border-[#F0F2F5]">

                    <Button
                      variant="primary"
                      className="w-full font-extrabold"
                      icon={MessageCircleQuestion}
                      iconRight={ArrowRight}
                      onClick={() => handleAskDoubt(item)}
                    >
                      Ask Doubt
                    </Button>

                  </div>

                </Card>

              ))}

            </div>

          )}

        </div>


        {/* =====================================================
            MY QUESTIONS SECTION
        ====================================================== */}

        <div className="mb-8">

          <div className="flex items-center justify-between mb-5">

            <div>

              <h2 className="text-lg font-extrabold">
                My Questions
              </h2>

              <p className="text-xs text-[#8A8B97] mt-1">
                Track your doubts and faculty answers.
              </p>

            </div>


            <div className="flex items-center gap-2">

              <Badge
                variant="cyan"
                size="sm"
              >
                {questions.length} Questions
              </Badge>

            </div>

          </div>


          {/* ===================================================
              QUESTIONS LOADING
          ==================================================== */}

          {questionsLoading && (

            <Card className="p-8">

              <div className="flex items-center justify-center gap-3">

                <Loader2 className="w-5 h-5 animate-spin text-[#3DA8A5]" />

                <span className="text-xs font-bold text-[#8A8B97]">
                  Loading your questions...
                </span>

              </div>

            </Card>

          )}


          {/* ===================================================
              NO QUESTIONS
          ==================================================== */}

          {!questionsLoading && questions.length === 0 && (

            <Card className="p-8 text-center">

              <div className="w-12 h-12 rounded-2xl bg-[#F0F2F5] flex items-center justify-center mx-auto mb-3">

                <MessageCircle className="w-6 h-6 text-[#8A8B97]" />

              </div>

              <h3 className="text-sm font-extrabold mb-1">
                No Questions Yet
              </h3>

              <p className="text-xs text-[#8A8B97]">
                Ask your first question using one of the subjects above.
              </p>

            </Card>

          )}


          {/* ===================================================
              QUESTION CARDS
          ==================================================== */}

          {!questionsLoading && questions.length > 0 && (

            <div className="space-y-4">

              {questions.map((item) => (

                <Card
                  key={item.id}
                  className="p-5"
                >

                  {/* Question Header */}

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">

                    <div>

                      <div className="flex items-center gap-2 mb-2">

                        <Badge
                          variant="cyan"
                          size="sm"
                        >
                          {item.subject}
                        </Badge>


                        {item.status === 'answered' ? (

                          <Badge
                            variant="green"
                            size="sm"
                            icon={CheckCircle2}
                          >
                            Answered
                          </Badge>

                        ) : (

                          <Badge
                            variant="yellow"
                            size="sm"
                            icon={Clock}
                          >
                            Pending
                          </Badge>

                        )}

                      </div>


                      <div className="flex items-center gap-2 text-xs text-[#8A8B97]">

                        <User className="w-3.5 h-3.5" />

                        <span>
                          Prof. {item.faculty_name || 'Faculty'}
                        </span>

                      </div>

                    </div>


                    <span className="text-[10px] text-[#8A8B97]">
                      {formatDate(item.created_at)}
                    </span>

                  </div>


                  {/* Question */}

                  <div className="rounded-2xl bg-[#F5F7F8] border border-[#E4E8EE] p-4 mb-4">

                    <div className="flex items-start gap-3">

                      <MessageCircleQuestion className="w-4 h-4 text-[#3DA8A5] mt-0.5 flex-shrink-0" />

                      <div>

                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8B97] mb-1">
                          Your Question
                        </p>

                        <p className="text-sm text-[#0D0F0D] leading-relaxed">
                          {item.question}
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* Answer */}

                  {item.answer && (

                    <div className="rounded-2xl bg-[#E6FAF9] border border-[#C8EFED] p-4">

                      <div className="flex items-start gap-3">

                        <CheckCircle2 className="w-4 h-4 text-[#1F7A78] mt-0.5 flex-shrink-0" />

                        <div className="flex-1">

                          <div className="flex items-center justify-between gap-3 mb-1">

                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#1F7A78]">
                              Faculty Answer
                            </p>

                            {item.answered_at && (

                              <span className="text-[10px] text-[#6C8C8A]">
                                {formatDate(item.answered_at)}
                              </span>

                            )}

                          </div>

                          <p className="text-sm text-[#0D0F0D] leading-relaxed">
                            {item.answer}
                          </p>

                        </div>

                      </div>

                    </div>

                  )}

                </Card>

              ))}

            </div>

          )}

        </div>

      </main>


      {/* =======================================================
          ASK DOUBT MODAL
      ======================================================== */}

      {selectedSubject && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">

          <div className="w-full max-w-lg bg-white rounded-3xl shadow-sd-xl overflow-hidden">

            {/* Modal Header */}

            <div className="px-6 py-5 border-b border-[#F0F2F5] flex items-start justify-between">

              <div>

                <div className="flex items-center gap-2 mb-2">

                  <div className="w-9 h-9 rounded-xl bg-[#E6FAF9] text-[#1F7A78] flex items-center justify-center">

                    <MessageCircleQuestion className="w-4.5 h-4.5" />

                  </div>

                  <Badge
                    variant="cyan"
                    size="sm"
                  >
                    Ask Faculty
                  </Badge>

                </div>

                <h2 className="text-xl font-extrabold">
                  Ask a Doubt
                </h2>

              </div>


              <button
                onClick={handleCloseForm}
                disabled={submitting}
                className="p-2 rounded-xl text-[#8A8B97] hover:text-[#0D0F0D] hover:bg-[#F0F2F5] transition-colors disabled:opacity-50"
              >

                <X className="w-5 h-5" />

              </button>

            </div>


            {/* Modal Body */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              {/* Subject */}

              <div className="mb-5">

                <label className="block text-xs font-extrabold text-[#3D3F4A] uppercase tracking-wider mb-2">
                  Subject
                </label>

                <div className="p-3.5 rounded-2xl bg-[#F5F7F8] border border-[#E4E8EE]">

                  <p className="text-sm font-extrabold">
                    {selectedSubject.subject}
                  </p>

                </div>

              </div>


              {/* Faculty */}

              <div className="mb-5">

                <label className="block text-xs font-extrabold text-[#3D3F4A] uppercase tracking-wider mb-2">
                  Faculty
                </label>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F5F7F8] border border-[#E4E8EE]">

                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-[#E4E8EE]">

                    <User className="w-4 h-4 text-[#3DA8A5]" />

                  </div>

                  <p className="text-sm font-bold">
                    Prof. {selectedSubject.faculty?.name || 'Faculty Assigned'}
                  </p>

                </div>

              </div>


              {/* Question */}

              <div className="mb-5">

                <label className="block text-xs font-extrabold text-[#3D3F4A] uppercase tracking-wider mb-2">
                  Your Question
                </label>

                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your doubt here..."
                  rows={5}
                  maxLength={1000}
                  disabled={submitting}
                  className="w-full resize-none rounded-2xl border border-[#E4E8EE] bg-white px-4 py-3 text-sm text-[#0D0F0D] outline-none transition-all focus:border-[#3DA8A5] focus:ring-4 focus:ring-[#9BE5E3]/30 placeholder:text-[#A0A2AC] disabled:bg-[#F5F7F8]"
                />


                <div className="flex justify-between mt-1.5">

                  <span className="text-[10px] text-[#8A8B97]">
                    Your question will be sent to the selected faculty.
                  </span>

                  <span className="text-[10px] text-[#8A8B97]">
                    {question.length}/1000
                  </span>

                </div>

              </div>


              {/* Anonymous Notice */}

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FEF9E8] border border-[#F1E5B5] mb-6">

                <ShieldCheck className="w-4 h-4 text-[#7A620E] mt-0.5 flex-shrink-0" />

                <div>

                  <p className="text-xs font-extrabold text-[#5E4D0B]">
                    Anonymous by default
                  </p>

                  <p className="text-[10px] text-[#7A620E] mt-0.5 leading-relaxed">
                    Your identity will remain protected while asking
                    questions to your faculty.
                  </p>

                </div>

              </div>


              {/* Buttons */}

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 rounded-2xl border border-[#E4E8EE] bg-white text-xs font-extrabold text-[#3D3F4A] hover:bg-[#F5F7F8] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>


                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 font-extrabold"
                  icon={submitting ? Loader2 : Send}
                  disabled={!question.trim() || submitting}
                >
                  {submitting ? 'Sending...' : 'Send Doubt'}
                </Button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );
};