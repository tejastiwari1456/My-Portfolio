import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { PORTFOLIO_DATA, Project } from '../data/portfolioData';
import { X, CheckCircle2, Layers, Cpu, Calendar, Github } from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-blue-600 mb-1">
              {project.category.replace('|', '·')}
            </div>
            <h2 id="modal-title" className="text-2xl font-extrabold text-slate-900">
              {project.name}
            </h2>
            {(project.timeline || project.statusText) && (
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-medium">
                {project.timeline && (
                  <>
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{project.timeline}</span>
                  </>
                )}
                {project.timeline && project.statusText && <span aria-hidden="true">·</span>}
                {project.statusText && (
                  <span className="text-emerald-700 font-semibold">{project.statusText}</span>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
            aria-label="Close Project Details Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-600 text-sm">
          {/* Detailed Overview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              Project Overview &amp; Architecture
            </h3>
            <p className="leading-relaxed text-slate-700">
              {project.fullDescription}
            </p>
          </div>

          {/* Architecture Notes */}
          {project.architectureNotes && (
            <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Technical Architecture Specification
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {project.architectureNotes}
              </p>
            </div>
          )}

          {/* Key Architectural Features */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Core Capabilities &amp; Implemented Modules
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {project.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-800 leading-relaxed font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-600" />
              Technology Stack Breakdown
            </h3>
            <div className="text-xs text-slate-700 font-medium leading-relaxed">
              {project.techStack.map((tech, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <span aria-hidden="true" className="mx-2 text-slate-300">
                      ·
                    </span>
                  )}
                  <span>{tech}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap"
              >
                <Github className="w-3.5 h-3.5" />
                <span>View Source Repository</span>
              </a>
            ) : (
              <a
                href={PORTFOLIO_DATA.personal.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Browse GitHub Profile</span>
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer whitespace-nowrap shrink-0"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
