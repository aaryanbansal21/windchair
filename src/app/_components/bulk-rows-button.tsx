"use client";

import { api } from "~/trpc/react";

type BulkRowsButtonProps = {
  tableId: string;
};

export function BulkRowsButton({ tableId }: BulkRowsButtonProps) {
  const utils = api.useUtils();
  const addBulkRows = api.table.addBulkRows.useMutation({
    onSuccess: () => {
      void utils.table.getOrCreateDefaultTable.invalidate();
    },
  });

  const handleAddBulkRows = async () => {
    try {
      await addBulkRows.mutateAsync({ tableId, count: 100000 });
    } catch (error) {
      console.error("Failed to add bulk rows:", error);
    }
  };

  return (
    <button 
      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleAddBulkRows}
      disabled={addBulkRows.isPending}
    >
      {addBulkRows.isPending ? "Adding..." : "+ Add 100k rows"}
    </button>
  );
}
