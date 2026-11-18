import * as THREE from 'three';
import type { ExhibitBuild, ExhibitHotspot } from '../stage';
import { addAccentRing, addPlaneBase, box, cylinder, edges, standard } from '../helpers';

const BRASS = 0xc9a45c;
const BRASS_LIGHT = 0xe2c27a;
const IRON = 0x3d454c;
const WOOD = 0x4e3420;
const THREAD = 0xd6c5a2;

function punchedCard(
  paperMaterial: THREE.Material,
  holeMaterial: THREE.Material,
  index: number,
): THREE.Group {
  const group = new THREE.Group();
  const sheet = box(0.68, 0.022, 0.44, paperMaterial, 0, 0, 0);
  group.add(sheet, edges(sheet, 0x6f5d3f, 0.25));
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      group.add(box(0.05, 0.01, 0.055, holeMaterial, -0.21 + col * 0.14, 0.017, -0.1 + row * 0.2));
    }
  }
  group.userData.index = index;
  return group;
}

export function buildJacquard(): ExhibitBuild {
  const group = new THREE.Group();
  addPlaneBase(group, 5.6, 0x0b0d0d);
  addAccentRing(group, 5.0, BRASS);

  const wood = standard(WOOD, { roughness: 0.78, metalness: 0.08 });
  const iron = standard(IRON, { roughness: 0.44, metalness: 0.66 });
  const brass = standard(BRASS, { roughness: 0.4, metalness: 0.38, emissive: 0x3d280c, emissiveIntensity: 0.48 });
  const brassLight = standard(BRASS_LIGHT, { roughness: 0.35, metalness: 0.4, emissive: 0x4a340f, emissiveIntensity: 0.42 });
  const paperMaterial = standard(0xd9c9a3, { roughness: 0.88, metalness: 0.02 });
  const holeMaterial = standard(0x171a18, { roughness: 0.9, metalness: 0.08 });
  const clothMaterial = standard(0x8f9b8c, { roughness: 0.92, metalness: 0.02 });
  const threadMaterial = new THREE.LineBasicMaterial({ color: THREAD, transparent: true, opacity: 0.55 });

  const warm = new THREE.PointLight(0xffcf8a, 28, 14, 1.5);
  warm.position.set(0, 4.5, 3.5);
  group.add(warm);
  const fill = new THREE.PointLight(0x9ec8e8, 16, 10, 1.6);
  fill.position.set(-3, 3, 2);
  group.add(fill);

  const base = box(5.5, 0.22, 3.2, iron, 0, -0.9, 0);
  group.add(base, edges(base, 0x6e7b82, 0.18));
  const floor = box(5.2, 0.14, 2.9, wood, 0, -0.7, 0);
  group.add(floor, edges(floor, 0x8d6a43, 0.2));

  // Loom frame
  for (const x of [-2.35, 2.35]) {
    group.add(box(0.16, 4.2, 0.16, wood, x, 1.25, -1.2));
    group.add(box(0.16, 3.4, 0.16, wood, x, 1.0, 1.2));
  }
  for (const y of [-0.55, 3.35]) {
    group.add(box(4.9, 0.16, 0.18, wood, 0, y, -1.2));
  }
  group.add(box(4.9, 0.14, 0.18, wood, 0, 3.0, 1.2));
  const topBeam = box(5.0, 0.2, 0.22, brass, 0, 3.15, 0);
  group.add(topBeam, edges(topBeam, BRASS_LIGHT, 0.2));
  const bottomBeam = box(4.7, 0.18, 0.2, iron, 0, 0.1, 0);
  group.add(bottomBeam);

  // Warp threads and heddles
  const warpPositions: number[] = [];
  const warpXs = Array.from({ length: 26 }, (_, index) => -1.65 + index * 0.132);
  for (const x of warpXs) {
    warpPositions.push(x, 3.0, 0, x, 0.45, 0);
    warpPositions.push(x, 0.45, 0, x, -0.45, 0.85);
  }
  const warpGeometry = new THREE.BufferGeometry();
  warpGeometry.setAttribute('position', new THREE.Float32BufferAttribute(warpPositions, 3));
  group.add(new THREE.LineSegments(warpGeometry, threadMaterial));
  const heddleFrame = new THREE.Group();
  heddleFrame.position.y = 1.55;
  group.add(heddleFrame);
  heddleFrame.add(box(4.3, 0.1, 0.18, brass, 0, 0.5, 0.22));
  heddleFrame.add(box(4.3, 0.1, 0.18, brass, 0, -0.5, 0.22));
  for (let index = 0; index < 26; index += 1) {
    const x = -1.65 + index * 0.132;
    const heddle = box(0.04, 1.0, 0.04, index % 4 === 0 ? brassLight : iron, x, 0, 0.22);
    heddleFrame.add(heddle);
  }

  // Hook/needle bank above the cards
  const needleGroup = new THREE.Group();
  group.add(needleGroup);
  for (let index = 0; index < 18; index += 1) {
    const x = -1.55 + index * 0.18;
    const needle = cylinder(0.015, 0.015, 1.15, brassLight, x, 2.55, 0.72, 6);
    needleGroup.add(needle);
    const hook = box(0.1, 0.06, 0.18, brass, x, 3.05, 0.72);
    needleGroup.add(hook);
  }
  const hookRail = box(4.0, 0.08, 0.1, brass, 0, 2.9, 0.72);
  group.add(hookRail);

  // Punched-card chain over a prism
  const cardGroup = new THREE.Group();
  cardGroup.position.set(0, 0, 0);
  group.add(cardGroup);
  const rollerLeft = cylinder(0.18, 0.18, 1.1, brass, -2.05, 2.62, 1.0, 24);
  rollerLeft.rotation.x = Math.PI / 2;
  cardGroup.add(rollerLeft);
  const rollerRight = cylinder(0.18, 0.18, 1.1, brass, 2.05, 2.62, 1.0, 24);
  rollerRight.rotation.x = Math.PI / 2;
  cardGroup.add(rollerRight);
  const prism = box(1.2, 0.3, 0.7, brass, 1.55, 2.55, 1.0);
  group.add(prism, edges(prism, BRASS_LIGHT, 0.3));
  const cards = Array.from({ length: 10 }, (_, index) => punchedCard(paperMaterial, holeMaterial, index));
  for (const sheet of cards) {
    sheet.position.set(-1.9 + Number(sheet.userData.index) * 0.4, 2.8, 1.0);
    cardGroup.add(sheet);
  }
  for (const x of [-2.2, 2.2]) {
    group.add(box(0.1, 1.2, 0.1, iron, x, 2.55, 1.35));
  }

  // Cloth, cloth beam and treadles
  const cloth = box(3.4, 0.04, 1.3, clothMaterial, 0, 0.25, 0.28);
  group.add(cloth, edges(cloth, 0x5e695f, 0.2));
  const clothBeam = cylinder(0.19, 0.19, 1.45, brass, 0, -0.15, 1.05, 24);
  clothBeam.rotation.x = Math.PI / 2;
  group.add(clothBeam);
  for (const x of [-1.1, 0, 1.1]) {
    group.add(box(0.1, 0.55, 0.1, iron, x, -0.4, 1.1));
  }
  for (const x of [-0.7, 0.7]) {
    const pedal = box(0.6, 0.08, 1.05, iron, x, -0.72, 1.55);
    pedal.rotation.x = -0.18;
    group.add(pedal);
  }

  const hotspots: ExhibitHotspot[] = [
    { id: 'cards', label: '穿孔卡链', detail: '卡片上的孔位决定每一纬哪些经线抬起；换卡就等于换图案。', position: [0, 3.0, 1.35] },
    { id: 'prism', label: '阅读棱柱', detail: '棱柱把卡片压平并对准一排探针；孔位被转换成机械选择信号。', position: [1.55, 2.9, 1.2] },
    { id: 'needles', label: '提花针 / 综丝', detail: '探针与竖钩把卡片孔位传给综丝，综丝决定经线的升降。', position: [0.2, 2.7, 0.55] },
    { id: 'cloth', label: '织口与卷布轴', detail: '经线与纬线在织口交织，卷布轴把完成的织物卷起。', position: [0, 0.0, 1.2] },
  ];

  const modulePositions = {
    cards: cardGroup.position.clone(),
    needles: needleGroup.position.clone(),
    heddles: heddleFrame.position.clone(),
  };

  let explode = 0;
  return {
    group,
    hotspots,
    camera: { position: [7.2, 5.8, 8.8], target: [0, 1.5, 0] },
    setExplode(factor) {
      explode = factor;
      cardGroup.position.z = modulePositions.cards.z + factor * 0.7;
      needleGroup.position.y = modulePositions.needles.y + factor * 0.3;
      heddleFrame.position.y = modulePositions.heddles.y + factor * 0.35;
    },
    onFrame(elapsed, delta) {
      const speed = 0.09 + explode * 0.04;
      for (const sheet of cards) {
        const offset = (Number(sheet.userData.index) * 0.4 + elapsed * speed) % 4.0;
        sheet.position.x = -1.9 + offset;
        sheet.position.y = 2.8 + Math.sin(offset * Math.PI / 4) * 0.03;
      }
      clothBeam.rotation.x += delta * 0.12;
      for (let index = 0; index < 18; index += 1) {
        const needle = needleGroup.children[index * 2];
        if (needle instanceof THREE.Mesh) {
          needle.position.y = 2.55 + Math.sin(elapsed * 1.2 + index * 0.7) * 0.035;
        }
      }
      heddleFrame.position.y = modulePositions.heddles.y + explode * 0.35 + Math.sin(elapsed * 0.8) * 0.045 * (1 + explode);
    },
  };
}
