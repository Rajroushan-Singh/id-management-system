import React from 'react';
import { TableRowSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';

export function DataTable({
  columns,
  data,
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no items matching this criteria.',
  keyExtractor = (item, index) => item.id || index,
  className = '',
}) {
  return (
    <div className={`w-full overflow-hidden rounded-card border border-cream-400 bg-white shadow-card ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-cream-400/80 bg-cream-50/70 text-xs font-semibold uppercase tracking-wider text-espresso-600">
              {columns.map((col, index) => (
                <th
                  key={col.key || index}
                  scope="col"
                  className={`px-5 py-3.5 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-400/60 bg-white">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRowSkeleton key={i} columns={columns.length} />
              ))
            ) : data && data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={keyExtractor(item, index)}
                  className="hover:bg-cream-50/50 transition-colors duration-100"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={`px-5 py-3.5 text-espresso-800 ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(item, index) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
