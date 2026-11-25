import { CheckCircle2, Globe, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../lib/i18n';
import { fmtDateTime } from '../lib/format';
import { useApiHealth } from '../components/Header';

export default function Settings() {
  const { user } = useAuth();
  const { t, lang, setLang } = useLang();
  const online = useApiHealth();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{t('settings.title')}</h1>
          <p>{t('settings.sub')}</p>
        </div>
      </div>

      <div className="grid-2">
        <section className="panel panel-pad">
          <div className="row mb-16" style={{ gap: 8 }}>
            <UserIcon size={16} style={{ color: 'var(--accent)' }} />
            <h3>Account Profile</h3>
          </div>
          <table className="kv">
            <tbody>
              <tr>
                <td>Full name</td>
                <td>{user?.full_name || '—'}</td>
              </tr>
              <tr>
                <td>Email</td>
                <td>{user?.email || '—'}</td>
              </tr>
              <tr>
                <td>Role</td>
                <td style={{ textTransform: 'capitalize' }}>{user?.role || 'viewer'}</td>
              </tr>
              <tr>
                <td>Account status</td>
                <td>
                  <span className="badge completed">Active</span>
                </td>
              </tr>
              <tr>
                <td>Member since</td>
                <td>{fmtDateTime(user?.created_at)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="panel panel-pad stack" style={{ gap: 18 }}>
          <div>
            <div className="row mb-8" style={{ gap: 8 }}>
              <Globe size={16} style={{ color: 'var(--accent)' }} />
              <h3>Interface Language</h3>
            </div>
            <p className="note mb-12">
              Switch the DocuHub interface between English and Malayalam. Document Q&amp;A supports both languages regardless of UI setting.
            </p>
            <div className="segmented" role="group" aria-label="Language preference">
              <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>
                English
              </button>
              <button type="button" className={lang === 'ml' ? 'on' : ''} onClick={() => setLang('ml')}>
                മലയാളം (Malayalam)
              </button>
            </div>
          </div>

          <hr className="hr" style={{ margin: '4px 0' }} />

          <div>
            <div className="row mb-8" style={{ gap: 8 }}>
              <Shield size={16} style={{ color: 'var(--accent)' }} />
              <h3>Backend API Connection</h3>
            </div>
            <div className="demo-banner" style={online ? undefined : { background: 'var(--danger-soft)', borderColor: '#fecaca', color: '#991b1b' }}>
              <div className="row" style={{ gap: 8 }}>
                <CheckCircle2 size={15} />
                <span>
                  <b>{online ? 'FastAPI Backend Connected' : 'FastAPI Backend Offline'}</b>
                </span>
              </div>
            </div>
            <p className="note mt-8">
              Configured via the global <code>.env</code> file (<code>VITE_API_URL</code> or Vite dev proxy to <code>http://localhost:8000</code>).
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
