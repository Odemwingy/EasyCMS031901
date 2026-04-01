import React, { useState } from "react";
import {
  BarChart3, TrendingUp, PieChart as PieChartIcon, Download,
  Calendar, Filter, RefreshCw, ArrowUpRight, ArrowDownRight,
  Film, Headphones, Gamepad2, BookOpen, Package, Layers,
  CheckCircle2, AlertCircle, Clock, FileEdit, Globe, Users,
  Activity, Target, Eye, ChevronDown
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

// ─── Mock Data ───
const monthlyContent = [
  { month: "2025/10", 视频: 32, 音频: 12, 游戏: 5, 有声书: 3, 服务: 2 },
  { month: "2025/11", 视频: 38, 音频: 15, 游戏: 8, 有声书: 5, 服务: 3 },
  { month: "2025/12", 视频: 45, 音频: 18, 游戏: 10, 有声书: 6, 服务: 4 },
  { month: "2026/01", 视频: 52, 音频: 20, 游戏: 12, 有声书: 8, 服务: 5 },
  { month: "2026/02", 视频: 48, 音频: 16, 游戏: 9, 有声书: 7, 服务: 3 },
  { month: "2026/03", 视频: 56, 音频: 22, 游戏: 14, 有声书: 9, 服务: 6 },
];

const statusDist = [
  { name: "上架", value: 182, color: "#10b981" },
  { name: "编辑中", value: 38, color: "#6366f1" },
  { name: "待上架", value: 28, color: "#f59e0b" },
  { name: "下架", value: 15, color: "#9ca3af" },
  { name: "已归档", value: 9, color: "#d1d5db" },
];

const qualityTrend = [
  { week: "W1", 通过率: 82, 异常数: 28 },
  { week: "W2", 通过率: 86, 异常数: 22 },
  { week: "W3", 通过率: 89, 异常数: 18 },
  { week: "W4", 通过率: 91, 异常数: 14 },
  { week: "W5", 通过率: 88, 异常数: 19 },
  { week: "W6", 通过率: 93, 异常数: 11 },
];

const providerStats = [
  { name: "Disney+", total: 42, online: 38, quality: 95 },
  { name: "Netflix", total: 38, online: 35, quality: 92 },
  { name: "iQIYI", total: 35, online: 30, quality: 88 },
  { name: "Tencent Video", total: 28, online: 25, quality: 90 },
  { name: "HBO Max", total: 22, online: 20, quality: 94 },
  { name: "Apple TV+", total: 18, online: 17, quality: 96 },
  { name: "Bilibili", total: 15, online: 12, quality: 85 },
  { name: "Sony Pictures", total: 12, online: 11, quality: 91 },
];

const changesByType = [
  { name: "元数据更新", value: 85 },
  { name: "素材替换", value: 42 },
  { name: "分类变更", value: 28 },
  { name: "状态变更", value: 35 },
  { name: "新增内容", value: 52 },
  { name: "删除/归档", value: 12 },
];

const operationByUser = [
  { user: "Admin", 操作数: 156, color: "#6366f1" },
  { user: "Content Ops", 操作数: 128, color: "#8b5cf6" },
  { user: "Game Ops", 操作数: 45, color: "#ec4899" },
  { user: "Music Ops", 操作数: 38, color: "#f59e0b" },
  { user: "System API", 操作数: 220, color: "#10b981" },
  { user: "Others", 操作数: 62, color: "#9ca3af" },
];

const radarData = [
  { metric: "完整性", score: 88 },
  { metric: "及时性", score: 75 },
  { metric: "准确性", score: 92 },
  { metric: "规范性", score: 85 },
  { metric: "可用性", score: 90 },
  { metric: "安全性", score: 95 },
];

// ─── Media Report ───
export function MediaReportView() {
  const [period, setPeriod] = useState("本月");

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-gray-900" style={{ fontWeight: 700 }}>媒体报表</h2>
          <div className="flex gap-2 items-center">
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white outline-none focus:border-indigo-500">
              <option>本周</option><option>本月</option><option>本季度</option><option>全年</option>
            </select>
            <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2" style={{ fontWeight: 500 }}>
              <Download className="w-4 h-4" /> 导出报表
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ReportCard title="内容总量" value="272" change="+18" up icon={Layers} color="text-indigo-600" bg="bg-indigo-50" />
          <ReportCard title="在线率" value="66.9%" change="+2.3%" up icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
          <ReportCard title="本月新增" value="56" change="+8" up icon={TrendingUp} color="text-blue-600" bg="bg-blue-50" />
          <ReportCard title="提供商" value="8" change="0" up icon={Globe} color="text-purple-600" bg="bg-purple-50" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
              <BarChart3 className="w-4 h-4 text-indigo-500" /> 月度内容增长 (按类型)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyContent}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="视频" fill="#6366f1" radius={[2, 2, 0, 0]} barSize={14} />
                <Bar dataKey="音频" fill="#8b5cf6" radius={[2, 2, 0, 0]} barSize={14} />
                <Bar dataKey="游戏" fill="#ec4899" radius={[2, 2, 0, 0]} barSize={14} />
                <Bar dataKey="有声书" fill="#f59e0b" radius={[2, 2, 0, 0]} barSize={14} />
                <Bar dataKey="服务" fill="#10b981" radius={[2, 2, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
              <PieChartIcon className="w-4 h-4 text-indigo-500" /> 内容状态分布
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {statusDist.map((e, idx) => <Cell key={`status-${idx}`} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {statusDist.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600"><span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />{d.name}</span>
                  <span className="text-gray-900" style={{ fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Provider Table */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
            <Globe className="w-4 h-4 text-indigo-500" /> 提供商数据统计
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">提供商</th>
                  <th className="px-4 py-3 font-medium">总内容数</th>
                  <th className="px-4 py-3 font-medium">在线数</th>
                  <th className="px-4 py-3 font-medium">在线率</th>
                  <th className="px-4 py-3 font-medium">质量分数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {providerStats.map(p => (
                  <tr key={p.name} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-3 text-gray-900" style={{ fontWeight: 500 }}>{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.total}</td>
                    <td className="px-4 py-3 text-gray-600">{p.online}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round(p.online / p.total * 100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{Math.round(p.online / p.total * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${p.quality >= 90 ? "bg-emerald-50 text-emerald-700" : p.quality >= 85 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`} style={{ fontWeight: 500 }}>{p.quality}分</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Change Report ───
export function ChangeReportView() {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-gray-900" style={{ fontWeight: 700 }}>变更报表</h2>
          <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2" style={{ fontWeight: 500 }}>
            <Download className="w-4 h-4" /> 导出
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ReportCard title="本月变更" value="254" change="+32" up icon={FileEdit} color="text-blue-600" bg="bg-blue-50" />
          <ReportCard title="日均变更" value="8.5" change="+1.2" up icon={Activity} color="text-indigo-600" bg="bg-indigo-50" />
          <ReportCard title="变更通过率" value="94%" change="+2%" up icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
          <ReportCard title="驳回率" value="6%" change="-2%" up={false} icon={AlertCircle} color="text-red-600" bg="bg-red-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
              <BarChart3 className="w-4 h-4 text-indigo-500" /> 变更类型分布
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={changesByType} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={18} name="变更次数" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
              <Users className="w-4 h-4 text-indigo-500" /> 操作人员统计
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={operationByUser} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="操作数" paddingAngle={2}>
                  {operationByUser.map((e, idx) => <Cell key={`user-${idx}`} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs mt-2">
              {operationByUser.map(d => (
                <span key={d.user} className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />{d.user} ({d.操作数})
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quality Report ───
export function QualityReportView() {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-gray-900" style={{ fontWeight: 700 }}>质量报表</h2>
          <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2" style={{ fontWeight: 500 }}>
            <Download className="w-4 h-4" /> 导出
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ReportCard title="校验通过率" value="93%" change="+5%" up icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
          <ReportCard title="当前异常" value="19" change="-8" up={false} icon={AlertCircle} color="text-red-600" bg="bg-red-50" />
          <ReportCard title="平均完整度" value="89%" change="+3%" up icon={Target} color="text-indigo-600" bg="bg-indigo-50" />
          <ReportCard title="本周已修复" value="14" change="+6" up icon={Activity} color="text-blue-600" bg="bg-blue-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
              <TrendingUp className="w-4 h-4 text-indigo-500" /> 质量趋势 (按周)
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={qualityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[70, 100]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="通过率" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="通过率 (%)" />
                <Line yAxisId="right" type="monotone" dataKey="异常数" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
              <Target className="w-4 h-4 text-indigo-500" /> 质量维度评估
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Radar name="当前评分" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Issues */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
            <AlertCircle className="w-4 h-4 text-red-500" /> 热点异常项 (Top 5)
          </h3>
          <div className="space-y-3">
            {[
              { type: "缺少素材", count: 7, items: "V-10023, V-10045 等", severity: "高" },
              { type: "字幕缺失", count: 5, items: "V-10050, A-88400 等", severity: "中" },
              { type: "分类挂载异常", count: 3, items: "S-55102, G-49215 等", severity: "高" },
              { type: "元数据不完整", count: 3, items: "B-22912, V-10055 等", severity: "低" },
              { type: "版权信息过期", count: 1, items: "A-88330", severity: "高" },
            ].map((issue, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-6" style={{ fontWeight: 700 }}>#{i + 1}</span>
                  <div>
                    <p className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{issue.type}</p>
                    <p className="text-xs text-gray-400 mt-0.5">涉及: {issue.items}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs border ${issue.severity === "高" ? "bg-red-50 text-red-600 border-red-200" : issue.severity === "中" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-gray-100 text-gray-600 border-gray-200"}`} style={{ fontWeight: 500 }}>{issue.severity}</span>
                  <span className="text-sm text-gray-900 min-w-[30px] text-right" style={{ fontWeight: 600 }}>{issue.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Operation Report ───
export function OperationReportView() {
  const dailyOps = [
    { date: "03/24", 登录: 18, 编辑: 45, 审核: 22, 导出: 5 },
    { date: "03/25", 登录: 22, 编辑: 52, 审核: 18, 导出: 8 },
    { date: "03/26", 登录: 20, 编辑: 38, 审核: 28, 导出: 3 },
    { date: "03/27", 登录: 15, 编辑: 42, 审核: 15, 导出: 6 },
    { date: "03/28", 登录: 24, 编辑: 58, 审核: 32, 导出: 10 },
    { date: "03/29", 登录: 12, 编辑: 28, 审核: 10, 导出: 2 },
    { date: "03/30", 登录: 8, 编辑: 15, 审核: 5, 导出: 1 },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-gray-900" style={{ fontWeight: 700 }}>操作报表</h2>
          <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2" style={{ fontWeight: 500 }}>
            <Download className="w-4 h-4" /> 导出
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ReportCard title="本周操作" value="649" change="+85" up icon={Activity} color="text-indigo-600" bg="bg-indigo-50" />
          <ReportCard title="活跃用户" value="12" change="+2" up icon={Users} color="text-blue-600" bg="bg-blue-50" />
          <ReportCard title="日均登录" value="17" change="+3" up icon={Eye} color="text-emerald-600" bg="bg-emerald-50" />
          <ReportCard title="导出任务" value="35" change="+5" up icon={Download} color="text-purple-600" bg="bg-purple-50" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
            <BarChart3 className="w-4 h-4 text-indigo-500" /> 每日操作统计
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyOps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="编辑" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="审核" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="登录" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.05} strokeWidth={1.5} />
              <Area type="monotone" dataKey="导出" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.05} strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Shared ───
function ReportCard({ title, value, change, up, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <p className="text-xl text-gray-900" style={{ fontWeight: 700 }}>{value}</p>
          <div className={`flex items-center gap-1 mt-1 text-[10px] ${up ? "text-emerald-600" : "text-red-500"}`}>
            {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        </div>
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${color}`} />
        </div>
      </div>
    </div>
  );
}