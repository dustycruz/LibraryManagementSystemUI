import { useAuth } from '../../context/useAuth';
import { formatDate, formatCurrency } from '../../utils/helpers';

const STATUS_CLASS = {
  Borrowed: 'status-borrowed',
  Returned: 'status-returned',
  Overdue:  'status-overdue',
  Lost:     'status-lost',
};

export default function BorrowTable({ borrows, onReturn, loading }) {
  const { isAdminOrLibrarian } = useAuth();

  if (loading) return (
    <div className="spinner-wrap"><div className="spinner" /></div>
  );

  if (borrows.length === 0) return (
    <div className="empty-state">
      <div className="empty-icon">📋</div>
      <div className="empty-text">No borrow records found</div>
    </div>
  );

  return (
    <div className="lms-table-wrap">
      <table className="lms-table">
        <thead>
          <tr>
            <th>#</th>
            {isAdminOrLibrarian() && <th>Member</th>}
            <th>Book</th>
            <th>Borrowed</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Fine</th>
            {isAdminOrLibrarian() && <th style={{ textAlign: 'right' }}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {borrows.map(b => (
            <tr key={b.borrowId}>
              <td><span className="mono text-muted">{b.borrowId}</span></td>

              {isAdminOrLibrarian() && (
                <td>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{b.memberName}</div>
                  <div style={{ fontSize: 12, color: 'var(--outline)' }}>{b.memberEmail}</div>
                </td>
              )}

              <td>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{b.bookTitle}</div>
                <div style={{ fontSize: 12, color: 'var(--outline)' }}>{b.bookISBN}</div>
              </td>

              <td style={{ fontSize: 13, color: 'var(--on-surface-var)' }}>
                {formatDate(b.borrowDate)}
              </td>

              <td>
                <div style={{
                  fontSize: 13,
                  fontWeight: b.daysOverdue > 0 && b.status !== 'Returned' ? 600 : 400,
                  color: b.daysOverdue > 0 && b.status !== 'Returned' ? 'var(--danger)' : 'var(--on-surface-var)',
                }}>
                  {formatDate(b.dueDate)}
                </div>
                {b.daysOverdue > 0 && b.status !== 'Returned' && (
                  <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2 }}>
                    {b.daysOverdue} days overdue
                  </div>
                )}
              </td>

              <td>
                <span className={`lms-badge ${STATUS_CLASS[b.status] || 'gray'}`}>
                  {b.status}
                </span>
              </td>

              <td>
                {b.fineAmount > 0 ? (
                  <span style={{ fontSize: 13, fontWeight: 600, color: b.fineIsPaid ? 'var(--success)' : 'var(--danger)' }}>
                    {formatCurrency(b.fineAmount)}
                    <span style={{ fontSize: 11, marginLeft: 4 }}>{b.fineIsPaid ? '✓' : '✗'}</span>
                  </span>
                ) : (
                  <span style={{ color: 'var(--outline)', fontSize: 13 }}>—</span>
                )}
              </td>

              {isAdminOrLibrarian() && (
                <td style={{ textAlign: 'right' }}>
                  {b.status !== 'Returned' ? (
                    <button
                      className="lms-btn success sm"
                      onClick={() => {
                        if (window.confirm(`Mark as return "${b.bookTitle}"?`)) {
                          onReturn(b.borrowId);
                        }
                      }}
                    >
                      Mark as Return
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--outline)' }}>—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}