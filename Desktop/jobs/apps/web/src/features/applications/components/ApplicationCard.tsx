import type { ApplicationResponseDto } from '@nexahire/types';

interface Props {
  application: ApplicationResponseDto;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export function ApplicationCard({ application, onDragStart }: Props) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, application.id)}
      className="application-card"
      style={{
        padding: '12px',
        margin: '8px 0',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        cursor: 'grab',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
        {application.company}
      </div>
      <div style={{ fontSize: '13px', color: '#64748b' }}>{application.role}</div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
        {new Date(application.appliedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
