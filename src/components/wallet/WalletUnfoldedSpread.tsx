import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  CheckCircle2,
  Cpu,
  Layers,
  Github,
  Sparkles,
  ChevronLeft,
  Compass,
  MousePointerClick,
} from 'lucide-react';
import { PORTFOLIO_DATA, Project } from '../../data/portfolioData';
import { getWalletProjectMeta } from '../../utils/walletLogic';
import {
  WalletCardVisualEmblem,
  WalletLiveDemoRenderer,
} from './WalletCardVisualEmblem';
import { APPLE_EASE } from '../motion/MotionWrappers';

interface WalletUnfoldedSpreadProps {
  project: Project;
  allProjects: Project[];
  onSelectProject: (project: Project) => void;
  onFoldWallet: () => void;
}

export const WalletUnfoldedSpread: React.FC<WalletUnfoldedSpreadProps> = ({
  project,
  allProjects,
  onSelectProject,
  onFoldWallet,
}) => {
  const meta = getWalletProjectMeta(project.id);
  const currentIndex = allProjects.findIndex((p) => p.id === project.id);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onFoldWallet();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onFoldWallet]);

  return (
    <motion.div
      key="wallet-unfolded"
      initial={{ opacity: 0, scale: 0.96, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 12 }}
      transition={{ duration: 0.42, ease: APPLE_EASE }}
      className="wallet-perspective"
      data-testid="wallet-unfolded-view"
      role="region"
      aria-label={`Expanded wallet view for ${project.name}`}
    >
      {/* Outer Stitched Leather Bifold Frame */}
      <div className="wallet-leather-shell relative rounded-[28px] p-3 sm:p-5 border border-stone-700/70 shadow-[0_32px_70px_-20px_rgba(15,23,42,0.45)] overflow-hidden">
        {/* Saddle stitch perimeter */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2 rounded-[22px] border border-dashed border-amber-200/20"
        />

        {/* Top Leather Rim: Card Switcher + Fold Wallet Button */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-2 sm:px-3 pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-0.5">
            <button
              type="button"
              onClick={onFoldWallet}
              aria-label="Fold wallet and return to stacked cards"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-100 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Fold Wallet</span>
            </button>

            <span aria-hidden="true" className="text-stone-600 hidden sm:inline">
              |
            </span>

            <div
              className="flex items-center gap-1"
              role="tablist"
              aria-label="Switch mini project inside unfolded wallet"
            >
              {allProjects.map((item, idx) => {
                const isSelected = item.id === project.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => onSelectProject(item)}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                      isSelected
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="font-mono-code opacity-70 mr-1 tabular-nums">
                      0{idx + 1}
                    </span>
                    <span className="hidden md:inline">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onFoldWallet}
            aria-label="Close unfolded wallet"
            className="p-2 text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            title="Fold wallet (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bifold Interior Spread: Left & Right Leather Leaves with Center Crease */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          {/* Center Bifold Leather Spine Shadow (Desktop) */}
          <div
            aria-hidden="true"
            className="hidden lg:block pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 z-20"
          >
            <div className="w-full h-full bg-gradient-to-r from-black/35 via-black/10 to-black/35 rounded-full blur-[1px]" />
            <div className="absolute inset-y-3 left-1/2 -translate-x-1/2 border-l border-dashed border-amber-200/20" />
          </div>

          {/* LEFT LEAF: Project Overview, Purpose & Interactive Live Demo */}
          <motion.div
            key={`left-${project.id}`}
            initial={{ opacity: 0, rotateY: -18, x: 10 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            transition={{ duration: 0.52, ease: APPLE_EASE }}
            style={{ transformOrigin: 'right center', transformStyle: 'preserve-3d' }}
            className="lg:col-span-6 bg-[#FCFCFD] rounded-2xl border border-stone-200/90 p-5 sm:p-7 flex flex-col justify-between gap-6 shadow-inner"
          >
            <div className="space-y-5">
              {/* Project Overview Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200/80">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-0.5 rounded-xl bg-stone-900 shadow-sm shrink-0">
                    <WalletCardVisualEmblem projectId={project.id} size="md" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
                      <span className="font-mono-code font-semibold text-blue-600 tabular-nums">
                        Card 0{currentIndex + 1} of 0{allProjects.length}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span>{project.category.replace('|', '·')}</span>
                    </div>
                    <h4
                      className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
                      data-testid="unfolded-project-title"
                    >
                      {project.name}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Project Overview
                </h5>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {project.fullDescription}
                </p>
              </div>

              {/* Purpose / Problem It Solves */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Purpose &amp; Engineering Focus</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {meta.purpose}
                </p>
              </div>

              {/* Live Interactive Demo Embedded Inside the Wallet */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Interactive Live Demonstration</span>
                  </h5>
                  <span className="text-[11px] text-slate-500">Try it directly below</span>
                </div>
                <WalletLiveDemoRenderer projectId={project.id} />
              </div>
            </div>
          </motion.div>

          {/* RIGHT LEAF: Key Functionalities, User Interactions, Tech Stack & Project Links */}
          <motion.div
            key={`right-${project.id}`}
            initial={{ opacity: 0, rotateY: 18, x: -10 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            transition={{ duration: 0.52, ease: APPLE_EASE }}
            style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
            className="lg:col-span-6 bg-[#FCFCFD] rounded-2xl border border-stone-200/90 p-5 sm:p-7 flex flex-col justify-between gap-6 shadow-inner"
          >
            <div className="space-y-6">
              {/* Key Functionalities & Implementation Details */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                  Key Functionalities &amp; Technical Highlights
                </h5>
                <ul className="space-y-2.5">
                  {project.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Main User Interactions */}
              <div className="pt-4 border-t border-slate-200/80">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5 flex items-center gap-1.5">
                  <MousePointerClick className="w-3.5 h-3.5 text-blue-600" />
                  <span>Main User Interactions</span>
                </h5>
                <ul className="space-y-2">
                  {meta.userInteractions.map((interaction, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-600 leading-relaxed flex items-start gap-2"
                    >
                      <span
                        aria-hidden="true"
                        className="font-mono-code text-blue-600 font-semibold shrink-0"
                      >
                        0{idx + 1}.
                      </span>
                      <span>{interaction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Architecture Note */}
              {project.architectureNotes && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
                    <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Implementation Architecture</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {project.architectureNotes}
                  </p>
                </div>
              )}

              {/* Structured Technology Stack */}
              <div className="pt-4 border-t border-slate-200/80">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Technology Stack</span>
                </h5>
                <div className="space-y-3">
                  {meta.stackGroups.map((group) => (
                    <div
                      key={group.label}
                      className="flex flex-col sm:flex-row sm:items-center gap-2"
                    >
                      <span className="text-xs font-semibold text-slate-500 sm:w-36 shrink-0">
                        {group.label}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200/90 rounded-lg"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Links & Fold Action Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={project.githubUrl ?? PORTFOLIO_DATA.personal.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>
                    {project.githubUrl ? 'GitHub Repository' : 'GitHub Profile'}
                  </span>
                </a>
                <span className="text-xs text-slate-500">
                  Live interactive demo active in left panel
                </span>
              </div>

              <button
                type="button"
                onClick={onFoldWallet}
                className="px-4 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-blue-600 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Fold Wallet
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
