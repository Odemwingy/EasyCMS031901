import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Copy, MoreHorizontal, Plus, PowerOff, Users } from "lucide-react";
import { toast } from "sonner";
import { copyRole, createRole, getRoles, updateRoleStatus, type RoleListItem } from "../api/admin";
import { formatDateTime } from "../lib/date";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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
import { Textarea } from "../components/ui/textarea";

const emptyForm = { name: "", code: "", description: "" };

export default function RoleManagement() {
  const [list, setList] = useState<RoleListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function loadRoles() {
    try {
      setLoading(true);
      const data = await getRoles({
        page,
        per_page: 10,
        keyword: search || undefined,
        status: filterStatus === "all" ? undefined : Number(filterStatus),
      });
      setList(data.list);
      setTotal(data.total);
      setLastPage(data.last_page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "角色列表加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, [page, search, filterStatus]);

  const handleCreate = async () => {
    if (!form.name || !form.code) {
      toast.error("请填写角色名称和角色编码");
      return;
    }
    try {
      await createRole({
        name: form.name,
        code: form.code,
        description: form.description || undefined,
        status: 1,
      });
      toast.success("角色创建成功");
      setForm(emptyForm);
      setCreateOpen(false);
      setPage(1);
      loadRoles();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建角色失败");
    }
  };

  const handleCopy = async (role: RoleListItem) => {
    try {
      const suffix = Date.now().toString().slice(-4);
      await copyRole(role.id, `${role.name}-副本`, `${role.code}_copy_${suffix}`);
      toast.success("角色复制成功");
      loadRoles();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "复制角色失败");
    }
  };

  const handleToggleStatus = async (role: RoleListItem) => {
    try {
      await updateRoleStatus(role.id, role.status === 1 ? 2 : 1);
      toast.success(`已${role.status === 1 ? "停用" : "启用"}角色：${role.name}`);
      loadRoles();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "角色状态更新失败");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-[#e8e8e8]">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Input
            placeholder="搜索角色名称/编码"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="角色状态" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="1">启用</SelectItem>
              <SelectItem value="2">停用</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-[#1890ff] hover:bg-[#40a9ff]" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />新建角色
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#fafafa] hover:bg-[#fafafa]">
              <TableHead>角色名称</TableHead>
              <TableHead>角色编码</TableHead>
              <TableHead>角色说明</TableHead>
              <TableHead>用户数</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>最近修改时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12 text-[#00000073]">加载中...</TableCell></TableRow>
            ) : list.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12 text-[#00000073]">暂无数据</TableCell></TableRow>
            ) : (
              list.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium"><Link to={`/roles/${role.id}`} className="text-[#1890ff] hover:underline">{role.name}</Link></TableCell>
                  <TableCell className="text-[#00000073] font-mono text-xs">{role.code}</TableCell>
                  <TableCell className="text-[#00000073] max-w-xs truncate">{role.description}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#00000073]" />{role.user_count}</div></TableCell>
                  <TableCell>
                    <Badge className={role.status === 1 ? "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]" : "bg-[#fff1f0] text-[#ff4d4f] border-[#ffccc7]"}>
                      {role.status_label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {role.is_system_preset ? (
                      <Badge variant="secondary">系统预置</Badge>
                    ) : (
                      <Badge variant="outline">自定义</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDateTime(role.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild><Link to={`/roles/${role.id}`}>查看详情</Link></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopy(role)}><Copy className="h-4 w-4 mr-2" />复制角色</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(role)}>
                          <PowerOff className="h-4 w-4 mr-2" />{role.status === 1 ? "停用角色" : "启用角色"}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>新建角色</DialogTitle>
            <DialogDescription>创建新角色并配置权限范围</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>角色名称 *</Label>
              <Input value={form.name} onChange={(e) => setForm((value) => ({ ...value, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>角色编码 *</Label>
              <Input value={form.code} onChange={(e) => setForm((value) => ({ ...value, code: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>角色说明</Label>
              <Textarea value={form.description} onChange={(e) => setForm((value) => ({ ...value, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
            <Button className="bg-[#1890ff] hover:bg-[#40a9ff]" onClick={handleCreate}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
