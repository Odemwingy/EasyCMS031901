import { useEffect, useState } from "react";
import { Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { getAuditLogDetail, getAuditLogs, type AuditLogItem } from "../api/admin";
import { formatDateTime } from "../lib/date";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

export default function AuditLog() {
  const [list, setList] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterResult, setFilterResult] = useState("all");
  const [page, setPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailText, setDetailText] = useState("");

  async function loadLogs() {
    try {
      setLoading(true);
      const data = await getAuditLogs({
        page,
        per_page: 10,
        log_type: filterType === "all" ? undefined : filterType,
        object_id: search || undefined,
      });
      const filteredList = filterResult === "all" ? data.list : data.list.filter((item) => String(item.result) === filterResult);
      setList(filteredList);
      setTotal(data.total);
      setLastPage(data.last_page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "审计日志加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, [page, search, filterType, filterResult]);

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await getAuditLogDetail(id);
      setDetailText(
        JSON.stringify(
          {
            request_id: detail.request_id,
            before_value: detail.before_value,
            after_value: detail.after_value,
            fail_reason: detail.fail_reason,
          },
          null,
          2,
        ),
      );
      setDetailOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "日志详情加载失败");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-[#e8e8e8]">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="按对象 ID 查询（object_id）"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <Select value={filterType} onValueChange={(value) => { setFilterType(value); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="日志类型" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="user_permission">用户权限操作</SelectItem>
              <SelectItem value="role_permission">角色权限操作</SelectItem>
              <SelectItem value="menu">菜单操作</SelectItem>
              <SelectItem value="login">登录相关</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterResult} onValueChange={(value) => { setFilterResult(value); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="结果" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部结果</SelectItem>
              <SelectItem value="1">成功</SelectItem>
              <SelectItem value="2">失败</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => toast.info("导出日志接口暂未提供")}>
          <Download className="h-4 w-4 mr-2" />
          导出日志
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#fafafa] hover:bg-[#fafafa]">
              <TableHead>日志ID</TableHead>
              <TableHead>时间</TableHead>
              <TableHead>操作者</TableHead>
              <TableHead>日志类型</TableHead>
              <TableHead>对象类型</TableHead>
              <TableHead>对象名称</TableHead>
              <TableHead>操作动作</TableHead>
              <TableHead>结果</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-12 text-[#00000073]">加载中...</TableCell></TableRow>
            ) : list.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-12 text-[#00000073]">暂无日志记录</TableCell></TableRow>
            ) : (
              list.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs text-[#1890ff]">{item.id}</TableCell>
                  <TableCell>{formatDateTime(item.created_at)}</TableCell>
                  <TableCell>{item.operator_name}</TableCell>
                  <TableCell><Badge variant="outline">{item.log_type_label}</Badge></TableCell>
                  <TableCell>{item.object_type_label}</TableCell>
                  <TableCell className="max-w-[180px] truncate">{item.object_name}</TableCell>
                  <TableCell>{item.action_label}</TableCell>
                  <TableCell>
                    <Badge className={item.result === 1 ? "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]" : "bg-[#fff1f0] text-[#ff4d4f] border-[#ffccc7]"}>
                      {item.result_label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetail(item.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      查看详情
                    </Button>
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>审计日志详情</DialogTitle>
            <DialogDescription>字段变更前后值与请求链路信息</DialogDescription>
          </DialogHeader>
          <pre className="max-h-[420px] overflow-auto rounded bg-[#0f172a] p-4 text-xs text-[#e2e8f0]">{detailText}</pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
