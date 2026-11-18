import * as THREE from 'three';

export function standard(
  color: number,
  options: { roughness?: number; metalness?: number; emissive?: number; emissiveIntensity?: number; transparent?: boolean; opacity?: number } = {},
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.55,
    metalness: options.metalness ?? 0.35,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
  });
}

export function box(
  width: number,
  height: number,
  depth: number,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  return mesh;
}

export function cylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  segments = 24,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
  mesh.position.set(x, y, z);
  return mesh;
}

export function edges(mesh: THREE.Mesh, color = 0x8de8ff, opacity = 0.28): THREE.LineSegments {
  const line = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
  line.position.copy(mesh.position);
  line.rotation.copy(mesh.rotation);
  line.scale.copy(mesh.scale);
  return line;
}

export function addPlaneBase(group: THREE.Group, radius: number, color = 0x0a141c): THREE.Mesh {
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 1.04, 0.14, 64),
    standard(color, { roughness: 0.82, metalness: 0.28 }),
  );
  base.position.y = -1.5;
  group.add(base);
  return base;
}

export function addAccentRing(group: THREE.Group, radius: number, color: number, y = -1.4): THREE.Mesh {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.018, 8, 96),
    standard(color, { emissive: color, emissiveIntensity: 1.4, roughness: 0.2 }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = y;
  group.add(ring);
  return ring;
}

export function addTrace(
  group: THREE.Group,
  points: Array<[number, number, number]>,
  color: number,
  width = 0.025,
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const geometry = new THREE.TubeGeometry(curve, 40, width, 6, false);
  const mesh = new THREE.Mesh(
    geometry,
    standard(color, { emissive: color, emissiveIntensity: 0.9, roughness: 0.25 }),
  );
  group.add(mesh);
  return mesh;
}

export function addPulse(
  group: THREE.Group,
  position: [number, number, number],
  color: number,
  radius = 0.09,
): THREE.Mesh {
  const pulse = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 18, 18),
    standard(color, { emissive: color, emissiveIntensity: 2.4, roughness: 0.1 }),
  );
  pulse.position.set(...position);
  group.add(pulse);
  return pulse;
}

export function makeLabelTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = '600 42px ui-monospace, SFMono-Regular, Menlo, monospace';
    context.fillStyle = 'rgba(230,245,255,0.85)';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
