import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import BorrowTable from '../components/borrow/BorrowTable';
import { getMyHistory, returnBook } from '../api/borrowApi';

export default function BorrowHistory() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getMyHistory()
      .then(res => setBorrows(res.data.data))
      .catch(() => toast.error('Failed to load history.'))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleReturn = async (borrowId) => {
    if (!window.confirm('Mark this book as returned?')) return;
    try {
      const res = await returnBook(borrowId);
      const borrow = res.data.data;
      if (borrow.fineAmount > 0) {
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
          My Borrow History
        </h1>
        <p style={{ fontSize: '14px', color: '#6c757d', margin: 0 }}>
          Track all your borrowed books and return dates
        </p>
      </div>

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
            All My Borrows
          </h2>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            backgroundColor: '#003f7f',
            color: '#ffffff',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
          }}>
            {borrows.length}
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <BorrowTable borrows={borrows} loading={loading} onReturn={handleReturn} />
        </div>
      </div>
    </div>
  );
}