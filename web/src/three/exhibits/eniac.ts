import * as THREE from 'three';
import type { ExhibitBuild } from '../stage';
import { addAccentRing, addPlaneBase, addTrace, box, cylinder, edges, standard } from '../helpers';

const ORANGE = 0xf5b955;
const BLUE = 0x64d8ff;

export function buildEniac(): ExhibitBuild {
  const group = new THREE.Group();
  addPlaneBase(group, 5.4, 0x0a1118);
  addAccentRing(group, 4.6, ORANGE);

  const bodyMaterial = standard(0x18222c, { roughness: 0.72, metalness: 0.35 });
  const panelMaterial = standard(0x0e151c, { roughness: 0.8, metalness: 0.2 });
  const frameMaterial = standard(0x263440, { roughness: 0.5, metalness: 0.55 });
  const tubeMaterial = standard(0x3a2a18, {
    roughness: 0.22,
    metalness: 0.1,
    emissive: ORANGE,
    emissiveIntensity: 1.6,
  });
  const socketMaterial = standard(0x303944, { roughness: 0.4, metalness: 0.7 });

  const cabinetGroups: THREE.Group[] = [];
  const panelGroups: THREE.Group[] = [];
  const basePositions = [-2.8, 0, 2.8];

  basePositions.forEach((baseX, index) => {
    const cabinet = new THREE.Group();
    cabinet.position.x = baseX;
    group.add(cabinet);
    cabinetGroups.push(cabinet);

    const body = box(1.7, 3.25, 1.1, bodyMaterial, 0, 0.18, 0);
    cabinet.add(body, edges(body, 0x7a94a3, 0.18));

    const top = box(1.82, 0.16, 1.2, frameMaterial, 0, 1.86, 0);
    cabinet.add(top);

    const foot = box(1.8, 0.18, 1.2, frameMaterial, 0, -1.35, 0);
    cabinet.add(foot);

    const panel = new THREE.Group();
    panel.position.z = 0.61;
    cabinet.add(panel);
    panelGroups.push(panel);

    const face = box(1.55, 2.88, 0.06, panelMaterial, 0, 0.16, 0);
    panel.add(face, edges(face, 0x49616f, 0.28));

    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        const x = (col - 1) * 0.43;
        const y = -0.9 + row * 0.62;

        const socket = cylinder(0.085, 0.085, 0.07, socketMaterial, x, y - 0.18, 0.02, 12);
        socket.rotation.x = Math.PI / 2;
        panel.add(socket);

        const tube = cylinder(0.05, 0.075, 0.32, tubeMaterial, x, y, 0.05, 12);
        panel.add(tube);

        const glow = cylinder(0.018, 0.018, 0.2, tubeMaterial, x, y, 0.05, 8);
        panel.add(glow);

        if (index === 2 && row < 3 && col < 3) {
          const switchBox = box(0.09, 0.09, 0.04, standard(0xb8d7e6, { emissive: BLUE, emissiveIntensity: 0.55 }), x - 0.48, y - 0.05, 0.05);
          panel.add(switchBox);
        }
      }
    }

    if (index === 2) {
      for (let row = 0; row < 5; row += 1) {
        for (let col = 0; col < 4; col += 1) {
          const light = box(
            0.09,
            0.05,
            0.035,
            standard(col % 2 === 0 ? BLUE : ORANGE, {
              emissive: col % 2 === 0 ? BLUE : ORANGE,
              emissiveIntensity: 0.85,
            }),
            -0.55 + col * 0.18,
            -1.05 + row * 0.16,
            0.085,
          );
          panel.add(light);
        }
      }
    }
  });

  for (let index = 0; index < 2; index += 1) {
    addTrace(
      group,
      [
        [basePositions[index], 1.95, 0],
        [basePositions[index] + 0.4, 2.35, -0.25],
        [basePositions[index + 1] - 0.35, 2.25, 0.1],
        [basePositions[index + 1], 1.95, 0.25],
      ],
      index === 0 ? ORANGE : BLUE,
      0.028,
    );
  }

  for (let i = 0; i < 8; i += 1) {
    const y = -1.15 + i * 0.32;
    const led = box(0.06, 0.06, 0.05, standard(BLUE, { emissive: BLUE, emissiveIntensity: 1.4 }), -3.9, y, 0.4);
    group.add(led);
  }

  let pulse = 1.5;
  const tubeMaterials = [tubeMaterial];

  return {
    group,
    hotspots: [
      { id: 'cabinets', label: '机柜阵列', detail: 'ENIAC 由大量机柜组成，重量约 27 吨。机柜不是外壳，而是器件、供电与接线的空间组织。', position: [-2.8, 2.2, 0.9] },
      { id: 'tubes', label: '电子管', detail: '约 17,468 只电子管，以微秒级开关速度执行计算。每只管子都在消耗功率并发热，可靠性因此成为系统级问题。', position: [0, 1.2, 1.05] },
      { id: 'program', label: '接线与开关', detail: '程序通过接线板和开关设置，而不是存放在存储器中。换一道题往往要重新插线，这让机器无法成为通用信息处理平台。', position: [2.8, 1.05, 1.0] },
      { id: 'power', label: '供电与散热', detail: '约 150 kW 功耗，散热与故障率是系统级约束。电子管时代的工程设计，已经提前遇到今天数据中心仍在面对的功耗墙。', position: [0, -1.05, 1.05] },
    ],
    camera: { position: [8.4, 5.2, 8.4], target: [0, 0.2, 0] },
    setExplode(factor) {
      cabinetGroups.forEach((cabinet, index) => {
        cabinet.position.x = basePositions[index] + (index - 1) * factor * 1.0;
      });
      panelGroups.forEach((panel) => {
        panel.position.z = 0.61 + factor * 0.9;
      });
      pulse = 1 + factor * 0.6;
    },
    onFrame(elapsed) {
      tubeMaterial.emissiveIntensity = (pulse + Math.sin(elapsed * 2.2) * 0.32) * 0.9;
      for (const material of tubeMaterials) material.needsUpdate = true;
    },
  };
}
