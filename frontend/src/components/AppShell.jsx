import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Network,
  Plus,
  Search,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../lib/i18n';
import { BrandMark, LangSwitch, ModePill, useApiHealth } from './Header';

const PRIMARY_NAV = [
  { to: '/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/library', key: 'nav.library', icon: FileText },
  { to: '/ask', key: 'nav.ask', icon: MessageSquareText },
  { to: '/search', key: 'nav.search', icon: Search },
  { to: '/calendar', key: 'nav.calendar', icon: CalendarIcon },
  { to: '/graph', key: 'nav.graph', icon: Network },
  { to: '/history', key: 'nav.history', icon: Clock },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const online = useApiHealth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const menuRef = useRef(null);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
    setMenuOpen(false);
  }, [loc.pathname, loc.search]);

  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const initials = (user?.full_name || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const onQuickSearch = (e) => {
    e.preventDefault();
    const trimmed = quickQuery.trim();
    if (!trimmed) return;
    nav(`/search?q=${encodeURIComponent(trimmed)}`);
    setQuickQuery('');
  };

  return (
    <div className="app-shell">
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Workspace navigation">
        <div className="sidebar-brand">
          <Link to="/dashboard" className="brand">
            <BrandMark size={26} />
            <span>DocuHub</span>
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-sm hamburger"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        <div className="sidebar-cta">
          <Link to="/library" className="btn btn-primary btn-sm" style={{ justifyContent: 'flex-start' }}>
            <Plus size={14} /> Upload
          </Link>
          <Link to="/ask" className="btn btn-soft btn-sm" title={t('nav.ask')}>
            <Sparkles size={14} /> Ask
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Workspace</div>
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{t(item.key)}</span>
              </NavLink>
            );
          })}

          <div className="nav-section-label" style={{ marginTop: 8 }}>Account</div>
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Settings size={16} />
            <span>{t('nav.settings')}</span>
          </NavLink>
          <Link to="/" className="sidebar-link">
            <Home size={16} />
            <span>Overview</span>
          </Link>
        </nav>

        <div className="sidebar-foot">
          <div className={`mode-card ${online ? 'online' : 'offline'}`}>
            <div className="row" style={{ gap: 6, fontWeight: 600 }}>
              <span className={`urgency ${online ? 'low' : 'high'}`} />
              <span>{online ? t('status.online') : t('status.offline')}</span>
            </div>
            <div className="xsmall mt-4" style={{ opacity: 0.85 }}>
              {online ? 'Connected to FastAPI backend.' : 'Start the FastAPI backend to sync.'}
            </div>
          </div>
        </div>
      </aside>

      <div className="shell-main">
        <header className="shell-topbar">
          <button
            type="button"
            className="btn btn-ghost btn-sm hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <form className="shell-search" onSubmit={onQuickSearch}>
            <Search size={14} className="faint" />
            <input
              type="search"
              placeholder="Jump to semantic search…"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              aria-label="Quick search"
            />
          </form>

          <div className="top-right">
            <ModePill />
            <LangSwitch />
            <div className="user-chip" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="avatar">{initials}</span>
                <span className="who">
                  <b>{user?.full_name}</b>
                  <span>{user?.role}</span>
                </span>
              </button>
              {menuOpen && (
                <div className="menu fade-up" role="menu">
                  <div className="menu-head">
                    <div style={{ fontWeight: 600 }}>{user?.full_name}</div>
                    <div className="small muted">{user?.email}</div>
                  </div>
                  <Link to="/settings" role="menuitem">
                    <Settings size={14} /> {t('nav.settings')}
                  </Link>
                  <Link to="/" role="menuitem">
                    <Home size={14} /> Landing page
                  </Link>
                  <button
                    type="button"
                    className="menu-item"
                    role="menuitem"
                    onClick={() => {
                      logout();
                      nav('/');
                    }}
                  >
                    <LogOut size={14} /> {t('auth.signout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{ flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
