import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface ExhibitHotspot {
  id: string;
  label: string;
  detail?: string;
  position: [number, number, number];
}

export interface ExhibitBuild {
  group: THREE.Group;
  hotspots: ExhibitHotspot[];
  setExplode?: (factor: number) => void;
  onFrame?: (elapsed: number, delta: number) => void;
  camera?: {
    position?: [number, number, number];
    target?: [number, number, number];
  };
}

export interface StageOptions {
  accent?: string;
  autoRotate?: boolean;
}

export interface Stage {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  build: ExhibitBuild;
  onFrame: ((elapsed: number, delta: number) => void) | null;
  dispose: () => void;
}

export function createStage(
  container: HTMLElement,
  build: ExhibitBuild,
  { accent = '#38e1c8', autoRotate = true }: StageOptions = {},
): Stage {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070b10, 0.022);

  const width = Math.max(1, container.clientWidth);
  const height = Math.max(1, container.clientHeight);
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  const cameraPosition = build.camera?.position ?? [7, 4.5, 7];
  const target = build.camera?.target ?? [0, 0.4, 0];
  camera.position.set(...cameraPosition);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.domElement.className = 'exhibit-canvas';
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.minDistance = 3.4;
  controls.maxDistance = 16;
  controls.minPolarAngle = 0.45;
  controls.maxPolarAngle = Math.PI / 2.02;
  controls.autoRotate = autoRotate;
  controls.autoRotateSpeed = 0.55;
  controls.target.set(...target);
  controls.update();

  scene.add(new THREE.HemisphereLight(0xb9e5ff, 0x0a1017, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(5, 8, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(accent, 2.1);
  rim.position.set(-6, 2, -5);
  scene.add(rim);
  const fill = new THREE.PointLight(0x8ab9ff, 2.4, 18);
  fill.position.set(0, 3, 6);
  scene.add(fill);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(14, 64),
    new THREE.MeshStandardMaterial({ color: 0x091018, roughness: 0.92, metalness: 0.2 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.55;
  scene.add(floor);

  const grid = new THREE.GridHelper(22, 22, 0x1b3342, 0x101a22);
  grid.position.y = -1.54;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.42;
  scene.add(grid);

  scene.add(build.group);

  let frameHandler: ((elapsed: number, delta: number) => void) | null = null;
  const clock = new THREE.Clock();
  const resize = () => {
    const nextWidth = Math.max(1, container.clientWidth);
    const nextHeight = Math.max(1, container.clientHeight);
    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(nextWidth, nextHeight);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);

  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;
    controls.update();
    build.onFrame?.(elapsed, delta);
    frameHandler?.(elapsed, delta);
    renderer.render(scene, camera);
  });

  return {
    scene,
    camera,
    renderer,
    controls,
    build,
    get onFrame() {
      return frameHandler;
    },
    set onFrame(value) {
      frameHandler = value;
    },
    dispose: () => {
      observer.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          for (const material of materials) material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
