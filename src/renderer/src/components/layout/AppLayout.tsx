import React from 'react';
import { Sidebar, NavPage } from './Sidebar';
import { TopBar } from './TopBar';
import { DatabaseStatusBanner } from './DatabaseStatusBanner';
import { DatabaseHealthStatus } from '@shared/types/models';

interface AppLayoutProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  onQuickAction: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  dbStatus: DatabaseHealthStatus | null;
  onDbRefresh: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
  onNavigate,
  onQuickAction,
  onRefresh,
  isRefreshing,
  dbStatus,
  onDbRefresh,
  children,
}) => {
  return (
    <div className="app-container">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        dbStatus={dbStatus}
      />

      <main className="app-main">
        <TopBar
          currentPage={currentPage}
          onQuickAction={onQuickAction}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />

        <div style={{ paddingTop: '16px' }}>
          <DatabaseStatusBanner
            status={dbStatus}
            onRefresh={onDbRefresh}
            onDataChanged={onRefresh}
          />
        </div>

        <div className="content-viewport">
          {children}
        </div>
      </main>
    </div>
  );
};
