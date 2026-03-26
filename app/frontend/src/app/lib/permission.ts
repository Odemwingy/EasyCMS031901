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

/** 与 `routes.tsx` 中 Admin 子路由一致；未命中的路径交 `*` 渲染 404，不做菜单权限拦截 */
const ADMIN_ROUTE_ROOTS = new Set([
  "users",
  "roles",
  "permissions",
  "menus",
  "audit-log",
  "notifications",
  "system-params",
]);

const ROUTE_ALIASES: Record<string, string> = {
  "/admin/users": "/users",
  "/admin/roles": "/roles",
  "/admin/menus": "/menus",
  "/admin/audit-logs": "/audit-log",
  "/admin/permissions": "/permissions",
  "/admin/notifications": "/notifications",
  "/admin/system-params": "/system-params",
};

function normalizeRoutePath(path: string) {
  const clean = path.trim();
  if (!clean.startsWith("/")) return "";
  if (ROUTE_ALIASES[clean]) return ROUTE_ALIASES[clean];

  // 通用兜底：后端返回 /admin/* 时，优先映射为前端一级路由。
  if (clean.startsWith("/admin/")) {
    const leaf = clean.slice("/admin/".length);
    if (leaf === "audit-logs") return "/audit-log";
    return `/${leaf}`;
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

export function setAccessFromMenus(menus: MenuNode[]) {
  const routes = new Set<string>();
  const permissions = new Set<string>();
  walkMenus(menus, routes, permissions);

  const snapshot: AccessSnapshot = {
    routes: [...routes],
    permissions: [...permissions],
  };
  sessionStorage.setItem(ACCESS_KEY, JSON.stringify(snapshot));

  if (typeof window !== "undefined" && import.meta.env.DEV) {
    // 联调期调试输出：快速确认后端菜单路由映射结果
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

/** 是否为后台已注册的前端路径（未知路径应由 404 承接，避免误判为无权限） */
export function isKnownAdminPath(pathname: string) {
  const clean = (pathname || "/").trim() || "/";
  if (clean === "/" || clean === "/403") return true;
  const first = clean.split("/").filter(Boolean)[0];
  return first != null && ADMIN_ROUTE_ROOTS.has(first);
}

export function hasRouteAccess(pathname: string) {
  const routes = getAccessSnapshot().routes;
  if (pathname === "/") return true;
  if (pathname === "/403") return true;
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
