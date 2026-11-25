import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth, DEMO } from '../context/AuthContext';
import { useLang } from '../lib/i18n';
import Header from '../components/Header';

function Side() {
  return (
    <aside className="auth-side">
      <div>
        <div className="eyebrow">DocuHub Workspace</div>
      </div>
      <div>
        <blockquote>
          “Which of our circulars mention a deadline before the end of the month — and which departments are involved?”
        </blockquote>
        <div className="auth-points">
          <div className="row" style={{ gap: 8 }}>
            <CheckCircle2 size={15} />
            <span>Automatic deadline extraction and calendar sync</span>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <CheckCircle2 size={15} />
            <span>Bilingual English and Malayalam document Q&amp;A</span>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <CheckCircle2 size={15} />
            <span>Transparent citations and knowledge graph links</span>
          </div>
        </div>
      </div>
      <div className="xsmall" style={{ color: '#bbf7d0' }}>
        DocuHub Document Intelligence · Smart India Hackathon 2025 (PS SIH25080)
      </div>
    </aside>
  );
}

export function Login() {
  const { login } = useAuth();
  const { t } = useLang();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e, creds) => {
    e?.preventDefault();
    setBusy(true);
    setError('');
    const r = await login(creds?.email ?? email, creds?.password ?? password);
    setBusy(false);
    if (r.ok) nav(loc.state?.from || '/dashboard', { replace: true });
    else setError(r.error);
  };

  return (
    <>
      <Header />
      <div className="auth">
        <Side />
        <div className="auth-form">
          <form onSubmit={submit} className="auth-card fade-up">
            <div>
              <h2>{t('auth.signin')}</h2>
              <p className="muted small mt-4">Sign in to access your DocuHub workspace.</p>
            </div>

            <div className="demo-box">
              <div>
                <div className="row" style={{ gap: 5, fontWeight: 600 }}>
                  <Sparkles size={13} />
                  <span>Exploring DocuHub?</span>
                </div>
                <div className="xsmall mt-4" style={{ opacity: 0.9 }}>
                  {DEMO.email} · {DEMO.password}
                </div>
              </div>
              <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => submit(null, DEMO)}>
                Use demo
              </button>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="you@organization.org"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" style={{ height: 38 }} disabled={busy}>
              {busy ? <span className="spinner" /> : t('auth.signin')}
            </button>

            <p className="small muted">
              No account yet?{' '}
              <Link to="/register" className="link">
                {t('auth.register')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export function Register() {
  const { register } = useAuth();
  const { t } = useLang();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    setError('');
    const r = await register(form.name, form.email, form.password);
    setBusy(false);
    if (r.ok) nav('/dashboard');
    else setError(r.error);
  };

  return (
    <>
      <Header />
      <div className="auth">
        <Side />
        <div className="auth-form">
          <form onSubmit={submit} className="auth-card fade-up">
            <div>
              <h2>{t('auth.register')}</h2>
              <p className="muted small mt-4">
                Your documents remain private and isolated to your account.
              </p>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                className="input"
                required
                minLength={2}
                autoComplete="name"
                placeholder="Aarav Menon"
                value={form.name}
                onChange={set('name')}
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                required
                autoComplete="email"
                placeholder="name@organization.org"
                value={form.email}
                onChange={set('email')}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={set('password')}
              />
              <span className="xsmall faint">At least 8 characters.</span>
            </div>

            <button className="btn btn-primary" style={{ height: 38 }} disabled={busy}>
              {busy ? <span className="spinner" /> : t('auth.register')}
            </button>

            <p className="small muted">
              Already have an account?{' '}
              <Link to="/login" className="link">
                {t('auth.signin')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
