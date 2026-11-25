import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, FileText, MessageSquareText, Network, Search, Sparkles, Upload } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../lib/i18n';
import { daysUntil, fileKind, fmtDate, inDays, relative, stripExt, TYPE_LABEL } from '../lib/format';
import { LangChip, SkeletonRows, StatusBadge, Tags } from '../components/ui';

const QUICK_PROMPTS = [
  'When is the last date to submit utilisation certificates?',
  'How much is the EMD for the road resurfacing tender?',
  'What must local bodies finish before the monsoon?',
];

export default function Dashboard() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [docs, setDocs] = useState(null);
  const [events, setEvents] = useState(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    let timer;
    const load = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [s, d, e] = await Promise.all([
        api.get('/documents/stats'),
        api.get('/documents', { params: { size: 6 } }),
        api.get('/documents/calendar', { params: { start: today.toISOString() } }),
      ]);
      setStats(s.data);
      setDocs(d.data.items);
      setEvents(e.data.slice(0, 6));
      if (s.data.processing > 0) timer = setTimeout(load, 2000);
    };
    load().catch(() => {
      setDocs([]);
      setEvents([]);
    });
    return () => clearTimeout(timer);
  }, []);

  const hour = new Date().getHours();
  const greet = t(hour < 12 ? 'dash.greeting.morning' : hour < 17 ? 'dash.greeting.afternoon' : 'dash.greeting.evening');
  const first = (user?.full_name || '').split(' ')[0];

  const ask = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/ask?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>
            {greet}, {first}
          </h1>
          <p>{t('dash.sub')}</p>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <Link to="/search" className="btn">
            <Search size={14} /> Semantic search
          </Link>
          <Link to="/library" className="btn btn-primary">
            <Upload size={14} /> Upload documents
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span className="label">{t('dash.documents')}</span>
            <span className="stat-icon">
              <FileText size={15} />
            </span>
          </div>
          <div className="value">{stats ? stats.documents : '–'}</div>
          <div className="sub">
            {stats ? `${stats.processed} ${t('dash.processed')}${stats.processing ? ` · ${stats.processing} active` : ''}` : ' '}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="label">{t('dash.deadlines')}</span>
            <span className="stat-icon">
              <Calendar size={15} />
            </span>
          </div>
          <div className={`value ${stats?.high_urgency ? 'danger' : ''}`}>{stats ? stats.upcoming_deadlines : '–'}</div>
          <div className="sub">{stats ? `${stats.high_urgency} ${t('dash.urgent')}` : ' '}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="label">{t('dash.connections')}</span>
            <span className="stat-icon">
              <Network size={15} />
            </span>
          </div>
          <div className="value accent">{stats ? stats.connections : '–'}</div>
          <div className="sub">{t('dash.connectionsSub')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="label">{t('dash.questions')}</span>
            <span className="stat-icon">
              <MessageSquareText size={15} />
            </span>
          </div>
          <div className="value ok">{stats ? stats.questions_asked : '–'}</div>
          <div className="sub">{t('dash.questionsSub')}</div>
        </div>
      </div>

      <div className="panel panel-pad mt-24">
        <form onSubmit={ask}>
          <div className="row mb-12" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div className="row" style={{ gap: 8 }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              <h3 style={{ fontSize: 15 }}>{t('dash.ask')}</h3>
            </div>
            <Link to="/ask" className="link xsmall">
              Open full AI workspace
            </Link>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <input
              className="input"
              style={{ height: 42, fontSize: 14.5 }}
              placeholder={t('dash.askPh')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              lang={lang}
            />
            <button className="btn btn-primary" style={{ height: 42, padding: '0 18px' }}>
              {t('ask.run')} <ArrowRight size={15} />
            </button>
          </div>
          <div className="tags mt-12">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="tag"
                onClick={() => nav(`/ask?q=${encodeURIComponent(prompt)}`)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </form>
      </div>

      <div className="grid-2 mt-24">
        <section className="panel" style={{ overflow: 'hidden' }}>
          <div className="panel-head">
            <h3 style={{ fontSize: 15 }}>{t('dash.recent')}</h3>
            <Link to="/library" className="link small">
              View all
            </Link>
          </div>
          {docs === null ? (
            <div className="panel-pad">
              <SkeletonRows n={5} />
            </div>
          ) : docs.length === 0 ? (
            <div className="panel-pad muted small">
              No documents yet.{' '}
              <Link className="link" to="/library">
                Upload your first file
              </Link>
              .
            </div>
          ) : (
            <div className="list">
              {docs.map((d) => (
                <Link to={`/library/${d.id}`} key={d.id} className="list-row">
                  <FileText size={16} style={{ color: 'var(--accent)', flex: 'none' }} />
                  <div className="stack" style={{ minWidth: 0, flex: 1, gap: 3 }}>
                    <span className="truncate" style={{ fontSize: 13.5, fontWeight: 500 }}>
                      {stripExt(d.filename)}
                    </span>
                    <span className="row xsmall faint" style={{ gap: 6 }}>
                      {fileKind(d.mime_type, d.filename)} <LangChip lang={d.language} /> · {relative(d.uploaded_at)}
                    </span>
                  </div>
                  {d.processing_status === 'completed' ? (
                    <Tags tags={d.detected_tags} max={2} />
                  ) : (
                    <StatusBadge status={d.processing_status} />
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="panel" style={{ overflow: 'hidden' }}>
          <div className="panel-head">
            <h3 style={{ fontSize: 15 }}>{t('dash.coming')}</h3>
            <Link to="/calendar" className="link small">
              Open calendar
            </Link>
          </div>
          {events === null ? (
            <div className="panel-pad">
              <SkeletonRows n={5} />
            </div>
          ) : events.length === 0 ? (
            <div className="panel-pad muted small">No upcoming dates extracted yet.</div>
          ) : (
            <div className="list">
              {events.map((e) => {
                const n = daysUntil(e.event_date);
                return (
                  <Link to={`/library/${e.document_id}`} key={e.id} className="list-row" style={{ alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 46,
                        flex: 'none',
                        textAlign: 'center',
                        padding: '4px 0',
                        borderRadius: 6,
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.1 }}>
                        {fmtDate(e.event_date, { day: 'numeric', timeZone: 'UTC' })}
                      </div>
                      <div className="xsmall muted">
                        {fmtDate(e.event_date, { month: 'short', timeZone: 'UTC' })}
                      </div>
                    </div>
                    <div className="stack" style={{ minWidth: 0, flex: 1, gap: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.4 }}>{e.event_title}</span>
                      <span className="row xsmall muted" style={{ gap: 6 }}>
                        <span className={`urgency ${e.urgency}`} /> {TYPE_LABEL[e.event_type] || 'Date'} · {inDays(n)}
                      </span>
                      <span className="xsmall faint truncate">{stripExt(e.document_filename)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {stats && (
        <section className="mt-24">
          <div className="section-title">{t('dash.system')}</div>
          <div className="four-col" style={{ marginTop: 0 }}>
            <div className="step-tile">
              <span className="num">LLM / AI</span>
              <h4>{stats.engine.llm || 'Local fallback'}</h4>
              <p>
                {stats.engine.llm
                  ? 'Tags, classification and answers by Gemini.'
                  : 'No Gemini key set: spaCy rules and extractive answers are used.'}
              </p>
            </div>
            <div className="step-tile">
              <span className="num">STORAGE</span>
              <h4>{stats.engine.database === 'mongodb' ? 'MongoDB' : 'In-memory'}</h4>
              <p>
                {stats.engine.database === 'mongodb'
                  ? 'Persistent document store via Beanie ODM.'
                  : 'MongoDB not reachable; running in-memory.'}
              </p>
            </div>
            <div className="step-tile">
              <span className="num">VECTORS</span>
              <h4>ChromaDB</h4>
              <p>all-MiniLM-L6-v2 embeddings, cosine distance.</p>
            </div>
            <div className="step-tile">
              <span className="num">LANGUAGES</span>
              <h4>
                {Object.entries(stats.languages)
                  .map(([k, v]) => `${k.toUpperCase()} ${v}`)
                  .join(' · ') || '—'}
              </h4>
              <p>{stats.tags} unique tags indexed across your document library.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
