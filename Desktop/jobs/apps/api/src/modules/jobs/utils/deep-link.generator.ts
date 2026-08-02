export function generateLinkedInDeepLink(query: string, remote: boolean): string {
  const base = 'https://www.linkedin.com/jobs/search/';
  const params = new URLSearchParams();
  if (query) params.append('keywords', query);
  if (remote) params.append('f_WT', '2'); // 2 is Remote in LinkedIn
  params.append('f_TPR', 'r86400'); // Past 24 hours
  return `${base}?${params.toString()}`;
}

export function generateBaytDeepLink(query: string, remote: boolean): string {
  const base = 'https://www.bayt.com/en/international/jobs/';
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (remote) params.append('remote', 'true');
  return `${base}?${params.toString()}`;
}
