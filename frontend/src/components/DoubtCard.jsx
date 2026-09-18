import React, { useState } from 'react';

import {
  ChevronUp,
  Flame,
  Check,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  MessageCircle,
  Send,
} from 'lucide-react';

import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export const DoubtCard = ({
  doubt,
  onUpvote,
  onBump,
  onResolve,
  onAnswer,
  isFaculty,
  isStudent,
}) => {

  const [answerText, setAnswerText] = useState('');

  const isResolved =
    doubt.status === 'resolved';

  const isBumped =
    !isResolved && !!doubt.bumped_at;

  /*
   * Faculty can answer.
   *
   * Student can resolve.
   *
   * Faculty does NOT get Resolve/Re-Raise.
   */

  const handleAnswer = (e) => {
    e.preventDefault();

    const cleanAnswer =
      answerText.trim();

    if (!cleanAnswer) return;

    if (onAnswer) {
      onAnswer(
        doubt.id,
        cleanAnswer
      );
    }

    setAnswerText('');
  };

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 ${
        isResolved
          ? 'bg-[#FAFBFB] border-[#E4E8EE] opacity-90'
          : isBumped
          ? 'bg-[#FEF9E8] border-[#EDCF72]/70 shadow-sd-md ring-1 ring-[#F6E49F]'
          : 'bg-white border-[#E4E8EE] hover:border-[#C8CAD4] shadow-sd-sm hover:shadow-sd-md'
      } p-4 sm:p-5`}
    >

      <div className="flex items-start gap-3 sm:gap-4">

        {/* =====================================
            UPVOTE
        ===================================== */}

        <button
          onClick={() =>
            onUpvote(doubt.id)
          }
          className={`flex flex-col items-center justify-center w-11 h-13 rounded-2xl border transition-all duration-200 cursor-pointer flex-shrink-0 ${
            doubt.has_upvoted
              ? 'bg-[#9BE5E3] border-[#9BE5E3] text-[#0D0F0D] shadow-sd-xs'
              : 'bg-[#F5F7F8] border-[#E4E8EE] text-[#3D3F4A] hover:bg-white hover:border-[#9BE5E3]'
          }`}
          title={
            doubt.has_upvoted
              ? 'Remove Upvote'
              : 'Upvote'
          }
        >

          <ChevronUp
            className={`w-4 h-4 transition-transform ${
              doubt.has_upvoted
                ? '-translate-y-0.5'
                : ''
            }`}
          />

          <span className="text-xs font-extrabold mt-0.5">
            {doubt.upvote_count || 0}
          </span>

        </button>

        {/* =====================================
            CONTENT
        ===================================== */}

        <div className="flex-1 min-w-0">

          {/* BADGES */}

          <div className="flex flex-wrap items-center gap-2 mb-2">

            {doubt.is_anonymous ? (

              <Badge
                variant={
                  doubt.is_own
                    ? 'cyan'
                    : 'neutral'
                }
                size="sm"
                icon={UserX}
              >
                {doubt.student_name ||
                  'Anonymous Student'}
              </Badge>

            ) : (

              <Badge
                variant="blue"
                size="sm"
                icon={UserCheck}
              >
                {doubt.student_name ||
                  'Student'}
              </Badge>

            )}

            {/* RE-RAISED STATUS */}

            {isBumped && (

              <Badge
                variant="warm"
                size="sm"
                icon={Flame}
              >
                Re-Raised
              </Badge>

            )}

            {/* STATUS */}

            {isResolved ? (

              <Badge
                variant="success"
                size="sm"
                icon={CheckCircle2}
                className="ml-auto"
              >
                Resolved
              </Badge>

            ) : (

              <Badge
                variant="neutral"
                size="sm"
                className="ml-auto"
              >
                Open
              </Badge>

            )}

          </div>

          {/* =====================================
              QUESTION
          ===================================== */}

          <div className="mb-3">

            <p
              className={`text-sm sm:text-base leading-relaxed break-words font-semibold ${
                isResolved
                  ? 'text-[#8A8B97]'
                  : 'text-[#0D0F0D]'
              }`}
            >
              {doubt.text}
            </p>

          </div>

          {/* =====================================
              FACULTY ANSWER
          ===================================== */}

          {doubt.answer && (

            <div className="mt-3 rounded-2xl border border-[#BFE7E5] bg-[#F0FBFA] p-4">

              <div className="flex items-center gap-2 mb-2">

                <div className="w-7 h-7 rounded-full bg-[#3DA8A5] text-white flex items-center justify-center">

                  <MessageCircle className="w-3.5 h-3.5" />

                </div>

                <div>

                  <p className="text-xs font-extrabold text-[#1F7A78]">
                    Faculty Answer
                  </p>

                  {doubt.answered_at && (
                    <p className="text-[10px] text-[#6B7280]">
                      Answered at{' '}
                      {new Date(
                        doubt.answered_at
                      ).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}

                </div>

              </div>

              <p className="text-sm text-[#0D0F0D] leading-relaxed whitespace-pre-wrap">
                {doubt.answer}
              </p>

            </div>

          )}

          {/* =====================================
              FACULTY ANSWER INPUT
          ===================================== */}

          {isFaculty &&
            !isResolved && (

              <div className="mt-4 rounded-2xl border border-[#E4E8EE] bg-[#FAFBFB] p-3">

                <div className="flex items-center gap-2 mb-2">

                  <MessageCircle className="w-4 h-4 text-[#3DA8A5]" />

                  <span className="text-xs font-extrabold text-[#3D3F4A]">
                    Answer Student's Question
                  </span>

                </div>

                <form
                  onSubmit={handleAnswer}
                  className="flex gap-2"
                >

                  <textarea
                    rows={2}
                    value={answerText}
                    onChange={(e) =>
                      setAnswerText(
                        e.target.value
                      )
                    }
                    placeholder="Type your answer here..."
                    className="flex-1 resize-none rounded-xl border border-[#E4E8EE] bg-white px-3 py-2 text-sm font-medium text-[#0D0F0D] placeholder-[#8A8B97] focus:outline-none focus:border-[#3DA8A5]"
                  />

                  <button
                    type="submit"
                    disabled={
                      !answerText.trim()
                    }
                    className="self-end p-2.5 rounded-xl bg-[#3DA8A5] text-white hover:bg-[#2B9592] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Send Answer"
                  >

                    <Send className="w-4 h-4" />

                  </button>

                </form>

                <p className="text-[10px] text-[#8A8B97] mt-1.5">
                  The answer will be visible to the student.
                </p>

              </div>

            )}

          {/* =====================================
              FOOTER
          ===================================== */}

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-[#F0F2F5] text-xs text-[#8A8B97]">

            <div className="flex items-center gap-1.5">

              <Clock className="w-3.5 h-3.5" />

              <span>
                {doubt.created_at
                  ? new Date(
                      doubt.created_at
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Just now'}
              </span>

            </div>

            {/* =================================
                ACTION BUTTONS
            ================================= */}

            <div className="flex items-center gap-2">

              {/* 
                IMPORTANT:
                Re-Raise is STUDENT ONLY.
              */}

              {isStudent &&
                !isResolved && (

                  <button
                    onClick={() =>
                      onBump(doubt.id)
                    }
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold text-[#7A620E] bg-[#F6E49F]/40 hover:bg-[#F6E49F]/70 border border-[#EDCF72]/60 transition-colors cursor-pointer"
                    title="Re-Raise this doubt"
                  >

                    <Flame className="w-3.5 h-3.5" />

                    Re-Raise

                  </button>

                )}

              {/* 
                IMPORTANT:
                Resolve is STUDENT ONLY.
              */}

              {isStudent &&
                !isResolved && (

                  <Button
                    variant="cyan"
                    size="sm"
                    onClick={() =>
                      onResolve(doubt.id)
                    }
                    icon={Check}
                  >
                    Resolve
                  </Button>

                )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};