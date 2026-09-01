import React from 'react';
import Header from './Header';

export const AppShell = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--ks-bg-ivory)' }}>
      {/* Main Header Shell */}
      <Header />

      {/* Main Page Workspace */}
      <main className="app-main">
        <div className="app-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppShell;
