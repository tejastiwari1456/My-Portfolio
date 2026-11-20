import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeWalletCardTransform,
  resolveCardClick,
  getNextWalletIndex,
  getWalletProjectMeta,
} from './walletLogic';
import { PORTFOLIO_DATA } from '../data/portfolioData';

test('computeWalletCardTransform lifts hovered card and shifts neighbors cleanly', () => {
  const resting = computeWalletCardTransform(2, 5, null, 58);
  assert.equal(resting.baseY, 116);
  assert.equal(resting.targetY, 116);

  const lifted = computeWalletCardTransform(2, 5, 2, 58);
  assert.ok(lifted.targetY < lifted.baseY, 'active card lifts upward');
  assert.ok(lifted.scale > 1, 'active card scales slightly forward');
  assert.ok(lifted.zIndex > 30, 'active card rises above neighbors');

  const above = computeWalletCardTransform(1, 5, 2, 58);
  assert.ok(above.targetY < above.baseY, 'cards above nudge upward');

  const below = computeWalletCardTransform(3, 5, 2, 58);
  assert.ok(below.targetY > below.baseY, 'cards below shift downward to create space');
});

test('resolveCardClick expands immediately on desktop and uses tap-to-preview then tap-to-expand on touch', () => {
  const initial = { previewIndex: null, expandedId: null };

  // Desktop: immediate unfold
  const desktopClick = resolveCardClick(initial, 1, 'amazon-clone', false);
  assert.equal(desktopClick.previewIndex, 1);
  assert.equal(desktopClick.expandedId, 'amazon-clone');

  // Touch first tap: lifts/previews without expanding
  const touchFirstTap = resolveCardClick(initial, 1, 'amazon-clone', true);
  assert.equal(touchFirstTap.previewIndex, 1);
  assert.equal(touchFirstTap.expandedId, null);

  // Touch second tap on same card: unfolds
  const touchSecondTap = resolveCardClick(touchFirstTap, 1, 'amazon-clone', true);
  assert.equal(touchSecondTap.previewIndex, 1);
  assert.equal(touchSecondTap.expandedId, 'amazon-clone');

  // Touch tap on different card: switches preview without expanding
  const touchOtherTap = resolveCardClick(touchFirstTap, 3, 'rock-paper-scissors', true);
  assert.equal(touchOtherTap.previewIndex, 3);
  assert.equal(touchOtherTap.expandedId, null);
});

test('getNextWalletIndex wraps cleanly in both directions', () => {
  assert.equal(getNextWalletIndex(null, 'next', 5), 0);
  assert.equal(getNextWalletIndex(null, 'prev', 5), 4);
  assert.equal(getNextWalletIndex(4, 'next', 5), 0);
  assert.equal(getNextWalletIndex(0, 'prev', 5), 4);
  assert.equal(getNextWalletIndex(2, 'next', 5), 3);
});

test('every mini project in PORTFOLIO_DATA has factual wallet metadata', () => {
  for (const project of PORTFOLIO_DATA.miniProjects) {
    const meta = getWalletProjectMeta(project.id);
    assert.ok(meta.slotCode !== 'PRJ', `expected dedicated meta for ${project.id}`);
    assert.ok(meta.purpose.length > 20);
    assert.ok(meta.userInteractions.length >= 3);
    assert.ok(meta.stackGroups.length >= 2);
  }
});
