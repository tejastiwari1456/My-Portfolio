export interface WalletCardTransform {
  baseY: number;
  targetY: number;
  scale: number;
  rotateX: number;
  rotateZ: number;
  zIndex: number;
}

export interface WalletInteractionState {
  previewIndex: number | null;
  expandedId: string | null;
}

export interface WalletProjectMeta {
  shortTag: string;
  purpose: string;
  userInteractions: string[];
  stackGroups: {
    label: string;
    items: string[];
  }[];
  accentHex: string;
  cardBgClass: string;
  cardBorderClass: string;
  accentTextClass: string;
  badgeClass: string;
  slotCode: string;
}

/**
 * Computes realistic vertical layering, lift, and neighbor displacement
 * for stacked cards inside the digital leather wallet.
 */
export function computeWalletCardTransform(
  index: number,
  totalCards: number,
  activeIndex: number | null,
  slotSpacing: number = 58
): WalletCardTransform {
  const baseY = index * slotSpacing;

  if (activeIndex === null) {
    return {
      baseY,
      targetY: baseY,
      scale: 1 - (totalCards - 1 - index) * 0.014,
      rotateX: 2,
      rotateZ: 0,
      zIndex: 10 + index,
    };
  }

  if (index === activeIndex) {
    return {
      baseY,
      targetY: baseY - 46,
      scale: 1.03,
      rotateX: -5,
      rotateZ: index % 2 === 0 ? -0.7 : 0.7,
      zIndex: 35,
    };
  }

  // Cards behind (above) the hovered card nudge slightly upward
  if (index < activeIndex) {
    return {
      baseY,
      targetY: baseY - 14,
      scale: 0.985 - (activeIndex - index) * 0.01,
      rotateX: 3,
      rotateZ: 0,
      zIndex: 10 + index,
    };
  }

  // Cards in front (below) the hovered card shift gently downward to open room
  return {
    baseY,
    targetY: baseY + 18,
    scale: 0.995,
    rotateX: 4,
    rotateZ: 0,
    zIndex: 10 + index,
  };
}

/**
 * Handles card selection semantics:
 * - On desktop (pointer fine): clicking a card unfolds the wallet immediately.
 * - On touch devices: first tap lifts/previews the card; second tap on the same card unfolds it.
 */
export function resolveCardClick(
  current: WalletInteractionState,
  clickedIndex: number,
  clickedProjectId: string,
  isTouchDevice: boolean
): WalletInteractionState {
  if (!isTouchDevice) {
    return {
      previewIndex: clickedIndex,
      expandedId: clickedProjectId,
    };
  }

  if (current.previewIndex === clickedIndex) {
    return {
      previewIndex: clickedIndex,
      expandedId: clickedProjectId,
    };
  }

  return {
    previewIndex: clickedIndex,
    expandedId: null,
  };
}

/**
 * Keyboard arrow navigation helper across wallet card slots.
 */
export function getNextWalletIndex(
  currentIndex: number | null,
  direction: 'next' | 'prev',
  totalCards: number
): number {
  if (totalCards <= 0) return 0;
  if (currentIndex === null) {
    return direction === 'next' ? 0 : totalCards - 1;
  }
  if (direction === 'next') {
    return (currentIndex + 1) % totalCards;
  }
  return (currentIndex - 1 + totalCards) % totalCards;
}

/**
 * Factual project metadata derived strictly from the existing portfolio codebase.
 */
export const WALLET_PROJECT_META: Record<string, WalletProjectMeta> = {
  'youtube-clone': {
    shortTag: 'Video Interface',
    purpose:
      'Recreates a familiar video-sharing platform layout to master frontend UI structuring, responsive media grids, and component-based design.',
    userInteractions: [
      'Filter video library across All, Frontend, and DSA topic controls',
      'Select any video from the playlist to switch the active player preview',
      'Inspect channel names, view counts, and durations in a responsive layout',
    ],
    stackGroups: [
      { label: 'Frontend', items: ['HTML5', 'CSS3', 'JavaScript'] },
      { label: 'Engineering Focus', items: ['Component Architecture', 'Responsive Design'] },
    ],
    accentHex: '#E11D48',
    cardBgClass: 'from-[#2A141D] via-[#1C161D] to-[#141216]',
    cardBorderClass: 'border-rose-400/30',
    accentTextClass: 'text-rose-300',
    badgeClass: 'bg-rose-500/15 text-rose-200 border-rose-400/30',
    slotCode: 'YT-01',
  },
  'amazon-clone': {
    shortTag: 'E-Commerce UI',
    purpose:
      'Replicates the structure and browsing feel of an online shopping storefront using reusable React components and fast Vite tooling.',
    userInteractions: [
      'Browse structured product cards with category labels, ratings, and pricing',
      'Add products to the cart with instant item count and subtotal updates',
      'Reset cart state cleanly with one click',
    ],
    stackGroups: [
      { label: 'Frontend', items: ['React', 'JavaScript', 'CSS3'] },
      { label: 'Build & Architecture', items: ['Vite', 'Reusable Components'] },
    ],
    accentHex: '#F59E0B',
    cardBgClass: 'from-[#232018] via-[#1B1D24] to-[#12151C]',
    cardBorderClass: 'border-amber-400/30',
    accentTextClass: 'text-amber-300',
    badgeClass: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
    slotCode: 'AMZ-02',
  },
  'todo-list-app': {
    shortTag: 'Task Manager',
    purpose:
      'Provides a focused daily task organizer while demonstrating core JavaScript fundamentals, DOM interactions, and clean state management.',
    userInteractions: [
      'Create new tasks via controlled form submission with empty-input protection',
      'Toggle task completion states with immediate visual strikethrough feedback',
      'Delete individual tasks and monitor live remaining vs. total counts',
    ],
    stackGroups: [
      { label: 'Frontend', items: ['JavaScript', 'HTML5', 'CSS3'] },
      { label: 'Core Patterns', items: ['DOM Manipulation', 'State Management'] },
    ],
    accentHex: '#3B82F6',
    cardBgClass: 'from-[#142038] via-[#141B2D] to-[#0F1422]',
    cardBorderClass: 'border-blue-400/30',
    accentTextClass: 'text-sky-300',
    badgeClass: 'bg-blue-500/15 text-sky-200 border-blue-400/30',
    slotCode: 'TODO-03',
  },
  'rock-paper-scissors': {
    shortTag: 'Browser Game',
    purpose:
      'Delivers an interactive player-versus-computer browser game built around conditional win/loss/draw rules, event handling, and live scoring.',
    userInteractions: [
      'Select Rock, Paper, or Scissors to trigger an immediate computer move',
      'Compare player vs. CPU choices with clear Win, Loss, or Draw outcomes',
      'Track running scores and reset the match scoreboard anytime',
    ],
    stackGroups: [
      { label: 'Frontend', items: ['JavaScript', 'HTML5', 'CSS3'] },
      { label: 'Core Patterns', items: ['Game Logic', 'Event Handling'] },
    ],
    accentHex: '#10B981',
    cardBgClass: 'from-[#102923] via-[#122220] to-[#0E1817]',
    cardBorderClass: 'border-emerald-400/30',
    accentTextClass: 'text-emerald-300',
    badgeClass: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
    slotCode: 'RPS-04',
  },
  'chatbot-application': {
    shortTag: 'Conversational UI',
    purpose:
      'Implements an interactive conversational web interface using React and Vite to practice component-driven messaging and user input flows.',
    userInteractions: [
      'Send custom messages via the composer input or trigger one-click quick prompts',
      'View distinct user and assistant message bubbles in a scrolling thread',
      'Receive immediate contextual responses with automatic scroll-to-latest behavior',
    ],
    stackGroups: [
      { label: 'Frontend', items: ['React', 'JavaScript'] },
      { label: 'Build & Architecture', items: ['Vite', 'Conversational UI', 'Component Architecture'] },
    ],
    accentHex: '#818CF8',
    cardBgClass: 'from-[#1E1A3A] via-[#19172E] to-[#121121]',
    cardBorderClass: 'border-indigo-400/30',
    accentTextClass: 'text-indigo-300',
    badgeClass: 'bg-indigo-500/15 text-indigo-200 border-indigo-400/30',
    slotCode: 'BOT-05',
  },
};

export function getWalletProjectMeta(projectId: string): WalletProjectMeta {
  return (
    WALLET_PROJECT_META[projectId] ?? {
      shortTag: 'Frontend Build',
      purpose: 'Interactive frontend web application built to sharpen engineering fundamentals.',
      userInteractions: ['Explore the interactive interface and technical details'],
      stackGroups: [{ label: 'Frontend', items: ['JavaScript', 'HTML5', 'CSS3'] }],
      accentHex: '#2563EB',
      cardBgClass: 'from-slate-800 via-slate-900 to-slate-950',
      cardBorderClass: 'border-slate-600/40',
      accentTextClass: 'text-blue-300',
      badgeClass: 'bg-blue-500/15 text-blue-200 border-blue-400/30',
      slotCode: 'PRJ',
    }
  );
}
