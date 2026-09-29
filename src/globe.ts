import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Timer,
  Color,
  DoubleSide,
  Group,
  Line,
  LineBasicMaterial,
  Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  QuadraticBezierCurve3,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

type City = { name: string; lat: number; lon: number };

const CITIES: City[] = [
  { name: 'Moscow', lat: 55.75, lon: 37.62 },
  { name: 'London', lat: 51.5, lon: -0.12 },
  { name: 'Frankfurt', lat: 50.1, lon: 8.68 },
  { name: 'New York', lat: 40.7, lon: -74 },
  { name: 'San Francisco', lat: 37.77, lon: -122.4 },
  { name: 'São Paulo', lat: -23.5, lon: -46.6 },
  { name: 'Lagos', lat: 6.5, lon: 3.4 },
  { name: 'Dubai', lat: 25.2, lon: 55.27 },
  { name: 'Mumbai', lat: 19.07, lon: 72.87 },
  { name: 'Almaty', lat: 43.24, lon: 76.9 },
  { name: 'Singapore', lat: 1.35, lon: 103.8 },
  { name: 'Tokyo', lat: 35.68, lon: 139.7 },
  { name: 'Seoul', lat: 37.56, lon: 126.97 },
  { name: 'Sydney', lat: -33.87, lon: 151.2 },
];

const RADIUS = 1;
const DEG = Math.PI / 180;

function latLonToVec(lat: number, lon: number, r = RADIUS) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/** Evenly spread points on a sphere (Fibonacci lattice). */
function fibonacciSphere(count: number, r: number) {
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions.set([Math.cos(theta) * rad * r, y * r, Math.sin(theta) * rad * r], i * 3);
  }
  return positions;
}

const dotVertex = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vFacing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vFacing = dot(n, normalize(-mv.xyz));
    gl_PointSize = uSize * uPixelRatio * (1.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const dotFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vFacing;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.15, d) * mix(0.15, 1.0, smoothstep(0.0, 0.7, vFacing));
    vec3 color = mix(uColorA, uColorB, smoothstep(0.0, 1.0, vFacing));
    gl_FragColor = vec4(color, alpha);
  }
`;

const atmoVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const atmoFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    // Rendered on the back side: faces behind the planet look away from the camera,
    // so -dot() is strongest next to the planet and fades to 0 at the outer edge.
    float glow = pow(clamp(-dot(vNormal, vView), 0.0, 1.0), 1.6);
    gl_FragColor = vec4(uColor, glow * 1.1);
  }
`;

type Arc = {
  line: Line;
  pulse: Mesh;
  curve: QuadraticBezierCurve3;
  segments: number;
  start: number;
  duration: number;
};

export function createGlobe(container: HTMLElement, { reduceMotion = false } = {}) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  const globe = new Group();
  globe.rotation.set(0.35, -1.2, 0);
  scene.add(globe);

  // Opaque dark core: drawn first, it hides the far side of the dot field via the depth buffer
  const core = new Mesh(
    new SphereGeometry(RADIUS * 0.985, 64, 64),
    new MeshBasicMaterial({ color: 0x0a0c24 })
  );
  globe.add(core);

  // Dot field
  const dotGeo = new BufferGeometry();
  dotGeo.setAttribute('position', new BufferAttribute(fibonacciSphere(5200, RADIUS), 3));
  const dotMat = new ShaderMaterial({
    vertexShader: dotVertex,
    fragmentShader: dotFragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uSize: { value: 9 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uColorA: { value: new Color('#4a4f9a') },
      uColorB: { value: new Color('#c9d0ff') },
    },
  });
  globe.add(new Points(dotGeo, dotMat));

  // Atmosphere (fresnel rim)
  const atmo = new Mesh(
    new SphereGeometry(RADIUS * 1.18, 64, 64),
    new ShaderMaterial({
      vertexShader: atmoVertex,
      fragmentShader: atmoFragment,
      uniforms: { uColor: { value: new Color('#6c7dff') } },
      transparent: true,
      blending: AdditiveBlending,
      side: BackSide,
      depthWrite: false,
    })
  );
  scene.add(atmo);

  // City markers
  const markerGeo = new SphereGeometry(0.014, 12, 12);
  const markerMat = new MeshBasicMaterial({ color: '#3ee6ff' });
  const haloGeo = new RingGeometry(0.02, 0.032, 32);
  const halos: Mesh[] = [];
  const cityPos = CITIES.map((c) => latLonToVec(c.lat, c.lon, RADIUS * 1.005));
  cityPos.forEach((p, i) => {
    const m = new Mesh(markerGeo, markerMat);
    m.position.copy(p);
    globe.add(m);
    const halo = new Mesh(
      haloGeo,
      new MeshBasicMaterial({ color: '#3ee6ff', transparent: true, opacity: 0.6, side: DoubleSide, depthWrite: false })
    );
    halo.position.copy(p);
    halo.lookAt(p.clone().multiplyScalar(2));
    halo.userData.offset = i * 0.37;
    halos.push(halo);
    globe.add(halo);
  });

  // Arcs between random city pairs
  const arcs: Arc[] = [];
  const pulseGeo = new SphereGeometry(0.012, 10, 10);
  const pulseMat = new MeshBasicMaterial({ color: '#ffffff' });

  function makeArc(now: number): Arc {
    const a = Math.floor(Math.random() * CITIES.length);
    let b = Math.floor(Math.random() * CITIES.length);
    if (b === a) b = (a + 3) % CITIES.length;
    const p0 = cityPos[a];
    const p2 = cityPos[b];
    const dist = p0.distanceTo(p2);
    const mid = p0.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(RADIUS + dist * 0.45);
    const curve = new QuadraticBezierCurve3(p0, mid, p2);
    const segments = 64;
    const geo = new BufferGeometry().setFromPoints(curve.getPoints(segments));
    const colors = new Float32Array((segments + 1) * 3);
    const cA = new Color('#8b7bff');
    const cB = new Color('#3ee6ff');
    for (let i = 0; i <= segments; i++) {
      const c = cA.clone().lerp(cB, i / segments);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    geo.setDrawRange(0, 0);
    const line = new Line(
      geo,
      new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: AdditiveBlending, depthWrite: false })
    );
    const pulse = new Mesh(pulseGeo, pulseMat);
    globe.add(line, pulse);
    return { line, pulse, curve, segments, start: now + Math.random() * 1.5, duration: 2.2 + dist * 0.8 };
  }

  function disposeArc(arc: Arc) {
    globe.remove(arc.line, arc.pulse);
    arc.line.geometry.dispose();
    (arc.line.material as Material).dispose();
  }

  const timer = new Timer();
  for (let i = 0; i < 7; i++) arcs.push(makeArc(0));

  // Interaction: drag to rotate with inertia
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let velX = 0;
  let velY = 0;
  const autoSpeed = reduceMotion ? 0 : 0.08;

  const el = renderer.domElement;
  el.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    velX = dx * 0.005;
    velY = dy * 0.003;
    globe.rotation.y += velX;
    globe.rotation.x = MathUtils.clamp(globe.rotation.x + velY, -0.6, 0.9);
  });
  const endDrag = () => (dragging = false);
  el.addEventListener('pointerup', endDrag);
  el.addEventListener('pointercancel', endDrag);

  // Resize
  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    dotMat.uniforms.uSize.value = Math.max(8, Math.min(16, width / 40));
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // Only render while visible
  let visible = true;
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0 });
  io.observe(container);

  function frame() {
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const t = timer.getElapsed();

    if (!dragging) {
      globe.rotation.y += autoSpeed * dt + velX;
      velX *= 0.94;
      velY *= 0.9;
    }

    if (reduceMotion) {
      renderer.render(scene, camera);
      return;
    }

    halos.forEach((h) => {
      const k = (t * 0.6 + h.userData.offset) % 1;
      h.scale.setScalar(1 + k * 1.8);
      (h.material as MeshBasicMaterial).opacity = 0.6 * (1 - k);
    });

    for (let i = 0; i < arcs.length; i++) {
      const arc = arcs[i];
      const p = (t - arc.start) / arc.duration;
      if (p < 0) continue;
      if (p > 1) {
        disposeArc(arc);
        arcs[i] = makeArc(t);
        continue;
      }
      // Draw in during the first half, erase from the tail in the second half
      const head = Math.min(1, p * 2);
      const tail = Math.max(0, p * 2 - 1);
      const from = Math.floor(tail * arc.segments);
      const to = Math.floor(head * arc.segments);
      arc.line.geometry.setDrawRange(from, Math.max(0, to - from + 1));
      arc.pulse.position.copy(arc.curve.getPoint(head));
      arc.pulse.visible = head < 1;
    }

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(() => {
    if (visible && !document.hidden) frame();
  });

  if (reduceMotion) {
    // a single static, fully drawn frame
    arcs.forEach((a) => a.line.geometry.setDrawRange(0, a.segments + 1));
  }

  return {
    destroy() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      io.disconnect();
      renderer.dispose();
    },
  };
}
