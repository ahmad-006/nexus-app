import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Loader2,
  CheckSquare,
  Calendar,
  User,
  Paperclip,
  Trash2,
  UploadCloud,
  Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRIORITIES = [
  { id: 'LOW', label: 'Low', activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-sm', inactiveClass: 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/60' },
  { id: 'MEDIUM', label: 'Medium', activeClass: 'bg-amber-600 text-white border-amber-600 shadow-sm', inactiveClass: 'bg-amber-50/60 text-amber-700 border-amber-200/80 hover:bg-amber-100/60' },
  { id: 'HIGH', label: 'High', activeClass: 'bg-rose-600 text-white border-rose-600 shadow-sm', inactiveClass: 'bg-rose-50/60 text-rose-700 border-rose-200/80 hover:bg-rose-100/60' }
];

const CreateTicketModal = ({ isOpen, onClose, onSubmit, isSubmitting, members = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: '',
    files: []
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        assigneeId: '',
        files: []
      });
    }
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      assigneeId: formData.assigneeId || null,
    });
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  const handleRemoveFile = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return createPortal(
    <AnimatePresence>
      {/* 1. Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 2. Modal Centered Viewport Container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 pointer-events-none">
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.18)] border border-slate-200/90 overflow-hidden pointer-events-auto flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3.5rem)] my-auto"
        >
          {/* Header (Fixed) */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0">
                <CheckSquare size={17} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug">Create New Task</h2>
                <p className="text-xs text-slate-500">Dispatch an actionable ticket to the sprint board</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content (Scrollable) */}
          <form id="create-task-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-left">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                autoFocus
                placeholder="e.g. Implement OAuth JWT refresh middleware"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Provide architectural context, acceptance criteria, or repro steps..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition-all resize-none text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Priority & Due Date (2-column) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority Pills */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Flag size={12} className="text-slate-400" />
                  <span>Priority</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/70 border border-slate-200/60 rounded-xl">
                  {PRIORITIES.map((p) => {
                    const isSelected = formData.priority === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: p.id })}
                        className={`py-1.5 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
                          isSelected ? p.activeClass : `${p.inactiveClass} border-transparent`
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  <span>Due Date</span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition-all text-xs font-medium text-slate-700"
                />
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <User size={12} className="text-slate-400" />
                <span>Assignee</span>
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition-all text-xs sm:text-sm text-slate-800 font-medium cursor-pointer"
              >
                <option value="">Unassigned (Squad Backlog)</option>
                {members.map((member) => {
                  const u = member.userId;
                  const memberId = (u?._id || member.userId)?.toString();
                  const memberName = u?.name || 'Operative';
                  const memberRole = member.role ? ` • ${member.role.toUpperCase()}` : '';
                  return (
                    <option key={memberId} value={memberId}>
                      {memberName} ({u?.email || 'No email'}{memberRole})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Attachments */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Paperclip size={12} className="text-slate-400" />
                  <span>Attachments</span>
                </label>
                <span className="text-[11px] text-slate-400">Images only</span>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Custom Dropzone Trigger */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50 rounded-xl p-3 text-center cursor-pointer transition-all group"
              >
                <UploadCloud size={18} className="mx-auto text-slate-400 group-hover:text-slate-700 transition-colors mb-1" />
                <p className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                  Click to select files <span className="font-normal text-slate-400">or browse computer</span>
                </p>
              </div>

              {/* Attached file chips */}
              {formData.files && formData.files.length > 0 && (
                <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto">
                  {formData.files.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between px-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate font-medium text-slate-800 max-w-[240px]">{file.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Footer (Fixed) */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded shadow-xs">ESC</kbd> to exit
            </span>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-task-form"
                disabled={isSubmitting || !formData.title.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Task</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default CreateTicketModal;
