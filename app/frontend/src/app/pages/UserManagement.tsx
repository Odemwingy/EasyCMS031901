import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Download, MoreHorizontal, Plus, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { createUser, getRoles, getUsers, updateUserStatus, type RoleOption, type UserListItem } from "../api/admin";
import { formatDateTime } from "../lib/date";
import { Badge } from "../components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const statusBadge: Record<number, string> = {
  1: "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]",
  2: "bg-[#fff1f0] text-[#ff4d4f] border-[#ffccc7]",
  3: "bg-[#fff7e6] text-[#fa8c16] border-[#ffd591]",
  4: "bg-[#fafafa] text-[#00000073] border-[#d9d9d9]",
};

const emptyForm = {
  username: "",
  name: "",
  password: "",
  orgId: "",
  roleId: "",
  userType: "1",
};

export default function UserManagement() {
  const [list, setList] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterOrg, setFilterOrg] = useState("all");
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const orgOptions = useMemo(
    () => Array.from(new Set(list.map((item) => `${item.org_id}|${item.org_name}`))).map((entry) => {
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
  }, [page, search, filterStatus, filterRole, filterOrg]);

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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-[#e8e8e8]">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Input
            placeholder="搜索用户名/姓名"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select value={filterOrg} onValueChange={(value) => { setFilterOrg(value); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="所属组织" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部组织</SelectItem>
              {orgOptions.map((org) => (
                <SelectItem key={org.orgId} value={org.orgId}>{org.orgName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="账号状态" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="1">启用</SelectItem>
              <SelectItem value="2">停用</SelectItem>
              <SelectItem value="3">锁定</SelectItem>
              <SelectItem value="4">未激活</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRole} onValueChange={(value) => { setFilterRole(value); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="角色" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部角色</SelectItem>
              {roleOptions.map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-[#1890ff] hover:bg-[#40a9ff]" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />新建用户
          </Button>
          <Button variant="outline" disabled={selectedIds.length === 0} onClick={() => handleChangeStatus(selectedIds, 1)}>
            <Power className="h-4 w-4 mr-2" />批量启用
          </Button>
          <Button variant="outline" disabled={selectedIds.length === 0} onClick={() => handleChangeStatus(selectedIds, 2)}>
            <PowerOff className="h-4 w-4 mr-2" />批量停用
          </Button>
          <Button variant="outline" onClick={() => toast.info("导出接口暂未提供")}>
            <Download className="h-4 w-4 mr-2" />导出列表
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#fafafa] hover:bg-[#fafafa]">
              <TableHead className="w-12"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>所属组织</TableHead>
              <TableHead>角色数</TableHead>
              <TableHead>账号状态</TableHead>
              <TableHead>最近登录时间</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-12 text-[#00000073]">加载中...</TableCell></TableRow>
            ) : list.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-12 text-[#00000073]">暂无数据</TableCell></TableRow>
            ) : (
              list.map((user) => (
                <TableRow key={user.id}>
                  <TableCell><Checkbox checked={selectedIds.includes(user.id)} onCheckedChange={() => toggleOne(user.id)} /></TableCell>
                  <TableCell className="font-medium">
                    <Link to={`/users/${user.id}`} className="text-[#1890ff] hover:underline">{user.username}</Link>
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.org_name}</TableCell>
                  <TableCell><Badge variant="secondary">{user.roles.length}</Badge></TableCell>
                  <TableCell><Badge className={statusBadge[user.status] ?? "bg-[#fafafa] text-[#00000073]"}>{user.status_label}</Badge></TableCell>
                  <TableCell>{formatDateTime(user.last_login_at)}</TableCell>
                  <TableCell>{formatDateTime(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild><Link to={`/users/${user.id}`}>查看详情</Link></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStatus([user.id], user.status === 1 ? 2 : 1)}>
                          {user.status === 1 ? "停用" : "启用"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-[#e8e8e8]">
        <div className="text-sm text-[#00000073]">共 {total} 条记录，第 {page} / {lastPage} 页</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>上一页</Button>
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((value) => value + 1)}>下一页</Button>
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <SelectTrigger><SelectValue placeholder="请选择角色" /></SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
            <Button onClick={handleCreate} className="bg-[#1890ff] hover:bg-[#40a9ff]">确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
