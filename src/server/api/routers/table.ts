import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { faker } from "@faker-js/faker";

export const tableRouter = createTRPCRouter({
  getOrCreateDefaultTable: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const existingTable = await db.table.findFirst({
      where: { base: { userId } },
      include: { 
        columns: true
      },
    });

    if (existingTable) {
      // Fetch the first 100 rows for this table
      const rows = await db.row.findMany({
        where: { tableId: existingTable.id },
        take: 100,
        orderBy: { createdAt: 'asc' }
      });
      
      return {
        ...existingTable,
        rows
      };
    }

    const defaultBase = await db.base.create({
      data: {
        name: "Default Base",
        userId,
      },
    });

    const createdTable = await db.table.create({
      data: {
        name: "Default Table",
        baseId: defaultBase.id,
      },
    });

    const nameColumn = await db.column.create({
      data: { name: "Name", type: "text", tableId: createdTable.id },
    });
    const valueColumn = await db.column.create({
      data: { name: "Value", type: "number", tableId: createdTable.id },
    });

    // Create individual row records instead of storing as JSON
    const seedRows = Array.from({ length: 5 }).map(() => ({
      tableId: createdTable.id,
      data: {
        [nameColumn.id]: faker.person.fullName(),
        [valueColumn.id]: faker.number.int({ min: 1, max: 100 }),
      }
    }));

    await db.row.createMany({
      data: seedRows,
    });

    const updatedTable = await db.table.findUnique({
      where: { id: createdTable.id },
      include: { 
        columns: true
      },
    });

    // Fetch the rows for this table
    const rows = await db.row.findMany({
      where: { tableId: createdTable.id },
      take: 100,
      orderBy: { createdAt: 'asc' }
    });

    return {
      ...updatedTable,
      rows
    };
  }),

  getBases: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    
    return await db.base.findMany({
      where: { userId },
      include: {
        tables: {
          include: { 
            columns: true,
            _count: { select: { rows: true } }
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getTableRows: protectedProcedure
    .input(z.object({
      tableId: z.string(),
      page: z.number().int().min(0).default(0),
      limit: z.number().int().min(1).max(1000).default(100),
    }))
    .query(async ({ ctx, input }) => {
      const { tableId, page, limit } = input;
      const offset = page * limit;

      const [rows, totalCount] = await Promise.all([
        db.row.findMany({
          where: { tableId },
          orderBy: { createdAt: 'asc' },
          skip: offset,
          take: limit,
        }),
        db.row.count({
          where: { tableId },
        }),
      ]);

      return {
        rows: rows.map(row => row.data as Record<string, unknown>),
        totalCount,
        hasMore: offset + limit < totalCount,
      };
    }),

  createBase: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      return await db.base.create({
        data: {
          name: input.name,
          userId,
        },
      });
    }),

  createTable: protectedProcedure
    .input(z.object({ 
      baseId: z.string().min(1),
      name: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const createdTable = await db.table.create({
        data: {
          name: input.name,
          baseId: input.baseId,
        },
      });

      // Create default columns
      const nameColumn = await db.column.create({
        data: { name: "Name", type: "text", tableId: createdTable.id },
      });
      const valueColumn = await db.column.create({
        data: { name: "Value", type: "number", tableId: createdTable.id },
      });

      // Generate some sample data as individual row records
      const seedRows = Array.from({ length: 5 }).map(() => ({
        tableId: createdTable.id,
        data: {
          [nameColumn.id]: faker.person.fullName(),
          [valueColumn.id]: faker.number.int({ min: 1, max: 100 }),
        }
      }));

      await db.row.createMany({
        data: seedRows,
      });

      const updatedTable = await db.table.findUnique({
        where: { id: createdTable.id },
        include: { 
          columns: true
        },
      });

      // Fetch the rows for this table
      const rows = await db.row.findMany({
        where: { tableId: createdTable.id },
        take: 100,
        orderBy: { createdAt: 'asc' }
      });

      return {
        ...updatedTable,
        rows
      };
    }),

  updateCell: protectedProcedure
    .input(
      z.object({
        tableId: z.string().min(1),
        rowIndex: z.number().int().min(0),
        columnId: z.string().min(1),
        value: z.union([z.string(), z.number(), z.null()]),
      }),
    )
    .mutation(async ({ input }) => {
      // Get the specific row by index
      const rows = await db.row.findMany({
        where: { tableId: input.tableId },
        orderBy: { createdAt: 'asc' },
        skip: input.rowIndex,
        take: 1,
      });

      if (rows.length === 0) throw new Error("Row not found");

      const row = rows[0];
      if (!row) throw new Error("Row not found");
      
      const updatedData = {
        ...(row.data as Record<string, unknown>),
        [input.columnId]: input.value,
      };

      await db.row.update({
        where: { id: row.id },
        data: { data: updatedData as any },
      });

      // Return the updated table with limited rows
      const updated = await db.table.findUnique({
        where: { id: input.tableId },
        include: { 
          columns: true
        },
      });

      // Fetch the rows for this table
      const tableRows = await db.row.findMany({
        where: { tableId: input.tableId },
        take: 100,
        orderBy: { createdAt: 'asc' }
      });

      return {
        ...updated,
        rows: tableRows
      };
    }),

  addColumn: protectedProcedure
    .input(
      z.object({
        tableId: z.string().min(1),
        columnName: z.string().min(1),
        columnType: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const table = await db.table.findUnique({ where: { id: input.tableId } });
      if (!table) throw new Error("Table not found");

      const createdColumn = await db.column.create({
        data: {
          name: input.columnName,
          type: input.columnType,
          tableId: input.tableId,
        },
      });

      // Update all existing rows to include the new column
      const rows = await db.row.findMany({
        where: { tableId: input.tableId },
      });

      for (const row of rows) {
        const updatedData = {
          ...(row.data as Record<string, unknown>),
          [createdColumn.id]: null,
        };
        await db.row.update({
          where: { id: row.id },
          data: { data: updatedData as any },
        });
      }

      const updated = await db.table.findUnique({
        where: { id: input.tableId },
        include: { 
          columns: true
        },
      });

      // Fetch the rows for this table
      const tableRows = await db.row.findMany({
        where: { tableId: input.tableId },
        take: 100,
        orderBy: { createdAt: 'asc' }
      });

      return { 
        table: {
          ...updated,
          rows: tableRows
        }, 
        column: createdColumn 
      };
    }),

  addRow: protectedProcedure
    .input(
      z.object({
        tableId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const table = await db.table.findUnique({
        where: { id: input.tableId },
        include: { columns: true },
      });
      if (!table) throw new Error("Table not found");

      const emptyRow: Record<string, unknown> = {};
      for (const c of table.columns) emptyRow[c.id] = null;

      await db.row.create({
        data: {
          tableId: input.tableId,
          data: emptyRow as any,
        },
      });

      const updated = await db.table.findUnique({
        where: { id: input.tableId },
        include: { 
          columns: true
        },
      });

      // Fetch the rows for this table
      const rows = await db.row.findMany({
        where: { tableId: input.tableId },
        take: 100,
        orderBy: { createdAt: 'asc' }
      });

      return {
        ...updated,
        rows
      };
    }),

  addBulkRows: protectedProcedure
    .input(
      z.object({
        tableId: z.string().min(1),
        count: z.number().int().min(1).max(100000),
      }),
    )
    .mutation(async ({ input }) => {
      const table = await db.table.findUnique({
        where: { id: input.tableId },
        include: { columns: true },
      });
      if (!table) throw new Error("Table not found");

      // Generate bulk rows using faker
      const bulkRows = Array.from({ length: input.count }).map(() => {
        const row: Record<string, unknown> = {};
        for (const col of table.columns) {
          if (col.type === "number") {
            row[col.id] = faker.number.int({ min: 1, max: 1000 });
          } else {
            row[col.id] = faker.person.fullName();
          }
        }
        return {
          tableId: input.tableId,
          data: row,
        };
      });

      // Use createMany for better performance
      await db.row.createMany({
        data: bulkRows.map(row => ({ ...row, data: row.data as any })),
      });

      const updated = await db.table.findUnique({
        where: { id: input.tableId },
        include: { 
          columns: true
        },
      });

      // Fetch the rows for this table
      const rows = await db.row.findMany({
        where: { tableId: input.tableId },
        take: 100,
        orderBy: { createdAt: 'asc' }
      });

      return {
        ...updated,
        rows
      };
    }),
});
