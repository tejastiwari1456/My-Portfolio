import test from 'node:test';
import assert from 'node:assert/strict';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import {
  buildGlobeSkillNodes,
  buildSphericalMeshConnections,
  computeFibonacciSpherePoint,
  computeNodeDepthMetrics,
  computeTargetRotationForNode,
  filterGlobeNodesByCategory,
  formatSphericalCoords,
  getConnectedSkillNeighbors,
} from './techGlobeLogic';

test('buildGlobeSkillNodes maps every exact skill from PORTFOLIO_DATA with tiered prominence', () => {
  const expectedTotal = PORTFOLIO_DATA.skillCategories.reduce(
    (sum, cat) => sum + cat.skills.length,
    0
  );
  const nodes = buildGlobeSkillNodes(PORTFOLIO_DATA.skillCategories, 2.42);

  assert.equal(nodes.length, expectedTotal);
  assert.equal(nodes.length, 32);

  const portfolioSkillNames = new Set(
    PORTFOLIO_DATA.skillCategories.flatMap((c) => c.skills.map((s) => s.name))
  );
  let primaryCount = 0;
  let supportingCount = 0;
  for (const node of nodes) {
    assert.ok(portfolioSkillNames.has(node.name), `Unexpected skill: ${node.name}`);
    const radius = Math.hypot(
      node.surfacePos[0],
      node.surfacePos[1],
      node.surfacePos[2]
    );
    assert.ok(Math.abs(radius - 2.42) < 1e-6, `Expected radius 2.42, got ${radius}`);
    if (node.prominence === 'primary') {
      primaryCount += 1;
      assert.ok(node.visualWeight > 1.0);
    } else {
      supportingCount += 1;
      assert.ok(node.visualWeight < 1.0);
    }
  }
  assert.ok(primaryCount >= 10 && supportingCount >= 10);
});

test('computeFibonacciSpherePoint produces well-separated unit spherical coordinates', () => {
  const points = Array.from({ length: 32 }, (_, i) =>
    computeFibonacciSpherePoint(i, 32)
  );

  for (const [x, y, z] of points) {
    const len = Math.hypot(x, y, z);
    assert.ok(Math.abs(len - 1) < 1e-6);
    assert.ok(y >= -0.91 && y <= 0.91);
  }

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

test('buildSphericalMeshConnections constructs a connected hollow geodesic web across all 32 skills', () => {
  const nodes = buildGlobeSkillNodes(PORTFOLIO_DATA.skillCategories, 2.42);
  const edges = buildSphericalMeshConnections(nodes, 3);

  assert.ok(edges.length >= 45, `Expected dense geodesic mesh, got ${edges.length}`);
  const seenIds = new Set<string>();
  for (const edge of edges) {
    assert.ok(!seenIds.has(edge.id), `Duplicate edge ${edge.id}`);
    seenIds.add(edge.id);
    assert.notEqual(edge.fromId, edge.toId);
  }

  // Every single skill must participate in the spherical web (>= 3 connections)
  for (const node of nodes) {
    const neighbors = getConnectedSkillNeighbors(node.id, nodes, edges);
    assert.ok(
      neighbors.length >= 3,
      `Skill ${node.name} has only ${neighbors.length} spherical links`
    );
  }
});

test('computeNodeDepthMetrics cleanly separates front-facing vs back-side depth and prominence weight', () => {
  const frontPrimary = computeNodeDepthMetrics(0.9, false, false, 1.18);
  const frontSupporting = computeNodeDepthMetrics(0.9, false, false, 0.9);
  const backNode = computeNodeDepthMetrics(-0.85, false, false, 1.0);
  const hoveredFront = computeNodeDepthMetrics(0.9, true, false, 1.0);
  const dimmedFront = computeNodeDepthMetrics(0.9, false, true, 1.0);

  assert.equal(frontPrimary.interactive, true);
  assert.equal(frontPrimary.opacity, 1);
  assert.ok(frontPrimary.scaleFactor > frontSupporting.scaleFactor);
  assert.equal(backNode.interactive, false);
  assert.ok(backNode.opacity <= 0.16);
  assert.ok(hoveredFront.scaleFactor > frontSupporting.scaleFactor * 1.2);
  assert.ok(dimmedFront.opacity <= 0.25);
});

test('computeTargetRotationForNode rotates a spherical coordinate onto the +Z viewer axis', () => {
  const testPoint: [number, number, number] = [0.6, 0.4, Math.sqrt(1 - 0.36 - 0.16)];
  const { rotX, rotY } = computeTargetRotationForNode(testPoint);

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

test('filterGlobeNodesByCategory and formatSphericalCoords work accurately', () => {
  const nodes = buildGlobeSkillNodes(PORTFOLIO_DATA.skillCategories, 2.42);
  assert.equal(filterGlobeNodesByCategory(nodes, 'All').length, 32);
  assert.equal(filterGlobeNodesByCategory(nodes, 'Frontend Development').length, 5);
  assert.equal(filterGlobeNodesByCategory(nodes, 'Databases').length, 3);
  assert.equal(formatSphericalCoords(24, -72), '24°N · 72°W');
  assert.equal(formatSphericalCoords(-12, 88), '12°S · 88°E');
});
