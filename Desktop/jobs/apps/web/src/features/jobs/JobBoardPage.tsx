import { useState } from 'react';
import { useJobs } from './hooks/useJobs';

export function JobBoardPage() {
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [visaTag, setVisaTag] = useState<string>('');
  const [deepLinkQuery, setDeepLinkQuery] = useState('Frontend Engineer');

  const { data: jobs, isPending } = useJobs({
    remote: remoteOnly || undefined,
    visaTag: visaTag || undefined,
  });

  const getLinkedInLink = () => {
    const params = new URLSearchParams();
    params.append('keywords', deepLinkQuery);
    if (remoteOnly) params.append('f_WT', '2');
    params.append('f_TPR', 'r86400');
    return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
  };

  const getBaytLink = () => {
    const params = new URLSearchParams();
    params.append('q', deepLinkQuery);
    if (remoteOnly) params.append('remote', 'true');
    return `https://www.bayt.com/en/international/jobs/?${params.toString()}`;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Job Aggregator</h2>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Sidebar Filters */}
        <div style={{ width: '300px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3>Filters</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
              />
              Remote Only
            </label>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Visa Eligibility</label>
            <select
              value={visaTag}
              onChange={(e) => setVisaTag(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="">Any</option>
              <option value="NL HSM Eligible">NL HSM Eligible</option>
              <option value="DE Blue Card Eligible">DE Blue Card Eligible</option>
              <option value="Visa Sponsorship">Explicit Visa Sponsorship</option>
              <option value="Gulf Iqama/Visa">Gulf Jobs</option>
            </select>
          </div>

          <hr style={{ borderColor: '#e2e8f0', margin: '24px 0' }} />

          <h3>Deep Links (Tier 3)</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
            Sources that shouldn't be scraped. Open them directly based on your filters.
          </p>
          <input
            value={deepLinkQuery}
            onChange={(e) => setDeepLinkQuery(e.target.value)}
            placeholder="Search query..."
            style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href={getLinkedInLink()} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '8px', backgroundColor: '#0077b5', color: '#fff', textAlign: 'center', borderRadius: '4px', textDecoration: 'none' }}>
              Search LinkedIn
            </a>
            <a href={getBaytLink()} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '8px', backgroundColor: '#1e3a8a', color: '#fff', textAlign: 'center', borderRadius: '4px', textDecoration: 'none' }}>
              Search Bayt
            </a>
          </div>
        </div>

        {/* Main Feed */}
        <div style={{ flex: 1 }}>
          {isPending ? (
            <div>Loading jobs...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {jobs?.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No jobs found for these filters.</div>}
              {jobs?.map((job) => (
                <div key={job.id} style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                      <a href={job.applyUrl} target="_blank" rel="noreferrer" style={{ color: '#0f172a', textDecoration: 'none' }}>{job.title}</a>
                    </h3>
                    <div style={{ color: '#64748b', marginBottom: '12px' }}>
                      <strong>{job.company?.name || 'Unknown Company'}</strong> • {job.location || 'Anywhere'} {job.remote && '🌍 Remote'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#f1f5f9', borderRadius: '4px', color: '#475569' }}>
                        Source: {job.source}
                      </span>
                      {job.visaTags.map((tag) => (
                        <span key={tag} style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '4px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {new Date(job.postedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
