import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

function BookTable({ books, loading, onDelete, onBorrow }) {
  const { isAdminOrLibrarian } = useAuth();
  
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
        <div style={{ fontSize: '14px', fontWeight: '500' }}>Loading books...</div>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
        <div style={{ fontSize: '14px' }}>No books found.</div>
      </div>
    );
  }

  const buttonStyle = (bgColor, textColor) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: bgColor,
    color: textColor,
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  });

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e8eaed' }}>
          <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' }}>
            Title
          </th>
          <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' }}>
            Author
          </th>
          <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' }}>
            ISBN
          </th>
          <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' }}>
            Category
          </th>
          <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '13px' }}>
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <tr
            key={book.bookId}
            style={{
              borderBottom: '1px solid #e8eaed',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
              {book.title}
            </td>
            <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6c757d' }}>
              {book.author}
            </td>
            <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6c757d' }}>
              {book.isbn || '-'}
            </td>
            <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6c757d' }}>
              {book.categoryName || '-'}
            </td>
            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Edit Button - Admin/Librarian only */}
                {isAdminOrLibrarian() && (
                  <Link
                    to={`/books/edit/${book.bookId}`}
                    style={{
                      ...buttonStyle('#003F7F', '#fff'),
                      textDecoration: 'none',
                      display: 'inline-block',
                    }}
                    title="Edit this book"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#002d5c';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 63, 127, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#003F7F';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Edit
                  </Link>
                )}

                {/* Borrow Button - All users */}
                <button
                  onClick={() => onBorrow(book)}
                  style={buttonStyle('#1976d2', '#fff')}
                  title="Borrow this book"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1565c0';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1976d2';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Borrow
                </button>

                {/* Delete Button - Admin/Librarian only */}
                {isAdminOrLibrarian() && (
                  <button
                    onClick={() => onDelete(book.bookId)}
                    style={buttonStyle('#d32f2f', '#fff')}
                    title="Delete this book"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#b71c1c';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(211, 47, 47, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#d32f2f';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default BookTable;