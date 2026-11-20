import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  GlobeCategoryId,
  GlobeConnectionArc,
  GlobeSkillNode,
  computeNodeDepthMetrics,
  computeTargetRotationForNode,
} from '../../utils/techGlobeLogic';
import {
  createPlanetSurfaceTextures,
  createRadialGlowTexture,
  createSkillBadgeTexture,
} from './techGlobeTextures';

export interface HoveredSkillPayload {
  node: GlobeSkillNode;
  screenX: number;
  screenY: number;
}

interface TechGlobeCanvasProps {
  nodes: GlobeSkillNode[];
  arcs: GlobeConnectionArc[];
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
  anchorGroup: THREE.Group;
  socketMesh: THREE.Mesh;
  socketMaterial: THREE.MeshBasicMaterial;
  stemMesh: THREE.Mesh;
  stemMaterial: THREE.MeshStandardMaterial;
  junctionMesh: THREE.Mesh;
  junctionMaterial: THREE.MeshBasicMaterial;
  badgeSprite: THREE.Sprite;
  badgeMaterial: THREE.SpriteMaterial;
  hitProxy: THREE.Mesh;
  unitNormalLocal: THREE.Vector3;
  currentScale: number;
}

interface ArcRuntime {
  data: GlobeConnectionArc;
  line: THREE.Line;
  material: THREE.LineBasicMaterial;
}

// Pre-allocated scratch math helpers (zero GC inside animation loop)
const _vecA = new THREE.Vector3();
const _worldNormal = new THREE.Vector3();
const _toCamera = new THREE.Vector3();
const _nodeWorldPos = new THREE.Vector3();
const _globeWorldQuat = new THREE.Quaternion();
const _zAxis = new THREE.Vector3(0, 0, 1);
const _yAxis = new THREE.Vector3(0, 1, 0);
const _pointerNdc = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

function detectSoftwareWebGL(): { supported: boolean; isSoftwareGl: boolean } {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      probeCanvas.getContext('webgl2') ||
      probeCanvas.getContext('webgl');
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

function buildLatLonGridGeometry(radius: number): THREE.BufferGeometry {
  const vertices: number[] = [];

  // Parallels (latitude rings)
  const latBands = [-60, -30, 0, 30, 60];
  const lonSteps = 72;
  for (const deg of latBands) {
    const lat = THREE.MathUtils.degToRad(deg);
    const y = Math.sin(lat) * radius;
    const ringR = Math.cos(lat) * radius;
    for (let i = 0; i < lonSteps; i += 1) {
      const a0 = (i / lonSteps) * Math.PI * 2;
      const a1 = ((i + 1) / lonSteps) * Math.PI * 2;
      vertices.push(
        Math.cos(a0) * ringR,
        y,
        Math.sin(a0) * ringR,
        Math.cos(a1) * ringR,
        y,
        Math.sin(a1) * ringR
      );
    }
  }

  // Meridians (longitude arcs)
  const meridianCount = 12;
  const latSteps = 48;
  for (let m = 0; m < meridianCount; m += 1) {
    const lon = (m / meridianCount) * Math.PI * 2;
    const cosL = Math.cos(lon);
    const sinL = Math.sin(lon);
    for (let j = 0; j < latSteps; j += 1) {
      const p0 = -Math.PI * 0.46 + (j / latSteps) * Math.PI * 0.92;
      const p1 = -Math.PI * 0.46 + ((j + 1) / latSteps) * Math.PI * 0.92;
      const r0 = Math.cos(p0) * radius;
      const r1 = Math.cos(p1) * radius;
      vertices.push(
        cosL * r0,
        Math.sin(p0) * radius,
        sinL * r0,
        cosL * r1,
        Math.sin(p1) * radius,
        sinL * r1
      );
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return geo;
}

export const TechGlobeCanvas: React.FC<TechGlobeCanvasProps> = ({
  nodes,
  arcs,
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

  // Sync live props into refs so WebGLRenderer mounts exactly once
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

  // Trigger focus or on-demand render when category/selection changes
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
    renderer.toneMappingExposure = 1.12;
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
      'Interactive 3D Technology Globe'
    );
    mountEl.appendChild(renderer.domElement);

    const width = Math.max(mountEl.clientWidth, 320);
    const height = Math.max(mountEl.clientHeight, 420);
    renderer.setSize(width, height, false);

    // Scene, camera & fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060b18, 0.028);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 60);
    const getResponsiveCameraZ = (w: number) =>
      w < 520 ? 10.6 : w < 900 ? 8.95 : 8.15;
    camera.position.set(0, 0.12, getResponsiveCameraZ(width));
    camera.lookAt(0, 0.08, 0);

    // Studio PBR environment reflection map on every device
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Balanced warm/cool 3-point lighting rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0b132b, 0.92);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.55);
    keyLight.position.set(7.5, 5.2, 4.2);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.45);
    rimLight.position.set(-6.0, 2.5, -5.0);
    scene.add(rimLight);

    const bottomFill = new THREE.DirectionalLight(0x6366f1, 0.52);
    bottomFill.position.set(0, -5.0, 2.0);
    scene.add(bottomFill);

    // Resource trackers for spotless disposal
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];
    const texturesToDispose: THREE.Texture[] = [];

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const GLOBE_RADIUS = 2.25;
    const GLOBE_CENTER_Y = 0.24;

    // Master rotating planetary assembly lifted cleanly above bottom dock
    const globeGroup = new THREE.Group();
    globeGroup.position.set(0, GLOBE_CENTER_Y, 0);
    globeGroup.rotation.set(0.18, -0.45, 0);
    scene.add(globeGroup);

    // 1. Primary textured planetary sphere
    const { albedoMap, bumpMap } = createPlanetSurfaceTextures(maxAnisotropy);
    texturesToDispose.push(albedoMap, bumpMap);

    const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 48, 36);
    const coreMat = new THREE.MeshPhysicalMaterial({
      map: albedoMap,
      bumpMap,
      bumpScale: 0.032,
      color: 0xffffff,
      roughness: 0.56,
      metalness: 0.3,
      clearcoat: 0.14,
      clearcoatRoughness: 0.42,
      emissive: new THREE.Color(0x0a1733),
      emissiveIntensity: 0.58,
    });
    geometriesToDispose.push(coreGeo);
    materialsToDispose.push(coreMat);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // 2. Precision latitude/longitude graticule wireframe
    const latLonGeo = buildLatLonGridGeometry(GLOBE_RADIUS + 0.018);
    const latLonMat = new THREE.LineBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.22,
    });
    geometriesToDispose.push(latLonGeo);
    materialsToDispose.push(latLonMat);
    globeGroup.add(new THREE.LineSegments(latLonGeo, latLonMat));

    // 3. Elevated geodesic icosahedral tech wireframe shell
    const icoBase = new THREE.IcosahedronGeometry(GLOBE_RADIUS + 0.045, 2);
    const icoEdgesGeo = new THREE.EdgesGeometry(icoBase);
    icoBase.dispose();
    const icoMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.11,
    });
    geometriesToDispose.push(icoEdgesGeo);
    materialsToDispose.push(icoMat);
    globeGroup.add(new THREE.LineSegments(icoEdgesGeo, icoMat));

    // 4. Composite brushed metallic north & south polar axis hubs
    const polarCapGeo = new THREE.CylinderGeometry(0.32, 0.42, 0.09, 28);
    const polarRingGeo = new THREE.TorusGeometry(0.46, 0.018, 12, 36);
    const metallicTrimMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.88,
      roughness: 0.2,
    });
    geometriesToDispose.push(polarCapGeo, polarRingGeo);
    materialsToDispose.push(metallicTrimMat);

    for (const sign of [1, -1]) {
      const cap = new THREE.Mesh(polarCapGeo, metallicTrimMat);
      cap.position.set(0, sign * (GLOBE_RADIUS - 0.01), 0);
      globeGroup.add(cap);

      const ring = new THREE.Mesh(polarRingGeo, metallicTrimMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, sign * (GLOBE_RADIUS + 0.03), 0);
      globeGroup.add(ring);
    }

    // 5. Tilted orbital rings + instanced micro-satellites (outer planetary frame)
    const orbitalRigGroup = new THREE.Group();
    orbitalRigGroup.position.set(0, GLOBE_CENTER_Y, 0);
    scene.add(orbitalRigGroup);

    const outerRingGeo = new THREE.TorusGeometry(3.05, 0.014, 12, 96);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.82,
      roughness: 0.24,
      transparent: true,
      opacity: 0.42,
    });
    geometriesToDispose.push(outerRingGeo);
    materialsToDispose.push(outerRingMat);
    const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRingMesh.rotation.set(Math.PI / 2.25, 0.24, 0.14);
    orbitalRigGroup.add(outerRingMesh);

    const secondaryRingGeo = new THREE.TorusGeometry(3.38, 0.008, 10, 96);
    const secondaryRingMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      metalness: 0.78,
      roughness: 0.28,
      transparent: true,
      opacity: 0.26,
    });
    geometriesToDispose.push(secondaryRingGeo);
    materialsToDispose.push(secondaryRingMat);
    const secondaryRingMesh = new THREE.Mesh(secondaryRingGeo, secondaryRingMat);
    secondaryRingMesh.rotation.set(Math.PI / 1.75, -0.42, -0.2);
    orbitalRigGroup.add(secondaryRingMesh);

    // Instanced orbital telemetry beads along outer ring
    const beadCount = 24;
    const beadGeo = new THREE.OctahedronGeometry(0.032, 0);
    const beadMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.25,
    });
    geometriesToDispose.push(beadGeo);
    materialsToDispose.push(beadMat);
    const beadInstances = new THREE.InstancedMesh(beadGeo, beadMat, beadCount);
    const beadDummy = new THREE.Object3D();
    for (let i = 0; i < beadCount; i += 1) {
      const ang = (i / beadCount) * Math.PI * 2;
      beadDummy.position.set(Math.cos(ang) * 3.05, Math.sin(ang) * 3.05, 0);
      const s = i % 3 === 0 ? 1.25 : 0.75;
      beadDummy.scale.setScalar(s);
      beadDummy.updateMatrix();
      beadInstances.setMatrixAt(i, beadDummy.matrix);
    }
    beadInstances.instanceMatrix.needsUpdate = true;
    beadInstances.computeBoundingSphere();
    outerRingMesh.add(beadInstances);

    // 6. Soft velvety atmospheric corona (tapers smoothly to 0.0 at outer silhouette)
    const atmoGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.19, 40, 32);
    const atmoMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(0x3b82f6) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float depthFactor = clamp(-dot(vNormal, vViewDir), 0.0, 1.0);
          float intensity = pow(depthFactor, 3.6) * 0.72;
          gl_FragColor = vec4(uColor, intensity);
        }
      `,
    });
    geometriesToDispose.push(atmoGeo);
    materialsToDispose.push(atmoMat);
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    atmoMesh.position.set(0, GLOBE_CENTER_Y, 0);
    scene.add(atmoMesh);

    // 7. Ambient deep-space starfield particles
    const starCount = 260;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const palette = [
      new THREE.Color(0xe2e8f0),
      new THREE.Color(0x93c5fd),
      new THREE.Color(0xa5b4fc),
      new THREE.Color(0x67e8f9),
    ];
    for (let i = 0; i < starCount; i += 1) {
      // Deterministic golden distribution across outer celestial shell
      const u = (i + 0.5) / starCount;
      const theta = i * 2.399963229728653;
      const y = 1 - 2 * u;
      const rPlane = Math.sqrt(Math.max(0, 1 - y * y));
      const shellR = 6.8 + ((i * 37) % 100) * 0.065;
      starPositions[i * 3] = Math.cos(theta) * rPlane * shellR;
      starPositions[i * 3 + 1] = y * shellR;
      starPositions[i * 3 + 2] = Math.sin(theta) * rPlane * shellR;

      const c = palette[i % palette.length];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const glowTex = createRadialGlowTexture();
    texturesToDispose.push(glowTex);

    const starMat = new THREE.PointsMaterial({
      size: 0.14,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    geometriesToDispose.push(starGeo);
    materialsToDispose.push(starMat);
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 8. Category constellation arcs curved gently over the planet surface
    const nodeLookup = new Map(nodes.map((n) => [n.id, n]));
    const arcRuntimes: ArcRuntime[] = [];

    for (const arc of arcs) {
      const fromNode = nodeLookup.get(arc.fromId);
      const toNode = nodeLookup.get(arc.toId);
      if (!fromNode || !toNode) continue;

      const pStart = new THREE.Vector3(...fromNode.surfacePos).multiplyScalar(1.015);
      const pEnd = new THREE.Vector3(...toNode.surfacePos).multiplyScalar(1.015);
      const chordDist = pStart.distanceTo(pEnd);
      const mid = pStart
        .clone()
        .add(pEnd)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(GLOBE_RADIUS + 0.14 + chordDist * 0.12);

      const curve = new THREE.QuadraticBezierCurve3(pStart, mid, pEnd);
      const curvePoints = curve.getPoints(24);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const arcMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(arc.accentHex),
        transparent: true,
        opacity: 0.24,
      });
      geometriesToDispose.push(arcGeo);
      materialsToDispose.push(arcMat);

      const line = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(line);
      arcRuntimes.push({ data: arc, line, material: arcMat });
    }

    // 9. 32 Skill Nodes physically anchored to the spherical surface
    const sharedSocketGeo = new THREE.RingGeometry(0.055, 0.088, 24);
    const sharedStemGeo = new THREE.CylinderGeometry(0.011, 0.016, 0.22, 8);
    const sharedJunctionGeo = new THREE.SphereGeometry(0.042, 12, 12);
    const sharedHitGeo = new THREE.SphereGeometry(0.28, 10, 10);
    const sharedHitMat = new THREE.MeshBasicMaterial({
      visible: false,
    });
    geometriesToDispose.push(
      sharedSocketGeo,
      sharedStemGeo,
      sharedJunctionGeo,
      sharedHitGeo
    );
    materialsToDispose.push(sharedHitMat);

    const runtimeNodes: SkillRuntimeNode[] = [];
    const hitProxies: THREE.Object3D[] = [];
    const proxyToNode = new Map<THREE.Object3D, SkillRuntimeNode>();

    for (const node of nodes) {
      const anchorGroup = new THREE.Group();
      const unitNormalLocal = new THREE.Vector3(...node.unitPos).normalize();

      // Surface socket ring oriented tangent to the globe surface
      const socketMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.glowHex),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      materialsToDispose.push(socketMaterial);
      const socketMesh = new THREE.Mesh(sharedSocketGeo, socketMaterial);
      socketMesh.position.copy(unitNormalLocal).multiplyScalar(GLOBE_RADIUS + 0.012);
      socketMesh.quaternion.setFromUnitVectors(_zAxis, unitNormalLocal);
      anchorGroup.add(socketMesh);

      // Radial anchor pin stem extending out from the surface socket
      const stemMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(node.accentHex),
        emissive: new THREE.Color(node.accentHex),
        emissiveIntensity: 0.4,
        metalness: 0.7,
        roughness: 0.3,
        transparent: true,
        opacity: 0.9,
      });
      materialsToDispose.push(stemMaterial);
      const stemMesh = new THREE.Mesh(sharedStemGeo, stemMaterial);
      stemMesh.position.copy(unitNormalLocal).multiplyScalar(GLOBE_RADIUS + 0.11);
      stemMesh.quaternion.setFromUnitVectors(_yAxis, unitNormalLocal);
      anchorGroup.add(stemMesh);

      // Glowing junction node at the socket base
      const junctionMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.glowHex),
        transparent: true,
        opacity: 0.95,
      });
      materialsToDispose.push(junctionMaterial);
      const junctionMesh = new THREE.Mesh(sharedJunctionGeo, junctionMaterial);
      junctionMesh.position.copy(unitNormalLocal).multiplyScalar(GLOBE_RADIUS + 0.025);
      anchorGroup.add(junctionMesh);

      // Crisp icon + label surface medallion sprite physically attached at stem tip
      const badgeTex = createSkillBadgeTexture(node, maxAnisotropy);
      texturesToDispose.push(badgeTex);
      const badgeMaterial = new THREE.SpriteMaterial({
        map: badgeTex,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });
      materialsToDispose.push(badgeMaterial);

      const badgeSprite = new THREE.Sprite(badgeMaterial);
      badgeSprite.position.copy(unitNormalLocal).multiplyScalar(GLOBE_RADIUS + 0.34);
      badgeSprite.scale.set(0.96, 0.27, 1);
      anchorGroup.add(badgeSprite);

      // Invisible raycast collision proxy centered on the badge tip
      const hitProxy = new THREE.Mesh(sharedHitGeo, sharedHitMat);
      hitProxy.position.copy(badgeSprite.position);
      anchorGroup.add(hitProxy);

      globeGroup.add(anchorGroup);

      const runtime: SkillRuntimeNode = {
        data: node,
        anchorGroup,
        socketMesh,
        socketMaterial,
        stemMesh,
        stemMaterial,
        junctionMesh,
        junctionMaterial,
        badgeSprite,
        badgeMaterial,
        hitProxy,
        unitNormalLocal,
        currentScale: 1,
      };
      runtimeNodes.push(runtime);
      hitProxies.push(hitProxy);
      proxyToNode.set(hitProxy, runtime);
    }

    // Pre-warm shaders on hardware GPUs (skip on software WebGL per threejs skill)
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Interactive state (mutable, zero React re-render overhead)
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
      targetRotY = normalizeAngleDelta(globeGroup.rotation.y, rotY);
      rotVelX = 0;
      rotVelY = 0;
    };
    focusNodeRef.current = focusNodeById;

    const resetView = () => {
      targetRotX = 0.18;
      targetRotY = normalizeAngleDelta(globeGroup.rotation.y, -0.45);
      rotVelX = 0;
      rotVelY = 0;
      resumeAutoRotateAt = 0;
      requestRender();
    };
    resetViewFnRef.current = resetView;

    // Step scene simulation & update depth-based node fading
    const stepScene = (dt: number, nowMs: number) => {
      const clampedDt = Math.min(Math.max(dt, 0.001), 0.08);
      const selectedId = selectedSkillIdRef.current;
      const activeCat = activeCategoryRef.current;

      // 1. Apply focused target rotation, drag inertia, or gentle auto-rotation
      if (!isPointerDown) {
        if (targetRotX !== null && targetRotY !== null) {
          const dampK = 6.5;
          globeGroup.rotation.x = THREE.MathUtils.damp(
            globeGroup.rotation.x,
            targetRotX,
            dampK,
            clampedDt
          );
          globeGroup.rotation.y = THREE.MathUtils.damp(
            globeGroup.rotation.y,
            targetRotY,
            dampK,
            clampedDt
          );
          if (
            Math.abs(globeGroup.rotation.x - targetRotX) < 0.004 &&
            Math.abs(globeGroup.rotation.y - targetRotY) < 0.004
          ) {
            globeGroup.rotation.x = targetRotX;
            globeGroup.rotation.y = targetRotY;
            if (!selectedId) {
              targetRotX = null;
              targetRotY = null;
            }
          }
        } else {
          // Coast drag velocity with smooth exponential friction
          globeGroup.rotation.y += rotVelY * clampedDt;
          globeGroup.rotation.x = THREE.MathUtils.clamp(
            globeGroup.rotation.x + rotVelX * clampedDt,
            -1.05,
            1.05
          );
          const friction = Math.exp(-5.2 * clampedDt);
          rotVelX *= friction;
          rotVelY *= friction;

          // Resume smooth controlled auto-rotation when idle
          const canAutoRotate =
            autoRotateRef.current &&
            !reducedMotionRef.current &&
            !selectedId &&
            hoveredSkillId === null &&
            nowMs >= resumeAutoRotateAt;

          if (canAutoRotate) {
            globeGroup.rotation.y += 0.145 * clampedDt;
          }
        }
      }

      // Gentle counter-drift for outer orbital rings & starfield
      if (!reducedMotionRef.current) {
        outerRingMesh.rotation.z += 0.065 * clampedDt;
        secondaryRingMesh.rotation.z -= 0.045 * clampedDt;
        starField.rotation.y += 0.012 * clampedDt;
      }

      globeGroup.updateMatrixWorld(true);
      globeGroup.getWorldQuaternion(_globeWorldQuat);

      // 2. Depth-based front/back visibility & smooth hover/selected scaling
      const baseSpriteW = 0.96;
      const baseSpriteH = 0.27;
      for (let i = 0; i < runtimeNodes.length; i += 1) {
        const rn = runtimeNodes[i];
        _worldNormal.copy(rn.unitNormalLocal).applyQuaternion(_globeWorldQuat);
        _nodeWorldPos
          .copy(_worldNormal)
          .multiplyScalar(GLOBE_RADIUS)
          .add(globeGroup.position);
        _toCamera.copy(camera.position).sub(_nodeWorldPos).normalize();
        const facingDot = _worldNormal.dot(_toCamera);

        const isHighlighted =
          rn.data.id === hoveredSkillId || rn.data.id === selectedId;
        const isDimmed =
          activeCat !== 'All' && rn.data.category !== activeCat;

        const metrics = computeNodeDepthMetrics(
          facingDot,
          isHighlighted,
          isDimmed
        );

        rn.currentScale = THREE.MathUtils.damp(
          rn.currentScale,
          metrics.scaleFactor,
          10,
          clampedDt
        );

        rn.badgeSprite.scale.set(
          baseSpriteW * rn.currentScale,
          baseSpriteH * rn.currentScale,
          1
        );
        rn.badgeMaterial.opacity = metrics.opacity;
        rn.socketMaterial.opacity = Math.min(1, metrics.opacity * 0.92);
        rn.stemMaterial.opacity = Math.min(1, metrics.opacity * 0.9);
        rn.junctionMaterial.opacity = Math.min(1, metrics.opacity * 1.0);
        rn.stemMaterial.emissiveIntensity = isHighlighted ? 1.35 : 0.35;

        // Higher renderOrder for front & highlighted badges so they never clip behind back nodes
        rn.badgeSprite.renderOrder = isHighlighted
          ? 30
          : Math.round((facingDot + 1) * 10);
      }

      // 3. Highlight constellation arcs matching active category or hovered/selected skill
      const activeSkillNode = selectedId
        ? nodeLookup.get(selectedId)
        : hoveredSkillId
          ? nodeLookup.get(hoveredSkillId)
          : null;

      for (let i = 0; i < arcRuntimes.length; i += 1) {
        const ar = arcRuntimes[i];
        let targetOp = 0.18;
        if (activeSkillNode) {
          if (
            ar.data.fromId === activeSkillNode.id ||
            ar.data.toId === activeSkillNode.id
          ) {
            targetOp = 0.85;
          } else if (ar.data.category === activeSkillNode.category) {
            targetOp = 0.42;
          } else {
            targetOp = 0.06;
          }
        } else if (activeCat !== 'All') {
          targetOp = ar.data.category === activeCat ? 0.62 : 0.05;
        }
        ar.material.opacity = THREE.MathUtils.damp(
          ar.material.opacity,
          targetOp,
          8,
          clampedDt
        );
      }
    };

    // Software-WebGL fenceSync helper from threejs skill
    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext();
      if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
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
      if (shouldLoopContinuously()) return; // Continuous tick already drives rendering
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
      if (!shouldLoopContinuously()) {
        // Draw one clean settled frame if needed and pause loop
        return;
      }
      const now = performance.now();
      const dt = (now - lastTimeMs) / 1000;
      lastTimeMs = now;
      stepScene(dt, now);
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    // Raycasting helper restricting hits strictly to front-hemisphere skill badges
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

      globeGroup.getWorldQuaternion(_globeWorldQuat);
      for (let i = 0; i < hits.length; i += 1) {
        const candidate = proxyToNode.get(hits[i].object);
        if (!candidate) continue;
        _worldNormal
          .copy(candidate.unitNormalLocal)
          .applyQuaternion(_globeWorldQuat);
        _nodeWorldPos
          .copy(_worldNormal)
          .multiplyScalar(GLOBE_RADIUS)
          .add(globeGroup.position);
        _toCamera.copy(camera.position).sub(_nodeWorldPos).normalize();
        if (_worldNormal.dot(_toCamera) > -0.06) {
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
      rn.badgeSprite.getWorldPosition(_vecA);
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

    // Pointer interaction handlers (drag to rotate + hover preview + click inspect)
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
        globeGroup.rotation.y += dx * sensitivity;
        globeGroup.rotation.x = THREE.MathUtils.clamp(
          globeGroup.rotation.x + dy * sensitivity,
          -1.05,
          1.05
        );
        rotVelY = dx * 0.22;
        rotVelX = dy * 0.16;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        requestRender();
        return;
      }

      // Throttled pointermove raycast (<= 25Hz)
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
      resumeAutoRotateAt = performance.now() + 2000;
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

    // Responsive ResizeObserver
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

    // IntersectionObserver pauses WebGL loop when section is off-screen
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
  }, [nodes, arcs]);

  return (
    <div
      ref={containerRef}
      data-testid="tech-globe-canvas-mount"
      className="w-full h-full relative select-none"
    />
  );
};
