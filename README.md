# CS Atlas · 计算机系统图谱

> 沿时间拆解计算机：从电子管机柜到 AI 加速器，用时间轴、3D 展品和可计算的模型，理解计算机硬件为什么是今天这个样子。

**Status: early scaffold / M0–M1 WIP.** 当前仓库是项目骨架，尚不是可运行版本。正式内容与实现将在 M1 垂直切片中替换。

## 项目定位

CS Atlas 是一个按历史时间线性展示计算机硬件的全栈学习应用，并回答教材导言中的七个核心问题：

1. 高级语言程序如何被翻译成机器语言，硬件如何执行？
2. 软件与硬件之间的接口是什么？
3. 什么决定程序性能，程序员如何改进？
4. 硬件设计者如何提升性能？
5. 硬件/程序员如何改善能效？
6. 为什么从串行走向并行，结果如何？
7. 1951 年以来有哪些伟大思想？

## 技术栈

- 前端：React 19 + Vite + TypeScript + Three.js
- 后端：Node.js 22 + Express 5 + SQLite
- 渲染：程序化几何的“技术插画”3D，不使用外部 GLB
- 运行形态：本地单机 Web 应用

## 当前状态

- [x] 技术栈与产品方向确定
- [x] 时间轴 + 七个必答问题双轴信息架构
- [x] 数据模型、API 契约、内容地图、3D 规范
- [ ] 数据层加固（schema / migrations / seed upsert / 通用批注）
- [ ] M1：3 个时代、6 台机器、ENIAC/H100 展品、Q1/Q3、GPU 模块、3 个计算器

详细规划与架构文档维护在本地 Obsidian 项目库中，并会在里程碑节点归档。

## 目录（目标）

```text
data/                 # 内容源与 schema（M1 加入）
server/src/           # Express API、SQLite、播种
server/test/          # API / 数据测试
web/src/              # React SPA、时间轴、问题页、3D 展品
scripts/              # 数据校验、归档
```

## 本地运行（M1 目标）

```bash
npm install
npm run build
npm start        # http://127.0.0.1:8787
```

> 当前脚手架尚未完成，`npm start` 不是最终形态；M1 会补齐可运行链路。

## 规划中的 M1

- 1940s / 1980s / 2020s 三个时代
- ENIAC、H100 两个机器展品 + `datapath` 概念展品
- Q1 程序到机器、Q3 程序性能
- GPU 为什么快
- CPU 性能、Cache AMAT、Roofline 三个计算器
- 机器/问题收藏与笔记

## License

TBD.
