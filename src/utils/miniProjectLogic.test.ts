import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterMiniProjects,
  evaluateRpsRound,
  pickCpuMove,
  addTodoItem,
  toggleTodoItem,
  removeTodoItem,
  calculateCartSummary,
  generateChatbotReply,
  MiniCartProduct,
} from './miniProjectLogic';
import { PORTFOLIO_DATA } from '../data/portfolioData';

test('PORTFOLIO_DATA includes all 5 requested mini projects', () => {
  const names = PORTFOLIO_DATA.miniProjects.map((p) => p.name);
  assert.equal(PORTFOLIO_DATA.miniProjects.length, 5);
  assert.deepEqual(names, [
    'YouTube Clone',
    'Amazon Clone',
    'To-Do List Application',
    'Rock Paper Scissors',
    'Chatbot Application',
  ]);
  assert.ok(PORTFOLIO_DATA.miniProjects.every((p) => p.featured === false));
});

test('filterMiniProjects filters accurately by category tab', () => {
  const all = filterMiniProjects(PORTFOLIO_DATA.miniProjects, 'All');
  assert.equal(all.length, 5);

  const reactVite = filterMiniProjects(PORTFOLIO_DATA.miniProjects, 'React & Vite');
  assert.deepEqual(
    reactVite.map((p) => p.name),
    ['Amazon Clone', 'Chatbot Application']
  );

  const jsDom = filterMiniProjects(PORTFOLIO_DATA.miniProjects, 'JavaScript & DOM');
  assert.deepEqual(
    jsDom.map((p) => p.name),
    ['To-Do List Application', 'Rock Paper Scissors']
  );

  const uiBuilds = filterMiniProjects(PORTFOLIO_DATA.miniProjects, 'Frontend UI');
  assert.deepEqual(
    uiBuilds.map((p) => p.name),
    ['YouTube Clone', 'Amazon Clone', 'Chatbot Application']
  );
});

test('evaluateRpsRound resolves all win, lose, and draw outcomes', () => {
  assert.equal(evaluateRpsRound('Rock', 'Scissors'), 'win');
  assert.equal(evaluateRpsRound('Paper', 'Rock'), 'win');
  assert.equal(evaluateRpsRound('Scissors', 'Paper'), 'win');

  assert.equal(evaluateRpsRound('Rock', 'Paper'), 'lose');
  assert.equal(evaluateRpsRound('Paper', 'Scissors'), 'lose');
  assert.equal(evaluateRpsRound('Scissors', 'Rock'), 'lose');

  assert.equal(evaluateRpsRound('Rock', 'Rock'), 'draw');
  assert.equal(evaluateRpsRound('Paper', 'Paper'), 'draw');
  assert.equal(evaluateRpsRound('Scissors', 'Scissors'), 'draw');
});

test('pickCpuMove maps random values to valid moves deterministically', () => {
  assert.equal(pickCpuMove(0), 'Rock');
  assert.equal(pickCpuMove(0.5), 'Paper');
  assert.equal(pickCpuMove(0.95), 'Scissors');
  assert.equal(pickCpuMove(1), 'Scissors');
});

test('To-Do helpers add, toggle, reject empty, and remove tasks cleanly', () => {
  const initial = [{ id: 't1', text: 'Practice DSA', done: false }];

  const unchanged = addTodoItem(initial, '   ');
  assert.equal(unchanged.length, 1);

  const added = addTodoItem(initial, 'Ship portfolio', 't2');
  assert.equal(added.length, 2);
  assert.equal(added[0].text, 'Ship portfolio');
  assert.equal(added[0].done, false);

  const toggled = toggleTodoItem(added, 't2');
  assert.equal(toggled[0].done, true);

  const removed = removeTodoItem(toggled, 't1');
  assert.equal(removed.length, 1);
  assert.equal(removed[0].id, 't2');
});

test('calculateCartSummary computes total items and subtotal accurately', () => {
  const catalog: MiniCartProduct[] = [
    { id: 'p1', name: 'Mechanical Keyboard', price: 79, rating: '4.8', tag: 'Tech' },
    { id: 'p2', name: 'USB-C Hub', price: 29, rating: '4.6', tag: 'Accessory' },
  ];

  const summary = calculateCartSummary({ p1: 2, p2: 1 }, catalog);
  assert.equal(summary.itemCount, 3);
  assert.equal(summary.subtotal, 187);
});

test('generateChatbotReply returns contextual replies', () => {
  assert.ok(generateChatbotReply('What tech stack?').includes('React, Vite'));
  assert.ok(generateChatbotReply('Hello').includes('Hello'));
  assert.ok(generateChatbotReply('Custom test message').includes('Custom test message'));
});
