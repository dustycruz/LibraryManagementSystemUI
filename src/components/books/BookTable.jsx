import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

function BookTable({ books, loading, onDelete, onBorrow }) {
  const { isAdminOrLibrarian, toggleFavorite, isFavorite, addToCart, cart } = useAuth();
  
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
    padding: '8px 14px',
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
        {books.map((book) => {
          const favorited = isFavorite(book.bookId);
          const inCart = cart.some(item => item.bookId === book.bookId);

          return (
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
                  
                  {/* Thick Lucide Heart Action Button */}
                  <button
                    onClick={() => toggleFavorite(book)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      transition: 'transform 0.1s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={favorited ? "Remove from Favorites" : "Add to Favorites"}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Heart 
                      size={20} 
                      strokeWidth={2.5}
                      color={favorited ? '#ef4444' : '#9ca3af'}
                      fill={favorited ? '#ef4444' : 'none'} 
                    />
                  </button>

                  {/* Edit Button - Changed color to #1976d2 */}
                  {isAdminOrLibrarian() && (
                    <Link
                      to={`/books/edit/${book.bookId}`}
                      style={{
                        ...buttonStyle('#1976d2', '#fff'),
                        textDecoration: 'none',
                        display: 'inline-block',
                      }}
                      title="Edit this book"
                    >
                      Edit
                    </Link>
                  )}

                  {/* Reserve / Add to Cart Button */}
                  <button
                    onClick={() => {
                      if (!inCart) {
                        addToCart(book);
                      }
                    }}
                    disabled={inCart}
                    style={buttonStyle(inCart ? '#cbd5e1' : '#10b981', '#fff')}
                    title={inCart ? "Already in cart" : "Reserve this book"}
                  >
                    {inCart ? 'In Cart ' : 'Reserve'}
                  </button>

                  {/* Direct Borrow Button - Changed color to #003F7F */}
                  <button
                    onClick={() => onBorrow(book)}
                    style={buttonStyle('#003F7F', '#fff')}
                    title="Instant borrow"
                  >
                    Borrow
                  </button>

                  {/* Delete Button */}
                  {isAdminOrLibrarian() && (
                    <button
                      onClick={() => onDelete(book.bookId)}
                      style={buttonStyle('#d32f2f', '#fff')}
                      title="Delete this book"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default BookTable;