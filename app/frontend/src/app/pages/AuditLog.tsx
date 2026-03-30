import { useEffect, useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { getAuditLogDetail, getAuditLogs, type AuditLogDetail, type AuditLogItem } from "../api/admin";
import { FilterSelect } from "../components/admin/FilterSelect";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { formatDateTime } from "../lib/date";

export default function AuditLog() {
  const [list, setList] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterResult, setFilterResult] = useState("all");
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<AuditLogDetail | null>(null);

  async function loadLogs() {
    try {
      setLoading(true);
      const data = await getAuditLogs({
        page,
        per_page: 10,
        log_type: filterType === "all" ? undefined : filterType,
        object_id: search || undefined,
      });
      const filteredList =
        filterResult === "all" ? data.list : data.list.filter((item) => String(item.result) === filterResult);
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

  const openDetail = async (id: number) => {
    setSheetOpen(true);
    setDetail(null);
    try {
      setDetailLoading(true);
      setDetail(await getAuditLogDetail(id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "日志详情加载失败");
      setSheetOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const start = (page - 1) * 10 + 1;
  const end = Math.min(page * 10, total);

  return (
    <div className="flex flex-col h-full bg-white relative rounded-lg border border-gray-200 shadow-sm overflow-hidden -m-6 min-h-[calc(100vh-12rem)]">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">审计日志</h2>
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700"
            onClick={() => toast.info("导出日志接口暂未提供")}
          >
            <Download className="w-4 h-4 mr-2" />
            导出结果
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <FilterSelect
            label="日志类型"
            value={filterType}
            onChange={(v) => {
              setFilterType(v);
              setPage(1);
            }}
            options={[
              { value: "all", label: "全部" },
              { value: "user_permission", label: "用户权限" },
              { value: "role_permission", label: "角色权限" },
              { value: "menu", label: "菜单操作" },
              { value: "login", label: "登录相关" },
            ]}
          />
          <FilterSelect
            label="结果"
            value={filterResult}
            onChange={(v) => {
              setFilterResult(v);
              setPage(1);
            }}
            options={[
              { value: "all", label: "全部" },
              { value: "1", label: "成功" },
              { value: "2", label: "失败" },
            ]}
          />
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索对象 ID（object_id）"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-gray-50 border-gray-300 focus-visible:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium">操作时间</th>
              <th className="px-4 py-3 font-medium">日志类型</th>
              <th className="px-4 py-3 font-medium">操作人</th>
              <th className="px-4 py-3 font-medium">动作</th>
              <th className="px-4 py-3 font-medium">操作对象</th>
              <th className="px-4 py-3 font-medium">结果</th>
              <th className="px-4 py-3 font-medium text-right">详情</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  加载中…
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  暂无日志记录
                </td>
              </tr>
            ) : (
              list.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                  onClick={() => openDetail(item.id)}
                >
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono tabular-nums">
                    {formatDateTime(item.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      {item.log_type_label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.operator_name}</td>
                  <td className="px-4 py-3 text-gray-700">{item.action_label}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col max-w-[200px]">
                      <span className="text-gray-900 font-medium text-xs truncate">{item.object_name}</span>
                      <span className="text-xs text-gray-400">对象: {item.object_type_label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {item.result === 1 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.result_label}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        {item.result_label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(item.id);
                      }}
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-sm bg-white shrink-0">
        <span className="text-gray-500">
          共 {total} 条记录，当前显示 {list.length ? start : 0}-{end} 条
        </span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>
            上一页
          </Button>
          <span className="px-3 py-1 border border-indigo-600 rounded text-white bg-indigo-600 text-sm">{page}</span>
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((v) => v + 1)}>
            下一页
          </Button>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 gap-0 border-l border-gray-200">
          <SheetHeader className="h-16 border-b border-gray-200 px-6 flex-row items-center justify-between space-y-0 bg-gray-50/50 shrink-0">
            <SheetTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              日志详情
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 h-0">
            <div className="p-6 space-y-6">
              {detailLoading ? (
                <p className="text-sm text-gray-500">加载中…</p>
              ) : !detail ? (
                <p className="text-sm text-gray-500">暂无数据</p>
              ) : (
                <>
                  <div className="rounded-lg border border-gray-200 p-4 shadow-sm bg-white">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">基础信息</h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">日志编号</div>
                        <div className="font-mono text-gray-900">{detail.id}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">请求 ID</div>
                        <div className="font-mono text-gray-900 text-xs break-all">{detail.request_id ?? "—"}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">操作时间</div>
                        <div className="font-mono text-gray-900">{formatDateTime(detail.created_at)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">操作结果</div>
                        <Badge
                          className={
                            detail.result === 1
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {detail.result_label}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <div className="text-gray-500 text-xs mb-1">操作人</div>
                        <div className="text-gray-900 font-medium">{detail.operator_name}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-gray-500 text-xs mb-1">操作对象</div>
                        <div className="text-gray-900">
                          {detail.object_name}{" "}
                          <span className="text-gray-400 text-xs">({detail.object_type_label})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {detail.fail_reason ? (
                    <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 text-sm text-red-800">
                      <div className="font-medium mb-1">失败原因</div>
                      {detail.fail_reason}
                    </div>
                  ) : null}
                  <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">变更数据</h4>
                    <pre className="max-h-48 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
                      {JSON.stringify(
                        {
                          before_value: detail.before_value,
                          after_value: detail.after_value,
                          source_page: detail.source_page,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
