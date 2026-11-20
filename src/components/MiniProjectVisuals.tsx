import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  ShoppingCart,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Send,
  Star,
} from 'lucide-react';
import {
  RPS_MOVES,
  RpsMove,
  RpsOutcome,
  evaluateRpsRound,
  pickCpuMove,
  MiniTodoItem,
  addTodoItem,
  toggleTodoItem,
  removeTodoItem,
  MiniCartProduct,
  calculateCartSummary,
  ChatBubble,
  generateChatbotReply,
} from '../utils/miniProjectLogic';

interface VideoItem {
  id: string;
  title: string;
  channel: string;
  views: string;
  duration: string;
  topic: 'All' | 'Frontend' | 'DSA';
  accentClass: string;
}

const YOUTUBE_VIDEOS: VideoItem[] = [
  {
    id: 'vid-1',
    title: 'Responsive CSS Grid & Flex Layouts',
    channel: 'Tejas Dev Lab',
    views: '18.4K views',
    duration: '12:40',
    topic: 'Frontend',
    accentClass: 'from-slate-800 via-blue-950 to-slate-900',
  },
  {
    id: 'vid-2',
    title: 'React Component Composition Patterns',
    channel: 'Frontend Craft',
    views: '24.1K views',
    duration: '16:15',
    topic: 'Frontend',
    accentClass: 'from-slate-900 via-indigo-950 to-slate-800',
  },
  {
    id: 'vid-3',
    title: 'Graph BFS & Shortest Paths in Java',
    channel: 'AlgoNotes',
    views: '31.9K views',
    duration: '19:05',
    topic: 'DSA',
    accentClass: 'from-slate-900 via-slate-800 to-cyan-950',
  },
];

export const YouTubeCloneVisual: React.FC = () => {
  const [topic, setTopic] = useState<'All' | 'Frontend' | 'DSA'>('All');
  const [selectedId, setSelectedId] = useState<string>(YOUTUBE_VIDEOS[0].id);

  const visibleVideos =
    topic === 'All'
      ? YOUTUBE_VIDEOS
      : YOUTUBE_VIDEOS.filter((video) => video.topic === topic);

  const activeVideo =
    visibleVideos.find((v) => v.id === selectedId) ?? visibleVideos[0] ?? YOUTUBE_VIDEOS[0];

  return (
    <div
      className="w-full min-h-[232px] sm:h-[232px] bg-slate-50 rounded-xl border border-slate-200 flex flex-col overflow-hidden"
      data-testid="preview-youtube-clone"
    >
      {/* Top Bar */}
      <div className="px-3 py-2 bg-white border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-5 h-3.5 rounded bg-rose-600 text-white inline-flex items-center justify-center">
            <Play className="w-2.5 h-2.5 fill-current" />
          </span>
          <span className="text-xs font-bold tracking-tight text-slate-900 whitespace-nowrap">
            StreamView
          </span>
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="YouTube preview topics">
          {(['All', 'Frontend', 'DSA'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setTopic(tab);
                const nextList =
                  tab === 'All'
                    ? YOUTUBE_VIDEOS
                    : YOUTUBE_VIDEOS.filter((v) => v.topic === tab);
                if (nextList.length > 0 && !nextList.some((v) => v.id === selectedId)) {
                  setSelectedId(nextList[0].id);
                }
              }}
              aria-pressed={topic === tab}
              className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                topic === tab
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Player + Up Next Grid */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-12 gap-2.5 flex-1 min-h-0">
        <div className="sm:col-span-7 flex flex-col justify-between bg-white rounded-lg border border-slate-200 overflow-hidden min-h-[120px]">
          <div
            className={`relative flex-1 bg-gradient-to-br ${activeVideo.accentClass} p-3 flex flex-col justify-between text-white`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono-code">
              <span>Now Playing</span>
              <span className="tabular-nums">{activeVideo.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5" />
              </span>
              <p className="text-xs font-semibold leading-snug line-clamp-2 text-white">
                {activeVideo.title}
              </p>
            </div>
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="w-2/5 h-full bg-rose-500 rounded-full" />
            </div>
          </div>
          <div className="px-2.5 py-1.5 bg-white text-[11px] text-slate-600 flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-800 truncate">{activeVideo.channel}</span>
            <span className="text-slate-500 shrink-0 tabular-nums">{activeVideo.views}</span>
          </div>
        </div>

        <div className="sm:col-span-5 flex flex-col gap-1.5 overflow-y-auto">
          {visibleVideos.map((video) => {
            const isSelected = video.id === activeVideo.id;
            return (
              <button
                key={video.id}
                type="button"
                onClick={() => setSelectedId(video.id)}
                aria-label={`Play ${video.title}`}
                className={`text-left p-2 rounded-lg border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-300 text-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-[11px] font-semibold leading-tight line-clamp-1">
                  {video.title}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between gap-1">
                  <span className="truncate">{video.channel}</span>
                  <span className="font-mono-code tabular-nums shrink-0">{video.duration}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const STORE_PRODUCTS: MiniCartProduct[] = [
  { id: 'kb-01', name: 'Mechanical Keyboard', price: 79, rating: '4.8', tag: 'Peripherals' },
  { id: 'hub-02', name: 'USB-C Multiport Hub', price: 29, rating: '4.6', tag: 'Accessories' },
  { id: 'stand-03', name: 'Aluminum Laptop Stand', price: 42, rating: '4.9', tag: 'Desk Setup' },
];

export const AmazonCloneVisual: React.FC = () => {
  const [cartCounts, setCartCounts] = useState<Record<string, number>>({ 'kb-01': 1 });

  const { itemCount, subtotal } = calculateCartSummary(cartCounts, STORE_PRODUCTS);

  const handleAdd = (productId: string) => {
    setCartCounts((prev) => ({
      ...prev,
      [productId]: (prev[productId] ?? 0) + 1,
    }));
  };

  const handleClear = () => setCartCounts({});

  return (
    <div
      className="w-full min-h-[232px] sm:h-[232px] bg-slate-50 rounded-xl border border-slate-200 flex flex-col overflow-hidden"
      data-testid="preview-amazon-clone"
    >
      {/* Store Header */}
      <div className="px-3 py-2 bg-slate-900 text-white flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold tracking-tight text-amber-400">ShopZone</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">· React Storefront</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tabular-nums">
            <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
            <span data-testid="amazon-cart-count">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span data-testid="amazon-cart-subtotal" className="font-mono-code text-amber-300">
              ${subtotal}
            </span>
          </span>
          {itemCount > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear shopping cart"
              className="text-[11px] text-slate-300 hover:text-white underline underline-offset-2 cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Product Row */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 min-h-0">
        {STORE_PRODUCTS.map((product) => {
          const qty = cartCounts[product.id] ?? 0;
          return (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-slate-200 p-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] text-slate-500 truncate">{product.tag}</div>
                <div className="text-xs font-bold text-slate-900 leading-snug mt-0.5 line-clamp-2">
                  {product.name}
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-amber-600 font-semibold tabular-nums">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                  <span>{product.rating}</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                <span className="text-xs font-extrabold font-mono-code text-slate-900 tabular-nums">
                  ${product.price}
                </span>
                <button
                  type="button"
                  onClick={() => handleAdd(product.id)}
                  aria-label={`Add ${product.name} to cart`}
                  className="px-2 py-1 text-[11px] font-semibold bg-amber-400 hover:bg-amber-500 text-slate-950 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {qty > 0 ? `Add (${qty})` : 'Add'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const INITIAL_TODOS: MiniTodoItem[] = [
  { id: 't1', text: 'Solve 3 LeetCode graph problems', done: true },
  { id: 't2', text: 'Refactor reusable React card', done: false },
];

export const TodoListVisual: React.FC = () => {
  const [items, setItems] = useState<MiniTodoItem[]>(INITIAL_TODOS);
  const [draft, setDraft] = useState('');

  const remaining = items.filter((item) => !item.done).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setItems((prev) => addTodoItem(prev, draft));
    setDraft('');
  };

  return (
    <div
      className="w-full h-[232px] bg-slate-50 rounded-xl border border-slate-200 flex flex-col overflow-hidden"
      data-testid="preview-todo-list"
    >
      <div className="px-3 py-2 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-900">Daily Tasks</span>
        <span
          className="text-[11px] font-mono-code text-slate-600 tabular-nums"
          data-testid="todo-remaining-count"
        >
          {remaining} left · {items.length} total
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-2.5 border-b border-slate-200 flex items-center gap-1.5 bg-white">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task..."
          aria-label="New task name"
          className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          aria-label="Add task"
          className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      <ul className="p-2.5 space-y-1.5 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <li className="text-xs text-slate-500 text-center py-6">
            All clear. Add a task above.
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md flex items-center justify-between gap-2"
            >
              <button
                type="button"
                onClick={() => setItems((prev) => toggleTodoItem(prev, item.id))}
                aria-label={`Toggle "${item.text}"`}
                aria-pressed={item.done}
                className="flex items-center gap-2 text-left min-w-0 flex-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    item.done
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {item.done && <Check className="w-3 h-3" />}
                </span>
                <span
                  className={`text-xs truncate ${
                    item.done ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                  }`}
                >
                  {item.text}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setItems((prev) => removeTodoItem(prev, item.id))}
                aria-label={`Delete "${item.text}"`}
                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export const RockPaperScissorsVisual: React.FC = () => {
  const [playerMove, setPlayerMove] = useState<RpsMove | null>(null);
  const [cpuMove, setCpuMove] = useState<RpsMove | null>(null);
  const [outcome, setOutcome] = useState<RpsOutcome | null>(null);
  const [score, setScore] = useState({ player: 0, cpu: 0, draws: 0 });

  const handlePlay = (move: RpsMove) => {
    const cpu = pickCpuMove();
    const result = evaluateRpsRound(move, cpu);
    setPlayerMove(move);
    setCpuMove(cpu);
    setOutcome(result);
    setScore((prev) => ({
      player: prev.player + (result === 'win' ? 1 : 0),
      cpu: prev.cpu + (result === 'lose' ? 1 : 0),
      draws: prev.draws + (result === 'draw' ? 1 : 0),
    }));
  };

  const handleReset = () => {
    setPlayerMove(null);
    setCpuMove(null);
    setOutcome(null);
    setScore({ player: 0, cpu: 0, draws: 0 });
  };

  const outcomeLabel =
    outcome === 'win'
      ? 'You Win'
      : outcome === 'lose'
        ? 'CPU Wins'
        : outcome === 'draw'
          ? 'Round Draw'
          : 'Pick a move to start';

  const outcomeTone =
    outcome === 'win'
      ? 'text-emerald-700'
      : outcome === 'lose'
        ? 'text-rose-700'
        : outcome === 'draw'
          ? 'text-amber-700'
          : 'text-slate-600';

  return (
    <div
      className="w-full h-[232px] bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between overflow-hidden"
      data-testid="preview-rps-game"
    >
      <div className="px-3 py-2 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-900">Player vs CPU</span>
        <div className="flex items-center gap-2">
          <span
            className="font-mono-code text-[11px] font-semibold text-slate-700 tabular-nums"
            data-testid="rps-scoreboard"
          >
            You {score.player} · CPU {score.cpu}
          </span>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset Rock Paper Scissors score"
            className="p-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            title="Reset score"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
        {/* Arena Readout */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center flex-1 text-center">
          <div className="grid grid-cols-3 items-center w-full text-xs">
            <div>
              <div className="text-[10px] text-slate-500">You</div>
              <div className="font-bold text-slate-900 mt-0.5" data-testid="rps-player-move">
                {playerMove ?? '—'}
              </div>
            </div>
            <div className="text-[11px] font-mono-code text-slate-400">vs</div>
            <div>
              <div className="text-[10px] text-slate-500">Computer</div>
              <div className="font-bold text-slate-900 mt-0.5" data-testid="rps-cpu-move">
                {cpuMove ?? '—'}
              </div>
            </div>
          </div>

          <div
            className={`mt-2 text-xs font-bold ${outcomeTone}`}
            data-testid="rps-outcome"
          >
            {outcomeLabel}
          </div>
        </div>

        {/* Move Controls */}
        <div className="grid grid-cols-3 gap-2">
          {RPS_MOVES.map((move) => (
            <button
              key={move}
              type="button"
              onClick={() => handlePlay(move)}
              aria-label={`Play ${move}`}
              className={`py-1.5 px-2 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                playerMove === move
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:text-blue-700'
              }`}
            >
              {move}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const INITIAL_MESSAGES: ChatBubble[] = [
  {
    id: 'm1',
    sender: 'bot',
    text: 'Hi! Ask how this React + Vite chatbot handles messages.',
  },
];

export const ChatbotVisual: React.FC = () => {
  const [messages, setMessages] = useState<ChatBubble[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = Date.now();
    const userMsg: ChatBubble = { id: `u-${now}`, sender: 'user', text: trimmed };
    const botMsg: ChatBubble = {
      id: `b-${now + 1}`,
      sender: 'bot',
      text: generateChatbotReply(trimmed),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div
      className="w-full h-[232px] bg-slate-50 rounded-xl border border-slate-200 flex flex-col overflow-hidden"
      data-testid="preview-chatbot-app"
    >
      <div className="px-3 py-2 bg-white border-b border-slate-200 flex items-center justify-between text-xs gap-2">
        <span className="font-bold text-slate-900">Chat Assistant UI</span>
        <div className="flex items-center gap-1.5">
          {(['Tech stack?', 'How it works?'] as const).map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="text-[11px] font-medium text-blue-700 hover:text-blue-900 hover:underline underline-offset-2 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="p-2.5 space-y-2 flex-1 overflow-y-auto"
        data-testid="chatbot-messages"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-2.5 py-1.5 rounded-lg text-[11px] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="p-2 bg-white border-t border-slate-200 flex items-center gap-1.5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          aria-label="Chat message input"
          className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          aria-label="Send chat message"
          className="px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-600 rounded-md inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Send className="w-3 h-3" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
