import React from "react";
import { CheckCircle2, AlertCircle, Clock, FileEdit, TrendingUp, Search, FolderTree, ChevronRight } from "lucide-react";

export function WorkbenchView() {
  return (
    <div className="p-6 h-full flex flex-col md:flex-row gap-6 bg-gray-50/50">
      {/* Left Column: Classification tree & quick search */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-500" />
            快速查找
          </h3>
          <div className="relative mb-4">
            <input 
              type="text" 
              placeholder="输入内容ID或名称..." 
              className="w-full h-9 bg-gray-50 border border-gray-200 rounded-md px-3 text-sm focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
          
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2 pt-2 border-t border-gray-100">
            <FolderTree className="w-4 h-4 text-indigo-500" />
            发布分类树
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 text-sm text-gray-600">
            <TreeItem title="首页推荐" active />
            <div className="pl-4 border-l border-gray-100 ml-2">
              <TreeItem title="电影精选" />
              <TreeItem title="少儿频道" />
              <TreeItem title="热播剧集" badge="3" />
            </div>
            <TreeItem title="分类导航" />
            <div className="pl-4 border-l border-gray-100 ml-2">
              <TreeItem title="动作片" />
              <TreeItem title="喜剧片" />
              <TreeItem title="纪录片" badge="新" />
            </div>
            <TreeItem title="体育赛事" />
            <TreeItem title="游戏专区" />
            <TreeItem title="服务与应用" />
          </div>
        </div>
      </div>

      {/* Right Column: Dashboards */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
        
        {/* Top metrics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <MetricCard title="我的待办" value="12" icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
          <MetricCard title="周期里程碑" value="3" icon={TrendingUp} color="text-indigo-600" bg="bg-indigo-50" />
          <MetricCard title="变更申请" value="5" icon={FileEdit} color="text-blue-600" bg="bg-blue-50" />
          <MetricCard title="异常提醒" value="2" icon={AlertCircle} color="text-red-600" bg="bg-red-50" />
        </div>

        {/* Milestone & Timeline */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              周期里程碑 (2026-Q1-Release)
            </h3>
            <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded border border-amber-200">进行中</span>
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

        {/* Todo List & Anomaly split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-80 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900">我的待办</h3>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">查看全部</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              <TaskItem title="《流浪地球3》预告片审核" desc="视频内容 - 缺少中文字幕" time="2小时前" type="audit" />
              <TaskItem title="首页推荐配置项变更签核" desc="分类集配置 - 增加春季大促版块" time="4小时前" type="sign" />
              <TaskItem title="批量导入任务失败处理" desc="导入中心 - 包含5个非法格式文件" time="1天前" type="import" />
              <TaskItem title="音频内容版权信息更新" desc="音频 - 需补充发行年份" time="1天前" type="edit" />
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-80 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900">异常提醒</h3>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">查看全部</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              <AlertItem title="完整性校验失败" desc="周期：2026-Q1-Release。共计 12 个对象缺少必要图片素材。" severity="high" />
              <AlertItem title="导出任务超时" desc="任务ID：EXP-20260312-001。导出节点服务器响应缓慢。" severity="medium" />
              <AlertItem title="内容状态异常" desc="有 3 个已上架内容被源系统标记为下架状态。" severity="high" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeItem({ title, badge, active }: { title: string, badge?: string, active?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer mb-1 transition-colors ${active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-50'}`}>
      <div className="flex items-center gap-2">
        <ChevronRight className={`w-3.5 h-3.5 ${active ? 'text-indigo-500' : 'text-gray-400'}`} />
        <span>{title}</span>
      </div>
      {badge && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">{badge}</span>}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  );
}

function Step({ title, date, status }: { title: string, date: string, status: 'done' | 'active' | 'pending' }) {
  const isDone = status === 'done';
  const isActive = status === 'active';
  
  return (
    <div className="flex flex-col items-center relative z-10">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white ${isDone ? 'border-emerald-500 text-emerald-500' : isActive ? 'border-indigo-600 text-indigo-600 ring-4 ring-indigo-100' : 'border-gray-200 text-gray-300'}`}>
        {isDone ? <CheckCircle2 className="w-5 h-5" /> : <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
      </div>
      <p className={`text-xs font-semibold mt-2 whitespace-nowrap ${isActive ? 'text-indigo-700' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>{title}</p>
      <p className={`text-[10px] ${isActive ? 'text-indigo-500' : 'text-gray-400'}`}>{date}</p>
    </div>
  );
}

function StepConnector({ status }: { status: 'done' | 'active' | 'pending' }) {
  const color = status === 'done' ? 'bg-emerald-500' : status === 'active' ? 'bg-indigo-500' : 'bg-gray-200';
  return <div className={`flex-1 h-0.5 mx-2 -mt-6 ${color}`} />;
}

function TaskItem({ title, desc, time, type }: { title: string, desc: string, time: string, type: string }) {
  const typeMap: Record<string, { label: string, color: string }> = {
    audit: { label: '审核', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    sign: { label: '签核', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    import: { label: '导入', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    edit: { label: '编辑', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  };
  
  const config = typeMap[type] || { label: '任务', color: 'bg-gray-100 text-gray-700 border-gray-200' };

  return (
    <div className="p-3 border border-gray-100 bg-gray-50/50 rounded-lg hover:bg-gray-50 hover:border-indigo-100 transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{title}</h4>
        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{time}</span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${config.color}`}>
          {config.label}
        </span>
        <p className="text-xs text-gray-500 truncate flex-1">{desc}</p>
      </div>
    </div>
  );
}

function AlertItem({ title, desc, severity }: { title: string, desc: string, severity: 'high' | 'medium' }) {
  return (
    <div className={`p-3 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer ${severity === 'high' ? 'bg-red-50/30 border-red-100' : 'bg-amber-50/30 border-amber-100'}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <AlertCircle className={`w-4 h-4 ${severity === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
        <h4 className={`text-sm font-semibold ${severity === 'high' ? 'text-red-800' : 'text-amber-800'}`}>{title}</h4>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}
