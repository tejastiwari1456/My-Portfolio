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

export interface GlobeConnectionArc {
  id: string;
  fromId: string;
  toId: string;
  category: Exclude<GlobeCategoryId, 'All'>;
  accentHex: string;
}

export interface NodeDepthMetrics {
  /** 0.0 (far back) to 1.0 (facing camera) */
  opacity: number;
  /** Visual scale factor based on front-facing alignment */
  scaleFactor: number;
  /** Whether the node is on the interactive front hemisphere */
  interactive: boolean;
}

export const GLOBE_CATEGORY_VISUALS: Record<
  Exclude<GlobeCategoryId, 'All'>,
  GlobeCategoryVisual
> = {
  Languages: {
    id: 'Languages',
    shortLabel: 'Languages',
    accentHex: '#3B82F6',
    glowHex: '#60A5FA',
    badgeBg: 'rgba(37, 99, 235, 0.16)',
    badgeText: '#93C5FD',
    badgeBorder: 'rgba(59, 130, 246, 0.4)',
  },
  'Frontend Development': {
    id: 'Frontend Development',
    shortLabel: 'Frontend',
    accentHex: '#06B6D4',
    glowHex: '#22D3EE',
    badgeBg: 'rgba(6, 182, 212, 0.16)',
    badgeText: '#67E8F9',
    badgeBorder: 'rgba(6, 182, 212, 0.4)',
  },
  'Backend Development': {
    id: 'Backend Development',
    shortLabel: 'Backend',
    accentHex: '#6366F1',
    glowHex: '#818CF8',
    badgeBg: 'rgba(99, 102, 241, 0.16)',
    badgeText: '#A5B4FC',
    badgeBorder: 'rgba(99, 102, 241, 0.4)',
  },
  Databases: {
    id: 'Databases',
    shortLabel: 'Databases',
    accentHex: '#F59E0B',
    glowHex: '#FBBF24',
    badgeBg: 'rgba(245, 158, 11, 0.16)',
    badgeText: '#FCD34D',
    badgeBorder: 'rgba(245, 158, 11, 0.4)',
  },
  'AI Integration & APIs': {
    id: 'AI Integration & APIs',
    shortLabel: 'AI & APIs',
    accentHex: '#A855F7',
    glowHex: '#C084FC',
    badgeBg: 'rgba(168, 85, 247, 0.16)',
    badgeText: '#D8B4FE',
    badgeBorder: 'rgba(168, 85, 247, 0.4)',
  },
  'Core CS Concepts': {
    id: 'Core CS Concepts',
    shortLabel: 'Core CS',
    accentHex: '#10B981',
    glowHex: '#34D399',
    badgeBg: 'rgba(16, 185, 129, 0.16)',
    badgeText: '#6EE7B7',
    badgeBorder: 'rgba(16, 185, 129, 0.4)',
  },
  'Tools & Platforms': {
    id: 'Tools & Platforms',
    shortLabel: 'Tools',
    accentHex: '#F43F5E',
    glowHex: '#FB7185',
    badgeBg: 'rgba(244, 63, 94, 0.16)',
    badgeText: '#FDA4AF',
    badgeBorder: 'rgba(244, 63, 94, 0.4)',
  },
};

const COMPACT_LABELS: Record<string, string> = {
  'Data Structures & Algorithms': 'DSA',
  'Object-Oriented Programming (OOP)': 'OOP',
  'Database Management Systems (DBMS)': 'DBMS',
  'Operating Systems (OS)': 'OS',
  'JWT Authentication': 'JWT Auth',
  'Session Management': 'Sessions',
  'AI Evaluation Workflows': 'AI Workflows',
  'MySQL Workbench': 'MySQL WB',
  'Cloudflare Pages': 'Cloudflare',
  'Problem Solving': 'Problem Solving',
};

export function createSkillSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCompactSkillLabel(name: string): string {
  return COMPACT_LABELS[name] ?? name;
}

/**
 * Generates evenly distributed unit vectors on a sphere using the Golden-Angle
 * Fibonacci spiral, clamped slightly away from the exact +/-Y poles so labels
 * never bunch at the polar axis hubs.
 */
export function computeFibonacciSpherePoint(
  index: number,
  total: number
): [number, number, number] {
  if (total <= 1) return [0, 0, 1];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  // Spread y in [-0.84, 0.84] to leave clean room for north/south polar rings
  const t = total === 1 ? 0.5 : index / (total - 1);
  const y = 0.84 - t * 1.68;
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
 * Interleaves skills across categories in round-robin order before assigning
 * Fibonacci coordinates so every hemisphere of the globe shows a balanced mix
 * of Languages, Frontend, Backend, Databases, AI, Core CS, and Tools.
 */
export function buildGlobeSkillNodes(
  categories: SkillCategory[] = PORTFOLIO_DATA.skillCategories,
  globeRadius = 2.25
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

    return {
      id: createSkillSlug(skill.name),
      name: skill.name,
      shortLabel: getCompactSkillLabel(skill.name),
      category: categoryKey,
      categoryShort: visual.shortLabel,
      categoryDescription: cat.description,
      level: skill.level,
      inProjects: skill.inProjects ? [...skill.inProjects] : [],
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
 * Generates clean constellation arcs linking skills that share the same
 * engineering category (nearest neighbors in 3D space so arcs stay graceful
 * rather than cutting wildly across the globe).
 */
export function buildCategoryConnectionArcs(
  nodes: GlobeSkillNode[]
): GlobeConnectionArc[] {
  const byCategory = new Map<Exclude<GlobeCategoryId, 'All'>, GlobeSkillNode[]>();
  for (const node of nodes) {
    const list = byCategory.get(node.category) ?? [];
    list.push(node);
    byCategory.set(node.category, list);
  }

  const arcs: GlobeConnectionArc[] = [];
  const seenPairs = new Set<string>();

  for (const [category, group] of byCategory.entries()) {
    if (group.length < 2) continue;
    for (let i = 0; i < group.length; i += 1) {
      const a = group[i];
      // Connect each node to its closest peer within the same category
      let bestIdx = -1;
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
          bestIdx = j;
        }
      }
      if (bestIdx >= 0) {
        const b = group[bestIdx];
        const pairKey = a.id < b.id ? `${a.id}::${b.id}` : `${b.id}::${a.id}`;
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          arcs.push({
            id: pairKey,
            fromId: a.id,
            toId: b.id,
            category,
            accentHex: a.accentHex,
          });
        }
      }
    }
  }

  return arcs;
}

/**
 * Computes front/back hemisphere opacity, depth scale, and raycast eligibility
 * from the dot product of the node's world-space surface normal and the
 * normalized vector pointing toward the camera.
 */
export function computeNodeDepthMetrics(
  facingDot: number,
  isHighlighted: boolean,
  isDimmedByFilter: boolean
): NodeDepthMetrics {
  const interactive = facingDot > -0.06;

  // Smooth hermite transition across the planet's limb (-0.28 -> +0.28)
  const t = Math.max(0, Math.min(1, (facingDot + 0.28) / 0.56));
  const smooth = t * t * (3 - 2 * t);

  let opacity = 0.1 + smooth * 0.9;
  if (isDimmedByFilter) {
    opacity *= 0.22;
  }
  if (isHighlighted) {
    opacity = Math.max(opacity, 0.96);
  }

  const baseScale = 0.72 + smooth * 0.28;
  const scaleFactor = isHighlighted
    ? baseScale * 1.24
    : isDimmedByFilter
      ? baseScale * 0.84
      : baseScale;

  return {
    opacity: Number(opacity.toFixed(3)),
    scaleFactor: Number(scaleFactor.toFixed(3)),
    interactive,
  };
}

/**
 * Computes the target globe Euler (rotX, rotY) that brings a skill node's
 * local unit position directly toward the viewer (+Z axis).
 */
export function computeTargetRotationForNode(
  unitPos: [number, number, number]
): { rotX: number; rotY: number } {
  const [x, y, z] = unitPos;
  // Rotating around Y by -atan2(x, z) brings (x, z) onto +Z
  const rotY = -Math.atan2(x, z);
  const horiz = Math.sqrt(x * x + z * z);
  // Tilting around X brings y toward the equatorial center (+Z)
  const rotX = Math.max(-0.95, Math.min(0.95, Math.atan2(y, horiz)));
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
