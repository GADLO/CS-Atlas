# data

M1 data foundation.

- `seed.json`：M1 垂直切片的数据源。目前包含 3 个时代、20 个实体、7 个事件、7 个必答问题（2 个 published）、1 个 AI 模块；不是完整 V1，M2 继续扩展。
- `cs-atlas.db`：运行时生成的 SQLite 文件，不提交。

## 命令

```bash
npm run check:data
npm run check:questions
npm run seed
npm run db:reset   # 删除本地 SQLite（schema 变化时）
```

正式内容遵循 Obsidian 项目库中的「数据模型与 ERD」「时间线内容地图」。
