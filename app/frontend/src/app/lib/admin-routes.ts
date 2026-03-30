/**
 * 与 ui/Content Management Platform 信息架构一致：后台二级路径为 /backend/{segment}
 */
export const adminRoutes = {
  user: "/backend/user",
  role: "/backend/role",
  permission: "/backend/permission",
  menu: "/backend/menu",
  audit: "/backend/audit",
  notification: "/backend/notification",
  params: "/backend/params",
} as const;

export function userDetailPath(id: string | number) {
  return `${adminRoutes.user}/${id}`;
}

export function roleDetailPath(id: string | number) {
  return `${adminRoutes.role}/${id}`;
}

export function permissionConfigSearch(roleId: string | number) {
  return `${adminRoutes.permission}?roleId=${roleId}`;
}
