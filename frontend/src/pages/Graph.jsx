import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Network } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import { api } from '../lib/api';
import { useLang } from '../lib/i18n';
import { LANG_LABEL, stripExt } from '../lib/format';
import { Empty, Loading, Tags } from '../components/ui';

const PALETTE = ['#15803D', '#0F766E', '#D97706', '#22C55E', '#14532D', '#2563EB', '#DC2626', '#64748B'];
const ENTITY_COLOR = '#94A3B8';

function useSize(ref) {
  const [size, setSize] = useState({ width: 800, height: 600 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

export default function Graph() {
  const { t } = useLang();
  const [raw, setRaw] = useState(null);
  const [entities, setEntities] = useState(false);
  const [minWeight, setMinWeight] = useState(0);
  const [selected, setSelected] = useState(null);
  const [hover, setHover] = useState(null);
  const box = useRef(null);
  const fg = useRef(null);
  const { width, height } = useSize(box);

  useEffect(() => {
    api
      .get('/documents/graph', { params: { include_entities: entities } })
      .then(({ data }) => setRaw(data))
      .catch(() => setRaw({ nodes: [], edges: [] }));
  }, [entities]);

  const typeColor = useMemo(() => {
    const types = [...new Set((raw?.nodes || []).filter((n) => n.group === 'document').map((n) => n.doc_type || 'other'))];
    return Object.fromEntries(types.map((ty, i) => [ty, PALETTE[i % PALETTE.length]]));
  }, [raw]);

  const data = useMemo(() => {
    if (!raw) return { nodes: [], links: [] };
    const links = raw.edges
      .filter((e) => e.relation_type === 'mentions' || e.weight >= minWeight)
      .map((e) => ({ ...e }));
    return { nodes: raw.nodes.map((n) => ({ ...n })), links };
  }, [raw, minWeight]);

  const neighbours = useMemo(() => {
    const focus = hover || selected;
    if (!focus) return null;
    const s = new Set([focus.id]);
    for (const l of data.links) {
      const a = typeof l.source === 'object' ? l.source.id : l.source;
      const b = typeof l.target === 'object' ? l.target.id : l.target;
      if (a === focus.id) s.add(b);
      if (b === focus.id) s.add(a);
    }
    return s;
  }, [hover, selected, data]);

  useEffect(() => {
    const id = setTimeout(() => fg.current?.zoomToFit(400, 70), 350);
    return () => clearTimeout(id);
  }, [width, height, data]);

  useEffect(() => {
    if (!fg.current) return;
    fg.current.d3Force('link')?.distance((l) => (l.relation_type === 'mentions' ? 60 : 150 - l.weight * 90));
    fg.current.d3Force('charge')?.strength(-260);
  }, [data]);

  const paint = useCallback(
    (node, ctx, scale) => {
      const isDoc = node.group === 'document';
      const r = isDoc ? 5.5 + Math.min(node.degree, 6) * 1.1 : 3.4;
      const dim = neighbours && !neighbours.has(node.id);
      const color = isDoc ? typeColor[node.doc_type || 'other'] : ENTITY_COLOR;
      ctx.globalAlpha = dim ? 0.18 : 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = selected?.id === node.id ? 3 / scale + 1 : 1.5;
      ctx.strokeStyle = selected?.id === node.id ? '#17251C' : '#ffffff';
      ctx.stroke();

      if (isDoc || scale > 1.6) {
        const label = stripExt(node.label);
        const text = label.length > 34 ? `${label.slice(0, 32)}…` : label;
        const fs = Math.max(10 / scale, isDoc ? 3.2 : 2.6);
        ctx.font = `${isDoc ? 600 : 400} ${fs}px "Noto Sans", "Noto Sans Malayalam", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const w = ctx.measureText(text).width;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(node.x - w / 2 - 2, node.y + r + 2, w + 4, fs + 3);
        ctx.fillStyle = isDoc ? '#17251C' : '#64748B';
        ctx.fillText(text, node.x, node.y + r + 3);
      }
      ctx.globalAlpha = 1;
    },
    [neighbours, selected, typeColor]
  );

  const linkColor = useCallback(
    (l) => {
      const a = typeof l.source === 'object' ? l.source.id : l.source;
      const b = typeof l.target === 'object' ? l.target.id : l.target;
      if (neighbours && !(neighbours.has(a) && neighbours.has(b))) return 'rgba(203,213,205,0.2)';
      if (l.relation_type === 'mentions') return 'rgba(148,163,184,0.45)';
      return `rgba(21,128,61,${0.22 + l.weight * 0.55})`;
    },
    [neighbours]
  );

  const selectedLinks = useMemo(() => {
    if (!selected || selected.group !== 'document') return [];
    const byId = Object.fromEntries(data.nodes.map((n) => [n.id, n]));
    return data.links
      .filter((l) => l.relation_type === 'similarity')
      .map((l) => {
        const a = typeof l.source === 'object' ? l.source.id : l.source;
        const b = typeof l.target === 'object' ? l.target.id : l.target;
        if (a !== selected.id && b !== selected.id) return null;
        return { other: byId[a === selected.id ? b : a], weight: l.weight, shared: l.shared };
      })
      .filter(Boolean)
      .sort((x, y) => y.weight - x.weight);
  }, [selected, data]);

  if (raw === null) return <Loading />;
  const docCount = raw.nodes.filter((n) => n.group === 'document').length;
  const simCount = raw.edges.filter((e) => e.relation_type === 'similarity').length;

  return (
    <div className="page-wide">
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>{t('graph.title')}</h1>
          <p>{t('graph.sub')}</p>
        </div>
        <div className="status-pill">
          {docCount} documents · {simCount} links
        </div>
      </div>

      {docCount === 0 ? (
        <div className="panel">
          <Empty
            title="Nothing to connect yet"
            icon={Network}
            action={
              <Link to="/library" className="btn btn-primary">
                Upload documents
              </Link>
            }
          >
            Upload two or more documents and DocuHub will automatically map their connections.
          </Empty>
        </div>
      ) : (
        <div className="graph-layout">
          <div className="graph-canvas" ref={box}>
            <ForceGraph2D
              ref={fg}
              width={width}
              height={height}
              graphData={data}
              backgroundColor="rgba(0,0,0,0)"
              nodeCanvasObject={paint}
              nodePointerAreaPaint={(node, color, ctx) => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI);
                ctx.fill();
              }}
              linkColor={linkColor}
              linkWidth={(l) => (l.relation_type === 'mentions' ? 0.6 : 0.9 + l.weight * 3.4)}
              onNodeHover={setHover}
              onNodeClick={(n) => {
                setSelected(n);
                fg.current?.centerAt(n.x, n.y, 600);
              }}
              onBackgroundClick={() => setSelected(null)}
              cooldownTicks={120}
              onEngineStop={() => !selected && fg.current?.zoomToFit(500, 60)}
            />

            <div className="graph-toolbar">
              <label className="row" style={{ gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={entities}
                  onChange={(e) => setEntities(e.target.checked)}
                  style={{ accentColor: 'var(--accent)' }}
                />{' '}
                Shared entities
              </label>
              <span className="faint">|</span>
              <label className="row" style={{ gap: 6 }}>
                Min. similarity
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.05"
                  value={minWeight}
                  onChange={(e) => setMinWeight(Number(e.target.value))}
                  style={{ width: 90, accentColor: 'var(--accent)' }}
                />
                <span className="mono" style={{ width: 32 }}>
                  {minWeight.toFixed(2)}
                </span>
              </label>
            </div>

            <div className="graph-legend">
              {Object.entries(typeColor).map(([ty, c]) => (
                <span key={ty}>
                  <i style={{ background: c }} />
                  {ty}
                </span>
              ))}
              {entities && (
                <span>
                  <i style={{ background: ENTITY_COLOR }} />
                  entity
                </span>
              )}
            </div>
          </div>

          <aside className="graph-side">
            {!selected ? (
              <div>
                <div className="section-title">Inspect Graph</div>
                <p className="note">
                  Each node represents a document, scaled by its connections. Edges indicate semantic similarity and shared tags or entities.
                </p>
                <p className="note mt-12">Click any node to view why documents are linked and jump directly to its content.</p>
              </div>
            ) : selected.group !== 'document' ? (
              <div>
                <div className="eyebrow">Entity · {selected.group.toUpperCase()}</div>
                <h3 className="mt-8">{selected.label}</h3>
                <p className="note mt-8">Referenced across {selected.degree} documents in this collection.</p>
              </div>
            ) : (
              <div className="fade-up">
                <div className="eyebrow" style={{ textTransform: 'capitalize' }}>
                  {selected.doc_type || 'document'} · {LANG_LABEL[selected.language] || selected.language}
                </div>
                <h3 className="mt-8">{stripExt(selected.label)}</h3>
                <div className="mt-12">
                  <Tags tags={selected.tags} max={6} />
                </div>
                <div className="row mt-16" style={{ gap: 8 }}>
                  <Link to={`/library/${selected.id}`} className="btn btn-sm">
                    Open file
                  </Link>
                  <Link to={`/ask?doc=${selected.id}`} className="btn btn-primary btn-sm">
                    Ask AI
                  </Link>
                </div>
                <div className="section-title mt-24">
                  Linked Documents <span className="aside">{selectedLinks.length}</span>
                </div>
                {selectedLinks.length === 0 ? (
                  <p className="note">No links above the current similarity threshold.</p>
                ) : (
                  <div className="list">
                    {selectedLinks.map(({ other, weight, shared }) => (
                      <button
                        type="button"
                        key={other.id}
                        className="list-row"
                        style={{ alignItems: 'flex-start', paddingLeft: 0, paddingRight: 0 }}
                        onClick={() => setSelected(other)}
                      >
                        <div className="stack" style={{ flex: 1, minWidth: 0, gap: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{stripExt(other.label)}</span>
                          {shared?.length > 0 && <span className="xsmall faint">Shared: {shared.slice(0, 4).join(', ')}</span>}
                        </div>
                        <span className="lang-chip">{Math.round(weight * 100)}%</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
