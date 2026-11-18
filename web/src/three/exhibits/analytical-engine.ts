import * as THREE from 'three';
import type { ExhibitBuild, ExhibitHotspot } from '../stage';
import { addAccentRing, addPlaneBase, box, cylinder, edges, standard } from '../helpers';

const BRASS = 0xc9a45c;
const BRASS_LIGHT = 0xe2c27a;
const IRON = 0x3d454c;
const DARK_IRON = 0x232a2f;
const WOOD = 0x3a2618;
const PAPER = 0xd9c9a3;
const MODULE = 0.045;
const radiusFor = (teeth: number) => (teeth * MODULE) / 2;

function gearGeometry(radius: number, teeth: number, depth: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const inner = radius * 0.87;
  const steps = teeth * 4;
  for (let index = 0; index <= steps; index += 1) {
    const tooth = index % 4;
    const r = tooth === 0 || tooth === 1 ? radius : inner;
    const angle = (index / steps) * Math.PI * 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    steps: 1,
    curveSegments: 2,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function makeGear(
  radius: number,
  teeth: number,
  depth: number,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const mesh = new THREE.Mesh(gearGeometry(radius, teeth, depth), material);
  mesh.position.set(x, y, z);
  return mesh;
}

function makeAxle(
  length: number,
  radius: number,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const axle = cylinder(radius, radius, length, material, x, y, z, 16);
  axle.rotation.x = Math.PI / 2;
  return axle;
}

function rodBetween(
  from: [number, number, number],
  to: [number, number, number],
  radius: number,
  material: THREE.Material,
): THREE.Mesh {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const mesh = cylinder(radius, radius, length, material, 0, 0, 0, 10);
  mesh.position.copy(start.clone().add(end).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

function addRivets(
  group: THREE.Group,
  positions: Array<[number, number, number]>,
  material: THREE.Material,
): void {
  const geometry = new THREE.SphereGeometry(0.032, 8, 8);
  const rivets = new THREE.InstancedMesh(geometry, material, positions.length);
  const matrix = new THREE.Matrix4();
  positions.forEach(([x, y, z], index) => {
    matrix.makeTranslation(x, y, z);
    rivets.setMatrixAt(index, matrix);
  });
  rivets.instanceMatrix.needsUpdate = true;
  group.add(rivets);
}

function platform(
  group: THREE.Group,
  width: number,
  depth: number,
  x: number,
  z: number,
  darkIron: THREE.Material,
  brass: THREE.Material,
): void {
  const slab = box(width, 0.16, depth, darkIron, x, 0.17, z);
  group.add(slab, edges(slab, BRASS, 0.25));
  const trim = box(width * 0.94, 0.04, depth * 0.94, brass, x, 0.27, z);
  group.add(trim);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as Array<[number, number]>) {
    const foot = box(0.12, 0.16, 0.12, brass, x + dx * width * 0.44, 0.07, z + dz * depth * 0.44);
    group.add(foot);
  }
}

function card(
  paperMaterial: THREE.Material,
  holeMaterial: THREE.Material,
  index: number,
): THREE.Group {
  const group = new THREE.Group();
  const sheet = box(0.82, 0.022, 0.56, paperMaterial, 0, 0, 0);
  group.add(sheet, edges(sheet, 0x6f5d3f, 0.25));
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const hole = box(0.045, 0.008, 0.045, holeMaterial, -0.26 + col * 0.13, 0.016, -0.12 + row * 0.22);
      group.add(hole);
    }
  }
  group.userData.index = index;
  return group;
}

export function buildAnalyticalEngine(): ExhibitBuild {
  const group = new THREE.Group();
  const warm = new THREE.PointLight(0xffcf8a, 26, 18, 1.4);
  warm.position.set(0, 5.2, 4);
  group.add(warm);
  const fill = new THREE.PointLight(0x9ec8e8, 12, 15, 1.5);
  fill.position.set(-5, 3.5, -3);
  group.add(fill);
  addPlaneBase(group, 7.6, 0x0b0d0d);
  addAccentRing(group, 6.8, BRASS);

  const wood = standard(0x4e3420, { roughness: 0.76, metalness: 0.1 });
  const iron = standard(0x4c565d, { roughness: 0.4, metalness: 0.68 });
  const darkIron = standard(0x2d353a, { roughness: 0.48, metalness: 0.58 });
  const brass = standard(BRASS, { roughness: 0.34, metalness: 0.55, emissive: 0x2b1a08, emissiveIntensity: 0.32 });
  const brassLight = standard(BRASS_LIGHT, { roughness: 0.3, metalness: 0.6, emissive: 0x3a280e, emissiveIntensity: 0.28 });
  const paperMaterial = standard(PAPER, { roughness: 0.8, metalness: 0.02 });
  const holeMaterial = standard(0x171a18, { roughness: 0.9, metalness: 0.1 });
  const inkMaterial = standard(0x22211c, { roughness: 0.9, metalness: 0.05 });

  const gears: Array<{ mesh: THREE.Mesh; speed: number }> = [];
  const inputGroup = new THREE.Group();
  const storeGroup = new THREE.Group();
  const millGroup = new THREE.Group();
  const controlGroup = new THREE.Group();
  const outputGroup = new THREE.Group();
  group.add(inputGroup, storeGroup, millGroup, controlGroup, outputGroup);

  // Workbench, long frame and diagonal braces
  const bench = box(14.2, 0.3, 6.6, wood, 0, -0.78, 0);
  group.add(bench, edges(bench, 0x8d6a43, 0.25));
  for (const x of [-6.5, 6.5]) {
    for (const z of [-2.9, 2.9]) {
      group.add(box(0.24, 1.6, 0.24, iron, x, -1.58, z));
    }
  }
  const backRail = box(13.8, 0.15, 0.18, brass, 0, 2.05, -3.05);
  group.add(backRail);
  const topRail = box(13.8, 0.12, 0.14, iron, 0, 2.48, -3.05);
  group.add(topRail);
  for (const x of [-6.5, -3.25, 0, 3.25, 6.5]) {
    const post = box(0.12, 3.0, 0.12, iron, x, 0.4, -3.05);
    group.add(post);
    const cap = box(0.2, 0.08, 0.2, brass, x, 1.92, -3.05);
    group.add(cap);
    group.add(rodBetween([x, 0.3, -3.04], [x + 0.7, 1.85, -3.04], 0.025, brass));
  }
  addRivets(
    group,
    Array.from({ length: 24 }, (_, index) => [-6.2 + index * 0.54, 0.04, 3.1] as [number, number, number]),
    brass,
  );

  // Input: punched-card chain and reader
  inputGroup.position.set(-5.0, 0.05, 1.2);
  platform(inputGroup, 2.4, 2.2, 0, 0, darkIron, brass);
  for (const z of [-0.65, 0.65]) {
    const roller = cylinder(0.22, 0.22, 1.9, brass, 0, 1.08, z, 28);
    roller.rotation.z = Math.PI / 2;
    inputGroup.add(roller);
    inputGroup.add(box(0.1, 1.15, 0.1, iron, -0.88, 0.62, z));
    inputGroup.add(box(0.1, 1.15, 0.1, iron, 0.88, 0.62, z));
  }
  const reader = box(0.8, 0.2, 0.95, brass, 0.3, 1.21, 0);
  inputGroup.add(reader, edges(reader, BRASS_LIGHT, 0.35));
  for (let index = 0; index < 7; index += 1) {
    inputGroup.add(cylinder(0.018, 0.018, 0.24, brassLight, -0.15 + index * 0.15, 1.38, 0, 8));
  }
  const cardMagazine = box(0.55, 0.75, 1.3, iron, -1.0, 0.72, 0);
  inputGroup.add(cardMagazine, edges(cardMagazine, BRASS, 0.2));
  const cards = Array.from({ length: 9 }, (_, index) => card(paperMaterial, holeMaterial, index));
  for (const sheet of cards) {
    sheet.position.set(-0.98 + Number(sheet.userData.index) * 0.22, 1.3, 0.32);
    inputGroup.add(sheet);
  }

  // Store: four columns of figure wheels plus a read carriage
  storeGroup.position.set(-2.1, 0.05, -1.4);
  platform(storeGroup, 3.0, 2.5, 0, 0, darkIron, brass);
  for (let column = 0; column < 4; column += 1) {
    const x = -0.9 + column * 0.6;
    const shaft = cylinder(0.05, 0.05, 2.2, iron, x, 1.25, 0, 16);
    storeGroup.add(shaft);
    for (let row = 0; row < 8; row += 1) {
      const wheel = makeGear(0.235, 10, 0.075, row % 2 === 0 ? brass : brassLight, x, 0.48 + row * 0.23, 0);
      wheel.rotation.x = Math.PI / 2;
      wheel.rotation.z = column * 0.5 + row * 0.12;
      storeGroup.add(wheel);
      storeGroup.add(cylinder(0.072, 0.072, 0.04, iron, x, 0.48 + row * 0.23 + 0.1, 0, 12));
    }
  }
  const storeRail = box(2.45, 0.055, 0.1, brass, 0, 1.55, 0.42);
  storeGroup.add(storeRail);
  const storeCarriage = box(0.32, 0.18, 0.22, brassLight, 0, 1.58, 0.42);
  storeGroup.add(storeCarriage, edges(storeCarriage, BRASS_LIGHT, 0.25));

  // Mill: a consistent module gear train, 40 -> 20 -> 25 -> 15 teeth
  millGroup.position.set(1.5, 0.05, -1.4);
  platform(millGroup, 4.6, 2.8, 0, 0, darkIron, brass);
  for (const [x, z] of [[-1.9, -0.55], [1.9, -0.55], [-1.9, 0.75], [1.9, 0.75]] as Array<[number, number]>) {
    millGroup.add(box(0.12, 2.6, 0.12, iron, x, 1.4, z));
  }
  millGroup.add(box(4.0, 0.12, 0.14, brass, 0, 2.58, -0.55));
  millGroup.add(box(4.0, 0.12, 0.14, brass, 0, 2.58, 0.75));

  const w40 = 0.34;
  const w20 = -(40 / 20) * w40;
  const w25 = (20 / 25) * Math.abs(w20);
  const w15 = -(25 / 15) * w25;
  const train = [
    { teeth: 40, x: -1.12, y: 1.2, speed: w40, material: brass, depth: 0.2 },
    { teeth: 20, x: 0.23, y: 1.2, speed: w20, material: brassLight, depth: 0.18 },
    { teeth: 25, x: 1.245, y: 1.2, speed: w25, material: brass, depth: 0.18 },
    { teeth: 15, x: 2.145, y: 1.2, speed: w15, material: brassLight, depth: 0.16 },
  ];
  for (const item of train) {
    const radius = radiusFor(item.teeth);
    const gear = makeGear(radius, item.teeth, item.depth, item.material, item.x, item.y, 0);
    gear.rotation.z = item.speed;
    millGroup.add(gear, edges(gear, BRASS_LIGHT, 0.14));
    gears.push({ mesh: gear, speed: item.speed });
    millGroup.add(makeAxle(0.55, 0.052, iron, item.x, item.y, 0));
    const bearing = box(0.16, 0.16, 0.12, iron, item.x, item.y - radius - 0.12, 0.28);
    millGroup.add(bearing);
  }
  for (let spoke = 0; spoke < 4; spoke += 1) {
    const angle = (spoke / 4) * Math.PI;
    const bar = box(radiusFor(40) * 1.55, 0.045, 0.07, brassLight, -1.12, 1.2, 0.12);
    bar.rotation.z = angle;
    millGroup.add(bar);
  }
  const crank = makeAxle(0.9, 0.045, iron, -1.12, 1.2, 0.55);
  millGroup.add(crank);
  millGroup.add(box(0.1, 0.42, 0.1, brassLight, -1.12, 1.0, 0.96));
  millGroup.add(box(0.28, 0.1, 0.1, brassLight, -1.12, 1.2, 0.96));
  const millReadout = box(0.7, 0.06, 0.16, paperMaterial, 1.25, 1.95, 0.45);
  millGroup.add(millReadout);
  millGroup.add(box(0.9, 0.06, 0.2, brass, 1.25, 1.9, 0.45));

  // Control: barrel of studs, ratchet and a linkage back to the mill
  controlGroup.position.set(0.4, 0.05, 2.55);
  platform(controlGroup, 3.2, 1.25, 0, 0, darkIron, brass);
  const barrelAssembly = new THREE.Group();
  controlGroup.add(barrelAssembly);
  const barrel = cylinder(0.4, 0.4, 1.75, brass, 0, 0.98, 0, 36);
  barrel.rotation.z = Math.PI / 2;
  barrelAssembly.add(barrel);
  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 12; col += 1) {
      const angle = (col / 12) * Math.PI * 2 + row * 0.08;
      const stud = cylinder(0.022, 0.022, 0.17, brassLight, -0.72 + row * 0.29, Math.cos(angle) * 0.42, Math.sin(angle) * 0.42, 8);
      stud.rotation.x = Math.PI / 2;
      stud.rotation.z = angle;
      barrelAssembly.add(stud);
    }
  }
  for (const x of [-1.05, 1.05]) {
    controlGroup.add(box(0.12, 1.3, 0.12, iron, x, 0.8, 0));
    const endGear = makeGear(0.18, 12, 0.12, brassLight, x, 0.98, 0);
    controlGroup.add(endGear);
    gears.push({ mesh: endGear, speed: x < 0 ? 0.45 : -0.45 });
  }
  controlGroup.add(rodBetween([0, 1.0, 0], [1.1, 1.0, -3.95], 0.04, iron));

  // Output: printer, type bars and paper path
  outputGroup.position.set(5.15, 0.05, 0.8);
  platform(outputGroup, 2.6, 2.4, 0, 0, darkIron, brass);
  const printerBody = box(1.7, 0.7, 1.5, iron, 0, 0.95, 0);
  outputGroup.add(printerBody, edges(printerBody, BRASS, 0.22));
  const platen = cylinder(0.2, 0.2, 1.55, brass, 0, 1.4, 0, 28);
  platen.rotation.z = Math.PI / 2;
  outputGroup.add(platen);
  const paper = box(1.2, 0.018, 1.35, paperMaterial, 0, 1.52, 0.1);
  outputGroup.add(paper);
  for (let index = 0; index < 8; index += 1) {
    outputGroup.add(box(0.11, 0.014, 0.035, inkMaterial, -0.42 + (index % 4) * 0.28, 1.535, -0.2 + Math.floor(index / 4) * 0.25));
  }
  for (let index = 0; index < 5; index += 1) {
    outputGroup.add(box(0.06, 0.28, 0.06, brassLight, -0.6 + index * 0.3, 1.25, -0.55));
  }
  const takeup = cylinder(0.13, 0.13, 1.2, brassLight, 0, 1.7, -0.58, 20);
  takeup.rotation.z = Math.PI / 2;
  outputGroup.add(takeup);
  outputGroup.add(box(1.0, 0.04, 0.5, brass, 0, 0.45, 0.8));

  // A long back shaft ties store and mill; it is a visual "control bus".
  group.add(rodBetween([-2.1, 1.15, -2.45], [1.5, 1.4, -2.45], 0.05, iron));
  group.add(rodBetween([1.5, 1.4, -2.45], [5.15, 1.25, -0.2], 0.05, iron));

  const hotspots: ExhibitHotspot[] = [
    { id: 'input', label: '穿孔卡输入', detail: '穿孔卡是分析机的程序与数据载体；卡片序列经阅读器变成机器动作。', position: [-5.6, 2.15, 1.7] },
    { id: 'store', label: 'store 存储', detail: '齿轮寄存器以十进制位保存数字；分析机的 store 是独立于运算的存储层。', position: [-2.2, 2.8, -1.6] },
    { id: 'mill', label: 'mill 运算', detail: '40→20→25→15 齿的传动链把动力分配给运算齿轮；这是机械 ALU 的缩影。', position: [2.0, 2.95, -1.0] },
    { id: 'control', label: '指令 barrel', detail: 'barrel 上的销钉按顺序触发操作；它把“程序”变成可更换的机械控制。', position: [0.4, 1.8, 3.25] },
    { id: 'output', label: '打印机', detail: '结果由打印机构写到纸带；输出让机械计算的中间状态可见。', position: [5.4, 2.0, 1.3] },
  ];

  const modulePositions = {
    input: inputGroup.position.clone(),
    store: storeGroup.position.clone(),
    mill: millGroup.position.clone(),
    control: controlGroup.position.clone(),
    output: outputGroup.position.clone(),
  };

  let explode = 0;

  return {
    group,
    hotspots,
    camera: { position: [11.8, 7.2, 13.2], target: [0, 0.95, 0] },
    setExplode(factor) {
      explode = factor;
      inputGroup.position.set(modulePositions.input.x - factor * 1.2, modulePositions.input.y, modulePositions.input.z + factor * 0.7);
      storeGroup.position.set(modulePositions.store.x - factor * 0.4, modulePositions.store.y + factor * 0.45, modulePositions.store.z - factor * 1.2);
      millGroup.position.set(modulePositions.mill.x, modulePositions.mill.y + factor * 1.4, modulePositions.mill.z - factor * 0.2);
      controlGroup.position.set(modulePositions.control.x, modulePositions.control.y + factor * 0.55, modulePositions.control.z + factor * 1.4);
      outputGroup.position.set(modulePositions.output.x + factor * 1.2, modulePositions.output.y, modulePositions.output.z + factor * 0.4);
    },
    onFrame(elapsed, delta) {
      for (const item of gears) item.mesh.rotation.z += item.speed * delta;
      storeCarriage.position.y = 0.58 + (Math.sin(elapsed * 0.9) * 0.5 + 0.5) * 1.55;
      barrelAssembly.rotation.x = Math.sin(elapsed * 0.32) * 0.18 * (0.2 + explode);
      const cardSpeed = 0.12 + explode * 0.05;
      for (const sheet of cards) {
        const offset = (Number(sheet.userData.index) * 0.22 + elapsed * cardSpeed) % 1.98;
        sheet.position.x = -0.99 + offset;
        sheet.position.y = 1.3 + Math.sin(offset * Math.PI / 1.98) * 0.035;
      }
      platen.rotation.x += delta * 0.15;
    },
  };
}
