import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Ban,
  CheckCircle2,
  Key,
  Search,
  UserCog,
  UserPlus,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { createUser, getRoles, getUsers, updateUserStatus, type RoleOption, type UserListItem } from "../api/admin";
import { FilterSelect } from "../components/admin/FilterSelect";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { formatDateTime } from "../lib/date";
import { can } from "../lib/permission";

const emptyForm = {
  username: "",
  name: "",
  password: "",
  orgId: "",
  roleId: "",
  userType: "1",
};

function UserStatusBadge({ status, label }: { status: number; label: string }) {
  if (status === 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        <Ban className="w-3 h-3" />
        {label}
      </span>
    );
  }
  if (status === 2 || status === 4) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3 h-3" />
      {label}
    </span>
  );
}

export default function UserManagement() {
  const canCreateUser = can("admin:users:create");
  const canToggleUserStatus = can("admin:users:toggle-status");
  const [list, setList] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterOrg, setFilterOrg] = useState("all");
  const [filterUserType, setFilterUserType] = useState("all");
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const orgOptions = useMemo(
    () =>
      Array.from(new Set(list.map((item) => `${item.org_id}|${item.org_name}`))).map((entry) => {
        const [orgId, orgName] = entry.split("|");
        return { orgId, orgName };
      }),
    [list],
  );

  const allSelected = list.length > 0 && list.every((u) => selectedIds.includes(u.id));

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getUsers({
        page,
        per_page: 10,
        keyword: search || undefined,
        status: filterStatus === "all" ? undefined : Number(filterStatus),
        role_id: filterRole === "all" ? undefined : Number(filterRole),
        org_id: filterOrg === "all" ? undefined : filterOrg,
        user_type: filterUserType === "all" ? undefined : Number(filterUserType),
      });
      setList(data.list);
      setTotal(data.total);
      setLastPage(data.last_page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "用户列表加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function loadRoles() {
    try {
      const data = await getRoles({ page: 1, per_page: 100 });
      setRoleOptions(data.list.map((item) => ({ id: item.id, name: item.name, code: item.code })));
    } catch {
      toast.error("角色选项加载失败");
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [page, search, filterStatus, filterRole, filterOrg, filterUserType]);

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(list.map((item) => item.id));
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleChangeStatus = async (ids: number[], status: 1 | 2) => {
    if (ids.length === 0) return;
    try {
      await Promise.all(ids.map((id) => updateUserStatus(id, status)));
      toast.success(`已${status === 1 ? "启用" : "停用"} ${ids.length} 个用户`);
      setSelectedIds([]);
      loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "状态更新失败");
    }
  };

  const handleCreate = async () => {
    if (!form.username || !form.name || !form.password || !form.orgId || !form.roleId) {
      toast.error("请完整填写必填字段");
      return;
    }
    try {
      await createUser({
        username: form.username,
        name: form.name,
        password: form.password,
        user_type: Number(form.userType),
        org_id: form.orgId,
        role_ids: [Number(form.roleId)],
        project_ids: [],
      });
      toast.success("用户创建成功");
      setForm(emptyForm);
      setCreateOpen(false);
      setPage(1);
      loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建用户失败");
    }
  };

  const start = total === 0 ? 0 : (page - 1) * 10 + 1;
  const end = Math.min(page * 10, total);

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-10rem)] bg-white relative rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">用户管理</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="text-gray-700 border-gray-300"
              disabled={selectedIds.length === 0 || !canToggleUserStatus}
              onClick={() => handleChangeStatus(selectedIds, 2)}
            >
              批量停用
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              onClick={() => setCreateOpen(true)}
              disabled={!canCreateUser}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              新建用户
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative min-w-[280px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="搜索用户名 / 姓名"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
            />
          </div>
          <FilterSelect
            label="所属组织"
            value={filterOrg}
            onChange={(v) => {
              setFilterOrg(v);
              setPage(1);
            }}
            options={[
              { value: "all", label: "全部" },
              ...orgOptions.map((o) => ({ value: o.orgId, label: o.orgName })),
            ]}
          />
          <FilterSelect
            label="用户类型"
            value={filterUserType}
            onChange={(v) => {
              setFilterUserType(v);
              setPage(1);
            }}
            options={[
              { value: "all", label: "全部" },
              { value: "1", label: "内部员工" },
              { value: "2", label: "企业客户" },
            ]}
          />
          <FilterSelect
            label="角色"
            value={filterRole}
            onChange={(v) => {
              setFilterRole(v);
              setPage(1);
            }}
            options={[
              { value: "all", label: "全部" },
              ...roleOptions.map((r) => ({ value: String(r.id), label: r.name })),
            ]}
          />
          <FilterSelect
            label="状态"
            value={filterStatus}
            onChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
            options={[
              { value: "all", label: "全部" },
              { value: "1", label: "启用" },
              { value: "2", label: "停用" },
              { value: "3", label: "锁定" },
              { value: "4", label: "未激活" },
            ]}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              <th className="px-4 py-3 font-medium">用户名 / 姓名</th>
              <th className="px-4 py-3 font-medium">所属组织</th>
              <th className="px-4 py-3 font-medium">用户类型</th>
              <th className="px-4 py-3 font-medium">绑定角色</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">最近登录</th>
              <th className="px-4 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  加载中...
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  暂无数据
                </td>
              </tr>
            ) : (
              list.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <Checkbox checked={selectedIds.includes(user.id)} onCheckedChange={() => toggleOne(user.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <Link to={`/users/${user.id}`} className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                        {user.username}
                      </Link>
                      <span className="text-xs text-gray-500">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.org_name}</td>
                  <td className="px-4 py-3 text-gray-600">{user.user_type_label}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        user.roles.map((r) => (
                          <span
                            key={r.id}
                            className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs border border-indigo-100"
                          >
                            {r.name}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <UserStatusBadge status={user.status} label={user.status_label} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{formatDateTime(user.last_login_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 text-gray-400">
                      <Link
                        to={`/users/${user.id}`}
                        className="p-1 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors inline-flex"
                        title="编辑/详情"
                      >
                        <UserCog className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        className="p-1 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors disabled:opacity-40"
                        title={user.status === 1 ? "停用" : "启用"}
                        disabled={!canToggleUserStatus}
                        onClick={() => handleChangeStatus([user.id], user.status === 1 ? 2 : 1)}
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="重置密码（接口待定）"
                        onClick={() => toast.info("重置密码接口暂未对接")}
                      >
                        <Key className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-sm bg-white shrink-0">
        <span className="text-gray-500">
          共 {total} 条记录，当前显示 {start}-{end} 条
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
            disabled={page <= 1}
            onClick={() => setPage((v) => v - 1)}
          >
            上一页
          </button>
          <span className="px-3 py-1 border border-indigo-600 rounded text-white bg-indigo-600">{page}</span>
          <button
            type="button"
            className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
            disabled={page >= lastPage}
            onClick={() => setPage((v) => v + 1)}
          >
            下一页
          </button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>新建用户</DialogTitle>
            <DialogDescription>创建新用户账号并分配角色</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>用户名 *</Label>
                <Input value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>姓名 *</Label>
                <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>初始密码 *</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>用户类型</Label>
                <Select value={form.userType} onValueChange={(value) => setForm((prev) => ({ ...prev, userType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">内部员工</SelectItem>
                    <SelectItem value="2">企业客户</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>所属组织 *</Label>
                <Input value={form.orgId} onChange={(e) => setForm((prev) => ({ ...prev, orgId: e.target.value }))} placeholder="例如 org_001" />
              </div>
              <div className="grid gap-2">
                <Label>角色 *</Label>
                <Select value={form.roleId} onValueChange={(value) => setForm((prev) => ({ ...prev, roleId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              取消
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreate} disabled={!canCreateUser}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
