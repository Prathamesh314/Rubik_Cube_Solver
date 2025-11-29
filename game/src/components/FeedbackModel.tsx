// components/FeedbackModal.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function FeedbackModal({ isOpen, onClose, userId }: FeedbackModalProps) {
  const [type, setType] = useState<'feedback' | 'bug'>('feedback');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/report_feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          type,
          created_by: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitStatus('success');
      setText('');
      
      // Close modal after 1.5 seconds on success
      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
      }, 1500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4 border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">Report Feedback</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="feedback"
                  checked={type === 'feedback'}
                  onChange={(e) => setType(e.target.value as 'feedback')}
                  className="mr-2 accent-emerald-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-slate-300">Feedback</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="bug"
                  checked={type === 'bug'}
                  onChange={(e) => setType(e.target.value as 'bug')}
                  className="mr-2 accent-emerald-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-slate-300">Bug Report</span>
              </label>
            </div>
          </div>

          {/* Text Area */}
          <div className="mb-4">
            <label htmlFor="feedback-text" className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              id="feedback-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={type === 'bug' ? 'Describe the bug you encountered...' : 'Share your feedback...'}
              rows={5}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-sm">
              Thank you! Your {type} has been submitted successfully.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md text-sm">
              Failed to submit. Please try again.
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-500 transition-colors disabled:bg-emerald-800 disabled:cursor-not-allowed"
              disabled={isSubmitting || !text.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}