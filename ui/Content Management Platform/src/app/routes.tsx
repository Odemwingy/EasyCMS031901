// Content Center Specific View
import { ContentCenterView } from "./pages/ContentCenter";
import { WorkbenchView } from "./pages/Workbench";
import { CategoryTreeLayout } from "./pages/CategoryTree";

// Backend Management Views
import { UserManagementView, RoleManagementView, AuditLogView } from "./pages/BackendManagement";

import { createBrowserRouter, Navigate, Outlet, useLocation, useNavigate, Link } from "react-router";
import { 
  LayoutDashboard, 
  Library, 
  Network, 
  RefreshCcw, 
  Settings, 
  BarChart3, 
  ShieldCheck, 
  HelpCircle,
  Search,
  Bell,
  UserCircle,
  Menu,
  ChevronRight,
  Filter,
  MoreHorizontal
} from "lucide-react";
import React, { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Data definitions
export const PRIMARY_NAV = [
  { id: "workbench", label: "工作台", icon: LayoutDashboard },
  { id: "content", label: "内容中心", icon: Library },
  { id: "classification", label: "分类与质量", icon: Network },
  { id: "cycle", label: "周期与发布", icon: RefreshCcw },
  { id: "config", label: "配置中心", icon: Settings },
  { id: "report", label: "报表中心", icon: BarChart3 },
  { id: "backend", label: "后台管理", icon: ShieldCheck },
  { id: "help", label: "帮助", icon: HelpCircle },
];

export const SECONDARY_NAV: Record<string, { id: string; label: string }[]> = {
  workbench: [
    { id: "my-todo", label: "我的待办" },
    { id: "milestones", label: "周期里程碑" },
    { id: "changes", label: "变更申请" },
    { id: "alerts", label: "异常提醒" },
    { id: "quick-links", label: "快捷入口" },
  ],
  content: [
    { id: "all", label: "全部内容" },
    { id: "video", label: "视频" },
    { id: "audio", label: "音频" },
    { id: "game", label: "游戏/应用" },
    { id: "book", label: "有声书/电子书" },
    { id: "service", label: "服务类/其他" },
    { id: "import", label: "导入中心" },
    { id: "import-history", label: "导入历史" },
    { id: "batch", label: "批量处理" },
    { id: "template", label: "编排模板" },
  ],
  classification: [
    { id: "tree", label: "分类树" },
    { id: "set", label: "分类集" },
    { id: "status", label: "状态清单" },
    { id: "exception", label: "异常处理" },
    { id: "validate", label: "完整性校验" },
    { id: "snapshot", label: "版本快照" },
  ],
  cycle: [
    { id: "cycle-manage", label: "周期管理" },
    { id: "sign-manage", label: "签核管理" },
    { id: "changes", label: "变更申请" },
    { id: "export-tasks", label: "导出任务" },
    { id: "export-list", label: "导出列表" },
    { id: "export-history", label: "导出历史" },
    { id: "export-diff", label: "导出差异" },
    { id: "publish-status", label: "发布状态" },
  ],
  config: [
    { id: "profile", label: "配置档" },
    { id: "set", label: "分类集配置" },
    { id: "media", label: "媒体配置" },
    { id: "routing", label: "路由管理" },
    { id: "group", label: "分组/层级结构" },
    { id: "system", label: "系统配置" },
    { id: "audio", label: "音频配置" },
    { id: "video", label: "视频配置" },
    { id: "image", label: "图片配置" },
    { id: "enable", label: "对象启用设置" },
    { id: "type", label: "类型配置" },
    { id: "preference", label: "偏好设置" },
    { id: "extend", label: "扩展配置" },
  ],
  report: [
    { id: "media", label: "媒体报表" },
    { id: "change", label: "变更报表" },
    { id: "quality", label: "质量报表" },
    { id: "operation", label: "操作报表" },
  ],
  backend: [
    { id: "user", label: "用户管理" },
    { id: "role", label: "角色管理" },
    { id: "permission", label: "权限配置" },
    { id: "audit", label: "审计日志" },
    { id: "notification", label: "通知中心" },
    { id: "params", label: "系统参数" },
  ],
  help: [
    { id: "help-center", label: "帮助中心" },
    { id: "editor", label: "编排工具" },
    { id: "ad-builder", label: "广告构建器（后续）" },
  ],
};

// Layout Components
function TopBar() {
  const location = useLocation();
  const activePrimary = location.pathname.split('/')[1] || 'workbench';

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg cursor-pointer">
          <Library className="h-6 w-6" />
          <span>地面内容管理平台</span>
        </div>
        
        {/* Project / Cycle Context Switcher */}
        <div className="hidden lg:flex items-center gap-2 border-l border-gray-200 pl-6">
          <select className="text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none text-gray-700 font-medium cursor-pointer focus:ring-2 ring-indigo-500">
            <option>组织: Global Org</option>
            <option>组织: APAC Region</option>
          </select>
          <select className="text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none text-gray-700 font-medium cursor-pointer focus:ring-2 ring-indigo-500">
            <option>周期: 2026-Q1-Release</option>
            <option>周期: 2026-Q2-Release</option>
          </select>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-8 hidden md:block">
        <div className="relative group">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="全站搜索内容对象、配置或任务..." 
            className="w-full h-9 bg-gray-50 border border-gray-200 rounded-md pl-10 pr-4 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div className="flex items-center gap-2 cursor-pointer p-1 pr-2 hover:bg-gray-100 rounded-full transition-colors">
          <UserCircle className="h-7 w-7 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
        </div>
      </div>
    </header>
  );
}

function PrimaryNav() {
  const location = useLocation();
  const activePrimary = location.pathname.split('/')[1] || 'workbench';

  return (
    <nav className="h-12 bg-gray-900 flex items-center px-4 overflow-x-auto no-scrollbar shrink-0">
      <div className="flex gap-1 min-w-max">
        {PRIMARY_NAV.map((nav) => {
          const isActive = activePrimary === nav.id;
          const Icon = nav.icon;
          return (
            <Link
              key={nav.id}
              to={`/${nav.id}`}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {nav.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Sidebar() {
  const location = useLocation();
  const activePrimary = location.pathname.split('/')[1] || 'workbench';
  const activeSecondary = location.pathname.split('/')[2];
  
  const navItems = SECONDARY_NAV[activePrimary] || [];

  return (
    <aside className="w-56 bg-gray-50 border-r border-gray-200 overflow-y-auto flex flex-col shrink-0">
      <div className="p-4 py-3 border-b border-gray-200 bg-gray-50 sticky top-0">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          {PRIMARY_NAV.find(n => n.id === activePrimary)?.label}
        </h2>
      </div>
      <div className="p-2 flex-1 space-y-0.5">
        {navItems.map((nav) => {
          const isActive = activeSecondary === nav.id;
          return (
            <Link
              key={nav.id}
              to={`/${activePrimary}/${nav.id}`}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors group",
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {nav.label}
              {isActive && <ChevronRight className="h-4 w-4 text-indigo-500" />}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

function Breadcrumbs() {
  const location = useLocation();
  const activePrimary = location.pathname.split('/')[1] || 'workbench';
  const activeSecondary = location.pathname.split('/')[2];
  
  const pLabel = PRIMARY_NAV.find(n => n.id === activePrimary)?.label;
  const sLabel = SECONDARY_NAV[activePrimary]?.find(n => n.id === activeSecondary)?.label;

  return (
    <div className="h-10 flex items-center px-6 text-sm text-gray-500 border-b border-gray-100 bg-white shrink-0">
      <Link to="/" className="hover:text-indigo-600 transition-colors">首页</Link>
      {pLabel && (
        <>
          <ChevronRight className="h-3.5 w-3.5 mx-1.5 flex-shrink-0" />
          <Link to={`/${activePrimary}`} className="hover:text-indigo-600 transition-colors">{pLabel}</Link>
        </>
      )}
      {sLabel && (
        <>
          <ChevronRight className="h-3.5 w-3.5 mx-1.5 flex-shrink-0" />
          <span className="text-gray-900 font-medium">{sLabel}</span>
        </>
      )}
    </div>
  );
}

function DashboardLayout() {
  return (
    <div className="flex flex-col h-screen w-full bg-white text-gray-900 font-sans overflow-hidden">
      <TopBar />
      <PrimaryNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
          <Breadcrumbs />
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

// Page Views Placeholder
function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="p-6 h-full flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Settings className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">
        此模块正在开发中，将根据《��品功能结构图与信息结构图 PRD》规范逐步完善相关业务功能。
      </p>
    </div>
  );
}

// Content Center Specific View
export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, element: <Navigate to="/workbench/my-todo" replace /> },
      
      {
        path: "workbench",
        children: [
          { index: true, element: <Navigate to="my-todo" replace /> },
          { path: "my-todo", element: <WorkbenchView /> },
          { path: "*", element: <PlaceholderView title="工作台功能模块" /> }
        ]
      },
      
      {
        path: "content",
        children: [
          { index: true, element: <Navigate to="all" replace /> },
          { path: "all", element: <ContentCenterView type="all" /> },
          { path: "video", element: <ContentCenterView type="video" /> },
          { path: "audio", element: <ContentCenterView type="audio" /> },
          { path: "game", element: <ContentCenterView type="game" /> },
          { path: "*", element: <PlaceholderView title="内容中心功能模块" /> }
        ]
      },
      
      {
        path: "classification",
        children: [
          { index: true, element: <Navigate to="tree" replace /> },
          { path: "tree", element: <CategoryTreeLayout /> },
          { path: "*", element: <PlaceholderView title="分类与质量管理模块" /> }
        ]
      },

      {
        path: "backend",
        children: [
          { index: true, element: <Navigate to="user" replace /> },
          { path: "user", element: <UserManagementView /> },
          { path: "role", element: <RoleManagementView /> },
          { path: "audit", element: <AuditLogView /> },
          { path: "*", element: <PlaceholderView title="后台管理系统模块" /> }
        ]
      },

      {
        path: ":primary/:secondary",
        element: <PlaceholderView title="业务模块" />
      },
      {
        path: ":primary",
        element: <PlaceholderView title="主模块" />
      }
    ],
  },
]);
