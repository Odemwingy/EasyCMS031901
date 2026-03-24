import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Edit, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import {
  createMenu,
  deleteMenu,
  getMenuTree,
  updateMenu,
  updateMenuStatus,
  type MenuTreeItem,
} from "../api/admin";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";

type MenuForm = {
  parent_id: string;
  type: string;
  name: string;
  permission: string;
  route_path: string;
  component: string;
  icon: string;
  sort: string;
  status: string;
  remark: string;
};

const emptyForm: MenuForm = {
  parent_id: "root",
  type: "2",
  name: "",
  permission: "",
  route_path: "",
  component: "",
  icon: "",
  sort: "1",
  status: "1",
  remark: "",
};

function flattenNodes(tree: MenuTreeItem[]): MenuTreeItem[] {
  const list: MenuTreeItem[] = [];
  const walk = (nodes: MenuTreeItem[]) => {
    nodes.forEach((node) => {
      list.push(node);
      walk(node.children);
    });
  };
  walk(tree);
  return list;
}

export default function MenuManagement() {
  const [tree, setTree] = useState<MenuTreeItem[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<MenuForm>(emptyForm);
  const [current, setCurrent] = useState<MenuTreeItem | null>(null);

  const allNodes = useMemo(() => flattenNodes(tree), [tree]);

  const loadTree = async () => {
    try {
      setLoading(true);
      const data = await getMenuTree(true);
      setTree(data);
      const initExpanded: Record<number, boolean> = {};
      data.forEach((item) => {
        initExpanded[item.id] = true;
      });
      setExpanded(initExpanded);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "菜单树加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, []);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateDialog = (parent?: MenuTreeItem) => {
    setForm({
      ...emptyForm,
      parent_id: parent ? String(parent.id) : "root",
      type: parent && parent.type === 2 ? "3" : "2",
    });
    setOpenCreate(true);
  };

  const openEditDialog = (node: MenuTreeItem) => {
    setCurrent(node);
    setForm({
      parent_id: node.parent_id ? String(node.parent_id) : "root",
      type: String(node.type),
      name: node.name,
      permission: node.permission,
      route_path: node.route_path || "",
      component: node.component || "",
      icon: node.icon || "",
      sort: String(node.sort),
      status: String(node.status),
      remark: node.remark || "",
    });
    setOpenEdit(true);
  };

  const submitCreate = async () => {
    if (!form.name.trim() || !form.permission.trim()) {
      toast.error("请填写菜单名称和权限标识");
      return;
    }
    if (form.type === "2" && (!form.route_path.trim() || !form.component.trim())) {
      toast.error("菜单项类型必须填写路由路径和组件路径");
      return;
    }
    try {
      setSubmitting(true);
      await createMenu({
        parent_id: form.parent_id === "root" ? null : Number(form.parent_id),
        type: Number(form.type),
        name: form.name.trim(),
        permission: form.permission.trim(),
        route_path: form.route_path.trim() || undefined,
        component: form.component.trim() || undefined,
        icon: form.icon.trim() || undefined,
        sort: Number(form.sort || "1"),
        status: Number(form.status),
        remark: form.remark.trim() || undefined,
      });
      toast.success("菜单创建成功");
      setOpenCreate(false);
      await loadTree();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "菜单创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async () => {
    if (!current) return;
    if (!form.name.trim()) {
      toast.error("请填写菜单名称");
      return;
    }
    if (form.type === "2" && (!form.route_path.trim() || !form.component.trim())) {
      toast.error("菜单项类型必须填写路由路径和组件路径");
      return;
    }
    try {
      setSubmitting(true);
      await updateMenu(current.id, {
        parent_id: form.parent_id === "root" ? null : Number(form.parent_id),
        name: form.name.trim(),
        route_path: form.route_path.trim() || undefined,
        component: form.component.trim() || undefined,
        icon: form.icon.trim() || undefined,
        sort: Number(form.sort || "1"),
        status: Number(form.status),
        remark: form.remark.trim() || undefined,
      });
      toast.success("菜单更新成功");
      setOpenEdit(false);
      setCurrent(null);
      await loadTree();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "菜单更新失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (node: MenuTreeItem) => {
    try {
      const nextStatus = node.status === 1 ? 2 : 1;
      const result = await updateMenuStatus(node.id, nextStatus);
      toast.success(`已${nextStatus === 1 ? "启用" : "停用"}，影响 ${result.affected_count} 个节点`);
      await loadTree();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "菜单状态切换失败");
    }
  };

  const handleDelete = async (node: MenuTreeItem) => {
    if (!window.confirm(`确认删除菜单「${node.name}」吗？`)) return;
    try {
      await deleteMenu(node.id);
      toast.success("菜单已删除");
      await loadTree();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "菜单删除失败");
    }
  };

  const renderNode = (node: MenuTreeItem, depth = 0): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded[node.id] ?? false;
    const indent = { paddingLeft: `${depth * 20 + 8}px` };
    return (
      <div key={node.id}>
        <div className="flex items-center border-b border-[#f0f0f0] py-2 hover:bg-[#fafafa]">
          <div className="flex items-center gap-2 flex-1 min-w-0" style={indent}>
            {hasChildren ? (
              <button type="button" onClick={() => toggleExpand(node.id)} className="text-[#00000073]">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="w-4" />
            )}
            <span className="text-sm text-[#000000d9] truncate">{node.name}</span>
            <Badge variant="outline" className="text-xs">{node.type === 1 ? "目录" : node.type === 2 ? "菜单" : "按钮"}</Badge>
            <Badge className={node.status === 1 ? "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]" : "bg-[#fff1f0] text-[#ff4d4f] border-[#ffccc7]"}>{node.status_label}</Badge>
          </div>
          <div className="w-[220px] text-xs text-[#00000073] truncate px-2">{node.permission}</div>
          <div className="w-[180px] text-xs text-[#00000073] truncate px-2">{node.route_path || "-"}</div>
          <div className="w-[220px] flex items-center justify-end gap-1 pr-2">
            {node.type !== 3 && (
              <Button variant="ghost" size="icon" onClick={() => openCreateDialog(node)} title="新增子节点">
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => openEditDialog(node)} title="编辑">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(node)} title={node.status === 1 ? "停用" : "启用"}>
              {node.status === 1 ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(node)} title="删除">
              <Trash2 className="h-4 w-4 text-[#ff4d4f]" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-[#e8e8e8] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-[#000000d9]">菜单管理</h2>
          <p className="text-sm text-[#00000073] mt-1">按后端菜单树接口维护目录/菜单项/按钮权限</p>
        </div>
        <Button className="bg-[#1890ff] hover:bg-[#40a9ff]" onClick={() => openCreateDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          新建根节点
        </Button>
      </div>

      <div className="px-4 py-2 grid grid-cols-[1fr_220px_180px_220px] text-xs text-[#00000073] bg-[#fafafa] border-b border-[#e8e8e8]">
        <div>名称 / 类型 / 状态</div>
        <div className="px-2">权限标识</div>
        <div className="px-2">路由路径</div>
        <div className="text-right pr-2">操作</div>
      </div>

      <ScrollArea className="h-[calc(100vh-320px)]">
        {loading ? (
          <div className="py-10 text-center text-[#00000073]">加载中...</div>
        ) : tree.length === 0 ? (
          <div className="py-10 text-center text-[#00000073]">暂无菜单数据</div>
        ) : (
          tree.map((node) => renderNode(node))
        )}
      </ScrollArea>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-[680px]">
          <DialogHeader>
            <DialogTitle>新建菜单节点</DialogTitle>
            <DialogDescription>按接口约束填写字段：type=2 时必须提供 route_path 和 component</DialogDescription>
          </DialogHeader>
          <MenuFormFields form={form} setForm={setForm} allNodes={allNodes} editablePermission />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>取消</Button>
            <Button onClick={submitCreate} disabled={submitting} className="bg-[#1890ff] hover:bg-[#40a9ff]">
              {submitting ? "提交中..." : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[680px]">
          <DialogHeader>
            <DialogTitle>编辑菜单节点</DialogTitle>
            <DialogDescription>根据接口约束，permission 和 type 为创建后不可改字段</DialogDescription>
          </DialogHeader>
          <MenuFormFields form={form} setForm={setForm} allNodes={allNodes} editablePermission={false} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>取消</Button>
            <Button onClick={submitEdit} disabled={submitting} className="bg-[#1890ff] hover:bg-[#40a9ff]">
              {submitting ? "提交中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MenuFormFields({
  form,
  setForm,
  allNodes,
  editablePermission,
}: {
  form: MenuForm;
  setForm: Dispatch<SetStateAction<MenuForm>>;
  allNodes: MenuTreeItem[];
  editablePermission: boolean;
}) {
  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>父节点</Label>
          <Select value={form.parent_id} onValueChange={(value) => setForm((prev) => ({ ...prev, parent_id: value }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="root">根节点</SelectItem>
              {allNodes.map((node) => (
                <SelectItem key={node.id} value={String(node.id)}>
                  {node.name}（ID:{node.id}）
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>节点类型</Label>
          <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))} disabled={!editablePermission}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">目录</SelectItem>
              <SelectItem value="2">菜单项</SelectItem>
              <SelectItem value="3">按钮</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>名称 *</Label>
          <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>权限标识 *</Label>
          <Input
            value={form.permission}
            onChange={(e) => setForm((prev) => ({ ...prev, permission: e.target.value }))}
            disabled={!editablePermission}
            placeholder="admin:users:list"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>路由路径（type=2 必填）</Label>
          <Input value={form.route_path} onChange={(e) => setForm((prev) => ({ ...prev, route_path: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>组件路径（type=2 必填）</Label>
          <Input value={form.component} onChange={(e) => setForm((prev) => ({ ...prev, component: e.target.value }))} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>图标</Label>
          <Input value={form.icon} onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))} placeholder="Users" />
        </div>
        <div className="grid gap-2">
          <Label>排序</Label>
          <Input type="number" value={form.sort} onChange={(e) => setForm((prev) => ({ ...prev, sort: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>状态</Label>
          <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">启用</SelectItem>
              <SelectItem value="2">停用</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>备注</Label>
        <Textarea value={form.remark} onChange={(e) => setForm((prev) => ({ ...prev, remark: e.target.value }))} />
      </div>
    </div>
  );
}
