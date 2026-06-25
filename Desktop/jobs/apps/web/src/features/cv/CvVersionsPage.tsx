import { useState } from 'react';
import { useCvVersions } from './hooks/useCvVersions';
import type { CreateCvVersionDto } from '@nexahire/types';

export function CvVersionsPage() {
  const { list, create, delete: remove } = useCvVersions();
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dto: CreateCvVersionDto = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
    };
    create.mutate(dto, { onSuccess: () => setShowForm(false) });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2>CV Versions</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {showForm ? 'Cancel' : 'Add CV'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input required name="title" placeholder="e.g. Frontend Engineer" style={{ padding: '8px', border: '1px solid #ccc' }} />
          <textarea required name="content" placeholder="Paste your full resume content here..." rows={10} style={{ padding: '8px', border: '1px solid #ccc', resize: 'vertical' }} />
          <button type="submit" disabled={create.isPending} style={{ padding: '8px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px' }}>
            {create.isPending ? 'Saving...' : 'Save CV Version'}
          </button>
        </form>
      )}

      {list.isPending && <div>Loading...</div>}
      {list.data?.map(cv => (
        <div key={cv.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: '0 0 8px 0' }}>{cv.title}</h3>
            <button onClick={() => remove.mutate(cv.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
          </div>
          <p style={{ color: '#64748b', fontSize: '14px', whiteSpace: 'pre-wrap', maxHeight: '100px', overflow: 'hidden' }}>
            {cv.content}
          </p>
        </div>
      ))}
    </div>
  );
}
