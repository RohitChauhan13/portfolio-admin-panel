import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import './DataTable.css';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const DataTable = ({ 
  columns, 
  data, 
  total, 
  page, 
  totalPages, 
  onPageChange, 
  onSearch, 
  onEdit, 
  onDelete,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="datatable-wrapper card">
      {onSearch && (
        <div className="datatable-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input search-input"
            />
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="datatable">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} style={{ width: col.width }}>{col.header}</th>
              ))}
              {(onEdit || onDelete) && <th className="actions-col">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="empty-state">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="empty-state">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="actions-cell">
                      {onEdit && (
                        <button className="btn-icon" onClick={() => onEdit(row)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button className="btn-icon text-danger" onClick={() => onDelete(row)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="datatable-pagination">
        <div className="pagination-info">
          Showing {data.length} of {total} records
        </div>
        <div className="pagination-controls">
          <button 
            className="btn btn-outline btn-icon" 
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="page-current">Page {page} of {totalPages || 1}</span>
          <button 
            className="btn btn-outline btn-icon"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
