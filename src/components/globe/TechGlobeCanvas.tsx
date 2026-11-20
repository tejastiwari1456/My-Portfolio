import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  GlobeCategoryId,
  GlobeConnectionEdge,
  GlobeSkillNode,
  computeNodeDepthMetrics,
  computeTargetRotationForNode,
} from '../../utils/techGlobeLogic';
import {
  createRadialGlowTexture,
  createSkillHologramTexture,
} from './techGlobeTextures';

export interface HoveredSkillPayload {
  node: GlobeSkillNode;
  screenX: number;
  screenY: number;
}

interface TechGlobeCanvasProps {
  nodes: GlobeSkillNode[];
  edges: GlobeConnectionEdge[];
  activeCategory: GlobeCategoryId;
  selectedSkillId: string | null;
  autoRotate: boolean;
  reducedMotion: boolean;
  resetTrigger: number;
  onHoverSkill: (payload: HoveredSkillPayload | null) => void;
  onSelectSkill: (node: GlobeSkillNode | null) => void;
  onDraggingChange: (dragging: boolean) => void;
  onWebGLUnavailable: () => void;
}

interface SkillRuntimeNode {
  data: GlobeSkillNode;
  vertexGroup: THREE.Group;
  crystalMesh: THREE.Mesh;
  crystalMaterial: THREE.MeshStandardMaterial;
  ringMesh: THREE.Mesh;
  ringMaterial: THREE.MeshBasicMaterial;
  flareSprite: THREE.Sprite;
  flareMaterial: THREE.SpriteMaterial;
  labelSprite: THREE.Sprite;
  labelMaterial: THREE.SpriteMaterial;
  hitProxy: THREE.Mesh;
  unitNormalLocal: THREE.Vector3;
  currentScale: number;
}

interface EdgeRuntime {
  data: GlobeConnectionEdge;
  midUnitLocal: THREE.Vector3;
  line: THREE.Line;
  material: THREE.LineBasicMaterial;
}

// Pre-allocated scratch helpers (zero GC inside render loop)
const _vecA = new THREE.Vector3();
const _worldNormal = new THREE.Vector3();
const _toCamera = new THREE.Vector3();
const _nodeWorldPos = new THREE.Vector3();
const _globeWorldQuat = new THREE.Quaternion();
const _zAxis = new THREE.Vector3(0, 0, 1);
const _pointerNdc = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

function detectSoftwareWebGL(): { supported: boolean; isSoftwareGl: boolean } {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) {
      return { supported: false, isSoftwareGl: true };
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl =
      /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return { supported: true, isSoftwareGl };
  } catch {
    return { supported: false, isSoftwareGl: true };
  }
}

/**
 * Generates ultra-fine dashed meridian and equatorial reference circles
 * floating in the hollow lattice to accentuate the spherical silhouette
 * without creating any solid surface.
 */
function buildHollowOrbitalGuideGeometry(radius: number): THREE.BufferGeometry {
  const pts: number[] = [];
  const segments = 96;

  // 3 orthogonal delicate great circles (equator + 2 prime meridians)
  for (let i = 0; i < segments; i += 2) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;

    // Equatorial dotted ring
    pts.push(
      Math.cos(a0) * radius,
      0,
      Math.sin(a0) * radius,
      Math.cos(a1) * radius,
      0,
      Math.sin(a1) * radius
    );

    // Prime meridian 1
    pts.push(
      Math.cos(a0) * radius,
      Math.sin(a0) * radius,
      0,
      Math.cos(a1) * radius,
      Math.sin(a1) * radius,
      0
    );

    // Prime meridian 2
    pts.push(
      0,
      Math.sin(a0) * radius,
      Math.cos(a0) * radius,
      0,
      Math.sin(a1) * radius,
      Math.cos(a1) * radius
    );
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

export const TechGlobeCanvas: React.FC<TechGlobeCanvasProps> = ({
  nodes,
  edges,
  activeCategory,
  selectedSkillId,
  autoRotate,
  reducedMotion,
  resetTrigger,
  onHoverSkill,
  onSelectSkill,
  onDraggingChange,
  onWebGLUnavailable,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync live props into refs so WebGLRenderer mounts once and never resets
  const activeCategoryRef = useRef(activeCategory);
  const selectedSkillIdRef = useRef(selectedSkillId);
  const autoRotateRef = useRef(autoRotate);
  const reducedMotionRef = useRef(reducedMotion);
  const onHoverSkillRef = useRef(onHoverSkill);
  const onSelectSkillRef = useRef(onSelectSkill);
  const onDraggingChangeRef = useRef(onDraggingChange);
  const onWebGLUnavailableRef = useRef(onWebGLUnavailable);
  const requestExternalRenderRef = useRef<(() => void) | null>(null);
  const focusNodeRef = useRef<((skillId: string | null) => void) | null>(null);
  const resetViewFnRef = useRef<(() => void) | null>(null);

  activeCategoryRef.current = activeCategory;
  selectedSkillIdRef.current = selectedSkillId;
  autoRotateRef.current = autoRotate;
  reducedMotionRef.current = reducedMotion;
  onHoverSkillRef.current = onHoverSkill;
  onSelectSkillRef.current = onSelectSkill;
  onDraggingChangeRef.current = onDraggingChange;
  onWebGLUnavailableRef.current = onWebGLUnavailable;

  useEffect(() => {
    focusNodeRef.current?.(selectedSkillId);
    requestExternalRenderRef.current?.();
  }, [selectedSkillId]);

  useEffect(() => {
    requestExternalRenderRef.current?.();
  }, [activeCategory, autoRotate, reducedMotion]);

  useEffect(() => {
    if (resetTrigger > 0) {
      resetViewFnRef.current?.();
    }
  }, [resetTrigger]);

  useEffect(() => {
    const mountEl = containerRef.current;
    if (!mountEl) return;

    const { supported, isSoftwareGl } = detectSoftwareWebGL();
    if (!supported) {
      onWebGLUnavailableRef.current();
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      onWebGLUnavailableRef.current();
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.shadowMap.enabled = false;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'pan-y';
    renderer.domElement.setAttribute(
      'aria-label',
      'Interactive 3D Technology Skill Sphere'
    );
    mountEl.appendChild(renderer.domElement);

    const width = Math.max(mountEl.clientWidth, 320);
    const height = Math.max(mountEl.clientHeight, 420);
    renderer.setSize(width, height, false);

    // Scene, camera & deep-space depth fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040814, 0.032);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 60);
    const getResponsiveCameraZ = (w: number) =>
      w < 520 ? 11.2 : w < 900 ? 9.4 : 8.55;
    camera.position.set(0, 0.14, getResponsiveCameraZ(width));
    camera.lookAt(0, 0.12, 0);

    // Procedural Studio PBR Environment Map on every device
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Subtle futuristic blue, cyan, and violet studio lighting rig
    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x1e1b4b, 1.0);
    scene.add(hemiLight);

    const cyanKey = new THREE.DirectionalLight(0xbae6fd, 1.7);
    cyanKey.position.set(6.0, 4.5, 5.5);
    scene.add(cyanKey);

    const violetRim = new THREE.DirectionalLight(0x8b5cf6, 1.45);
    violetRim.position.set(-6.0, 2.0, -4.5);
    scene.add(violetRim);

    const blueUnder = new THREE.DirectionalLight(0x3b82f6, 0.75);
    blueUnder.position.set(0, -5.5, 3.0);
    scene.add(blueUnder);

    // Disposal trackers
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];
    const texturesToDispose: THREE.Texture[] = [];

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const SPHERE_RADIUS = 2.42;
    const SPHERE_CENTER_Y = 0.22;

    // Master rotating hollow skill-sphere group (NO solid planet sphere underneath!)
    const skillSphereGroup = new THREE.Group();
    skillSphereGroup.position.set(0, SPHERE_CENTER_Y, 0);
    skillSphereGroup.rotation.set(0.16, -0.35, 0);
    scene.add(skillSphereGroup);

    // 1. Ethereal hollow inner volumetric light aura (soft light haze, not a solid core)
    const coreAuraTex = createRadialGlowTexture(
      'rgba(56, 189, 248, 0.24)',
      'rgba(99, 102, 241, 0.14)',
      'rgba(4, 8, 20, 0)'
    );
    texturesToDispose.push(coreAuraTex);
    const coreAuraMat = new THREE.SpriteMaterial({
      map: coreAuraTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    materialsToDispose.push(coreAuraMat);
    const coreAuraSprite = new THREE.Sprite(coreAuraMat);
    coreAuraSprite.position.set(0, SPHERE_CENTER_Y, 0);
    coreAuraSprite.scale.set(5.4, 5.4, 1);
    coreAuraSprite.renderOrder = -5;
    scene.add(coreAuraSprite);

    // 2. Spherical shell geometric micro-particles (380 faceted crystal nodes tracing the exact spherical silhouette)
    const shellParticleCount = 380;
    const shellParticleGeo = new THREE.OctahedronGeometry(0.022, 0);
    const shellParticleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.65,
      metalness: 0.75,
      roughness: 0.22,
      transparent: true,
      opacity: 0.78,
    });
    geometriesToDispose.push(shellParticleGeo);
    materialsToDispose.push(shellParticleMat);

    const shellParticles = new THREE.InstancedMesh(
      shellParticleGeo,
      shellParticleMat,
      shellParticleCount
    );
    const pDummy = new THREE.Object3D();
    const shellPalette = [
      new THREE.Color(0x38bdf8), // cyan
      new THREE.Color(0x60a5fa), // electric blue
      new THREE.Color(0x818cf8), // indigo-blue
      new THREE.Color(0xa78bfa), // violet
    ];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < shellParticleCount; i += 1) {
      const y = 1 - ((i + 0.5) / shellParticleCount) * 2;
      const ringR = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const rJitter = SPHERE_RADIUS - 0.04 + ((i * 19) % 10) * 0.008;
      pDummy.position.set(
        Math.cos(theta) * ringR * rJitter,
        y * rJitter,
        Math.sin(theta) * ringR * rJitter
      );
      pDummy.rotation.set(i * 0.37, i * 0.51, i * 0.23);
      const scale = i % 7 === 0 ? 1.35 : 0.75 + ((i * 13) % 10) * 0.045;
      pDummy.scale.setScalar(scale);
      pDummy.updateMatrix();
      shellParticles.setMatrixAt(i, pDummy.matrix);
      shellParticles.setColorAt(i, shellPalette[i % shellPalette.length]);
    }
    shellParticles.instanceMatrix.needsUpdate = true;
    if (shellParticles.instanceColor) {
      shellParticles.instanceColor.needsUpdate = true;
    }
    shellParticles.computeBoundingSphere();
    skillSphereGroup.add(shellParticles);

    // 3. Delicate dashed orbital reference rings (whisper-thin spherical contour accents)
    const guideGeo = buildHollowOrbitalGuideGeometry(SPHERE_RADIUS + 0.02);
    const guideMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
    });
    geometriesToDispose.push(guideGeo);
    materialsToDispose.push(guideMat);
    skillSphereGroup.add(new THREE.LineSegments(guideGeo, guideMat));

    // 4. Outer tilted energy orbit ring (ultra-delicate framing accent)
    const haloRingGeo = new THREE.TorusGeometry(SPHERE_RADIUS + 0.58, 0.006, 8, 96);
    const haloRingMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.24,
    });
    geometriesToDispose.push(haloRingGeo);
    materialsToDispose.push(haloRingMat);
    const haloRingMesh = new THREE.Mesh(haloRingGeo, haloRingMat);
    haloRingMesh.position.set(0, SPHERE_CENTER_Y, 0);
    haloRingMesh.rotation.set(Math.PI / 2.25, 0.3, 0.15);
    scene.add(haloRingMesh);

    // 5. Ambient deep-space starlight particles surrounding the sphere
    const starCount = 240;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const u = (i + 0.5) / starCount;
      const theta = i * goldenAngle;
      const y = 1 - 2 * u;
      const rPlane = Math.sqrt(Math.max(0, 1 - y * y));
      const shellR = 6.2 + ((i * 41) % 100) * 0.065;
      starPositions[i * 3] = Math.cos(theta) * rPlane * shellR;
      starPositions[i * 3 + 1] = y * shellR;
      starPositions[i * 3 + 2] = Math.sin(theta) * rPlane * shellR;

      const c = shellPalette[i % shellPalette.length];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const nodeFlareTex = createRadialGlowTexture();
    texturesToDispose.push(nodeFlareTex);

    const starMat = new THREE.PointsMaterial({
      size: 0.12,
      map: nodeFlareTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    geometriesToDispose.push(starGeo);
    materialsToDispose.push(starMat);
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 6. Interconnected Geodesic Skill Web (curved glowing filaments directly linking the 32 technologies)
    const nodeLookup = new Map(nodes.map((n) => [n.id, n]));
    const edgeRuntimes: EdgeRuntime[] = [];

    for (const edge of edges) {
      const fromNode = nodeLookup.get(edge.fromId);
      const toNode = nodeLookup.get(edge.toId);
      if (!fromNode || !toNode) continue;

      const pStart = new THREE.Vector3(...fromNode.surfacePos);
      const pEnd = new THREE.Vector3(...toNode.surfacePos);
      const midUnit = pStart.clone().add(pEnd).normalize();
      // Gently hug the exact spherical surface curvature so filaments sculpt the globe silhouette
      const pMid = midUnit.clone().multiplyScalar(SPHERE_RADIUS * 1.03);

      const curve = new THREE.QuadraticBezierCurve3(pStart, pMid, pEnd);
      const curvePts = curve.getPoints(16);
      const edgeGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
      const edgeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(edge.accentHex),
        transparent: true,
        opacity: edge.kind === 'discipline' ? 0.34 : 0.22,
        depthWrite: false,
      });
      geometriesToDispose.push(edgeGeo);
      materialsToDispose.push(edgeMat);

      const line = new THREE.Line(edgeGeo, edgeMat);
      skillSphereGroup.add(line);
      edgeRuntimes.push({
        data: edge,
        midUnitLocal: midUnit,
        line,
        material: edgeMat,
      });
    }

    // 7. 32 Skill Nodes (Composite crystal vertex + tangent halo ring + radial flare + floating borderless logo & name)
    const primaryCrystalGeo = new THREE.OctahedronGeometry(0.062, 0);
    const supportingCrystalGeo = new THREE.OctahedronGeometry(0.044, 0);
    const sharedRingGeo = new THREE.RingGeometry(0.088, 0.112, 24);
    const sharedHitGeo = new THREE.SphereGeometry(0.32, 10, 10);
    const sharedHitMat = new THREE.MeshBasicMaterial({ visible: false });
    geometriesToDispose.push(
      primaryCrystalGeo,
      supportingCrystalGeo,
      sharedRingGeo,
      sharedHitGeo
    );
    materialsToDispose.push(sharedHitMat);

    const runtimeNodes: SkillRuntimeNode[] = [];
    const hitProxies: THREE.Object3D[] = [];
    const proxyToNode = new Map<THREE.Object3D, SkillRuntimeNode>();

    for (const node of nodes) {
      const vertexGroup = new THREE.Group();
      const unitNormalLocal = new THREE.Vector3(...node.unitPos).normalize();
      const isPrimary = node.prominence === 'primary';

      // Faceted metallic glowing junction crystal at exact spherical vertex
      const crystalMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(node.glowHex),
        emissive: new THREE.Color(node.accentHex),
        emissiveIntensity: isPrimary ? 1.15 : 0.85,
        metalness: 0.82,
        roughness: 0.18,
        transparent: true,
        opacity: 0.95,
      });
      materialsToDispose.push(crystalMaterial);
      const crystalMesh = new THREE.Mesh(
        isPrimary ? primaryCrystalGeo : supportingCrystalGeo,
        crystalMaterial
      );
      crystalMesh.position.copy(unitNormalLocal).multiplyScalar(SPHERE_RADIUS);
      vertexGroup.add(crystalMesh);

      // Precision tangent orbital collar flush with the spherical surface
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.glowHex),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isPrimary ? 0.65 : 0.42,
        depthWrite: false,
      });
      materialsToDispose.push(ringMaterial);
      const ringMesh = new THREE.Mesh(sharedRingGeo, ringMaterial);
      ringMesh.position.copy(unitNormalLocal).multiplyScalar(SPHERE_RADIUS);
      ringMesh.quaternion.setFromUnitVectors(_zAxis, unitNormalLocal);
      vertexGroup.add(ringMesh);

      // Subtle glowing starlight flare centered on the vertex
      const flareMaterial = new THREE.SpriteMaterial({
        map: nodeFlareTex,
        color: new THREE.Color(node.glowHex),
        transparent: true,
        opacity: isPrimary ? 0.58 : 0.36,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      materialsToDispose.push(flareMaterial);
      const flareSprite = new THREE.Sprite(flareMaterial);
      flareSprite.position.copy(unitNormalLocal).multiplyScalar(SPHERE_RADIUS);
      const flareSize = isPrimary ? 0.42 : 0.28;
      flareSprite.scale.set(flareSize, flareSize, 1);
      vertexGroup.add(flareSprite);

      // Borderless floating holographic technology logo + skill name
      const holoTex = createSkillHologramTexture(node, maxAnisotropy);
      texturesToDispose.push(holoTex);
      const labelMaterial = new THREE.SpriteMaterial({
        map: holoTex,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });
      materialsToDispose.push(labelMaterial);

      const labelSprite = new THREE.Sprite(labelMaterial);
      labelSprite.position
        .copy(unitNormalLocal)
        .multiplyScalar(SPHERE_RADIUS + 0.18);
      labelSprite.scale.set(1.18, 0.315, 1);
      vertexGroup.add(labelSprite);

      // Raycasting proxy sphere for smooth hover & click picking
      const hitProxy = new THREE.Mesh(sharedHitGeo, sharedHitMat);
      hitProxy.position.copy(labelSprite.position);
      vertexGroup.add(hitProxy);

      skillSphereGroup.add(vertexGroup);

      const runtime: SkillRuntimeNode = {
        data: node,
        vertexGroup,
        crystalMesh,
        crystalMaterial,
        ringMesh,
        ringMaterial,
        flareSprite,
        flareMaterial,
        labelSprite,
        labelMaterial,
        hitProxy,
        unitNormalLocal,
        currentScale: node.visualWeight,
      };
      runtimeNodes.push(runtime);
      hitProxies.push(hitProxy);
      proxyToNode.set(hitProxy, runtime);
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Mutable interaction state (zero React state churn at 60fps)
    let isPointerDown = false;
    let didDrag = false;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let rotVelX = 0;
    let rotVelY = 0;
    let resumeAutoRotateAt = 0;
    let targetRotX: number | null = null;
    let targetRotY: number | null = null;
    let hoveredSkillId: string | null = null;
    let lastRaycastTime = 0;
    let isVisibleInViewport = true;
    let disposed = false;
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastTimeMs = performance.now();

    const normalizeAngleDelta = (current: number, target: number): number => {
      let diff = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (diff < -Math.PI) diff += Math.PI * 2;
      return current + diff;
    };

    const focusNodeById = (skillId: string | null) => {
      if (!skillId) {
        targetRotX = null;
        targetRotY = null;
        return;
      }
      const found = runtimeNodes.find((rn) => rn.data.id === skillId);
      if (!found) return;
      const { rotX, rotY } = computeTargetRotationForNode(found.data.unitPos);
      targetRotX = rotX;
      targetRotY = normalizeAngleDelta(skillSphereGroup.rotation.y, rotY);
      rotVelX = 0;
      rotVelY = 0;
    };
    focusNodeRef.current = focusNodeById;

    const resetView = () => {
      targetRotX = 0.16;
      targetRotY = normalizeAngleDelta(skillSphereGroup.rotation.y, -0.35);
      rotVelX = 0;
      rotVelY = 0;
      resumeAutoRotateAt = 0;
      requestRender();
    };
    resetViewFnRef.current = resetView;

    // Frame step: rotation kinematics, depth-based fading & filament highlighting
    const stepScene = (dt: number, nowMs: number) => {
      const clampedDt = Math.min(Math.max(dt, 0.001), 0.08);
      const selectedId = selectedSkillIdRef.current;
      const activeCat = activeCategoryRef.current;

      // 1. Apply focus damping, drag momentum, or controlled continuous rotation
      if (!isPointerDown) {
        if (targetRotX !== null && targetRotY !== null) {
          const dampK = 6.5;
          skillSphereGroup.rotation.x = THREE.MathUtils.damp(
            skillSphereGroup.rotation.x,
            targetRotX,
            dampK,
            clampedDt
          );
          skillSphereGroup.rotation.y = THREE.MathUtils.damp(
            skillSphereGroup.rotation.y,
            targetRotY,
            dampK,
            clampedDt
          );
          if (
            Math.abs(skillSphereGroup.rotation.x - targetRotX) < 0.004 &&
            Math.abs(skillSphereGroup.rotation.y - targetRotY) < 0.004
          ) {
            skillSphereGroup.rotation.x = targetRotX;
            skillSphereGroup.rotation.y = targetRotY;
            if (!selectedId) {
              targetRotX = null;
              targetRotY = null;
            }
          }
        } else {
          skillSphereGroup.rotation.y += rotVelY * clampedDt;
          skillSphereGroup.rotation.x = THREE.MathUtils.clamp(
            skillSphereGroup.rotation.x + rotVelX * clampedDt,
            -1.08,
            1.08
          );
          const friction = Math.exp(-5.0 * clampedDt);
          rotVelX *= friction;
          rotVelY *= friction;

          const canAutoRotate =
            autoRotateRef.current &&
            !reducedMotionRef.current &&
            !selectedId &&
            nowMs >= resumeAutoRotateAt;

          if (canAutoRotate) {
            // Slow smoothly while hovering a node so user can read/click effortlessly
            const speed = hoveredSkillId !== null ? 0.032 : 0.165;
            skillSphereGroup.rotation.y += speed * clampedDt;
          }
        }
      }

      if (!reducedMotionRef.current) {
        haloRingMesh.rotation.z += 0.05 * clampedDt;
        starField.rotation.y += 0.01 * clampedDt;
      }

      skillSphereGroup.updateMatrixWorld(true);
      skillSphereGroup.getWorldQuaternion(_globeWorldQuat);

      // Identify neighbors directly wired to the focused/hovered technology
      const focusId = selectedId ?? hoveredSkillId;
      const connectedToFocus = new Set<string>();
      if (focusId) {
        for (let i = 0; i < edgeRuntimes.length; i += 1) {
          const ed = edgeRuntimes[i].data;
          if (ed.fromId === focusId) connectedToFocus.add(ed.toId);
          else if (ed.toId === focusId) connectedToFocus.add(ed.fromId);
        }
      }

      // 2. Depth-based visibility, prominence weighting & hover highlight per skill node
      const baseSpriteW = 1.18;
      const baseSpriteH = 0.315;
      for (let i = 0; i < runtimeNodes.length; i += 1) {
        const rn = runtimeNodes[i];
        _worldNormal.copy(rn.unitNormalLocal).applyQuaternion(_globeWorldQuat);
        _nodeWorldPos
          .copy(_worldNormal)
          .multiplyScalar(SPHERE_RADIUS)
          .add(skillSphereGroup.position);
        _toCamera.copy(camera.position).sub(_nodeWorldPos).normalize();
        const facingDot = _worldNormal.dot(_toCamera);

        const isHighlighted =
          rn.data.id === hoveredSkillId || rn.data.id === selectedId;
        const isConnectedPeer = connectedToFocus.has(rn.data.id);
        const isDimmed =
          activeCat !== 'All' && rn.data.category !== activeCat;

        const metrics = computeNodeDepthMetrics(
          facingDot,
          isHighlighted,
          isDimmed,
          rn.data.visualWeight
        );

        rn.currentScale = THREE.MathUtils.damp(
          rn.currentScale,
          metrics.scaleFactor,
          10,
          clampedDt
        );

        rn.labelSprite.scale.set(
          baseSpriteW * rn.currentScale,
          baseSpriteH * rn.currentScale,
          1
        );

        const effectiveOpacity = isConnectedPeer
          ? Math.max(metrics.opacity, 0.78)
          : metrics.opacity;

        rn.labelMaterial.opacity = effectiveOpacity;
        rn.crystalMaterial.opacity = Math.min(1, effectiveOpacity + 0.12);
        rn.crystalMaterial.emissiveIntensity = isHighlighted
          ? 2.2
          : isConnectedPeer
            ? 1.45
            : rn.data.prominence === 'primary'
              ? 1.05
              : 0.72;
        rn.ringMaterial.opacity = isHighlighted
          ? 0.95
          : Math.min(0.85, effectiveOpacity * 0.72);
        rn.flareMaterial.opacity = isHighlighted
          ? 0.92
          : effectiveOpacity * (rn.data.prominence === 'primary' ? 0.52 : 0.32);

        // Rotate each crystal vertex gently for subtle jewel-like shimmer
        if (!reducedMotionRef.current) {
          rn.crystalMesh.rotation.y += 0.65 * clampedDt;
          rn.crystalMesh.rotation.x += 0.35 * clampedDt;
        }

        // Front & highlighted labels draw cleanly over deeper back-side nodes
        rn.labelSprite.renderOrder = isHighlighted
          ? 40
          : Math.round((facingDot + 1) * 14);
      }

      // 3. Depth-attenuate & highlight interconnected geodesic filaments
      for (let i = 0; i < edgeRuntimes.length; i += 1) {
        const er = edgeRuntimes[i];
        _worldNormal.copy(er.midUnitLocal).applyQuaternion(_globeWorldQuat);
        _nodeWorldPos
          .copy(_worldNormal)
          .multiplyScalar(SPHERE_RADIUS)
          .add(skillSphereGroup.position);
        _toCamera.copy(camera.position).sub(_nodeWorldPos).normalize();
        const dot = _worldNormal.dot(_toCamera);
        const depthFactor = Math.max(0.18, Math.min(1, (dot + 0.45) / 0.95));

        let targetOp = (er.data.kind === 'discipline' ? 0.34 : 0.21) * depthFactor;
        if (focusId) {
          if (er.data.fromId === focusId || er.data.toId === focusId) {
            targetOp = 0.92;
          } else {
            targetOp *= 0.32;
          }
        } else if (activeCat !== 'All') {
          const fromCat = nodeLookup.get(er.data.fromId)?.category;
          const toCat = nodeLookup.get(er.data.toId)?.category;
          if (fromCat === activeCat && toCat === activeCat) {
            targetOp = 0.74 * depthFactor;
          } else if (fromCat === activeCat || toCat === activeCat) {
            targetOp = 0.24 * depthFactor;
          } else {
            targetOp = 0.05;
          }
        }

        er.material.opacity = THREE.MathUtils.damp(
          er.material.opacity,
          targetOp,
          9,
          clampedDt
        );
      }
    };

    // Software-WebGL fenceSync frame pacing (prevents CPU starvation)
    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext();
      if (
        typeof WebGL2RenderingContext !== 'undefined' &&
        gl instanceof WebGL2RenderingContext
      ) {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function shouldLoopContinuously(): boolean {
      if (reducedMotionRef.current) return false;
      if (!isVisibleInViewport) return false;
      return true;
    }

    function requestRender() {
      if (disposed) return;
      if (shouldLoopContinuously()) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;
        const now = performance.now();
        const dt = (now - lastTimeMs) / 1000;
        lastTimeMs = now;
        stepScene(dt, now);
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty || targetRotX !== null || Math.abs(rotVelY) > 0.01) {
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }
    requestExternalRenderRef.current = requestRender;

    function tick() {
      if (disposed) return;
      if (!shouldLoopContinuously()) return;
      const now = performance.now();
      const dt = (now - lastTimeMs) / 1000;
      lastTimeMs = now;
      stepScene(dt, now);
      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    const pickSkillAtPointer = (
      clientX: number,
      clientY: number
    ): SkillRuntimeNode | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      _pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_pointerNdc, camera);
      const hits = _raycaster.intersectObjects(hitProxies, false);
      if (hits.length === 0) return null;

      skillSphereGroup.getWorldQuaternion(_globeWorldQuat);
      for (let i = 0; i < hits.length; i += 1) {
        const candidate = proxyToNode.get(hits[i].object);
        if (!candidate) continue;
        _worldNormal
          .copy(candidate.unitNormalLocal)
          .applyQuaternion(_globeWorldQuat);
        _nodeWorldPos
          .copy(_worldNormal)
          .multiplyScalar(SPHERE_RADIUS)
          .add(skillSphereGroup.position);
        _toCamera.copy(camera.position).sub(_nodeWorldPos).normalize();
        if (_worldNormal.dot(_toCamera) > -0.08) {
          return candidate;
        }
      }
      return null;
    };

    const emitHoverTooltip = (rn: SkillRuntimeNode | null) => {
      if (!rn) {
        if (hoveredSkillId !== null) {
          hoveredSkillId = null;
          renderer.domElement.style.cursor = isPointerDown ? 'grabbing' : 'grab';
          onHoverSkillRef.current(null);
          requestRender();
        }
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      rn.labelSprite.getWorldPosition(_vecA);
      _vecA.project(camera);
      const sx = ((_vecA.x + 1) / 2) * rect.width;
      const sy = (-(_vecA.y - 1) / 2) * rect.height;

      hoveredSkillId = rn.data.id;
      renderer.domElement.style.cursor = 'pointer';
      onHoverSkillRef.current({
        node: rn.data,
        screenX: sx,
        screenY: sy,
      });
      requestRender();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      isPointerDown = true;
      didDrag = false;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      rotVelX = 0;
      rotVelY = 0;
      targetRotX = null;
      targetRotY = null;
      renderer.domElement.setPointerCapture(e.pointerId);
      renderer.domElement.style.cursor = 'grabbing';
      onDraggingChangeRef.current(true);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isPointerDown) {
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        const totalDist = Math.hypot(
          e.clientX - pointerDownX,
          e.clientY - pointerDownY
        );
        if (totalDist > 5) {
          didDrag = true;
          if (hoveredSkillId !== null) {
            emitHoverTooltip(null);
          }
        }
        const sensitivity = 0.0062;
        skillSphereGroup.rotation.y += dx * sensitivity;
        skillSphereGroup.rotation.x = THREE.MathUtils.clamp(
          skillSphereGroup.rotation.x + dy * sensitivity,
          -1.08,
          1.08
        );
        rotVelY = dx * 0.22;
        rotVelX = dy * 0.16;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        requestRender();
        return;
      }

      const now = performance.now();
      if (now - lastRaycastTime < 40) return;
      lastRaycastTime = now;
      const hit = pickSkillAtPointer(e.clientX, e.clientY);
      emitHoverTooltip(hit);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      if (renderer.domElement.hasPointerCapture(e.pointerId)) {
        renderer.domElement.releasePointerCapture(e.pointerId);
      }
      onDraggingChangeRef.current(false);
      resumeAutoRotateAt = performance.now() + 1800;
      renderer.domElement.style.cursor = 'grab';

      if (!didDrag) {
        const hit = pickSkillAtPointer(e.clientX, e.clientY);
        if (hit) {
          onSelectSkillRef.current(hit.data);
          focusNodeById(hit.data.id);
        } else if (selectedSkillIdRef.current) {
          onSelectSkillRef.current(null);
          focusNodeById(null);
        }
      }
      requestRender();
    };

    const onPointerLeave = () => {
      if (!isPointerDown && hoveredSkillId !== null) {
        emitHoverTooltip(null);
      }
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      onWebGLUnavailableRef.current();
    };

    const onContextRestored = () => {
      requestRender();
    };

    const dom = renderer.domElement;
    dom.style.cursor = 'grab';
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('pointercancel', onPointerUp);
    dom.addEventListener('pointerleave', onPointerLeave);
    dom.addEventListener('webglcontextlost', onContextLost);
    dom.addEventListener('webglcontextrestored', onContextRestored);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || disposed) return;
      const nextW = Math.max(Math.round(entry.contentRect.width), 280);
      const nextH = Math.max(Math.round(entry.contentRect.height), 360);
      camera.aspect = nextW / nextH;
      camera.position.z = getResponsiveCameraZ(nextW);
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH, false);
      requestRender();
    });
    resizeObserver.observe(mountEl);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const nextVisible = Boolean(entry?.isIntersecting);
        const wasVisible = isVisibleInViewport;
        isVisibleInViewport = nextVisible;
        if (nextVisible && !wasVisible && shouldLoopContinuously()) {
          lastTimeMs = performance.now();
          tick();
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(mountEl);

    // Initial render
    stepScene(0.016, performance.now());
    renderer.render(scene, camera);
    if (shouldLoopContinuously()) {
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('pointercancel', onPointerUp);
      dom.removeEventListener('pointerleave', onPointerLeave);
      dom.removeEventListener('webglcontextlost', onContextLost);
      dom.removeEventListener('webglcontextrestored', onContextRestored);

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      texturesToDispose.forEach((t) => t.dispose());
      envRT.dispose();
      renderer.dispose();
      if (dom.parentNode === mountEl) {
        mountEl.removeChild(dom);
      }
      requestExternalRenderRef.current = null;
      focusNodeRef.current = null;
      resetViewFnRef.current = null;
    };
  }, [nodes, edges]);

  return (
    <div
      ref={containerRef}
      data-testid="tech-globe-canvas-mount"
      className="w-full h-full relative select-none"
    />
  );
};
