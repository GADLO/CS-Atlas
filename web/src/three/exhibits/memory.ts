import * as THREE from 'three';
import type { ExhibitBuild } from '../stage';
import { addAccentRing, addPlaneBase, addTrace, box, edges, standard } from '../helpers';

const BLUE = 0x64d8ff;
const GREEN = 0x76e6a8;
const VIOLET = 0x9b8cff;

export function buildMemoryHierarchy(): ExhibitBuild {
  const group = new THREE.Group();
  addPlaneBase(group, 5.2, 0x071016);
  addAccentRing(group, 4.5, VIOLET);

  const layers = [
    { label: '寄存器', width: 1.1, depth: 1.1, y: 2.5, color: GREEN, detail: '最快、最小、由编译器/ISA 直接管理。寄存器数量有限，编译器必须做分配与溢出。' },
    { label: 'L1 Cache', width: 1.9, depth: 1.5, y: 1.75, color: BLUE, detail: '每核私有，命中延迟约数周期。L1 的容量与相联度直接影响命中率。' },
    { label: 'L2 Cache', width: 2.7, depth: 1.9, y: 1.0, color: BLUE, detail: '更大但仍快，常为每核私有。L2 用来吸收 L1 装不下的工作集。' },
    { label: 'L3 Cache', width: 3.5, depth: 2.3, y: 0.25, color: VIOLET, detail: '多核共享，决定跨核数据复用。一致性协议与容量竞争会让共享 Cache 的表现复杂化。' },
    { label: 'DRAM', width: 4.4, depth: 2.7, y: -0.5, color: VIOLET, detail: '容量大、延迟高；带宽常是 AI 瓶颈。数据从 DRAM 搬到计算单元的能量远高于一次算术。' },
    { label: 'SSD / 存储', width: 5.1, depth: 3.1, y: -1.15, color: 0x5b6d7d, detail: '持久化层级，延迟以微秒/毫秒计。它决定了程序启动、数据加载与检查点的成本。' },
  ];

  for (const layer of layers) {
    const material = standard(0x111a24, {
      roughness: 0.36,
      metalness: 0.48,
      emissive: layer.color,
      emissiveIntensity: 0.1,
    });
    const slab = box(layer.width, 0.26, layer.depth, material, 0, layer.y, 0);
    group.add(slab, edges(slab, layer.color, 0.55));
    const top = box(layer.width * 0.72, 0.03, layer.depth * 0.72, standard(layer.color, {
      emissive: layer.color,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    }), 0, layer.y + 0.145, 0);
    group.add(top);
  }

  for (let index = 0; index < 5; index += 1) {
    const from = layers[index];
    const to = layers[index + 1];
    addTrace(
      group,
      [
        [from.width * 0.32, from.y - 0.1, 0.35],
        [from.width * 0.4, (from.y + to.y) / 2, 0.55],
        [to.width * 0.32, to.y + 0.1, 0.35],
      ],
      index % 2 === 0 ? BLUE : VIOLET,
      0.018,
    );
  }

  return {
    group,
    hotspots: layers.map((layer) => ({
      id: layer.label.toLowerCase().replace(/\s+/g, '-'),
      label: layer.label,
      detail: layer.detail,
      position: [layer.width * 0.55, layer.y + 0.2, layer.depth * 0.55] as [number, number, number],
    })),
    camera: { position: [7.4, 5.6, 8.4], target: [0, 0.29, 0] },
  };
}
