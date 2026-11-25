import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, CheckCircle2, FileText, GitBranch, Languages, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth, DEMO } from '../context/AuthContext';
import { useLang } from '../lib/i18n';
import Header from '../components/Header';

const plus = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

function Specimen() {
  return (
    <div className="specimen-card">
      <div className="specimen-bar">
        <span className="row" style={{ gap: 6 }}>
          <FileText size={13} style={{ color: 'var(--accent)' }} />
          <b>Finance Circular · FY 2026-27</b>
        </span>
        <span className="lang-chip">EN · ML</span>
      </div>
      <div className="specimen-body">
        <div className="specimen-title">Government of Kerala — Finance (Budget) Department</div>
        <div className="specimen-sub">Circular No. FIN/B2/482/2026</div>
        <p className="specimen-text">
          All Heads of Departments are informed that grants-in-aid released during the first two quarters must be
          accounted for through <mark className="m-tag">utilisation certificates</mark> in the prescribed form.
          Certificates for grants above Rs. 5 lakh must be submitted on or before{' '}
          <mark className="m-date">{plus(12)}</mark> to the <mark className="m-ent">Finance (Budget) Department</mark>{' '}
          through the BIMS portal. A review meeting of Drawing and Disbursing Officers will be held on{' '}
          <mark className="m-date">{plus(5)}</mark>. Unspent balances must be remitted to the treasury.
        </p>

        <div className="specimen-insights">
          <div className="specimen-insight">
            <b>2 Deadlines</b>
            <span>Added to calendar</span>
          </div>
          <div className="specimen-insight">
            <b>5 Entities</b>
            <span>Linked to 3 files</span>
          </div>
          <div className="specimen-insight">
            <b>6 AI Tags</b>
            <span>Indexed for search</span>
          </div>
        </div>
      </div>
      <div className="specimen-query">
        <span lang="ml">“യൂട്ടിലൈസേഷൻ സർട്ടിഫിക്കറ്റുകൾ എന്നാണ് സമർപ്പിക്കേണ്ടത്?”</span>
        <small>Cited answer · ML ↔ EN</small>
      </div>
    </div>
  );
}

function MiniCalendar() {
  const cells = Array.from({ length: 35 }, (_, i) => i - 2);
  const marks = { 6: 'm', 9: 'h', 13: 'h', 17: 'm', 22: 'l', 26: 'h' };
  return (
    <svg viewBox="0 0 320 185" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {cells.map((d, i) => {
        const x = 40 + (i % 7) * 36;
        const y = 14 + Math.floor(i / 7) * 32;
        const m = marks[d];
        return (
          <g key={i}>
            <rect x={x} y={y} width="32" height="28" rx="4" fill="#ffffff" stroke="#E2E8E2" />
            {d > 0 && d < 31 && (
              <text x={x + 5} y={y + 11} fontSize="8" fill="#64748B" fontFamily="Noto Sans">
                {d}
              </text>
            )}
            {m && (
              <rect
                x={x + 4}
                y={y + 16}
                width="24"
                height="6"
                rx="2"
                fill={m === 'h' ? '#FEE2E2' : m === 'm' ? '#FEF3C7' : '#DCFCE7'}
              />
            )}
            {m && (
              <rect
                x={x + 4}
                y={y + 16}
                width="2.5"
                height="6"
                rx="1"
                fill={m === 'h' ? '#DC2626' : m === 'm' ? '#D97706' : '#15803D'}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function MiniGraph() {
  const n = [
    [70, 58],
    [152, 38],
    [234, 68],
    [112, 128],
    [202, 138],
    [270, 120],
    [42, 136],
  ];
  const e = [
    [0, 1],
    [1, 2],
    [0, 3],
    [3, 4],
    [1, 4],
    [2, 5],
    [4, 5],
    [3, 6],
  ];
  const c = ['#15803D', '#22C55E', '#14532D', '#0F766E', '#D97706', '#15803D', '#64748B'];
  return (
    <svg viewBox="0 0 310 180" width="100%" height="100%">
      {e.map(([a, b], i) => (
        <line
          key={i}
          x1={n[a][0]}
          y1={n[a][1]}
          x2={n[b][0]}
          y2={n[b][1]}
          stroke="#CBD5CD"
          strokeWidth={1 + (i % 3) * 0.7}
        />
      ))}
      {n.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 1 || i === 4 ? 9 : 6.5} fill={c[i]} stroke="#ffffff" strokeWidth="2" />
      ))}
    </svg>
  );
}

function MiniTags() {
  const tags = [
    ['circular', true],
    ['finance', true],
    ['utilisation certificate', false],
    ['tender', false],
    ['disaster management', false],
    ['payment', false],
    ['public works', false],
    ['monsoon', false],
    ['scholarship', false],
  ];
  return (
    <div style={{ padding: '24px 22px', display: 'flex', flexWrap: 'wrap', gap: 6, alignContent: 'center', height: '100%' }}>
      {tags.map(([label, on]) => (
        <span key={label} className={`tag ${on ? 'on' : ''}`}>
          {label}
        </span>
      ))}
      <div className="xsmall muted" style={{ width: '100%', marginTop: 10 }}>
        2 tags active · 3 matching documents · 6 ms
      </div>
    </div>
  );
}

function MiniBilingual() {
  return (
    <div style={{ padding: '20px 22px', display: 'grid', gap: 10, alignContent: 'center', height: '100%' }}>
      <div style={{ fontWeight: 600, fontSize: 14.5 }} lang="ml">
        കിറ്റ് വിതരണം എപ്പോൾ ആരംഭിക്കും?
      </div>
      <div className="xsmall muted">Malayalam detected → translated → retrieved → cited → answered</div>
      <div
        style={{
          borderLeft: '3px solid var(--accent)',
          background: 'var(--surface)',
          padding: '8px 12px',
          borderRadius: '0 6px 6px 0',
          fontSize: 13,
        }}
        lang="ml"
      >
        കിറ്റ് വിതരണം റേഷൻ കടകൾ വഴി ആരംഭിക്കും <span className="cite">1</span>
      </div>
    </div>
  );
}

export default function Landing() {
  const { t } = useLang();
  const { isAuthenticated, login } = useAuth();
  const nav = useNavigate();

  const demo = async () => {
    const r = await login(DEMO.email, DEMO.password);
    if (r.ok) nav('/dashboard');
    else toast.error(r.error);
  };

  const steps = [
    ['01', 'Ingest & OCR', 'PDFs, Word documents, plain text, and scanned notices. Text is extracted cleanly page by page.'],
    ['02', 'Language & Tags', 'Detects English or Malayalam, translates for indexing, and generates structured tags, summaries, and entities.'],
    ['03', 'Semantic Links', 'Chunks and embeds files into vector space, linking documents that reference shared schemes or parties.'],
    ['04', 'Cited Q&A', 'Ask in English or Malayalam and inspect every timed pipeline stage along with exact source passages.'],
  ];

  const usps = [
    [
      '01 · Dynamic Calendar',
      'Deadlines surface automatically',
      'Identifies dates across documents and classifies them as deadlines, payments, meetings, or expiries with urgency levels.',
      Calendar,
      <MiniCalendar key="c" />,
    ],
    [
      '02 · Knowledge Graph',
      'Understand how files connect',
      'Maps semantic similarity and shared entities between circulars, contracts, and minutes so related context is one click away.',
      GitBranch,
      <MiniGraph key="g" />,
    ],
    [
      '03 · Semantic & Tag Search',
      'Search by meaning and structure',
      'Combines vector similarity, keyword matching, and structured tags to locate exact passages across hundreds of records.',
      Sparkles,
      <MiniTags key="t" />,
    ],
    [
      '04 · Bilingual Intelligence',
      'English and Malayalam workflows',
      'Ask questions in Malayalam over English or Malayalam files and receive cited answers with side-by-side translations.',
      Languages,
      <MiniBilingual key="b" />,
    ],
  ];

  return (
    <div className="landing-wrap">
      <Header />

      <div className="page" style={{ paddingTop: 12 }}>
        <section className="hero">
          <div className="fade-up">
            <div className="hero-badge">
              <CheckCircle2 size={13} />
              <span>Multilingual Document Intelligence</span>
            </div>
            <h1>{t('landing.title')}</h1>
            <p className="lede">{t('landing.lede')}</p>
            <div className="cta">
              <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn btn-primary btn-pill">
                {t('landing.open')} <ArrowRight size={15} />
              </Link>
              {!isAuthenticated && (
                <button type="button" className="btn btn-soft btn-pill" onClick={demo}>
                  {t('landing.demo')}
                </button>
              )}
            </div>
          </div>
          <div className="fade-up" style={{ animationDelay: '.06s' }}>
            <Specimen />
          </div>
        </section>

        <section className="landing-section">
          <div className="intro">
            <span className="eyebrow">Why DocuHub</span>
            <h2 className="mt-8" style={{ fontSize: 28 }}>{t('landing.problem')}</h2>
            <p>{t('landing.problemBody')}</p>
          </div>
        </section>

        <section id="workflow" className="landing-section">
          <span className="eyebrow">Pipeline</span>
          <h2 className="mt-8" style={{ fontSize: 26 }}>{t('landing.how')}</h2>
          <div className="four-col">
            {steps.map(([num, title, desc]) => (
              <div className="step-tile" key={num}>
                <span className="num">{num}</span>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="capabilities" className="landing-section">
          <span className="eyebrow">Features</span>
          <h2 className="mt-8" style={{ fontSize: 26 }}>{t('landing.does')}</h2>
          <div className="usp-grid">
            {usps.map(([eyebrow, title, body, Icon, visual]) => (
              <article className="usp" key={eyebrow}>
                <div className="visual">{visual}</div>
                <div className="body">
                  <div className="row" style={{ gap: 6, marginBottom: 4 }}>
                    <Icon size={13} style={{ color: 'var(--accent)' }} />
                    <span className="eyebrow" style={{ marginBottom: 0 }}>{eyebrow}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="architecture" className="landing-section">
          <span className="eyebrow">System Architecture</span>
          <h2 className="mt-8" style={{ fontSize: 26 }}>Built for reliability and transparency</h2>
          <div className="four-col">
            <div className="step-tile">
              <span className="num">API</span>
              <h4>FastAPI &amp; Auth</h4>
              <p>Async Python backend with JWT access/refresh tokens, RBAC role checks, and rate limiting.</p>
            </div>
            <div className="step-tile">
              <span className="num">DATA</span>
              <h4>MongoDB &amp; ChromaDB</h4>
              <p>Beanie ODM for documents and deadlines alongside ChromaDB for dense vector embeddings.</p>
            </div>
            <div className="step-tile">
              <span className="num">AI</span>
              <h4>Gemini &amp; spaCy</h4>
              <p>LLM-powered tagging, date classification, and grounded Q&amp;A with deterministic spaCy fallbacks.</p>
            </div>
            <div className="step-tile">
              <span className="num">OPS</span>
              <h4>Docker &amp; Redis</h4>
              <p>Containerized deployment with Redis search caching, OCR support, and a standalone React demo mode.</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <span>
            <b>DocuHub</b> · Document Intelligence Platform (evolved from Smart India Hackathon 2025 · PS SIH25080)
          </span>
          <span>
            <a className="link" href="https://github.com/Pavann-07/Docu-Hub" target="_blank" rel="noreferrer">
              Source on GitHub
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
