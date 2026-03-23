import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import {
  getMenuTree,
  getRolePermissions,
  getRoles,
  updateRolePermissions,
  type MenuTreeItem,
  type RoleListItem,
} from "../api/admin";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ScrollArea } from "../components/ui/scroll-area";

function flattenPermissions(tree: MenuTreeItem[]): string[] {
  const result: string[] = [];
  const stack = [...tree];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;
    if (node.permission && node.type === 3) {
      result.push(node.permission);
    }
    stack.push(...node.children);
  }
  return result;
}

export default function PermissionConfig() {
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [tree, setTree] = useState<MenuTreeItem[]>([]);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const permissionItems = useMemo(() => flattenPermissions(tree), [tree]);

  const loadRoles = async () => {
    const data = await getRoles({ page: 1, per_page: 100 });
    setRoles(data.list);
    if (data.list.length > 0) {
      setSelectedRoleId(String(data.list[0].id));
    }
  };

  const loadMenuTree = async () => {
    const data = await getMenuTree(false);
    setTree(data);
  };

  const loadRolePermissions = async (roleId: number) => {
    setLoading(true);
    try {
      const data = await getRolePermissions(roleId);
      setPermissions(new Set(data.permissions));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([loadRoles(), loadMenuTree()]).catch((error) => {
      toast.error(error instanceof Error ? error.message : "权限配置初始化失败");
    });
  }, []);

  useEffect(() => {
    if (!selectedRoleId) return;
    loadRolePermissions(Number(selectedRoleId)).catch((error) => {
      toast.error(error instanceof Error ? error.message : "角色权限加载失败");
    });
  }, [selectedRoleId]);

  const togglePermission = (permission: string) => {
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

  const toggleAll = () => {
    setPermissions((prev) => {
      if (prev.size === permissionItems.length) {
        return new Set();
      }
      return new Set(permissionItems);
    });
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    try {
      setSaving(true);
      await updateRolePermissions(Number(selectedRoleId), Array.from(permissions));
      toast.success("权限配置已保存");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "权限配置保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-[#e8e8e8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#000000d9]">选择角色：</span>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="w-64 border-[#d9d9d9]">
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
          <Button className="bg-[#1890ff] hover:bg-[#40a9ff]" onClick={handleSave} disabled={!selectedRoleId || saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "保存中..." : "保存配置"}
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <Checkbox checked={permissionItems.length > 0 && permissions.size === permissionItems.length} onCheckedChange={toggleAll} />
          <span className="text-sm text-[#000000d9]">
            全选按钮权限（共 {permissionItems.length} 项，已选 {permissions.size} 项）
          </span>
        </div>
        <ScrollArea className="h-[calc(100vh-340px)]">
          {loading ? (
            <div className="text-[#00000073] py-12 text-center">加载中...</div>
          ) : permissionItems.length === 0 ? (
            <div className="text-[#00000073] py-12 text-center">暂无可配置权限</div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {permissionItems.map((permission) => (
                <label
                  key={permission}
                  className="flex items-center gap-2 rounded border border-[#e8e8e8] px-3 py-2 cursor-pointer hover:bg-[#fafafa]"
                >
                  <Checkbox checked={permissions.has(permission)} onCheckedChange={() => togglePermission(permission)} />
                  <span className="text-sm text-[#000000d9]">{permission}</span>
                </label>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
