import { PORTFOLIO_DATA, SkillCategory } from '../data/portfolioData';

export type GlobeCategoryId =
  | 'All'
  | 'Languages'
  | 'Frontend Development'
  | 'Backend Development'
  | 'Databases'
  | 'AI Integration & APIs'
  | 'Core CS Concepts'
  | 'Tools & Platforms';

export type SkillProminence = 'primary' | 'supporting';

export interface GlobeCategoryVisual {
  id: Exclude<GlobeCategoryId, 'All'>;
  shortLabel: string;
  accentHex: string;
  glowHex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export interface GlobeSkillNode {
  id: string;
  name: string;
  shortLabel: string;
  category: Exclude<GlobeCategoryId, 'All'>;
  categoryShort: string;
  categoryDescription: string;
  level?: string;
  inProjects: string[];
  prominence: SkillProminence;
  /** Visual size multiplier differentiating prominent vs supporting technologies */
  visualWeight: number;
  accentHex: string;
  glowHex: string;
  /** Unit sphere direction vector (length 1) */
  unitPos: [number, number, number];
  /** Surface coordinates at globeRadius */
  surfacePos: [number, number, number];
  /** Latitude in degrees (-90 to +90) */
  latDeg: number;
  /** Longitude in degrees (-180 to +180) */
  lonDeg: number;
}

export interface GlobeConnectionEdge {
  id: string;
  fromId: string;
  toId: string;
  kind: 'structural' | 'discipline';
  category: Exclude<GlobeCategoryId, 'All'>;
  accentHex: string;
}

export interface NodeDepthMetrics {
  /** 0.0 (far back) to 1.0 (facing camera) */
  opacity: number;
  /** Visual scale factor based on depth, prominence, and focus state */
  scaleFactor: number;
  /** Whether the node is on the interactive front hemisphere */
  interactive: boolean;
}

/**
 * Cohesive blue / cyan / violet futuristic palette harmonized across the
 * seven factual skill disciplines from PORTFOLIO_DATA.
 */
export const GLOBE_CATEGORY_VISUALS: Record<
  Exclude<GlobeCategoryId, 'All'>,
  GlobeCategoryVisual
> = {
  Languages: {
    id: 'Languages',
    shortLabel: 'Languages',
    accentHex: '#3B82F6',
    glowHex: '#60A5FA',
    badgeBg: 'rgba(59, 130, 246, 0.16)',
    badgeText: '#93C5FD',
    badgeBorder: 'rgba(59, 130, 246, 0.42)',
  },
  'Frontend Development': {
    id: 'Frontend Development',
    shortLabel: 'Frontend',
    accentHex: '#06B6D4',
    glowHex: '#22D3EE',
    badgeBg: 'rgba(6, 182, 212, 0.16)',
    badgeText: '#67E8F9',
    badgeBorder: 'rgba(6, 182, 212, 0.42)',
  },
  'Backend Development': {
    id: 'Backend Development',
    shortLabel: 'Backend',
    accentHex: '#6366F1',
    glowHex: '#818CF8',
    badgeBg: 'rgba(99, 102, 241, 0.16)',
    badgeText: '#A5B4FC',
    badgeBorder: 'rgba(99, 102, 241, 0.42)',
  },
  Databases: {
    id: 'Databases',
    shortLabel: 'Databases',
    accentHex: '#38BDF8',
    glowHex: '#7DD3FC',
    badgeBg: 'rgba(56, 189, 248, 0.16)',
    badgeText: '#BAE6FD',
    badgeBorder: 'rgba(56, 189, 248, 0.42)',
  },
  'AI Integration & APIs': {
    id: 'AI Integration & APIs',
    shortLabel: 'AI & APIs',
    accentHex: '#8B5CF6',
    glowHex: '#A78BFA',
    badgeBg: 'rgba(139, 92, 246, 0.16)',
    badgeText: '#DDD6FE',
    badgeBorder: 'rgba(139, 92, 246, 0.42)',
  },
  'Core CS Concepts': {
    id: 'Core CS Concepts',
    shortLabel: 'Core CS',
    accentHex: '#2DD4BF',
    glowHex: '#5EEAD4',
    badgeBg: 'rgba(45, 212, 191, 0.15)',
    badgeText: '#99F6E4',
    badgeBorder: 'rgba(45, 212, 191, 0.4)',
  },
  'Tools & Platforms': {
    id: 'Tools & Platforms',
    shortLabel: 'Tools',
    accentHex: '#A855F7',
    glowHex: '#C084FC',
    badgeBg: 'rgba(168, 85, 247, 0.16)',
    badgeText: '#E9D5FF',
    badgeBorder: 'rgba(168, 85, 247, 0.42)',
  },
};

const COMPACT_LABELS: Record<string, string> = {
  'Data Structures & Algorithms': 'DSA',
  'Object-Oriented Programming (OOP)': 'OOP',
  'Database Management Systems (DBMS)': 'DBMS',
  'Operating Systems (OS)': 'Operating Systems',
  'JWT Authentication': 'JWT Auth',
  'Session Management': 'Sessions',
  'AI Evaluation Workflows': 'AI Workflows',
  'MySQL Workbench': 'MySQL WB',
  'Cloudflare Pages': 'Cloudflare',
};

const CORE_ANCHOR_SKILLS = new Set([
  'React.js',
  'TypeScript',
  'JavaScript',
  'Java',
  'Node.js',
  'Express.js',
  'PostgreSQL',
  'SQL',
  'HTML5',
  'CSS3',
  'Tailwind CSS',
  'Git & GitHub',
  'Data Structures & Algorithms',
  'Gemini API',
  'OpenAI API',
]);

export function createSkillSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCompactSkillLabel(name: string): string {
  return COMPACT_LABELS[name] ?? name;
}

export function classifySkillProminence(
  skill: SkillCategory['skills'][number]
): { prominence: SkillProminence; visualWeight: number } {
  const isPrimary =
    CORE_ANCHOR_SKILLS.has(skill.name) ||
    Boolean(skill.level) ||
    (skill.inProjects?.length ?? 0) >= 2;

  return isPrimary
    ? { prominence: 'primary', visualWeight: 1.18 }
    : { prominence: 'supporting', visualWeight: 0.9 };
}

/**
 * Generates evenly distributed unit vectors across a full 3D sphere using the
 * Golden-Angle Fibonacci spiral so technologies themselves trace a crisp
 * spherical silhouette from every viewing angle.
 */
export function computeFibonacciSpherePoint(
  index: number,
  total: number
): [number, number, number] {
  if (total <= 1) return [0, 0, 1];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  // Distribute smoothly across [-0.90, 0.90] so top & bottom poles also carry nodes
  const t = (index + 0.5) / total;
  const y = 0.9 - t * 1.8;
  const ringRadius = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = goldenAngle * index;
  const x = Math.cos(theta) * ringRadius;
  const z = Math.sin(theta) * ringRadius;
  return [x, y, z];
}

export function unitVectorToLatLon(
  unitPos: [number, number, number]
): { latDeg: number; lonDeg: number } {
  const [x, y, z] = unitPos;
  const clampedY = Math.max(-1, Math.min(1, y));
  const latDeg = Math.round((Math.asin(clampedY) * 180) / Math.PI);
  const lonDeg = Math.round((Math.atan2(x, z) * 180) / Math.PI);
  return { latDeg, lonDeg };
}

/**
 * Interleaves all exact skills from PORTFOLIO_DATA across categories before
 * mapping onto spherical coordinates so every view angle shows a balanced mix
 * of prominent and supporting technologies.
 */
export function buildGlobeSkillNodes(
  categories: SkillCategory[] = PORTFOLIO_DATA.skillCategories,
  globeRadius = 2.42
): GlobeSkillNode[] {
  const queues = categories.map((cat) =>
    cat.skills.map((skill) => ({
      cat,
      skill,
    }))
  );

  const interleaved: {
    cat: SkillCategory;
    skill: SkillCategory['skills'][number];
  }[] = [];

  let remaining = true;
  let cursor = 0;
  while (remaining) {
    remaining = false;
    for (const q of queues) {
      if (cursor < q.length) {
        interleaved.push(q[cursor]);
        remaining = true;
      }
    }
    cursor += 1;
  }

  const total = interleaved.length;
  return interleaved.map(({ cat, skill }, idx) => {
    const categoryKey = cat.title as Exclude<GlobeCategoryId, 'All'>;
    const visual =
      GLOBE_CATEGORY_VISUALS[categoryKey] ?? GLOBE_CATEGORY_VISUALS.Languages;
    const unitPos = computeFibonacciSpherePoint(idx, total);
    const { latDeg, lonDeg } = unitVectorToLatLon(unitPos);
    const { prominence, visualWeight } = classifySkillProminence(skill);

    return {
      id: createSkillSlug(skill.name),
      name: skill.name,
      shortLabel: getCompactSkillLabel(skill.name),
      category: categoryKey,
      categoryShort: visual.shortLabel,
      categoryDescription: cat.description,
      level: skill.level,
      inProjects: skill.inProjects ? [...skill.inProjects] : [],
      prominence,
      visualWeight,
      accentHex: visual.accentHex,
      glowHex: visual.glowHex,
      unitPos,
      surfacePos: [
        unitPos[0] * globeRadius,
        unitPos[1] * globeRadius,
        unitPos[2] * globeRadius,
      ],
      latDeg,
      lonDeg,
    };
  });
}

/**
 * Builds the interconnected geodesic spherical network directly between the
 * skill nodes themselves:
 *  - 'structural' edges link every technology to its k nearest neighbors in 3D
 *    space, constructing a genuine hollow geodesic sphere silhouette.
 *  - 'discipline' edges link nearest peers within the same engineering category.
 */
export function buildSphericalMeshConnections(
  nodes: GlobeSkillNode[],
  neighborsPerNode = 3
): GlobeConnectionEdge[] {
  const edges: GlobeConnectionEdge[] = [];
  const seenPairs = new Set<string>();

  const addEdge = (
    a: GlobeSkillNode,
    b: GlobeSkillNode,
    kind: 'structural' | 'discipline'
  ) => {
    const pairKey = a.id < b.id ? `${a.id}::${b.id}` : `${b.id}::${a.id}`;
    if (seenPairs.has(pairKey)) return;
    seenPairs.add(pairKey);
    edges.push({
      id: pairKey,
      fromId: a.id,
      toId: b.id,
      kind,
      category: a.category,
      accentHex: kind === 'discipline' ? a.accentHex : '#60A5FA',
    });
  };

  // 1. Geodesic k-nearest-neighbor structural triangulation across all skills
  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];
    const ranked: { node: GlobeSkillNode; distSq: number }[] = [];
    for (let j = 0; j < nodes.length; j += 1) {
      if (i === j) continue;
      const b = nodes[j];
      const dx = a.unitPos[0] - b.unitPos[0];
      const dy = a.unitPos[1] - b.unitPos[1];
      const dz = a.unitPos[2] - b.unitPos[2];
      ranked.push({ node: b, distSq: dx * dx + dy * dy + dz * dz });
    }
    ranked.sort((p, q) => p.distSq - q.distSq);
    const limit = Math.min(neighborsPerNode, ranked.length);
    for (let k = 0; k < limit; k += 1) {
      const target = ranked[k].node;
      addEdge(
        a,
        target,
        a.category === target.category ? 'discipline' : 'structural'
      );
    }
  }

  // 2. Ensure every skill also has at least one same-category peer link
  const byCategory = new Map<Exclude<GlobeCategoryId, 'All'>, GlobeSkillNode[]>();
  for (const node of nodes) {
    const list = byCategory.get(node.category) ?? [];
    list.push(node);
    byCategory.set(node.category, list);
  }

  for (const group of byCategory.values()) {
    if (group.length < 2) continue;
    for (let i = 0; i < group.length; i += 1) {
      const a = group[i];
      let best: GlobeSkillNode | null = null;
      let bestDistSq = Infinity;
      for (let j = 0; j < group.length; j += 1) {
        if (i === j) continue;
        const b = group[j];
        const dx = a.unitPos[0] - b.unitPos[0];
        const dy = a.unitPos[1] - b.unitPos[1];
        const dz = a.unitPos[2] - b.unitPos[2];
        const dSq = dx * dx + dy * dy + dz * dz;
        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          best = b;
        }
      }
      if (best) addEdge(a, best, 'discipline');
    }
  }

  return edges;
}

/**
 * Returns the list of connected neighboring skills directly linked to a given
 * skill node on the spherical web.
 */
export function getConnectedSkillNeighbors(
  skillId: string,
  nodes: GlobeSkillNode[],
  edges: GlobeConnectionEdge[]
): GlobeSkillNode[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const result: GlobeSkillNode[] = [];
  const seen = new Set<string>();
  for (const edge of edges) {
    let peerId: string | null = null;
    if (edge.fromId === skillId) peerId = edge.toId;
    else if (edge.toId === skillId) peerId = edge.fromId;
    if (peerId && !seen.has(peerId)) {
      seen.add(peerId);
      const peer = nodeMap.get(peerId);
      if (peer) result.push(peer);
    }
  }
  return result;
}

/**
 * Computes front/back hemisphere opacity, perspective scale, and picking
 * eligibility for a hollow skill-constructed sphere (no opaque planet core).
 * Front-facing nodes shine crisply; back-facing nodes softly recede into depth.
 */
export function computeNodeDepthMetrics(
  facingDot: number,
  isHighlighted: boolean,
  isDimmedByFilter: boolean,
  visualWeight = 1.0
): NodeDepthMetrics {
  const interactive = facingDot > -0.08;

  // Smooth depth falloff from front hemisphere (+0.45) to back hemisphere (-0.45)
  const t = Math.max(0, Math.min(1, (facingDot + 0.42) / 0.84));
  const smooth = t * t * (3 - 2 * t);

  let opacity = 0.12 + smooth * 0.88;
  if (isDimmedByFilter) {
    opacity *= 0.2;
  }
  if (isHighlighted) {
    opacity = 1;
  }

  // Depth-attenuated scale multiplied by technology prominence weight
  const depthScale = (0.64 + smooth * 0.36) * visualWeight;
  const scaleFactor = isHighlighted
    ? depthScale * 1.24
    : isDimmedByFilter
      ? depthScale * 0.84
      : depthScale;

  return {
    opacity: Number(opacity.toFixed(3)),
    scaleFactor: Number(scaleFactor.toFixed(3)),
    interactive,
  };
}

/**
 * Computes target globe Euler (rotX, rotY) that rotates a skill's spherical
 * coordinate directly to face the viewer (+Z axis).
 */
export function computeTargetRotationForNode(
  unitPos: [number, number, number]
): { rotX: number; rotY: number } {
  const [x, y, z] = unitPos;
  const rotY = -Math.atan2(x, z);
  const horiz = Math.sqrt(x * x + z * z);
  const rotX = Math.max(-0.85, Math.min(0.85, Math.atan2(y, horiz)));
  return { rotX, rotY };
}

export function formatSphericalCoords(latDeg: number, lonDeg: number): string {
  const latDir = latDeg >= 0 ? 'N' : 'S';
  const lonDir = lonDeg >= 0 ? 'E' : 'W';
  return `${Math.abs(latDeg)}°${latDir} · ${Math.abs(lonDeg)}°${lonDir}`;
}

export function filterGlobeNodesByCategory(
  nodes: GlobeSkillNode[],
  category: GlobeCategoryId
): GlobeSkillNode[] {
  if (category === 'All') return nodes;
  return nodes.filter((node) => node.category === category);
}
