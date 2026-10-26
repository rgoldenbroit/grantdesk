// Signed login cookie shared by the login page, the route guard, and the agent's channel auth.
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "gd_session";

export type ModelPolicy = "standard" | "vertex-only";

export type AppSession = {
  sub: string;
  name: string;
  labId: string;
  labName: string;
  modelPolicy: ModelPolicy;
};

function secret(): Uint8Array {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be set (32+ characters)");
  return new TextEncoder().encode(value);
}

export async function createSessionToken(user: AppSession): Promise<string> {
  return new SignJWT({
    name: user.name,
    labId: user.labId,
    labName: user.labName,
    modelPolicy: user.modelPolicy,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

export async function verifySessionToken(token: string | null | undefined): Promise<AppSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return {
      sub: String(payload.sub),
      name: String(payload.name),
      labId: String(payload.labId),
      labName: String(payload.labName),
      modelPolicy: payload.modelPolicy === "vertex-only" ? "vertex-only" : "standard",
    };
  } catch {
    return null; // expired, tampered, or signed with another secret
  }
}

/** Reads one cookie from a raw Cookie header (the eve channel gets a plain Request). */
export function readCookie(cookieHeader: string | null, name: string = SESSION_COOKIE): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}
