import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Copy, MoreHorizontal, Plus, PowerOff, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { copyRole, createRole, getRoles, updateRoleStatus, type RoleListItem } from "../api/admin";
import { FilterSelect } from "../components/admin/FilterSelect";
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
import { Textarea } from "../components/ui/textarea";
import { formatDateTime } from "../lib/date";
import { can } from "../lib/permission";
import { cn } from "../components/ui/utils";

const emptyForm = { name: "", code: "", description: "" };

export default function RoleManagement() {
  const canCreateRole = can("admin:roles:create");
  const canCopyRole = can("admin:roles:create");
  const canToggleRoleStatus = can("admin:roles:toggle-status");
  const canAssignPermissions = can("admin:roles:assign-permissions");
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
        per_page: 12,
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

  const start = total === 0 ? 0 : (page - 1) * 12 + 1;
  const end = Math.min(page * 12, total);

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-10rem)] bg-white relative rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex flex-nowrap justify-between items-center gap-4 mb-4 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 shrink-0">角色管理</h2>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shrink-0 whitespace-nowrap"
            onClick={() => setCreateOpen(true)}
            disabled={!canCreateRole}
          >
            <Plus className="w-4 h-4 mr-2" />
            新建角色
          </Button>
        </div>
        <div className="flex flex-nowrap gap-3 items-center min-w-0 overflow-x-auto pb-0.5 [scrollbar-width:thin]">
          <div className="relative min-w-[200px] max-w-md flex-1 shrink-0">
            <Input
              placeholder="搜索角色名称 / 编码"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="pl-3 bg-gray-50 border-gray-300 focus-visible:ring-indigo-500"
            />
          </div>
          <div className="shrink-0">
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
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="text-center py-16 text-gray-500">加载中...</div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-gray-500">暂无数据</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {list.map((role) => (
              <div
                key={role.id}
                className="flex flex-col bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group min-w-0"
              >
                <div className="flex justify-between items-start gap-2 mb-3 min-w-0">
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link
                        to={`/roles/${role.id}`}
                        className="font-bold text-gray-900 hover:text-indigo-600 truncate min-w-0"
                        title={role.name}
                      >
                        {role.name}
                      </Link>
                      {role.is_system_preset && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded border border-blue-100 shrink-0 whitespace-nowrap">
                          预置
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-mono truncate" title={role.code}>
                      {role.code}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className="p-1 text-gray-400 hover:text-gray-900 rounded hover:bg-gray-100 shrink-0" aria-label="更多操作">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/roles/${role.id}`}>查看详情</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopy(role)} disabled={!canCopyRole}>
                        <Copy className="h-4 w-4 mr-2" />
                        复制角色
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(role)} disabled={!canToggleRoleStatus}>
                        <PowerOff className="h-4 w-4 mr-2" />
                        {role.status === 1 ? "停用角色" : "启用角色"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{role.description || "暂无说明"}</p>

                <div className="flex flex-nowrap items-center justify-between pt-4 border-t border-gray-100 mt-auto gap-3 min-w-0">
                  <div className="flex items-center gap-4 text-xs min-w-0 shrink">
                    <div className="flex items-center gap-1.5 text-gray-600 whitespace-nowrap shrink-0">
                      <Users className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>
                        <span className="font-medium tabular-nums">{role.user_count}</span>
                        <span className="ml-0.5">人</span>
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 whitespace-nowrap shrink-0",
                        role.status === 1 ? "text-emerald-600" : "text-gray-400",
                      )}
                    >
                      <div className={cn("w-2 h-2 rounded-full shrink-0", role.status === 1 ? "bg-emerald-500" : "bg-gray-300")} />
                      {role.status === 1 ? "启用" : "停用"}
                    </div>
                  </div>
                  {canAssignPermissions ? (
                    <Link
                      to={`/permissions?roleId=${role.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 whitespace-nowrap"
                    >
                      <Shield className="w-4 h-4 shrink-0" />
                      权限配置
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap opacity-0 group-hover:opacity-100">
                      无配置权限
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-2 whitespace-nowrap truncate" title={`更新 ${formatDateTime(role.updated_at)}`}>
                  更新 {formatDateTime(role.updated_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 flex flex-nowrap items-center justify-between gap-3 text-sm bg-white shrink-0 min-w-0 overflow-x-auto">
        <span className="text-gray-500 whitespace-nowrap shrink-0">
          共 {total} 条记录，当前显示 {start}-{end} 条
        </span>
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            上一页
          </button>
          <span className="px-3 py-1 border border-indigo-600 rounded text-white bg-indigo-600">{page}</span>
          <button
            type="button"
            className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
            disabled={page >= lastPage}
            onClick={() => setPage((value) => value + 1)}
          >
            下一页
          </button>
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
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              取消
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreate} disabled={!canCreateRole}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
