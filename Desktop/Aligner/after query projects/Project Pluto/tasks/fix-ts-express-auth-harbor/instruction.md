The auth service in /app currently supports login, health check, and a protected profile endpoint. The team needs a production-ready token refresh system with session tracking before shipping.

The service already exposes:
  - GET /health        returns {"status": "ok"} with HTTP 200
  - POST /auth/login   accepts {"username": "admin", "password": "password123"} and returns {"token": "<access_jwt>"} on success
  - GET /api/profile   requires a valid Bearer token; returns 401 without one, 200 with {"username": "admin", ...} when authenticated

You must extend the service with the following endpoints and behaviours:

1. POST /auth/login  (modify existing)
   Must now return BOTH the access token and a refresh token:
     {"token": "<access_jwt>", "refreshToken": "<refresh_jwt>"}
   Each login creates a new independent session.

2. POST /auth/refresh
   Accepts: {"refreshToken": "<token>"}
   On success (token is valid and has not been used or invalidated):
     Returns HTTP 200 with {"token": "<new_access_jwt>", "refreshToken": "<new_refresh_jwt>"}
     The old refresh token is immediately superseded (single-use rotation).
   On failure:
     Returns HTTP 401 with {"error": "<message>"}
   IMPORTANT — replay attack detection: if a refresh token that has already been superseded
   (i.e. used in a prior successful /auth/refresh call) is presented again, the server must
   treat this as a token theft signal and immediately invalidate ALL tokens belonging to that
   login session. Subsequent use of any token from that session (including tokens issued after
   the compromised one) must return 401.
   Implementation hint: use a token-family (session) store. Each login creates a new family;
   every rotation adds the new token to the same family. When a superseded token is replayed,
   mark the entire family as compromised so all its tokens — including newer ones — are rejected.

3. POST /auth/logout
   Accepts: {"refreshToken": "<token>"}
   Invalidates the refresh token and removes the associated session.
   Returns HTTP 200 with {"message": "Logged out successfully"} on success.
   Returns HTTP 401 with {"error": "<message>"} if the token is unknown or already invalidated.

4. GET /api/sessions  (new, requires Bearer auth)
   Returns HTTP 401 without a valid Authorization header.
   Returns HTTP 200 with the list of active sessions for the authenticated user:
     {"sessions": [{"sessionId": "<id>", "createdAt": "<ISO-8601-timestamp>"}, ...]}
   A session appears in the list after a successful login and is removed after logout or
   after a replay attack invalidates it.

The source code lives in /app/src, the TypeScript config is /app/tsconfig.json, and environment variables are in /app/.env. Node modules are already installed in /app/node_modules — no internet needed.

Implement the required changes so that `npm run build` succeeds and all endpoints behave as described above.
