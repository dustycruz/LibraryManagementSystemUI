import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getOverdueBooks } from '../api/reportsApi';
import { formatCurrency } from '../utils/helpers';

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
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          style={currentPage === 1 ? disabledBtnStyle : btnBase}
          onMouseEnter={e => { if (currentPage !== 1) { e.currentTarget.style.backgroundColor = '#f0f4f8'; e.currentTarget.style.borderColor = '#c0c8d8'; }}}
          onMouseLeave={e => { if (currentPage !== 1) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e0e4ea'; }}}
          aria-label="Previous page">‹</button>
        {getPages().map((page, idx) =>
          page === '...'
            ? <span key={`e-${idx}`} style={{ ...btnBase, border: 'none', backgroundColor: 'transparent', cursor: 'default', color: '#9ca3af' }}>…</span>
            : <button key={page} onClick={() => page !== currentPage && onPageChange(page)}
                style={page === currentPage ? activeBtnStyle : btnBase}
                onMouseEnter={e => { if (page !== currentPage) { e.currentTarget.style.backgroundColor = '#f0f4f8'; e.currentTarget.style.borderColor = '#c0c8d8'; }}}
                onMouseLeave={e => { if (page !== currentPage) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e0e4ea'; }}}
                aria-current={page === currentPage ? 'page' : undefined}>{page}</button>
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          style={currentPage === totalPages ? disabledBtnStyle : btnBase}
          onMouseEnter={e => { if (currentPage !== totalPages) { e.currentTarget.style.backgroundColor = '#f0f4f8'; e.currentTarget.style.borderColor = '#c0c8d8'; }}}
          onMouseLeave={e => { if (currentPage !== totalPages) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e0e4ea'; }}}
          aria-label="Next page">›</button>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

const inputStyle = {
  padding: '9px 12px', fontSize: '14px', border: '1px solid #e0e4ea',
  borderRadius: '8px', outline: 'none', backgroundColor: '#fff',
  color: '#374151', transition: 'border-color 0.15s', fontFamily: 'inherit',
};
const selectStyle = {
  ...inputStyle, cursor: 'pointer', paddingRight: '32px',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236c757d' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
};

export default function OverdueBooks() {
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getOverdueBooks();
        if (!cancelled) setOverdueBooks(res.data.data);
      } catch (err) {
        if (!cancelled) toast.error(err.response?.data?.message || err.message || 'Failed to load overdue books.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSpinner />;

  const filtered = overdueBooks.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.memberName?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.bookTitle?.toLowerCase().includes(q) ||
      r.isbn?.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'paid' && r.fineIsPaid) ||
      (statusFilter === 'unpaid' && !r.fineIsPaid);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedData = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleStatus = (val) => { setStatusFilter(val); setPage(1); };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#003f7f', marginBottom: '8px' }}>
          Overdue Books Report
        </h1>
        <p style={{ fontSize: '14px', color: '#6c757d', margin: 0 }}>
          Track overdue borrowings and outstanding fines
        </p>
      </div>

      {/* Filters — same card style as Books */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px',
        marginBottom: '20px', boxShadow: '0 4px 12px rgba(0, 63, 127, 0.12)',
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
<input
  type="text"
  value={search}
  onChange={e => handleSearch(e.target.value)}
  placeholder="Search by member, email, title, or ISBN..."
  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
  onFocus={e => (e.target.style.borderColor = '#003f7f')}
  onBlur={e => (e.target.style.borderColor = '#e0e4ea')}
/>
          </div>
          <div style={{ minWidth: '160px' }}>
            <select
              value={statusFilter}
              onChange={e => handleStatus(e.target.value)}
              style={{ ...selectStyle, width: '100%', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#003f7f')}
              onBlur={e => (e.target.style.borderColor = '#e0e4ea')}
            >
              <option value="all">All Statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{
          backgroundColor: '#fff', borderRadius: '12px', padding: '48px 24px',
          textAlign: 'center', boxShadow: '0 4px 12px rgba(0, 63, 127, 0.12)', color: '#6c757d',
        }}>
          {overdueBooks.length === 0 ? 'No overdue books found.' : 'No results match your search.'}
        </div>
      ) : (
        <div style={{
          backgroundColor: '#fff', borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 63, 127, 0.12)', overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #e8eaed',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#003f7f', margin: 0 }}>Overdue Books</h2>
            <span style={{ fontSize: '13px', color: '#6c757d', fontWeight: '600' }}>{filtered.length} records</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafb' }}>
                  {['Member Name','Email','Book Title','ISBN','Borrow Date','Due Date','Days Overdue','Fine Amount','Status'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(record => (
                  <tr
                    key={record.borrowId}
                    style={{ borderBottom: '1px solid #e8eaed', transition: 'background 0.15s', backgroundColor: record.fineIsPaid ? 'transparent' : 'rgba(239,68,68,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = record.fineIsPaid ? 'rgba(0,63,127,0.03)' : 'rgba(239,68,68,0.07)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = record.fineIsPaid ? 'transparent' : 'rgba(239,68,68,0.04)')}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: '600', whiteSpace: 'nowrap' }}>{record.memberName}</td>
                    <td style={{ padding: '14px 16px', color: '#6c757d', fontSize: '14px' }}>{record.email}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px' }}>{record.bookTitle}</td>
                    <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '12px', color: '#6c757d' }}>{record.isbn}</span></td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#6c757d', whiteSpace: 'nowrap' }}>{new Date(record.borrowDate).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#6c757d', whiteSpace: 'nowrap' }}>{new Date(record.dueDate).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                        {record.daysOverdue}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#ef4444', whiteSpace: 'nowrap' }}>{formatCurrency(record.fineAmount)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
                        fontSize: '12px', fontWeight: '600', color: '#fff',
                        backgroundColor: record.fineIsPaid ? '#10b981' : '#ef4444',
                      }}>
                        {record.fineIsPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid #e8eaed', backgroundColor: '#fafbfc' }}>
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}