import React, { useState } from "react";
import { FolderTree, ChevronRight, ChevronDown, CheckCircle2, XCircle, Search, Filter, MoreHorizontal, Download, PlayCircle, Eye, RefreshCw, Upload, FolderPlus } from "lucide-react";

export function CategoryTreeLayout() {
  const [selectedNode, setSelectedNode] = useState("n1-1");

  return (
    <div className="flex h-full bg-white">
      {/* Left Tree */}
      <div className="w-64 border-r border-gray-200 flex flex-col bg-gray-50/30 shrink-0">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 sticky top-0">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-indigo-500" />
            发布分类树
          </h3>
          <button className="text-gray-400 hover:text-indigo-600 transition-colors">
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索节点..." 
              className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-gray-200 rounded focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
          <div className="space-y-0.5 text-sm overflow-y-auto max-h-[calc(100vh-220px)] pb-10">
            <TreeNode title="Global Platform" id="root" expanded>
              <TreeNode title="2026 Q1 Release" id="n1" expanded>
                <TreeNode title="首页推荐" id="n1-1" active={selectedNode === "n1-1"} onClick={() => setSelectedNode("n1-1")} count={42} />
                <TreeNode title="电影分类" id="n1-2" expanded>
                  <TreeNode title="动作片" id="n1-2-1" active={selectedNode === "n1-2-1"} onClick={() => setSelectedNode("n1-2-1")} count={15} />
                  <TreeNode title="喜剧片" id="n1-2-2" active={selectedNode === "n1-2-2"} onClick={() => setSelectedNode("n1-2-2")} count={8} />
                </TreeNode>
                <TreeNode title="少儿专区" id="n1-3" active={selectedNode === "n1-3"} onClick={() => setSelectedNode("n1-3")} count={24} />
              </TreeNode>
              <TreeNode title="2025 Q4 History" id="n2" />
            </TreeNode>
          </div>
        </div>
      </div>

      {/* Right Content Table */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              首页推荐 <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">42 项内容</span>
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" /> 校验通过 (38)
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 rounded border border-red-100">
                <XCircle className="w-3.5 h-3.5" /> 异常 (4)
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" /> 批量挂类
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> 执行校验
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
              <Download className="w-4 h-4" /> 创建快照
            </button>
          </div>
        </div>

        <div className="p-4 flex gap-2 items-center border-b border-gray-100 bg-gray-50/50 text-sm overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-gray-500 whitespace-nowrap">内容类型:</span>
            <select className="border border-gray-300 rounded px-2 py-1 bg-white outline-none min-w-24 focus:border-indigo-500">
              <option>全部</option>
              <option>视频</option>
              <option>游戏</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mr-4">
            <span className="text-gray-500 whitespace-nowrap">状态:</span>
            <select className="border border-gray-300 rounded px-2 py-1 bg-white outline-none min-w-24 focus:border-indigo-500">
              <option>全部</option>
              <option>异常</option>
              <option>正常</option>
            </select>
          </div>
          <div className="flex-1 relative max-w-sm ml-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索内容名称/ID..." 
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium w-8">
                  <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                </th>
                <th className="px-4 py-3 font-medium">内容名称 / ID</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">状态清单</th>
                <th className="px-4 py-3 font-medium">异常说明</th>
                <th className="px-4 py-3 font-medium">签核状态</th>
                <th className="px-4 py-3 font-medium w-24">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { id: "V-10023", name: "流浪地球3 预告", type: "视频", status: "error", error: "缺少预告图片素材", sign: "待签核" },
                { id: "G-49210", name: "原神 (V4.5)", type: "游戏", status: "ok", error: "-", sign: "已签核" },
                { id: "A-88321", name: "周杰伦 - 稻香", type: "音频", status: "ok", error: "-", sign: "已签核" },
                { id: "V-10045", name: "三体 第1集", type: "视频", status: "error", error: "英文音轨缺失", sign: "已签核" },
                { id: "V-10046", name: "三体 第2集", type: "视频", status: "ok", error: "-", sign: "已签核" },
                { id: "B-22910", name: "哈利波特有声书", type: "有声书", status: "ok", error: "-", sign: "已签核" },
                { id: "S-55102", name: "天气预报组件", type: "服务类", status: "error", error: "分类挂载不符合规则", sign: "待变更" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors cursor-pointer">{row.name}</span>
                      <span className="text-xs text-gray-400 font-mono">{row.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{row.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    {row.status === 'ok' ? (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> 完整
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-500">
                        <XCircle className="w-4 h-4" /> 异常
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-500" title={row.error}>
                    {row.error}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${row.sign === '已签核' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                      {row.sign}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    <div className="flex items-center gap-2">
                      <button className="hover:text-indigo-600 transition-colors" title="查看详情"><Eye className="w-4 h-4" /></button>
                      <button className="hover:text-indigo-600 transition-colors" title="更多操作"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-3 border-t border-gray-200 flex items-center justify-between text-sm bg-white shrink-0">
          <span className="text-gray-500">共 42 条记录，当前显示 1-7 条</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-300 rounded text-gray-400 bg-gray-50 cursor-not-allowed">上一页</button>
            <button className="px-3 py-1 border border-indigo-600 rounded text-white bg-indigo-600">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">下一页</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeNode({ title, count, active, expanded = false, children, onClick }: any) {
  const [isOpen, setIsOpen] = useState(expanded);
  const hasChildren = !!children;

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div 
        className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors group ${active ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
        onClick={onClick}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {hasChildren ? (
            <button onClick={toggle} className="p-0.5 hover:bg-gray-200 rounded text-gray-400 shrink-0">
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-4.5 shrink-0" />
          )}
          <span className="truncate flex-1" title={title}>{title}</span>
        </div>
        {count !== undefined && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium ${active ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'}`}>
            {count}
          </span>
        )}
      </div>
      {hasChildren && isOpen && (
        <div className="pl-4 ml-2 border-l border-gray-200 mt-0.5 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}
