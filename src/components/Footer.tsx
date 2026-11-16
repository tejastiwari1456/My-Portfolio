import React from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { Github, Linkedin, Code2, ArrowUp, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-400 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-800">
          {/* Brand & Closing tagline */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-xs">
                TT
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                {PORTFOLIO_DATA.personal.name}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Designed with curiosity. Built with code.
            </p>
          </div>

          {/* Quick Nav Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-xs font-medium">
            <a href="#about" className="text-slate-300 hover:text-white transition-colors">About</a>
            <a href="#skills" className="text-slate-300 hover:text-white transition-colors">Skills</a>
            <a href="#projects" className="text-slate-300 hover:text-white transition-colors">Projects</a>
            <a href="#achievements" className="text-slate-300 hover:text-white transition-colors">Achievements</a>
            <a href="#education" className="text-slate-300 hover:text-white transition-colors">Education</a>
            <a href="#contact" className="text-slate-300 hover:text-white transition-colors">Contact</a>
          </nav>

          {/* Social Profiles & Back to Top */}
          <div className="flex items-center gap-3">
            <a
              href={PORTFOLIO_DATA.personal.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
              aria-label="GitHub Profile"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={PORTFOLIO_DATA.personal.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={PORTFOLIO_DATA.personal.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
              aria-label="LeetCode Profile"
              title="LeetCode Profile"
            >
              <Code2 className="w-4 h-4" />
            </a>
            <a
              href={PORTFOLIO_DATA.personal.hackerrankUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-2 text-[11px] font-bold text-emerald-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
              aria-label="HackerRank Profile"
              title="HackerRank Profile"
            >
              HR
            </a>
            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors ml-2 cursor-pointer"
              aria-label="Scroll back to top of page"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            &copy; {currentYear} {PORTFOLIO_DATA.personal.name}. All rights reserved.
          </div>
          <div>
            Computer Science & Engineering (AI & ML) · PSIT Kanpur
          </div>
        </div>
      </div>
    </footer>
  );
};
