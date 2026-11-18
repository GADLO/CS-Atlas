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

function card(paper: THREE.Material, hole: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const sheet = box(0.9, 0.025, 0.52, paper, 0, 0, 0);
  group.add(sheet, edges(sheet, 0x6f5d3f, 0.25));
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      group.add(box(0.045, 0.01, 0.045, hole, -0.31 + col * 0.124, 0.017, -0.13 + row * 0.13));
    }
  }
  return group;
}

export function buildHollerith(): ExhibitBuild {
  const group = new THREE.Group();
  addPlaneBase(group, 4.9, 0x0b0d0d);
  addAccentRing(group, 4.3, BRASS);

  const wood = standard(WOOD, { roughness: 0.78, metalness: 0.08 });
  const iron = standard(IRON, { roughness: 0.42, metalness: 0.66 });
  const brass = standard(BRASS, { roughness: 0.4, metalness: 0.38, emissive: 0x3d280c, emissiveIntensity: 0.48 });
  const brassLight = standard(BRASS_LIGHT, { roughness: 0.35, metalness: 0.4, emissive: 0x4a340f, emissiveIntensity: 0.42 });
  const paper = standard(0xd9c9a3, { roughness: 0.88, metalness: 0.02 });
  const hole = standard(0x171a18, { roughness: 0.9, metalness: 0.08 });
  const dark = standard(0x181b1b, { roughness: 0.82, metalness: 0.15 });

  const warm = new THREE.PointLight(0xffcf8a, 26, 13, 1.5);
  warm.position.set(0, 4, 3);
  group.add(warm);
  const fill = new THREE.PointLight(0x9ec8e8, 14, 10, 1.6);
  fill.position.set(-3, 3, 2);
  group.add(fill);

  const base = box(4.7, 0.22, 2.8, iron, 0, -0.9, 0);
  group.add(base, edges(base, 0x6e7b82, 0.18));
  const desk = box(4.4, 0.8, 2.5, wood, 0, -0.35, 0);
  group.add(desk, edges(desk, 0x8d6a43, 0.22));
  const table = box(4.55, 0.12, 2.65, brass, 0, 0.1, 0);
  group.add(table, edges(table, BRASS_LIGHT, 0.22));
  for (const x of [-1.95, 1.95]) {
    for (const z of [-1.0, 1.0]) group.add(box(0.1, 0.38, 0.1, brass, x, -0.6, z));
  }

  // Card feed rails and sliding card
  const feedGroup = new THREE.Group();
  feedGroup.position.set(-0.95, 0.25, 0.45);
  group.add(feedGroup);
  feedGroup.add(box(2.2, 0.08, 0.1, brass, 0, 0.12, -0.32));
  feedGroup.add(box(2.2, 0.08, 0.1, brass, 0, 0.12, 0.32));
  const cardSheet = card(paper, hole);
  cardSheet.position.set(0, 0.17, 0);
  feedGroup.add(cardSheet);
  for (const x of [-0.9, 0.9]) {
    feedGroup.add(box(0.12, 0.22, 0.5, iron, x, 0.12, 0));
  }
  const reader = box(0.75, 0.16, 0.7, brass, 1.1, 0.3, 0.45);
  group.add(reader, edges(reader, BRASS_LIGHT, 0.25));
  for (let index = 0; index < 8; index += 1) {
    const pin = cylinder(0.016, 0.016, 0.28, brassLight, 0.85 + (index % 4) * 0.14, 0.45, 0.26 + Math.floor(index / 4) * 0.34, 6);
    group.add(pin);
  }

  // Counter panel and dials
  const panel = box(1.9, 1.15, 0.16, iron, 0.85, 1.1, -0.9);
  group.add(panel, edges(panel, BRASS, 0.2));
  const needles: THREE.Mesh[] = [];
  for (let index = 0; index < 4; index += 1) {
    const x = 0.18 + index * 0.48;
    const dial = cylinder(0.2, 0.2, 0.04, dark, x, 1.15, -0.8, 28);
    dial.rotation.x = Math.PI / 2;
    group.add(dial);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 30), brassLight);
    rim.position.set(x, 1.15, -0.79);
    group.add(rim);
    const needle = box(0.025, 0.16, 0.03, brassLight, x, 1.2, -0.76);
    needle.geometry.translate(0, 0.08, 0);
    group.add(needle);
    needles.push(needle);
    for (let tick = 0; tick < 10; tick += 1) {
      const angle = (tick / 10) * Math.PI * 2;
      const mark = box(0.018, 0.035, 0.02, brass, x + Math.cos(angle) * 0.15, 1.15 + Math.sin(angle) * 0.15, -0.77);
      mark.rotation.z = angle;
      group.add(mark);
    }
  }

  // Sorting bins
  const bins = new THREE.Group();
  bins.position.set(1.05, 0.2, 0.75);
  group.add(bins);
  for (let index = 0; index < 3; index += 1) {
    const bin = box(0.55, 0.45, 0.8, dark, -0.55 + index * 0.62, 0.22, 0);
    bins.add(bin, edges(bin, BRASS, 0.18));
    bins.add(box(0.46, 0.03, 0.7, brass, -0.55 + index * 0.62, 0.45, 0));
    bins.add(box(0.08, 0.3, 0.03, index === 1 ? brassLight : iron, -0.55 + index * 0.62, 0.55, 0.4));
  }
  const flap = box(0.55, 0.1, 0.06, brassLight, 1.05, 0.62, 0.3);
  group.add(flap);

  // Crank and visible gears
  const crank = new THREE.Group();
  crank.position.set(-2.25, 0.1, 0);
  group.add(crank);
  const gearA = gear(group, 0.4, 26, 0.12, brass, -2.25, 0.1, 0);
  const gearB = gear(group, 0.2, 13, 0.12, brassLight, -1.65, 0.1, 0);
  const shaft = cylinder(0.05, 0.05, 0.4, iron, -2.25, 0.1, 0.28, 12);
  shaft.rotation.x = Math.PI / 2;
  group.add(shaft);
  group.add(box(0.08, 0.5, 0.1, brassLight, -2.25, 0.1, 0.48));
  group.add(cylinder(0.05, 0.05, 0.22, brass, -2.25, 0.38, 0.48, 10));

  // Card stack on the left
  const stack = new THREE.Group();
  stack.position.set(-2.0, 0.25, 0.7);
  group.add(stack);
  for (let index = 0; index < 5; index += 1) {
    const sheet = card(paper, hole);
    sheet.position.y = index * 0.045;
    stack.add(sheet);
  }

  const hotspots: ExhibitHotspot[] = [
    { id: 'card', label: '穿孔卡', detail: '人口普查卡片把每个字段编码成孔位；卡片可以被机器重复读取。', position: [-0.95, 1.0, 0.8] },
    { id: 'reader', label: '阅读针', detail: '探针穿过孔位形成电路，驱动计数器累加。', position: [1.1, 0.8, 0.8] },
    { id: 'dials', label: '计数器', detail: '四个机械计数器按字段累加，替代了手工制表。', position: [0.85, 1.9, -0.7] },
    { id: 'bins', label: '分选箱', detail: '卡片按类别落入不同分选格，机械处理开始支持批量统计。', position: [1.05, 0.85, 1.0] },
    { id: 'crank', label: '手摇曲柄', detail: '曲柄驱动卡片进给与计数齿轮；整台机器仍靠人力。', position: [-2.5, 0.8, 0.5] },
  ];

  let explode = 0;
  return {
    group,
    hotspots,
    camera: { position: [6.6, 4.9, 7.2], target: [0, 0.55, 0] },
    setExplode(factor) {
      explode = factor;
      feedGroup.position.y = 0.25 + factor * 0.5;
      bins.position.z = 0.75 + factor * 0.65;
      bins.position.x = 1.05 + factor * 0.3;
      panel.position.y = 1.1 + factor * 0.35;
    },
    onFrame(elapsed, delta) {
      cardSheet.position.x = Math.sin(elapsed * 0.7) * 0.45;
      gearA.rotation.z += delta * 0.3;
      gearB.rotation.z -= delta * 0.6;
      crank.rotation.z += delta * 0.22;
      for (let index = 0; index < needles.length; index += 1) {
        needles[index].rotation.z = Math.sin(elapsed * (0.4 + index * 0.08) + index) * 0.55;
      }
      flap.rotation.z = Math.sin(elapsed * 0.75) * 0.1;
    },
  };
}
