import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Edit, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { getRoles, getUserDetail, updateUser, updateUserStatus, type RoleOption, type UserDetail as UserDetailModel } from "../api/admin";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const statusBadge: Record<number, string> = {
  1: "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]",
  2: "bg-[#fff1f0] text-[#ff4d4f] border-[#ffccc7]",
  3: "bg-[#fff7e6] text-[#fa8c16] border-[#ffd591]",
  4: "bg-[#fafafa] text-[#00000073] border-[#d9d9d9]",
};

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = Number(id);
  const [user, setUser] = useState<UserDetailModel | null>(null);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [disableConfirmOpen, setDisableConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    org_id: "",
    user_type: "1",
    role_ids: [] as string[],
    remark: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const canSubmit = useMemo(() => {
    return Boolean(editForm.name.trim() && editForm.org_id.trim() && editForm.role_ids.length > 0);
  }, [editForm]);

  const load = async () => {
    if (!userId || Number.isNaN(userId)) return;
    try {
      setLoading(true);
      const [detail, roleList] = await Promise.all([getUserDetail(userId), getRoles({ page: 1, per_page: 100 })]);
      setUser(detail);
      setRoleOptions(roleList.list.map((item) => ({ id: item.id, name: item.name, code: item.code })));
      setEditForm({
        name: detail.name,
        org_id: detail.org_id,
        user_type: String(detail.user_type),
        role_ids: detail.roles.map((role) => String(role.id)),
        remark: detail.remark || "",
      });
      setFieldErrors({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "用户详情加载失败");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  if (!userId || Number.isNaN(userId)) {
    return <div className="text-[#00000073]">无效用户 ID</div>;
  }

  if (loading) {
    return <div className="text-[#00000073]">加载中...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-[#00000073] text-lg">用户不存在（ID: {id}）</p>
        <Button variant="outline" onClick={() => navigate(adminRoutes.user)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回用户列表
        </Button>
      </div>
    );
  }

  const handleToggleStatus = async () => {
    try {
      const nextStatus = user.status === 1 ? 2 : 1;
      await updateUserStatus(user.id, nextStatus);
      toast.success(`账号已${nextStatus === 1 ? "启用" : "停用"}`);
      setDisableConfirmOpen(false);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "状态更新失败");
    }
  };

  const handleSave = async () => {
    if (!canSubmit) {
      setFieldErrors({
        name: editForm.name.trim() ? "" : "请输入姓名",
        org_id: editForm.org_id.trim() ? "" : "请输入所属组织 ID",
        role_ids: editForm.role_ids.length > 0 ? "" : "请选择角色",
      });
      toast.error("请完整填写必填字段");
      return;
    }
    try {
      setFieldErrors({});
      setSaving(true);
      const updated = await updateUser(user.id, {
        name: editForm.name.trim(),
        user_type: Number(editForm.user_type),
        org_id: editForm.org_id.trim(),
        role_ids: editForm.role_ids.map((value) => Number(value)),
        project_ids: user.project_ids,
        remark: editForm.remark.trim() || undefined,
      });
      setUser(updated);
      setEditOpen(false);
      toast.success("用户信息已更新");
    } catch (error) {
      const nextErrors = parseFieldErrors(error);
      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors(nextErrors);
      }
      toast.error(error instanceof Error ? error.message : "用户更新失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={adminRoutes.user}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {user.name}
              <span className="ml-2 text-sm text-[#00000073] font-normal">@{user.username}</span>
            </h1>
            <p className="text-sm text-[#00000073] mt-0.5">用户ID: {user.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-[#d9d9d9]" onClick={() => setDisableConfirmOpen(true)}>
            {user.status === 1 ? (
              <>
                <PowerOff className="h-4 w-4 mr-2" />
                停用账号
              </>
            ) : (
              <>
                <Power className="h-4 w-4 mr-2" />
                启用账号
              </>
            )}
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm" onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            编辑用户
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-5">
            <div><div className="text-sm text-[#00000073] mb-1">用户名</div><div className="text-base text-[#000000d9]">{user.username}</div></div>
            <div><div className="text-sm text-[#00000073] mb-1">姓名</div><div className="text-base text-[#000000d9]">{user.name}</div></div>
            <div><div className="text-sm text-[#00000073] mb-1">用户类型</div><div className="text-base text-[#000000d9]">{user.user_type_label}</div></div>
            <div><div className="text-sm text-[#00000073] mb-1">所属组织</div><div className="text-base text-[#000000d9]">{user.org_name}</div></div>
            <div><div className="text-sm text-[#00000073] mb-1">角色</div><div className="text-base text-[#000000d9]">{user.roles.map((role) => role.name).join("、") || "-"}</div></div>
          </div>
          <div className="space-y-5">
            <div><div className="text-sm text-[#00000073] mb-1">账号状态</div><Badge className={statusBadge[user.status] ?? "bg-[#fafafa] text-[#00000073]"}>{user.status_label}</Badge></div>
            <div><div className="text-sm text-[#00000073] mb-1">是否强制改密</div><div className="text-base text-[#000000d9]">{user.must_change_password ? "是" : "否"}</div></div>
            <div><div className="text-sm text-[#00000073] mb-1">登录失败次数</div><div className="text-base text-[#000000d9]">{user.login_fail_count}</div></div>
            <div><div className="text-sm text-[#00000073] mb-1">最近登录时间</div><div className="text-base text-[#000000d9]">{formatDateTime(user.last_login_at)}</div></div>
            <div><div className="text-sm text-[#00000073] mb-1">创建时间</div><div className="text-base text-[#000000d9]">{formatDateTime(user.created_at)}</div></div>
          </div>
        </div>
      </div>

      <AlertDialog open={disableConfirmOpen} onOpenChange={setDisableConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认{user.status === 1 ? "停用" : "启用"}账号？</AlertDialogTitle>
            <AlertDialogDescription>
              {user.status === 1 ? `停用后用户「${user.name}」将无法登录。` : `启用后用户「${user.name}」可恢复登录。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className={user.status === 1 ? "bg-red-500 hover:bg-red-600" : ""} onClick={handleToggleStatus}>
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>用户名不可修改，保存后将刷新详情数据</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>姓名 *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className={fieldErrors.name ? "border-red-500 focus-visible:ring-red-500" : undefined}
              />
              {fieldErrors.name ? <p className="text-xs text-red-500">{fieldErrors.name}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label>所属组织 ID *</Label>
              <Input
                value={editForm.org_id}
                onChange={(e) => setEditForm((f) => ({ ...f, org_id: e.target.value }))}
                className={fieldErrors.org_id ? "border-red-500 focus-visible:ring-red-500" : undefined}
              />
              {fieldErrors.org_id ? <p className="text-xs text-red-500">{fieldErrors.org_id}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label>用户类型 *</Label>
              <Select value={editForm.user_type} onValueChange={(value) => setEditForm((f) => ({ ...f, user_type: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">内部员工</SelectItem>
                  <SelectItem value="2">企业客户</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>角色 *</Label>
              <Select
                value={editForm.role_ids[0] || ""}
                onValueChange={(value) => setEditForm((f) => ({ ...f, role_ids: value ? [value] : [] }))}
              >
                <SelectTrigger><SelectValue placeholder="请选择角色" /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.role_ids ? <p className="text-xs text-red-500">{fieldErrors.role_ids}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label>备注</Label>
              <Input value={editForm.remark} onChange={(e) => setEditForm((f) => ({ ...f, remark: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={!canSubmit || saving} className="bg-[#1890ff] hover:bg-[#40a9ff]">
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
