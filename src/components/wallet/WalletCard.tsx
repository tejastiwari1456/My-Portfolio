import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Project } from '../../data/portfolioData';
import {
  WalletCardTransform,
  getWalletProjectMeta,
} from '../../utils/walletLogic';
import { WalletCardVisualEmblem } from './WalletCardVisualEmblem';
import { APPLE_EASE } from '../motion/MotionWrappers';

interface WalletCardProps {
  project: Project;
  index: number;
  transform: WalletCardTransform;
  isActive: boolean;
  isTouchDevice: boolean;
  onHoverStart: () => void;
  onFocusCard: () => void;
  onClickCard: () => void;
  onKeyDownCard: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  project,
  index,
  transform,
  isActive,
  isTouchDevice,
  onHoverStart,
  onFocusCard,
  onClickCard,
  onKeyDownCard,
  buttonRef,
}) => {
  const meta = getWalletProjectMeta(project.id);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isTouchDevice || !isActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: -relY * 6,
      rotateY: relX * 7,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const slotNumber = `0${index + 1}`;

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onMouseEnter={onHoverStart}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onFocus={onFocusCard}
      onClick={onClickCard}
      onKeyDown={onKeyDownCard}
      aria-label={`${project.name} — ${meta.shortTag}. ${
        isTouchDevice && !isActive ? 'Tap to preview' : 'Open project details'
      }`}
      aria-pressed={isActive}
      data-testid={`wallet-card-${project.id}`}
      animate={{
        y: transform.targetY,
        scale: transform.scale,
        rotateX: isActive ? transform.rotateX + tilt.rotateX : transform.rotateX,
        rotateY: isActive ? tilt.rotateY : 0,
        rotateZ: transform.rotateZ,
      }}
      transition={{
        duration: 0.38,
        ease: APPLE_EASE,
      }}
      style={{
        zIndex: transform.zIndex,
        transformStyle: 'preserve-3d',
      }}
      className={`absolute left-3 right-3 sm:left-5 sm:right-5 top-0 h-[196px] sm:h-[206px] rounded-2xl bg-gradient-to-br ${meta.cardBgClass} border ${
        isActive ? 'border-white/35 shadow-[0_24px_45px_-12px_rgba(0,0,0,0.65)]' : `${meta.cardBorderClass} shadow-[0_-4px_18px_rgba(0,0,0,0.45)]`
      } text-left p-4 sm:p-5 flex flex-col justify-between cursor-pointer select-none overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900`}
    >
      {/* Top metallic edge specular reflection */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"
      />

      {/* Subtle corner accent radiance */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: meta.accentHex }}
      />

      {/* Card Header Strip (always visible while tucked inside the wallet) */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <WalletCardVisualEmblem projectId={project.id} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono-code text-stone-400 leading-none mb-1">
              <span className={`${meta.accentTextClass} font-semibold tabular-nums`}>
                {slotNumber}
              </span>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span className="truncate">{meta.shortTag}</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
              {project.name}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isActive ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/95 whitespace-nowrap">
              <span className="hidden sm:inline">
                {isTouchDevice ? 'Tap to unfold' : 'Click to unfold'}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </span>
          ) : (
            <span className="font-mono-code text-[10px] tracking-wider text-stone-400/90 uppercase">
              {meta.slotCode}
            </span>
          )}
        </div>
      </div>

      {/* Card Mid-Body (smoothly reveals as the card lifts out of the leather pocket) */}
      <div
        className={`relative z-10 mt-3 flex-1 flex flex-col justify-between transition-opacity duration-200 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-xs text-stone-200/95 leading-relaxed line-clamp-2">
          {project.shortDescription}
        </p>

        <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-2 text-[11px] text-stone-200">
          <span className="truncate">
            {project.techStack.slice(0, 3).join(' · ')}
          </span>
          <span className="font-mono-code text-[10px] text-stone-300 shrink-0">
            {project.techStack.length} tech
          </span>
        </div>
      </div>
    </motion.button>
  );
};
