import { createBrowserRouter, redirect, type LoaderFunctionArgs } from "react-router";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import UserDetail from "./pages/UserDetail";
import RoleManagement from "./pages/RoleManagement";
import RoleDetail from "./pages/RoleDetail";
import PermissionConfig from "./pages/PermissionConfig";
import MenuManagement from "./pages/MenuManagement";
import AuditLog from "./pages/AuditLog";
import NotificationConfig from "./pages/NotificationConfig";
import SystemParams from "./pages/SystemParams";
import NotFound from "./pages/NotFound";
import NoPermission from "./pages/NoPermission";
import { getCurrentUser, getCurrentUserMenus } from "./api/auth";
import { getToken, logoutToLogin } from "./lib/auth";
import { adminRoutes } from "./lib/admin-routes";
import {
  hasRouteAccess,
  isKnownAdminPath,
  setAccessFromMenus,
} from "./lib/permission";

async function requireAuth({ request }: LoaderFunctionArgs) {
  if (!getToken()) {
    throw redirect("/login");
  }
  try {
    await getCurrentUser();
    const menus = await getCurrentUserMenus();
    setAccessFromMenus(menus);

    const pathname = new URL(request.url).pathname;
    if (isKnownAdminPath(pathname) && !hasRouteAccess(pathname)) {
      throw redirect("/403");
    }
    return null;
  } catch (e) {
    if (e instanceof Response) {
      throw e;
    }
    logoutToLogin();
    throw redirect("/login");
  }
}

function redirectIfAuthed() {
  if (getToken()) {
    throw redirect(adminRoutes.user);
  }
  return null;
}

function redirectTo(path: string) {
  return () => redirect(path);
}

export const router = createBrowserRouter([
  {
    path: "/login",
    loader: redirectIfAuthed,
    Component: Login,
  },
  {
    path: "/",
    loader: requireAuth,
    Component: AdminLayout,
    children: [
      { index: true, loader: redirectTo(adminRoutes.user) },
      { path: "backend/user", Component: UserManagement },
      { path: "backend/user/:id", Component: UserDetail },
      { path: "backend/role", Component: RoleManagement },
      { path: "backend/role/:id", Component: RoleDetail },
      { path: "backend/permission", Component: PermissionConfig },
      { path: "backend/menu", Component: MenuManagement },
      { path: "backend/audit", Component: AuditLog },
      { path: "backend/notification", Component: NotificationConfig },
      { path: "backend/params", Component: SystemParams },
      { path: "users", loader: redirectTo(adminRoutes.user) },
      {
        path: "users/:id",
        loader: ({ params }) => redirect(`${adminRoutes.user}/${params.id ?? ""}`),
      },
      { path: "roles", loader: redirectTo(adminRoutes.role) },
      {
        path: "roles/:id",
        loader: ({ params }) => redirect(`${adminRoutes.role}/${params.id ?? ""}`),
      },
      { path: "permissions", loader: redirectTo(adminRoutes.permission) },
      { path: "menus", loader: redirectTo(adminRoutes.menu) },
      { path: "audit-log", loader: redirectTo(adminRoutes.audit) },
      { path: "notifications", loader: redirectTo(adminRoutes.notification) },
      { path: "system-params", loader: redirectTo(adminRoutes.params) },
      { path: "403", Component: NoPermission },
      { path: "*", Component: NotFound },
    ],
  },
]);
