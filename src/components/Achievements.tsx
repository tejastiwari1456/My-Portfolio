import React, { useState } from 'react';
import { PORTFOLIO_DATA, Certification, AchievementItem } from '../data/portfolioData';
import {
  Award,
  Code2,
  CheckCircle2,
  Database,
  Terminal,
  Server,
  ExternalLink,
  Trophy,
  Star,
} from 'lucide-react';
import {
  Reveal,
  StaggerContainer,
  StaggerItem,
} from './motion/MotionWrappers';

export const Achievements: React.FC = () => {
  const { certifications, achievements, personal } = PORTFOLIO_DATA;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Problem Solving',
    'Backend & Full-Stack',
    'Databases & SQL',
    'Programming',
  ];

  const filteredCerts =
    selectedCategory === 'All'
      ? certifications
      : certifications.filter((c) => c.category === selectedCategory);

  const getIssuerBadgeIcon = (category: Certification['category']) => {
    switch (category) {
      case 'Problem Solving':
        return <Code2 className="w-4 h-4 text-blue-600" />;
      case 'Backend & Full-Stack':
        return <Server className="w-4 h-4 text-indigo-600" />;
      case 'Databases & SQL':
        return <Database className="w-4 h-4 text-emerald-600" />;
      case 'Programming':
        return <Terminal className="w-4 h-4 text-amber-600" />;
      default:
        return <Award className="w-4 h-4 text-blue-600" />;
    }
  };

  const getAchievementAccent = (accent: AchievementItem['accent']) => {
    switch (accent) {
      case 'amber':
        return {
          border: 'border-amber-200 hover:border-amber-400',
          iconBg: 'bg-amber-50 border-amber-200 text-amber-600',
          metric: 'text-amber-700',
        };
      case 'emerald':
        return {
          border: 'border-emerald-200 hover:border-emerald-400',
          iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
          metric: 'text-emerald-700',
        };
      case 'indigo':
        return {
          border: 'border-indigo-200 hover:border-indigo-400',
          iconBg: 'bg-indigo-50 border-indigo-200 text-indigo-600',
          metric: 'text-indigo-700',
        };
      default:
        return {
          border: 'border-blue-200 hover:border-blue-400',
          iconBg: 'bg-blue-50 border-blue-200 text-blue-600',
          metric: 'text-blue-700',
        };
    }
  };

  return (
    <section
      id="achievements"
      className="py-20 md:py-32 bg-[#F1F5F9]/60 border-y border-slate-200 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <Reveal className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              04. Continuous Learning &amp; Recognition
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Achievements &amp; Certifications
            </h2>
            <p className="mt-2 text-base text-slate-600 leading-relaxed">
              Verified HackerRank &amp; Oracle credentials, competitive programming contest ratings, and national academic milestones.
            </p>
          </Reveal>

          {/* Competitive Coding Profile Pills */}
          <Reveal delay={0.15} scale={0.94} className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="p-3.5 bg-white border border-amber-200 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">
                  LeetCode Contest
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-extrabold font-mono-code text-slate-900 tabular-nums">
                    {personal.leetcodeRating}
                  </span>
                  <span className="text-[11px] text-amber-700 font-bold">
                    Peak {personal.leetcodePeakRating}
                  </span>
                </div>
              </div>
              <a
                href={personal.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 ml-1"
                aria-label="View LeetCode profile (opens in new tab)"
                title="Open LeetCode Profile"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-3.5 bg-white border border-emerald-200 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">
                  HackerRank Badges
                </span>
                <div className="text-xs font-extrabold text-emerald-700">
                  5★ SQL · 4★ PS · 3★ Java
                </div>
              </div>
              <a
                href={personal.hackerrankUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-500 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 ml-1"
                aria-label="View HackerRank profile (opens in new tab)"
                title="Open HackerRank Profile"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </Reveal>
        </div>

        {/* Achievements Highlight Grid (4 explicit resume achievements) */}
        <StaggerContainer
          staggerDelay={0.08}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14"
        >
          {achievements.map((item) => {
            const style = getAchievementAccent(item.accent);
            return (
              <StaggerItem key={item.id}>
                <div
                  className={`p-5 rounded-2xl bg-white border ${style.border} shadow-xs hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between group hover:-translate-y-1`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-2xl font-extrabold font-mono-code tabular-nums ${style.metric}`}
                      >
                        {item.metric}
                      </span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-1.5 rounded-lg border ${style.iconBg} transition-transform group-hover:scale-110`}
                          aria-label={`Open ${item.title} profile`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                      {item.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                      {item.sublabel}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Certifications Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-extrabold text-slate-900">
            Verified Certifications &amp; Badges ({certifications.length})
          </h3>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Credentials Grid with Staggered Entrance */}
        <StaggerContainer
          staggerDelay={0.08}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
        >
          {filteredCerts.map((cert) => (
            <StaggerItem key={cert.id}>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 h-full">
                <div>
                  {/* Header: Issuer and Year */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <div className="p-1.5 rounded-md bg-slate-100 border border-slate-200 group-hover:scale-110 transition-transform">
                        {getIssuerBadgeIcon(cert.category)}
                      </div>
                      <span>{cert.issuer}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono-code text-slate-500">{cert.year}</span>
                    </div>
                    <span className="text-[11px] font-mono-code font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {cert.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-base font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                    {cert.title}
                  </h4>

                  {/* Core Skills Verified */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                    {cert.skillsAcquired.map((skill, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center gap-2 text-xs text-slate-700 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Status note or verification link */}
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Verified Credential ({cert.year})
                  </span>
                  {cert.verificationUrl ? (
                    <a
                      href={cert.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      Verify Certificate <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-500 font-medium">Oracle Official Badge</span>
                  )}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
