"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { api } from "~/trpc/react";
import { EditableCell } from "~/app/_components/editable-cell";
import { BulkRowsButton } from "~/app/_components/bulk-rows-button";
import { ColumnDropdown } from "~/app/_components/column-dropdown";

type ColumnMeta = { id: string; name: string; type: string };

type TableData = {
  id?: string;
  name?: string;
  columns?: ColumnMeta[];
  rows?: Array<{
    id: string;
    data: Record<string, unknown>;
  }>;
};

type AirtableTableProps = {
  initialData: TableData;
};

const columnHelper = createColumnHelper<Record<string, unknown>>();

const getFieldIcon = (type: string) => {
  switch (type) {
    case "text":
      return (
        <div className="w-4 h-4 bg-gray-500 rounded text-white text-xs flex items-center justify-center font-bold">
          A
        </div>
      );
    case "number":
      return (
        <div className="w-4 h-4 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
          #
        </div>
      );
    default:
      return (
        <div className="w-4 h-4 bg-gray-500 rounded text-white text-xs flex items-center justify-center font-bold">
          ?
        </div>
      );
  }
};

export function AirtableTable({ initialData }: AirtableTableProps) {
  const { data: table } = api.table.getOrCreateDefaultTable.useQuery(undefined, {
    initialData,
    refetchOnWindowFocus: false,
  });

  const addColumn = api.table.addColumn.useMutation();
  const addRow = api.table.addRow.useMutation();
  const utils = api.useUtils();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(() => {
    if (!table?.columns) return [];

    const dataColumns = table.columns.map((col) =>
      columnHelper.accessor(col.id, {
        id: col.id,
        header: ({ column }) => (
          <div className="flex items-center justify-between px-3 py-2 h-10">
            <div className="flex items-center space-x-2 flex-1">
              {getFieldIcon(col.type)}
              <span className="text-sm font-semibold text-gray-800">
                {col.name}
              </span>
            </div>
            <ColumnDropdown
              columnId={col.id}
              columnName={col.name}
              columnType={col.type}
              onEditField={() => console.log("Edit field", col.id)}
              onDuplicateField={() => console.log("Duplicate field", col.id)}
              onInsertLeft={() => console.log("Insert left", col.id)}
              onInsertRight={() => console.log("Insert right", col.id)}
              onChangePrimaryField={() => console.log("Change primary field", col.id)}
              onCopyFieldURL={() => console.log("Copy field URL", col.id)}
              onEditFieldDescription={() => console.log("Edit field description", col.id)}
              onEditFieldPermissions={() => console.log("Edit field permissions", col.id)}
              onSortAZ={() => console.log("Sort A→Z", col.id)}
              onSortZA={() => console.log("Sort Z→A", col.id)}
              onFilterByField={() => console.log("Filter by field", col.id)}
              onGroupByField={() => console.log("Group by field", col.id)}
              onShowDependencies={() => console.log("Show dependencies", col.id)}
              onHideField={() => console.log("Hide field", col.id)}
              onDeleteField={() => console.log("Delete field", col.id)}
            />
          </div>
        ),
        cell: ({ getValue, row, column }) => (
          <EditableCell
            tableId={table.id}
            rowIndex={row.index}
            columnId={col.id}
            value={getValue() as any}
            inputType={col.type === "number" ? "number" : "text"}
          />
        ),
        enableSorting: true,
        enableColumnFilter: true,
      })
    );

    // Add the "Add Column" button as the last column
    dataColumns.push(
      columnHelper.display({
        id: "add-column",
        header: () => (
          <button
            className="w-full h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
            onClick={async () => {
              const name = `Field ${(table?.columns?.length ?? 0) + 1}`;
              await addColumn.mutateAsync({ 
                tableId: table.id, 
                columnName: name, 
                columnType: "text" 
              });
              await utils.table.getOrCreateDefaultTable.invalidate();
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        ),
        cell: () => null,
        enableSorting: false,
        enableColumnFilter: false,
      })
    );

    return dataColumns;
  }, [table, addColumn, utils]);

  const data = useMemo(() => {
    if (!table?.rows || !Array.isArray(table.rows)) return [];
    return table.rows.map(row => row.data);
  }, [table?.rows]);

  const tableInstance = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!table || !table.id) return <div>Loading...</div>;

  return (
    <div className="w-full bg-white">
      {/* Table Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex">
          {/* Row number column header */}
          <div className="w-12 flex items-center justify-center border-r border-gray-200 bg-gray-50">
            <div className="w-6 h-6 bg-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">
              1
            </div>
          </div>
          
          {/* Data columns */}
          {tableInstance.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="min-w-[200px] border-r border-gray-200 bg-white"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {tableInstance.getRowModel().rows.map((row, rowIndex) => (
          <div key={row.id} className="flex hover:bg-blue-50">
            {/* Row number */}
            <div className="w-12 flex items-center justify-center border-r border-gray-200 bg-gray-50 text-sm text-gray-500">
              {rowIndex + 1}
            </div>
            
            {/* Data cells */}
            {row.getVisibleCells().map((cell) => (
              <div
                key={cell.id}
                className="min-w-[200px] border-r border-gray-200 bg-white"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        ))}

        {/* Add Row Button */}
        <div className="flex border-t border-gray-200">
          <div className="w-12 flex items-center justify-center border-r border-gray-200 bg-gray-50">
            <button
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
              onClick={async () => {
                await addRow.mutateAsync({ tableId: table.id });
                await utils.table.getOrCreateDefaultTable.invalidate();
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex items-center px-3 py-2 h-10 text-sm text-gray-600 hover:bg-gray-50 bg-white">
            <span>Add row</span>
          </div>
          <div className="w-12 border-r border-gray-200 bg-white"></div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {table.rows?.length ?? 0} records
            </span>
            <BulkRowsButton tableId={table.id} />
          </div>
        </div>
      </div>
    </div>
  );
}


