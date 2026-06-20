import { useState } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Search...' }) {
  const [value, setValue] = useState('');
  const primaryColor = '#003F7F';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          width: '100%',
          border: '1px solid #e0e4ea',
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
      >
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 12px',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            fontFamily: 'inherit',
            color: '#111827',
          }}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              border: 'none',
              background: 'transparent',
              padding: '0 12px',
              cursor: 'pointer',
              color: '#6b7280',
              fontSize: '16px',
            }}
          >
            ✕
          </button>
        )}

        <button
          type="submit"
          style={{
            backgroundColor: primaryColor,
            border: 'none',
            color: '#fff',
            padding: '0 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0052a3')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = primaryColor)}
        >
          Search
        </button>
      </div>
    </form>
  );
}