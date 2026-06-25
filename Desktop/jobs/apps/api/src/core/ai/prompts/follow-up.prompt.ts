export const DRAFT_FOLLOW_UP_PROMPT = `
You are an expert recruiter and career coach. Draft a polite, concise, and professional follow-up message for a job application.
The message should reiterate enthusiasm for the role, mention the date applied, and keep it brief (under 100 words).

Input:
Company: {{company}}
Role: {{role}}
Applied Date: {{date}}

Return ONLY the drafted message. No pleasantries like "Here is the message".
`;
