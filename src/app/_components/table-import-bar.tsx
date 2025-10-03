"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function TableImportBar() {
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);

  const { data: bases } = api.table.getBases.useQuery();

  return (
    <div className="border-b border-gray-200 py-0.5 ml-16" style={{ backgroundColor: '#f5e5fc' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
        {/* Table Selection */}
        <div className="relative">
          <button
            onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-1 bg-white text-purple-500 hover:bg-gray-100 rounded-t-md"
          >
            <span className="font-medium">Table 1</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isTableDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="p-2">
                <div className="px-3 py-2 text-sm text-gray-500">Tables</div>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded">
                  Table 1
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add or Import Button */}
        <div className="relative ml-4">
          <button
            onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-1 text-purple-500 hover:bg-purple-100 rounded-md"
          >
            <span className="text-lg">+</span>
            <span>Add or import</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isAddDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="p-2">
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded">
                  Create new table
                </button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded">
                  Import from CSV
                </button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded">
                  Import from Excel
                </button>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Right Side - Tools Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-1 text-purple-500 hover:bg-purple-100 rounded-md"
          >
            <span>Tools</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isToolsDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="p-2">
                {/* Extensions */}
                <button className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <div>
                    <p className="font-medium">Extensions</p>
                    <p className="text-xs text-gray-500">Extend the functionality of your base</p>
                  </div>
                </button>

                <div className="border-t border-gray-200 my-2"></div>

                {/* Manage fields */}
                <button className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                  <div className="w-4 h-4 flex items-center justify-center text-gray-500 font-bold text-xs">A</div>
                  <div>
                    <p className="font-medium">Manage fields</p>
                    <p className="text-xs text-gray-500">Edit fields and inspect dependencies</p>
                  </div>
                </button>

                {/* Record templates */}
                <button className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <div>
                    <p className="font-medium">Record templates</p>
                    <p className="text-xs text-gray-500">Create records from a template</p>
                  </div>
                </button>

                {/* Date dependencies */}
                <button className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2m0-4h.01M8 11h.01M12 11h.01M16 11h.01M16 15h.01" />
                  </svg>
                  <div>
                    <p className="font-medium">Date dependencies</p>
                    <p className="text-xs text-gray-500">Configure date shifting between dependent records</p>
                  </div>
                </button>

                <div className="border-t border-gray-200 my-2"></div>

                {/* Insights */}
                <button className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  </svg>
                  <div>
                    <p className="font-medium">Insights</p>
                    <p className="text-xs text-gray-500">Understand and improve base health</p>
                  </div>
                  <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Business
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
