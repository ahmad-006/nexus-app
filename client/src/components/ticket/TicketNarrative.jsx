import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DOMPurify from 'dompurify';
import { Paperclip, Download, X, Expand, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const isImage = (filename) => filename && filename.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);

const TicketNarrative = ({ ticket, onUpdate }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(ticket.title);
  
  // Gallery State
  const [lightboxIndex, setLightboxIndex] = useState(null);
  
  // Derive array of just images for the gallery
  const imageAttachments = ticket.attachments?.filter(f => isImage(f.name)) || [];
  
  const ticketIdStr = `NEX-${ticket._id.substring(ticket._id.length - 4).toUpperCase()}`;

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (title.trim() !== ticket.title) {
      onUpdate({ title: title.trim() });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') handleTitleSubmit();
    if (e.key === 'Escape') {
      setTitle(ticket.title);
      setIsEditingTitle(false);
    }
  };

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(prev => prev - 1);
    }
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex < imageAttachments.length - 1) {
      setLightboxIndex(prev => prev + 1);
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, imageAttachments.length]);

  // Safe description rendering
  const safeDescription = DOMPurify.sanitize(ticket.description || 'No description provided.', {
    USE_PROFILES: { html: true }
  });

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      
      {/* Header / Title */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <span className="hover:text-slate-900 cursor-pointer transition-colors">Workspace</span>
          <span>/</span>
          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{ticketIdStr}</span>
        </div>

        {isEditingTitle ? (
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleTitleKeyDown}
            className="text-3xl font-bold text-slate-900 bg-white border border-blue-400 rounded-lg px-3 py-1 outline-none ring-2 ring-blue-100 w-full"
          />
        ) : (
          <h1 
            onClick={() => setIsEditingTitle(true)}
            className="text-3xl font-bold text-slate-900 leading-tight cursor-pointer hover:bg-slate-100 px-3 py-1 -ml-3 rounded-lg transition-colors border border-transparent"
          >
            {ticket.title}
          </h1>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-slate-900">Description</h3>
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div 
            className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-[15px]"
            dangerouslySetInnerHTML={{ __html: safeDescription }}
          />
        </div>
      </div>

      {/* Attachments Grid */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Attachments</h3>
          <div className="flex flex-row flex-wrap gap-4">
            {ticket.attachments.map((file, idx) => {
              const fileIsImage = isImage(file.name);
              
              if (fileIsImage) {
                // Find the index of THIS specific image within the filtered imageAttachments array
                const galleryIndex = imageAttachments.findIndex(img => img.url === file.url);
                
                return (
                  <div
                    key={idx}
                    onClick={() => setLightboxIndex(galleryIndex)}
                    className="group w-32 h-32 rounded-xl bg-slate-50 overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-md transition-all cursor-pointer relative"
                  >
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white p-2 rounded-full shadow-sm text-slate-700 hover:text-blue-600 transition-colors">
                        <Expand className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              }

              // DOCUMENT RENDER (Pill)
              return (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 p-3 pr-4 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer h-16 max-w-[240px]"
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 line-clamp-2" title={file.name}>
                    {file.name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Hardware Accelerated Gallery Lightbox */}
      {createPortal(
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setLightboxIndex(null)}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 sm:p-8"
            >
              {/* Close Button */}
              <button 
                className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md z-50"
                onClick={() => setLightboxIndex(null)}
              >
                <X className="w-6 h-6" />
              </button>

              {/* Left Arrow */}
              {lightboxIndex > 0 && (
                <button 
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md z-50"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              )}

              {/* Right Arrow */}
              {lightboxIndex < imageAttachments.length - 1 && (
                <button 
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md z-50"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}

              {/* Image Container */}
              <div className="relative max-w-full max-h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <AnimatePresence>
                  <motion.img 
                    key={lightboxIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98, position: 'absolute' }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    src={imageAttachments[lightboxIndex]?.url} 
                    alt={imageAttachments[lightboxIndex]?.name || "Attachment"} 
                    className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-2xl object-contain cursor-default" 
                  />
                </AnimatePresence>
                
                {/* Image Counter */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/60 font-medium text-sm">
                  {lightboxIndex + 1} / {imageAttachments.length}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
      
    </div>
  );
};

export default TicketNarrative;
