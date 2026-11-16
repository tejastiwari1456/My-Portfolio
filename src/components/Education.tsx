import React from 'react';
import { motion } from 'motion/react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { GraduationCap, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { APPLE_EASE, Reveal } from './motion/MotionWrappers';

export const Education: React.FC = () => {
  const { education } = PORTFOLIO_DATA;

  return (
    <section
      id="education"
      className="py-20 md:py-32 bg-slate-50/70 border-t border-slate-200/80 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <Reveal className="max-w-3xl mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
            05. Academic Background
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Education &amp; Academic Track Record
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Rigorous foundations in Computer Science, Artificial Intelligence, Mathematics, and Analytical Problem Solving.
          </p>
        </Reveal>

        {/* Vertical Timeline with Scroll Revelations */}
        <div className="relative border-l-2 border-blue-200 ml-4 md:ml-8 pl-6 md:pl-10 space-y-12">
          {education.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -24, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.85,
                delay: index * 0.15,
                ease: APPLE_EASE,
              }}
              className="relative group"
            >
              {/* Timeline Node Indicator with pulse effect */}
              <div className="absolute -left-[33px] md:-left-[49px] top-2 w-4 h-4 rounded-full bg-white border-2 border-blue-600 group-hover:scale-125 transition-transform shadow-xs" />

              {/* Education Card */}
              <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 transition-all duration-300 shadow-xs hover:shadow-lg group-hover:-translate-y-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    {/* Duration & Location */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1 font-mono-code text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.duration}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.location}
                      </span>
                    </div>

                    {/* Degree & Institution */}
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.degree}
                    </h3>
                    <p className="text-sm font-medium text-slate-600 mt-1 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      {item.institution}
                    </p>
                  </div>

                  {/* Score Highlight Box */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200/80 text-left md:text-right self-start md:self-auto shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <span className="block text-2xl font-bold font-mono-code text-blue-900 tabular-nums">
                      {item.score}
                    </span>
                    <span className="text-xs text-blue-700 font-semibold">
                      {item.scoreLabel}
                    </span>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  {item.details.map((detail, dIdx) => (
                    <div
                      key={dIdx}
                      className="flex items-start gap-2.5 text-xs text-slate-600"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
