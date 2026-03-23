import { setToken } from "../lib/auth";
import { httpRequest } from "../lib/http";

interface LoginUser {
  id: number;
  username: string;
  name: string;
  user_type: number;
  org_id: string;
  must_change_password: boolean;
}

interface LoginResponse {
  token: string;
  expires_at: string;
  user: LoginUser;
}

export async function login(username: string, password: string) {
  const result = await httpRequest<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ username, password }),
  });
  setToken(result.token, result.expires_at);
  return result;
}

export async function logout() {
  return httpRequest<null>("/api/v1/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser() {
  return httpRequest<{
    id: number;
    username: string;
    name: string;
    user_type: number;
    user_type_label: string;
    org_id: string;
    status: number;
    status_label: string;
    must_change_password: boolean;
    last_login_at: string | null;
    roles: Array<{ id: number; name: string; code: string }>;
  }>("/api/v1/auth/me");
}

export async function getCurrentUserMenus() {
  return httpRequest<
    Array<{
      id: number;
      parent_id: number | null;
      type: number;
      name: string;
      permission: string;
      route_path: string | null;
      component: string | null;
      icon: string | null;
      sort: number;
      children: unknown[];
    }>
  >("/api/v1/auth/menus");
}
