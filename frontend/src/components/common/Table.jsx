import React from 'react';

export const Table = ({
  columns = [],
  data = [],
  keyField = '_id',
  emptyMessage = 'No records found',
  className = '',
  onRowClick
}) => {
  return (
    <div className={`ks-table-wrap ${className}`}>
      <table className="ks-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={col.key || idx} style={col.headerStyle || {}}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--ks-text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row[keyField] || row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                style={onRowClick ? { cursor: 'pointer' } : {}}
              >
                {columns.map((col, colIdx) => (
                  <td key={col.key || colIdx} style={col.style || {}}>
                    {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
