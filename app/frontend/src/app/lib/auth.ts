const TOKEN_KEY = "easycms_token";
const TOKEN_EXPIRES_AT_KEY = "easycms_token_expires_at";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, expiresAt?: string) {
  localStorage.setItem(TOKEN_KEY, token);
  if (expiresAt) {
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, expiresAt);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
}
