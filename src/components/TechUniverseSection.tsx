import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  Compass,
  FolderGit2,
  Award,
  Layers,
  ListFilter,
  Network,
} from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import {
  GLOBE_CATEGORY_VISUALS,
  GlobeCategoryId,
  GlobeSkillNode,
  buildGlobeSkillNodes,
  buildSphericalMeshConnections,
  filterGlobeNodesByCategory,
  formatSphericalCoords,
  getConnectedSkillNeighbors,
} from '../utils/techGlobeLogic';
import {
  HoveredSkillPayload,
  TechGlobeCanvas,
} from './globe/TechGlobeCanvas';
import { TechGlobeFallback } from './globe/TechGlobeFallback';
import { Reveal } from './motion/MotionWrappers';

const CATEGORY_TABS: { id: GlobeCategoryId; label: string }[] = [
  { id: 'All', label: 'All Skills' },
  { id: 'Languages', label: 'Languages' },
  { id: 'Frontend Development', label: 'Frontend' },
  { id: 'Backend Development', label: 'Backend' },
  { id: 'Databases', label: 'Databases' },
  { id: 'AI Integration & APIs', label: 'AI & APIs' },
  { id: 'Core CS Concepts', label: 'Core CS' },
  { id: 'Tools & Platforms', label: 'Tools' },
];

export const TechUniverseSection: React.FC = () => {
  const globeNodes = useMemo(
    () => buildGlobeSkillNodes(PORTFOLIO_DATA.skillCategories, 2.42),
    []
  );
  const meshEdges = useMemo(
    () => buildSphericalMeshConnections(globeNodes, 3),
    [globeNodes]
  );

  const [activeCategory, setActiveCategory] = useState<GlobeCategoryId>('All');
  const [selectedSkill, setSelectedSkill] = useState<GlobeSkillNode | null>(
    null
  );
  const [hoveredSkill, setHoveredSkill] = useState<HoveredSkillPayload | null>(
    null
  );
  const [autoRotate, setAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dockExpanded, setDockExpanded] = useState(true);
  const [indexOpen, setIndexOpen] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedSkill) {
          setSelectedSkill(null);
        } else if (indexOpen) {
          setIndexOpen(false);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedSkill, indexOpen]);

  const filteredNodes = useMemo(
    () => filterGlobeNodesByCategory(globeNodes, activeCategory),
    [globeNodes, activeCategory]
  );

  const connectedNeighbors = useMemo(() => {
    if (!selectedSkill) return [];
    return getConnectedSkillNeighbors(
      selectedSkill.id,
      globeNodes,
      meshEdges
    ).slice(0, 4);
  }, [selectedSkill, globeNodes, meshEdges]);

  const handleSelectSkill = useCallback((node: GlobeSkillNode | null) => {
    setSelectedSkill(node);
    if (node) {
      setHoveredSkill(null);
      setIndexOpen(false);
    }
  }, []);

  const handleResetView = useCallback(() => {
    setSelectedSkill(null);
    setActiveCategory('All');
    setAutoRotate(true);
    setResetTrigger((n) => n + 1);
  }, []);

  const handleWebGLUnavailable = useCallback(() => {
    setWebglUnavailable(true);
  }, []);

  const selectedVisual = selectedSkill
    ? GLOBE_CATEGORY_VISUALS[selectedSkill.category]
    : null;

  return (
    <section
      id="tech-universe"
      aria-labelledby="tech-universe-heading"
      className="py-20 md:py-28 bg-[#F8FAFC] border-t border-slate-200/80 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <Reveal className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Interactive 3D Constellation
            </div>
            <h2
              id="tech-universe-heading"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900"
              style={{ textWrap: 'balance' }}
            >
              My Technical Universe
            </h2>
            <p className="mt-2.5 text-base text-slate-600 leading-relaxed">
              A 3D sphere constructed directly from the languages, frameworks,
              databases, and CS foundations powering my work.
            </p>
          </Reveal>

          <Reveal
            delay={0.1}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500"
          >
            <span className="tabular-nums text-slate-700 font-semibold">
              {filteredNodes.length} of {globeNodes.length} skill nodes
            </span>
            <span aria-hidden="true">·</span>
            <span>Drag to rotate</span>
            <span aria-hidden="true">·</span>
            <span>Click any skill to inspect</span>
          </Reveal>
        </div>

        {/* Dark Futuristic 3D Spatial Viewport */}
        <div
          data-testid="tech-universe-stage"
          data-selected-skill={selectedSkill ? selectedSkill.id : ''}
          data-active-category={activeCategory}
          className="relative w-full h-[540px] sm:h-[620px] lg:h-[660px] rounded-3xl overflow-hidden border border-slate-800/85 shadow-xl shadow-slate-950/20"
          style={{
            background:
              'radial-gradient(ellipse 72% 68% at 50% 46%, #0D1430 0%, #060B1A 56%, #030610 100%)',
          }}
        >
          {/* Non-obstructive top-left orientation label */}
          <div className="pointer-events-none absolute top-4 left-4 sm:top-5 sm:left-6 z-10 flex items-center gap-2.5 text-xs text-slate-300">
            <Compass className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-semibold text-slate-100">
              {activeCategory === 'All' ? 'All Disciplines' : activeCategory}
            </span>
            <span aria-hidden="true" className="text-slate-500 hidden sm:inline">
              ·
            </span>
            <span className="text-slate-400 hidden sm:inline">
              {isDragging
                ? 'Rotating manually'
                : selectedSkill
                  ? `Focused on ${selectedSkill.name}`
                  : reducedMotion
                    ? 'Reduced motion active'
                    : autoRotate
                      ? 'Auto-orbit active'
                      : 'Orbit paused'}
            </span>
          </div>

          {/* Top-right Skill Index quick locator */}
          <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIndexOpen((prev) => !prev)}
              aria-expanded={indexOpen}
              aria-label="Browse all skills on globe"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white border border-slate-700/90 hover:border-sky-400/70 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              style={{ backgroundColor: 'rgba(8, 13, 30, 0.92)' }}
            >
              <ListFilter className="w-3.5 h-3.5 text-sky-400" />
              <span>Skill Index</span>
            </button>
          </div>

          {/* 3D Skill-Constructed Sphere Canvas OR 2D Fallback */}
          {webglUnavailable ? (
            <TechGlobeFallback
              nodes={globeNodes}
              activeCategory={activeCategory}
              selectedSkillId={selectedSkill?.id ?? null}
              onSelectSkill={handleSelectSkill}
            />
          ) : (
            <TechGlobeCanvas
              nodes={globeNodes}
              edges={meshEdges}
              activeCategory={activeCategory}
              selectedSkillId={selectedSkill?.id ?? null}
              autoRotate={autoRotate}
              reducedMotion={reducedMotion}
              resetTrigger={resetTrigger}
              onHoverSkill={setHoveredSkill}
              onSelectSkill={handleSelectSkill}
              onDraggingChange={setIsDragging}
              onWebGLUnavailable={handleWebGLUnavailable}
            />
          )}

          {/* Hover Tooltip (solid/rgba dark obsidian — no backdrop-filter over WebGL) */}
          <AnimatePresence>
            {hoveredSkill &&
              hoveredSkill.node.id !== selectedSkill?.id &&
              !isDragging && (
                <motion.div
                  key={hoveredSkill.node.id}
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.14 }}
                  role="tooltip"
                  className="pointer-events-none absolute z-20 px-3.5 py-2.5 rounded-xl border border-indigo-500/40 shadow-lg max-w-[250px]"
                  style={{
                    backgroundColor: 'rgba(7, 11, 26, 0.96)',
                    left: `clamp(16px, ${Math.round(hoveredSkill.screenX)}px, calc(100% - 262px))`,
                    top: `clamp(56px, ${Math.round(hoveredSkill.screenY - 74)}px, calc(100% - 140px))`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: hoveredSkill.node.accentHex }}
                    />
                    <span className="text-xs font-bold text-white truncate">
                      {hoveredSkill.node.name}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-300">
                    <span>{hoveredSkill.node.category}</span>
                    <span aria-hidden="true" className="text-slate-500">
                      ·
                    </span>
                    <span className="text-sky-300">Click to inspect</span>
                  </div>
                </motion.div>
              )}
          </AnimatePresence>

          {/* Accessible Quick-Select Skill Index */}
          <AnimatePresence>
            {indexOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                role="region"
                aria-label="Globe Skill Directory"
                className="absolute top-14 right-4 sm:right-6 z-30 w-[calc(100%-2rem)] max-w-xs max-h-[340px] overflow-y-auto rounded-2xl border border-slate-700/90 shadow-2xl p-3.5"
                style={{ backgroundColor: 'rgba(7, 11, 26, 0.97)' }}
              >
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                  <span className="text-xs font-bold text-white">
                    Locate Skill ({filteredNodes.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setIndexOpen(false)}
                    aria-label="Close skill index"
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {filteredNodes.map((node) => {
                    const active = selectedSkill?.id === node.id;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => handleSelectSkill(node)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors border text-left ${
                          active
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-sky-500/70 hover:text-white'
                        }`}
                      >
                        {node.name}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Click-to-Inspect Skill Detail Info Panel */}
          <AnimatePresence>
            {selectedSkill && selectedVisual && (
              <motion.aside
                key={selectedSkill.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                aria-label={`${selectedSkill.name} details`}
                data-testid="globe-skill-detail-panel"
                className="absolute top-14 left-4 right-4 sm:left-6 sm:right-auto sm:w-[348px] z-30 rounded-2xl border border-indigo-500/35 shadow-2xl p-5 text-slate-100"
                style={{ backgroundColor: 'rgba(7, 11, 26, 0.96)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-semibold">
                      <span
                        aria-hidden="true"
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: selectedVisual.accentHex }}
                      />
                      <span style={{ color: selectedVisual.badgeText }}>
                        {selectedSkill.category}
                      </span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-white leading-snug">
                      {selectedSkill.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectSkill(null)}
                    aria-label="Close skill details"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
                  {selectedSkill.categoryDescription}
                </p>

                <div className="mt-4 space-y-2.5 pt-3.5 border-t border-slate-800/90 text-xs">
                  {selectedSkill.level && (
                    <div className="flex items-start gap-2">
                      <Award className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400">Highlight: </span>
                        <span className="font-semibold text-slate-100">
                          {selectedSkill.level}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedSkill.inProjects.length > 0 && (
                    <div className="flex items-start gap-2">
                      <FolderGit2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400">Applied in: </span>
                        <span className="font-semibold text-slate-100">
                          {selectedSkill.inProjects.join(' · ')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-slate-400">Sphere coordinates:</span>
                    <span className="font-mono-code tabular-nums text-[11px] text-slate-200">
                      {formatSphericalCoords(
                        selectedSkill.latDeg,
                        selectedSkill.lonDeg
                      )}
                    </span>
                  </div>

                  {connectedNeighbors.length > 0 && (
                    <div className="pt-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
                        <Network className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span>Linked nodes in sphere:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {connectedNeighbors.map((peer) => (
                          <button
                            key={peer.id}
                            type="button"
                            onClick={() => handleSelectSkill(peer)}
                            className="px-2 py-1 rounded-md text-[11px] font-medium text-sky-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-400/70 transition-colors"
                          >
                            {peer.shortLabel}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/90 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectSkill(null)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 whitespace-nowrap"
                  >
                    Back to Globe
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Press Esc to close
                  </span>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Unified Collapsible Bottom Control Dock (Zero central viewport occlusion) */}
          <div className="absolute bottom-3.5 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-1.5rem)] max-w-[1020px] flex flex-col items-center pointer-events-none">
            <button
              type="button"
              onClick={() => setDockExpanded((prev) => !prev)}
              aria-expanded={dockExpanded}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-t-xl border border-b-0 border-slate-700/80 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 whitespace-nowrap"
              style={{ backgroundColor: 'rgba(7, 11, 26, 0.94)' }}
            >
              {dockExpanded ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                  <span>Hide Controls</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                  <span>Show Controls</span>
                </>
              )}
            </button>

            <AnimatePresence initial={false}>
              {dockExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.18 }}
                  className="pointer-events-auto w-full rounded-2xl border border-slate-700/85 shadow-2xl px-3 py-2 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2"
                  style={{ backgroundColor: 'rgba(7, 11, 26, 0.94)' }}
                >
                  {/* Category Filter Controls */}
                  <div
                    role="group"
                    aria-label="Filter globe skills by category"
                    className="flex items-center gap-1.5 overflow-x-auto pb-0.5 lg:pb-0 no-scrollbar"
                  >
                    {CATEGORY_TABS.map((tab) => {
                      const isActive = activeCategory === tab.id;
                      const dotColor =
                        tab.id === 'All'
                          ? '#38BDF8'
                          : GLOBE_CATEGORY_VISUALS[tab.id].accentHex;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setActiveCategory(tab.id);
                            if (
                              selectedSkill &&
                              tab.id !== 'All' &&
                              selectedSkill.category !== tab.id
                            ) {
                              setSelectedSkill(null);
                            }
                          }}
                          aria-pressed={isActive}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: isActive ? '#FFFFFF' : dotColor,
                            }}
                          />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Playback & Reset Controls */}
                  <div className="flex items-center justify-end gap-1.5 shrink-0 lg:border-l lg:border-slate-800 lg:pl-2.5">
                    {!reducedMotion && !webglUnavailable && (
                      <button
                        type="button"
                        onClick={() => setAutoRotate((prev) => !prev)}
                        aria-label={
                          autoRotate
                            ? 'Pause globe rotation'
                            : 'Resume globe rotation'
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                      >
                        {autoRotate ? (
                          <>
                            <Pause className="w-3.5 h-3.5 text-sky-400" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-sky-400" />
                            <span>Rotate</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleResetView}
                      aria-label="Reset globe view"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                      <span>Reset</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
