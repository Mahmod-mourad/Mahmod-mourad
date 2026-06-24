import { useApplications } from '../hooks/useApplications';
import { KanbanColumn } from './KanbanColumn';
import { ApplicationStatus, ApplicationResponseDto } from '@nexahire/types';

const STAGES: { id: ApplicationStatus; title: string }[] = [
  { id: 'applied', title: 'Applied' },
  { id: 'screening', title: 'Screening' },
  { id: 'interview', title: 'Interview' },
  { id: 'offer', title: 'Offer' },
  { id: 'rejected', title: 'Rejected' },
];

export function KanbanBoard() {
  const { list, updateStatus } = useApplications();

  if (list.isPending) return <div style={{ padding: '24px' }}>Loading board...</div>;
  if (list.isError) return <div style={{ padding: '24px', color: 'red' }}>Failed to load applications.</div>;

  // Flatten all pages
  const applications = list.data.pages.flatMap((page) => page.data);

  const handleDrop = (status: ApplicationStatus, id: string) => {
    updateStatus.mutate({ id, dto: { status } });
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '16px',
        minHeight: '600px',
      }}
    >
      {STAGES.map((stage) => (
        <KanbanColumn
          key={stage.id}
          status={stage.id}
          title={stage.title}
          applications={applications.filter((app: ApplicationResponseDto) => app.status === stage.id)}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
