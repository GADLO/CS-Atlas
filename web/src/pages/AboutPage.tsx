import { Link } from 'react-router-dom';
import { ArrowRight, Compass, GitBranch, Layers3, Library, Orbit, Quote, ShieldCheck } from 'lucide-react';
import { Badge } from '../components/ui';

const readingSteps = [
  {
    number: '01',
    title: '先沿时间走一遍',
    body: '从电子管机柜到 AI 加速器，先看机器的外形、功耗与使用场景如何变化。时间轴不是背景，它解释“为什么当时只能这样做”。',
    to: '/',
    action: '进入时间长廊',
  },
  {
    number: '02',
    title: '再拆开一台机器',
    body: '进入机器页，拖动 3D 展柜的拆解滑块，点开热点，再读规格、关系与来源。把“机器”拆成器件、存储、互连与软件契约。',
    to: '/machine/eniac',
    action: '拆开 ENIAC',
  },
  {
    number: '03',
    title: '最后回到七个问题',
    body: '历史提供例子，问题提供结构。Q1 解释程序如何落到指令，Q3 解释性能从哪里来；再用计算器把公式变成可操作的数字。',
    to: '/questions',
    action: '打开七个问题',
  },
];

export default function AboutPage() {
  return (
    <div className="page page--about">
      <header className="about-hero">
        <div className="eyebrow">
          <Orbit size={13} aria-hidden="true" /> 关于这本图谱
        </div>
        <h1>不是一本百科，<br /><em>是一条可以走进去的时间线</em></h1>
        <p className="about-hero__lede">
          CS Atlas 想回答的不是“某年某月发生了什么”，而是：为什么计算机长成今天这样？
          为什么程序能驱动硬件？为什么性能会卡在带宽、功耗与并行度上？
        </p>
        <div className="about-hero__meta">
          <Badge tone="accent">时间主线 + 章节镜头 + 七个问题</Badge>
          <Badge tone="neutral">M1 · 4 个时期</Badge>
          <Badge tone="neutral">本地 · SQLite</Badge>
        </div>
      </header>

      <section className="about-grid">
        <div className="about-prose">
          <div className="eyebrow">
            <Quote size={13} aria-hidden="true" /> 为什么做这个
          </div>
          <h2>把“计算机组成”从公式里拉回历史</h2>
          <p>
            教材把计算机拆成指令、数据通路、流水线、存储层次与并行。这些抽象很准确，但也容易变成一张没有时间的图。
            真实机器不是从抽象里长出来的：ENIAC 的程序靠接线，IBM PC 靠开放生态，H100 靠 HBM 与 NVLink。
          </p>
          <p>
            所以这个项目采用双轴：一条是历史时间轴，解释机器为什么呈现某种形态；另一条是教材导言的七个问题，
            解释这些形态背后反复出现的原理。时间轴给例子，问题给结构，两者互相校验。
          </p>
          <p>
            它也不是“3D 模型展示”。3D 只是解释工具：拆开外壳，看到电子管、HBM 或数据通路，再把注意力还给文字与来源。
            所有展品都标注“非等比复原”，不假装是工程图纸。
          </p>
        </div>
        <aside className="about-callout">
          <div className="about-callout__icon">
            <Compass size={22} aria-hidden="true" />
          </div>
          <h3>一句话定位</h3>
          <p>
            一台可以上手拆解的计算机历史博物馆：沿时间看形态，沿问题看原理，用 3D 和计算器把抽象变成可观察的对象。
          </p>
          <div className="about-callout__foot">M1 是垂直切片，不是完整 V1。</div>
        </aside>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <div className="eyebrow">怎么读</div>
            <h2>三种入口，一条主路径</h2>
            <p>不必按顺序读完。第一次来，建议先走一遍“时间 → 机器 → 问题”。</p>
          </div>
        </div>
        <div className="about-steps">
          {readingSteps.map((step) => (
            <article className="about-step" key={step.number}>
              <span className="about-step__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <Link className="text-link" to={step.to}>
                {step.action} <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section about-two-col">
        <div>
          <div className="eyebrow">
            <Layers3 size={13} aria-hidden="true" /> 双轴结构
          </div>
          <h2>时间轴回答“为什么是这样”，问题回答“原理是什么”</h2>
          <p>
            时间轴上的每个时代都包含代表机器、关键事件与一次技术转折。它不追求完整编年，而是选择能解释“形态变化”的节点：
            从电子管到微处理器，从桌面到加速器。
          </p>
          <p>
            七个问题则提供稳定的坐标系。Q1 从源码走到机器指令，Q2 讨论软硬件接口，Q3 拆解性能，
            Q4 看硬件设计者的手段，Q5 看能效，Q6 看并行，Q7 收束为八个伟大思想。
          </p>
          <p>
            一个页面可以同时属于两条轴：机器页回答“它是什么”，问题页回答“它为什么重要”。这让历史不是孤立的年份，
            而是可以被问题反复调用的证据。
          </p>
        </div>
        <div className="about-principles">
          <div className="principle">
            <GitBranch size={16} />
            <div>
              <strong>时间给约束</strong>
              <p>同样的原理，在不同器件与成本下会得到不同实现。</p>
            </div>
          </div>
          <div className="principle">
            <Library size={16} />
            <div>
              <strong>问题给结构</strong>
              <p>七个问题让内容可被验收，而不是无限扩张的百科条目。</p>
            </div>
          </div>
          <div className="principle">
            <ShieldCheck size={16} />
            <div>
              <strong>来源给边界</strong>
              <p>事实、数字与解释分层标注；不确定的地方明确说“待核实”。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <div className="eyebrow">五层标准</div>
            <h2>什么才算“回答了一个问题”</h2>
            <p>页面存在不等于回答完成。每个已发布问题都要走完这五层。</p>
          </div>
        </div>
        <div className="layer-grid">
          {[
            ['01', '直接答案', '先用几句话回答，不绕开问题。'],
            ['02', '机制', '解释为什么，给出因果链与关键概念。'],
            ['03', '历史实例', '把机制放回一台机器、一个时代或一次取舍。'],
            ['04', '可验证交互', '用 3D、计算器或 quiz 让读者自己验证。'],
            ['05', '自测与来源', '用问题检查理解，并给出可追溯的来源。'],
          ].map(([number, title, body]) => (
            <div className="layer-card" key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section about-two-col">
        <div>
          <div className="eyebrow">数据与方法</div>
          <h2>哪些是事实，哪些是解释</h2>
          <p>
            机器规格、年份与来源尽量回到一手资料或教材；解释性段落明确是“我如何理解”。M1 的 seed 仍是首批内容，
            史实与数值需要继续人工复核，尤其是功耗、晶体管数量与性能数字。
          </p>
          <p>
            3D 展品是程序化几何的解释性抽象：ENIAC 的机柜比例、H100 的芯片布局、数据通路的连线都经过简化，
            目的是让结构可见，而不是还原工程细节。
          </p>
          <p>
            批注与收藏只保存在本地 SQLite，不上传服务器；重新播种内容时，用户笔记会被保留。当前项目是本地单机应用，
            不提供账号与云同步。
          </p>
        </div>
        <div className="about-code">
          <div className="eyebrow">本地运行</div>
          <pre><code>{`npm install
npm run dev      # API :8787 + Vite :5173
npm run build
npm start        # http://127.0.0.1:8787

npm test
npm run check:data
npm run check:questions`}</code></pre>
          <p>如果本地数据库来自旧 schema，先运行 <code>npm run db:reset</code>。</p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <div className="eyebrow">边界</div>
            <h2>这个版本还没有做什么</h2>
          </div>
        </div>
        <ul className="about-limits">
          <li>当前是 4 个时期、78 个时间节点、10 个章节镜头；M2 再补更细的机器与内容。</li>
          <li>Q1/Q3 已发布，其余 5 题仍是草稿；它们不会伪装成“已完成”。</li>
          <li>Macintosh 仍是静态插图；ENIAC/H100 是解释性 3D，不是精确复原。</li>
          <li>缺少 schema migrations 与前端自动化测试；旧数据库需要重置。</li>
          <li>内容来源与史实仍需人工复核，尤其是具体数字与年代。</li>
        </ul>
      </section>

      <div className="about-cta">
        <div>
          <div className="eyebrow">开始</div>
          <h2>从一台机器，或一个问题开始</h2>
          <p>如果你只有五分钟，先看 ENIAC 或 H100；如果你想理解原理，直接去 Q1 与 Q3。</p>
        </div>
        <div className="about-cta__actions">
          <Link className="button button--primary" to="/machine/eniac">
            拆开 ENIAC <ArrowRight size={15} />
          </Link>
          <Link className="button button--ghost" to="/questions">
            七个问题 <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
