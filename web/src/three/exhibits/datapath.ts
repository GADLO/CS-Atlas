import * as THREE from 'three';
import type { ExhibitBuild } from '../stage';
import { addAccentRing, addPlaneBase, addPulse, addTrace, box, edges, standard } from '../helpers';

const CYAN = 0x64d8ff;
const AMBER = 0xf5b955;
const VIOLET = 0x9b8cff;
const GREEN = 0x76e6a8;

const blockColors: Record<string, number> = {
  PC: CYAN,
  IMEM: CYAN,
  RF: GREEN,
  ALU: AMBER,
  DMEM: VIOLET,
};

function block(
  group: THREE.Group,
  label: string,
  x: number,
  y: number,
  z: number,
  color: number,
  size: [number, number, number] = [1.55, 0.72, 1.25],
): THREE.Mesh {
  const material = standard(0x121c26, {
    roughness: 0.35,
    metalness: 0.55,
    emissive: color,
    emissiveIntensity: 0.18,
  });
  const mesh = box(size[0], size[1], size[2], material, x, y, z);
  group.add(mesh, edges(mesh, color, 0.62));
  const glow = box(size[0] * 0.72, 0.03, size[2] * 0.76, standard(color, {
    emissive: color,
    emissiveIntensity: 1.4,
    roughness: 0.2,
  }), x, y + size[1] / 2 + 0.015, z);
  group.add(glow);
  return mesh;
}

function buildSingleCycle(group: THREE.Group): ExhibitBuild {
  addPlaneBase(group, 6.3, 0x071016);
  addAccentRing(group, 5.4, CYAN);

  const board = box(11, 0.2, 4.2, standard(0x0a141c, { roughness: 0.72, metalness: 0.34 }), 0, -0.95, 0);
  group.add(board, edges(board, 0x2f5364, 0.35));

  const blocks: Array<{ label: string; x: number }> = [
    { label: 'PC', x: -4.4 },
    { label: 'IMEM', x: -2.2 },
    { label: 'RF', x: 0 },
    { label: 'ALU', x: 2.2 },
    { label: 'DMEM', x: 4.4 },
  ];
  for (const item of blocks) {
    block(group, item.label, item.x, 0, 0, blockColors[item.label]);
  }

  const control = block(group, 'Control', 0, 2.2, -1.4, VIOLET, [2.3, 0.55, 0.8]);
  control.scale.set(1, 1, 1);

  const flowPoints: Array<[number, number, number]> = [
    [-4.4, 0.02, 0.7],
    [-2.2, 0.02, 0.7],
    [0, 0.02, 0.7],
    [2.2, 0.02, 0.7],
    [4.4, 0.02, 0.7],
    [4.4, 0.02, 1.35],
    [2.2, 0.02, 1.35],
    [0, 0.02, 1.35],
  ];
  for (let index = 0; index < flowPoints.length - 1; index += 1) {
    addTrace(group, [flowPoints[index], flowPoints[index + 1]], CYAN, 0.02);
  }

  const path = new THREE.CatmullRomCurve3(flowPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const pulse = addPulse(group, flowPoints[0], CYAN, 0.1);
  addTrace(group, [[0, 1.95, -1.4], [0, 0.4, -0.5]], VIOLET, 0.018);

  return {
    group,
    hotspots: [
      { id: 'pc', label: 'PC 程序计数器', detail: '保存下一条指令地址，驱动取指。分支指令会改变 PC，预测错误时流水线必须冲刷。', position: [-4.4, 0.6, 0.8] },
      { id: 'imem', label: '指令存储器', detail: '按 PC 取指，把机器码送入译码。指令存储器的延迟决定了流水线第一级的成本。', position: [-2.2, 0.6, 0.8] },
      { id: 'rf', label: '寄存器堆', detail: '存放操作数与结果，是 ISA 可见的快速状态。寄存器数量与端口数直接影响指令级并行。', position: [0, 0.6, 0.8] },
      { id: 'alu', label: 'ALU', detail: '执行算术/逻辑运算；结果写回寄存器。ALU 的位宽、延迟与旁路网络决定执行级的吞吐。', position: [2.2, 0.6, 0.8] },
      { id: 'dmem', label: '数据存储器', detail: 'load/store 访问内存；延迟远高于寄存器。Cache 负责把大多数访问留在更快的层次。', position: [4.4, 0.6, 0.8] },
      { id: 'control', label: '控制单元', detail: '根据指令产生读寄存器、ALU 操作与写回信号。控制逻辑把 ISA 语义翻译成数据通路的开关。', position: [0, 2.6, -1.2] },
    ],
    camera: { position: [8.6, 6.2, 8.8], target: [0, 0.3, 0] },
    onFrame(elapsed) {
      const t = (elapsed * 0.16) % 1;
      pulse.position.copy(path.getPointAt(t));
      pulse.scale.setScalar(0.85 + Math.sin(elapsed * 5) * 0.18);
    },
  };
}

function buildPipeline(group: THREE.Group): ExhibitBuild {
  addPlaneBase(group, 6.3, 0x071016);
  addAccentRing(group, 5.4, GREEN);

  const board = box(11, 0.2, 4.2, standard(0x0a141c, { roughness: 0.72, metalness: 0.34 }), 0, -0.95, 0);
  group.add(board, edges(board, 0x2f5364, 0.35));

  const stages = [
    { label: 'IF', x: -4.4, color: CYAN },
    { label: 'ID', x: -2.2, color: CYAN },
    { label: 'EX', x: 0, color: AMBER },
    { label: 'MEM', x: 2.2, color: VIOLET },
    { label: 'WB', x: 4.4, color: GREEN },
  ];
  for (const stage of stages) {
    const column = box(
      1.7,
      0.18,
      3.2,
      standard(0x10202a, { roughness: 0.45, metalness: 0.35, emissive: stage.color, emissiveIntensity: 0.08 }),
      stage.x,
      -0.82,
      0,
    );
    group.add(column, edges(column, stage.color, 0.38));
    const marker = box(0.06, 1.5, 0.06, standard(stage.color, { emissive: stage.color, emissiveIntensity: 1.5 }), stage.x, -0.02, 1.5);
    group.add(marker);
  }

  const tokens: THREE.Mesh[] = [];
  for (let index = 0; index < 3; index += 1) {
    const token = box(
      0.95,
      0.18,
      0.52,
      standard(index === 0 ? CYAN : index === 1 ? AMBER : GREEN, {
        roughness: 0.2,
        metalness: 0.3,
        emissive: index === 0 ? CYAN : index === 1 ? AMBER : GREEN,
        emissiveIntensity: 1.2,
      }),
      0,
      0.25 + index * 0.56,
      0.35,
    );
    group.add(token, edges(token, 0xe6f8ff, 0.4));
    tokens.push(token);
  }

  return {
    group,
    hotspots: stages.map((stage) => ({
      id: stage.label.toLowerCase(),
      label: `${stage.label} 阶段`,
      detail:
        stage.label === 'IF'
          ? '取指：按 PC 读取指令，PC 指向下一条。'
          : stage.label === 'ID'
            ? '译码：读寄存器、生成控制信号。'
            : stage.label === 'EX'
              ? '执行：ALU 运算或计算地址。'
              : stage.label === 'MEM'
                ? '访存：load/store 访问数据存储器。'
                : '写回：把结果写回寄存器堆。',
      position: [stage.x, 1.2, 1.55] as [number, number, number],
    })),
    camera: { position: [9.4, 6.4, 9.6], target: [0, 0.2, 0] },
    onFrame(elapsed) {
      for (let index = 0; index < tokens.length; index += 1) {
        const phase = (elapsed * 0.28 + index * 0.34) % 1;
        tokens[index].position.x = -5.1 + phase * 10.2;
        tokens[index].position.y = 0.25 + index * 0.56 + Math.sin(elapsed * 3 + index) * 0.03;
      }
    },
  };
}

export function buildDatapath(mode: 'single' | 'pipeline' = 'single'): ExhibitBuild {
  const group = new THREE.Group();
  return mode === 'pipeline' ? buildPipeline(group) : buildSingleCycle(group);
}
