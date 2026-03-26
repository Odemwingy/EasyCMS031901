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
    // 未注册路径不走菜单鉴权，交给通配子路由展示 404
    if (
      isKnownAdminPath(pathname) &&
      !hasRouteAccess(pathname)
    ) {
      throw redirect("/403");
    }
    return null;
  } catch (e) {
    // react-router 的 redirect() 会 throw Response；勿当作鉴权失败清会话
    if (e instanceof Response) {
      throw e;
    }
    logoutToLogin();
    throw redirect("/login");
  }
}

function redirectIfAuthed() {
  if (getToken()) {
    throw redirect("/");
  }
  return null;
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
      { index: true, Component: UserManagement },
      { path: "users", Component: UserManagement },
      { path: "users/:id", Component: UserDetail },
      { path: "roles", Component: RoleManagement },
      { path: "roles/:id", Component: RoleDetail },
      { path: "permissions", Component: PermissionConfig },
      { path: "menus", Component: MenuManagement },
      { path: "audit-log", Component: AuditLog },
      { path: "notifications", Component: NotificationConfig },
      { path: "system-params", Component: SystemParams },
      { path: "403", Component: NoPermission },
      { path: "*", Component: NotFound },
    ],
  },
]);
