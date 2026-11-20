import React from 'react';
import {
  GlobeCategoryId,
  GlobeSkillNode,
  filterGlobeNodesByCategory,
} from '../../utils/techGlobeLogic';
import { Globe } from 'lucide-react';

interface TechGlobeFallbackProps {
  nodes: GlobeSkillNode[];
  activeCategory: GlobeCategoryId;
  selectedSkillId: string | null;
  onSelectSkill: (node: GlobeSkillNode) => void;
}

/**
 * Graceful interactive orbital-constellation fallback displayed when WebGL
 * is unavailable or a graphics context cannot be created.
 */
export const TechGlobeFallback: React.FC<TechGlobeFallbackProps> = ({
  nodes,
  activeCategory,
  selectedSkillId,
  onSelectSkill,
}) => {
  const visibleNodes = filterGlobeNodesByCategory(nodes, activeCategory);

  return (
    <div
      data-testid="tech-globe-fallback"
      className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-10 text-center relative overflow-y-auto"
    >
      {/* Subtle 2D celestial orbital rings */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25"
      >
        <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-blue-400/50" />
        <div className="absolute w-52 h-52 sm:w-68 sm:h-68 rounded-full border border-dashed border-cyan-400/40" />
      </div>

      <div className="relative z-10 max-w-3xl w-full">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-sky-300 mb-3">
          <Globe className="w-4 h-4" />
          <span>2D Interactive Orbital Map (WebGL Fallback)</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
          {visibleNodes.map((node) => {
            const isSelected = node.id === selectedSkillId;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => onSelectSkill(node)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  isSelected
                    ? 'bg-sky-500/25 text-white border-sky-400 shadow-sm'
                    : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:border-sky-400/70 hover:text-white'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                  style={{ backgroundColor: node.accentHex }}
                />
                {node.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
