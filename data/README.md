# data

M1 之前的数据目录。

- `seed.json`：**开发占位数据**，只用于验证 schema、API 与页面骨架；不是最终历史内容，M1 会整体替换。
- `cs-atlas.db`：运行时生成的 SQLite 文件，不提交。

## 命令

```bash
npm run check:data
npm run seed
```

正式内容将遵循 Obsidian 项目库中的「数据模型与 ERD」「时间线内容地图」。
