import type { Application } from '@prisma/client';
import type { ApplicationResponseDto } from '@nexahire/types';

/**
 * Map a Prisma `Application` entity to the explicit response DTO the client
 * expects. Repositories return entities internally; the controller maps before
 * sending so a raw Prisma row never leaks and `Date` fields are serialized to
 * ISO strings (and typed as such in @nexahire/types).
 */
export function toApplicationResponse(app: Application): ApplicationResponseDto {
  return {
    id: app.id,
    userId: app.userId,
    company: app.company,
    role: app.role,
    location: app.location,
    url: app.url,
    source: app.source,
    notes: app.notes,
    status: app.status,
    atsScore: app.atsScore,
    appliedAt: app.appliedAt.toISOString(),
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}
