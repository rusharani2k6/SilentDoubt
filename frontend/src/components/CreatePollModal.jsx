import React, { useState } from 'react';
import { X, Plus, Trash2, BarChart2, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';

export const CreatePollModal = ({ isOpen, onClose, onCreatePoll }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['Yes, completely clear', 'Partially understood', 'Need more examples']);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, idx) => idx !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleApplyPreset = (presetQuestion, presetOptions) => {
    setQuestion(presetQuestion);
    setOptions(presetOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanQuestion = question.trim();
    const cleanOptions = options.map((opt) => opt.trim()).filter(Boolean);

    if (!cleanQuestion || cleanOptions.length < 2) {
      alert('Please provide a question and at least 2 non-empty options.');
      return;
    }

    onCreatePoll(cleanQuestion, cleanOptions);
    onClose();
    setQuestion('');
    setOptions(['Yes, completely clear', 'Partially understood', 'Need more examples']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-[#E4E8EE] rounded-4xl w-full max-w-lg shadow-sd-xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#F0F2F5] flex items-center justify-between bg-[#FAFBFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#9BE5E3]/40 text-[#1F7A78] flex items-center justify-center font-bold">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0D0F0D]">Create Comprehension Poll</h3>
              <p className="text-[11px] text-[#8A8B97]">Broadcast a live voting check to all connected students</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8A8B97] hover:text-[#0D0F0D] hover:bg-[#F0F2F5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-5 pt-3.5 pb-2 bg-[#F8FAFC] border-b border-[#F0F2F5]">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8B97] flex items-center gap-1 mb-2">
            <Sparkles className="w-3 h-3 text-[#3DA8A5]" /> Instant Presets
          </span>
          <div className="flex flex-wrap gap-1.5 pb-1">
            <button
              type="button"
              onClick={() =>
                handleApplyPreset('Is the concept clear so far?', [
                  'Yes, totally clear',
                  'Somewhat clear',
                  'Need an explanation again',
                ])
              }
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white hover:bg-[#F0F2F5] border border-[#E4E8EE] text-[#3D3F4A] transition-colors cursor-pointer"
            >
              Comprehension Check
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset('Is the lecture pacing comfortable?', [
                  'Too Fast',
                  'Just Right',
                  'Too Slow',
                ])
              }
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white hover:bg-[#F0F2F5] border border-[#E4E8EE] text-[#3D3F4A] transition-colors cursor-pointer"
            >
              Pacing Check
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset('True or False?', ['True', 'False'])
              }
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white hover:bg-[#F0F2F5] border border-[#E4E8EE] text-[#3D3F4A] transition-colors cursor-pointer"
            >
              True / False
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Question Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3F4A] mb-1.5">
              Poll Question
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Which scheduling algorithm minimizes average waiting time?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-[#FAFBFB] border border-[#E4E8EE] rounded-2xl px-3.5 py-2.5 text-sm text-[#0D0F0D] placeholder-[#8A8B97] focus:outline-none focus:border-[#3DA8A5] focus:bg-white font-medium"
            />
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3F4A]">
                Options List
              </label>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-[#3DA8A5] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Option
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-center text-xs font-extrabold text-[#8A8B97]">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 bg-[#FAFBFB] border border-[#E4E8EE] rounded-2xl px-3 py-2 text-sm text-[#0D0F0D] placeholder-[#8A8B97] focus:outline-none focus:border-[#3DA8A5] focus:bg-white font-medium"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-[#8A8B97] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F0F2F5]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
            >
              Broadcast Live Poll
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
