import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 transform bg-white transition-transform md:relative md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:block`}
        >
          <div className="mt-16 md:mt-0">
            <AdminSidebar />
          </div>
        </div>
        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
} 