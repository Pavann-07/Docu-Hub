import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../lib/i18n';
import { healthUrl } from '../lib/api';

export function BrandMark({ size = 26 }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }} aria-hidden>
      <svg width={size * 0.64} height={size * 0.64} viewBox="0 0 20 20" fill="none">
        <path d="M4.5 2.5h6.8L15.5 6.7V17.5h-11z" stroke="#ffffff" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M11 2.5v4.5h4.5" stroke="#DCFCE7" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M7.5 11.2h5M7.5 14h3.2" stroke="#DCFCE7" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function useApiHealth() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    let alive = true;
    const check = () =>
      fetch(healthUrl)
        .then((r) => alive && setOnline(r.ok))
        .catch(() => alive && setOnline(false));
    check();
    const id = setInterval(check, 30000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
  return online;
}

export function ModePill() {
  const { t } = useLang();
  const online = useApiHealth();
  return (
    <span className={`status-pill ${online ? '' : 'off'}`}>
      {online ? t('status.online') : t('status.offline')}
    </span>
  );
}

export function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-switch" role="group" aria-label="Interface language">
      <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')} lang="en">
        EN
      </button>
      <button type="button" className={lang === 'ml' ? 'on' : ''} onClick={() => setLang('ml')} lang="ml">
        മലയാളം
      </button>
    </div>
  );
}

export default function Header() {
  const { isAuthenticated } = useAuth();
  const { t } = useLang();
  const loc = useLocation();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          <BrandMark />
          <span>DocuHub</span>
        </Link>

        {loc.pathname === '/' && (
          <nav className="guest-links" aria-label="Product overview">
            <a href="#workflow">Workflow</a>
            <a href="#capabilities">Capabilities</a>
            <a href="#architecture">Architecture</a>
          </nav>
        )}

        <div className="top-right">
          <ModePill />
          <LangSwitch />
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              {t('landing.open')}
            </Link>
          ) : (
            <>
              {loc.pathname !== '/login' && (
                <Link to="/login" className="btn btn-sm">
                  {t('auth.signin')}
                </Link>
              )}
              {loc.pathname !== '/register' && (
                <Link to="/register" className="btn btn-primary btn-sm">
                  {t('auth.register')}
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
