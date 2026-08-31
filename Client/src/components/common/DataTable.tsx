

import type { ReactNode } from "react";

export interface TableColumn<T> {
  header: string;
  render: (item: T) => ReactNode;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  getRowKey: (item: T) => string;
}

const alignClass = (a?: "left" | "right" | "center") =>
  a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

const DataTable = <T,>({
  columns,
  data,
  emptyMessage = "No data found",
  getRowKey,
}: DataTableProps<T>) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr>
              {columns.map((column, colIndex) => (
                <th
                  key={column.header || colIndex}
                  className={`px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 ${alignClass(column.align)}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="border-t border-gray-100 px-5 py-10 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={getRowKey(item)} className="border-t border-gray-100 transition hover:bg-gray-50/60">
                  {columns.map((column) => (
                    <td key={column.header} className={`px-5 py-3 text-gray-700 ${alignClass(column.align)}`}>
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
