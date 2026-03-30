import { adminRoutes } from "./admin-routes";

type MenuNode = {
  permission: string;
  route_path: string | null;
  children?: MenuNode[];
};

type AccessSnapshot = {
  routes: string[];
  permissions: string[];
};

const ACCESS_KEY = "easycms_access_snapshot";

/** 第二段合法则视为已注册后台路径（含 /backend/user/123） */
const BACKEND_SEGMENTS = new Set([
  "user",
  "role",
  "permission",
  "menu",
  "audit",
  "notification",
  "params",
]);

/** 旧书签扁平路径 → requireAuth 前仍可能命中，loader 会重定向至 /backend/* */
const LEGACY_FLAT_ROOTS = new Set([
  "users",
  "roles",
  "permissions",
  "menus",
  "audit-log",
  "notifications",
  "system-params",
]);

const ROUTE_ALIASES: Record<string, string> = {
  "/admin/users": adminRoutes.user,
  "/admin/roles": adminRoutes.role,
  "/admin/menus": adminRoutes.menu,
  "/admin/audit-logs": adminRoutes.audit,
  "/admin/audit-log": adminRoutes.audit,
  "/admin/permissions": adminRoutes.permission,
  "/admin/notifications": adminRoutes.notification,
  "/admin/system-params": adminRoutes.params,
};

function normalizeRoutePath(path: string) {
  const clean = path.trim();
  if (!clean.startsWith("/")) return "";
  if (ROUTE_ALIASES[clean]) return ROUTE_ALIASES[clean];

  if (clean.startsWith("/admin/")) {
    const leaf = clean.slice("/admin/".length);
    if (leaf === "audit-logs" || leaf === "audit-log") return adminRoutes.audit;
    if (leaf === "users") return adminRoutes.user;
    if (leaf === "roles") return adminRoutes.role;
    if (leaf === "menus") return adminRoutes.menu;
    if (leaf === "permissions") return adminRoutes.permission;
    if (leaf === "notifications") return adminRoutes.notification;
    if (leaf === "system-params") return adminRoutes.params;
    return `/backend/${leaf}`;
  }

  return clean;
}

function walkMenus(
  menus: MenuNode[],
  routes: Set<string>,
  permissions: Set<string>,
) {
  menus.forEach((menu) => {
    const routePath = (menu.route_path || "").trim();
    const permission = (menu.permission || "").trim();
    const normalizedRoutePath = normalizeRoutePath(routePath);
    if (normalizedRoutePath) {
      routes.add(normalizedRoutePath);
    }
    if (permission) {
      permissions.add(permission);
    }
    if (menu.children?.length) {
      walkMenus(menu.children, routes, permissions);
    }
  });
}

const CANON_TO_LEGACY_FLAT: Record<string, string> = {
  [adminRoutes.user]: "/users",
  [adminRoutes.role]: "/roles",
  [adminRoutes.permission]: "/permissions",
  [adminRoutes.menu]: "/menus",
  [adminRoutes.audit]: "/audit-log",
  [adminRoutes.notification]: "/notifications",
  [adminRoutes.params]: "/system-params",
};

export function setAccessFromMenus(menus: MenuNode[]) {
  const routes = new Set<string>();
  const permissions = new Set<string>();
  walkMenus(menus, routes, permissions);
  for (const r of [...routes]) {
    const legacy = CANON_TO_LEGACY_FLAT[r];
    if (legacy) routes.add(legacy);
  }

  const snapshot: AccessSnapshot = {
    routes: [...routes],
    permissions: [...permissions],
  };
  sessionStorage.setItem(ACCESS_KEY, JSON.stringify(snapshot));

  if (typeof window !== "undefined" && import.meta.env.DEV) {
    console.info("[easycms] access routes:", snapshot.routes);
    console.info("[easycms] access permissions:", snapshot.permissions);
  }
}

function getAccessSnapshot(): AccessSnapshot {
  if (typeof window === "undefined") {
    return { routes: [], permissions: [] };
  }
  try {
    const raw = sessionStorage.getItem(ACCESS_KEY);
    if (!raw) return { routes: [], permissions: [] };
    const parsed = JSON.parse(raw) as AccessSnapshot;
    return {
      routes: Array.isArray(parsed.routes) ? parsed.routes : [],
      permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
    };
  } catch {
    return { routes: [], permissions: [] };
  }
}

export function clearAccessSnapshot() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ACCESS_KEY);
}

export function getAllowedRoutes() {
  return getAccessSnapshot().routes;
}

export function can(permission: string) {
  return getAccessSnapshot().permissions.includes(permission);
}

/** 是否为后台已注册的前端路径（未知路径应由 404 承接） */
export function isKnownAdminPath(pathname: string) {
  const clean = (pathname || "/").trim() || "/";
  if (clean === "/" || clean === "/403") return true;
  const parts = clean.split("/").filter(Boolean);
  if (parts[0] === "backend" && parts[1] && BACKEND_SEGMENTS.has(parts[1])) {
    return true;
  }
  const first = parts[0];
  return first != null && LEGACY_FLAT_ROOTS.has(first);
}

export function hasRouteAccess(pathname: string) {
  const { routes, permissions } = getAccessSnapshot();
  if (pathname === "/" || pathname === "/backend" || pathname === "/backend/") return true;
  if (pathname === "/403") return true;
  if (
    (pathname === adminRoutes.permission || pathname === "/permissions") &&
    permissions.includes("admin:roles:assign-permissions")
  ) {
    return true;
  }
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
