import { useApplications } from '../hooks/useApplications';

export function StatsStrip() {
  const { stats } = useApplications();

  if (stats.isPending) return <div style={{ padding: '16px', color: '#64748b' }}>Loading stats...</div>;
  if (stats.isError) return null;

  const { stageCounts, responseRate } = stats.data;

  return (
    <div
      style={{
        display: 'flex',
        gap: '24px',
        padding: '16px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '24px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Applied</span>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{stageCounts.applied || 0}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Screening</span>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{stageCounts.screening || 0}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Interviews</span>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{stageCounts.interview || 0}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Offers</span>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>{stageCounts.offer || 0}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Rejected</span>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>{stageCounts.rejected || 0}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 'auto' }}>
        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Response Rate</span>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>{responseRate.toFixed(1)}%</span>
      </div>
    </div>
  );
}
