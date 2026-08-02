import type { ApplicationResponseDto, ApplicationStatus } from '@nexahire/types';
import { ApplicationCard } from './ApplicationCard';

interface Props {
  status: ApplicationStatus;
  title: string;
  applications: ApplicationResponseDto[];
  onDrop: (status: ApplicationStatus, id: string) => void;
}

export function KanbanColumn({ status, title, applications, onDrop }: Props) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('applicationId');
    if (id) {
      onDrop(status, id);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('applicationId', id);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="kanban-column"
      style={{
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '12px',
        minWidth: '250px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#334155' }}>
        {title} <span style={{ color: '#94a3b8', fontSize: '13px' }}>({applications.length})</span>
      </h3>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} onDragStart={handleDragStart} />
        ))}
      </div>
    </div>
  );
}
