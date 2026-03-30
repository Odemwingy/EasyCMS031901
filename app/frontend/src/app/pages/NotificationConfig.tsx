import { useState, useMemo } from "react";
import { Plus, Edit, Eye, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";

interface NotificationRule {
  id: number;
  eventName: string;
  eventCode: string;
  channels: string[];
  receivers: string;
  enabled: boolean;
  updatedAt: string;
}

const initialNotifications: NotificationRule[] = [
  { id: 1, eventName: "导出完成通知", eventCode: "EXPORT_COMPLETED", channels: ["站内消息", "邮件"], receivers: "导出发起人、项目管理员", enabled: true, updatedAt: "2026-03-15 10:00:00" },
  { id: 2, eventName: "导出失败通知", eventCode: "EXPORT_FAILED", channels: ["站内消息", "邮件"], receivers: "导出发起人、发布人员、系统管理员", enabled: true, updatedAt: "2026-03-15 10:00:00" },
  { id: 3, eventName: "配置签核通知", eventCode: "CONFIG_REVIEW", channels: ["站内消息"], receivers: "配置管理员、审核人员", enabled: true, updatedAt: "2026-03-10 14:30:00" },
  { id: 4, eventName: "配置解锁通知", eventCode: "CONFIG_UNLOCK", channels: ["站内消息", "邮件"], receivers: "配置管理员、发布人员", enabled: true, updatedAt: "2026-03-10 14:30:00" },
  { id: 5, eventName: "变更申请待审批", eventCode: "CHANGE_PENDING", channels: ["站内消息"], receivers: "审核人员、项目管理员", enabled: true, updatedAt: "2026-03-05 16:20:00" },
  { id: 6, eventName: "变更申请已通过", eventCode: "CHANGE_APPROVED", channels: ["站内消息"], receivers: "变更申请人", enabled: true, updatedAt: "2026-03-05 16:20:00" },
  { id: 7, eventName: "任务逾期提醒", eventCode: "TASK_OVERDUE", channels: ["站内消息", "邮件"], receivers: "任务负责人、项目管理员", enabled: true, updatedAt: "2026-03-01 09:00:00" },
  { id: 8, eventName: "账号创建通知", eventCode: "USER_CREATED", channels: ["邮件"], receivers: "新建用户", enabled: false, updatedAt: "2026-02-28 13:45:00" },
];

const PAGE_SIZE = 10;

export default function NotificationConfig() {
  const [notifications, setNotifications] = useState<NotificationRule[]>(initialNotifications);
  const [search, setSearch] = useState("");
  const [filterChannel, setFilterChannel] = useState("all");
  const [filterEnabled, setFilterEnabled] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const q = search.toLowerCase();
      const matchSearch = !q || n.eventName.toLowerCase().includes(q) || n.eventCode.toLowerCase().includes(q);
      const matchChannel = filterChannel === "all" || n.channels.includes(filterChannel === "internal" ? "站内消息" : filterChannel === "email" ? "邮件" : filterChannel);
      const matchEnabled =
        filterEnabled === "all" ||
        (filterEnabled === "enabled" && n.enabled) ||
        (filterEnabled === "disabled" && !n.enabled);
      return matchSearch && matchChannel && matchEnabled;
    });
  }, [notifications, search, filterChannel, filterEnabled]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleEnabled = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const next = { ...n, enabled: !n.enabled };
        toast.success(`通知规则「${n.eventName}」已${next.enabled ? "启用" : "停用"}`);
        return next;
      })
    );
  };

  return (
    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white shrink-0">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">通知中心</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Input
            placeholder="搜索事件名称/编码"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="border-gray-300 focus-visible:ring-indigo-500"
          />
          <Select value={filterChannel} onValueChange={(v) => { setFilterChannel(v); setPage(1); }}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="通知方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部方式</SelectItem>
              <SelectItem value="internal">站内消息</SelectItem>
              <SelectItem value="email">邮件</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterEnabled} onValueChange={(v) => { setFilterEnabled(v); setPage(1); }}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="启用状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="enabled">已启用</SelectItem>
              <SelectItem value="disabled">已停用</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm" onClick={() => toast.info("新建通知规则功能开发中")}>
            <Plus className="h-4 w-4 mr-2" />
            新建通知规则
          </Button>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
              <TableHead className="text-gray-700 font-medium">事件名称</TableHead>
              <TableHead className="text-gray-700 font-medium">事件编码</TableHead>
              <TableHead className="text-gray-700 font-medium">通知方式</TableHead>
              <TableHead className="text-gray-700 font-medium">默认接收对象</TableHead>
              <TableHead className="text-gray-700 font-medium">启用状态</TableHead>
              <TableHead className="text-gray-700 font-medium">最近修改时间</TableHead>
              <TableHead className="text-gray-700 font-medium text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">暂无数据</TableCell>
              </TableRow>
            ) : (
              paged.map((n) => (
                <TableRow key={n.id} className="hover:bg-gray-50/80 border-b border-gray-100">
                  <TableCell className="font-medium text-gray-900">{n.eventName}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{n.eventCode}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {n.channels.map((channel) => (
                        <Badge key={channel} variant="outline" className="border-gray-300 text-gray-800">{channel}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 max-w-[180px] truncate">{n.receivers}</TableCell>
                  <TableCell>
                    <Switch
                      checked={n.enabled}
                      onCheckedChange={() => toggleEnabled(n.id)}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">{n.updatedAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.info(`查看规则：${n.eventName}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info(`编辑规则：${n.eventName}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑规则
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

      {/* 分页 */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white shrink-0">
        <div className="text-sm text-gray-500">共 {filtered.length} 条记录，第 {page} / {totalPages} 页</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} className="border-gray-300" onClick={() => setPage((p) => p - 1)}>上一页</Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant="outline" size="sm"
              className={p === page ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700" : "border-gray-300"}
              onClick={() => setPage(p)}>{p}</Button>
          ))}
          <Button variant="outline" size="sm" disabled={page >= totalPages} className="border-gray-300" onClick={() => setPage((p) => p + 1)}>下一页</Button>
        </div>
      </div>
    </div>
  );
}
