import { createBrowserRouter, redirect } from "react-router";
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
import { getToken } from "./lib/auth";

function requireAuth() {
  if (!getToken()) {
    throw redirect("/login");
  }
  return null;
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
      { path: "*", Component: NotFound },
    ],
  },
]);
