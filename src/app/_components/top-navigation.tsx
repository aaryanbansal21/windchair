"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function TopNavigation() {
  const [isBaseDropdownOpen, setIsBaseDropdownOpen] = useState(false);
  const { data: bases } = api.table.getBases.useQuery();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 ml-16">
      <div className="flex items-center justify-between">
        {/* Left Side - Base Selection */}
        <div className="flex items-center space-x-4">
          {/* Base Selection */}
          <div className="relative">
            <button
              onClick={() => setIsBaseDropdownOpen(!isBaseDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">W</span>
              </div>
              <span className="font-medium">Untitled Base</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isBaseDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-gray-500">Bases</div>
                  {bases?.map((base) => (
                    <button
                      key={base.id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      {base.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center - Tabs */}
        <div className="flex items-center space-x-1">
          <button className="px-4 py-2 text-sm font-medium text-purple-600 border-b-2 border-purple-600">
            Data
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            Automations
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            Interfaces
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            Forms
          </button>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700">
            Launch
          </button>
          
          <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700">
            Share
          </button>
          
          
          <div className="relative">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}