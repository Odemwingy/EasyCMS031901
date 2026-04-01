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
import { adminRoutes, platformRoutes } from "./lib/admin-routes";
import { WorkbenchView } from "./pages/platform/Workbench";
import { ContentCenterView } from "./pages/platform/ContentCenter";
import { CategoryTreeLayout } from "./pages/platform/CategoryTree";
import {
  CycleManageView,
  SignManageView,
  ChangeRequestView,
  PublishStatusView,
} from "./pages/platform/CyclePublish";
import {
  MediaReportView,
  ChangeReportView,
  QualityReportView,
  OperationReportView,
} from "./pages/platform/ReportCenter";
import { ModulePlaceholder } from "./pages/platform/ModulePlaceholder";
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
    throw redirect(platformRoutes.home);
  }
  return null;
}

function redirectTo(path: string) {
  return () => redirect(path);
}

/** v2 占位页：无接口的子路由统一落到静态说明 */
function platformPh(title: string) {
  function Route() {
    return <ModulePlaceholder title={title} />;
  }
  return Route;
}

function ContentCenterAll() {
  return <ContentCenterView type="all" />;
}
function ContentCenterVideo() {
  return <ContentCenterView type="video" />;
}
function ContentCenterAudio() {
  return <ContentCenterView type="audio" />;
}
function ContentCenterGame() {
  return <ContentCenterView type="game" />;
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
      { index: true, loader: redirectTo(platformRoutes.home) },
      {
        path: "workbench",
        children: [
          { index: true, loader: redirectTo("/workbench/my-todo") },
          { path: "my-todo", Component: WorkbenchView },
          { path: "*", Component: platformPh("工作台功能模块") },
        ],
      },
      {
        path: "content",
        children: [
          { index: true, loader: redirectTo("/content/all") },
          { path: "all", Component: ContentCenterAll },
          { path: "video", Component: ContentCenterVideo },
          { path: "audio", Component: ContentCenterAudio },
          { path: "game", Component: ContentCenterGame },
          { path: "*", Component: platformPh("内容中心功能模块") },
        ],
      },
      {
        path: "classification",
        children: [
          { index: true, loader: redirectTo("/classification/tree") },
          { path: "tree", Component: CategoryTreeLayout },
          { path: "*", Component: platformPh("分类与质量管理模块") },
        ],
      },
      {
        path: "cycle",
        children: [
          { index: true, loader: redirectTo("/cycle/cycle-manage") },
          { path: "cycle-manage", Component: CycleManageView },
          { path: "sign-manage", Component: SignManageView },
          { path: "changes", Component: ChangeRequestView },
          { path: "publish-status", Component: PublishStatusView },
          { path: "*", Component: platformPh("周期与发布管理模块") },
        ],
      },
      {
        path: "report",
        children: [
          { index: true, loader: redirectTo("/report/media") },
          { path: "media", Component: MediaReportView },
          { path: "change", Component: ChangeReportView },
          { path: "quality", Component: QualityReportView },
          { path: "operation", Component: OperationReportView },
          { path: "*", Component: platformPh("报表中心模块") },
        ],
      },
      {
        path: "config",
        children: [
          { index: true, loader: redirectTo("/config/profile") },
          { path: "*", Component: platformPh("配置中心模块") },
        ],
      },
      {
        path: "help",
        children: [
          { index: true, loader: redirectTo("/help/help-center") },
          { path: "*", Component: platformPh("帮助模块") },
        ],
      },
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
