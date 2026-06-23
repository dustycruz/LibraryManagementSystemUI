import React from 'react';
import { useAuth } from '../context/useAuth';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function BookCart() {
  const { cart, removeFromCart, clearCart } = useAuth();

  const containerStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 63, 127, 0.12)',
  };

  // Replaced window.confirm for single row removal with custom toast confirm layout
  const handleRemoveRow = (bookId, title) => {
    const toastId = toast.info(
      <div style={{ fontSize: '14px', fontFamily: 'inherit' }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>
          Remove <strong>"{title}"</strong> from your cart?
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              removeFromCart(bookId);
              toast.success(`"${title}" removed from cart.`);
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

  // Replaced window.confirm for multi-row clear action with toast confirm layout
  const handleClearAll = () => {
    const toastId = toast.info(
      <div style={{ fontSize: '14px', fontFamily: 'inherit' }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>Empty your entire reservation cart?</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              clearCart();
              toast.success('Your cart has been cleared.');
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

  const handleConfirmReservation = () => {
    toast.success('Reservation successfully submitted!');
    clearCart();
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#003f7f', marginBottom: '24px' }}>
        My Cart & Reservations
      </h1>

      {cart.length === 0 ? (
        <div style={containerStyle}>
          <p style={{ textAlign: 'center', color: '#6c757d', margin: '20px 0' }}>Your cart is empty.</p>
          <div style={{ textAlign: 'center' }}>
            <Link to="/books" style={{ color: '#003f7f', fontWeight: '600', textDecoration: 'none' }}>
              ← Browse books to reserve
            </Link>
          </div>
        </div>
      ) : (
        <div style={containerStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e8eaed', color: '#374151', fontSize: '13px' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Title</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Author</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((book) => (
                <tr key={book.bookId} style={{ borderBottom: '1px solid #e8eaed' }}>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{book.title}</td>
                  <td style={{ padding: '12px', color: '#6c757d', fontSize: '13px' }}>{book.author}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleRemoveRow(book.bookId, book.title)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handleClearAll}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e2e8f0',
                color: '#475569',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Clear Cart
            </button>

            <button
              onClick={handleConfirmReservation}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Confirm Reservation ({cart.length} {cart.length === 1 ? 'Book' : 'Books'})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}