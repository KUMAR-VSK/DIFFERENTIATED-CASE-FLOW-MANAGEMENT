import React, { useMemo, useState } from 'react';
import '../styles/datatable.css';

// Simple reusable data table with sorting and pagination
// columns: [{ key, label, sortable: boolean, render: (row)=>JSX }]
// data: array of objects
// pages: { page, pageSize, total }
// onPageChange(page) and onSort({ key, dir }) are optional
const DataTable = ({ columns, data, page, pageSize, total, onPageChange, onSort }) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const header = useMemo(() => {
    return columns.map((col) => ({ ...col }));
  }, [columns]);

  const handleSort = (col) => {
    if (!col.sortable) return;
    let nextDir = 'asc';
    if (sortKey === col.key) {
      nextDir = sortDir === 'asc' ? 'desc' : 'asc';
    }
    setSortKey(col.key);
    setSortDir(nextDir);
    if (onSort) onSort({ key: col.key, dir: nextDir });
  };

  const totalPages = Math.max(1, Math.ceil(total / (pageSize || 1)));
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="datatable-container" aria-label="Data table">
      <table className="data-table" role="table">
        <thead>
          <tr>
            {header.map((col) => (
              <th key={col.key} onClick={() => handleSort(col)} className={col.sortable ? 'sortable' : ''}>
                {col.label}
                {col.sortable && sortKey === col.key ? (
                  <span style={{ marginLeft: 6 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={row.id ?? idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '1rem' }}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="datatable-pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <div>
          Page {page + 1} of {totalPages}
        </div>
        <div>
          <button onClick={() => onPageChange?.(Math.max(0, page - 1))} disabled={!canPrev} className="btn">
            Previous
          </button>
          <button onClick={() => onPageChange?.(Math.min(totalPages - 1, page + 1))} disabled={!canNext} className="btn" style={{ marginLeft: 8 }}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
