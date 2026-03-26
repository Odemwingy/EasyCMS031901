import React, { useState } from "react";
import { 
  Search, Filter, Plus, ChevronDown, Settings2, Download, X,
  Image as ImageIcon, Film, Mic, Type, CheckCircle2, History,
  Globe, User, Tag, PlayCircle, Clock, FolderTree, 
  MoreVertical, Calendar, GripVertical, AlertCircle, LayoutList
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function ContentCenterView({ type }: { type: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const contentTypes: Record<string, string> = {
    all: "全部内容",
    video: "视频",
    audio: "音频",
    game: "游戏/应用",
    book: "有声书/电子书",
    service: "服务类/其他",
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Filters and Header */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{contentTypes[type] || "内容列表"}</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" /> 导出列表
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> 新增内容
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative min-w-[280px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索 内容ID / 名称 / 描述 / 提供商..." 
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 outline-none transition-colors"
            />
          </div>
          
          <FilterSelect label="内容类型" value="全部" options={["全部", "视频", "音频", "游戏"]} />
          <FilterSelect label="状态" value="上架" options={["全部", "编辑中", "待上架", "上架", "下架"]} />
          <FilterSelect label="语言" value="全部" options={["全部", "简体中文", "English", "日本語"]} />
          <FilterSelect label="签核状态" value="全部" options={["全部", "未提交", "待签核", "已签核"]} />
          
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200 transition-colors" title="更多筛选">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm uppercase">
            <tr>
              <th className="px-4 py-3 font-medium w-10">
                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              </th>
              <th className="px-4 py-3 font-medium">内容标识</th>
              <th className="px-4 py-3 font-medium">基本信息</th>
              <th className="px-4 py-3 font-medium">提供商</th>
              <th className="px-4 py-3 font-medium">分类</th>
              <th className="px-4 py-3 font-medium">生命周期</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">更新时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: 15 }).map((_, i) => (
              <tr key={i} className="hover:bg-indigo-50/50 transition-colors cursor-pointer group" onClick={() => setDrawerOpen(true)}>
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded w-max mb-1 border border-indigo-100">V-{10023 + i}</span>
                    <span className="text-xs text-gray-400">UUID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                  </div>
                </td>
                <td className="px-4 py-4 align-top max-w-[200px]">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-16 bg-gray-100 rounded shrink-0 border border-gray-200 overflow-hidden">
                      <ImageWithFallback src={`https://images.unsplash.com/photo-${1536440136628 + i}-849c177e76a1?w=100&h=150&fit=crop`} alt="cover" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate mb-0.5">测试影片名称 {i+1}</span>
                      <span className="text-xs text-gray-500 line-clamp-2">这是一段测试影片的描述信息，包含一些概要和介绍内容。</span>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[10px] px-1 py-0.5 bg-gray-100 rounded text-gray-500 border border-gray-200">视频</span>
                        <span className="text-[10px] px-1 py-0.5 bg-gray-100 rounded text-gray-500 border border-gray-200">中/英</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-top text-gray-600">
                  Disney+
                </td>
                <td className="px-4 py-4 align-top text-gray-600">
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 rounded-full border border-gray-200 mb-1">推荐</span><br/>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 rounded-full border border-gray-200">动作片</span>
                </td>
                <td className="px-4 py-4 align-top text-xs text-gray-500">
                  <div className="flex flex-col gap-1">
                    <span>起: 2026-03-01</span>
                    <span>止: 2027-03-01</span>
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center w-max px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      上架
                    </span>
                    <span className="inline-flex items-center w-max px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      已签核
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 align-top text-xs text-gray-400 font-mono">
                  2026-03-12 14:30
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-gray-200 flex items-center justify-between text-sm bg-white shrink-0">
        <span className="text-gray-500">共 150 条记录，当前显示 1-15 条</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 border border-gray-300 rounded text-gray-400 bg-gray-50 cursor-not-allowed">上一页</button>
          <button className="px-3 py-1 border border-indigo-600 rounded text-white bg-indigo-600">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">3</button>
          <span className="px-2 py-1 text-gray-400">...</span>
          <button className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">10</button>
          <button className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">下一页</button>
        </div>
      </div>

      {/* Detail Drawer */}
      {drawerOpen && (
        <>
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm z-20 transition-opacity" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-30 flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-200">
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                <span className="font-mono text-sm px-2 py-1 bg-indigo-100 text-indigo-700 rounded border border-indigo-200">V-10023</span>
                测试影片名称 1
              </h3>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm">
                  编辑
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" onClick={() => setDrawerOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 pt-4 border-b border-gray-200 flex gap-6 shrink-0 text-sm overflow-x-auto no-scrollbar">
              {[
                { id: 'info', label: '基本信息' },
                { id: 'meta', label: '元数据' },
                { id: 'asset', label: '预告/图片素材' },
                { id: 'sub', label: '字幕/音轨' },
                { id: 'class', label: '分类挂载' },
                { id: 'cycle', label: '周期与发布' },
                { id: 'log', label: '变更记录' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2">核心属性</h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                      <DetailRow label="内容标识 (ID)" value="V-10023" />
                      <DetailRow label="全局唯一标识 (UUID)" value="a1b2c3d4-e5f6-7890" />
                      <DetailRow label="内容类型" value="视频 (Video)" />
                      <DetailRow label="提供商" value="Disney+" />
                      <DetailRow label="原始语言" value="English" />
                      <DetailRow label="分级 (Rating)" value="PG-13" />
                      <DetailRow label="上架时间" value="2026-03-01 00:00:00" />
                      <DetailRow label="下架时间" value="2027-03-01 23:59:59" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2">文件描述信息</h4>
                    <div className="space-y-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-500">默认标题</span>
                        <span className="text-gray-900 font-medium">测试影片名称 1</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-500">内容简介</span>
                        <p className="text-gray-800 leading-relaxed bg-gray-50 p-3 rounded border border-gray-100">这是一段测试影片的描述信息，包含一些概要和介绍内容。本影片主要讲述了在未来世界中，人类为了拯救家园而展开的一系列冒险故事。特效精美，剧情紧凑，适合全家人一起观看。</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'meta' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2">扩展元数据</h4>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                      <div className="col-span-2">
                        <DetailRow label="演职员表" value="" />
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-200 flex items-center gap-1"><User className="w-3 h-3"/> 导演: 张三</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200 flex items-center gap-1"><User className="w-3 h-3"/> 主演: 李四</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200 flex items-center gap-1"><User className="w-3 h-3"/> 主演: 王五</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Tag className="w-3.5 h-3.5"/> 风格标签</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">科幻</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">动作</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">冒险</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Globe className="w-3.5 h-3.5"/> 发行地区</span>
                        <span className="text-sm font-medium text-gray-900 mt-1">全球 (Global)</span>
                      </div>

                      <DetailRow label="发行年份" value="2025" />
                      <DetailRow label="正片时长" value="128 分钟 (02:08:00)" />
                      <DetailRow label="分辨率" value="4K (3840x2160)" />
                      <DetailRow label="色彩空间" value="HDR10 / Dolby Vision" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'asset' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-500" /> 图片素材
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="border border-gray-200 rounded-lg p-2 flex flex-col gap-2">
                        <div className="aspect-[2/3] bg-gray-100 rounded overflow-hidden relative group">
                          <ImageWithFallback src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop" alt="Poster" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button className="p-2 bg-white rounded-full text-gray-900 hover:text-indigo-600"><Search className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="text-xs text-center">
                          <p className="font-medium text-gray-800">竖版海报 (Poster)</p>
                          <p className="text-gray-500">1200 x 1800 px</p>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-2 flex flex-col gap-2 col-span-2">
                        <div className="aspect-[16/9] bg-gray-100 rounded overflow-hidden relative group">
                          <ImageWithFallback src="https://images.unsplash.com/photo-1695114584354-13e1910d491b?w=800&h=450&fit=crop" alt="Banner" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button className="p-2 bg-white rounded-full text-gray-900 hover:text-indigo-600"><Search className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="text-xs text-center">
                          <p className="font-medium text-gray-800">横版横幅 (Banner / Backdrop)</p>
                          <p className="text-gray-500">1920 x 1080 px</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2 flex items-center gap-2">
                      <Film className="w-4 h-4 text-indigo-500" /> 视频预告
                    </h4>
                    <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-4 hover:border-indigo-300 transition-colors">
                      <div className="w-32 aspect-video bg-gray-900 rounded relative flex items-center justify-center group overflow-hidden">
                         <ImageWithFallback src="https://images.unsplash.com/photo-1695114584354-13e1910d491b?w=300&h=168&fit=crop" alt="Trailer" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                        <PlayCircle className="w-8 h-8 text-white relative z-10 opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900">官方正式预告片 (Official Trailer)</h5>
                        <p className="text-xs text-gray-500 mt-1">MP4 • 1080p • 02:15 • 150MB</p>
                      </div>
                      <button className="px-3 py-1.5 text-xs text-indigo-600 border border-indigo-200 rounded bg-indigo-50 hover:bg-indigo-100 font-medium transition-colors">
                        播放
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sub' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2 flex items-center gap-2">
                      <Mic className="w-4 h-4 text-indigo-500" /> 音轨列表
                    </h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-2 font-medium">语言</th>
                            <th className="px-4 py-2 font-medium">编码格式</th>
                            <th className="px-4 py-2 font-medium">声道</th>
                            <th className="px-4 py-2 font-medium">默认</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="px-4 py-2 text-gray-900 font-medium">English (英语)</td>
                            <td className="px-4 py-2 text-gray-600">Dolby Digital Plus (E-AC-3)</td>
                            <td className="px-4 py-2 text-gray-600">5.1</td>
                            <td className="px-4 py-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-gray-900 font-medium">中文 (Mandarin)</td>
                            <td className="px-4 py-2 text-gray-600">AAC</td>
                            <td className="px-4 py-2 text-gray-600">2.0</td>
                            <td className="px-4 py-2 text-gray-300">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2 flex items-center gap-2">
                      <Type className="w-4 h-4 text-indigo-500" /> 字幕列表
                    </h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-2 font-medium">语言</th>
                            <th className="px-4 py-2 font-medium">格式</th>
                            <th className="px-4 py-2 font-medium">类型</th>
                            <th className="px-4 py-2 font-medium">默认</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="px-4 py-2 text-gray-900 font-medium">简体中文 (Simplified Chinese)</td>
                            <td className="px-4 py-2 text-gray-600">WebVTT / SRT</td>
                            <td className="px-4 py-2 text-gray-600">普通字幕</td>
                            <td className="px-4 py-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-gray-900 font-medium">English (英语)</td>
                            <td className="px-4 py-2 text-gray-600">WebVTT</td>
                            <td className="px-4 py-2 text-gray-600">SDH (听障辅助)</td>
                            <td className="px-4 py-2 text-gray-300">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'class' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-bold text-gray-900 border-l-4 border-indigo-500 pl-2 flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-indigo-500" /> 分类挂载关系
                      </h4>
                      <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">管理挂载</button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded border border-indigo-200">主分类</span>
                          <span className="text-sm font-medium text-gray-800">Global Platform &gt; 2026 Q1 Release &gt; 电影分类 &gt; 动作片</span>
                        </div>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">已生效</span>
                      </div>
                      
                      <div className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded border border-gray-300">次分类</span>
                          <span className="text-sm font-medium text-gray-800">Global Platform &gt; 2026 Q1 Release &gt; 首页推荐 &gt; 猜你喜欢</span>
                        </div>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">已生效</span>
                      </div>

                      <div className="p-3 border border-amber-100 rounded-lg bg-amber-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded border border-gray-300">次分类</span>
                          <span className="text-sm font-medium text-gray-800">APAC Region &gt; 2026 Q1 Release &gt; 热门专区</span>
                        </div>
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">待发布</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cycle' && (
                <div className="space-y-6 h-full flex flex-col">
                  <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm shrink-0">
                    <h4 className="text-sm font-bold text-gray-900 border-l-4 border-indigo-500 pl-2 flex items-center gap-2">
                      <LayoutList className="w-4 h-4 text-indigo-500" /> 发布看板 (Release Board)
                    </h4>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 font-medium transition-colors">新建发布任务</button>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex gap-4 overflow-x-auto no-scrollbar pb-2 min-h-[400px]">
                    {/* Columns */}
                    {[
                      {
                        title: "待规划 (Backlog)",
                        count: 2,
                        color: "bg-gray-100 border-gray-200 text-gray-700",
                        items: [
                          { id: "T-01", title: "北美区内容上架准备", region: "North America", date: "待定", priority: "普通" },
                          { id: "T-02", title: "本地化字幕适配", region: "Global", date: "待定", priority: "低" },
                        ]
                      },
                      {
                        title: "准备中 (In Progress)",
                        count: 1,
                        color: "bg-blue-50 border-blue-200 text-blue-700",
                        items: [
                          { id: "T-03", title: "亚太区市场宣传物料分发", region: "APAC", date: "2026-03-20", priority: "高" },
                        ]
                      },
                      {
                        title: "待签核 (Review)",
                        count: 1,
                        color: "bg-amber-50 border-amber-200 text-amber-700",
                        items: [
                          { id: "T-04", title: "Global Platform Q1 首发", region: "Global", date: "2026-03-15", priority: "高" },
                        ]
                      },
                      {
                        title: "已发布 (Published)",
                        count: 2,
                        color: "bg-emerald-50 border-emerald-200 text-emerald-700",
                        items: [
                          { id: "T-05", title: "内测联调发布 (Test Env)", region: "Internal", date: "2026-03-01", priority: "中" },
                          { id: "T-06", title: "欧洲区预热页面上线", region: "Europe", date: "2026-03-10", priority: "中" },
                        ]
                      }
                    ].map(col => (
                      <div key={col.title} className="w-72 shrink-0 flex flex-col bg-gray-100/50 rounded-lg border border-gray-200">
                        <div className={`px-3 py-2 border-b flex justify-between items-center rounded-t-lg ${col.color}`}>
                          <span className="font-bold text-sm">{col.title}</span>
                          <span className="px-2 py-0.5 bg-white/60 rounded-full text-xs font-mono">{col.count}</span>
                        </div>
                        <div className="p-2 flex-1 flex flex-col gap-2 overflow-y-auto">
                          {col.items.map(item => (
                            <div key={item.id} className="bg-white p-3 rounded shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors group cursor-grab active:cursor-grabbing">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-1.5">
                                  <GripVertical className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <span className="text-xs font-mono px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">{item.id}</span>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                              <h5 className="text-sm font-medium text-gray-900 mb-3 leading-snug">{item.title}</h5>
                              
                              <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                  <Globe className="w-3.5 h-3.5" /> {item.region}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {item.date}</span>
                                  <span className={`px-1.5 py-0.5 rounded ${
                                    item.priority === '高' ? 'bg-red-50 text-red-600 border border-red-100' :
                                    item.priority === '中' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                    'bg-gray-50 text-gray-600 border border-gray-100'
                                  }`}>{item.priority}</span>
                                </div>
                              </div>
                              
                              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                                <div className="flex -space-x-1">
                                  <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] text-indigo-700 font-bold">A</div>
                                  <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] text-emerald-700 font-bold">U</div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>0/3</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          <button className="flex items-center justify-center gap-1.5 py-2 mt-1 text-xs text-gray-500 hover:text-indigo-600 hover:bg-white rounded border border-transparent hover:border-indigo-200 transition-colors border-dashed">
                            <Plus className="w-3.5 h-3.5" /> 添加任务
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'log' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-6 border-l-4 border-indigo-500 pl-2 flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-500" /> 变更时间线
                    </h4>
                    
                    <div className="relative pl-4 border-l-2 border-gray-100 space-y-6 pb-2 ml-2">
                      <div className="relative">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-100"></div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-400 font-mono">2026-03-12 14:30:22</span>
                          <span className="text-sm font-medium text-gray-900">完成签核，状态变更为「已签核」</span>
                          <span className="text-xs text-gray-500">操作人: System Auto</span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white ring-2 ring-indigo-100"></div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-400 font-mono">2026-03-11 09:15:00</span>
                          <span className="text-sm font-medium text-gray-900">更新扩展元数据</span>
                          <span className="text-xs text-gray-500">操作人: Admin User</span>
                          <div className="mt-1 p-2 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 font-mono">
                            [修改] 发行年份: 2024 -&gt; 2025
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 bg-gray-300 rounded-full border-2 border-white"></div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-400 font-mono">2026-03-10 16:45:11</span>
                          <span className="text-sm font-medium text-gray-900">导入素材资源：横版海报.jpg, 预告片.mp4</span>
                          <span className="text-xs text-gray-500">操作人: Content Provider (API)</span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 bg-gray-300 rounded-full border-2 border-white"></div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-400 font-mono">2026-03-10 16:40:00</span>
                          <span className="text-sm font-medium text-gray-900">创建内容对象，生成 UUID</span>
                          <span className="text-xs text-gray-500">操作人: Content Provider (API)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FilterSelect({ label, value, options }: { label: string, value: string, options: string[] }) {
  return (
    <div className="flex items-center text-sm border border-gray-300 rounded overflow-hidden group hover:border-indigo-400 transition-colors bg-white h-9 relative">
      <span className="px-3 py-1.5 bg-gray-50 border-r border-gray-300 text-gray-600 font-medium shrink-0">{label}</span>
      <select className="pl-3 pr-8 py-1.5 bg-transparent outline-none text-gray-800 cursor-pointer min-w-24 w-full appearance-none">
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 pointer-events-none group-hover:text-indigo-400" />
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
