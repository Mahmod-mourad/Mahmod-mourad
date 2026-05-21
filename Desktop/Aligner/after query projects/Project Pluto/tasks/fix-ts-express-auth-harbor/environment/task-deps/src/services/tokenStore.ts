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

// userId → Set of active familyIds (removed on logout or compromise)
const userSessions = new Map<number, Set<string>>();

/**
 * Called on login: creates a new family/session, registers the first refresh token.
 * Returns the new familyId (sessionId).
 */
export function issueRefreshToken(token: string, userId: number): string {
  // TODO: generate a familyId (randomUUID), create a FamilyEntry in familyMap,
  // register the token in tokenMap with isSuperseded=false,
  // and add the familyId to userSessions[userId].
  throw new Error('Not implemented');
}

export type RotateResult = 'ok' | 'replay' | 'invalid';

/**
 * Called on refresh: supersedes oldToken and registers newToken in the same family.
 * - Returns 'invalid'  if oldToken is unknown or the family is already compromised.
 * - Returns 'replay'   if oldToken was already superseded (replay attack detected);
 *   also marks the entire family as compromised so all future tokens in it are rejected.
 * - Returns 'ok'       on success: marks oldToken as superseded, adds newToken to family.
 */
export function rotateRefreshToken(oldToken: string, newToken: string): RotateResult {
  // TODO: look up oldToken in tokenMap; check family.isCompromised; check entry.isSuperseded;
  // on replay: set family.isCompromised=true, remove from userSessions, return 'replay';
  // on success: set entry.isSuperseded=true, register newToken in tokenMap + familyMap.
  throw new Error('Not implemented');
}

/**
 * Called on logout: invalidates the token's family/session.
 * Returns true on success, false if token is unknown, already superseded, or family is compromised.
 */
export function consumeRefreshToken(token: string): boolean {
  // TODO: look up token, validate it is not superseded and family is not compromised,
  // then mark the family as compromised and remove it from userSessions.
  throw new Error('Not implemented');
}

/**
 * Returns the list of active (non-compromised) sessions for the given userId.
 */
export function getUserSessions(userId: number): Array<{ sessionId: string; createdAt: string }> {
  // TODO: iterate userSessions[userId], look up each family in familyMap,
  // skip compromised ones, return { sessionId: familyId, createdAt: ISO string }.
  throw new Error('Not implemented');
}
