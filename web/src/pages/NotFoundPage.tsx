import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="page page--narrow">
      <div className="empty-hero">
        <Compass size={30} aria-hidden="true" />
        <div className="eyebrow">404 / OFF THE MAP</div>
        <h1>这条路径没有展品</h1>
        <p>可能是机器还没进入 M1，也可能是链接写错了。回到时间长廊重新选择。</p>
        <Link className="button button--primary" to="/">
          回到时间长廊
        </Link>
      </div>
    </div>
  );
}
