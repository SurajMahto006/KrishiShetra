import React from 'react';
import Header from './Header';
import DevBanner from '../dev/DevBanner';
import DevRoleSwitcher from '../dev/DevRoleSwitcher';

export const AppShell = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--ks-bg-ivory)' }}>
      {/* Development Banner (only in Vite dev mode & active dev session) */}
      {import.meta.env.DEV && <DevBanner />}

      {/* Main Header Shell */}
      <Header />

      {/* Main Page Workspace */}
      <main className="app-main">
        <div className="app-container">
          {children}
        </div>
      </main>

      {/* Development Role Switcher Widget (only in Vite dev mode & active dev session) */}
      {import.meta.env.DEV && <DevRoleSwitcher />}
    </div>
  );
};

export default AppShell;
