// Prints the claims of your local Vercel OIDC token (read from .env.local).
// Run with --token to print the raw token instead (for curl tests).
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/^VERCEL_OIDC_TOKEN="?([^"\n]+)"?/m)?.[1];
if (!token) {
  console.error("No VERCEL_OIDC_TOKEN in .env.local. Run: vercel env pull .env.local");
  process.exit(1);
}
if (process.argv.includes("--token")) {
  console.log(token);
} else {
  const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
  console.log({ iss: claims.iss, aud: claims.aud, sub: claims.sub, expires: new Date(claims.exp * 1000).toISOString() });
}
