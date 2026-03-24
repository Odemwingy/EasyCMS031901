import { ApiListData, httpRequest } from "../lib/http";

export interface RoleOption {
  id: number;
  name: string;
  code: string;
}

export interface UserListItem {
  id: number;
  username: string;
  name: string;
  user_type: number;
  user_type_label: string;
  org_id: string;
  org_name: string;
  status: number;
  status_label: string;
  roles: RoleOption[];
  last_login_at: string | null;
  created_at: string;
}

export interface UserListQuery {
  page?: number;
  per_page?: number;
  keyword?: string;
  user_type?: number;
  org_id?: string;
  role_id?: number;
  status?: number;
}

export interface CreateUserPayload {
  username: string;
  name: string;
  password: string;
  user_type: number;
  org_id: string;
  role_ids: number[];
  project_ids?: string[];
  remark?: string;
}

export interface UserDetail extends UserListItem {
  must_change_password: boolean;
  remark: string | null;
  project_ids: string[];
  login_fail_count: number;
  locked_at: string | null;
  created_by: number | null;
  updated_at: string;
}

export interface UpdateUserPayload {
  name: string;
  user_type: number;
  org_id: string;
  role_ids: number[];
  project_ids?: string[];
  remark?: string;
}

export interface RoleListItem {
  id: number;
  name: string;
  code: string;
  description: string;
  data_scope: number;
  is_system_preset: boolean;
  status: number;
  status_label: string;
  user_count: number;
  updated_at: string;
}

export interface RoleDetail extends RoleListItem {
  created_at: string;
}

export interface UpdateRolePayload {
  name: string;
  description?: string;
  status: number;
}

export interface RoleListQuery {
  page?: number;
  per_page?: number;
  keyword?: string;
  status?: number;
}

export interface CreateRolePayload {
  name: string;
  code: string;
  description?: string;
  status: number;
}

export interface MenuTreeItem {
  id: number;
  parent_id: number | null;
  type: number;
  name: string;
  permission: string;
  route_path: string | null;
  component: string | null;
  icon: string | null;
  sort: number;
  status: number;
  status_label: string;
  remark: string | null;
  created_at: string;
  updated_at: string;
  children: MenuTreeItem[];
}

export interface CreateMenuPayload {
  parent_id?: number | null;
  type: number;
  name: string;
  permission: string;
  route_path?: string;
  component?: string;
  icon?: string;
  sort: number;
  status: number;
  remark?: string;
}

export interface UpdateMenuPayload {
  parent_id?: number | null;
  name: string;
  route_path?: string;
  component?: string;
  icon?: string;
  sort: number;
  status: number;
  remark?: string;
}

export interface AuditLogItem {
  id: number;
  log_type: string;
  log_type_label: string;
  operator_id: number;
  operator_name: string;
  action: string;
  action_label: string;
  object_type: string;
  object_type_label: string;
  object_id: string;
  object_name: string;
  result: number;
  result_label: string;
  project_id: string | null;
  created_at: string;
}

export interface AuditLogQuery {
  page?: number;
  per_page?: number;
  log_type?: string;
  operator_id?: number;
  object_type?: string;
  object_id?: string;
  start_time?: string;
  end_time?: string;
  project_id?: string;
}

export interface AuditLogDetail extends AuditLogItem {
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown> | null;
  fail_reason: string | null;
  source_page: string | null;
  request_id: string | null;
}

export async function getUsers(query: UserListQuery) {
  return httpRequest<ApiListData<UserListItem>>("/api/v1/admin/users", { query: query as Record<string, unknown> });
}

export async function createUser(payload: CreateUserPayload) {
  return httpRequest<{ id: number }>("/api/v1/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getUserDetail(id: number) {
  return httpRequest<UserDetail>(`/api/v1/admin/users/${id}`);
}

export async function updateUser(id: number, payload: UpdateUserPayload) {
  return httpRequest<UserDetail>(`/api/v1/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateUserStatus(id: number, status: number) {
  return httpRequest<null>(`/api/v1/admin/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getRoles(query: RoleListQuery) {
  return httpRequest<ApiListData<RoleListItem>>("/api/v1/admin/roles", { query: query as Record<string, unknown> });
}

export async function createRole(payload: CreateRolePayload) {
  return httpRequest<{ id: number }>("/api/v1/admin/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getRoleDetail(id: number) {
  return httpRequest<RoleDetail>(`/api/v1/admin/roles/${id}`);
}

export async function updateRole(id: number, payload: UpdateRolePayload) {
  return httpRequest<RoleDetail>(`/api/v1/admin/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function copyRole(id: number, name: string, code: string) {
  return httpRequest<{ id: number }>(`/api/v1/admin/roles/${id}/copy`, {
    method: "POST",
    body: JSON.stringify({ name, code }),
  });
}

export async function updateRoleStatus(id: number, status: number) {
  return httpRequest<null>(`/api/v1/admin/roles/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getMenuTree(includeDisabled = false) {
  return httpRequest<MenuTreeItem[]>("/api/v1/admin/menus/tree", {
    query: { include_disabled: includeDisabled },
  });
}

export async function createMenu(payload: CreateMenuPayload) {
  return httpRequest<{ id: number; name: string; permission: string; created_at: string }>("/api/v1/admin/menus", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMenu(id: number, payload: UpdateMenuPayload) {
  return httpRequest<null>(`/api/v1/admin/menus/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateMenuStatus(id: number, status: number) {
  return httpRequest<{ affected_count: number }>(`/api/v1/admin/menus/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteMenu(id: number) {
  return httpRequest<null>(`/api/v1/admin/menus/${id}`, {
    method: "DELETE",
  });
}

export async function getRolePermissions(roleId: number) {
  return httpRequest<{ role_id: number; permissions: string[] }>(`/api/v1/admin/roles/${roleId}/permissions`);
}

export async function updateRolePermissions(roleId: number, permissions: string[]) {
  return httpRequest<null>(`/api/v1/admin/roles/${roleId}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissions }),
  });
}

export async function getAuditLogs(query: AuditLogQuery) {
  return httpRequest<ApiListData<AuditLogItem>>("/api/v1/admin/audit-logs", { query: query as Record<string, unknown> });
}

export async function getAuditLogDetail(id: number) {
  return httpRequest<AuditLogDetail>(`/api/v1/admin/audit-logs/${id}`);
}
