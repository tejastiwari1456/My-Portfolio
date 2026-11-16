import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { filterSkillCategories } from '../utils/portfolioUtils';
import {
  Search,
  Terminal,
  Server,
  Layout,
  Database,
  BookOpen,
  Brain,
  Wrench,
  CheckCircle,
} from 'lucide-react';
import {
  APPLE_EASE,
  Reveal,
  StaggerContainer,
  StaggerItem,
} from './motion/MotionWrappers';

export const Skills: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categoryThemes: Record<
    string,
    { icon: React.ReactNode; badge: string; border: string; glow: string }
  > = {
    'Languages': {
      icon: <Terminal className="w-4 h-4 text-blue-600" />,
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      border: 'hover:border-blue-400',
      glow: 'group-hover:shadow-blue-500/10',
    },
    'Frontend Development': {
      icon: <Layout className="w-4 h-4 text-cyan-600" />,
      badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      border: 'hover:border-cyan-400',
      glow: 'group-hover:shadow-cyan-500/10',
    },
    'Backend Development': {
      icon: <Server className="w-4 h-4 text-indigo-600" />,
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      border: 'hover:border-indigo-400',
      glow: 'group-hover:shadow-indigo-500/10',
    },
    'Databases': {
      icon: <Database className="w-4 h-4 text-amber-600" />,
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      border: 'hover:border-amber-400',
      glow: 'group-hover:shadow-amber-500/10',
    },
    'AI Integration & APIs': {
      icon: <Brain className="w-4 h-4 text-purple-600" />,
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      border: 'hover:border-purple-400',
      glow: 'group-hover:shadow-purple-500/10',
    },
    'Core CS Concepts': {
      icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      border: 'hover:border-emerald-400',
      glow: 'group-hover:shadow-emerald-500/10',
    },
    'Tools & Platforms': {
      icon: <Wrench className="w-4 h-4 text-rose-600" />,
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      border: 'hover:border-rose-400',
      glow: 'group-hover:shadow-rose-500/10',
    },
  };

  const categories = PORTFOLIO_DATA.skillCategories;
  const filteredCategories = filterSkillCategories(
    selectedCategory === 'All'
      ? categories
      : categories.filter((c) =>
          c.title.toLowerCase().includes(selectedCategory.toLowerCase())
        ),
    searchQuery
  );

  return (
    <section id="skills" className="py-20 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <Reveal className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              02. Technical Arsenal
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Skills &amp; Engineering Toolchain
            </h2>
            <p className="mt-2 text-base text-slate-600 leading-relaxed">
              Organized by discipline with clear context on where each technology is applied across production projects.
            </p>
          </Reveal>

          {/* Interactive Search Bar */}
          <Reveal delay={0.15} className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skill (e.g. TypeScript, PostgreSQL)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-2xs"
              aria-label="Filter skills by keyword"
            />
          </Reveal>
        </div>

        {/* Interactive Filter Tabs with Motion Indicator */}
        <Reveal delay={0.2} className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`relative px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200/60'
            }`}
          >
            All Categories ({categories.reduce((acc, c) => acc + c.skills.length, 0)})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.title}
              onClick={() => setSelectedCategory(cat.title)}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat.title
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </Reveal>

        {/* Skill Groups Grid with Staggered Entrance */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-600">
              No skills matched &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
            >
              Reset search filters
            </button>
          </div>
        ) : (
          <StaggerContainer
            staggerDelay={0.08}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCategories.map((group) => {
              const theme = categoryThemes[group.title] || {
                icon: <Terminal className="w-4 h-4 text-blue-600" />,
                badge: 'bg-blue-50 text-blue-700 border-blue-200',
                border: 'hover:border-blue-400',
                glow: 'group-hover:shadow-blue-500/10',
              };

              return (
                <StaggerItem key={group.title}>
                  <div
                    className={`p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 ${theme.border} ${theme.glow}`}
                  >
                    <div>
                      {/* Category Header */}
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 group-hover:scale-110 transition-transform">
                          {theme.icon}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {group.title}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                        {group.description}
                      </p>

                      {/* Skills List */}
                      <div className="space-y-2.5">
                        {group.skills.map((skill) => (
                          <div
                            key={skill.name}
                            className="py-2 px-3 rounded-lg bg-slate-50 border border-slate-200/70 hover:bg-white hover:border-slate-300 transition-all flex flex-col gap-0.5 hover:shadow-2xs"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                {skill.name}
                              </span>
                              {skill.level && (
                                <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                  {skill.level}
                                </span>
                              )}
                            </div>

                            {/* Project Context if present */}
                            {skill.inProjects && skill.inProjects.length > 0 && (
                              <div className="text-[11px] text-slate-500 pl-5">
                                Used in:{' '}
                                <span className="font-medium text-slate-700">
                                  {skill.inProjects.join(' · ')}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer indicator */}
                    <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                      {group.skills.length} competencies registered
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
};
