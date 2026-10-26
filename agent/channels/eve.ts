import { type AuthFn, localDev, vercelOidc } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";
import { readCookie, verifySessionToken } from "../../lib/session";

// Our own authenticator: trusts the signed login cookie set by /login.
function appSession(): AuthFn<Request> {
  return async (request) => {
    const user = await verifySessionToken(readCookie(request.headers.get("cookie")));
    if (!user) return null; // not ours: let the next authenticator try
    return {
      authenticator: "grantdesk",
      principalId: user.sub,
      principalType: "user",
      attributes: {
        name: user.name,
        labId: user.labId,
        labName: user.labName,
        modelPolicy: user.modelPolicy,
      },
    };
  };
}

// DECISION: tool stubs (used by evals) are allowed only on a local dev server.
const devWithStubs: AuthFn<Request> = async (request) => {
  const caller = await localDev()(request);
  return caller ? { ...caller, allowToolStubs: true } : null;
};

// DECISION: replaced placeholderAuth. Order matters: signed-in users first,
// Vercel-to-Vercel callers second, local dev last.
export default eveChannel({
  auth: [appSession(), vercelOidc(), devWithStubs],
});
