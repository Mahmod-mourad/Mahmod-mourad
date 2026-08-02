import { useState } from 'react';
import { useAts, useAtsJob } from './hooks/useAts';
import { useCvVersions } from '../cv/hooks/useCvVersions';

export function AtsOptimizer() {
  const { score } = useAts();
  const cvQuery = useCvVersions().list;

  const [selectedCv, setSelectedCv] = useState<string>('');
  const [jd, setJd] = useState<string>('');
  const [jobId, setJobId] = useState<string | null>(null);

  const jobQuery = useAtsJob(jobId);

  const handleScore = () => {
    if (!selectedCv || !jd) return;
    score.mutate(
      { cvVersionId: selectedCv, jobDescription: jd },
      {
        onSuccess: (data) => setJobId(data.jobId),
      }
    );
  };

  const status = jobQuery.data?.status;
  const result = jobQuery.data?.result;

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
      <h3 style={{ marginTop: 0 }}>ATS Optimizer</h3>
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Select Base CV</label>
          <select
            value={selectedCv}
            onChange={(e) => setSelectedCv(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          >
            <option value="">-- Choose CV --</option>
            {cvQuery.data?.map(cv => (
              <option key={cv.id} value={cv.id}>{cv.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Job Description</label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={8}
          placeholder="Paste JD here..."
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
      </div>

      <button
        onClick={handleScore}
        disabled={!selectedCv || !jd || score.isPending || status === 'processing'}
        style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        {score.isPending || status === 'processing' ? 'Analyzing...' : 'Analyze against ATS'}
      </button>

      {jobId && status === 'processing' && <div style={{ marginTop: '16px', color: '#3b82f6' }}>AI is analyzing your CV against this job...</div>}
      
      {jobId && status === 'failed' && <div style={{ marginTop: '16px', color: 'red' }}>Analysis failed: {jobQuery.data?.error}</div>}

      {result && result.score !== undefined && (
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: result.score > 75 ? '#10b981' : '#f59e0b' }}>
            Match Score: {result.score}/100
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <strong style={{ display: 'block', marginBottom: '8px' }}>Missing Keywords:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {result.missingKeywords?.map(kw => (
                <span key={kw} style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontSize: '12px' }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
