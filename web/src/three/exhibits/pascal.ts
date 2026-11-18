import * as THREE from 'three';
import type { ExhibitBuild, ExhibitHotspot } from '../stage';
import { addAccentRing, addPlaneBase, box, cylinder, edges, standard } from '../helpers';

const BRASS = 0xc9a45c;
const BRASS_LIGHT = 0xe2c27a;
const IRON = 0x3d454c;
const WOOD = 0x4e3420;

function wheelAssembly(material: THREE.Material, slotMaterial: THREE.Material, x: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0.58, 0);
  const drum = cylinder(0.4, 0.4, 0.2, material, 0, 0, 0, 36);
  group.add(drum, edges(drum, BRASS_LIGHT, 0.16));
  const hub = cylinder(0.1, 0.1, 0.26, slotMaterial, 0, 0.05, 0, 16);
  group.add(hub);
  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2;
    const slot = box(0.04, 0.03, 0.16, slotMaterial, Math.cos(angle) * 0.29, 0.115, Math.sin(angle) * 0.29);
    slot.rotation.y = -angle;
    group.add(slot);
  }
  return group;
}

export function buildPascal(): ExhibitBuild {
  const group = new THREE.Group();
  addPlaneBase(group, 4.7, 0x0b0d0d);
  addAccentRing(group, 4.1, BRASS);

  const wood = standard(WOOD, { roughness: 0.78, metalness: 0.08 });
  const iron = standard(IRON, { roughness: 0.42, metalness: 0.66 });
  const brass = standard(BRASS, { roughness: 0.4, metalness: 0.38, emissive: 0x3d280c, emissiveIntensity: 0.48 });
  const brassLight = standard(BRASS_LIGHT, { roughness: 0.35, metalness: 0.4, emissive: 0x4a340f, emissiveIntensity: 0.42 });
  const dark = standard(0x181b1b, { roughness: 0.8, metalness: 0.15 });

  const warm = new THREE.PointLight(0xffcf8a, 30, 14, 1.5);
  warm.position.set(0, 4, 3);
  group.add(warm);
  const fill = new THREE.PointLight(0x9ec8e8, 16, 10, 1.6);
  fill.position.set(-3, 3, 2);
  group.add(fill);

  const lowerCase = box(4.2, 1.0, 2.5, wood, 0, -0.35, 0);
  group.add(lowerCase, edges(lowerCase, 0x8d6a43, 0.25));
  const topPlate = box(4.4, 0.14, 2.6, brass, 0, 0.25, 0);
  group.add(topPlate, edges(topPlate, BRASS_LIGHT, 0.3));
  const base = box(4.7, 0.22, 2.9, iron, 0, -0.9, 0);
  group.add(base, edges(base, 0x6e7b82, 0.2));
  for (const x of [-1.95, 1.95]) {
    for (const z of [-1.05, 1.05]) {
      group.add(box(0.12, 0.45, 0.12, brass, x, -0.65, z));
    }
  }

  const wheelPositions = [-1.5, -0.5, 0.5, 1.5];
  const wheels = wheelPositions.map((x) => {
    const window = cylinder(0.46, 0.46, 0.035, dark, x, 0.335, 0, 36);
    group.add(window);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.035, 8, 40), brass);
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(x, 0.36, 0);
    group.add(rim);
    const wheel = wheelAssembly(brassLight, dark, x);
    group.add(wheel);
    return wheel;
  });

  const carryLevers = [-1.5, -0.5, 0.5, 1.5].map((x) => {
    const lever = new THREE.Group();
    lever.position.set(x, 0.62, -1.02);
    const pivot = cylinder(0.09, 0.09, 0.12, iron, 0, 0, 0, 16);
    pivot.rotation.x = Math.PI / 2;
    lever.add(pivot);
    const arm = box(0.07, 0.7, 0.08, brass, 0, 0.32, 0);
    lever.add(arm);
    const hook = box(0.2, 0.06, 0.1, brassLight, 0.07, 0.63, 0);
    lever.add(hook);
    group.add(lever);
    return lever;
  });

  // front result windows
  for (const x of wheelPositions) {
    const window = box(0.5, 0.24, 0.04, dark, x, -0.14, 1.27);
    group.add(window);
    const frame = box(0.62, 0.34, 0.04, brass, x, -0.14, 1.24);
    group.add(frame);
    group.add(box(0.5, 0.24, 0.03, dark, x, -0.14, 1.265));
  }

  // side crank and gear train
  const crank = new THREE.Group();
  crank.position.set(2.38, 0.12, 0);
  const crankShaft = cylinder(0.08, 0.08, 0.65, iron, 0, 0, 0, 18);
  crankShaft.rotation.z = Math.PI / 2;
  crank.add(crankShaft);
  const crankArm = box(0.1, 0.58, 0.12, brass, 0.3, 0, 0);
  crank.add(crankArm);
  const handle = cylinder(0.055, 0.055, 0.28, brassLight, 0.3, 0.32, 0, 14);
  handle.rotation.x = Math.PI / 2;
  crank.add(handle);
  group.add(crank);

  const gears: THREE.Mesh[] = [];
  const makeGear = (radius: number, teeth: number, x: number, y: number, z: number) => {
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
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: false, steps: 1, curveSegments: 2 });
    geometry.translate(0, 0, -0.07);
    const gear = new THREE.Mesh(geometry, brass);
    gear.position.set(x, y, z);
    group.add(gear, edges(gear, BRASS_LIGHT, 0.12));
    gears.push(gear);
    return gear;
  };
  makeGear(0.28, 14, 0.8, 0.02, 1.36);
  makeGear(0.19, 10, 1.28, 0.02, 1.36);
  makeGear(0.14, 8, 1.6, 0.02, 1.36);

  // add a decorative front rail and feet
  group.add(box(4.45, 0.07, 0.08, brassLight, 0, -0.12, 1.3));
  for (const x of [-2.2, 2.2]) {
    group.add(box(0.12, 0.5, 0.12, iron, x, -0.55, 1.2));
  }

  const hotspots: ExhibitHotspot[] = [
    { id: 'digits', label: '数字轮', detail: '四个数字轮分别保存个、十、百、千位；转动曲柄时逐位累加。', position: [0, 1.25, 0.4] },
    { id: 'carry', label: '进位爪', detail: '低位从 9 回到 0 时，进位爪抬起并推动高位轮前进一格。', position: [1.2, 1.25, -0.9] },
    { id: 'crank', label: '手摇曲柄', detail: '曲柄通过侧面的齿轮组驱动数字轮，是整台机器的动力入口。', position: [2.7, 0.7, 0.1] },
    { id: 'result', label: '结果窗', detail: '前面板的小窗显示当前累加结果；机械计算的状态被直接读出。', position: [0, -0.05, 1.45] },
  ];

  const topGroup = new THREE.Group();
  topGroup.add(topPlate);
  for (const wheel of wheels) topGroup.add(wheel);
  group.add(topGroup);
  const carryGroup = new THREE.Group();
  for (const lever of carryLevers) carryGroup.add(lever);
  group.add(carryGroup);

  return {
    group,
    hotspots,
    camera: { position: [6.6, 5.0, 7.4], target: [0, 0.35, 0] },
    setExplode(factor) {
      topGroup.position.y = factor * 0.65;
      carryGroup.position.y = factor * 0.45;
      topGroup.position.z = factor * 0.15;
    },
    onFrame(elapsed, delta) {
      const step = Math.floor(elapsed * 0.75) % 10;
      wheels[0].rotation.y = step * (Math.PI / 5);
      wheels[1].rotation.y = Math.floor(elapsed * 0.22) % 10 * (Math.PI / 5);
      wheels[2].rotation.y = Math.floor(elapsed * 0.15) % 10 * (Math.PI / 5);
      wheels[3].rotation.y = Math.floor(elapsed * 0.1) % 10 * (Math.PI / 5);
      const carryPulse = step === 0 ? Math.max(0, Math.sin(elapsed * 8)) : 0;
      carryLevers[0].rotation.z = -carryPulse * 0.55;
      carryLevers[1].rotation.z = Math.sin(elapsed * 1.3) * 0.05;
      crank.rotation.x += delta * 0.35;
      gears[0].rotation.z += delta * 0.4;
      gears[1].rotation.z -= delta * 0.56;
      gears[2].rotation.z += delta * 0.7;
    },
  };
}
