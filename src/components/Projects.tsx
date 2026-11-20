import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { PORTFOLIO_DATA, Project } from '../data/portfolioData';
import { SimLabVisual, AIInterviewVisual } from './ProjectVisuals';
import { ProjectDetailModal } from './ProjectDetailModal';
import { ProjectWallet } from './wallet/ProjectWallet';
import { Info, Github, CheckCircle2, Sparkles } from 'lucide-react';
import { APPLE_EASE } from './motion/MotionWrappers';

interface FeaturedCardProps {
  project: Project;
  index: number;
  onSelect: (p: Project) => void;
  renderVisual: (id: string) => React.ReactNode;
}

const FeaturedProjectCard: React.FC<FeaturedCardProps> = ({
  project,
  index,
  onSelect,
  renderVisual,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'center center'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.93, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.3, 0.8, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  const isSimLab = project.id === 'simlab-competency-hub';

  return (
    <motion.div
      ref={cardRef}
      style={{ scale, opacity, y }}
      transition={{ duration: 0.9, ease: APPLE_EASE }}
      className={`p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 transition-all duration-500 hover:shadow-2xl hover:border-blue-300 relative overflow-hidden group ${
        isSimLab ? 'ring-1 ring-blue-500/30' : ''
      }`}
    >
      {/* Decorative top accent glow */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          index === 0
            ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600'
            : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500'
        }`}
      />

      <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5" />
        <span>
          {isSimLab
            ? 'Flagship Virtual Laboratory Platform'
            : 'AI-Powered Technical Interview Platform'}
        </span>
      </div>

      <div
        className={`grid grid-cols-1 ${
          isSimLab ? 'lg:grid-cols-12 gap-10' : 'lg:grid-cols-12 gap-8'
        } items-center`}
      >
        {/* Left Side: Editorial & Architecture Info */}
        <div
          className={`${
            isSimLab ? 'lg:col-span-5 order-2 lg:order-1' : 'lg:col-span-6'
          } flex flex-col justify-between h-full`}
        >
          <div>
            {/* Metadata Header */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
              <span className="font-bold text-blue-600">
                0{index + 1}. {project.category.split('|')[0].trim()}
              </span>
              {project.timeline && (
                <>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span>{project.timeline}</span>
                </>
              )}
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {project.shortDescription}
            </p>

            {/* Key Technical Highlights */}
            <div className="space-y-2.5 mb-6">
              {project.highlights?.map((highlight, hIdx) => (
                <div
                  key={hIdx}
                  className="flex items-center gap-2 text-xs text-slate-700 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>

            {/* Tech Stack Pills */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-slate-600 mb-6">
              <span className="text-slate-900 font-bold mr-1">Stack:</span>
              {project.techStack.map((tech, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-50 border border-slate-200/80 rounded-lg text-slate-700 shadow-2xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Actions Bar */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onSelect(project)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer whitespace-nowrap shrink-0"
                aria-label={`View full details for ${project.name}`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>View Technical Architecture</span>
              </button>

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repo</span>
                </a>
              )}
            </div>

            {project.statusText && (
              <span className="text-[11px] font-mono-code font-bold text-emerald-700 hidden sm:inline bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {project.statusText}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Technical Visual */}
        <div
          className={`${
            isSimLab ? 'lg:col-span-7 order-1 lg:order-2' : 'lg:col-span-6'
          }`}
        >
          <div className="transition-transform duration-500 group-hover:scale-[1.01]">
            {renderVisual(project.id)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { featuredProjects, miniProjects } = PORTFOLIO_DATA;

  const renderProjectVisual = (projectId: string) => {
    switch (projectId) {
      case 'simlab-competency-hub':
        return <SimLabVisual />;
      case 'ai-interview-system':
        return <AIInterviewVisual />;
      default:
        return null;
    }
  };

  return (
    <section
      id="projects"
      className="py-20 md:py-32 bg-[#F8FAFC] border-y border-slate-200 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Sticky Section Header Bar for Apple-Style Storytelling */}
        <div className="sticky top-16 z-20 bg-[#F8FAFC]/95 backdrop-blur-md py-4 mb-10 border-b border-slate-200/80 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                03. Selected Engineering Work
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Featured Systems &amp; Applications
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 tabular-nums self-start sm:self-auto">
              <span className="text-slate-900">{featuredProjects.length} Featured Systems</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{miniProjects.length} Wallet Cards</span>
            </div>
          </div>
        </div>

        {/* Sequential Featured Projects Storytelling */}
        <div className="space-y-14">
          {featuredProjects.map((project, index) => (
            <FeaturedProjectCard
              key={project.id}
              project={project}
              index={index}
              onSelect={(p) => setSelectedProject(p)}
              renderVisual={renderProjectVisual}
            />
          ))}
        </div>

        {/* Interactive Wallet-Inspired Mini Projects & Games Experience */}
        {miniProjects.length > 0 && (
          <div className="mt-20 pt-16 border-t border-slate-200/90 scroll-mt-24" id="mini-projects">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-12">
              <div className="max-w-2xl">
                <div className="text-xs font-semibold text-blue-600 mb-1.5">
                  Interactive Project Wallet · Mini Projects &amp; Games
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 text-balance">
                  Pick a Card to Unfold the Build
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Explore five frontend builds stored inside an interactive digital wallet. Hover over any card to lift it out for a quick preview, or click to unfold the wallet for architecture notes, tech stack details, and a live interactive demo.
                </p>
              </div>

              <div className="text-xs text-slate-500 font-medium tabular-nums shrink-0">
                <span>5 Collectible Project Cards</span>
                <span aria-hidden="true" className="mx-2 text-slate-300">·</span>
                <span>Arrow keys &amp; Esc supported</span>
              </div>
            </div>

            <ProjectWallet projects={miniProjects} />
          </div>
        )}

        {/* Project Technical Detail Modal (for Featured Systems) */}
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </section>
  );
};

