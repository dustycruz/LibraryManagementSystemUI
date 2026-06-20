export default function BookFilter({ categories, onFilterChange, currentFilters }) {
    return (
      <div className="d-flex gap-2 flex-wrap">
        <select
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
          value={currentFilters.categoryId || ''}
          onChange={(e) => onFilterChange({ ...currentFilters, categoryId: e.target.value || null })}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
          ))}
        </select>
        <select
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
          value={currentFilters.isActive === undefined ? 'true' : String(currentFilters.isActive)}
          onChange={(e) => onFilterChange({ ...currentFilters, isActive: e.target.value === 'true' })}
        >
          <option value="true">Active Books</option>
          <option value="false">Inactive Books</option>
        </select>
      </div>
    );
  }