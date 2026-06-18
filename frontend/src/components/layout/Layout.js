import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Ambient orbs */}
      <div className="orb orb-blue   w-96 h-96 -top-20 -left-20   opacity-40 fixed" style={{ animationDelay:'0s' }} />
      <div className="orb orb-purple w-80 h-80  top-1/2 -right-24  opacity-30 fixed" style={{ animationDelay:'2s' }} />
      <div className="orb orb-green  w-72 h-72  bottom-0 left-1/3  opacity-25 fixed" style={{ animationDelay:'4s' }} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(v => !v)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
