export type SceneKey =
  | 'tube-mainframe'
  | 'gpu-accelerator'
  | 'datapath'
  | 'memory-hierarchy'
  | 'mechanical-analytical-engine'
  | 'mechanical-pascal'
  | 'mechanical-leibniz'
  | 'mechanical-jacquard'
  | 'mechanical-hollerith';

export type SceneMode = 'single' | 'pipeline';

export interface SceneMeta {
  label: string;
  caption: string;
  explodable?: boolean;
  modes?: Array<{ id: SceneMode; label: string }>;
}

export const sceneMeta: Record<SceneKey, SceneMeta> = {
  'tube-mainframe': {
    label: '电子管机柜',
    caption: '程序靠接线与开关设置；电子管的速度与功耗共同定义第一代计算机。',
    explodable: true,
  },
  'gpu-accelerator': {
    label: 'GPU 加速卡',
    caption: 'GPU Die、HBM 与 NVLink 组成吞吐优先的 AI 加速系统。',
    explodable: true,
  },
  datapath: {
    label: '数据通路',
    caption: '从 PC 取指，到寄存器、ALU 与访存，观察一条指令如何走完执行循环。',
    modes: [
      { id: 'single', label: '单周期' },
      { id: 'pipeline', label: '流水线' },
    ],
  },
  'memory-hierarchy': {
    label: '存储层次',
    caption: '从寄存器到 SSD：容量越大，延迟越高；局部性决定你落在哪一层。',
  },
  'mechanical-analytical-engine': {
    label: '巴贝奇分析机',
    caption: '穿孔卡输入、齿轮 store、mill 运算、指令 barrel 与打印机；主传动为 40→20→25→15 齿。',
    explodable: true,
  },
  'mechanical-pascal': {
    label: '帕斯卡加法器',
    caption: '数字轮、进位爪与手摇曲柄：自动进位第一次成为可操作的机械机构。',
    explodable: true,
  },
  'mechanical-leibniz': {
    label: '莱布尼茨计算器',
    caption: '步进鼓把乘除分解为重复加减，设定滑块与累加器共同完成多位运算。',
    explodable: true,
  },
  'mechanical-jacquard': {
    label: '杰卡德织布机',
    caption: '穿孔卡链经过阅读棱柱，提花针按孔位选择经线；程序第一次脱离机器结构。',
    explodable: true,
  },
  'mechanical-hollerith': {
    label: '霍列瑞斯制表机',
    caption: '穿孔卡、阅读针、计数器与分选箱：人口普查把机械数据处理推向规模化。',
    explodable: true,
  },
};

export function isSceneKey(value: string | null | undefined): value is SceneKey {
  return Boolean(value && value in sceneMeta);
}
