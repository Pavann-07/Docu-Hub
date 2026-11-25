import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { api } from '../lib/api';
import { useLang } from '../lib/i18n';
import { fileKind, relative, stripExt } from '../lib/format';
import { Empty, LangChip, Meter, SkeletonRows, Tags } from '../components/ui';

function Highlight({ text, q }) {
  const words = q
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length) return text;
  const re = new RegExp(`(${words.join('|')})`, 'gi');
  return text.split(re).map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : <Fragment key={i}>{p}</Fragment>));
}

export default function Search() {
  const { t } = useLang();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [selTags, setSelTags] = useState(() => (params.get('tags') ? params.get('tags').split(',') : []));
  const [allTags, setAllTags] = useState([]);
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounce = useRef();

  useEffect(() => {
    api
      .get('/documents/tags')
      .then(({ data }) => setAllTags(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      const p = {};
      if (q) p.q = q;
      if (selTags.length) p.tags = selTags.join(',');
      setParams(p, { replace: true });
      if (!q.trim() && !selTags.length) {
        setRes(null);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get('/documents/search', {
          params: { q, tags: selTags.join(',') || undefined, top_k: 20 },
        });
        setRes(data);
      } finally {
        setLoading(false);
      }
    }, 240);
    return () => clearTimeout(debounce.current);
  }, [q, selTags, setParams]);

  const toggle = (tag) => setSelTags((s) => (s.includes(tag) ? s.filter((x) => x !== tag) : [...s, tag]));

  return (
    <div className="page">
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>{t('search.title')}</h1>
          <p>Meaning-based search across document passages combined with keyword matching and AI tags.</p>
        </div>
      </div>

      <div className="searchbar">
        <SearchIcon size={19} style={{ color: 'var(--accent)' }} />
        <input autoFocus placeholder={t('search.ph')} value={q} onChange={(e) => setQ(e.target.value)} />
        {q && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setQ('')} aria-label="Clear">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="panel panel-pad mt-16">
        <div className="small muted mb-8" style={{ fontWeight: 500 }}>
          {t('search.tags')}
          {selTags.length > 0 && (
            <>
              {' '}
              ·{' '}
              <button type="button" className="text-btn link" onClick={() => setSelTags([])}>
                Clear tags
              </button>
            </>
          )}
        </div>
        <div className="tags">
          {allTags.slice(0, 40).map(({ tag, count }) => (
            <button
              type="button"
              key={tag}
              className={`tag ${selTags.includes(tag) ? 'on' : ''}`}
              onClick={() => toggle(tag)}
            >
              {tag} <span className="count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-24">
        {loading && !res ? (
          <div className="panel panel-pad">
            <SkeletonRows n={5} h={22} />
          </div>
        ) : !res ? (
          <div className="panel">
            <Empty title="Search your document hub" icon={SearchIcon}>
              Try “flood relief”, “utilisation certificate”, or “EMD payment” — or select tags above to filter instantly.
            </Empty>
          </div>
        ) : res.hits.length === 0 ? (
          <div className="panel">
            <Empty title="No matching documents" icon={SearchIcon}>
              Try removing tag filters or broadening your search terms.
            </Empty>
          </div>
        ) : (
          <div className="panel" style={{ overflow: 'hidden' }}>
            <div className="panel-head">
              <span className="small muted">
                <b>{res.hits.length}</b> {res.hits.length === 1 ? 'document' : 'documents'} · {res.took_ms} ms
                {res.cached ? ' · cached' : ''}
              </span>
            </div>
            <div>
              {res.hits.map(({ document: d, score, matched_by, snippets }) => (
                <div key={d.id} className="hit fade-up">
                  <div style={{ minWidth: 0 }}>
                    <h3>
                      <Link to={`/library/${d.id}`}>{stripExt(d.filename)}</Link>
                    </h3>
                    <div className="row xsmall muted mt-4" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <span className="pill-type">{fileKind(d.mime_type, d.filename)}</span>
                      <LangChip lang={d.language} />
                      {d.department && <span>{d.department}</span>}
                      <span>· {relative(d.uploaded_at)}</span>
                      <span>· matched by {matched_by.join(' + ')}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>{q && <Meter value={score} />}</div>
                  {(snippets[0] || d.summary) && (
                    <p className="snip">
                      <Highlight text={snippets[0] || d.summary} q={q} />
                    </p>
                  )}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Tags tags={d.detected_tags} max={6} onClick={toggle} active={selTags} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
