import * as THREE from 'three';
import type { ExhibitBuild, ExhibitHotspot } from '../stage';
import { addAccentRing, addPlaneBase, box, cylinder, edges, standard } from '../helpers';

const BRASS = 0xc9a45c;
const BRASS_LIGHT = 0xe2c27a;
const IRON = 0x3d454c;
const WOOD = 0x4e3420;

function gear(
  parent: THREE.Group,
  radius: number,
  teeth: number,
  depth: number,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const shape = new THREE.Shape();
  const inner = radius * 0.86;
  const steps = teeth * 4;
  for (let index = 0; index <= steps; index += 1) {
    const tooth = index % 4;
    const r = tooth === 0 || tooth === 1 ? radius : inner;
    const angle = (index / steps) * Math.PI * 2;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (index === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1, curveSegments: 2 });
  geometry.translate(0, 0, -depth / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  parent.add(mesh, edges(mesh, BRASS_LIGHT, 0.12));
  return mesh;
}

function digitWheel(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const wheel = cylinder(0.25, 0.25, 0.14, material, 0, 0, 0, 28);
  wheel.rotation.x = Math.PI / 2;
  group.add(wheel, edges(wheel, BRASS_LIGHT, 0.16));
  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2;
    const mark = box(0.035, 0.03, 0.15, standard(0x1a1c1c, { roughness: 0.9 }), Math.cos(angle) * 0.2, Math.sin(angle) * 0.2, 0.08);
    mark.rotation.z = angle;
    group.add(mark);
  }
  parent.add(group);
  return group;
}

export function buildLeibniz(): ExhibitBuild {
  const group = new THREE.Group();
  addPlaneBase(group, 5.3, 0x0b0d0d);
  addAccentRing(group, 4.7, BRASS);

  const wood = standard(WOOD, { roughness: 0.78, metalness: 0.08 });
  const iron = standard(IRON, { roughness: 0.42, metalness: 0.68 });
  const brass = standard(BRASS, { roughness: 0.4, metalness: 0.38, emissive: 0x3d280c, emissiveIntensity: 0.48 });
  const brassLight = standard(BRASS_LIGHT, { roughness: 0.35, metalness: 0.4, emissive: 0x4a340f, emissiveIntensity: 0.42 });
  const dark = standard(0x181b1b, { roughness: 0.85, metalness: 0.1 });
  const paper = standard(0xd9c9a3, { roughness: 0.9, metalness: 0.02 });

  const warm = new THREE.PointLight(0xffcf8a, 30, 14, 1.5);
  warm.position.set(0, 4, 3);
  group.add(warm);
  const fill = new THREE.PointLight(0x9ec8e8, 16, 10, 1.6);
  fill.position.set(-3, 3, 2);
  group.add(fill);

  const base = box(5.2, 0.22, 2.9, iron, 0, -0.9, 0);
  group.add(base, edges(base, 0x6e7b82, 0.18));
  const body = box(4.8, 0.9, 2.5, wood, 0, -0.35, 0);
  group.add(body, edges(body, 0x8d6a43, 0.22));
  const top = box(4.9, 0.12, 2.6, brass, 0, 0.18, 0);
  group.add(top, edges(top, BRASS_LIGHT, 0.25));
  for (const x of [-2.25, 2.25]) {
    for (const z of [-1.1, 1.1]) {
      group.add(box(0.11, 0.45, 0.11, brass, x, -0.6, z));
    }
  }

  // Stepped drum, axis along X.
  const drumGroup = new THREE.Group();
  drumGroup.position.set(-0.45, 0.72, 0);
  group.add(drumGroup);
  for (let index = 0; index < 9; index += 1) {
    const radius = 0.2 + index * 0.035;
    const step = cylinder(radius, radius, 0.12, index % 2 === 0 ? brass : brassLight, -0.56 + index * 0.14, 0, 0, 28);
    step.rotation.z = Math.PI / 2;
    drumGroup.add(step);
    const ridge = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012, 6, 28), brassLight);
    ridge.rotation.y = Math.PI / 2;
    ridge.position.x = -0.56 + index * 0.14;
    drumGroup.add(ridge);
  }
  const drumShaft = cylinder(0.06, 0.06, 1.9, iron, -0.55, 0.72, 0, 18);
  drumShaft.rotation.z = Math.PI / 2;
  group.add(drumShaft);
  for (const x of [-0.98, 0.42]) {
    group.add(box(0.12, 1.0, 0.16, iron, x, 0.7, 0));
    group.add(cylinder(0.12, 0.12, 0.1, brass, x, 0.72, 0.1, 18));
  }

  // Setting rail and sliding pinion.
  const rail = box(3.4, 0.06, 0.08, brassLight, -0.2, 1.28, 0.72);
  group.add(rail);
  const slider = box(0.26, 0.3, 0.28, brass, -1.2, 1.15, 0.72);
  group.add(slider, edges(slider, BRASS_LIGHT, 0.25));
  const pointer = box(0.06, 0.18, 0.04, iron, -1.2, 1.42, 0.86);
  group.add(pointer);

  // Accumulator carriage above the drum.
  const carriage = new THREE.Group();
  carriage.position.set(1.45, 0.95, 0);
  group.add(carriage);
  const carriageBase = box(1.7, 0.12, 1.5, iron, 0, 0, 0);
  carriage.add(carriageBase, edges(carriageBase, BRASS, 0.22));
  const wheels = [-0.55, -0.18, 0.19, 0.56].map((x) => digitWheel(carriage, x, 0.22, 0, brassLight));
  const carriageFrame = box(1.85, 0.08, 0.1, brass, 0, 0.5, -0.68);
  carriage.add(carriageFrame);
  const resultPaper = box(1.5, 0.02, 0.55, paper, 0.02, 0.42, 0.5);
  carriage.add(resultPaper);

  // Crank on the left, with a 30-tooth drive gear and a 15-tooth transfer gear.
  const crank = new THREE.Group();
  crank.position.set(-2.1, 0.35, 0);
  group.add(crank);
  const crankWheel = gear(group, 0.48, 30, 0.14, brass, -2.1, 0.35, 0);
  const transfer = gear(group, 0.24, 15, 0.14, brassLight, -1.36, 0.35, 0);
  const crankAxis = cylinder(0.06, 0.06, 0.35, iron, -2.1, 0.35, 0.3, 16);
  crankAxis.rotation.x = Math.PI / 2;
  group.add(crankAxis);
  const crankArm = box(0.1, 0.55, 0.12, brassLight, -2.1, 0.35, 0.55);
  group.add(crankArm);
  group.add(cylinder(0.055, 0.055, 0.25, brass, -2.1, 0.64, 0.55, 14));

  // Result window and small control knobs.
  for (const x of [-0.7, 0, 0.7]) {
    const frame = box(0.38, 0.24, 0.04, brass, x, -0.06, 1.3);
    group.add(frame);
    group.add(box(0.27, 0.15, 0.02, dark, x, -0.06, 1.33));
  }
  for (const x of [-1.35, -0.8, -0.25, 0.3, 0.85, 1.4]) {
    const knob = cylinder(0.07, 0.07, 0.12, brassLight, x, -0.04, 1.34, 16);
    knob.rotation.x = Math.PI / 2;
    group.add(knob);
  }

  const hotspots: ExhibitHotspot[] = [
    { id: 'drum', label: '步进鼓', detail: '九个不同高度的齿阶沿轴向排列；转到不同位置就选到不同的被乘数位。', position: [-0.4, 1.1, 0.7] },
    { id: 'slider', label: '设定滑块', detail: '滑块决定步进鼓的哪一段参与啮合，对应乘法中的某一位。', position: [-1.2, 1.65, 0.9] },
    { id: 'carriage', label: '累加器', detail: '累加器接收重复加减的结果；多位结果通过齿轮列保存。', position: [1.45, 1.8, 0.6] },
    { id: 'crank', label: '手摇曲柄', detail: '30:15 的齿轮组把曲柄转动传给步进鼓与累加器。', position: [-2.5, 0.9, 0.4] },
  ];

  let explode = 0;
  return {
    group,
    hotspots,
    camera: { position: [6.4, 4.8, 7.6], target: [0, 0.55, 0] },
    setExplode(factor) {
      explode = factor;
      carriage.position.y = 0.95 + factor * 0.8;
      carriage.position.z = factor * 0.4;
      slider.position.x = -1.2 + factor * 0.35;
    },
    onFrame(elapsed, delta) {
      drumGroup.rotation.x += delta * 0.18;
      crankWheel.rotation.z += delta * 0.35;
      transfer.rotation.z -= delta * 0.7;
      for (const wheel of wheels) wheel.rotation.z += delta * 0.08;
      slider.position.x = -1.2 + (Math.sin(elapsed * 0.35) * 0.5 + 0.5) * 0.85;
      pointer.position.x = slider.position.x;
      carriage.rotation.z = Math.sin(elapsed * 0.25) * 0.012 * explode;
    },
  };
}
