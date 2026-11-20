import test from 'node:test';
import assert from 'node:assert/strict';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import {
  buildGlobeSkillNodes,
  buildCategoryConnectionArcs,
  computeFibonacciSpherePoint,
  computeNodeDepthMetrics,
  computeTargetRotationForNode,
  filterGlobeNodesByCategory,
  formatSphericalCoords,
} from './techGlobeLogic';

test('buildGlobeSkillNodes maps every exact skill from PORTFOLIO_DATA without adding or dropping any', () => {
  const expectedTotal = PORTFOLIO_DATA.skillCategories.reduce(
    (sum, cat) => sum + cat.skills.length,
    0
  );
  const nodes = buildGlobeSkillNodes(PORTFOLIO_DATA.skillCategories, 2.25);

  assert.equal(nodes.length, expectedTotal);
  assert.equal(nodes.length, 32);

  const portfolioSkillNames = new Set(
    PORTFOLIO_DATA.skillCategories.flatMap((c) => c.skills.map((s) => s.name))
  );
  for (const node of nodes) {
    assert.ok(portfolioSkillNames.has(node.name), `Unexpected skill: ${node.name}`);
    const radius = Math.hypot(
      node.surfacePos[0],
      node.surfacePos[1],
      node.surfacePos[2]
    );
    assert.ok(Math.abs(radius - 2.25) < 1e-6, `Expected radius 2.25, got ${radius}`);
  }
});

test('computeFibonacciSpherePoint produces unit-length well-separated coordinates', () => {
  const points = Array.from({ length: 32 }, (_, i) =>
    computeFibonacciSpherePoint(i, 32)
  );

  for (const [x, y, z] of points) {
    const len = Math.hypot(x, y, z);
    assert.ok(Math.abs(len - 1) < 1e-6);
    assert.ok(y >= -0.85 && y <= 0.85);
  }

  // Ensure no two nodes overlap on the unit sphere
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const dist = Math.hypot(
        points[i][0] - points[j][0],
        points[i][1] - points[j][1],
        points[i][2] - points[j][2]
      );
      assert.ok(dist > 0.35, `Points ${i} and ${j} too close: ${dist}`);
    }
  }
});

test('computeNodeDepthMetrics fades back-facing nodes and disables back-hemisphere picking', () => {
  const front = computeNodeDepthMetrics(0.85, false, false);
  const limb = computeNodeDepthMetrics(0.0, false, false);
  const back = computeNodeDepthMetrics(-0.75, false, false);
  const hoveredFront = computeNodeDepthMetrics(0.85, true, false);
  const dimmedFront = computeNodeDepthMetrics(0.85, false, true);

  assert.equal(front.interactive, true);
  assert.equal(front.opacity, 1);
  assert.equal(back.interactive, false);
  assert.ok(back.opacity <= 0.15);
  assert.ok(limb.opacity > back.opacity && limb.opacity < front.opacity);
  assert.ok(hoveredFront.scaleFactor > front.scaleFactor);
  assert.ok(dimmedFront.opacity < front.opacity * 0.3);
});

test('computeTargetRotationForNode rotates a surface point onto the +Z viewer axis', () => {
  const testPoint: [number, number, number] = [0.6, 0.4, Math.sqrt(1 - 0.36 - 0.16)];
  const { rotX, rotY } = computeTargetRotationForNode(testPoint);

  // Apply Y rotation then X rotation and confirm Z becomes strongly positive
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = testPoint[0] * cosY + testPoint[2] * sinY;
  const z1 = -testPoint[0] * sinY + testPoint[2] * cosY;
  const y1 = testPoint[1];

  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y2 = y1 * cosX - z1 * sinX;
  const z2 = y1 * sinX + z1 * cosX;

  assert.ok(Math.abs(x1) < 1e-6);
  assert.ok(Math.abs(y2) < 1e-6);
  assert.ok(z2 > 0.99);
});

test('buildCategoryConnectionArcs connects peers within identical categories without duplicates', () => {
  const nodes = buildGlobeSkillNodes(PORTFOLIO_DATA.skillCategories, 2.25);
  const arcs = buildCategoryConnectionArcs(nodes);

  assert.ok(arcs.length >= 15);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const ids = new Set<string>();
  for (const arc of arcs) {
    assert.ok(!ids.has(arc.id), `Duplicate arc ${arc.id}`);
    ids.add(arc.id);
    const a = nodeMap.get(arc.fromId);
    const b = nodeMap.get(arc.toId);
    assert.ok(a && b);
    assert.equal(a.category, b.category);
  }
});

test('filterGlobeNodesByCategory and formatSphericalCoords work accurately', () => {
  const nodes = buildGlobeSkillNodes(PORTFOLIO_DATA.skillCategories, 2.25);
  assert.equal(filterGlobeNodesByCategory(nodes, 'All').length, 32);
  assert.equal(filterGlobeNodesByCategory(nodes, 'Frontend Development').length, 5);
  assert.equal(filterGlobeNodesByCategory(nodes, 'Databases').length, 3);
  assert.equal(formatSphericalCoords(24, -72), '24°N · 72°W');
  assert.equal(formatSphericalCoords(-12, 88), '12°S · 88°E');
});
