import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Edit } from "lucide-react";
import { toast } from "sonner";
import { getRoleDetail, getRolePermissions, getUsers, updateRole, type RoleDetail as RoleDetailModel, type UserListItem } from "../api/admin";
import { formatDateTime } from "../lib/date";
import { adminRoutes } from "../lib/admin-routes";
import { parseFieldErrors } from "../lib/form";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

export default function RoleDetail() {
  const { id } = useParams();
  const roleId = Number(id);
  const [role, setRole] = useState<RoleDetailModel | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "1",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const canSave = useMemo(() => Boolean(form.name.trim()), [form.name]);

  const load = async () => {
    if (!roleId || Number.isNaN(roleId)) return;
    try {
      setLoading(true);
      const [detail, permissionResult, userResult] = await Promise.all([
        getRoleDetail(roleId),
        getRolePermissions(roleId),
        getUsers({ page: 1, per_page: 100, role_id: roleId }),
      ]);
      setRole(detail);
      setPermissions(permissionResult.permissions);
      setUsers(userResult.list);
      setForm({
        name: detail.name,
        description: detail.description || "",
        status: String(detail.status),
      });
      setFieldErrors({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "角色详情加载失败");
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [roleId]);

  const handleSave = async () => {
    if (!role || !canSave) return;
    try {
      setFieldErrors({});
      setSaving(true);
      const updated = await updateRole(role.id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        status: Number(form.status),
      });
      setRole(updated);
      setEditOpen(false);
      toast.success("角色信息已更新");
    } catch (error) {
      const nextErrors = parseFieldErrors(error);
      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors(nextErrors);
      }
      toast.error(error instanceof Error ? error.message : "角色更新失败");
    } finally {
      setSaving(false);
    }
  };

  if (!roleId || Number.isNaN(roleId)) {
    return <div className="text-[#00000073]">无效角色 ID</div>;
  }

  if (loading) {
    return <div className="text-[#00000073]">加载中...</div>;
  }

  if (!role) {
    return <div className="text-[#00000073]">角色不存在</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={adminRoutes.role}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{role.name}</h1>
            <p className="text-sm text-[#00000073] mt-1">角色ID: {role.id}</p>
          </div>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm" onClick={() => setEditOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          编辑角色
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div><div className="text-sm text-[#00000073] mb-1">角色名称</div><div className="text-base text-[#000000d9]">{role.name}</div></div>
            <div><div className="text-sm text-[#00000073] mb-1">角色编码</div><div className="text-base font-mono text-[#000000d9]">{role.code}</div></div>
            <div><div className="text-sm text-[#00000073] mb-1">角色说明</div><div className="text-base text-[#000000d9]">{role.description || "-"}</div></div>
          </div>
          <div className="space-y-4">
            <div><div className="text-sm text-[#00000073] mb-1">状态</div><Badge className={role.status === 1 ? "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]" : "bg-[#fff1f0] text-[#ff4d4f] border-[#ffccc7]"}>{role.status_label}</Badge></div>
            <div><div className="text-sm text-[#00000073] mb-1">类型</div>{role.is_system_preset ? <Badge variant="secondary">系统预置</Badge> : <Badge variant="outline">自定义</Badge>}</div>
            <div><div className="text-sm text-[#00000073] mb-1">用户数</div><div className="text-base text-[#000000d9]">{role.user_count}</div></div>
            <div><div className="text-sm text-[#00000073] mb-1">更新时间</div><div className="text-base text-[#000000d9]">{formatDateTime(role.updated_at)}</div></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-base font-medium text-[#000000d9] mb-4">已绑定权限</h3>
        <div className="flex flex-wrap gap-2">
          {permissions.length === 0 ? (
            <div className="text-[#00000073]">暂无权限</div>
          ) : (
            permissions.map((permission) => (
              <Badge key={permission} variant="outline" className="border-[#1890ff] text-[#1890ff]">
                {permission}
              </Badge>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-base font-medium text-[#000000d9] mb-4">绑定用户</h3>
        {users.length === 0 ? (
          <div className="text-[#00000073]">暂无绑定用户</div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between border rounded px-3 py-2 border-[#e8e8e8]">
                <span className="text-[#000000d9]">
                  {user.name}（{user.username}）
                </span>
                <Badge className={user.status === 1 ? "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]" : "bg-[#fff1f0] text-[#ff4d4f] border-[#ffccc7]"}>
                  {user.status_label}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>编辑角色</DialogTitle>
            <DialogDescription>角色编码不可修改</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>角色名称 *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((value) => ({ ...value, name: e.target.value }))}
                className={fieldErrors.name ? "border-red-500 focus-visible:ring-red-500" : undefined}
              />
              {fieldErrors.name ? <p className="text-xs text-red-500">{fieldErrors.name}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label>角色说明</Label>
              <Textarea value={form.description} onChange={(e) => setForm((value) => ({ ...value, description: e.target.value }))} />
              {fieldErrors.description ? <p className="text-xs text-red-500">{fieldErrors.description}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label>状态</Label>
              <Input
                value={form.status === "1" ? "启用" : "停用"}
                readOnly
                className="bg-[#fafafa] text-[#00000073]"
                title="状态请在角色列表页切换"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
            <Button className="bg-[#1890ff] hover:bg-[#40a9ff]" onClick={handleSave} disabled={!canSave || saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
