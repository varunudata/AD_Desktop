import React, { useState } from 'react';
import { Database, AlertTriangle, RefreshCw, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { DatabaseHealthStatus } from '@shared/types/models';
import { useToast } from '../ui/Toast';

interface DatabaseStatusBannerProps {
  status: DatabaseHealthStatus | null;
  onRefresh: () => void;
  onDataChanged?: () => void;
}

export const DatabaseStatusBanner: React.FC<DatabaseStatusBannerProps> = ({
  status,
  onRefresh,
  onDataChanged,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const toast = useToast();

  if (!status) return null;

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await window.classflowAPI.database.seedDemoData();
      if (res.success) {
        toast.success(res.data.message);
        onRefresh();
        onDataChanged?.();
      } else {
        toast.error(res.error.message);
      }
    } catch (err: unknown) {
      toast.error('Failed to seed demo data.');
    } finally {
      setSeeding(false);
    }
  };

  // If connected and initialized, return null (banner only shows when attention is needed)
  if (status.connected && status.tablesInitialized) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: status.connected ? 'var(--warning-bg)' : 'var(--danger-bg)',
        border: `1px solid ${status.connected ? 'var(--warning-border)' : 'var(--danger-border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        margin: '0 28px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle
            size={18}
            color={status.connected ? 'var(--warning)' : 'var(--danger)'}
          />
          <div>
            <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              {!status.urlConfigured
                ? 'PostgreSQL Configuration Required'
                : !status.connected
                ? 'Unable to Connect to PostgreSQL Database'
                : 'PostgreSQL Connected — Tables Uninitialized'}
            </strong>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {!status.urlConfigured
                ? 'Configure DATABASE_URL in your .env file to enable persistence.'
                : !status.connected
                ? status.error || 'Check that your PostgreSQL server (Neon or local) is running.'
                : 'Run migrations or populate demo data to get started.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {status.connected && !status.tablesInitialized && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSeed}
              disabled={seeding}
            >
              {seeding ? 'Seeding...' : 'Load Sample Data'}
            </button>
          )}

          <button
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
            title="Recheck PostgreSQL connection"
          >
            <RefreshCw size={13} />
            <span>Check Status</span>
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>Setup Guide</span>
          </button>
        </div>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: '8px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          <p><strong>To configure your PostgreSQL database:</strong></p>
          <ol style={{ paddingLeft: '18px', marginTop: '4px' }}>
            <li>
              <strong>Neon Hosted PostgreSQL (Recommended):</strong> Create a free database at{' '}
              <span className="font-mono" style={{ color: 'var(--primary-600)' }}>neon.tech</span>{' '}
              and paste the connection URL with <span className="font-mono">?sslmode=require</span> into your <span className="font-mono">.env</span> file.
            </li>
            <li>
              <strong>Local PostgreSQL:</strong> Run <span className="font-mono">docker run --name classflow-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=classflow -p 5432:5432 -d postgres</span> and set <span className="font-mono">DATABASE_URL="postgresql://postgres:postgres@localhost:5432/classflow?schema=public"</span>.
            </li>
            <li>
              Run <span className="font-mono">npx prisma migrate dev</span> in your terminal to create the tables.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
