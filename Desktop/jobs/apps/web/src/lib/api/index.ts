import { apiErrorBodySchema } from '@nexahire/types';
import type {
  LoginDto,
  UserResponseDto,
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  PaginatedApplications,
  ApplicationResponseDto,
  CreateCvVersionDto,
  UpdateCvVersionDto,
  CvVersionResponseDto,
  AtsRequestDto,
  AtsJobResponseDto,
  AtsJobStatusDto,
  JobResponseDto,
} from '@nexahire/types';

/**
 * The single error type thrown by the api client. It parses the shared error
 * body the api emits — `{ error: { kind, message } }` (see `apiErrorBodySchema`)
 * — so TanStack Query's `isError`/`error` carries a meaningful `kind` + message.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly kind: string;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    const parsed = apiErrorBodySchema.safeParse(body);
    super(parsed.success ? parsed.data.error.message : 'API request failed');
    this.name = 'ApiError';
    this.status = status;
    this.kind = parsed.success ? parsed.data.error.kind : 'Unexpected';
    this.body = body;
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
    // Always send the httpOnly JWT cookie the api sets, or every guarded call 401s.
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new ApiError(res.status, errorData);
  }

  // 204 No Content carries no body.
  if (res.status === 204) return null as T;

  return res.json() as Promise<T>;
}

export const api = {
  // Generic verbs for the feature hooks that hit endpoints without a dedicated
  // typed method. They return `{ data }` (the shape the hooks read) so callers
  // narrow the payload at the call site.
  get: <T = unknown>(
    endpoint: string,
    opts?: { params?: Record<string, string | number | boolean> },
  ) => {
    const qs = opts?.params
      ? '?' +
        new URLSearchParams(
          Object.entries(opts.params).map(([k, v]) => [k, String(v)]),
        ).toString()
      : '';
    return fetchApi<T>(`${endpoint}${qs}`).then((data) => ({ data }));
  },
  post: <T = unknown>(endpoint: string, body?: unknown) =>
    fetchApi<T>(endpoint, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }).then((data) => ({ data })),
  patch: <T = unknown>(endpoint: string, body?: unknown) =>
    fetchApi<T>(endpoint, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) }).then((data) => ({ data })),
  del: <T = unknown>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: 'DELETE' }).then((data) => ({ data })),
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
