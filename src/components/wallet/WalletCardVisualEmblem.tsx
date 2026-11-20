import React from 'react';
import {
  Play,
  ShoppingBag,
  ListChecks,
  Swords,
  MessageSquareText,
} from 'lucide-react';
import {
  YouTubeCloneVisual,
  AmazonCloneVisual,
  TodoListVisual,
  RockPaperScissorsVisual,
  ChatbotVisual,
} from '../MiniProjectVisuals';

interface EmblemProps {
  projectId: string;
  size?: 'sm' | 'md';
}

export const WalletCardVisualEmblem: React.FC<EmblemProps> = ({
  projectId,
  size = 'sm',
}) => {
  const boxClass = size === 'sm' ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl';
  const iconClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  switch (projectId) {
    case 'youtube-clone':
      return (
        <span
          className={`${boxClass} bg-rose-500/20 border border-rose-400/35 text-rose-300 inline-flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <Play className={`${iconClass} fill-current`} />
        </span>
      );
    case 'amazon-clone':
      return (
        <span
          className={`${boxClass} bg-amber-500/20 border border-amber-400/35 text-amber-300 inline-flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <ShoppingBag className={iconClass} />
        </span>
      );
    case 'todo-list-app':
      return (
        <span
          className={`${boxClass} bg-sky-500/20 border border-sky-400/35 text-sky-300 inline-flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <ListChecks className={iconClass} />
        </span>
      );
    case 'rock-paper-scissors':
      return (
        <span
          className={`${boxClass} bg-emerald-500/20 border border-emerald-400/35 text-emerald-300 inline-flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <Swords className={iconClass} />
        </span>
      );
    case 'chatbot-application':
      return (
        <span
          className={`${boxClass} bg-indigo-500/20 border border-indigo-400/35 text-indigo-300 inline-flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <MessageSquareText className={iconClass} />
        </span>
      );
    default:
      return null;
  }
};

export const WalletLiveDemoRenderer: React.FC<{ projectId: string }> = ({
  projectId,
}) => {
  switch (projectId) {
    case 'youtube-clone':
      return <YouTubeCloneVisual />;
    case 'amazon-clone':
      return <AmazonCloneVisual />;
    case 'todo-list-app':
      return <TodoListVisual />;
    case 'rock-paper-scissors':
      return <RockPaperScissorsVisual />;
    case 'chatbot-application':
      return <ChatbotVisual />;
    default:
      return null;
  }
};
