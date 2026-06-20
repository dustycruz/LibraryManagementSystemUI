export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;
  
    const getPages = () => {
      const pages = [];
      const delta = 2;
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta))
          pages.push(i);
      }
      const result = [];
      let prev = null;
      for (const p of pages) {
        if (prev !== null && p - prev > 1) result.push('...');
        result.push(p);
        prev = p;
      }
      return result;
    };
  
    return (
      <div className="pagination">
        <span className="pagination-info">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
        <div className="pagination-pages">
          <button
            className="pg-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous"
          >‹</button>
  
          {getPages().map((p, i) =>
            p === '...'
              ? <span key={`e${i}`} className="pg-ellipsis">…</span>
              : <button
                  key={p}
                  className={`pg-btn ${p === currentPage ? 'active' : ''}`}
                  onClick={() => p !== currentPage && onPageChange(p)}
                  aria-current={p === currentPage ? 'page' : undefined}
                >{p}</button>
          )}
  
          <button
            className="pg-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next"
          >›</button>
        </div>
      </div>
    );
  }