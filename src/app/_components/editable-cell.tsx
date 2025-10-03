"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "~/trpc/react";

type EditableCellProps = {
  tableId: string;
  rowIndex: number;
  columnId: string;
  value: string | number | null | undefined;
  inputType?: "text" | "number";
  onFocusMove?: (opts: { row: number; col: number }) => void;
};

export function EditableCell({ tableId, rowIndex, columnId, value, inputType = "text", onFocusMove }: EditableCellProps) {
  const [localValue, setLocalValue] = useState<string | number | "">(value ?? "");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  const utils = api.useUtils();
  const updateCell = api.table.updateCell.useMutation({
    onMutate: async (vars) => {
      await utils.table.getOrCreateDefaultTable.cancel();
      const prev = utils.table.getOrCreateDefaultTable.getData();
      if (prev) {
        const next = { ...prev, rows: [...(prev.rows as any[])] } as any;
        const row = { ...(next.rows[vars.rowIndex] ?? {}) } as Record<string, unknown>;
        row[vars.columnId] = vars.value as unknown;
        next.rows[vars.rowIndex] = row;
        utils.table.getOrCreateDefaultTable.setData(undefined, next);
      }
      return { prev } as const;
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) utils.table.getOrCreateDefaultTable.setData(undefined, ctx.prev);
    },
    onSettled: () => {
      void utils.table.getOrCreateDefaultTable.invalidate();
    },
  });

  const handleBlur = () => {
    const parsed = inputType === "number" && localValue !== "" ? Number(localValue) : (localValue as any);
    updateCell.mutate({ tableId, rowIndex, columnId, value: localValue === "" ? null : parsed });
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!onFocusMove) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      onFocusMove({ row: rowIndex + 1, col: 0 });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      onFocusMove({ row: Math.max(0, rowIndex - 1), col: 0 });
    } else if (e.key === "ArrowRight" || e.key === "Tab") {
      e.preventDefault();
      onFocusMove({ row: rowIndex, col: 1 });
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onFocusMove({ row: rowIndex, col: -1 });
    }
  };

  return (
    <input
      ref={inputRef}
      className="w-full bg-transparent text-sm outline-none border-none focus:ring-0 focus:outline-none"
      value={localValue as any}
      onChange={(e) => setLocalValue(inputType === "number" ? e.target.value : e.target.value)}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
      inputMode={inputType === "number" ? "numeric" : undefined}
      type={inputType === "number" ? "text" : "text"}
      placeholder={localValue === "" ? "Click to edit" : undefined}
    />
  );
}
