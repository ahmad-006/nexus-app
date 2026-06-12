import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateTicketModal = ({ isOpen, onClose, onSubmit, isSubmitting, members = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: '',
    files: []
  });

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

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      assigneeId: formData.assigneeId || null,
    });
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200/60"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Create New Task</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Title <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                autoFocus
                placeholder="e.g. Update login page styling"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-[15px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                rows={4}
                placeholder="Add more details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all resize-none text-[15px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-[15px] appearance-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date (Optional)</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-[15px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Assignee (Optional)</label>
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-[15px] text-slate-800"
              >
                <option value="">Unassigned</option>
                {members.map((member) => {
                  const u = member.userId;
                  const memberId = (u?._id || member.userId)?.toString();
                  const memberName = u?.name || 'Operative';
                  const memberEmail = u?.email ? ` (${u.email})` : '';
                  return (
                    <option key={memberId} value={memberId}>
                      {memberName}{memberEmail}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Attachments (Optional)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setFormData({ ...formData, files });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-all cursor-pointer"
              />
              {formData.files && formData.files.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  {formData.files.length} {formData.files.length === 1 ? 'image' : 'images'} selected
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Task
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default CreateTicketModal;
