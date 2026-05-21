import { randomUUID } from 'crypto';

interface TokenEntry {
  familyId: string;
  userId: number;
  isSuperseded: boolean;
}

interface FamilyEntry {
  userId: number;
  createdAt: Date;
  isCompromised: boolean;
}

// token string → entry (kept even after superseding, to detect replays)
const tokenMap = new Map<string, TokenEntry>();

// familyId → family metadata
const familyMap = new Map<string, FamilyEntry>();

// userId → Set of active familyIds
const userSessions = new Map<number, Set<string>>();

/** Called on login: registers the first refresh token in a new family/session. */
export function issueRefreshToken(token: string, userId: number): string {
  throw new Error('Not implemented');
}

export type RotateResult = 'ok' | 'replay' | 'invalid';

/**
 * Called on /auth/refresh.
 * Supersedes oldToken and registers newToken in the same family.
 * Detects replay attacks (oldToken already superseded) and cascades family invalidation.
 */
export function rotateRefreshToken(oldToken: string, newToken: string): RotateResult {
  throw new Error('Not implemented');
}

/** Called on /auth/logout. Returns true on success, false if token is invalid. */
export function consumeRefreshToken(token: string): boolean {
  throw new Error('Not implemented');
}

/** Returns active sessions for the given userId. */
export function getUserSessions(userId: number): Array<{ sessionId: string; createdAt: string }> {
  throw new Error('Not implemented');
}
