// The lab always comes from the verified login, never from the model.
type SessionLike = { auth: { current: { attributes: Readonly<Record<string, string | readonly string[]>> } | null } };

export function currentLabId(session: SessionLike): string {
  const fromLogin = session.auth.current?.attributes.labId;
  if (typeof fromLogin === "string" && fromLogin.length > 0) return fromLogin;
  // DECISION: local terminal chat (eve dev) has no login, so allow a default lab there.
  // Never on a deployment: a production user with no lab must fail, not see another lab.
  const deployed = process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
  if (!deployed && process.env.DEV_LAB_ID) return process.env.DEV_LAB_ID;
  throw new Error("No lab is attached to this login.");
}
