import React, { useState } from "react";
import {
  CheckCircle2, AlertCircle, Clock, FileEdit, TrendingUp, Search,
  FolderTree, ChevronRight, ArrowUpRight, ArrowDownRight, Activity,
  BarChart3, PieChart as PieChartIcon, Layers, Package, Film, Headphones,
  Gamepad2, BookOpen, RefreshCw, ExternalLink, Calendar, Users
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, Legend
} from "recharts";

// ─── Mock Data ───
const contentByType = [
  { name: "视频", value: 156, color: "#6366f1" },
  { name: "音频", value: 48, color: "#8b5cf6" },
  { name: "游戏", value: 32, color: "#ec4899" },
  { name: "有声书", value: 24, color: "#f59e0b" },
  { name: "服务类", value: 12, color: "#10b981" },
];

const weeklyTrend = [
  { day: "03/24", 新增: 8, 上架: 12, 下架: 3 },
  { day: "03/25", 新增: 15, 上架: 9, 下架: 5 },
  { day: "03/26", 新增: 12, 上架: 18, 下架: 2 },
  { day: "03/27", 新增: 6, 上架: 14, 下架: 8 },
  { day: "03/28", 新增: 22, 上架: 20, 下架: 4 },
  { day: "03/29", 新增: 18, 上架: 16, 下架: 6 },
  { day: "03/30", 新增: 10, 上架: 11, 下架: 3 },
];

const qualityData = [
  { name: "完整", value: 218, color: "#10b981" },
  { name: "警告", value: 35, color: "#f59e0b" },
  { name: "异常", value: 19, color: "#ef4444" },
];

const providerData = [
  { name: "Disney+", 内容数: 42 },
  { name: "Netflix", 内容数: 38 },
  { name: "iQIYI", 内容数: 35 },
  { name: "Tencent", 内容数: 28 },
  { name: "HBO Max", 内容数: 22 },
  { name: "Apple TV+", 内容数: 18 },
  { name: "Bilibili", 内容数: 15 },
  { name: "Others", 内容数: 74 },
];

const signoffProgress = [
  { name: "W1", 已签核: 45, 待签核: 30, 已驳回: 5 },
  { name: "W2", 已签核: 62, 待签核: 22, 已驳回: 8 },
  { name: "W3", 已签核: 85, 待签核: 15, 已驳回: 3 },
  { name: "W4", 已签核: 110, 待签核: 8, 已驳回: 2 },
];

export function WorkbenchView() {
  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50/50">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Welcome & Quick Stats */}
        <div className="flex flex-wrap gap-4 items-start justify-between">
          <div>
            <h1 className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>欢迎回来, Admin</h1>
            <p className="text-sm text-gray-500 mt-1">2026年3月30日 星期一 · 周期: 2026-Q1-Release</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2" style={{ fontWeight: 500 }}>
              <RefreshCw className="w-4 h-4" /> 刷新数据
            </button>
            <button className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm" style={{ fontWeight: 500 }}>
              <ExternalLink className="w-4 h-4" /> 进入内容中心
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="内容总数" value="272" change="+12" up icon={Layers} color="text-indigo-600" bg="bg-indigo-50" />
          <MetricCard title="本周上架" value="38" change="+8" up icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
          <MetricCard title="待处理任务" value="15" change="-3" up={false} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
          <MetricCard title="质量异常" value="19" change="+2" up icon={AlertCircle} color="text-red-600" bg="bg-red-50" />
        </div>

        {/* Milestone Timeline */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm text-gray-900 flex items-center gap-2" style={{ fontWeight: 700 }}>
              <Activity className="w-5 h-5 text-indigo-500" />
              周期里程碑 (2026-Q1-Release)
            </h3>
            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded border border-amber-200" style={{ fontWeight: 500 }}>进行中</span>
          </div>
          <div className="flex items-center w-full mt-8 mb-4 px-4">
            <Step title="录入与挂载" date="03/01" status="done" />
            <StepConnector status="done" />
            <Step title="状态检查" date="03/10" status="done" />
            <StepConnector status="active" />
            <Step title="签核审批" date="03/15" status="active" />
            <StepConnector status="pending" />
            <Step title="完整性校验" date="03/20" status="pending" />
            <StepConnector status="pending" />
            <Step title="导出与发布" date="03/25" status="pending" />
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content Trend */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm text-gray-900 flex items-center gap-2" style={{ fontWeight: 700 }}>
                <TrendingUp className="w-4 h-4 text-indigo-500" /> 本周内容动态趋势
              </h3>
              <div className="flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-indigo-500 rounded-full" />新增</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-emerald-500 rounded-full" />上架</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-red-400 rounded-full" />下架</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Area type="monotone" dataKey="新增" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="上架" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="下架" stroke="#f87171" fill="#f87171" fillOpacity={0.05} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Content by Type */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm text-gray-900 flex items-center gap-2 mb-2" style={{ fontWeight: 700 }}>
              <PieChartIcon className="w-4 h-4 text-indigo-500" /> 内容类型分布
            </h3>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={contentByType} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {contentByType.map((entry, idx) => <Cell key={`type-${idx}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs mt-1">
              {contentByType.map(d => (
                <span key={d.name} className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Provider Distribution */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm text-gray-900 flex items-center gap-2 mb-4" style={{ fontWeight: 700 }}>
              <BarChart3 className="w-4 h-4 text-indigo-500" /> 提供商内容分布
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={providerData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="内容数" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Signoff Progress */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm text-gray-900 flex items-center gap-2 mb-4" style={{ fontWeight: 700 }}>
              <FileEdit className="w-4 h-4 text-indigo-500" /> 签核进度 (按周)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={signoffProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="已签核" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={28} />
                <Bar dataKey="待签核" stackId="a" fill="#a78bfa" radius={[0, 0, 0, 0]} />
                <Bar dataKey="已驳回" stackId="a" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-emerald-500 rounded-full" />已签核</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-purple-400 rounded-full" />待签核</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-red-400 rounded-full" />已驳回</span>
            </div>
          </div>
        </div>

        {/* Quality + Todos Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quality Overview */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm text-gray-900 flex items-center gap-2 mb-4" style={{ fontWeight: 700 }}>
              <CheckCircle2 className="w-4 h-4 text-indigo-500" /> 质量概览
            </h3>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={qualityData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {qualityData.map((entry, idx) => <Cell key={`quality-${idx}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {qualityData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* My Todos */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm text-gray-900" style={{ fontWeight: 700 }}>我的待办</h3>
              <button className="text-xs text-indigo-600 hover:text-indigo-700" style={{ fontWeight: 500 }}>查看全部</button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto">
              <TaskItem title="《流浪地球3》预告片审核" desc="视频内容 - 缺少中文字幕" time="2小时前" type="audit" />
              <TaskItem title="首页推荐配置项变更签核" desc="分类集配置 - 增加春季大促版块" time="4小时前" type="sign" />
              <TaskItem title="批量导入任务失败处理" desc="导入中心 - 包含5个非法格式文件" time="1天前" type="import" />
              <TaskItem title="音频内容版权信息更新" desc="音频 - 需补充发行年份" time="1天前" type="edit" />
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm text-gray-900" style={{ fontWeight: 700 }}>异常提醒</h3>
              <button className="text-xs text-indigo-600 hover:text-indigo-700" style={{ fontWeight: 500 }}>查看全部</button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto">
              <AlertItem title="完整性校验失败" desc="周期：2026-Q1-Release。共计 12 个对象缺少必要图片素材。" severity="high" />
              <AlertItem title="导出任务超时" desc="任务ID：EXP-20260312-001。导出节点服务器响应缓慢。" severity="medium" />
              <AlertItem title="内容状态异常" desc="有 3 个已上架内容被源系统标记为下架状态。" severity="high" />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 700 }}>快捷入口</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { icon: Film, label: "视频管理", color: "text-indigo-600 bg-indigo-50" },
              { icon: Headphones, label: "音频管理", color: "text-purple-600 bg-purple-50" },
              { icon: Gamepad2, label: "游戏管理", color: "text-pink-600 bg-pink-50" },
              { icon: BookOpen, label: "有声书管理", color: "text-amber-600 bg-amber-50" },
              { icon: FolderTree, label: "分类树", color: "text-emerald-600 bg-emerald-50" },
              { icon: Calendar, label: "周期管理", color: "text-blue-600 bg-blue-50" },
            ].map(item => (
              <button key={item.label} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all group cursor-pointer">
                <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-700 group-hover:text-indigo-600 transition-colors" style={{ fontWeight: 500 }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub Components ───
function MetricCard({ title, value, change, up, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>{value}</p>
          <div className={`flex items-center gap-1 mt-1 text-xs ${up ? "text-emerald-600" : "text-red-500"}`}>
            {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{change} 较上周</span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

function Step({ title, date, status }: { title: string; date: string; status: "done" | "active" | "pending" }) {
  const isDone = status === "done";
  const isActive = status === "active";
  return (
    <div className="flex flex-col items-center relative z-10">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white ${isDone ? "border-emerald-500 text-emerald-500" : isActive ? "border-indigo-600 text-indigo-600 ring-4 ring-indigo-100" : "border-gray-200 text-gray-300"}`}>
        {isDone ? <CheckCircle2 className="w-5 h-5" /> : <div className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-indigo-600" : "bg-gray-200"}`} />}
      </div>
      <p className={`text-xs mt-2 whitespace-nowrap ${isActive ? "text-indigo-700" : isDone ? "text-gray-700" : "text-gray-400"}`} style={{ fontWeight: 600 }}>{title}</p>
      <p className={`text-[10px] ${isActive ? "text-indigo-500" : "text-gray-400"}`}>{date}</p>
    </div>
  );
}

function StepConnector({ status }: { status: "done" | "active" | "pending" }) {
  const color = status === "done" ? "bg-emerald-500" : status === "active" ? "bg-indigo-500" : "bg-gray-200";
  return <div className={`flex-1 h-0.5 mx-2 -mt-6 ${color}`} />;
}

function TaskItem({ title, desc, time, type }: { title: string; desc: string; time: string; type: string }) {
  const typeMap: Record<string, { label: string; color: string }> = {
    audit: { label: "审核", color: "bg-amber-100 text-amber-700 border-amber-200" },
    sign: { label: "签核", color: "bg-purple-100 text-purple-700 border-purple-200" },
    import: { label: "导入", color: "bg-blue-100 text-blue-700 border-blue-200" },
    edit: { label: "编辑", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  };
  const config = typeMap[type] || { label: "任务", color: "bg-gray-100 text-gray-700 border-gray-200" };
  return (
    <div className="p-3 border border-gray-100 bg-gray-50/50 rounded-lg hover:bg-gray-50 hover:border-indigo-100 transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm text-gray-800 group-hover:text-indigo-600 transition-colors" style={{ fontWeight: 600 }}>{title}</h4>
        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{time}</span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${config.color}`} style={{ fontWeight: 500 }}>{config.label}</span>
        <p className="text-xs text-gray-500 truncate flex-1">{desc}</p>
      </div>
    </div>
  );
}

function AlertItem({ title, desc, severity }: { title: string; desc: string; severity: "high" | "medium" }) {
  return (
    <div className={`p-3 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer ${severity === "high" ? "bg-red-50/30 border-red-100" : "bg-amber-50/30 border-amber-100"}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <AlertCircle className={`w-4 h-4 ${severity === "high" ? "text-red-500" : "text-amber-500"}`} />
        <h4 className={`text-sm ${severity === "high" ? "text-red-800" : "text-amber-800"}`} style={{ fontWeight: 600 }}>{title}</h4>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}