import { useState } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { StatsStrip } from './components/StatsStrip';
import { useApplications } from './hooks/useApplications';
import { AtsOptimizer } from '../ats/AtsOptimizer';
import { CreateApplicationDto, ApplicationStatus } from '@nexahire/types';

export function ApplicationsPage() {
  const { create } = useApplications();
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dto: CreateApplicationDto = {
      company: formData.get('company') as string,
      role: formData.get('role') as string,
      status: (formData.get('status') as ApplicationStatus) || 'applied',
    };
    create.mutate(dto, {
      onSuccess: () => setShowForm(false),
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', color: '#0f172a' }}>Application Tracker</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {showForm ? 'Close Form' : 'Add Application'}
        </button>
      </div>

      <AtsOptimizer />

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: '16px',
            alignItems: 'end',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Company</label>
            <input required name="company" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Role</label>
            <input required name="role" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Status</label>
            <select name="status" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} defaultValue="applied">
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={create.isPending}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              height: '35px',
            }}
          >
            {create.isPending ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}

      <StatsStrip />
      <KanbanBoard />
    </div>
  );
}
