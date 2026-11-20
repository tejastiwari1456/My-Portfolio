import { Project } from '../data/portfolioData';

export type MiniProjectFilter = 'All' | 'React & Vite' | 'JavaScript & DOM' | 'Frontend UI';

export function filterMiniProjects(
  projects: Project[],
  activeFilter: MiniProjectFilter
): Project[] {
  if (activeFilter === 'All') return projects;

  return projects.filter((project) => {
    const stack = project.techStack.map((t) => t.toLowerCase());
    const category = project.category.toLowerCase();

    switch (activeFilter) {
      case 'React & Vite':
        return stack.includes('react') || stack.includes('vite');
      case 'JavaScript & DOM':
        return (
          stack.includes('dom manipulation') ||
          stack.includes('game logic') ||
          category.includes('javascript')
        );
      case 'Frontend UI':
        return (
          category.includes('frontend ui') ||
          category.includes('e-commerce') ||
          category.includes('conversational ui')
        );
      default:
        return true;
    }
  });
}

// --- Rock Paper Scissors pure logic ---
export type RpsMove = 'Rock' | 'Paper' | 'Scissors';
export type RpsOutcome = 'win' | 'lose' | 'draw';

export const RPS_MOVES: readonly RpsMove[] = ['Rock', 'Paper', 'Scissors'] as const;

export function evaluateRpsRound(player: RpsMove, cpu: RpsMove): RpsOutcome {
  if (player === cpu) return 'draw';
  if (
    (player === 'Rock' && cpu === 'Scissors') ||
    (player === 'Paper' && cpu === 'Rock') ||
    (player === 'Scissors' && cpu === 'Paper')
  ) {
    return 'win';
  }
  return 'lose';
}

export function pickCpuMove(randomValue: number = Math.random()): RpsMove {
  const safeVal = Math.min(0.999999, Math.max(0, randomValue));
  const idx = Math.floor(safeVal * RPS_MOVES.length);
  return RPS_MOVES[idx];
}

// --- To-Do List pure logic ---
export interface MiniTodoItem {
  id: string;
  text: string;
  done: boolean;
}

export function addTodoItem(items: MiniTodoItem[], rawText: string, id?: string): MiniTodoItem[] {
  const text = rawText.trim();
  if (!text) return items;
  return [
    {
      id: id ?? `todo-${Date.now()}-${items.length}`,
      text,
      done: false,
    },
    ...items,
  ];
}

export function toggleTodoItem(items: MiniTodoItem[], id: string): MiniTodoItem[] {
  return items.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
}

export function removeTodoItem(items: MiniTodoItem[], id: string): MiniTodoItem[] {
  return items.filter((item) => item.id !== id);
}

// --- Amazon Clone mini cart pure logic ---
export interface MiniCartProduct {
  id: string;
  name: string;
  price: number;
  rating: string;
  tag: string;
}

export function calculateCartSummary(
  cartCounts: Record<string, number>,
  products: MiniCartProduct[]
): { itemCount: number; subtotal: number } {
  let itemCount = 0;
  let subtotal = 0;

  for (const product of products) {
    const qty = cartCounts[product.id] ?? 0;
    if (qty > 0) {
      itemCount += qty;
      subtotal += qty * product.price;
    }
  }

  return { itemCount, subtotal };
}

// --- Chatbot Application pure logic ---
export interface ChatBubble {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

export function generateChatbotReply(userMessage: string): string {
  const normalized = userMessage.trim().toLowerCase();

  if (!normalized) {
    return 'Type a question about this React + Vite chatbot or pick a quick prompt.';
  }
  if (normalized.includes('stack') || normalized.includes('tech') || normalized.includes('built')) {
    return 'Built with React, Vite, and modular UI components for instant message updates and clean state handling.';
  }
  if (normalized.includes('hello') || normalized.includes('hi') || normalized.includes('hey')) {
    return 'Hello! Welcome to the interactive chatbot preview. Ask about its architecture or features.';
  }
  if (normalized.includes('feature') || normalized.includes('how') || normalized.includes('work')) {
    return 'It manages a live message stream, keyboard submission, quick prompts, and deterministic conversational replies.';
  }
  if (normalized.includes('project') || normalized.includes('tejas') || normalized.includes('portfolio')) {
    return 'This mini project is part of Tejas Tiwari’s frontend engineering portfolio alongside YouTube & Amazon clones.';
  }

  return `Received "${userMessage.trim()}". The component updates conversation state immediately without page reloads.`;
}
