import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-4">Sidebar</h2>
        <nav>
          <ul>
            <li className="mb-2"><a href="#" className="hover:text-gray-300">Link 1</a></li>
            <li className="mb-2"><a href="#" className="hover:text-gray-300">Link 2</a></li>
          </ul>
        </nav>
      </aside>

      <div className="flex flex-col flex-1">
        {/* Header Placeholder */}
        <header className="bg-gray-700 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard Header</h1>
          <div>User Info</div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
