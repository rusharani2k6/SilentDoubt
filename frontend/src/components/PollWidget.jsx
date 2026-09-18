import React from 'react';
import { BarChart3, Lock, Users, CheckCircle2 } from 'lucide-react';
import { Badge } from './ui/Badge';

export const PollWidget = ({ poll, onRespond, onClose, isFaculty, isStudent }) => {
  const isClosed       = poll.status === 'closed';
  const totalVotes     = poll.total_votes || 0;
  const userSelection  = poll.user_selected_option;
  const hasVoted       = !!userSelection;

  return (
    <div className="bg-white border border-[#E4E8EE] rounded-3xl p-5 shadow-sd-sm hover:shadow-sd-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <Badge variant="cyan" size="sm" icon={BarChart3}>
          Live Comprehension Poll
        </Badge>
        <div className="flex items-center gap-2">
          {isClosed ? (
            <Badge variant="neutral" size="sm" icon={Lock}>Closed</Badge>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          )}
          {isFaculty && !isClosed && (
            <button
              onClick={() => onClose(poll.id)}
              className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Question */}
      <h3 className="text-sm sm:text-base font-extrabold text-[#0D0F0D] mb-3.5 leading-snug">
        {poll.question}
      </h3>

      {/* Options */}
      <div className="space-y-2 mb-3.5">
        {poll.options.map((option, idx) => {
          const count      = poll.tally?.[option] || 0;
          const percentage = poll.percentages?.[option] || 0;
          const isSelected = userSelection === option;

          return (
            <button
              key={idx}
              disabled={isClosed}
              onClick={() => isStudent && !isClosed && onRespond(poll.id, option)}
              className={`w-full relative overflow-hidden text-left p-3 rounded-2xl border transition-all ${
                isSelected
                  ? 'border-[#9BE5E3] bg-[#E6FAF9] text-[#0D0F0D] ring-1 ring-[#9BE5E3]'
                  : isClosed
                  ? 'border-[#E4E8EE] bg-[#FAFBFB] text-[#3D3F4A] cursor-default'
                  : 'border-[#E4E8EE] hover:border-[#9BE5E3] bg-[#FAFBFB] hover:bg-white text-[#0D0F0D] cursor-pointer'
              }`}
            >
              {/* Progress fill */}
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-500 ${isSelected ? 'bg-[#9BE5E3]/30' : 'bg-[#F0F2F5]'}`}
                style={{ width: `${percentage}%` }}
              />
              <div className="relative flex items-center justify-between z-10">
                <div className="flex items-center gap-2.5 pr-4">
                  {isSelected
                    ? <CheckCircle2 className="w-4 h-4 text-[#3DA8A5] flex-shrink-0" />
                    : <span className="w-5 h-5 rounded-full border border-[#C8CAD4] text-[10px] font-extrabold flex items-center justify-center text-[#3D3F4A] flex-shrink-0 bg-white">
                        {String.fromCharCode(65 + idx)}
                      </span>
                  }
                  <span className="text-xs sm:text-sm font-semibold">{option}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-extrabold text-[#0D0F0D]">{percentage}%</span>
                  <span className="text-[11px] text-[#8A8B97] font-medium">({count})</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-[#8A8B97] pt-2.5 border-t border-[#F0F2F5]">
        <span className="flex items-center gap-1.5 font-medium">
          <Users className="w-3.5 h-3.5" />
          {totalVotes} {totalVotes === 1 ? 'response' : 'responses'}
        </span>
        {isStudent && (
          <span className="font-semibold text-[#3D3F4A]">
            {hasVoted ? '✓ Your vote recorded' : isClosed ? 'Voting closed' : 'Click to vote'}
          </span>
        )}
      </div>
    </div>
  );
};
