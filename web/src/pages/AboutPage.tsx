import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const readingSteps = [
  { number: '01', title: '沿时间走', body: '先看四个时期与三条泳道。', to: '/', action: '打开时间' },
  { number: '02', title: '打开一台机器', body: '查看展品、规格与关联。', to: '/machine/eniac', action: '打开 ENIAC' },
  { number: '03', title: '回到问题', body: '用七个问题检查理解。', to: '/questions', action: '打开问题' },
];

export default function AboutPage() {
  return (
    <div className="page page--about">
      <header className="simple-head">
        <h1>关于</h1>
        <span>CS Atlas</span>
      </header>

      <section className="section">
        <h2>范围</h2>
        <p className="about-lede">
          一条时间主线：4 个时期 × 硬件/软件/算法三泳道，当前 78 个节点、10 个章节镜头、9 个 3D 场景。
          七个必答问题与实验室是主线的派生视图。
        </p>
      </section>

      <section className="section">
        <h2>阅读路径</h2>
        <div className="about-steps">
          {readingSteps.map((step) => (
            <article className="about-step" key={step.number}>
              <span className="about-step__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <Link className="text-link" to={step.to}>{step.action} <ArrowRight size={13} /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>方法</h2>
        <div className="layer-grid">
          {[
            ['01', '直接答案', '先回答问题。'],
            ['02', '机制', '解释因果关系。'],
            ['03', '历史实例', '放回具体机器。'],
            ['04', '交互', '用 3D 或计算器验证。'],
            ['05', '来源', '保留可追溯引用。'],
          ].map(([number, title, body]) => (
            <div className="layer-card" key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>边界</h2>
        <ul className="about-limits">
          <li>4 个时期、78 个节点、10 个镜头、9 个 3D 场景。</li>
          <li>Q1/Q3 已发布，其余 5 题仍是草稿。</li>
          <li>3D 是解释性抽象，不是工程复原。</li>
          <li>自动 migrations 已完成；前端 E2E 尚未完成。</li>
          <li>来源与具体数字仍需人工复核。</li>
        </ul>
      </section>

      <section className="section">
        <h2>运行</h2>
        <div className="about-code">
          <pre><code>{`npm install
npm run dev
npm run build
npm start

npm test
npm run check:data`}</code></pre>
        </div>
      </section>
    </div>
  );
}
