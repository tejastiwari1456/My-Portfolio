import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import {
  Github,
  Linkedin,
  ArrowRight,
  Code2,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  FileText,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { APPLE_EASE, TextReveal, StaggerContainer, StaggerItem } from './motion/MotionWrappers';

interface HeroProps {
  onOpenResume: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenResume }) => {
  const heroRef = useRef<HTMLElement>(null);

  // Scroll-linked cinematic parallax using useScroll and useTransform
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Background elements move slower than foreground content as user scrolls down
  // Positive Y translation counteracts the upward scroll movement, making background travel at a reduced apparent speed
  const bgGridY = useTransform(scrollYProgress, [0, 1], ['0px', '120px']);
  const bgLightY1 = useTransform(scrollYProgress, [0, 1], ['0px', '170px']);
  const bgLightY2 = useTransform(scrollYProgress, [0, 1], ['0px', '210px']);
  const bgLightY3 = useTransform(scrollYProgress, [0, 1], ['0px', '140px']);

  // Foreground content moves with natural scroll speed, slight upward drift and smooth exit fade
  const contentY = useTransform(scrollYProgress, [0, 1], ['0px', '-40px']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.25]);
  const contentScale = useTransform(scrollYProgress, [0, 0.75], [1, 0.95]);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden"
    >
      {/* Background parallax container: moves slower than foreground content */}
      <motion.div
        style={{ y: bgGridY }}
        className="absolute inset-0 bg-grid-pattern-light pointer-events-none"
      >
        <motion.div
          style={{ y: bgLightY1 }}
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[380px] bg-blue-300/25 blur-[130px] rounded-full pointer-events-none"
        />
        <motion.div
          style={{ y: bgLightY2 }}
          className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[480px] h-[360px] bg-purple-300/20 blur-[140px] rounded-full pointer-events-none"
        />
        <motion.div
          style={{ y: bgLightY3 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[650px] h-[260px] bg-emerald-200/20 blur-[150px] rounded-full pointer-events-none"
        />
      </motion.div>

      {/* Main Hero Container with scroll-driven scale, fade, and content upward drift */}
      <motion.div
        style={{ opacity: contentOpacity, scale: contentScale, y: contentY }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        {/* Hero Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-stretch">
          {/* Left Column: Typographic Cinematic Hierarchy */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Availability Indicator with subtle spring entrance */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: APPLE_EASE }}
              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-600 mb-6"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" aria-hidden="true" />
                {PORTFOLIO_DATA.personal.availability}
              </span>
              <span aria-hidden="true" className="hidden sm:inline text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">Kanpur, Uttar Pradesh, India</span>
            </motion.div>

            {/* Candidate Name with Staggered Character/Word Reveal */}
            <motion.h1
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.85, delay: 0.1, ease: APPLE_EASE }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-4"
            >
              {PORTFOLIO_DATA.personal.name}
            </motion.h1>

            {/* Core Mission / Headline - Word by Word Staggered Reveal */}
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-relaxed mb-4 max-w-2xl">
              <TextReveal
                text="Building meaningful software through code, creativity, and intelligent technology."
                delay={0.25}
              />
            </div>

            {/* Supporting Headline Text */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: APPLE_EASE }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl"
            >
              Computer Science undergraduate specializing in AI &amp; Machine Learning at PSIT Kanpur (CGPA {PORTFOLIO_DATA.personal.cgpaDisplay}). Hands-on experience building full-stack applications with React.js, TypeScript, Node.js, Express.js, PostgreSQL, and AI-integrated workflows.
            </motion.p>

            {/* CTAs & Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: APPLE_EASE }}
              className="flex flex-wrap items-center gap-4 mb-8"
            >
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all shadow-md shadow-blue-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore My Work</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Let&apos;s Connect</span>
              </a>

              {/* Social profile shortcuts */}
              <div className="flex items-center gap-2">
                <a
                  href={PORTFOLIO_DATA.personal.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 hover:-translate-y-0.5"
                  aria-label="GitHub Profile (opens in new tab)"
                  title="GitHub: tejastiwari1456"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href={PORTFOLIO_DATA.personal.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 hover:-translate-y-0.5"
                  aria-label="LinkedIn Profile (opens in new tab)"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={PORTFOLIO_DATA.personal.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 text-slate-600 hover:text-amber-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 hover:-translate-y-0.5"
                  aria-label="LeetCode Profile (600+ Problems Solved, Peak Rating 1538)"
                  title="LeetCode: Peak Rating 1538"
                >
                  <Code2 className="w-4 h-4" />
                </a>
                <a
                  href={PORTFOLIO_DATA.personal.hackerrankUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 hover:-translate-y-0.5"
                  aria-label="HackerRank Profile (5-Star SQL, 4-Star Problem Solving, 3-Star Java)"
                  title="HackerRank: 5★ SQL · 4★ PS · 3★ Java"
                >
                  HR
                </a>
              </div>
            </motion.div>

            {/* Quick credentials indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.75, ease: APPLE_EASE }}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 pt-2"
            >
              <span className="inline-flex items-center gap-1.5 text-slate-900 font-semibold whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>600+ Coding Problems (Peak 1538)</span>
              </span>
              <span aria-hidden="true" className="hidden sm:inline text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5 text-slate-900 font-semibold whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{PORTFOLIO_DATA.personal.cgpaDisplay} CGPA (PSIT)</span>
              </span>
              <span aria-hidden="true" className="hidden sm:inline text-slate-300">·</span>
              <span className="text-slate-600 whitespace-nowrap">React · TypeScript · Node.js · PostgreSQL · Java</span>
            </motion.div>
          </div>

          {/* Right Column: Tejas Tiwari Portrait & Profile Card */}
          <div className="lg:col-span-5 flex flex-col justify-center items-center">
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.94, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.95, delay: 0.35, ease: APPLE_EASE }}
              className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-2xl shadow-blue-500/10 p-6 sm:p-7 flex flex-col items-center relative overflow-hidden group"
            >
              {/* Colorful gradient accent top bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

              {/* Ambient backdrop glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-300/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-300/25 rounded-full blur-3xl pointer-events-none" />

              {/* Header status bar */}
              <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-800">
                    Open for SDE Internships
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Kanpur, India
                </span>
              </div>

              {/* Portrait Image Container with Gradient Ring & Floating Pills */}
              <div className="relative my-3">
                {/* Outer Glow Ring */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 opacity-80 blur-xs group-hover:opacity-100 transition-opacity duration-500" />

                {/* Circular Portrait Frame */}
                <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-900">
                  <img
                    src="/assets/aistudio/Tejas_b16d8a21.jpeg"
                    alt="Tejas Tiwari - Full-Stack Developer & SDE Candidate"
                    className="w-full h-full object-cover scale-125 object-center transition-transform duration-700 ease-out group-hover:scale-130"
                  />
                </div>

                {/* Floating Badge: 600+ Coding Problems */}
                <div className="absolute -top-1 -right-2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>600+ Solved</span>
                </div>

                {/* Floating Badge: Academic CGPA */}
                <div className="absolute -bottom-1 -left-2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{PORTFOLIO_DATA.personal.cgpaDisplay} CGPA</span>
                </div>
              </div>

              {/* Candidate Info Block */}
              <div className="text-center w-full mt-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {PORTFOLIO_DATA.personal.name}
                </h2>
                <p className="text-xs font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-1">
                  {PORTFOLIO_DATA.personal.headline}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  PSIT Kanpur · B.Tech CSE (AI &amp; ML) · 2024–2028
                </p>

                {/* Core Technical Pills */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3.5 pt-3.5 border-t border-slate-100">
                  {['React.js', 'TypeScript', 'Node.js', 'Express.js', 'PostgreSQL', 'Java'].map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-0.5 text-[11px] font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-md hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={onOpenResume}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer group/btn"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400 group-hover/btn:text-white transition-colors" />
                  <span>View Full Resume &amp; Credentials</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Full-width KPI Strip below the hero split with Staggered Entrance */}
        <StaggerContainer
          staggerDelay={0.12}
          className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
        >
          {PORTFOLIO_DATA.achievementsSummary.map((item, idx) => (
            <StaggerItem key={idx}>
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col group hover:-translate-y-1">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-mono-code tabular-nums mb-1 group-hover:scale-105 transition-transform origin-left">
                  {item.value}
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  {item.label}
                </span>
                <span className="text-xs text-slate-500 leading-snug">
                  {item.context}
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </motion.div>
    </section>
  );
};
