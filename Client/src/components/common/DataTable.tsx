import type { ReactNode } from "react";

export interface TableColumn<T> {
  header: string;
  render: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  getRowKey: (item: T) => string;
}

const DataTable = <T,>({
  columns,
  data,
  emptyMessage = "No data found",
  getRowKey,
}: DataTableProps<T>) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px]">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-600"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={getRowKey(item)}
                  className="transition hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <td
                      key={column.header}
                      className="px-6 py-4 text-sm text-gray-700"
                    >
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