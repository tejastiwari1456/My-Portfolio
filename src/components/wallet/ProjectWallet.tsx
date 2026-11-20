import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight,
  CheckCircle2,
  Hand,
  MousePointer2,
  Wallet,
} from 'lucide-react';
import { Project } from '../../data/portfolioData';
import {
  computeWalletCardTransform,
  resolveCardClick,
  getNextWalletIndex,
  getWalletProjectMeta,
  WalletInteractionState,
} from '../../utils/walletLogic';
import { WalletCard } from './WalletCard';
import { WalletUnfoldedSpread } from './WalletUnfoldedSpread';
import { WalletCardVisualEmblem } from './WalletCardVisualEmblem';
import { APPLE_EASE } from '../motion/MotionWrappers';

interface ProjectWalletProps {
  projects: Project[];
}

export const ProjectWallet: React.FC<ProjectWalletProps> = ({ projects }) => {
  const [interaction, setInteraction] = useState<WalletInteractionState>({
    previewIndex: null,
    expandedId: null,
  });
  const [lastPreviewedIndex, setLastPreviewedIndex] = useState<number>(0);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)');
    const syncTouch = () => setIsTouchDevice(mediaQuery.matches);
    syncTouch();
    mediaQuery.addEventListener?.('change', syncTouch);
    return () => mediaQuery.removeEventListener?.('change', syncTouch);
  }, []);

  if (projects.length === 0) return null;

  const activeLiftIndex = interaction.previewIndex;
  const previewProject =
    projects[activeLiftIndex ?? lastPreviewedIndex] ?? projects[0];
  const previewIndexForDisplay = activeLiftIndex ?? lastPreviewedIndex;
  const previewMeta = getWalletProjectMeta(previewProject.id);

  const expandedProject = interaction.expandedId
    ? projects.find((p) => p.id === interaction.expandedId) ?? null
    : null;

  const handleHoverCard = (index: number) => {
    if (isTouchDevice) return;
    setInteraction((prev) => ({ ...prev, previewIndex: index }));
    setLastPreviewedIndex(index);
  };

  const handleFocusCard = (index: number) => {
    setInteraction((prev) => ({ ...prev, previewIndex: index }));
    setLastPreviewedIndex(index);
  };

  const handleLeaveWallet = () => {
    if (isTouchDevice) return;
    setInteraction((prev) => ({ ...prev, previewIndex: null }));
  };

  const handleClickCard = (index: number, projectId: string) => {
    setLastPreviewedIndex(index);
    setInteraction((prev) =>
      resolveCardClick(prev, index, projectId, isTouchDevice)
    );
  };

  const handleKeyDownCard = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = getNextWalletIndex(index, 'next', projects.length);
      setInteraction((prev) => ({ ...prev, previewIndex: next }));
      setLastPreviewedIndex(next);
      cardRefs.current[next]?.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = getNextWalletIndex(index, 'prev', projects.length);
      setInteraction((prev) => ({ ...prev, previewIndex: prevIdx }));
      setLastPreviewedIndex(prevIdx);
      cardRefs.current[prevIdx]?.focus();
    } else if (e.key === 'Escape') {
      setInteraction({ previewIndex: null, expandedId: null });
    }
  };

  const handleOpenPreviewedProject = () => {
    setInteraction({
      previewIndex: previewIndexForDisplay,
      expandedId: previewProject.id,
    });
  };

  const handleFoldWallet = () => {
    setInteraction((prev) => ({
      previewIndex: null,
      expandedId: null,
    }));
  };

  return (
    <div className="relative" data-testid="project-wallet-container">
      <AnimatePresence mode="wait">
        {expandedProject ? (
          <WalletUnfoldedSpread
            key="unfolded"
            project={expandedProject}
            allProjects={projects}
            onSelectProject={(p) => {
              const idx = projects.findIndex((item) => item.id === p.id);
              if (idx >= 0) setLastPreviewedIndex(idx);
              setInteraction({
                previewIndex: idx >= 0 ? idx : 0,
                expandedId: p.id,
              });
            }}
            onFoldWallet={handleFoldWallet}
          />
        ) : (
          <motion.div
            key="folded"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.35, ease: APPLE_EASE }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
          >
            {/* LEFT / CENTER: Physical 3D Leather Wallet */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div
                onMouseLeave={handleLeaveWallet}
                className="wallet-perspective relative w-full max-w-[540px]"
                data-testid="digital-leather-wallet"
              >
                {/* Ground Ambient Shadow beneath the Leather Wallet */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-5 inset-x-8 h-10 rounded-full bg-slate-900/25 blur-2xl"
                />

                {/* Back Leather Wallet Body */}
                <div className="wallet-leather-shell relative rounded-[30px] pt-14 px-2 pb-2 border border-stone-700/80 shadow-[0_26px_60px_-15px_rgba(15,23,42,0.45)] overflow-visible">
                  {/* Outer Saddle Stitching */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-2.5 rounded-[22px] border border-dashed border-amber-200/20"
                  />

                  {/* Subtle Top Leather Monogram Stamp */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-4 inset-x-6 flex items-center justify-between text-[10px] font-mono-code tracking-[0.22em] text-amber-100/35 uppercase select-none"
                  >
                    <span>Tejas Tiwari · Craft</span>
                    <span className="tabular-nums">0{projects.length} Slots</span>
                  </div>

                  {/* Stacked Collectible Cards Bay */}
                  <div className="relative h-[480px] sm:h-[496px] w-full">
                    {projects.map((project, index) => {
                      const transform = computeWalletCardTransform(
                        index,
                        projects.length,
                        activeLiftIndex,
                        64
                      );
                      const isActive = activeLiftIndex === index;

                      return (
                        <WalletCard
                          key={project.id}
                          project={project}
                          index={index}
                          transform={transform}
                          isActive={isActive}
                          isTouchDevice={isTouchDevice}
                          onHoverStart={() => handleHoverCard(index)}
                          onFocusCard={() => handleFocusCard(index)}
                          onClickCard={() => handleClickCard(index, project.id)}
                          onKeyDownCard={(e) => handleKeyDownCard(e, index)}
                          buttonRef={(el) => {
                            cardRefs.current[index] = el;
                          }}
                        />
                      );
                    })}

                    {/* Front Stitched Leather Pocket Flap (covers bottom of resting stack) */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-[156px] sm:h-[162px] z-25 rounded-b-[26px] rounded-t-xl overflow-hidden shadow-[0_-12px_28px_rgba(0,0,0,0.55)]"
                    >
                      {/* Curved Thumb-Notch Cutout Leather SVG + Surface */}
                      <svg
                        viewBox="0 0 540 160"
                        preserveAspectRatio="none"
                        className="w-full h-full block"
                      >
                        <defs>
                          <linearGradient
                            id="walletPocketLeather"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#29231F" />
                            <stop offset="50%" stopColor="#1E1A17" />
                            <stop offset="100%" stopColor="#151210" />
                          </linearGradient>
                          <linearGradient
                            id="walletPocketRim"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop offset="0%" stopColor="rgba(255,235,205,0.08)" />
                            <stop offset="50%" stopColor="rgba(255,235,205,0.28)" />
                            <stop offset="100%" stopColor="rgba(255,235,205,0.08)" />
                          </linearGradient>
                        </defs>
                        {/* Main leather flap silhouette with ergonomic center thumb dip */}
                        <path
                          d="M0,12 Q0,0 14,0 L185,0 C215,0 232,26 270,26 C308,26 325,0 355,0 L526,0 Q540,0 540,12 L540,160 L0,160 Z"
                          fill="url(#walletPocketLeather)"
                        />
                        {/* Top leather bevel highlight */}
                        <path
                          d="M14,1 L185,1 C215,1 232,27 270,27 C308,27 325,1 355,1 L526,1"
                          fill="none"
                          stroke="url(#walletPocketRim)"
                          strokeWidth="1.5"
                        />
                        {/* Saddle stitch line following the curved thumb notch */}
                        <path
                          d="M14,11 L182,11 C212,11 230,36 270,36 C310,36 328,11 358,11 L526,11 L526,148 L14,148 Z"
                          fill="none"
                          stroke="rgba(253, 230, 138, 0.22)"
                          strokeWidth="1.25"
                          strokeDasharray="4 4"
                        />
                      </svg>

                      {/* Embossed Leather Brand Seal on Front Flap */}
                      <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center text-center px-4">
                        <div className="inline-flex items-center gap-2 text-amber-100/55">
                          <Wallet className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold tracking-[0.22em] uppercase">
                            Project Folio
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-code text-stone-400/75 mt-1">
                          {isTouchDevice
                            ? 'Tap card to lift · Tap again to unfold'
                            : 'Hover to lift · Click any card to unfold'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Synchronized Hover / Focus / Tap Card Preview */}
            <div className="lg:col-span-5">
              <div
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-lg shadow-slate-200/50"
                data-testid="wallet-preview-panel"
                aria-live="polite"
              >
                <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                    {isTouchDevice ? (
                      <Hand className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <MousePointer2 className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>
                      {activeLiftIndex !== null
                        ? 'Card Lifted Preview'
                        : 'Selected Card Preview'}
                    </span>
                  </span>
                  <span className="font-mono-code text-[11px] text-slate-500 tabular-nums">
                    0{previewIndexForDisplay + 1} / 0{projects.length}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={previewProject.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: APPLE_EASE }}
                    className="space-y-5"
                  >
                    {/* Header: Visual Emblem + Category + Prominent Title */}
                    <div className="flex items-start gap-3.5">
                      <div className="p-0.5 rounded-xl bg-stone-900 shadow-xs shrink-0">
                        <WalletCardVisualEmblem
                          projectId={previewProject.id}
                          size="md"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-slate-500 mb-0.5">
                          {previewProject.category.replace('|', '·')}
                        </div>
                        <h4
                          className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
                          data-testid="wallet-preview-title"
                        >
                          {previewProject.name}
                        </h4>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {previewProject.shortDescription}
                    </p>

                    {/* Major Functionalities & Features */}
                    <div>
                      <div className="text-xs font-bold text-slate-900 mb-2.5">
                        Key Highlights
                      </div>
                      <ul className="space-y-2">
                        {(previewProject.highlights ?? previewMeta.userInteractions).map(
                          (item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed"
                            >
                              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {/* Technology Stack Badges */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="text-xs font-bold text-slate-900 mb-2">
                        Technology Stack
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {previewProject.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200/90 rounded-lg"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Clear Clickable Action to Unfold the Wallet */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleOpenPreviewedProject}
                        aria-label={`Unfold wallet to inspect ${previewProject.name}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-blue-600 rounded-xl transition-colors shadow-sm cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <span>Unfold Wallet</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-[11px] text-slate-500 text-right">
                        Opens full overview &amp; live demo
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
