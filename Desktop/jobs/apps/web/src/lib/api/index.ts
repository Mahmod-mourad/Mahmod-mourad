import { LoginDto, UserResponseDto, CreateApplicationDto, UpdateApplicationStatusDto, PaginatedApplications, ApplicationResponseDto, CreateCvVersionDto, UpdateCvVersionDto, CvVersionResponseDto, AtsRequestDto, AtsJobResponseDto, AtsJobStatusDto, JobResponseDto } from '@nexahire/types';

export class ApiError extends Error {
  constructor(public status: number, public data: any) {
    super(data?.message || 'API Error');
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'omit', // or 'include' if doing cross-origin cookies
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new ApiError(res.status, errorData);
  }
  
  // return null for 204 No Content
  if (res.status === 204) return null as any;

  return res.json();
}

export const api = {
  auth: {
    login: (dto: LoginDto) => fetchApi<{ user: UserResponseDto }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
    register: (dto: LoginDto) => fetchApi<{ user: UserResponseDto }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
    logout: () => fetchApi<{ success: boolean }>('/auth/logout', { method: 'POST' }),
    me: () => fetchApi<UserResponseDto>('/auth/me'),
  },
  applications: {
    list: (cursor?: string) => fetchApi<PaginatedApplications>(`/applications${cursor ? `?cursor=${cursor}` : ''}`),
    create: (dto: CreateApplicationDto) => fetchApi<ApplicationResponseDto>('/applications', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
    updateStatus: (id: string, dto: UpdateApplicationStatusDto) => fetchApi<ApplicationResponseDto>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),
    stats: () => fetchApi<{ stageCounts: Record<string, number>; responseRate: number }>('/applications/stats'),
  },
  cvVersions: {
    list: () => fetchApi<CvVersionResponseDto[]>('/cv-versions'),
    get: (id: string) => fetchApi<CvVersionResponseDto>(`/cv-versions/${id}`),
    create: (dto: CreateCvVersionDto) => fetchApi<CvVersionResponseDto>('/cv-versions', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id: string, dto: UpdateCvVersionDto) => fetchApi<CvVersionResponseDto>(`/cv-versions/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
    delete: (id: string) => fetchApi<void>(`/cv-versions/${id}`, { method: 'DELETE' }),
  },
  ats: {
    score: (dto: AtsRequestDto) => fetchApi<AtsJobResponseDto>('/ats/score', { method: 'POST', body: JSON.stringify(dto) }),
    tailor: (dto: AtsRequestDto) => fetchApi<AtsJobResponseDto>('/ats/tailor', { method: 'POST', body: JSON.stringify(dto) }),
    jobStatus: (jobId: string) => fetchApi<AtsJobStatusDto>(`/ats/job/${jobId}`),
  },
  jobs: {
    list: (filters: { remote?: boolean; visaTag?: string }) => {
      const params = new URLSearchParams();
      if (filters.remote) params.append('remote', 'true');
      if (filters.visaTag) params.append('visaTag', filters.visaTag);
      return fetchApi<JobResponseDto[]>(`/jobs?${params.toString()}`);
    },
  },
};
