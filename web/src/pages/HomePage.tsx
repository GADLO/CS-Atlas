const stack = [
  ['前端', 'React 19 + Vite + TypeScript + Three.js'],
  ['后端', 'Node 22 + Express 5 + SQLite'],
  ['产品', '时间轴 + 七个必答问题'],
];

export default function HomePage() {
  return (
    <main className="shell">
      <p className="eyebrow">CS ATLAS / SCAFFOLD</p>
      <h1>
        计算机系统<span>图谱</span>
      </h1>
      <p className="lede">
        沿时间拆解计算机：从电子管机柜到 AI 加速器。当前是 M1 前的结构骨架，
        业务页面将在后续里程碑接入。
      </p>

      <section className="grid" aria-label="项目技术栈">
        {stack.map(([label, value]) => (
          <article className="card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="panel">
        <h2>下一步</h2>
        <ol>
          <li>数据层加固：schema、migrations、seed upsert、通用批注</li>
          <li>M1 垂直切片：3 个时代、6 台机器、2 个机器展品 + datapath</li>
          <li>Q1 程序到机器、Q3 程序性能与三个计算器</li>
        </ol>
        <p className="hint">
          API 健康检查：<code>/api/health</code> · 规划文档在 Obsidian 的「计算机系统全栈」
        </p>
      </section>
    </main>
  );
}
