/**
 * 与 ui/Content Management Platformv2 信息架构一致（二级侧栏与路由首段）。
 * 业务页面有接口则联调，无接口则由路由 * 落入占位页。
 */
export const PLATFORM_PRIMARY_IDS = [
  "workbench",
  "content",
  "classification",
  "cycle",
  "config",
  "report",
  "help",
] as const;

export type PlatformPrimaryId = (typeof PLATFORM_PRIMARY_IDS)[number];

export const PLATFORM_PRIMARY_SET = new Set<string>(PLATFORM_PRIMARY_IDS);

export const PLATFORM_ENTRY: Record<PlatformPrimaryId, string> = {
  workbench: "/workbench",
  content: "/content",
  classification: "/classification",
  cycle: "/cycle",
  config: "/config",
  report: "/report",
  help: "/help",
};

/** 与 v2 routes.tsx SECONDARY_NAV 对齐 */
export const SECONDARY_NAV: Record<PlatformPrimaryId, { id: string; label: string }[]> = {
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
  help: [
    { id: "help-center", label: "帮助中心" },
    { id: "editor", label: "编排工具" },
    { id: "ad-builder", label: "广告构建器（后续）" },
  ],
};
