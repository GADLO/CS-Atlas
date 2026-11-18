import * as THREE from 'three';
import type { ExhibitBuild } from '../stage';
import { addAccentRing, addPlaneBase, addTrace, box, cylinder, edges, standard } from '../helpers';

const GREEN = 0x76e6a8;
const GOLD = 0xd8b45a;

function fan(x: number, material: THREE.Material, bladeMaterial: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0.78, 0);
  const rim = cylinder(0.66, 0.66, 0.12, material, 0, 0, 0, 40);
  const hub = cylinder(0.16, 0.16, 0.16, material, 0, 0.04, 0, 24);
  group.add(rim, hub);
  for (let index = 0; index < 7; index += 1) {
    const blade = box(0.48, 0.04, 0.16, bladeMaterial, 0.3, 0.08, 0);
    blade.rotation.y = (index / 7) * Math.PI * 2;
    const pivot = new THREE.Group();
    pivot.rotation.y = (index / 7) * Math.PI * 2;
    pivot.add(blade);
    group.add(pivot);
  }
  return group;
}

export function buildH100(): ExhibitBuild {
  const group = new THREE.Group();
  addPlaneBase(group, 5.6, 0x081014);
  addAccentRing(group, 4.8, GREEN);

  const trayMaterial = standard(0x10171f, { roughness: 0.58, metalness: 0.6 });
  const pcbMaterial = standard(0x0c2a22, { roughness: 0.52, metalness: 0.32 });
  const metalMaterial = standard(0x9aa8b4, { roughness: 0.25, metalness: 0.92 });
  const darkMetal = standard(0x303a44, { roughness: 0.4, metalness: 0.75 });
  const dieMaterial = standard(0x0e3b2b, {
    roughness: 0.18,
    metalness: 0.35,
    emissive: GREEN,
    emissiveIntensity: 1.1,
  });
  const hbmMaterial = standard(0x16201e, { roughness: 0.34, metalness: 0.48, emissive: GREEN, emissiveIntensity: 0.16 });
  const goldMaterial = standard(GOLD, { roughness: 0.28, metalness: 0.92 });

  const tray = box(7.2, 0.22, 3.2, trayMaterial, 0, -0.78, 0);
  group.add(tray, edges(tray, 0x6a7d8a, 0.25));

  const pcb = box(6.8, 0.16, 2.9, pcbMaterial, 0, -0.5, 0);
  group.add(pcb, edges(pcb, GREEN, 0.22));

  for (let index = 0; index < 16; index += 1) {
    const finger = box(0.16, 0.05, 0.38, goldMaterial, -3.2 + index * 0.42, -0.88, 1.32);
    group.add(finger);
  }

  const die = box(1.62, 0.2, 1.62, dieMaterial, 0, -0.32, 0);
  group.add(die, edges(die, 0xa8ffe0, 0.55));

  const hbmStacks: THREE.Mesh[] = [];
  const hbmPositions: Array<[number, number]> = [
    [-1.42, -0.52],
    [-1.42, 0.52],
    [1.42, -0.52],
    [1.42, 0.52],
  ];
  for (const [x, z] of hbmPositions) {
    const stack = box(0.62, 0.28, 0.46, hbmMaterial, x, -0.28, z);
    group.add(stack, edges(stack, GREEN, 0.35));
    hbmStacks.push(stack);
    for (let layer = 0; layer < 3; layer += 1) {
      const slice = box(0.64, 0.02, 0.48, standard(0x0a1512, { roughness: 0.4, metalness: 0.3 }), x, -0.4 + layer * 0.07, z);
      group.add(slice);
    }
  }

  const bridgeMaterial = standard(0x22303a, { roughness: 0.3, metalness: 0.8 });
  for (const [x, z] of [[-2.05, 0], [2.05, 0], [0, -0.95], [0, 0.95]] as Array<[number, number]>) {
    const bridge = box(0.2, 0.08, 0.84, bridgeMaterial, x, -0.34, z);
    group.add(bridge);
  }

  const cooler = new THREE.Group();
  cooler.position.y = 0.72;
  group.add(cooler);
  const shroud = box(6.7, 0.42, 2.85, darkMetal, 0, 0.5, 0);
  cooler.add(shroud, edges(shroud, 0xb8ccda, 0.22));
  const topPlate = box(6.4, 0.05, 2.55, metalMaterial, 0, 0.74, 0);
  cooler.add(topPlate);

  const fanMaterial = standard(0x161d24, { roughness: 0.45, metalness: 0.65 });
  const bladeMaterial = standard(0x394955, { roughness: 0.32, metalness: 0.72 });
  const fans = [fan(-2.1, fanMaterial, bladeMaterial), fan(0, fanMaterial, bladeMaterial), fan(2.1, fanMaterial, bladeMaterial)];
  for (const item of fans) cooler.add(item);

  for (const [x, z] of [[-2.65, 1.46], [2.65, 1.46], [-2.65, -1.46], [2.65, -1.46]] as Array<[number, number]>) {
    const nv = box(0.44, 0.16, 0.28, metalMaterial, x, -0.38, z);
    group.add(nv, edges(nv, GOLD, 0.4));
  }

  const power = box(0.52, 0.22, 0.36, darkMetal, -2.9, -0.34, -1.02);
  group.add(power);

  for (let index = 0; index < 5; index += 1) {
    addTrace(
      group,
      [
        [-3.0, -0.48, -1.28 + index * 0.1],
        [-2.0, -0.4, -1.1],
        [-1.2, -0.32, -0.6],
      ],
      GREEN,
      0.014,
    );
  }

  let explode = 0;
  let baseCoolerY = 0.72;
  let diePulse = 0;

  return {
    group,
    hotspots: [
      { id: 'die', label: 'GPU Die', detail: 'Tensor Core 与 CUDA Core 在这里执行矩阵与并行负载。芯片面积、功耗与良率共同限制单 die 能放多少计算单元。', position: [0, -0.1, 0] },
      { id: 'hbm', label: 'HBM 堆叠', detail: '高带宽显存通过宽接口供给 GPU。矩阵乘反复读取权重与激活值，带宽常比峰值算力更早成为瓶颈。', position: [1.42, 0.0, 0.52] },
      { id: 'cooler', label: '散热与风道', detail: '加速卡把数百瓦功耗转为热量。散热能力决定芯片能否长期维持高频，而不是只决定风扇噪音。', position: [0, 1.55, 0] },
      { id: 'nvlink', label: 'NVLink', detail: '卡间高速互连，让多卡像更大的加速器一样协同。训练大模型时，通信拓扑往往与单卡算力同样重要。', position: [-2.6, -0.15, 1.45] },
      { id: 'pcie', label: 'PCIe 接口', detail: '主机与加速卡之间的标准互连，带宽低于 NVLink。数据要先进 HBM，GPU 才能开始计算；I/O 也可能成为瓶颈。', position: [2.8, -0.62, 1.3] },
    ],
    camera: { position: [7.4, 4.7, 7.2], target: [0, 0.1, 0] },
    setExplode(factor) {
      explode = factor;
      cooler.position.y = baseCoolerY + factor * 1.55;
      for (const stack of hbmStacks) stack.position.y = -0.28 + factor * 0.22;
    },
    onFrame(elapsed) {
      for (const item of fans) item.rotation.y += 0.02 + explode * 0.02;
      diePulse = 1.05 + Math.sin(elapsed * 3.2) * 0.35;
      dieMaterial.emissiveIntensity = diePulse;
      dieMaterial.needsUpdate = true;
    },
  };
}
