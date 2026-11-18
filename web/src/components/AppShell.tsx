import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BookMarked,
  Clock3,
  FlaskConical,
  GitBranch,
  HelpCircle,
  Info,
  Menu,
  NotebookPen,
  Orbit,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/', label: '时间', icon: Clock3, end: true },
  { to: '/lenses', label: '章节镜头', icon: BookMarked, end: false },
  { to: '/questions', label: '七个问题', icon: HelpCircle, end: false },
  { to: '/lab', label: '实验室', icon: FlaskConical, end: false },
  { to: '/notes', label: '我的笔记', icon: NotebookPen, end: false },
  { to: '/about', label: '关于这本图谱', icon: Info, end: false },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <ScrollToTop />
      <a className="skip-link" href="#main-content">跳到主要内容</a>

      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <NavLink to="/" className="brand">
            <span className="brand__mark"><Orbit size={22} aria-hidden="true" /></span>
            <span>
              <strong>CS ATLAS</strong>
              <small>计算机系统图谱</small>
            </span>
          </NavLink>
          <button type="button" className="sidebar__close" onClick={() => setOpen(false)} aria-label="关闭导航">
            <X size={18} />
          </button>
        </div>

        <div className="sidebar__section-label">围绕时间</div>
        <nav className="sidebar__nav" aria-label="主导航">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar__foot">
          <div className="sidebar__status">
            <span className="status-dot" />
            <div>
              <strong>一条时间主线</strong>
              <small>4 个时期 · 3 条泳道</small>
            </div>
          </div>
          <a className="sidebar__github" href="https://github.com/GADLO/CS-Atlas" target="_blank" rel="noreferrer">
            <GitBranch size={15} aria-hidden="true" />
            GADLO / CS-Atlas
          </a>
        </div>
      </aside>

      {open && <button type="button" className="sidebar-scrim" aria-label="关闭导航" onClick={() => setOpen(false)} />}

      <div className="main-shell">
        <header className="topbar">
          <button type="button" className="mobile-menu" onClick={() => setOpen(true)} aria-label="打开导航">
            <Menu size={20} />
          </button>
          <div className="topbar__crumb">
            <span>CS ATLAS</span>
            <span className="topbar__slash">/</span>
            <strong>1642 — 现在 · 一条时间主线</strong>
          </div>
          <div className="topbar__right">
            <span className="topbar__badge">LOCAL · SQLite</span>
          </div>
        </header>

        <main id="main-content" className="main-content"><Outlet /></main>

        <footer className="site-footer">
          <span>CS Atlas · time-first knowledge map</span>
          <span>历史是索引，原理是地图。</span>
        </footer>
      </div>
    </div>
  );
}
