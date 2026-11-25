import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, Search as SearchIcon, X } from 'lucide-react';
import { api } from '../lib/api';
import { useLang } from '../lib/i18n';
import { bytes, fileKind, relative, stripExt } from '../lib/format';
import UploadZone from '../components/UploadZone';
import { Empty, LangChip, SkeletonRows, StatusBadge, Tags } from '../components/ui';

export default function Library() {
  const { t } = useLang();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [docs, setDocs] = useState(null);
  const [tags, setTags] = useState([]);
  const [q, setQ] = useState('');
  const [view, setView] = useState('table');
  const tag = params.get('tag') || '';
  const language = params.get('language') || '';
  const status = params.get('status') || '';

  const load = useCallback(async () => {
    const [d, tg] = await Promise.all([
      api.get('/documents', {
        params: { size: 100, tag: tag || undefined, language: language || undefined, status: status || undefined },
      }),
      api.get('/documents/tags'),
    ]);
    setDocs(d.data.items);
    setTags(tg.data);
  }, [tag, language, status]);

  useEffect(() => {
    load().catch(() => setDocs([]));
  }, [load]);

  // Poll while anything is still being processed.
  const busy = docs?.some((d) => d.processing_status === 'pending' || d.processing_status === 'processing');
  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => load().catch(() => {}), 1500);
    return () => clearInterval(id);
  }, [busy, load]);

  const shown = useMemo(
    () => (docs || []).filter((d) => !q || d.filename.toLowerCase().includes(q.toLowerCase())),
    [docs, q]
  );

  const setFilter = (k, v) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v);
    else p.delete(k);
    setParams(p, { replace: true });
  };

  const hasFilters = Boolean(tag || language || status || q);

  return (
    <div className="page-wide">
      <div className="page-head">
        <div>
          <h1>{t('lib.title')}</h1>
          <p>{t('lib.sub')}</p>
        </div>
        <div className="segmented" role="group" aria-label="Layout view">
          <button type="button" className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}>
            <span className="row" style={{ gap: 5 }}>
              <List size={13} /> Table
            </span>
          </button>
          <button type="button" className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}>
            <span className="row" style={{ gap: 5 }}>
              <LayoutGrid size={13} /> Cards
            </span>
          </button>
        </div>
      </div>

      <div className="lib-layout">
        <aside className="stack" style={{ gap: 18 }}>
          <section className="panel panel-pad">
            <div className="section-title">Upload</div>
            <UploadZone onUploaded={load} />
          </section>

          <section className="panel panel-pad">
            <div className="section-title">
              Filter
              {hasFilters && (
                <button
                  type="button"
                  className="text-btn link xsmall"
                  onClick={() => {
                    setQ('');
                    setParams({}, { replace: true });
                  }}
                >
                  Reset
                </button>
              )}
            </div>
            <div className="stack" style={{ gap: 12 }}>
              <div className="field">
                <label htmlFor="lib-lang">Language</label>
                <select id="lib-lang" className="select" value={language} onChange={(e) => setFilter('language', e.target.value)}>
                  <option value="">Any language</option>
                  <option value="en">English</option>
                  <option value="ml">Malayalam</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="lib-status">Status</label>
                <select id="lib-status" className="select" value={status} onChange={(e) => setFilter('status', e.target.value)}>
                  <option value="">Any status</option>
                  <option value="completed">Ready</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </section>

          {tags.length > 0 && (
            <section className="panel panel-pad">
              <div className="section-title">
                Tags <span className="aside">{tags.length}</span>
              </div>
              <div className="tags">
                {tags.slice(0, 28).map(({ tag: tg, count }) => (
                  <button
                    type="button"
                    key={tg}
                    className={`tag ${tag === tg ? 'on' : ''}`}
                    onClick={() => setFilter('tag', tag === tg ? '' : tg)}
                  >
                    {tg} <span className="count">{count}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </aside>

        <section style={{ minWidth: 0 }}>
          <div className="row mb-12" style={{ gap: 10 }}>
            <div
              className="row"
              style={{
                flex: 1,
                border: '1px solid var(--line-2)',
                borderRadius: 'var(--radius)',
                background: 'var(--surface)',
                padding: '0 12px',
                height: 36,
              }}
            >
              <SearchIcon size={14} className="faint" />
              <input
                style={{ border: 0, outline: 'none', flex: 1, fontSize: 13.5, background: 'none' }}
                placeholder="Filter documents by filename…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q && (
                <button type="button" className="text-btn" onClick={() => setQ('')} aria-label="Clear filter">
                  <X size={14} />
                </button>
              )}
            </div>
            <span className="small muted nowrap">
              {shown.length} {shown.length === 1 ? 'document' : 'documents'}
            </span>
          </div>

          {docs === null ? (
            <div className="panel panel-pad">
              <SkeletonRows n={6} h={28} />
            </div>
          ) : shown.length === 0 ? (
            <div className="panel">
              <Empty title={docs.length ? 'No matching documents' : 'No documents yet'}>
                {docs.length
                  ? 'Try clearing active language, status, or tag filters.'
                  : 'Upload a PDF, Word file, text file, or scanned notice to start.'}
              </Empty>
            </div>
          ) : view === 'table' ? (
            <div className="panel" style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th className="hide-sm">Format</th>
                    <th>Tags</th>
                    <th>Status</th>
                    <th className="hide-sm" style={{ textAlign: 'right' }}>
                      Uploaded
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((d) => (
                    <tr key={d.id} onClick={() => nav(`/library/${d.id}`)}>
                      <td style={{ maxWidth: 260 }}>
                        <div className="truncate" style={{ fontSize: 13.5, fontWeight: 500 }}>
                          {stripExt(d.filename)}
                        </div>
                        <div className="xsmall muted truncate" style={{ marginTop: 2 }}>
                          {d.summary || (d.processing_status === 'completed' ? '' : 'Running ingestion pipeline…')}
                        </div>
                      </td>
                      <td className="hide-sm nowrap">
                        <span className="row" style={{ gap: 6 }}>
                          <span className="pill-type">{fileKind(d.mime_type, d.filename)}</span>
                          <LangChip lang={d.language} />
                        </span>
                        <div className="xsmall faint mt-4">{bytes(d.file_size)}</div>
                      </td>
                      <td>
                        <Tags tags={d.detected_tags} max={2} onClick={(tg) => setFilter('tag', tg)} active={[tag]} />
                      </td>
                      <td className="nowrap">
                        <StatusBadge status={d.processing_status} />
                      </td>
                      <td className="hide-sm nowrap small muted" style={{ textAlign: 'right' }}>
                        {relative(d.uploaded_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid-2">
              {shown.map((d) => (
                <div
                  key={d.id}
                  className="panel panel-pad stack"
                  style={{ gap: 10, cursor: 'pointer' }}
                  onClick={() => nav(`/library/${d.id}`)}
                >
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="row" style={{ gap: 6 }}>
                      <span className="pill-type">{fileKind(d.mime_type, d.filename)}</span>
                      <LangChip lang={d.language} />
                    </span>
                    <StatusBadge status={d.processing_status} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14.5 }}>{stripExt(d.filename)}</div>
                    <p className="small muted mt-4" style={{ lineHeight: 1.5 }}>
                      {d.summary || 'Processing document content…'}
                    </p>
                  </div>
                  <Tags tags={d.detected_tags} max={4} onClick={(tg) => setFilter('tag', tg)} active={[tag]} />
                  <div className="row xsmall faint" style={{ justifyContent: 'space-between', marginTop: 'auto' }}>
                    <span>{bytes(d.file_size)}</span>
                    <span>{relative(d.uploaded_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
