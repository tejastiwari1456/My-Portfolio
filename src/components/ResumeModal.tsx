import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import {
  X,
  Printer,
  Download,
  ExternalLink,
  CheckCircle2,
  FileText,
  Eye,
} from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const {
    personal,
    skillCategories,
    featuredProjects,
    education,
    certifications,
    achievements,
  } = PORTFOLIO_DATA;

  const [viewMode, setViewMode] = useState<'web' | 'pdf'>('web');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (viewMode !== 'web') {
      setViewMode('web');
      setTimeout(() => window.print(), 100);
    } else {
      window.print();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl max-h-[92vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal Toolbar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('web')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'web'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Interactive CV</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('pdf')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'pdf'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Attached PDF</span>
              </button>
            </div>
            <span className="text-xs text-slate-500 hidden md:inline">
              · {personal.name} (SDE Resume)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={personal.resumeUrl}
              download={personal.resumeFileName}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
              title="Download Official PDF Resume"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
              aria-label="Close Resume Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        {viewMode === 'pdf' ? (
          <div className="flex-1 bg-slate-100 flex flex-col min-h-[65vh]">
            <iframe
              src={personal.resumeUrl}
              title="Tejas Tiwari SDE Resume PDF"
              className="w-full flex-1 border-0 min-h-[65vh]"
            />
            <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>File: {personal.resumeFileName}</span>
              <a
                href={personal.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                Open PDF in New Tab <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          <div
            id="resume-printable"
            className="p-6 sm:p-10 overflow-y-auto space-y-7 text-xs text-slate-600 bg-white"
          >
            {/* Header */}
            <div className="border-b border-slate-200 pb-5 text-center sm:text-left">
              <h1 id="resume-title" className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                {personal.name}
              </h1>
              <p className="text-sm font-semibold text-blue-600 mb-3">
                {personal.headline}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>Kanpur, Uttar Pradesh</span>
                <span aria-hidden="true">|</span>
                <a href={`tel:${personal.phone.replace(/\s+/g, '')}`} className="text-slate-700 hover:text-blue-600 font-medium">
                  {personal.phone}
                </a>
                <span aria-hidden="true">|</span>
                <a href={`mailto:${personal.contactEmail}`} className="text-blue-600 hover:underline">
                  {personal.contactEmail}
                </a>
                <span aria-hidden="true">|</span>
                <a href={personal.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  LinkedIn
                </a>
                <span aria-hidden="true">|</span>
                <a href={personal.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  GitHub
                </a>
                <span aria-hidden="true">|</span>
                <a href={personal.leetcodeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  LeetCode
                </a>
                <span aria-hidden="true">|</span>
                <a href={personal.hackerrankUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  HackerRank
                </a>
              </div>
            </div>

            {/* Professional Summary */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-xs leading-relaxed text-slate-700">
                Computer Science undergraduate specializing in Artificial Intelligence and Machine Learning, with hands-on experience building full-stack applications using React.js, Node.js, Express.js, and PostgreSQL. Experienced in developing REST APIs, JWT-based authentication, role-based access control, database-backed session management, and AI-integrated applications. Strong foundation in Java, Data Structures and Algorithms, Object-Oriented Programming, and database management.
              </p>
            </div>

            {/* Education */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        {edu.institution}
                      </span>
                      <span className="text-blue-700 font-medium">
                        {edu.degree}
                      </span>
                    </div>
                    <div className="sm:text-right font-mono-code text-[11px] text-slate-500 shrink-0">
                      <span className="block">{edu.duration}</span>
                      <span className="font-semibold text-slate-900">{edu.scoreLabel}: {edu.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Skills */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                Skills
              </h2>
              <div className="space-y-1.5">
                {skillCategories.map((cat, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-1">
                    <span className="sm:col-span-4 font-semibold text-slate-900">
                      {cat.title}:
                    </span>
                    <span className="sm:col-span-8 text-slate-700">
                      {cat.skills.map((s) => s.name).join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Projects */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                Projects
              </h2>
              <div className="space-y-4">
                {featuredProjects.map((p) => (
                  <div key={p.id} className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <span className="font-bold text-slate-900 text-xs">
                        {p.name}{' '}
                        {p.githubUrl && (
                          <a
                            href={p.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 hover:underline ml-1"
                          >
                            GitHub ↗
                          </a>
                        )}
                      </span>
                      <span className="text-[11px] font-mono-code text-slate-500 shrink-0">
                        {p.timeline}
                      </span>
                    </div>
                    <p className="text-[11px] italic text-slate-500">
                      {p.techStack.join(', ')}
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 leading-relaxed">
                      {p.features.map((f, fIdx) => (
                        <li key={fIdx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications & Badges */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                Certifications &amp; Badges
              </h2>
              <div className="space-y-2 text-xs">
                {certifications.map((c) => (
                  <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-medium">
                        {c.title}, {c.year}
                      </span>
                    </div>
                    {c.verificationUrl && (
                      <a
                        href={c.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono-code text-blue-600 hover:underline pl-5 sm:pl-0"
                      >
                        {c.credentialLabel || 'Verify Credential'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                Achievements
              </h2>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                {achievements.map((ach) => (
                  <li key={ach.id}>{ach.description}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-600">
            Open to immediate SDE / Full-Stack internship opportunities
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-600 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
