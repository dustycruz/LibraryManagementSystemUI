import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import BorrowTable from '../components/borrow/BorrowTable';
import { getAllBorrows, returnBook } from '../api/borrowApi';

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) pages.push(i);
    }
    const withEllipsis = [];
    let prev = null;
    for (const page of pages) {
      if (prev !== null && page - prev > 1) withEllipsis.push('...');
      withEllipsis.push(page);
      prev = page;
    }
    return withEllipsis;
  };

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '36px', height: '36px', padding: '0 10px', borderRadius: '8px',
    border: '1px solid #e0e4ea', backgroundColor: '#fff', color: '#374151',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
    transition: 'all 0.15s ease', lineHeight: 1, userSelect: 'none',
  };
  const activeBtnStyle = {
    ...btnBase, backgroundColor: '#003f7f', borderColor: '#003f7f', color: '#fff',
    boxShadow: '0 2px 6px rgba(0, 63, 127, 0.3)', cursor: 'default',
  };
  const disabledBtnStyle = { ...btnBase, opacity: 0.4, cursor: 'not-allowed' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '13px', color: '#6c757d' }}>
        Page <strong style={{ color: '#003f7f' }}>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          style={currentPage === 1 ? disabledBtnStyle : btnBase}
          onMouseEnter={e => { if (currentPage !== 1) { e.currentTarget.style.backgroundColor = '#f0f4f8'; e.currentTarget.style.borderColor = '#c0c8d8'; }}}
          onMouseLeave={e => { if (currentPage !== 1) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e0e4ea'; }}}
          aria-label="Previous page"
        >‹</button>
        {getPages().map((page, idx) =>
          page === '...'
            ? <span key={`e-${idx}`} style={{ ...btnBase, border: 'none', backgroundColor: 'transparent', cursor: 'default', color: '#9ca3af' }}>…</span>
            : <button
                key={page}
                onClick={() => page !== currentPage && onPageChange(page)}
                style={page === currentPage ? activeBtnStyle : btnBase}
                onMouseEnter={e => { if (page !== currentPage) { e.currentTarget.style.backgroundColor = '#f0f4f8'; e.currentTarget.style.borderColor = '#c0c8d8'; }}}
                onMouseLeave={e => { if (page !== currentPage) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e0e4ea'; }}}
                aria-current={page === currentPage ? 'page' : undefined}
              >{page}</button>
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          style={currentPage === totalPages ? disabledBtnStyle : btnBase}
          onMouseEnter={e => { if (currentPage !== totalPages) { e.currentTarget.style.backgroundColor = '#f0f4f8'; e.currentTarget.style.borderColor = '#c0c8d8'; }}}
          onMouseLeave={e => { if (currentPage !== totalPages) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e0e4ea'; }}}
          aria-label="Next page"
        >›</button>
      </div>
    </div>
  );
}

export default function ManageBorrows() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getAllBorrows({ status: statusFilter || undefined, page, size: 15 });
        if (!cancelled) {
          const d = res.data.data;
          setBorrows(d.data);
          setTotalPages(d.totalPages);
          setTotalRecords(d.totalRecords);
        }
      } catch {
        if (!cancelled) toast.error('Failed to load borrows.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, statusFilter, refreshKey]);

  const handleReturn = async (borrowId) => {
    if (!window.confirm('Mark this book as returned?')) return;
    try {
      const res = await returnBook(borrowId);
      const borrow = res.data.data;
      if (borrow.fineAmount) {
        toast.warning(`Book returned. Fine: ₱${borrow.fineAmount.toFixed(2)} (${borrow.daysOverdue} days overdue)`);
      } else {
        toast.success('Book returned successfully!');
      }
      setRefreshKey(k => k + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return failed.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#003f7f', marginBottom: '8px' }}>
          Manage Borrows
        </h1>
        <p style={{ fontSize: '14px', color: '#6c757d', margin: 0 }}>
          Monitor and manage all book borrowing transactions
        </p>
      </div>

      {/* Filter Section */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(0, 63, 127, 0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{
            padding: '9px 32px 9px 12px', fontSize: '14px',
            border: '1px solid #e0e4ea', borderRadius: '8px',
            backgroundColor: '#fff', color: '#374151', cursor: 'pointer',
            outline: 'none', minWidth: '160px',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236c757d' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#003f7f')}
          onBlur={(e) => (e.target.style.borderColor = '#e0e4ea')}
        >
          <option value="">All Statuses</option>
          <option value="Borrowed">Borrowed</option>
          <option value="Returned">Returned</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Borrows Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 63, 127, 0.12)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e8eaed',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#003f7f', margin: 0 }}>
            Borrow Records
          </h2>
          <span style={{ fontSize: '13px', color: '#6c757d', fontWeight: '600' }}>
            {totalRecords} total
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <BorrowTable borrows={borrows} loading={loading} onReturn={handleReturn} />
        </div>
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e8eaed',
          backgroundColor: '#fafbfc',
        }}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        </div>
      </div>
    </div>
  );
}