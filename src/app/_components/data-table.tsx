"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { EditableCell } from "~/app/_components/editable-cell";

type ColumnMeta = { id: string; name: string; type: string };

type TableData = {
  id: string;
  name: string;
  columns: ColumnMeta[];
  rows: Record<string, unknown>[];
};

type DataTableProps = {
  initialData: TableData;
};

export function DataTable({ initialData }: DataTableProps) {
  const { data: table } = api.table.getOrCreateDefaultTable.useQuery(undefined, {
    initialData,
    refetchOnWindowFocus: false,
  });

  const addColumn = api.table.addColumn.useMutation();
  const addRow = api.table.addRow.useMutation();
  const utils = api.useUtils();

  const [focusPos, setFocusPos] = useState<{ r: number; c: number } | null>(null);

  if (!table) return <div>Loading...</div>;

  return (
    <div className="w-full bg-white">
      {/* Header row */}
      <div className="sticky top-0 z-10 flex border-b border-gray-300">
        {/* Row number column header - Light purple/gray background */}
        <div className="w-12 flex items-center justify-center border-r border-gray-300 bg-gray-200">
          <div className="w-4 h-4 bg-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">
            1
          </div>
        </div>
        
        {/* Data columns - Light gray background */}
        {table.columns.map((col) => (
          <div key={col.id} className="min-w-[200px] border-r border-gray-300 bg-gray-100">
            <div className="flex items-center px-3 py-2 h-10">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-500 rounded text-white text-xs flex items-center justify-center font-bold">
                  A
                </div>
                <span className="text-sm font-semibold text-gray-800">{col.name}</span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add column button */}
        <div className="w-12 flex items-center justify-center border-r border-gray-300 bg-gray-100">
          <button
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
            onClick={async () => {
              const name = `Field ${table.columns.length + 1}`;
              await addColumn.mutateAsync({ tableId: table.id, columnName: name, columnType: "text" });
              await utils.table.getOrCreateDefaultTable.invalidate();
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Body rows */}
      <div>
        {table.rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex border-b border-gray-200 hover:bg-blue-50">
            {/* Row number - Slightly darker background */}
            <div className="w-12 flex items-center justify-center border-r border-gray-200 bg-gray-50 text-sm text-gray-500">
              {rowIndex + 1}
            </div>
            
            {/* Data cells - White background */}
            {table.columns.map((col) => (
              <div key={col.id} className="min-w-[200px] border-r border-gray-200 bg-white">
                <div className="px-3 py-2 h-10 flex items-center">
                  <EditableCell
                    tableId={table.id}
                    rowIndex={rowIndex}
                    columnId={col.id}
                    value={row[col.id] as any}
                    inputType={col.type === "number" ? "number" : "text"}
                    onFocusMove={({ row: r, col: c }) => {
                      setFocusPos({ r, c: table.columns.findIndex(cc => cc.id === col.id) + c });
                    }}
                  />
                </div>
              </div>
            ))}
            
            {/* Empty cell for add column */}
            <div className="w-12 border-r border-gray-200 bg-white"></div>
          </div>
        ))}

        {/* Add row button */}
        <div className="flex border-b border-gray-200">
          <div className="w-12 flex items-center justify-center border-r border-gray-200 bg-gray-50">
            <button
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
              onClick={async () => {
                await addRow.mutateAsync({ tableId: table.id });
                await utils.table.getOrCreateDefaultTable.invalidate();
              }}
            >
              +
            </button>
          </div>
          <div className="flex-1 flex items-center px-3 py-2 h-10 text-sm text-gray-600 hover:bg-gray-50 bg-white">
            <span>Add row</span>
          </div>
          <div className="w-12 border-r border-gray-200 bg-white"></div>
        </div>
      </div>
    </div>
  );
}
