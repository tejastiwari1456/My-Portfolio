import React from 'react';
import { motion } from 'motion/react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import {
  GraduationCap,
  Briefcase,
  Award,
  Compass,
  MapPin,
  Calendar,
  BookOpen,
  ArrowRight,
  Code2,
  Cpu,
  Database,
  Brain,
} from 'lucide-react';
import {
  APPLE_EASE,
  Reveal,
  StaggerContainer,
  StaggerItem,
} from './motion/MotionWrappers';

export const About: React.FC = () => {
  const { personal } = PORTFOLIO_DATA;

  return (
    <section
      id="about"
      className="py-20 md:py-32 bg-[#F1F5F9]/60 border-y border-slate-200 relative overflow-hidden"
    >
      {/* Subtle ambient lighting for depth */}
      <div className="absolute top-1/2 -left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Reveal */}
        <Reveal className="max-w-3xl mb-16">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            01. Professional Profile
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            About Me
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            An ambitious software engineer specializing in scalable systems, backend services, and practical artificial intelligence.
          </p>
        </Reveal>

        {/* 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Narrative Introduction */}
          <div className="lg:col-span-7 space-y-6 text-slate-600 text-base leading-relaxed">
            <Reveal delay={0.1}>
              <p className="text-lg text-slate-900 font-medium leading-relaxed">
                {personal.bioParagraphs[0]}
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <p>{personal.bioParagraphs[1]}</p>
            </Reveal>

            <Reveal delay={0.3}>
              <p>{personal.bioParagraphs[2]}</p>
            </Reveal>

            {/* Core Competencies Quick Summary with Staggered Cards */}
            <div className="pt-6 border-t border-slate-200">
              <Reveal delay={0.35}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  Primary Engineering Domains
                </h3>
              </Reveal>

              <StaggerContainer
                staggerDelay={0.1}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <StaggerItem>
                  <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-xs hover:border-blue-400 hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="block text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                      Full-Stack Web Engineering
                    </span>
                    <span className="text-xs text-slate-600 leading-relaxed">
                      Building responsive, type-safe applications with React.js, TypeScript, Tailwind CSS, Node.js, and Express.js.
                    </span>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="p-4 rounded-xl bg-white border border-indigo-100 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                      <Database className="w-4 h-4" />
                    </div>
                    <span className="block text-sm font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      Backend Security &amp; Databases
                    </span>
                    <span className="text-xs text-slate-600 leading-relaxed">
                      Developing REST APIs with JWT, bcrypt, RBAC, audit logging, session revocation, PostgreSQL, MySQL, and Supabase.
                    </span>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="p-4 rounded-xl bg-white border border-amber-100 shadow-xs hover:border-amber-400 hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <span className="block text-sm font-bold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
                      Algorithms &amp; Java Problem Solving
                    </span>
                    <span className="text-xs text-slate-600 leading-relaxed">
                      600+ problems solved across LeetCode, HackerRank &amp; GFG with a 1538 peak LeetCode rating and 5★ SQL / 4★ PS badges.
                    </span>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs hover:border-purple-400 hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                      <Brain className="w-4 h-4" />
                    </div>
                    <span className="block text-sm font-bold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">
                      AI-Integrated Applications
                    </span>
                    <span className="text-xs text-slate-600 leading-relaxed">
                      Integrating Gemini and OpenAI APIs for automated Viva Voce assessments, technical interviews, and transcript evaluation.
                    </span>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>

          {/* Right Column: Academic & Career Profile Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Academic Snapshot Card with smooth elevation reveal */}
            <Reveal delay={0.2} scale={0.93}>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-200/50 space-y-5 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Academic Status
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                      B.Tech in CSE (AI &amp; ML)
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold font-mono-code text-blue-600 tabular-nums">
                      {personal.cgpaDisplay}
                    </span>
                    <span className="block text-[11px] font-semibold text-slate-500">
                      CGPA
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-slate-900 font-semibold">
                      {personal.university}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Duration: {personal.duration} · Undergraduate</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{personal.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>JEE Main 2024: 96.7%ile · Class XII: 93% · Class X: 95%</span>
                  </div>
                </div>

                {/* Target Career Roles */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    Target Roles for Internships
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {personal.careerInterests.map((role, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 rounded-md hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Immediate Availability Callout */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-emerald-700">
                      ● Immediate Availability
                    </span>
                    <span className="text-xs text-slate-500">
                      Ready for full-time or summer internships
                    </span>
                  </div>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 group"
                  >
                    <span>Contact Me</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Quick Links Card for LeetCode & HackerRank */}
            <Reveal delay={0.3} scale={0.95}>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:shadow-md hover:border-amber-300 transition-all duration-300 group">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-900">
                        Competitive Programming
                      </span>
                      <span className="text-xs text-slate-600">
                        600+ solved · LeetCode {personal.leetcodeRating} (Peak {personal.leetcodePeakRating})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <a
                    href={personal.leetcodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all"
                  >
                    LeetCode ↗
                  </a>
                  <a
                    href={personal.hackerrankUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all"
                  >
                    HackerRank (5★ SQL · 4★ PS · 3★ Java) ↗
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
