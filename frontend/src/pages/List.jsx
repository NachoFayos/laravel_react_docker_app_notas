
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getNotes, deleteNote } from '../services/api';
import Pagination from '../components/Pagination';

export default function ListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qFromUrl = searchParams.get('q') ?? '';
  const pageFromUrl = Number(searchParams.get('page') ?? '1');

  const [qInput, setQInput] = useState(qFromUrl);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Recalculates when q or page changes in the URL
  const query = useMemo(() => qFromUrl.trim(), [qFromUrl]);
  const page = useMemo(() => (Number.isFinite(pageFromUrl) && pageFromUrl > 0) ? pageFromUrl : 1, [pageFromUrl]);

  // Debounce input: when typing, we update URL (?q=&page=1) after 300ms
  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      next.set('q', qInput);
      next.set('page', '1'); // When changing the search, we return to the first page
      setSearchParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(id);
  }, [qInput]);

  // Load data when q or page changes (from URL)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErrorMsg('');
      try {
        const { items, meta } = await getNotes({ q: query, page });
        if (!cancelled) {
          setItems(items);
          setMeta(meta);
        }
      } catch (err) {
        if (!cancelled) setErrorMsg('Error al cargar notas.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [query, page]);

  const onPageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const onDelete = async (id) => {
    if (!confirm('¿Seguro que deseas borrar esta nota?')) return;
    try {
      await deleteNote(id);
      // Reload the current page after deleting:
      const { items: newItems, meta: newMeta } = await getNotes({ q: query, page });
      setItems(newItems);
      setMeta(newMeta);
    } catch {
      alert('No se pudo borrar la nota.');
    }
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

      {loading && <div className="status">Cargando…</div>}
      {errorMsg && <div className="error" role="alert">{errorMsg}</div>}

      {!loading && !errorMsg && items.length === 0 && (
        <div className="empty">No hay notas que coincidan.</div>
      )}

      <ul className="notes">
        {items.map(n => (
          <li key={n.id} className="note">
            <div className="note-main">
              <h3>{n.title}</h3>
              {n.content && <p>{n.content}</p>}
              <small>Creada: {new Date(n.created_at).toLocaleString()}</small>
            </div>
            <div className="note-actions">
              <Link to={`/edit/${n.id}`} className="btn btn-outline">Editar</Link>
              <button className="btn btn-danger" onClick={() => onDelete(n.id)}>Borrar</button>
            </div>
          </li>
        ))}
      </ul>

      <Pagination meta={meta} onPageChange={onPageChange} />

      <style>{`
        .container { max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
        .header { display:flex; justify-content: space-between; align-items:center; margin-bottom: 1rem; gap: 1rem; }
        .toolbar { margin-bottom: 1rem; }
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
        .empty { color:#555; padding: .8rem; }
      `}</style>
    </div>
  );
}
