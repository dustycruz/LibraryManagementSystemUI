import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createBook } from '../api/booksApi';
import { getCategories } from '../api/categoriesApi';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #e8eaed',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  color: '#1a1a1a',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#003f7f',
  marginBottom: '8px',
};

const FormInput = ({ label, type = 'text', placeholder, required, value, onChange, options = [] }) => (
  <div>
    <label style={labelStyle}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        style={{ ...inputStyle, resize: 'vertical' }}
        onFocus={(e) => (e.target.style.borderColor = '#003f7f')}
        onBlur={(e) => (e.target.style.borderColor = '#e8eaed')}
      />
    ) : type === 'select' ? (
      <select
        value={value}
        onChange={onChange}
        style={{ ...inputStyle, cursor: 'pointer' }}
        onFocus={(e) => (e.target.style.borderColor = '#003f7f')}
        onBlur={(e) => (e.target.style.borderColor = '#e8eaed')}
      >
        <option value="">Select {label}</option>
        {options.map(c => (
          <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = '#003f7f')}
        onBlur={(e) => (e.target.style.borderColor = '#e8eaed')}
      />
    )}
  </div>
);

export default function AddBook() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    isbn: '', title: '', author: '', publisher: '',
    publishedYear: '', categoryId: '', description: '',
    totalCopies: 1, coverImageUrl: '',
  });

  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  const validate = () => {
    if (!form.isbn) { toast.error('ISBN is required'); return false; }
    if (!form.title) { toast.error('Title is required'); return false; }
    if (!form.author) { toast.error('Author is required'); return false; }
    if (!form.categoryId) { toast.error('Category is required'); return false; }
    if (form.totalCopies < 1) { toast.error('Must have at least 1 copy'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createBook({
        ...form,
        categoryId: parseInt(form.categoryId),
        totalCopies: parseInt(form.totalCopies),
        publishedYear: form.publishedYear ? parseInt(form.publishedYear) : null,
      });
      toast.success('Book added successfully!');
      navigate('/books');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add book.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', color: '#003f7f',
            fontSize: '18px', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px',
          }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#003f7f', margin: 0 }}>
          Add New Book
        </h1>
      </div>

      <div style={{
        backgroundColor: '#ffffff', borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 63, 127, 0.12)', padding: '32px',
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px', marginBottom: '24px',
          }}>
            <FormInput
              label="ISBN" placeholder="978-x-xxx-xxxxx-x" required
              value={form.isbn}
              onChange={(e) => setForm(p => ({ ...p, isbn: e.target.value }))}
            />
            <FormInput
              label="Title" placeholder="Book Title" required
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
            />
            <FormInput
              label="Author" placeholder="Author Name" required
              value={form.author}
              onChange={(e) => setForm(p => ({ ...p, author: e.target.value }))}
            />
            <FormInput
              label="Publisher" placeholder="Publisher Name"
              value={form.publisher}
              onChange={(e) => setForm(p => ({ ...p, publisher: e.target.value }))}
            />
            <div>
              <label style={labelStyle}>Published Year</label>
              <select
                value={form.publishedYear}
                onChange={(e) => setForm(p => ({ ...p, publishedYear: e.target.value }))}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={(e) => (e.target.style.borderColor = '#003f7f')}
                onBlur={(e) => (e.target.style.borderColor = '#e8eaed')}
              >
                <option value="">Select Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <FormInput
              label="Category" type="select" required
              value={form.categoryId}
              onChange={(e) => setForm(p => ({ ...p, categoryId: e.target.value }))}
              options={categories}
            />
            <FormInput
              label="Total Copies" type="number" required
              value={form.totalCopies}
              onChange={(e) => setForm(p => ({ ...p, totalCopies: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <FormInput
              label="Description" type="textarea" placeholder="Book description..."
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <FormInput
              label="Cover Image URL" type="url" placeholder="https://..."
              value={form.coverImageUrl}
              onChange={(e) => setForm(p => ({ ...p, coverImageUrl: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 24px', backgroundColor: '#003f7f', color: 'white',
                border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Saving...' : 'Add Book'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '10px 24px', backgroundColor: 'transparent', color: '#003f7f',
                border: '2px solid #e8eaed', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}