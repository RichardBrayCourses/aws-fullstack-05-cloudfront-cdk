import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  decodeIdToken,
  getCognitoLoginUrl,
  getCognitoLogoutUrl,
} from "./oauth-helpers";
import { sessionStorage } from "./sessionStorage";
import type { User } from "../types";

const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;

export async function startLogin(): Promise<void> {
  if (!COGNITO_DOMAIN || !COGNITO_CLIENT_ID) {
    throw new Error(
      "Missing COGNITO_DOMAIN or COGNITO_CLIENT_ID (set it in a .env file)."
    );
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  sessionStorage.setCodeVerifier(codeVerifier);
  sessionStorage.setState(state);

  window.location.href = getCognitoLoginUrl(
    state,
    codeChallenge,
    COGNITO_DOMAIN,
    COGNITO_CLIENT_ID
  );
}

export async function handleOAuthCallback(
  code: string,
  state: string
): Promise<User> {
  const storedState = sessionStorage.getState();
  const codeVerifier = sessionStorage.getCodeVerifier();

  if (!storedState || !codeVerifier) {
    throw new Error(
      "Error: unable to read state or code verifier from session storage."
    );
  }

  if (state !== storedState) {
    throw new Error("Error: cognito/session-storage state mismatch");
  }

  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: COGNITO_CLIENT_ID,
    code: code,
    redirect_uri: `${window.location.origin}/callback`,
    code_verifier: codeVerifier,
  });

  const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenParams.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${errorText}`);
  }

  const tokens = await response.json();
  sessionStorage.removeCodeVerifier();
  sessionStorage.removeState();

  if (!tokens.access_token) {
    throw new Error("No access token received");
  }

  sessionStorage.setAccessToken(tokens.access_token);

  if (!tokens.id_token) {
    throw new Error("No ID token received");
  }

  sessionStorage.setIdToken(tokens.id_token);

  const user = decodeIdToken(tokens.id_token);
  if (!user) {
    throw new Error("Failed to decode user information from ID token");
  }

  return user;
}

export async function doLogout(): Promise<void> {
  sessionStorage.clearAll();
  window.location.href = getCognitoLogoutUrl(COGNITO_DOMAIN, COGNITO_CLIENT_ID);
}

export function getUserFromStoredToken(): User | null {
  const idToken = sessionStorage.getIdToken();
  if (!idToken) return null;
  return decodeIdToken(idToken);
}
