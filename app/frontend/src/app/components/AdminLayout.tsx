import { useEffect, useMemo, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  Users,
  Shield,
  Key,
  ListTree,
  FileText,
  Bell,
  Settings,
  Menu,
  Search,
  ChevronRight,
  Home,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { getCurrentUser, getCurrentUserMenus, logout } from "../api/auth";
import { clearToken } from "../lib/auth";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

const defaultMenuItems = [
  { path: "/users", label: "用户管理", icon: Users },
  { path: "/roles", label: "角色管理", icon: Shield },
  { path: "/permissions", label: "权限配置", icon: Key },
  { path: "/menus", label: "菜单管理", icon: ListTree },
  { path: "/audit-log", label: "审计日志", icon: FileText },
  { path: "/notifications", label: "通知配置", icon: Bell },
  { path: "/system-params", label: "系统参数", icon: Settings },
];

const topNavItems = [
  { key: "workbench", label: "工作台", href: "#" },
  { key: "content", label: "内容中心", href: "#" },
  { key: "cycle", label: "周期管理", href: "#" },
  { key: "report", label: "报表中心", href: "#" },
  { key: "config", label: "配置中心", href: "#" },
  { key: "admin", label: "后台管理", href: "/" },
  { key: "editor", label: "编排工具", href: "#" },
  { key: "help", label: "帮助中心", href: "#" },
];

// 路径到面包屑标签的映射
const pathLabelMap: Record<string, string> = {
  users: "用户管理",
  roles: "角色管理",
  permissions: "权限配置",
  menus: "菜单管理",
  "audit-log": "审计日志",
  notifications: "通知配置",
  "system-params": "系统参数",
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [userName, setUserName] = useState("");
  const [allowedMenuPaths, setAllowedMenuPaths] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  // 判断当前顶部导航是否激活（仅后台管理模块）
  const isAdminActive = (key: string) => key === "admin";

  // 生成面包屑（去掉"后台管理"重复项）
  const getBreadcrumbs = () => {
    const segments = location.pathname.split("/").filter(Boolean);
    const crumbs: { label: string; path: string }[] = [];

    if (segments.length === 0) {
      crumbs.push({ label: "用户管理", path: "/users" });
      return crumbs;
    }

    const firstSeg = segments[0];
    const label = pathLabelMap[firstSeg];
    if (label) {
      crumbs.push({ label, path: `/${firstSeg}` });
    }

    // 详情页：追加用户名/角色名占位
    if (segments.length > 1) {
      const detailLabel =
        firstSeg === "users" ? "用户详情" : firstSeg === "roles" ? "角色详情" : segments[1];
      crumbs.push({ label: detailLabel, path: location.pathname });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const menuItems = useMemo(() => {
    if (allowedMenuPaths.length === 0) return defaultMenuItems;
    return defaultMenuItems.filter(
      (item) =>
        allowedMenuPaths.includes(item.path) ||
        item.path === "/menus" ||
        item.path === "/notifications" ||
        item.path === "/system-params",
    );
  }, [allowedMenuPaths]);

  useEffect(() => {
    getCurrentUser()
      .then((user) => setUserName(user.name))
      .catch(() => {
        clearToken();
        navigate("/login", { replace: true });
      });
    getCurrentUserMenus()
      .then((menus) => {
        const paths = menus
          .map((menu) => menu.route_path || "")
          .filter((path): path is string => path.startsWith("/"));
        setAllowedMenuPaths(paths);
      })
      .catch(() => {
        // 菜单接口失败时回退到默认菜单，不阻塞页面
        setAllowedMenuPaths([]);
      });
  }, [navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 全局搜索占位（后续对接接口）
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // logout 接口失败时仍清理本地会话，避免僵尸登录态
    } finally {
      clearToken();
      toast.success("已退出登录");
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="flex items-center h-12 px-6 gap-1">
          {topNavItems.map((item) => {
            const active = isAdminActive(item.key);
            return (
              <button
                key={item.key}
                onClick={() => item.href !== "#" && navigate(item.href)}
                className={`text-sm px-3 py-2 rounded-none transition-colors ${
                  active
                    ? "text-[#1890ff] border-b-2 border-[#1890ff] -mb-[1px]"
                    : "text-[#000000d9] hover:text-[#1890ff]"
                } ${item.href === "#" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={item.href === "#"}
                title={item.href === "#" ? "暂未开放" : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex h-[calc(100vh-49px)]">
        {/* 左侧菜单 */}
        <div
          className={`bg-[#001529] transition-all duration-300 flex-shrink-0 ${
            collapsed ? "w-16" : "w-56"
          }`}
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-[#ffffff1a]">
            {!collapsed && (
              <h1 className="text-white text-base font-medium truncate">后台管理</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-[#ffffff1a] flex-shrink-0"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-113px)]">
            <nav className="p-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === "/users"
                    ? location.pathname === "/" ||
                      location.pathname.startsWith("/users")
                    : location.pathname.startsWith(item.path);

                return (
                  <Link key={item.path} to={item.path}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                        isActive
                          ? "bg-[#1890ff] text-white"
                          : "text-[#ffffffa6] hover:bg-[#ffffff1a] hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <span className="text-sm truncate">{item.label}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* 面包屑和搜索栏 */}
          <div className="bg-white border-b border-[#e8e8e8] px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/">
                        <Home className="h-4 w-4" />
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center">
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                      </BreadcrumbSeparator>
                      <BreadcrumbItem>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.path}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#00000073]">{userName ? `当前用户：${userName}` : "当前用户"}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  退出登录
                </Button>
              </div>
            </div>

            <form onSubmit={handleSearch} className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00000073]" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="搜索用户、角色、权限..."
                className="pl-10 bg-[#fafafa] border-[#d9d9d9] focus-visible:ring-[#1890ff]"
              />
            </form>
          </div>

          {/* 页面内容 */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#f5f5f5]">
            <div className="p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
