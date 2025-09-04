import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { notesApi } from '../services/api';
import Pagination from '../components/Pagination';

// Normalizes the backend response: works with {data:[...], meta:{...}}
// and with {data:{data:[...], meta:{...}}}
function normalizeListResponse(resp) {
  if (!resp) return { items: [], meta: null };
  // Format A: { data: [...], meta: {...} }
  if (Array.isArray(resp?.data)) return { items: resp.data, meta: resp.meta ?? null };
  // Format B: { data: { data: [...], meta: {...} } }
  if (resp?.data && Array.isArray(resp.data.data)) {
    return { items: resp.data.data, meta: resp.data.meta ?? resp.meta ?? null };
  }
  return { items: [], meta: null };
}

export default function NotesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = (searchParams.get('q') ?? '').trim();
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

  const [qInput, setQInput] = useState(q);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Keep input synchronized with URL
  useEffect(() => setQInput(q), [q]);

  // Load list when q or page changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        // api.js: getNotes(searchQuery, page)
        const resp = await notesApi.getNotes(q, page);
        const { items, meta } = normalizeListResponse(resp);
        if (!cancelled) {
          setItems(items);
          setMeta(meta);
        }
      } catch (e) {
        if (!cancelled) setErrorMsg('Error al cargar notas.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [q, page]);

  // Search debounce -> update ?q= and reset to page=1
  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      next.set('q', qInput);
      next.set('page', '1');
      setSearchParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput]);

  const onPageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const onDelete = async (id) => {
    if (!confirm('¿Seguro que deseas borrar esta nota?')) return;
    await notesApi.deleteNote(id);

    // Reload the current page after deleting.
    const resp = await notesApi.getNotes(q, page);
    const { items: newItems, meta: newMeta } = normalizeListResponse(resp);

    // If this page is empty and it is not the first one, go back one page.
    if (newItems.length === 0 && page > 1) {
      const prev = new URLSearchParams(searchParams);
      prev.set('page', String(page - 1));
      setSearchParams(prev);
      return;
    }

    setItems(newItems);
    setMeta(newMeta);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Notas</h1>
        <Link to="/new" className="btn">Nueva Nota</Link>
      </header>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Buscar por título..."
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          aria-label="Buscar"
        />
      </div>

      {/* Pagination start */}
      <Pagination meta={meta} onPageChange={onPageChange} maxWindow={3} fixedStart />

      {loading && <div className="status">Cargando…</div>}
      {errorMsg && <div className="error" role="alert">{errorMsg}</div>}

      {!loading && !errorMsg && items.length === 0 && (
        <div className="empty">
          No hay notas que coincidan.
          <div style={{ marginTop: '.75rem' }}>
            <Link to="/new" className="btn">Crear tu primera nota</Link>
          </div>
        </div>
      )}

      <ul className="notes">
        {items.map(n => (
          <li key={n.id} className="note">
            <div className="note-main">
              <h3>{n.title}</h3>
              {n.content && <p>{n.content}</p>}
              {n.created_at && <small>Creada: {new Date(n.created_at).toLocaleString()}</small>}
            </div>
            <div className="note-actions">
              <Link to={`/edit/${n.id}`} className="btn btn-outline">Editar</Link>
              <button className="btn btn-danger" onClick={() => onDelete(n.id)}>Borrar</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination end */}
      <Pagination meta={meta} onPageChange={onPageChange} maxWindow={3} fixedStart />

      <style>{`
        .container { max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
        .header { display:flex; justify-content: space-between; align-items:center; margin-bottom: 1rem; gap: 1rem; }
        .toolbar { margin-bottom: .5rem; }
        .toolbar input { width: 100%; padding: .6rem .8rem; border: 1px solid #ccc; border-radius: .4rem; }
        .notes { list-style: none; padding: 0; margin: 0; display: grid; gap: .75rem; }
        .note { border: 1px solid #e5e7eb; border-radius: .6rem; padding: .8rem; display:flex; justify-content: space-between; gap: 1rem; }
        .note h3 { margin: 0 0 .3rem; }
        .note p { margin: 0 0 .4rem; color: #444; }
        .note small { color: #666; }
        .note-actions { display:flex; gap: .5rem; align-items: center; }
        .btn { display:inline-flex; align-items:center; gap:.4rem; border: 1px solid #ccc; background:#fff; padding:.45rem .7rem; border-radius:.4rem; text-decoration:none; }
        .btn:hover { background:#f8f8f8; }
        .btn-outline { background:#fff; }
        .btn-danger { background:#fff; border-color:#dc2626; color:#dc2626; }
        .btn-danger:hover { background:#fee2e2; }
        .status { padding:.8rem; }
        .error { color:#b91c1c; background:#fee2e2; padding:.7rem; border-radius:.4rem; }
        .empty { color:#555; padding: .8rem; text-align:center; }
      `}</style>
    </div>
  );
}
