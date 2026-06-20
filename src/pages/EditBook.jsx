import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBookById, updateBook } from '../api/booksApi';
import { getCategories } from '../api/categoriesApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FormInput = ({ label, type = 'text', placeholder, required, value, onChange, options = [] }) => (
  <div>
    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#003f7f', marginBottom: '8px' }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: '14px',
          border: '1px solid #e8eaed',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          transition: 'all 0.3s',
          boxSizing: 'border-box',
          outline: 'none',
          fontFamily: 'inherit',
          resize: 'vertical',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#003f7f')}
        onBlur={(e) => (e.target.style.borderColor = '#e8eaed')}
      />
    ) : type === 'select' ? (
      <select
        value={value || ''}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: '14px',
          border: '1px solid #e8eaed',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          transition: 'all 0.3s',
          boxSizing: 'border-box',
          outline: 'none',
          cursor: 'pointer',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#003f7f')}
        onBlur={(e) => (e.target.style.borderColor = '#e8eaed')}
      >
        <option value="">Select {label}</option>
        {options.map(c => (
          <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
        ))}
      </select>
    ) : type === 'checkbox' ? (
      <input
        type="checkbox"
        checked={value || false}
        onChange={onChange}
        style={{
          width: '18px',
          height: '18px',
          cursor: 'pointer',
          accentColor: '#003f7f',
        }}
      />
    ) : (
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: '14px',
          border: '1px solid #e8eaed',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          transition: 'all 0.3s',
          boxSizing: 'border-box',
          outline: 'none',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#003f7f')}
        onBlur={(e) => (e.target.style.borderColor = '#e8eaed')}
      />
    )}
  </div>
);

export default function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    Promise.all([getBookById(id), getCategories()]).then(([bookRes, catRes]) => {
      const b = bookRes.data.data;
      setForm({
        isbn: b.isbn, title: b.title, author: b.author,
        publisher: b.publisher || '', publishedYear: b.publishedYear || '',
        categoryId: b.categoryId, description: b.description || '',
        totalCopies: b.totalCopies, coverImageUrl: b.coverImageUrl || '',
        isActive: b.isActive,
      });
      setCategories(catRes.data.data);
    }).catch(() => toast.error('Failed to load book.')).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateBook(id, {
        ...form,
        categoryId: parseInt(form.categoryId),
        totalCopies: parseInt(form.totalCopies),
        publishedYear: form.publishedYear ? parseInt(form.publishedYear) : null,
      });
      toast.success('Book updated!');
      navigate('/books');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <LoadingSpinner />;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: '#003f7f',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 63, 127, 0.1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          ← Back
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#003f7f', margin: 0 }}>
            Edit Book
          </h1>
        </div>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 63, 127, 0.12)',
        padding: '32px',
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <FormInput 
              label="ISBN" 
              value={form.isbn}
              onChange={(e) => setForm(p => ({ ...p, isbn: e.target.value }))}
              required
            />
            <FormInput 
              label="Title" 
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              required
            />
            <FormInput 
              label="Author" 
              value={form.author}
              onChange={(e) => setForm(p => ({ ...p, author: e.target.value }))}
              required
            />
            <FormInput 
              label="Publisher" 
              value={form.publisher}
              onChange={(e) => setForm(p => ({ ...p, publisher: e.target.value }))}
            />
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#003f7f', marginBottom: '8px' }}>
                Published Year
              </label>
              <select
                value={form.publishedYear}
                onChange={(e) => setForm(p => ({ ...p, publishedYear: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #e8eaed',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#1a1a1a',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box',
                  outline: 'none',
                  cursor: 'pointer',
                }}
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
              label="Category" 
              type="select" 
              value={form.categoryId}
              onChange={(e) => setForm(p => ({ ...p, categoryId: e.target.value }))}
              options={categories}
              required
            />
            <FormInput 
              label="Total Copies" 
              type="number" 
              value={form.totalCopies}
              onChange={(e) => setForm(p => ({ ...p, totalCopies: e.target.value }))}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <FormInput 
              label="Description" 
              type="textarea" 
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <FormInput 
              label="Cover Image URL" 
              type="url" 
              value={form.coverImageUrl}
              onChange={(e) => setForm(p => ({ ...p, coverImageUrl: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FormInput 
              type="checkbox" 
              value={form.isActive}
              onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))}
            />
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#003f7f', cursor: 'pointer' }}>
              Mark as Active
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 24px',
                backgroundColor: '#003f7f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                transition: 'all 0.3s',
                boxShadow: '0 2px 8px rgba(0, 63, 127, 0.25)',
              }}
              onMouseEnter={(e) => !saving && (e.target.style.backgroundColor = '#0052a3')}
              onMouseLeave={(e) => !saving && (e.target.style.backgroundColor = '#003f7f')}
            >
              {saving ? '🔄 Saving...' : '✓ Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '10px 24px',
                backgroundColor: 'transparent',
                color: '#003f7f',
                border: '2px solid #e8eaed',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#003f7f';
                e.target.style.backgroundColor = 'rgba(0, 63, 127, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e8eaed';
                e.target.style.backgroundColor = 'transparent';
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