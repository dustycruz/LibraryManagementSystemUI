import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import BookTable from '../components/books/BookTable';
import BookFilter from '../components/books/BookFilter';
import SearchBar from '../components/common/SearchBar';
import { getBooks, deleteBook } from '../api/booksApi';
import { getCategories } from '../api/categoriesApi';
import { borrowBook } from '../api/borrowApi';
import { useAuth } from '../context/useAuth';

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pages.push(i);
      }
    }

    const withEllipsis = [];
    let prev = null;
    for (const page of pages) {
      if (prev !== null && page - prev > 1) {
        withEllipsis.push('...');
      }
      withEllipsis.push(page);
      prev = page;
    }
    return withEllipsis;
  };

  const btnBase = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px',
    height: '36px',
    padding: '0 10px',
    borderRadius: '8px',
    border: '1px solid #e0e4ea',
    backgroundColor: '#fff',
    color: '#374151',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    lineHeight: 1,
    userSelect: 'none',
  };

  const activeBtnStyle = {
    ...btnBase,
    backgroundColor: '#003f7f',
    borderColor: '#003f7f',
    color: '#fff',
    boxShadow: '0 2px 6px rgba(0, 63, 127, 0.3)',
    cursor: 'default',
  };

  const disabledBtnStyle = {
    ...btnBase,
    opacity: 0.4,
    cursor: 'not-allowed',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '13px', color: '#6c757d' }}>
        Page <strong style={{ color: '#003f7f' }}>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? disabledBtnStyle : btnBase}
          onMouseEnter={e => { if (currentPage !== 1) { e.currentTarget.style.backgroundColor = '#f0f4f8'; e.currentTarget.style.borderColor = '#c0c8d8'; } }}
          onMouseLeave={e => { if (currentPage !== 1) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e0e4ea'; } }}
          aria-label="Previous page"
        >
          ‹
        </button>

        {/* Page numbers */}
        {getPages().map((page, idx) =>
          page === '...'
            ? (
              <span key={`ellipsis-${idx}`} style={{ ...btnBase, border: 'none', backgroundColor: 'transparent', cursor: 'default', color: '#9ca3af' }}>
                …
              </span>
            )
            : (
              <button
                key={page}
                onClick={() => page !== currentPage && onPageChange(page)}
                style={page === currentPage ? activeBtnStyle : btnBase}
                onMouseEnter={e => { if (page !== currentPage) { e.currentTarget.style.backgroundColor = '#f0f4f8'; e.currentTarget.style.borderColor = '#c0c8d8'; } }}
                onMouseLeave={e => { if (page !== currentPage) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e0e4ea'; } }}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? disabledBtnStyle : btnBase}
          onMouseEnter={e => { if (currentPage !== totalPages) { e.currentTarget.style.backgroundColor = '#f0f4f8'; e.currentTarget.style.borderColor = '#c0c8d8'; } }}
          onMouseLeave={e => { if (currentPage !== totalPages) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e0e4ea'; } }}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default function Books() {
  const { isAdminOrLibrarian } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10, totalRecords: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', categoryId: null, isActive: true });
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getBooks({ search: filters.search, categoryId: filters.categoryId, isActive: filters.isActive, page, size: 10 });
        if (!cancelled) {
          setBooks(res.data.data.data);
          setPagination({ ...res.data.data });
        }
      } catch {
        if (!cancelled) toast.error('Failed to load books.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, filters, refreshKey]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getCategories();
        if (!cancelled) setCategories(res.data.data);
      } catch {
        // silently fail
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const refresh = () => setRefreshKey(k => k + 1);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await deleteBook(id);
      toast.success('Book deleted.');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleBorrow = async (book) => {
    if (!window.confirm(`Borrow "${book.title}"?`)) return;
    try {
      await borrowBook({ bookId: book.bookId });
      toast.success(`"${book.title}" borrowed! Due in 14 days.`);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Borrow failed.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#003f7f', marginBottom: '8px' }}>
            Book Catalog
          </h1>
          <p style={{ fontSize: '14px', color: '#6c757d', margin: 0 }}>
            Browse and manage your library collection
          </p>
        </div>
        {isAdminOrLibrarian() && (
          <Link
            to="/books/add"
            style={{
              padding: '10px 20px',
              backgroundColor: '#003f7f',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(0, 63, 127, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0052a3';
              e.target.style.boxShadow = '0 4px 16px rgba(0, 63, 127, 0.35)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#003f7f';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 63, 127, 0.25)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            + Add Book
          </Link>
        )}
      </div>

      {/* Filters Section */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(0, 63, 127, 0.12)',
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <SearchBar
              onSearch={(s) => { setFilters(f => ({ ...f, search: s })); setPage(1); }}
              placeholder="Search by title, author, or ISBN..."
            />
          </div>
          <div style={{ minWidth: '200px' }}>
            <BookFilter
              categories={categories}
              currentFilters={filters}
              onFilterChange={(f) => { setFilters(f); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Books Table */}
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
            Books Collection
          </h2>
          <span style={{ fontSize: '13px', color: '#6c757d', fontWeight: '600' }}>
            {pagination.totalRecords} records
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <BookTable books={books} loading={loading} onDelete={handleDelete} onBorrow={handleBorrow} />
        </div>
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e8eaed',
          backgroundColor: '#fafbfc',
        }}>
          <Pagination
            currentPage={pagination.pageNumber}
            totalPages={pagination.totalPages}
            onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        </div>
      </div>
    </div>
  );
}