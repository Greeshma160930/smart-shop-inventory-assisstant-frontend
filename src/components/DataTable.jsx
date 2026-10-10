import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from './Loader';
import EmptyState from './EmptyState';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your query.',
  pagination,
}) => {
  if (loading) {
    return <Loader message="Fetching table records..." />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  style={{
                    textAlign: col.align || 'left',
                    width: col.width || 'auto',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={row.id || rowIdx}>
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination-container">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing page {pagination.page + 1} of {pagination.totalPages} ({pagination.totalElements} total)
          </div>
          <div className="pagination-pages">
            <button
              className="pagination-btn"
              disabled={pagination.page === 0}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum = i;
              if (pagination.totalPages > 5) {
                if (pagination.page > 2) {
                  pageNum = Math.min(pagination.page - 2 + i, pagination.totalPages - 1);
                }
              }
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${pagination.page === pageNum ? 'active' : ''}`}
                  onClick={() => pagination.onPageChange(pageNum)}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            <button
              className="pagination-btn"
              disabled={pagination.page >= pagination.totalPages - 1}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
