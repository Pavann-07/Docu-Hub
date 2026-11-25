import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Clock, MessageSquareText } from 'lucide-react';
import { api } from '../lib/api';
import { useLang } from '../lib/i18n';
import { fmtDateTime, LANG_LABEL, stripExt } from '../lib/format';
import { Empty, Loading, TraceList } from '../components/ui';

export default function History() {
  const { t } = useLang();
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api
      .get('/documents/queries')
      .then(({ data }) => setItems(data))
      .catch(() => setItems([]));
  }, []);

  if (items === null) return <Loading />;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{t('history.title')}</h1>
          <p>{t('history.sub')}</p>
        </div>
        <Link to="/ask" className="btn btn-primary">
          <MessageSquareText size={14} /> {t('ask.run')}
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="panel">
          <Empty
            title="No questions asked yet"
            icon={Clock}
            action={
              <Link to="/ask" className="btn btn-primary">
                Ask your first question
              </Link>
            }
          >
            Every question you ask, its cited answer, and its execution trace will appear here.
          </Empty>
        </div>
      ) : (
        <div className="panel" style={{ overflow: 'hidden' }}>
          <div className="list">
            {items.map((it) => {
              const isOpen = open === it.id;
              return (
                <div key={it.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <button
                    type="button"
                    className="list-row"
                    style={{ borderBottom: 0, alignItems: 'flex-start' }}
                    onClick={() => setOpen(isOpen ? null : it.id)}
                  >
                    <span className="muted" style={{ marginTop: 3 }}>
                      {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </span>
                    <div className="stack" style={{ flex: 1, minWidth: 0, gap: 4 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 600 }} lang={it.question_language}>
                        {it.question}
                      </span>
                      <span
                        className="small muted"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: isOpen ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                        lang={it.answer_language}
                      >
                        {it.answer}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', flex: 'none' }} className="xsmall faint">
                      <div>{fmtDateTime(it.created_at)}</div>
                      <div className="mt-4">
                        {LANG_LABEL[it.question_language]} → {LANG_LABEL[it.answer_language]}
                      </div>
                      <div
                        className="mt-4"
                        style={{ color: it.confidence < 0.5 ? 'var(--warn)' : 'var(--accent)', fontWeight: 600 }}
                      >
                        {Math.round(it.confidence * 100)}% confidence
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="grid-2 fade-up" style={{ padding: '8px 20px 20px 44px', background: 'var(--bg)' }}>
                      <div className="panel panel-pad">
                        <div className="eyebrow mb-8">Execution Trace · {it.engine}</div>
                        <TraceList steps={it.trace} />
                      </div>
                      <div className="stack" style={{ gap: 8 }}>
                        <div className="eyebrow">Cited Sources</div>
                        {it.citations.map((c) => (
                          <div key={c.n} className="source">
                            <div className="row" style={{ gap: 8 }}>
                              <span className="cite">{c.n}</span>
                              <Link className="truncate small link" style={{ fontWeight: 600 }} to={`/library/${c.document_id}`}>
                                {stripExt(c.filename)}
                              </Link>
                            </div>
                            <p className="snippet">{c.text_snippet}</p>
                          </div>
                        ))}
                        <div>
                          <Link to={`/ask?q=${encodeURIComponent(it.question)}`} className="btn btn-sm mt-4">
                            Ask again
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
