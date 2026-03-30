import { useEffect, useMemo, useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import {
  Bell,
  Settings,
  Search,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Library,
  Network,
  RefreshCcw,
  BarChart3,
  ShieldCheck,
  HelpCircle,
  UserCircle,
  User,
  Settings as SettingsIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";
import { getCurrentUser, logout } from "../api/auth";
import { logoutToLogin } from "../lib/auth";
import { adminRoutes } from "../lib/admin-routes";
import { getAllowedRoutes, isKnownAdminPath } from "../lib/permission";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "./ui/utils";

/** 与 ui/Content Management Platform 信息架构一致；entryHref 为空表示阶段一尚未接入 */
type PrimaryNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  entryHref: string | null;
};

const PRIMARY_NAV: PrimaryNavItem[] = [
  { id: "workbench", label: "工作台", icon: LayoutDashboard, entryHref: null },
  { id: "content", label: "内容中心", icon: Library, entryHref: null },
  { id: "classification", label: "分类与质量", icon: Network, entryHref: null },
  { id: "cycle", label: "周期与发布", icon: RefreshCcw, entryHref: null },
  { id: "config", label: "配置中心", icon: Settings, entryHref: null },
  { id: "report", label: "报表中心", icon: BarChart3, entryHref: null },
  { id: "backend", label: "后台管理", icon: ShieldCheck, entryHref: adminRoutes.user },
  { id: "help", label: "帮助", icon: HelpCircle, entryHref: null },
];

/** 二级导航：与 ui/Content Management Platform 的 /backend/{segment} 一致 */
const BACKEND_SECONDARY: { id: string; label: string; path: string }[] = [
  { id: "user", label: "用户管理", path: adminRoutes.user },
  { id: "role", label: "角色管理", path: adminRoutes.role },
  { id: "permission", label: "权限配置", path: adminRoutes.permission },
  { id: "menu", label: "菜单管理", path: adminRoutes.menu },
  { id: "audit", label: "审计日志", path: adminRoutes.audit },
  { id: "notification", label: "通知中心", path: adminRoutes.notification },
  { id: "params", label: "系统参数", path: adminRoutes.params },
];

/** /backend 下第二段 → 列表页路径与面包屑文案 */
const BACKEND_CRUMB: Record<string, { label: string; listPath: string }> = {
  user: { label: "用户管理", listPath: adminRoutes.user },
  role: { label: "角色管理", listPath: adminRoutes.role },
  permission: { label: "权限配置", listPath: adminRoutes.permission },
  menu: { label: "菜单管理", listPath: adminRoutes.menu },
  audit: { label: "审计日志", listPath: adminRoutes.audit },
  notification: { label: "通知中心", listPath: adminRoutes.notification },
  params: { label: "系统参数", listPath: adminRoutes.params },
};

function isAdminAppPath(pathname: string) {
  if (pathname === "/" || pathname === "/403") return true;
  return isKnownAdminPath(pathname);
}

function getActivePrimaryId(pathname: string) {
  if (isAdminAppPath(pathname)) return "backend";
  return "backend";
}

function getActiveSecondaryId(pathname: string): string | null {
  const p = pathname.replace(/\/$/, "") || "/";
  const normalized = p === "/" ? adminRoutes.user : p;
  const hit = BACKEND_SECONDARY.find(
    (item) => normalized === item.path || normalized.startsWith(`${item.path}/`),
  );
  return hit?.id ?? null;
}

export default function AdminLayout() {
  const [searchValue, setSearchValue] = useState("");
  const [userName, setUserName] = useState("");
  const [orgContext, setOrgContext] = useState("global");
  const [cycleContext, setCycleContext] = useState("2026-q1");
  const [allowedMenuPaths] = useState<string[]>(() => getAllowedRoutes());
  const location = useLocation();

  const activePrimaryId = getActivePrimaryId(location.pathname);
  const activeSecondaryId = getActiveSecondaryId(location.pathname);
  const primaryTitle =
    PRIMARY_NAV.find((n) => n.id === activePrimaryId)?.label ?? "后台管理";

  const sidebarItems = useMemo(() => {
    if (activePrimaryId !== "backend") return [];
    return BACKEND_SECONDARY.filter((item) =>
      allowedMenuPaths.includes(item.path),
    );
  }, [activePrimaryId, allowedMenuPaths]);

  const breadcrumbs = useMemo(() => {
    const pathname = location.pathname;
    const out: { label: string; to?: string }[] = [{ label: "首页", to: adminRoutes.user }];

    if (pathname === "/403") {
      out.push({ label: "无访问权限" });
      return out;
    }

    if (!isAdminAppPath(pathname)) {
      if (pathname !== "/" && pathname !== "/403") {
        out.push({ label: "页面未找到" });
      } else {
        out.push({ label: "后台管理", to: adminRoutes.user });
        out.push({ label: "用户管理" });
      }
      return out;
    }

    const parts = pathname.split("/").filter(Boolean);

    if (parts[0] === "backend") {
      if (parts[1] && BACKEND_CRUMB[parts[1]]) {
        const meta = BACKEND_CRUMB[parts[1]];
        out.push({ label: "后台管理", to: adminRoutes.user });
        const isUserOrRoleDetail =
          parts.length > 2 && (parts[1] === "user" || parts[1] === "role");
        if (isUserOrRoleDetail) {
          out.push({ label: meta.label, to: meta.listPath });
          out.push({ label: parts[1] === "user" ? "用户详情" : "角色详情" });
        } else {
          out.push({ label: meta.label });
        }
        return out;
      }
      out.push({ label: "页面未找到" });
      return out;
    }

    if (parts[0] && ["users", "roles", "permissions", "menus", "audit-log", "notifications", "system-params"].includes(parts[0])) {
      out.push({ label: "后台管理", to: adminRoutes.user });
      out.push({ label: "跳转中…", to: undefined });
      return out;
    }

    if (pathname === "/" || parts.length === 0) {
      out.push({ label: "后台管理", to: adminRoutes.user });
      out.push({ label: "用户管理" });
    }

    return out;
  }, [location.pathname]);

  useEffect(() => {
    getCurrentUser()
      .then((user) => setUserName(user.name))
      .catch(() => {
        logoutToLogin();
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 全站搜索占位：后续对接统一检索接口
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // logout 接口失败时仍清理本地会话，避免僵尸登录态
    } finally {
      logoutToLogin();
      toast.success("已退出登录");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white text-gray-900 overflow-hidden font-sans">
      {/* TopBar — 对齐 ui/Content Management Platform */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-6 min-w-0">
          <Link
            to={adminRoutes.user}
            className="flex items-center gap-2 text-indigo-600 font-bold text-lg shrink-0"
          >
            <Library className="h-6 w-6 shrink-0" />
            <span className="truncate hidden sm:inline">地面内容管理平台</span>
          </Link>

          <div className="hidden lg:flex items-center gap-2 border-l border-gray-200 pl-6">
            <select
              className="text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none text-gray-700 font-medium cursor-pointer focus:ring-2 focus:ring-indigo-500 max-w-[180px]"
              aria-label="当前组织"
              value={orgContext}
              onChange={(e) => {
                setOrgContext(e.target.value);
                toast.message("组织上下文（演示）", {
                  description: "数据权限与组织联动接口尚未接入，此处仅同步设计稿交互。",
                });
              }}
            >
              <option value="global">组织: Global Org</option>
              <option value="apac">组织: APAC Region</option>
            </select>
            <select
              className="text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none text-gray-700 font-medium cursor-pointer focus:ring-2 focus:ring-indigo-500 max-w-[200px]"
              aria-label="当前周期"
              value={cycleContext}
              onChange={(e) => {
                setCycleContext(e.target.value);
                toast.message("周期上下文（演示）", {
                  description: "发布周期与任务看板尚未接入，选项仅作界面占位。",
                });
              }}
            >
              <option value="2026-q1">周期: 2026-Q1-Release</option>
              <option value="2026-q2">周期: 2026-Q2-Release</option>
            </select>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="全站搜索内容对象、配置或任务..."
              className="h-9 bg-gray-50 border-gray-200 rounded-md pl-10 pr-4 text-sm focus-visible:bg-white focus-visible:border-indigo-500 focus-visible:ring-indigo-500"
            />
          </form>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            type="button"
            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="通知（占位）"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer p-1 pr-2 hover:bg-gray-100 rounded-full transition-colors outline-none">
              <UserCircle className="h-7 w-7 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 hidden sm:inline max-w-[120px] truncate">
                {userName || "…"}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => toast.info("个人信息页面暂未接入")}
                className="cursor-pointer"
              >
                <User className="h-4 w-4 mr-2" />
                个人信息
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.info("偏好设置暂未接入")}
                className="cursor-pointer"
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                偏好设置
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* PrimaryNav */}
      <nav className="h-12 bg-gray-900 flex items-center px-4 overflow-x-auto shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-1 min-w-max">
          {PRIMARY_NAV.map((nav) => {
            const isActive = activePrimaryId === nav.id;
            const Icon = nav.icon;
            const inner = (
              <>
                <Icon className="h-4 w-4 shrink-0" />
                {nav.label}
              </>
            );
            const baseCls =
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors shrink-0";

            if (!nav.entryHref) {
              return (
                <span
                  key={nav.id}
                  className={cn(
                    baseCls,
                    "text-gray-500 cursor-not-allowed",
                  )}
                  title="暂未开放"
                >
                  {inner}
                </span>
              );
            }

            return (
              <Link
                key={nav.id}
                to={nav.entryHref}
                className={cn(
                  baseCls,
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800",
                )}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar：当前仅后台管理具备可用子路由 */}
        <aside className="w-56 bg-gray-50 border-r border-gray-200 overflow-y-auto flex flex-col shrink-0">
          <div className="p-4 py-3 border-b border-gray-200 bg-gray-50 sticky top-0">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              {primaryTitle}
            </h2>
          </div>
          <div className="p-2 flex-1 space-y-0.5">
            {activePrimaryId === "backend" &&
              sidebarItems.map((nav) => {
                const isActive = activeSecondaryId === nav.id;
                return (
                  <Link
                    key={nav.id}
                    to={nav.path}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    {nav.label}
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-indigo-500 shrink-0" />
                    )}
                  </Link>
                );
              })}
            {activePrimaryId !== "backend" && (
              <p className="px-3 py-2 text-xs text-gray-500">
                该模块路由尚未接入，请从顶部选择已开放区域。
              </p>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
          <div className="h-10 flex items-center px-6 text-sm text-gray-500 border-b border-gray-100 bg-white shrink-0 flex-wrap gap-y-1">
            {breadcrumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex items-center">
                {i > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-gray-400 shrink-0" />
                )}
                {c.to && i < breadcrumbs.length - 1 ? (
                  <Link
                    to={c.to}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span
                    className={
                      i === breadcrumbs.length - 1
                        ? "text-gray-900 font-medium"
                        : undefined
                    }
                  >
                    {c.label}
                  </span>
                )}
              </span>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
