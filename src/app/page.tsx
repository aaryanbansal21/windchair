"use client";

import { useState } from "react";
import { AuthShowcase } from "~/app/_components/auth-showcase";
import { TopNavigation } from "~/app/_components/top-navigation";
import { TableImportBar } from "~/app/_components/table-import-bar";
import { SecondaryToolbar } from "~/app/_components/secondary-toolbar";
import { AirtableTable } from "~/app/_components/airtable-table";
import { LeftToolbar } from "~/app/_components/left-toolbar";
import { api } from "~/trpc/react";

export default function HomePage() {
  const { data: session } = api.auth.getSession.useQuery();
  const { data: tableData, isLoading } = api.table.getOrCreateDefaultTable.useQuery(undefined, {
    enabled: !!session, // Only run this query when user is authenticated
  });
  const [currentView, setCurrentView] = useState("Grid view");

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            windchair
          </h1>

          <AuthShowcase />
        </div>
      </main>
    );
  }

  if (isLoading || !tableData) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Left Toolbar */}
      <LeftToolbar />

      {/* Top Navigation */}
      <TopNavigation />

      {/* Table Import Bar */}
      <TableImportBar />

      {/* Secondary Toolbar */}
      <SecondaryToolbar
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Table */}
      <div className="px-6 py-4 ml-16">
        <AirtableTable initialData={tableData as any} />
      </div>
    </main>
  );
}
