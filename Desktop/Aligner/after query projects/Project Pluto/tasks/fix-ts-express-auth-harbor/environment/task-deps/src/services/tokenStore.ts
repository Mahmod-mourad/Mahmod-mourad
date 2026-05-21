export function issueRefreshToken(token: string, userId: number): string {
  throw new Error('Not implemented');
}

export type RotateResult = 'ok' | 'replay' | 'invalid';

export function rotateRefreshToken(oldToken: string, newToken: string): RotateResult {
  throw new Error('Not implemented');
}

export function consumeRefreshToken(token: string): boolean {
  throw new Error('Not implemented');
}

export function getUserSessions(userId: number): Array<{ sessionId: string; createdAt: string }> {
  throw new Error('Not implemented');
}
