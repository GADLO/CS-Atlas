import { loadSeedData } from '../server/src/validation/seed.js';

const data = loadSeedData(process.argv[2] || 'data/seed.json');
const questions = [...data.questions].sort((a, b) => a.number - b.number);
const published = questions.filter((question) => question.status === 'published');

console.log(`✓ 问题数据校验通过`);
console.log(`  共 ${questions.length} 题，已发布 ${published.length} 题`);
for (const question of questions) {
  const scene = question.sceneKeys?.length ? question.sceneKeys.join(', ') : '—';
  const calculator = question.calculator || '—';
  console.log(
    `  Q${question.number} ${question.slug} [${question.status}] scenes=${scene} calculator=${calculator} anchors=${question.timelineAnchors?.length ?? 0}`,
  );
}

const missingCoverage = published.filter(
  (question) =>
    (question.timelineAnchors?.length ?? 0) < 2 ||
    (!(question.sceneKeys?.length ?? 0) && !question.calculator) ||
    (question.quiz?.length ?? 0) < 3 ||
    (question.sources?.length ?? 0) < 3,
);
if (missingCoverage.length) {
  console.error(`✗ 已发布问题未达到五层覆盖：${missingCoverage.map((question) => question.slug).join(', ')}`);
  process.exit(1);
}
console.log('  published 问题均满足时间线锚点 / 交互 / 自测 / 来源要求');
