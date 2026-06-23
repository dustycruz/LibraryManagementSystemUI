import React from 'react';
import { useAuth } from '../context/useAuth';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Favorites() {
  const { favorites, toggleFavorite, addToCart, cart } = useAuth();

  const containerStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 63, 127, 0.12)',
  };

  const buttonStyle = (bgColor, textColor) => ({
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: bgColor,
    color: textColor,
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  });

  // Replaced window.confirm with custom interactive React-Toastify layout
  const handleRemoveFavorite = (book) => {
    const toastId = toast.info(
      <div style={{ fontSize: '14px', fontFamily: 'inherit' }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>
          Remove <strong>"{book.title}"</strong> from your favorites?
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              toggleFavorite(book);
              toast.success(`"${book.title}" removed from favorites.`);
            }}
            style={{ padding: '4px 10px', backgroundColor: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            style={{ padding: '4px 10px', backgroundColor: '#e0e4ea', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
          >
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false }
    );
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#003f7f', marginBottom: '24px' }}>
        My Favorite Books
      </h1>

      {favorites.length === 0 ? (
        <div style={containerStyle}>
          <p style={{ textAlign: 'center', color: '#6c757d', margin: '20px 0' }}>You haven't favorited any books yet.</p>
          <div style={{ textAlign: 'center' }}>
            <Link to="/books" style={{ color: '#003f7f', fontWeight: '600', textDecoration: 'none' }}>
              ← Explore the Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div style={containerStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e8eaed', color: '#374151', fontSize: '13px' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Title</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Author</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {favorites.map((book) => {
                const inCart = cart.some(item => item.bookId === book.bookId);
                return (
                  <tr key={book.bookId} style={{ borderBottom: '1px solid #e8eaed' }}>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{book.title}</td>
                    <td style={{ padding: '12px', color: '#6c757d', fontSize: '13px' }}>{book.author}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => { if (!inCart) addToCart(book); }}
                          disabled={inCart}
                          style={buttonStyle(inCart ? '#cbd5e1' : '#10b981', '#fff')}
                        >
                          {inCart ? 'In Cart ' : 'Reserve'}
                        </button>
                        <button
                          onClick={() => handleRemoveFavorite(book)}
                          style={buttonStyle('#ef4444', '#fff')}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}