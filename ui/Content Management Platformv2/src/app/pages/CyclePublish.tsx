import React, { useState } from "react";
import {
  Calendar, Clock, CheckCircle2, AlertCircle, ChevronRight, ChevronDown,
  Plus, MoreVertical, Search, Filter, Download, Upload, RefreshCw,
  Send, FileCheck, FileX, Eye, Edit3, Trash2, ArrowRight, XCircle,
  Shield, Globe, Users, Layers, GitBranch, Activity, ArrowUpDown,
  Package, BarChart3, ChevronLeft, ChevronsLeft, ChevronsRight,
  ClipboardCheck, Milestone, Target, Rocket, Archive, GripVertical,
  AlertTriangle, FileEdit, User, ExternalLink, Copy
} from "lucide-react";

// ─── Cycle Management ───
const CYCLES = [
  { id: "CYC-2026-Q1", name: "2026-Q1-Release", status: "active", start: "2026-01-01", end: "2026-03-31", progress: 72, total: 272, signed: 198, pending: 52, rejected: 22 },
  { id: "CYC-2025-Q4", name: "2025-Q4-Release", status: "completed", start: "2025-10-01", end: "2025-12-31", progress: 100, total: 245, signed: 245, pending: 0, rejected: 0 },
  { id: "CYC-2026-Q2", name: "2026-Q2-Release (规划中)", status: "planning", start: "2026-04-01", end: "2026-06-30", progress: 0, total: 0, signed: 0, pending: 0, rejected: 0 },
];

export function CycleManageView() {
  const [selectedCycle, setSelectedCycle] = useState(CYCLES[0]);
  const [tab, setTab] = useState<"overview" | "milestones" | "content">("overview");

  return (
    <div className="flex h-full bg-white">
      {/* Left: Cycle List */}
      <div className="w-72 border-r border-gray-200 flex flex-col bg-gray-50/30 shrink-0">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="text-sm text-gray-800 flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Calendar className="w-4 h-4 text-indigo-500" /> 周期列表
          </h3>
          <button className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Plus className="w-4 h-4" /></button>
        </div>
        <div className="p-2 flex-1 overflow-y-auto space-y-1">
          {CYCLES.map(c => (
            <button key={c.id} onClick={() => setSelectedCycle(c)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedCycle.id === c.id ? "bg-indigo-50 border-indigo-200" : "border-transparent hover:bg-gray-50 hover:border-gray-200"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{c.name}</span>
                <StatusBadge status={c.status} />
              </div>
              <p className="text-[10px] text-gray-400 font-mono">{c.start} ~ {c.end}</p>
              {c.status !== "planning" && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.progress === 100 ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${c.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500">{c.progress}%</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Cycle Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white shrink-0">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-lg text-gray-900 flex items-center gap-3" style={{ fontWeight: 700 }}>
                {selectedCycle.name}
                <StatusBadge status={selectedCycle.status} />
              </h2>
              <p className="text-xs text-gray-500 mt-1 font-mono">{selectedCycle.id} · {selectedCycle.start} ~ {selectedCycle.end}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2" style={{ fontWeight: 500 }}>
                <Edit3 className="w-4 h-4" /> 编辑周期
              </button>
              <button className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 flex items-center gap-2 shadow-sm" style={{ fontWeight: 500 }}>
                <Rocket className="w-4 h-4" /> 发起导出
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <MiniStat label="内容总数" value={selectedCycle.total} icon={Layers} />
            <MiniStat label="已签核" value={selectedCycle.signed} icon={CheckCircle2} color="text-emerald-600" />
            <MiniStat label="待签核" value={selectedCycle.pending} icon={Clock} color="text-purple-600" />
            <MiniStat label="已驳回" value={selectedCycle.rejected} icon={XCircle} color="text-red-600" />
            <MiniStat label="完成进度" value={`${selectedCycle.progress}%`} icon={Target} color="text-indigo-600" />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-3 border-b border-gray-200 flex gap-6 text-sm shrink-0">
          {[
            { id: "overview" as const, label: "里程碑概览" },
            { id: "milestones" as const, label: "签核任务" },
            { id: "content" as const, label: "关联内容" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`pb-3 border-b-2 transition-colors ${tab === t.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
              style={{ fontWeight: tab === t.id ? 600 : 400 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {tab === "overview" && <MilestoneOverview />}
          {tab === "milestones" && <SignoffTaskList />}
          {tab === "content" && <CycleContentList />}
        </div>
      </div>
    </div>
  );
}

function MilestoneOverview() {
  const milestones = [
    { id: 1, name: "内容录入截止", date: "2026-02-15", status: "done", desc: "所有内容对象必须完成录入和基本信息填写" },
    { id: 2, name: "分类挂载完成", date: "2026-02-28", status: "done", desc: "所有内容对象完成分类树挂载" },
    { id: 3, name: "素材上传截止", date: "2026-03-05", status: "done", desc: "海报、预告片、字幕等素材全部上传完毕" },
    { id: 4, name: "完整性校验通过", date: "2026-03-15", status: "active", desc: "所有内容对象通过完整性校验" },
    { id: 5, name: "签核审批完成", date: "2026-03-20", status: "pending", desc: "所有内容获得签核通过" },
    { id: 6, name: "导出包生成", date: "2026-03-25", status: "pending", desc: "生成最终导出包并提交运营平台" },
    { id: 7, name: "正式发布上线", date: "2026-03-31", status: "pending", desc: "内容正式在终端平台上线" },
  ];

  return (
    <div className="space-y-4 max-w-3xl">
      {milestones.map((m, i) => (
        <div key={m.id} className={`flex gap-4 ${i < milestones.length - 1 ? "" : ""}`}>
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${m.status === "done" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : m.status === "active" ? "border-indigo-500 bg-indigo-50 text-indigo-600 ring-4 ring-indigo-100" : "border-gray-200 bg-white text-gray-300"}`}>
              {m.status === "done" ? <CheckCircle2 className="w-4 h-4" /> : m.status === "active" ? <Activity className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
            {i < milestones.length - 1 && (
              <div className={`w-0.5 flex-1 my-1 ${m.status === "done" ? "bg-emerald-300" : "bg-gray-200"}`} />
            )}
          </div>
          {/* Content */}
          <div className={`flex-1 pb-6 ${m.status === "active" ? "" : ""}`}>
            <div className={`p-4 rounded-lg border ${m.status === "active" ? "bg-indigo-50/50 border-indigo-200 shadow-sm" : m.status === "done" ? "bg-white border-gray-200" : "bg-gray-50/50 border-gray-100"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm text-gray-900 flex items-center gap-2" style={{ fontWeight: 600 }}>
                    {m.name}
                    {m.status === "active" && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded border border-indigo-200 animate-pulse" style={{ fontWeight: 500 }}>进行中</span>}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
                </div>
                <span className="text-xs text-gray-400 font-mono shrink-0 ml-4">{m.date}</span>
              </div>
              {m.status === "active" && (
                <div className="mt-3 pt-3 border-t border-indigo-100 flex items-center justify-between">
                  <span className="text-xs text-indigo-600">距离截止还有 15 天</span>
                  <button className="text-xs text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded hover:bg-indigo-200 transition-colors" style={{ fontWeight: 500 }}>查看详情</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SignoffTaskList() {
  const tasks = [
    { id: "SGN-001", title: "首页推荐 - 内容签核", category: "首页推荐", assignee: "Admin", total: 42, signed: 38, pending: 3, rejected: 1, deadline: "2026-03-20", status: "进行中" },
    { id: "SGN-002", title: "电影分类 - 内容签核", category: "电影分类", assignee: "Content Ops", total: 68, signed: 60, pending: 6, rejected: 2, deadline: "2026-03-20", status: "进行中" },
    { id: "SGN-003", title: "少儿专区 - 内容签核", category: "少儿专区", assignee: "Admin", total: 24, signed: 24, pending: 0, rejected: 0, deadline: "2026-03-18", status: "已完成" },
    { id: "SGN-004", title: "游戏中心 - 内容签核", category: "游戏中心", assignee: "Game Ops", total: 18, signed: 10, pending: 5, rejected: 3, deadline: "2026-03-22", status: "进行中" },
    { id: "SGN-005", title: "音乐专区 - 内容签核", category: "音乐专区", assignee: "Music Ops", total: 32, signed: 28, pending: 4, rejected: 0, deadline: "2026-03-20", status: "进行中" },
    { id: "SGN-006", title: "体育赛事 - 内容签核", category: "体育赛事", assignee: "Sports Ops", total: 16, signed: 16, pending: 0, rejected: 0, deadline: "2026-03-15", status: "已完成" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="搜索签核任务..." className="pl-9 pr-3 py-1.5 border border-gray-300 rounded bg-white text-sm outline-none focus:border-indigo-500 w-72" />
        </div>
        <button className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 flex items-center gap-2 shadow-sm" style={{ fontWeight: 500 }}>
          <ClipboardCheck className="w-4 h-4" /> 新建签核任务
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium">任务编号</th>
              <th className="px-4 py-3 font-medium">签核任务</th>
              <th className="px-4 py-3 font-medium">负责人</th>
              <th className="px-4 py-3 font-medium">签核进度</th>
              <th className="px-4 py-3 font-medium">截止日期</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium w-20">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map(t => (
              <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-4 py-3 font-mono text-xs text-indigo-600">{t.id}</td>
                <td className="px-4 py-3">
                  <div>
                    <span className="text-gray-900" style={{ fontWeight: 600 }}>{t.title}</span>
                    <p className="text-xs text-gray-400 mt-0.5">分类: {t.category}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-700" style={{ fontWeight: 700 }}>{t.assignee[0]}</div>
                    <span className="text-sm text-gray-700">{t.assignee}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round(t.signed / t.total * 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{t.signed}/{t.total}</span>
                    </div>
                    <div className="flex gap-2 text-[10px]">
                      <span className="text-emerald-600">通过 {t.signed}</span>
                      <span className="text-purple-600">待审 {t.pending}</span>
                      {t.rejected > 0 && <span className="text-red-600">驳回 {t.rejected}</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{t.deadline}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs border ${t.status === "已完成" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}`} style={{ fontWeight: 500 }}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Eye className="w-4 h-4" /></button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"><MoreVertical className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CycleContentList() {
  const items = [
    { id: "V-10001", name: "流浪地球 3", type: "视频", provider: "Disney+", sign: "已签核", status: "上架" },
    { id: "G-49210", name: "原神 V5.0", type: "游戏", provider: "miHoYo", sign: "已签核", status: "上架" },
    { id: "V-10045", name: "三体 第1集", type: "视频", provider: "Tencent", sign: "待签核", status: "编辑中" },
    { id: "A-88321", name: "周杰伦 - 稻香", type: "音频", provider: "Sony Music", sign: "已签核", status: "上架" },
    { id: "V-10050", name: "封神：朝歌风云", type: "视频", provider: "iQIYI", sign: "已驳回", status: "编辑中" },
    { id: "S-55102", name: "天气预报组件", type: "服务类", provider: "Internal", sign: "待签核", status: "待上架" },
    { id: "B-22910", name: "哈利波特有声书", type: "有声书", provider: "Audible", sign: "已签核", status: "上架" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="搜索关联内容..." className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded bg-white text-sm outline-none focus:border-indigo-500" />
        </div>
        <select className="border border-gray-300 rounded px-2 py-1.5 bg-white text-sm outline-none focus:border-indigo-500">
          <option>全部签核状态</option><option>已签核</option><option>待签核</option><option>已驳回</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-8"><input type="checkbox" className="rounded border-gray-300 text-indigo-600" /></th>
              <th className="px-4 py-3 font-medium">内容 ID</th>
              <th className="px-4 py-3 font-medium">名称</th>
              <th className="px-4 py-3 font-medium">类型</th>
              <th className="px-4 py-3 font-medium">提供商</th>
              <th className="px-4 py-3 font-medium">签核状态</th>
              <th className="px-4 py-3 font-medium">内容状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors cursor-pointer">
                <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300 text-indigo-600" /></td>
                <td className="px-4 py-3 font-mono text-xs text-indigo-600">{item.id}</td>
                <td className="px-4 py-3 text-gray-900" style={{ fontWeight: 500 }}>{item.name}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">{item.type}</span></td>
                <td className="px-4 py-3 text-gray-600 text-xs">{item.provider}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${item.sign === "已签核" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : item.sign === "待签核" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-red-50 text-red-700 border-red-200"}`} style={{ fontWeight: 500 }}>{item.sign}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${item.status === "上架" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : item.status === "编辑中" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"}`} style={{ fontWeight: 500 }}>{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sign Management ───
export function SignManageView() {
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");

  const pendingItems = [
    { id: "V-10023", name: "流浪地球3 预告", submitter: "Content Provider", submitTime: "2026-03-28 10:30", type: "视频", category: "首页推荐 > 猜你喜欢", changes: ["新增英文字幕", "更新海报素材"] },
    { id: "V-10045", name: "三体 第1集", submitter: "Admin", submitTime: "2026-03-27 14:20", type: "视频", category: "首页推荐 > 热门精选", changes: ["补充英文音轨", "修正分级信息"] },
    { id: "G-49210", name: "原神 V5.0", submitter: "Game Ops", submitTime: "2026-03-26 09:00", type: "游戏", category: "游戏中心 > 热门游戏", changes: ["更新版本号", "新增宣传图"] },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-gray-900" style={{ fontWeight: 700 }}>签核管理</h2>
          <div className="flex gap-3 text-sm">
            <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full" style={{ fontWeight: 500 }}>待审核: 3</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full" style={{ fontWeight: 500 }}>已通过: 198</span>
            <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full" style={{ fontWeight: 500 }}>已驳回: 22</span>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          {[
            { id: "pending" as const, label: "待审核" },
            { id: "approved" as const, label: "已通过" },
            { id: "rejected" as const, label: "已驳回" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`pb-2 border-b-2 transition-colors ${tab === t.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
              style={{ fontWeight: tab === t.id ? 600 : 400 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {tab === "pending" && pendingItems.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:border-indigo-200 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm text-gray-900 flex items-center gap-2" style={{ fontWeight: 600 }}>
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100">{item.id}</span>
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.submitter}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.submitTime}</span>
                </p>
              </div>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">{item.type}</span>
            </div>

            <div className="text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> 挂载路径: {item.category}</span>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1.5" style={{ fontWeight: 500 }}>变更内容:</p>
              <div className="flex flex-wrap gap-2">
                {item.changes.map(c => (
                  <span key={c} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200">{c}</span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button className="px-4 py-1.5 text-sm text-white bg-emerald-600 rounded hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm" style={{ fontWeight: 500 }}>
                <CheckCircle2 className="w-4 h-4" /> 通过
              </button>
              <button className="px-4 py-1.5 text-sm text-red-600 bg-white border border-red-200 rounded hover:bg-red-50 flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                <XCircle className="w-4 h-4" /> 驳回
              </button>
              <button className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 flex items-center gap-1.5 ml-auto" style={{ fontWeight: 500 }}>
                <Eye className="w-4 h-4" /> 详情对比
              </button>
            </div>
          </div>
        ))}

        {tab === "approved" && (
          <div className="text-center py-16 text-gray-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
            <p className="text-sm">共 198 条已通过签核记录</p>
            <p className="text-xs mt-1">可在审计日志中查看完整审批历史</p>
          </div>
        )}

        {tab === "rejected" && (
          <div className="text-center py-16 text-gray-400">
            <XCircle className="w-12 h-12 mx-auto mb-3 text-red-300" />
            <p className="text-sm">共 22 条已驳回记录</p>
            <p className="text-xs mt-1">已驳回的内容需修改后重新提交签核</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Change Request ───
export function ChangeRequestView() {
  const requests = [
    { id: "CR-001", title: "首页推荐新增「春季大促」分类", type: "分类变更", status: "待审批", submitter: "Content Ops", submitTime: "2026-03-28 14:00", priority: "高" },
    { id: "CR-002", title: "批量更新电影分类下的分级信息", type: "元数据变更", status: "已批准", submitter: "Admin", submitTime: "2026-03-27 10:30", priority: "中" },
    { id: "CR-003", title: "下架 3 个版权到期的音频内容", type: "状态变更", status: "已批准", submitter: "Legal Team", submitTime: "2026-03-26 16:45", priority: "高" },
    { id: "CR-004", title: "游戏中心新增「独立游戏」子分类", type: "分类变更", status: "已驳回", submitter: "Game Ops", submitTime: "2026-03-25 11:00", priority: "低" },
    { id: "CR-005", title: "调整少儿专区展示排序规则", type: "配置变更", status: "待审批", submitter: "Product Team", submitTime: "2026-03-29 09:20", priority: "中" },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl text-gray-900" style={{ fontWeight: 700 }}>变更申请</h2>
          <button className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 flex items-center gap-2 shadow-sm" style={{ fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> 发起变更
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200 sticky top-0 z-[5]">
            <tr>
              <th className="px-4 py-3 font-medium">变更编号</th>
              <th className="px-4 py-3 font-medium">变更标题</th>
              <th className="px-4 py-3 font-medium">类型</th>
              <th className="px-4 py-3 font-medium">提交人</th>
              <th className="px-4 py-3 font-medium">提交时间</th>
              <th className="px-4 py-3 font-medium">优先级</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium w-20">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map(r => (
              <tr key={r.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-4 py-3 font-mono text-xs text-indigo-600">{r.id}</td>
                <td className="px-4 py-3 text-gray-900" style={{ fontWeight: 500 }}>{r.title}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">{r.type}</span></td>
                <td className="px-4 py-3 text-gray-600 text-xs">{r.submitter}</td>
                <td className="px-4 py-3 text-xs text-gray-400 font-mono">{r.submitTime}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs border ${r.priority === "高" ? "bg-red-50 text-red-600 border-red-200" : r.priority === "中" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-gray-50 text-gray-600 border-gray-200"}`} style={{ fontWeight: 500 }}>{r.priority}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs border ${r.status === "已批准" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : r.status === "待审批" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`} style={{ fontWeight: 500 }}>{r.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Eye className="w-4 h-4" /></button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"><MoreVertical className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Export & Publish Status ───
export function PublishStatusView() {
  const exports = [
    { id: "EXP-001", name: "2026-Q1 全量导出", type: "全量", target: "Global Platform", status: "导出中", progress: 65, startTime: "2026-03-30 08:00", items: 272 },
    { id: "EXP-002", name: "APAC 增量导出", type: "增量", target: "APAC CDN", status: "已完成", progress: 100, startTime: "2026-03-29 14:30", items: 45 },
    { id: "EXP-003", name: "首页推荐热更新", type: "热更新", target: "Production", status: "已完成", progress: 100, startTime: "2026-03-28 20:00", items: 12 },
    { id: "EXP-004", name: "欧洲区内容同步", type: "增量", target: "EU Platform", status: "排队中", progress: 0, startTime: "-", items: 38 },
    { id: "EXP-005", name: "测试环境导出", type: "全量", target: "Staging", status: "失败", progress: 42, startTime: "2026-03-30 06:00", items: 272 },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl text-gray-900" style={{ fontWeight: 700 }}>发布状态</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2" style={{ fontWeight: 500 }}>
              <RefreshCw className="w-4 h-4" /> 刷新
            </button>
            <button className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 flex items-center gap-2 shadow-sm" style={{ fontWeight: 500 }}>
              <Rocket className="w-4 h-4" /> 新建导出
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">
        {exports.map(exp => (
          <div key={exp.id} className={`bg-white p-5 rounded-lg border shadow-sm ${exp.status === "失败" ? "border-red-200" : exp.status === "导出中" ? "border-indigo-200" : "border-gray-200"}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm text-gray-900 flex items-center gap-2" style={{ fontWeight: 600 }}>
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">{exp.id}</span>
                  {exp.name}
                </h3>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {exp.type}</span>
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {exp.target}</span>
                  <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {exp.items} 项内容</span>
                  {exp.startTime !== "-" && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exp.startTime}</span>}
                </div>
              </div>
              <ExportStatusBadge status={exp.status} />
            </div>
            {exp.status === "导出中" && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: `${exp.progress}%` }} />
                </div>
                <span className="text-sm text-indigo-600" style={{ fontWeight: 600 }}>{exp.progress}%</span>
              </div>
            )}
            {exp.status === "失败" && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>导出节点服务器连接超时，请检查网络后重试。</span>
                <button className="ml-auto text-red-700 underline" style={{ fontWeight: 500 }}>重试</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared Components ───
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-gray-100 text-gray-600 border-gray-200",
    planning: "bg-blue-50 text-blue-700 border-blue-200",
  };
  const labelMap: Record<string, string> = { active: "进行中", completed: "已完成", planning: "规划中" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${map[status] || map.active}`} style={{ fontWeight: 500 }}>{labelMap[status] || status}</span>;
}

function ExportStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "导出中": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "已完成": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "排队中": "bg-amber-50 text-amber-700 border-amber-200",
    "失败": "bg-red-50 text-red-700 border-red-200",
  };
  return <span className={`text-xs px-2.5 py-1 rounded-full border ${map[status] || ""}`} style={{ fontWeight: 500 }}>{status}</span>;
}

function MiniStat({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color?: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3 bg-white rounded-lg border border-gray-100">
      <Icon className={`w-4 h-4 ${color || "text-gray-500"}`} />
      <div>
        <p className="text-[10px] text-gray-400 uppercase">{label}</p>
        <p className={`text-sm ${color || "text-gray-700"}`} style={{ fontWeight: 700 }}>{value}</p>
      </div>
    </div>
  );
}
