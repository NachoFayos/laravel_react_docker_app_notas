import React from 'react';

/**
* Props:
* - meta: { current_page:number, last_page:number }
* - onPageChange(page:number)
* - maxWindow: Number of numbered buttons visible in the "window" (default 5)
* - fixedStart: If true, the window is always 1..maxWindow (useful for setting 1, 2, 3)
*/
export default function Pagination({
  meta,
  onPageChange,
  maxWindow = 5,
  fixedStart = false,
}) {
  const last = Number(meta?.last_page || 0);
  if (!last || last <= 1) return null;

  const current = Number(meta?.current_page || 1);

  // 1) Calculate the main page window
  let start, end;
  if (fixedStart) {
    start = 1;
    end = Math.min(last, maxWindow);
  } else {
    start = Math.max(1, current - Math.floor(maxWindow / 2));
    end = Math.min(last, start + maxWindow - 1);
    start = Math.max(1, end - maxWindow + 1);
  }

  const windowPages = [];
  for (let p = start; p <= end; p++) windowPages.push(p);

  // 2) Single set of pages to render (avoid duplicates)
  const set = new Set(windowPages);
  set.add(1);              
  set.add(current);        
  set.add(last);           

  // 3) Order and normalize
  const pages = Array.from(set)
    .filter((p) => p >= 1 && p <= last)
    .sort((a, b) => a - b);

  const go = (p) => onPageChange(Math.min(Math.max(1, p), last));

  return (
    <nav aria-label="Paginación" className="pagination">
      <button
        type="button"
        className="page-btn"
        onClick={() => go(current - 1)}
        disabled={current <= 1}
        aria-label="Anterior"
      >
        ←
      </button>

      {/* 4) Pages + ellipses between spaces */}
      {pages.map((p, idx) => {
        const prev = pages[idx - 1];
        const needEllipsis = idx > 0 && p - prev > 1;
        return (
          <React.Fragment key={`p-${p}`}>
            {needEllipsis && <span className="ellipsis">…</span>}
            <button
              type="button"
              className={`page-btn ${p === current ? 'active' : ''}`}
              aria-current={p === current ? 'page' : undefined}
              onClick={() => go(p)}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}

      <button
        type="button"
        className="page-btn"
        onClick={() => go(current + 1)}
        disabled={current >= last}
        aria-label="Siguiente"
      >
        →
      </button>

      <style>{`
        .pagination {
          display: flex;
          gap: .4rem;
          align-items: center;
          justify-content: center;
          margin: 1rem 0;
          flex-wrap: wrap;
        }
        .page-btn {
          min-width: 2.25rem;
          height: 2.25rem;
          padding: 0 .5rem;
          border: 1px solid #cbd5e1;
          background: #fff;
          border-radius: .5rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: .95rem;
          line-height: 1;
          color: #0f172a;
          cursor: pointer;
        }
        .page-btn.active, .page-btn[aria-current="page"] {
          font-weight: 700;
          border-color: #64748b;
          background: #f8fafc;
          box-shadow: inset 0 0 0 2px rgba(15,23,42,.06);
        }
        .page-btn:disabled {
          opacity: .5;
          cursor: not-allowed;
        }
        .ellipsis { padding: 0 .25rem; color: #334155; }
      `}</style>
    </nav>
  );
}
