import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ChevronRight, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import {
  getRolePermissions,
  getRoles,
  updateRolePermissions,
  type RoleListItem,
} from "../api/admin";
import { getCurrentUserMenus, type CurrentUserMenu } from "../api/auth";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { cn } from "../components/ui/utils";

type OperationNode = {
  permission: string;
  name: string;
};

type PageNode = {
  id: string;
  name: string;
  operations: OperationNode[];
};

type ModuleNode = {
  id: string;
  name: string;
  pages: PageNode[];
};

function normalizeMenuTree(tree: CurrentUserMenu[]): ModuleNode[] {
  const modules: ModuleNode[] = [];

  const collectOperations = (nodes: CurrentUserMenu[]): OperationNode[] => {
    const items: OperationNode[] = [];
    nodes.forEach((node) => {
      if (node.permission && node.type === 3) {
        items.push({
          permission: node.permission,
          name: node.name,
        });
      }
      if (Array.isArray(node.children) && node.children.length > 0) {
        items.push(...collectOperations(node.children));
      }
    });
    return items;
  };

  tree.forEach((module) => {
    const pages: PageNode[] = [];
    if (Array.isArray(module.children) && module.children.length > 0) {
      module.children.forEach((page) => {
        const pageOperations = collectOperations([page]);
        pages.push({
          id: String(page.id),
          name: page.name,
          operations: pageOperations,
        });
      });
    } else {
      pages.push({
        id: String(module.id),
        name: module.name,
        operations: collectOperations([module]),
      });
    }
    modules.push({
      id: String(module.id),
      name: module.name,
      pages,
    });
  });

  return modules;
}

export default function PermissionConfig() {
  const [searchParams] = useSearchParams();
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [modules, setModules] = useState<ModuleNode[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string>("");
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [initialPermissions, setInitialPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedRole = useMemo(
    () => roles.find((role) => String(role.id) === selectedRoleId),
    [roles, selectedRoleId],
  );

  const activeModule = useMemo(
    () => modules.find((m) => m.id === activeModuleId),
    [modules, activeModuleId],
  );

  const isSystemAdminRole = useMemo(() => {
    if (!selectedRole) return false;
    return (
      selectedRole.name === "系统管理员" ||
      selectedRole.code === "system_admin" ||
      (selectedRole.is_system_preset && selectedRole.code.includes("system"))
    );
  }, [selectedRole]);

  const permissionCount = useMemo(() => {
    return modules.reduce(
      (total, module) => total + module.pages.reduce((count, page) => count + page.operations.length, 0),
      0,
    );
  }, [modules]);

  const selectedCount = permissions.size;

  const activeModuleOps = useMemo(() => {
    if (!activeModule) return [];
    return activeModule.pages.flatMap((p) => p.operations);
  }, [activeModule]);

  const activeModuleAllChecked =
    activeModuleOps.length > 0 && activeModuleOps.every((op) => permissions.has(op.permission));

  const togglePermission = (permission: string) => {
    if (isSystemAdminRole) return;
    setPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permission)) {
        next.delete(permission);
      } else {
        next.add(permission);
      }
      return next;
    });
  };

  const togglePage = (page: PageNode) => {
    if (isSystemAdminRole) return;
    const allChecked =
      page.operations.length > 0 && page.operations.every((op) => permissions.has(op.permission));
    setPermissions((prev) => {
      const next = new Set(prev);
      page.operations.forEach((op) => {
        if (allChecked) {
          next.delete(op.permission);
        } else {
          next.add(op.permission);
        }
      });
      return next;
    });
  };

  const toggleActiveModuleAll = () => {
    if (isSystemAdminRole || !activeModule) return;
    const allChecked = activeModuleAllChecked;
    setPermissions((prev) => {
      const next = new Set(prev);
      activeModuleOps.forEach((op) => {
        if (allChecked) {
          next.delete(op.permission);
        } else {
          next.add(op.permission);
        }
      });
      return next;
    });
  };

  const loadInitData = async () => {
    const [roleData, menus] = await Promise.all([
      getRoles({ page: 1, per_page: 100 }),
      getCurrentUserMenus(),
    ]);
    setRoles(roleData.list);
    const normalized = normalizeMenuTree(menus);
    setModules(normalized);
    const fromUrl = searchParams.get("roleId");
    if (fromUrl && roleData.list.some((r) => String(r.id) === fromUrl)) {
      setSelectedRoleId(fromUrl);
    } else if (roleData.list.length > 0) {
      setSelectedRoleId(String(roleData.list[0].id));
    }
    if (normalized.length > 0) {
      setActiveModuleId((cur) => {
        if (cur && normalized.some((m) => m.id === cur)) return cur;
        return normalized[0].id;
      });
    }
  };

  const loadRolePermissions = async (roleId: number) => {
    const data = await getRolePermissions(roleId);
    const next = new Set(data.permissions);
    setPermissions(next);
    setInitialPermissions(new Set(next));
  };

  useEffect(() => {
    setLoading(true);
    loadInitData()
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "权限配置初始化失败");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const rid = searchParams.get("roleId");
    if (rid && roles.some((r) => String(r.id) === rid)) {
      setSelectedRoleId(rid);
    }
  }, [searchParams, roles]);

  useEffect(() => {
    if (!selectedRoleId) return;
    setLoading(true);
    loadRolePermissions(Number(selectedRoleId))
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "角色权限加载失败");
      })
      .finally(() => setLoading(false));
  }, [selectedRoleId]);

  useEffect(() => {
    if (modules.length === 0) return;
    setActiveModuleId((cur) => {
      if (cur && modules.some((m) => m.id === cur)) return cur;
      return modules[0].id;
    });
  }, [modules]);

  const handleReset = () => {
    if (isSystemAdminRole) return;
    setPermissions(new Set(initialPermissions));
    toast.success("已重置为当前角色原始权限");
  };

  const handleSave = async () => {
    if (!selectedRoleId || isSystemAdminRole) return;
    try {
      setSaving(true);
      await updateRolePermissions(Number(selectedRoleId), Array.from(permissions));
      setInitialPermissions(new Set(permissions));
      toast.success("权限配置已保存");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "权限配置保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)] bg-white relative rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-14 border-b border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/roles"
            className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors shrink-0"
            title="返回角色列表"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Link>
          <div className="h-4 w-px bg-gray-300 shrink-0" />
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 truncate">
            <span className="truncate">配置权限</span>
            <span className="text-gray-400 font-normal shrink-0">/</span>
            <span className="text-indigo-700 truncate">{selectedRole?.name ?? "—"}</span>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs text-gray-500 hidden sm:inline">角色</span>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="w-48 h-9 border-gray-300 focus:ring-indigo-500">
                <SelectValue placeholder="请选择角色" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700"
            onClick={handleReset}
            disabled={saving || loading || isSystemAdminRole}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            onClick={handleSave}
            disabled={!selectedRoleId || saving || loading || isSystemAdminRole}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSystemAdminRole ? "系统管理员默认全权限" : saving ? "保存中..." : "保存配置"}
          </Button>
        </div>
      </div>

      {isSystemAdminRole && (
        <div className="px-6 py-2 text-xs text-amber-700 bg-amber-50 border-b border-amber-100">
          系统管理员为内置最高权限角色，默认拥有全部权限，禁止在此页面修改。
        </div>
      )}

      <div className="flex-1 flex overflow-hidden min-h-[480px]">
        <div className="w-72 border-r border-gray-200 bg-gray-50/50 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200 font-medium text-sm text-gray-700 bg-gray-50">选择功能模块</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {modules.map((module) => {
              const moduleOps = module.pages.flatMap((p) => p.operations);
              const allOn =
                moduleOps.length > 0 && moduleOps.every((op) => permissions.has(op.permission));
              const partial =
                moduleOps.some((op) => permissions.has(op.permission)) && !allOn;
              const isActive = activeModuleId === module.id;
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => setActiveModuleId(module.id)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm text-left",
                    isActive ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ChevronRight className={cn("w-4 h-4 shrink-0 text-gray-400", isActive && "rotate-90 text-indigo-500")} />
                    <span className="truncate">{module.name}</span>
                  </div>
                  {allOn ? (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="模块已全选" />
                  ) : partial ? (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" title="部分授权" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">
          <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3 bg-white shrink-0">
            <h3 className="font-bold text-gray-800">
              {activeModule ? `${activeModule.name} 权限明细` : "权限明细"}
            </h3>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <Checkbox
                checked={activeModuleAllChecked}
                onCheckedChange={toggleActiveModuleAll}
                disabled={isSystemAdminRole || !activeModule || activeModuleOps.length === 0}
              />
              全选本模块
            </label>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {loading ? (
              <div className="text-gray-500">加载中...</div>
            ) : !activeModule ? (
              <div className="text-gray-500">暂无模块数据</div>
            ) : (
              <>
                <p className="text-xs text-gray-500 -mt-2">
                  已选权限 {selectedCount} / {permissionCount}
                </p>
                {activeModule.pages.map((page) => {
                  const pageChecked =
                    page.operations.length > 0 && page.operations.every((op) => permissions.has(op.permission));
                  return (
                    <div
                      key={page.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
                    >
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center gap-3">
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <Checkbox
                              checked={pageChecked}
                              onCheckedChange={() => togglePage(page)}
                              disabled={isSystemAdminRole || page.operations.length === 0}
                            />
                            <span className="truncate">{page.name}</span>
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 pl-7">菜单操作权限</p>
                        </div>
                      </div>
                      <div className="p-5 pl-11 flex flex-wrap gap-4">
                        {page.operations.length === 0 ? (
                          <span className="text-sm text-gray-500">暂无操作项</span>
                        ) : (
                          page.operations.map((op) => (
                            <label
                              key={op.permission}
                              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-indigo-600"
                            >
                              <Checkbox
                                checked={permissions.has(op.permission)}
                                onCheckedChange={() => togglePermission(op.permission)}
                                disabled={isSystemAdminRole}
                              />
                              {op.name}
                              <span className="text-xs text-gray-400 font-mono">({op.permission})</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                    <h4 className="font-bold text-gray-900 text-sm">数据范围</h4>
                    <p className="text-xs text-gray-500 mt-1">以下为占位项，随后续数据权限模型接入</p>
                  </div>
                  <div className="p-5 pl-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox id="scope-all-p" disabled />
                      <label htmlFor="scope-all-p" className="text-sm text-gray-500">
                        全部数据
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="scope-org-p" disabled />
                      <label htmlFor="scope-org-p" className="text-sm text-gray-500">
                        所属组织数据
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="scope-project-p" defaultChecked disabled />
                      <label htmlFor="scope-project-p" className="text-sm text-gray-500">
                        所属项目数据
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="scope-self-p" disabled />
                      <label htmlFor="scope-self-p" className="text-sm text-gray-500">
                        本人创建数据
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
