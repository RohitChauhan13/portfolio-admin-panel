import { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit2, Trash2, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { TableSkeletonRows } from './Loader';
import './DataTable.css';

// ─── Debounce ────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Single Filter Dropdown ───────────────────────────────────
function FilterDropdown({ filter }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const activeOption = filter.options.find((o) => o.value === filter.value);
  const isActive = !!filter.value;

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flt-root" ref={ref}>
      <button
        type="button"
        className={`flt-trigger ${isActive ? 'flt-trigger--on' : ''}`}
        onClick={() => setIsOpen((p) => !p)}
      >
        <span className="flt-label">{filter.label}</span>
        {isActive ? (
          <>
            <span className="flt-sep">·</span>
            <span className="flt-val">{activeOption?.label}</span>
            <span
              className="flt-x"
              role="button"
              tabIndex={0}
              aria-label="Clear"
              onClick={(e) => { e.stopPropagation(); filter.onChange(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); filter.onChange(''); } }}
            >
              <X size={10} strokeWidth={2.5} />
            </span>
          </>
        ) : (
          <ChevronDown
            size={13}
            strokeWidth={2}
            className={`flt-chevron ${isOpen ? 'flt-chevron--open' : ''}`}
          />
        )}
      </button>

      {isOpen && (
        <div className="flt-menu" role="listbox">
          <button
            type="button"
            role="option"
            aria-selected={!filter.value}
            className={`flt-opt ${!filter.value ? 'flt-opt--on' : ''}`}
            onClick={() => { filter.onChange(''); setIsOpen(false); }}
          >
            All
          </button>
          {filter.options.map((opt) => (
            <button
              type="button"
              role="option"
              aria-selected={filter.value === opt.value}
              key={opt.value}
              className={`flt-opt ${filter.value === opt.value ? 'flt-opt--on' : ''}`}
              onClick={() => { filter.onChange(opt.value); setIsOpen(false); }}
            >
              {filter.value === opt.value && <span className="flt-tick">✓</span>}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DataTable ────────────────────────────────────────────────
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
  isLoading,
  filters,
  customFilterComponent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (onSearch) onSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const hasToolbar = onSearch || (filters && filters.length > 0) || customFilterComponent;
  const activeCount = filters ? filters.filter((f) => f.value).length : 0;

  return (
    <div className="datatable-wrapper card">
      {/* ── Toolbar ── */}
      {hasToolbar && (
        <div className="datatable-toolbar">
          {onSearch && (
            <div className="search-box">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input search-input"
              />
              {searchTerm && (
                <button type="button" className="search-clear" onClick={() => setSearchTerm('')} title="Clear">
                  <X size={13} strokeWidth={2.5} />
                </button>
              )}
            </div>
          )}

          {filters && filters.length > 0 && (
            <div className="flt-bar">
              <span className="flt-bar__icon"><SlidersHorizontal size={14} /></span>
              {filters.map((f, i) => <FilterDropdown key={i} filter={f} />)}
              {activeCount > 0 && (
                <button
                  type="button"
                  className="flt-clear-all"
                  onClick={() => filters.forEach((f) => f.onChange(''))}
                >
                  Reset
                </button>
              )}
            </div>
          )}

          {customFilterComponent && (
            <div className="custom-flt-bar">
              {customFilterComponent}
            </div>
          )}
        </div>
      )}

      {/* ── Table ── */}
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
              <TableSkeletonRows cols={columns.length + (onEdit || onDelete ? 1 : 0)} rows={5} />
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="empty-state">No records found.</td></tr>
            ) : (
              data.map((row, ri) => (
                <tr key={row.id ?? ri}>
                  {columns.map((col, ci) => (
                    <td key={ci}>{col.cell ? col.cell(row) : row[col.accessor]}</td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="actions-cell">
                      {onEdit && <button className="btn-icon" onClick={() => onEdit(row)} title="Edit"><Edit2 size={15} /></button>}
                      {onDelete && <button className="btn-icon text-danger" onClick={() => onDelete(row)} title="Delete"><Trash2 size={15} /></button>}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="datatable-pagination">
        <div className="pagination-info">Showing {data.length} of {total} records</div>
        <div className="pagination-controls">
          <button className="btn btn-outline btn-icon" disabled={page <= 1 || isLoading} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft size={17} />
          </button>
          <span className="page-current">Page {page} of {totalPages || 1}</span>
          <button className="btn btn-outline btn-icon" disabled={page >= totalPages || isLoading} onClick={() => onPageChange(page + 1)}>
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
