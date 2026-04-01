import React, { useState, useMemo } from "react";
import {
  Search, Filter, Plus, ChevronDown, Settings2, Download, X,
  Image as ImageIcon, Film, Mic, Type, CheckCircle2, History,
  Globe, User, Tag, PlayCircle, Clock, FolderTree,
  MoreVertical, Calendar, GripVertical, AlertCircle, LayoutList,
  LayoutGrid, List, ArrowUpDown, RefreshCw, Trash2, Copy,
  ExternalLink, Star, StarOff, Eye, EyeOff, Package,
  FileText, Gamepad2, Headphones, BookOpen, Tv, Upload,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  SlidersHorizontal, XCircle, Columns3, Bookmark, Share2,
  BarChart3, TrendingUp, Layers, Archive, Lock
} from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

// ─── Mock Data ───
const PROVIDERS = ["Disney+", "Netflix", "HBO Max", "Apple TV+", "Amazon Prime", "iQIYI", "Bilibili", "Tencent Video", "Sony Pictures", "Warner Bros."];
const CATEGORIES_POOL = ["动作", "喜剧", "科幻", "纪录片", "动画", "悬疑", "恐怖", "爱情", "冒险", "历史", "音乐", "体育", "少儿", "真人秀"];
const LANGUAGES = ["中文", "English", "日本語", "한국어", "Français", "Deutsch", "Español"];
const RATINGS = ["G", "PG", "PG-13", "R", "NC-17", "TV-14", "TV-MA"];

type ContentStatus = "上架" | "下架" | "编辑中" | "待上架" | "已归档";
type SignStatus = "未提交" | "待签核" | "已签核" | "已驳回";
type ContentType = "视频" | "音频" | "游戏" | "有声书" | "服务类";
type ContentLifecycle = "草案" | "信息完善中" | "待初始签核" | "初始签核通过" | "待全量签核" | "全量签核通过" | "已发布" | "已下线";

interface ContentItem {
  id: string;
  uuid: string;
  title: string;
  description: string;
  type: ContentType;
  subType: string;
  provider: string;
  categories: string[];
  languages: string[];
  rating: string;
  status: ContentStatus;
  signStatus: SignStatus;
  lifecycle: ContentLifecycle;
  startDate: string;
  endDate: string;
  updatedAt: string;
  createdAt: string;
  starred: boolean;
  completeness: number;
  imageIdx: number;
  duration: string;
  year: string;
}

function generateMockData(): ContentItem[] {
  const titles: { type: ContentType; items: { title: string; desc: string }[] }[] = [
    {
      type: "视频", items: [
        { title: "流浪地球 3", desc: "在太阳危机加剧的背景下，人类面临前所未有的挑战，多国联合太空计划启动。" },
        { title: "三体 第二季", desc: "面壁者计划进入关键阶段，罗辑的终极威慑能否改变文明的命运？" },
        { title: "封神三部曲：朝歌风云", desc: "商周交替之际，姜子牙辅佐武王伐纣，神话史诗巨制。" },
        { title: "唐人街探案4", desc: "唐仁和秦风的第四次侦探冒险，这次来到了东京。" },
        { title: "深海 2：潮汐之城", desc: "深海世界的全新冒险，参宿发现了隐藏在洋流之下的神秘文明。" },
        { title: "机器人总动员：新纪元", desc: "经典IP续作，WALL-E与EVE的太空探险新篇章。" },
        { title: "红海行动2：风暴之眼", desc: "蛟龙突击队奉命执行跨国营救任务，面对国际恐怖组织。" },
        { title: "大自然的呼唤：极地纪实", desc: "跟随摄影团队深入南北极，记录极端环境下的野生动物生存状态。" },
        { title: "满江红外传", desc: "岳飞故事的全新演绎，从不同视角讲述那段波澜壮阔的历史。" },
        { title: "超级马里奥大电影2", desc: "马里奥与路易吉再次踏上冒险之旅，这次要拯救整个蘑菇王国。" },
      ]
    },
    {
      type: "音频", items: [
        { title: "周杰伦 - 最伟大的作品 (Live)", desc: "2026年世界巡回演唱会官方录音。" },
        { title: "古典放松：肖邦夜曲全集", desc: "国际钢琴大师重新演绎肖邦经典夜曲。" },
        { title: "睡前故事合集 Vol.8", desc: "适合3-8岁儿童的50个精选睡前故事。" },
      ]
    },
    {
      type: "游戏", items: [
        { title: "原神 V5.0 - 纳塔篇", desc: "全新大版本开启火之国纳塔冒险，探索部落文明。" },
        { title: "崩坏：星穹铁道 V3.0", desc: "全新星系开启，匹诺康尼的秘密即将揭晓。" },
        { title: "赛博朋克飙车手", desc: "开放世界赛车游戏，探索霓虹都市。" },
      ]
    },
    {
      type: "有声书", items: [
        { title: "哈利波特与魔法石 (有声版)", desc: "由专业配音演员重新录制的经典有声书。" },
        { title: "三体 (有声书完整版)", desc: "刘慈欣科幻巨著有声书版，40小时完整朗读。" },
      ]
    },
    {
      type: "服务类", items: [
        { title: "天气预报 Widget", desc: "嵌入式天气预报组件，支持全球城市实时天气查询。" },
        { title: "每日星座运势", desc: "十二星座每日运势推送服务，支持个性化定制。" },
      ]
    }
  ];

  const statuses: ContentStatus[] = ["上架", "下架", "编辑中", "待上架", "已归档"];
  const signStatuses: SignStatus[] = ["未提交", "待签核", "已签核", "已驳回"];
  const lifecycles: ContentLifecycle[] = ["草案", "信息完善中", "待初始签核", "初始签核通过", "待全量签核", "全量签核通过", "已发布", "已下线"];
  const typePrefix: Record<ContentType, string> = { "视频": "V", "音频": "A", "游戏": "G", "有声书": "B", "服务类": "S" };
  const subTypes: Record<ContentType, string[]> = {
    "视频": ["电影", "剧集", "纪录片", "短片", "动画", "演唱会"],
    "音频": ["专辑", "单曲", "播客", "冥想"],
    "游戏": ["休闲游戏", "益智游戏", "动作游戏"],
    "有声书": ["有声读物", "广播剧"],
    "服务类": ["功能服务", "信息服务"],
  };
  const durations: Record<ContentType, string[]> = {
    "视频": ["01:32:00", "02:15:30", "00:52:00", "02:28:15", "01:45:00", "00:22:00"],
    "音频": ["00:04:32", "00:45:00", "01:02:15", "00:03:50"],
    "游戏": ["-"],
    "有声书": ["05:12:00", "08:30:00", "03:45:00"],
    "服务类": ["-"],
  };

  const items: ContentItem[] = [];
  let counter = 10001;

  for (const group of titles) {
    for (const item of group.items) {
      const langCount = 1 + Math.floor(Math.random() * 3);
      const catCount = 1 + Math.floor(Math.random() * 3);
      const subs = subTypes[group.type];
      const durs = durations[group.type];
      items.push({
        id: `${typePrefix[group.type]}-${counter}`,
        uuid: Array.from({ length: 8 }, () => Math.random().toString(36)[2]).join("").toUpperCase(),
        title: item.title,
        description: item.desc,
        type: group.type,
        subType: subs[counter % subs.length],
        provider: PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)],
        categories: Array.from({ length: catCount }, (_, i) => CATEGORIES_POOL[(counter + i) % CATEGORIES_POOL.length]),
        languages: Array.from({ length: langCount }, (_, i) => LANGUAGES[(counter + i) % LANGUAGES.length]),
        rating: RATINGS[Math.floor(Math.random() * RATINGS.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        signStatus: signStatuses[Math.floor(Math.random() * signStatuses.length)],
        lifecycle: lifecycles[Math.floor(Math.random() * lifecycles.length)],
        startDate: "2026-03-01",
        endDate: "2027-03-01",
        updatedAt: `2026-03-${String(10 + (counter % 20)).padStart(2, "0")} ${String(8 + (counter % 14)).padStart(2, "0")}:${String(counter % 60).padStart(2, "0")}`,
        createdAt: `2026-02-${String(1 + (counter % 28)).padStart(2, "0")}`,
        starred: Math.random() > 0.7,
        completeness: 50 + Math.floor(Math.random() * 51),
        imageIdx: counter,
        duration: durs[counter % durs.length],
        year: `${2024 + (counter % 3)}`,
      });
      counter++;
    }
  }
  return items;
}

const ALL_CONTENT = generateMockData();

const typeIconMap: Record<ContentType, any> = {
  "视频": Film,
  "音频": Headphones,
  "游戏": Gamepad2,
  "有声书": BookOpen,
  "服务类": Package,
};

const statusStyleMap: Record<ContentStatus, string> = {
  "上架": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "下架": "bg-gray-100 text-gray-600 border-gray-200",
  "编辑中": "bg-blue-50 text-blue-700 border-blue-200",
  "待上架": "bg-amber-50 text-amber-700 border-amber-200",
  "已归档": "bg-gray-50 text-gray-500 border-gray-200",
};

const signStatusStyleMap: Record<SignStatus, string> = {
  "未提交": "bg-gray-50 text-gray-500 border-gray-200",
  "待签核": "bg-purple-50 text-purple-700 border-purple-200",
  "已签核": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "已驳回": "bg-red-50 text-red-700 border-red-200",
};

// ─── Main Component ───
export function ContentCenterView({ type }: { type: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [activeTab, setActiveTab] = useState("file");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部");
  const [signFilter, setSignFilter] = useState("全部");
  const [typeFilter, setTypeFilter] = useState("全部");
  const [sortField, setSortField] = useState<string>("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const contentTypes: Record<string, string> = {
    all: "全部内容", video: "视频", audio: "音频", game: "游戏/应用", book: "有声书/电子书", service: "服务类/其他",
  };

  const typeFilterMap: Record<string, ContentType | null> = {
    all: null, video: "视频", audio: "音频", game: "游戏", book: "有声书", service: "服务类",
  };

  // Filtering
  const filtered = useMemo(() => {
    let items = ALL_CONTENT;
    const routeType = typeFilterMap[type];
    if (routeType) items = items.filter(i => i.type === routeType);
    if (searchText) {
      const q = searchText.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.provider.toLowerCase().includes(q));
    }
    if (statusFilter !== "全部") items = items.filter(i => i.status === statusFilter);
    if (signFilter !== "全部") items = items.filter(i => i.signStatus === signFilter);
    if (typeFilter !== "全部") items = items.filter(i => i.type === typeFilter);
    // sort
    items = [...items].sort((a, b) => {
      const av = (a as any)[sortField] || "";
      const bv = (b as any)[sortField] || "";
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return items;
  }, [type, searchText, statusFilter, signFilter, typeFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === paged.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paged.map(i => i.id)));
  };

  const openDrawer = (item: ContentItem) => {
    setSelectedItem(item);
    setActiveTab("file");
    setDrawerOpen(true);
  };

  // Stats
  const stats = useMemo(() => {
    const base = typeFilterMap[type] ? ALL_CONTENT.filter(i => i.type === typeFilterMap[type]) : ALL_CONTENT;
    return {
      total: base.length,
      online: base.filter(i => i.status === "上架").length,
      editing: base.filter(i => i.status === "编辑中").length,
      pending: base.filter(i => i.signStatus === "待签核").length,
      rejected: base.filter(i => i.signStatus === "已驳回").length,
    };
  }, [type]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Stats Bar */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white shrink-0">
        <div className="flex flex-wrap gap-3">
          <StatChip icon={Layers} label="总内容" value={stats.total} color="text-gray-700" bg="bg-gray-100" />
          <StatChip icon={CheckCircle2} label="已上架" value={stats.online} color="text-emerald-700" bg="bg-emerald-50" />
          <StatChip icon={FileText} label="编辑中" value={stats.editing} color="text-blue-700" bg="bg-blue-50" />
          <StatChip icon={Clock} label="待签核" value={stats.pending} color="text-purple-700" bg="bg-purple-50" />
          <StatChip icon={AlertCircle} label="已驳回" value={stats.rejected} color="text-red-700" bg="bg-red-50" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0 space-y-3">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <h2 className="text-xl text-gray-900 flex items-center gap-3" style={{ fontWeight: 700 }}>
            {contentTypes[type] || "内容列表"}
            <span className="text-sm text-gray-400" style={{ fontWeight: 400 }}>{filtered.length} 条结果</span>
          </h2>
          <div className="flex gap-2 items-center">
            {/* View toggle */}
            <div className="flex border border-gray-200 rounded overflow-hidden">
              <button onClick={() => setViewMode("table")} className={`p-1.5 ${viewMode === "table" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-50"}`}><List className="w-4 h-4" /></button>
              <button onClick={() => setViewMode("grid")} className={`p-1.5 ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-50"}`}><LayoutGrid className="w-4 h-4" /></button>
            </div>
            <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2" style={{ fontWeight: 500 }}>
              <Download className="w-4 h-4" /> 导出
            </button>
            <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2" style={{ fontWeight: 500 }}>
              <Upload className="w-4 h-4" /> 导入
            </button>
            <button className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 flex items-center gap-2 shadow-sm" style={{ fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> 新增内容
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative min-w-[280px] flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
              placeholder="搜索 内容ID / 名称 / 提供商..."
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 outline-none transition-colors"
            />
            {searchText && (
              <button onClick={() => setSearchText("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {!typeFilterMap[type] && (
            <FilterSelect label="类型" value={typeFilter} onChange={v => { setTypeFilter(v); setCurrentPage(1); }} options={["全部", "视频", "音频", "游戏", "有声书", "服务类"]} />
          )}
          <FilterSelect label="状态" value={statusFilter} onChange={v => { setStatusFilter(v); setCurrentPage(1); }} options={["全部", "上架", "下架", "编辑中", "待上架", "已归档"]} />
          <FilterSelect label="签核" value={signFilter} onChange={v => { setSignFilter(v); setCurrentPage(1); }} options={["全部", "未提交", "待签核", "已签核", "已驳回"]} />

          <button onClick={() => setFilterOpen(!filterOpen)} className={`p-1.5 rounded border transition-colors ${filterOpen ? "bg-indigo-50 border-indigo-300 text-indigo-600" : "text-gray-500 border-transparent hover:border-gray-200 hover:bg-gray-100"}`}>
            <SlidersHorizontal className="w-4.5 h-4.5" />
          </button>

          {(searchText || statusFilter !== "全部" || signFilter !== "全部" || typeFilter !== "全部") && (
            <button onClick={() => { setSearchText(""); setStatusFilter("全部"); setSignFilter("全部"); setTypeFilter("全部"); setCurrentPage(1); }}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> 清除筛选
            </button>
          )}
        </div>

        {/* Advanced filters panel */}
        {filterOpen && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">提供商</label>
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white outline-none focus:border-indigo-500">
                <option>全部</option>
                {PROVIDERS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">语言</label>
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white outline-none focus:border-indigo-500">
                <option>全部</option>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">分级</label>
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white outline-none focus:border-indigo-500">
                <option>全部</option>
                {RATINGS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">完整度</label>
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white outline-none focus:border-indigo-500">
                <option>全部</option>
                <option>100% 完整</option>
                <option>80%-99%</option>
                <option>低于 80%</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">创建时间（起）</label>
              <input type="date" className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">创建时间（止）</label>
              <input type="date" className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">分类</label>
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white outline-none focus:border-indigo-500">
                <option>全部</option>
                {CATEGORIES_POOL.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button className="px-4 py-1.5 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 w-full" style={{ fontWeight: 500 }}>应用筛选</button>
            </div>
          </div>
        )}
      </div>

      {/* Batch action bar */}
      {selectedIds.size > 0 && (
        <div className="px-4 py-2.5 bg-indigo-50 border-b border-indigo-200 flex items-center gap-4 shrink-0 text-sm">
          <span className="text-indigo-700" style={{ fontWeight: 600 }}>已选择 {selectedIds.size} 项</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> 批量复制</button>
            <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1.5"><Archive className="w-3.5 h-3.5" /> 批量归档</button>
            <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" /> 批量导出</button>
            <button className="px-3 py-1 bg-white border border-red-200 rounded hover:bg-red-50 text-red-600 flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> 批量删除</button>
          </div>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-indigo-500 hover:text-indigo-700">取消选择</button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {viewMode === "table" ? (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 sticky top-0 z-[5] border-b border-gray-200 uppercase">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selectedIds.size === paged.length && paged.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                </th>
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-indigo-600" onClick={() => handleSort("id")}>
                  <span className="flex items-center gap-1">内容标识 <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-indigo-600" onClick={() => handleSort("title")}>
                  <span className="flex items-center gap-1">基本信息 <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-4 py-3 font-medium">提供商</th>
                <th className="px-4 py-3 font-medium">分类</th>
                <th className="px-4 py-3 font-medium">完整度</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-indigo-600" onClick={() => handleSort("updatedAt")}>
                  <span className="flex items-center gap-1">更新时间 <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-4 py-3 font-medium w-20">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.map((item) => {
                const TypeIcon = typeIconMap[item.type];
                return (
                  <tr key={item.id} className={`hover:bg-indigo-50/50 transition-colors cursor-pointer group ${selectedIds.has(item.id) ? "bg-indigo-50/30" : ""}`}
                    onClick={() => openDrawer(item)}>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    </td>
                    <td className="px-1 py-3" onClick={e => e.stopPropagation()}>
                      <button className={`p-0.5 rounded transition-colors ${item.starred ? "text-amber-400" : "text-gray-300 hover:text-amber-400"}`}>
                        {item.starred ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded w-max mb-1 border border-indigo-100">{item.id}</span>
                        <span className="text-[10px] text-gray-400 font-mono">UUID: {item.uuid}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top max-w-[240px]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-14 bg-gray-100 rounded shrink-0 border border-gray-200 overflow-hidden flex items-center justify-center">
                          <TypeIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-gray-900 group-hover:text-indigo-600 transition-colors truncate" style={{ fontWeight: 600 }}>{item.title}</span>
                          <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.description}</span>
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 border border-gray-200 flex items-center gap-0.5"><TypeIcon className="w-2.5 h-2.5" />{item.type}/{item.subType}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 border border-gray-200">{item.duration !== "-" ? item.duration : item.languages.join("/")}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 border border-gray-200">{item.rating}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-sm text-gray-600">{item.provider}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-1">
                        {item.categories.map(c => (
                          <span key={c} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full border border-gray-200 text-gray-600">{c}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.completeness === 100 ? "bg-emerald-500" : item.completeness >= 80 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${item.completeness}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{item.completeness}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center w-max px-2 py-0.5 rounded-full text-xs border ${statusStyleMap[item.status]}`} style={{ fontWeight: 500 }}>{item.status}</span>
                        <span className={`inline-flex items-center w-max px-2 py-0.5 rounded-full text-xs border ${signStatusStyleMap[item.signStatus]}`} style={{ fontWeight: 500 }}>{item.signStatus}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-400 font-mono whitespace-nowrap">{item.updatedAt}</td>
                    <td className="px-4 py-3 align-top" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="查看"><Eye className="w-4 h-4" /></button>
                        <button className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="更多"><MoreVertical className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Grid View */
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paged.map(item => {
              const TypeIcon = typeIconMap[item.type];
              return (
                <div key={item.id} onClick={() => openDrawer(item)}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group">
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center relative">
                    <TypeIcon className="w-12 h-12 text-gray-300" />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusStyleMap[item.status]}`} style={{ fontWeight: 500 }}>{item.status}</span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <button className={`p-1 rounded-full bg-white/80 backdrop-blur ${item.starred ? "text-amber-400" : "text-gray-300"}`}>
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                      <div className={`h-full ${item.completeness === 100 ? "bg-emerald-500" : item.completeness >= 80 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${item.completeness}%` }} />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-900 truncate group-hover:text-indigo-600 transition-colors" style={{ fontWeight: 600 }}>{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.provider} · {item.type}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono text-[10px] text-gray-400">{item.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${signStatusStyleMap[item.signStatus]}`}>{item.signStatus}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-gray-200 flex items-center justify-between text-sm bg-white shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-gray-500">共 {filtered.length} 条记录</span>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="border border-gray-300 rounded px-2 py-1 text-xs bg-white outline-none focus:border-indigo-500">
            <option value={10}>10 条/页</option>
            <option value={15}>15 条/页</option>
            <option value={30}>30 条/页</option>
            <option value={50}>50 条/页</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronsLeft className="w-4 h-4" /></button>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let page: number;
            if (totalPages <= 5) page = i + 1;
            else if (currentPage <= 3) page = i + 1;
            else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
            else page = currentPage - 2 + i;
            return (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded text-sm ${page === currentPage ? "border-indigo-600 text-white bg-indigo-600" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                {page}
              </button>
            );
          })}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronsRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Detail Drawer */}
      {drawerOpen && selectedItem && (
        <ContentDetailDrawer item={selectedItem} activeTab={activeTab} setActiveTab={setActiveTab} onClose={() => setDrawerOpen(false)} />
      )}
    </div>
  );
}

// ─── Lifecycle style ───
const lifecycleStyleMap: Record<string, string> = {
  "草案": "bg-gray-100 text-gray-600 border-gray-200",
  "信息完善中": "bg-blue-50 text-blue-700 border-blue-200",
  "待初始签核": "bg-amber-50 text-amber-700 border-amber-200",
  "初始签核通过": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "待全量签核": "bg-purple-50 text-purple-700 border-purple-200",
  "全量签核通过": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "已发布": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "已下线": "bg-gray-100 text-gray-500 border-gray-200",
};

// Tab lock status based on lifecycle
function getTabLockStatus(lifecycle: ContentLifecycle): Record<string, boolean> {
  const isInitialLocked = ["初始签核通过", "待全量签核", "全量签核通过", "已发布"].includes(lifecycle);
  const isFullLocked = ["全量签核通过", "已发布"].includes(lifecycle);
  return {
    file: isInitialLocked, sub: isInitialLocked, other: isInitialLocked,
    meta: isFullLocked, asset: isFullLocked, trailer: isFullLocked,
    class: isFullLocked, adapt: isFullLocked, publish: isFullLocked,
  };
}

// ─── Drawer ───
function ContentDetailDrawer({ item, activeTab, setActiveTab, onClose }: {
  item: ContentItem; activeTab: string; setActiveTab: (t: string) => void; onClose: () => void;
}) {
  const TypeIcon = typeIconMap[item.type];
  const locks = getTabLockStatus(item.lifecycle);

  const allTabs = [
    { id: "file", label: "文件信息", locked: locks.file },
    ...(["视频", "音频", "有声书"].includes(item.type) ? [{ id: "series", label: "系列/分集", locked: locks.meta }] : []),
    ...(["视频", "有声书"].includes(item.type) ? [{ id: "sub", label: "字幕/音轨", locked: locks.sub }] : []),
    { id: "meta", label: "元数据", locked: locks.meta },
    ...(["视频", "音频", "游戏"].includes(item.type) ? [{ id: "trailer", label: "预告素材", locked: locks.trailer }] : []),
    { id: "asset", label: "图片素材", locked: locks.asset },
    { id: "class", label: "分类信息", locked: locks.class },
    { id: "adapt", label: "适配信息", locked: locks.adapt },
    { id: "publish", label: "发布信息", locked: locks.publish },
    { id: "log", label: "操作日志", locked: false },
  ];

  return (
    <>
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm z-20" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl z-30 flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-200">
        {/* Close button */}
        <button className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded z-10" onClick={onClose}><X className="w-5 h-5" /></button>

        {/* Summary Area */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 shrink-0">
          <div className="flex gap-5">
            {/* Poster placeholder */}
            <div className="w-20 h-28 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
              <TypeIcon className="w-8 h-8 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg text-gray-900 truncate" style={{ fontWeight: 700 }}>{item.title}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{item.id} · {item.uuid}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">{item.type} / {item.subType}</span>
                <span className="text-gray-500">时长: {item.duration}</span>
                <span className="text-gray-500">年份: {item.year}</span>
                <span className="text-gray-500">语言: {item.languages[0]}</span>
                <span className="text-gray-500">分级: {item.rating}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${lifecycleStyleMap[item.lifecycle] || ""}`} style={{ fontWeight: 500 }}>{item.lifecycle}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusStyleMap[item.status]}`} style={{ fontWeight: 500 }}>{item.status}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${signStatusStyleMap[item.signStatus]}`} style={{ fontWeight: 500 }}>{item.signStatus}</span>
                {item.completeness < 100 && <span className="text-[10px] text-amber-600">⚠ 完整度 {item.completeness}%</span>}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1 text-xs text-white bg-indigo-600 rounded hover:bg-indigo-700 shadow-sm" style={{ fontWeight: 500 }}>编辑</button>
                <button className="px-3 py-1 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50" style={{ fontWeight: 500 }}>签核</button>
                <button className="px-3 py-1 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50" style={{ fontWeight: 500 }}>变更申请</button>
                <button className="px-3 py-1 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50" style={{ fontWeight: 500 }}>创建版本</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 border-b border-gray-200 flex gap-1 shrink-0 text-[12px] overflow-x-auto no-scrollbar">
          {allTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-3 pb-2.5 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"}`}
              style={{ fontWeight: activeTab === tab.id ? 600 : 400 }}>
              {tab.label}
              {tab.locked && <span className="text-[9px] text-gray-400">🔒</span>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeTab === "file" && <FileInfoTab item={item} locked={locks.file} />}
          {activeTab === "series" && <SeriesTab />}
          {activeTab === "meta" && <MetaTab item={item} />}
          {activeTab === "trailer" && <TrailerTab />}
          {activeTab === "asset" && <AssetTab />}
          {activeTab === "sub" && <SubTab />}
          {activeTab === "class" && <ClassTab />}
          {activeTab === "adapt" && <AdaptTab />}
          {activeTab === "publish" && <PublishTab item={item} />}
          {activeTab === "log" && <LogTab />}
        </div>
      </div>
    </>
  );
}

// ─── Tab Panels ───
function FileInfoTab({ item, locked }: { item: ContentItem; locked: boolean }) {
  return (
    <div className="space-y-6">
      {locked && <LockBanner />}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2" style={{ fontWeight: 700 }}>文件信息</h4>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <DetailRow label="内容唯一标识" value={item.id} />
          <DetailRow label="文件名" value={`${item.title.replace(/\s/g, "_")}.mp4`} />
          <DetailRow label="编码方式" value={item.type === "视频" ? "H.265 (HEVC)" : item.type === "音频" ? "AAC" : "N/A"} />
          <DetailRow label="容器格式" value={item.type === "视频" ? "MP4" : item.type === "音频" ? "FLAC" : "N/A"} />
          <DetailRow label="时长" value={item.duration} />
          <DetailRow label="文件大小" value={item.type === "视频" ? "4.2 GB" : "128 MB"} />
          {item.type === "视频" && <>
            <DetailRow label="分辨率" value="3840×2160 (4K)" />
            <DetailRow label="帧率" value="23.976 fps" />
            <DetailRow label="比特率" value="25000 kbps" />
          </>}
          {(item.type === "音频" || item.type === "有声书") && <>
            <DetailRow label="采样率" value="48000 Hz" />
            <DetailRow label="声道数" value="2 (立体声)" />
          </>}
          <DetailRow label="加密方式" value="DRM (Widevine)" />
          <DetailRow label="技术备注" value="HDR10+ / Dolby Vision" />
        </div>
      </div>
      {/* Completeness */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2" style={{ fontWeight: 700 }}>完整度检查</h4>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${item.completeness === 100 ? "bg-emerald-500" : item.completeness >= 80 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${item.completeness}%` }} />
          </div>
          <span className="text-lg text-gray-900" style={{ fontWeight: 700 }}>{item.completeness}%</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: "基础信息", ok: true },
            { label: "海报图 (必需)", ok: item.completeness > 60 },
            { label: "横版图 (必需)", ok: item.completeness > 70 },
            { label: "预告素材", ok: item.completeness > 75 },
            { label: "字幕文件", ok: item.completeness > 80 },
            { label: "音轨文件", ok: item.completeness > 75 },
            { label: "元数据", ok: item.completeness > 65 },
            { label: "分类挂载", ok: item.completeness > 50 },
          ].map(c => (
            <div key={c.label} className={`flex items-center gap-2 px-3 py-2 rounded border ${c.ok ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-600"}`}>
              {c.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {c.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SeriesTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2" style={{ fontWeight: 700 }}>系列信息</h4>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-4">
          <DetailRow label="系列名称" value="三体" />
          <DetailRow label="系列ID" value="SER-2026-001" />
          <DetailRow label="当前季" value="第 1 季" />
          <DetailRow label="当前集" value="第 1 集" />
          <DetailRow label="总集数" value="30" />
        </div>
      </div>
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm text-gray-900 border-l-4 border-indigo-500 pl-2" style={{ fontWeight: 700 }}>分集列表</h4>
          <button className="text-xs text-indigo-600 hover:text-indigo-700" style={{ fontWeight: 500 }}>+ 新增分集</button>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs">
              <tr>
                <th className="px-4 py-2 font-medium">集数</th>
                <th className="px-4 py-2 font-medium">分集标题</th>
                <th className="px-4 py-2 font-medium">时长</th>
                <th className="px-4 py-2 font-medium">签核</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map(ep => (
                <tr key={ep} className="hover:bg-indigo-50/30">
                  <td className="px-4 py-2 text-gray-900" style={{ fontWeight: 500 }}>第 {ep} 集</td>
                  <td className="px-4 py-2 text-gray-700">三体 S01E{String(ep).padStart(2, "0")}</td>
                  <td className="px-4 py-2 text-gray-500 font-mono">00:{42 + ep}:00</td>
                  <td className="px-4 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded border ${ep <= 3 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>{ep <= 3 ? "全量签核" : "未签核"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TrailerTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm text-gray-900 border-l-4 border-indigo-500 pl-2 flex items-center gap-2" style={{ fontWeight: 700 }}>
            <Film className="w-4 h-4 text-indigo-500" /> 预告素材
          </h4>
          <button className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1" style={{ fontWeight: 500 }}><Upload className="w-3.5 h-3.5" /> 上传预告</button>
        </div>
        {[
          { name: "官方正式预告片", format: "MP4 • 1080p", duration: "02:15", size: "150MB", sort: 1 },
          { name: "先导预告片", format: "MP4 • 720p", duration: "01:30", size: "80MB", sort: 2 },
        ].map((t, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 flex items-center gap-4 hover:border-indigo-300 transition-colors mb-3">
            <div className="w-28 aspect-video bg-gray-900 rounded relative flex items-center justify-center overflow-hidden">
              <PlayCircle className="w-7 h-7 text-white opacity-70" />
            </div>
            <div className="flex-1">
              <h5 className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{t.name}</h5>
              <p className="text-xs text-gray-500 mt-1">{t.format} • {t.duration} • {t.size}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">排序: {t.sort}</p>
            </div>
            <div className="flex gap-1">
              <button className="px-2 py-1 text-xs text-indigo-600 border border-indigo-200 rounded bg-indigo-50 hover:bg-indigo-100" style={{ fontWeight: 500 }}>播放</button>
              <button className="px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50" style={{ fontWeight: 500 }}>替换</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdaptTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2" style={{ fontWeight: 700 }}>适配规则</h4>
        <div className="text-sm mb-4">
          <DetailRow label="适配模式" value="按规则生效" />
        </div>
        <div className="space-y-3">
          {[
            { dim: "机型", mode: "包含 (Include)", values: ["B737", "A320", "C919"] },
            { dim: "舱位", mode: "排除 (Exclude)", values: ["经济舱"] },
            { dim: "区域", mode: "全量 (All)", values: ["全部区域"] },
            { dim: "终端型号", mode: "包含 (Include)", values: ["PAX-12", "EROS-15"] },
          ].map((rule, i) => (
            <div key={i} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{rule.dim}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${rule.mode.includes("包含") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : rule.mode.includes("排除") ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>{rule.mode}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rule.values.map(v => <span key={v} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200">{v}</span>)}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-3">提示: 内容级适配规则优先于分类级。未设置则继承分类适配。</p>
      </div>
    </div>
  );
}

function PublishTab({ item }: { item: ContentItem }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2" style={{ fontWeight: 700 }}>发布信息</h4>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <DetailRow label="上线时间" value={item.startDate ? `${item.startDate} 00:00:00` : "未设置"} />
          <DetailRow label="下线时间" value={item.endDate ? `${item.endDate} 23:59:59` : "未设置"} />
          <DetailRow label="发布状态" value={item.status} />
          <DetailRow label="生命周期" value={item.lifecycle} />
          <DetailRow label="是否禁止发布" value="否" />
          <DetailRow label="新增/续用/替换" value="新增内容" />
          <DetailRow label="首次发布周期" value="2026-Q1-Release" />
          <DetailRow label="最近导出时间" value={item.status === "上架" ? "2026-03-25 14:00" : "—"} />
        </div>
      </div>
      {/* Lifecycle State Flow */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2" style={{ fontWeight: 700 }}>状态流转</h4>
        <div className="flex flex-wrap gap-2 items-center text-[10px]">
          {["草案", "信息完善中", "待初始签核", "初始签核通过", "待全量签核", "全量签核通过", "已发布"].map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
              <span className={`px-2 py-1 rounded border ${s === item.lifecycle ? "ring-2 ring-indigo-300 " : ""}${lifecycleStyleMap[s] || "bg-gray-100 text-gray-600 border-gray-200"}`} style={{ fontWeight: s === item.lifecycle ? 600 : 400 }}>{s}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function LockBanner() {
  return (
    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
      <Lock className="w-4 h-4 shrink-0" />
      <span>此 Tab 的字段已被签核锁定，如需修改请通过「变更申请」流程。</span>
    </div>
  );
}

// Keep original InfoTab as alias
function InfoTab({ item }: { item: ContentItem }) {
  return <FileInfoTab item={item} locked={false} />;
}

function MetaTab({ item }: { item: ContentItem }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2" style={{ fontWeight: 700 }}>扩展元数据</h4>
        <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
          <div className="col-span-2">
            <DetailRow label="演职员表" value="" />
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-200 flex items-center gap-1"><User className="w-3 h-3" /> 导演: 张三</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200 flex items-center gap-1"><User className="w-3 h-3" /> 主演: 李四</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200 flex items-center gap-1"><User className="w-3 h-3" /> 主演: 王五</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> 风格标签</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {item.categories.map(c => <span key={c} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{c}</span>)}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> 发行地区</span>
            <span className="text-sm text-gray-900 mt-1" style={{ fontWeight: 500 }}>全球 (Global)</span>
          </div>
          <DetailRow label="发行年份" value="2025" />
          <DetailRow label="正片时长" value="128 分钟 (02:08:00)" />
          <DetailRow label="分辨率" value="4K (3840x2160)" />
          <DetailRow label="色彩空间" value="HDR10 / Dolby Vision" />
        </div>
      </div>
    </div>
  );
}

function AssetTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm text-gray-900 border-l-4 border-indigo-500 pl-2 flex items-center gap-2" style={{ fontWeight: 700 }}>
            <ImageIcon className="w-4 h-4 text-indigo-500" /> 图片素材
          </h4>
          <button className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1" style={{ fontWeight: 500 }}><Upload className="w-3.5 h-3.5" /> 上传素材</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-2 flex flex-col gap-2">
            <div className="aspect-[2/3] bg-gray-100 rounded overflow-hidden relative group">
              <ImageWithFallback src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop" alt="Poster" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="p-2 bg-white rounded-full text-gray-900 hover:text-indigo-600"><Search className="w-4 h-4" /></button>
                <button className="p-2 bg-white rounded-full text-gray-900 hover:text-indigo-600"><Download className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="text-xs text-center">
              <p className="text-gray-800" style={{ fontWeight: 500 }}>竖版海报 (Poster)</p>
              <p className="text-gray-500">1200 x 1800 px · JPG</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-2 flex flex-col gap-2 col-span-2">
            <div className="aspect-[16/9] bg-gray-100 rounded overflow-hidden relative group">
              <ImageWithFallback src="https://images.unsplash.com/photo-1695114584354-13e1910d491b?w=800&h=450&fit=crop" alt="Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="p-2 bg-white rounded-full text-gray-900 hover:text-indigo-600"><Search className="w-4 h-4" /></button>
                <button className="p-2 bg-white rounded-full text-gray-900 hover:text-indigo-600"><Download className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="text-xs text-center">
              <p className="text-gray-800" style={{ fontWeight: 500 }}>横版横幅 (Banner)</p>
              <p className="text-gray-500">1920 x 1080 px · PNG</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2 flex items-center gap-2" style={{ fontWeight: 700 }}>
          <Film className="w-4 h-4 text-indigo-500" /> 视频预告
        </h4>
        <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-4 hover:border-indigo-300 transition-colors">
          <div className="w-32 aspect-video bg-gray-900 rounded relative flex items-center justify-center group overflow-hidden">
            <ImageWithFallback src="https://images.unsplash.com/photo-1695114584354-13e1910d491b?w=300&h=168&fit=crop" alt="Trailer" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
            <PlayCircle className="w-8 h-8 text-white relative z-10 opacity-80 group-hover:opacity-100" />
          </div>
          <div className="flex-1">
            <h5 className="text-sm text-gray-900" style={{ fontWeight: 500 }}>官方正式预告片 (Official Trailer)</h5>
            <p className="text-xs text-gray-500 mt-1">MP4 • 1080p • 02:15 • 150MB</p>
          </div>
          <button className="px-3 py-1.5 text-xs text-indigo-600 border border-indigo-200 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors" style={{ fontWeight: 500 }}>播放</button>
        </div>
      </div>
    </div>
  );
}

function SubTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2 flex items-center gap-2" style={{ fontWeight: 700 }}>
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
              <tr><td className="px-4 py-2 text-gray-900" style={{ fontWeight: 500 }}>English</td><td className="px-4 py-2 text-gray-600">Dolby Digital Plus</td><td className="px-4 py-2 text-gray-600">5.1</td><td className="px-4 py-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td></tr>
              <tr><td className="px-4 py-2 text-gray-900" style={{ fontWeight: 500 }}>中文 (Mandarin)</td><td className="px-4 py-2 text-gray-600">AAC</td><td className="px-4 py-2 text-gray-600">2.0</td><td className="px-4 py-2 text-gray-300">-</td></tr>
              <tr><td className="px-4 py-2 text-gray-900" style={{ fontWeight: 500 }}>���本語</td><td className="px-4 py-2 text-gray-600">AAC</td><td className="px-4 py-2 text-gray-600">2.0</td><td className="px-4 py-2 text-gray-300">-</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2 flex items-center gap-2" style={{ fontWeight: 700 }}>
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
              <tr><td className="px-4 py-2 text-gray-900" style={{ fontWeight: 500 }}>简体中文</td><td className="px-4 py-2 text-gray-600">WebVTT / SRT</td><td className="px-4 py-2 text-gray-600">普通字幕</td><td className="px-4 py-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td></tr>
              <tr><td className="px-4 py-2 text-gray-900" style={{ fontWeight: 500 }}>English</td><td className="px-4 py-2 text-gray-600">WebVTT</td><td className="px-4 py-2 text-gray-600">SDH (听障辅助)</td><td className="px-4 py-2 text-gray-300">-</td></tr>
              <tr><td className="px-4 py-2 text-gray-900" style={{ fontWeight: 500 }}>日本語</td><td className="px-4 py-2 text-gray-600">SRT</td><td className="px-4 py-2 text-gray-600">普通字幕</td><td className="px-4 py-2 text-gray-300">-</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ClassTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm text-gray-900 border-l-4 border-indigo-500 pl-2 flex items-center gap-2" style={{ fontWeight: 700 }}>
            <FolderTree className="w-4 h-4 text-indigo-500" /> 分类挂载关系
          </h4>
          <button className="text-xs text-indigo-600 hover:text-indigo-700" style={{ fontWeight: 500 }}>管理挂载</button>
        </div>
        <div className="space-y-3">
          {[
            { type: "主分类", path: "Global Platform > 2026 Q1 Release > 电影分类 > 动作片", status: "已生效", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
            { type: "次分类", path: "Global Platform > 2026 Q1 Release > 首页推荐 > 猜你喜欢", status: "已生效", color: "bg-gray-200 text-gray-700 border-gray-300" },
            { type: "次分类", path: "APAC Region > 2026 Q1 Release > 热门专区", status: "待发布", color: "bg-gray-200 text-gray-700 border-gray-300" },
          ].map((mount, i) => (
            <div key={i} className={`p-3 border rounded-lg flex items-center justify-between ${mount.status === "待发布" ? "border-amber-100 bg-amber-50/30" : "border-gray-100 bg-gray-50/50"}`}>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded border ${mount.color}`}>{mount.type}</span>
                <span className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{mount.path}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${mount.status === "已生效" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-200"}`}>{mount.status}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Mounting History */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2" style={{ fontWeight: 700 }}>挂载历史</h4>
        <div className="space-y-3 text-sm">
          {[
            { action: "新增挂载至「热门专区」", time: "2026-03-12 10:30", user: "Admin" },
            { action: "调整主分类路径", time: "2026-03-10 16:00", user: "Content Ops" },
            { action: "初始挂载至「首页推荐」", time: "2026-03-01 09:00", user: "System" },
          ].map((h, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-700">{h.action}</span>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{h.user}</span>
                <span className="font-mono">{h.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CycleTab() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm shrink-0">
        <h4 className="text-sm text-gray-900 border-l-4 border-indigo-500 pl-2 flex items-center gap-2" style={{ fontWeight: 700 }}>
          <LayoutList className="w-4 h-4 text-indigo-500" /> 发布看板 (Release Board)
        </h4>
        <button className="px-3 py-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors" style={{ fontWeight: 500 }}>新建发布任务</button>
      </div>
      <div className="flex-1 flex gap-4 overflow-x-auto no-scrollbar pb-2 min-h-[400px]">
        {[
          {
            title: "待规划 (Backlog)", count: 2, color: "bg-gray-100 border-gray-200 text-gray-700",
            items: [
              { id: "T-01", title: "北美区内容上架准备", region: "North America", date: "待定", priority: "普通" },
              { id: "T-02", title: "本地化字幕适配", region: "Global", date: "待定", priority: "低" },
            ]
          },
          {
            title: "准备中 (In Progress)", count: 1, color: "bg-blue-50 border-blue-200 text-blue-700",
            items: [{ id: "T-03", title: "亚太区市场宣传物料分发", region: "APAC", date: "2026-03-20", priority: "高" }]
          },
          {
            title: "待签核 (Review)", count: 1, color: "bg-purple-50 border-purple-200 text-purple-700",
            items: [{ id: "T-04", title: "Global Platform Q1 首发", region: "Global", date: "2026-03-15", priority: "高" }]
          },
          {
            title: "已发布 (Published)", count: 2, color: "bg-emerald-50 border-emerald-200 text-emerald-700",
            items: [
              { id: "T-05", title: "内测联调发布 (Test Env)", region: "Internal", date: "2026-03-01", priority: "中" },
              { id: "T-06", title: "欧洲区预热页面上线", region: "Europe", date: "2026-03-10", priority: "中" },
            ]
          },
        ].map(col => (
          <div key={col.title} className="w-72 shrink-0 flex flex-col bg-gray-100/50 rounded-lg border border-gray-200">
            <div className={`px-3 py-2 border-b flex justify-between items-center rounded-t-lg ${col.color}`}>
              <span className="text-sm" style={{ fontWeight: 700 }}>{col.title}</span>
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
                    <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                  </div>
                  <h5 className="text-sm text-gray-900 mb-3 leading-snug" style={{ fontWeight: 500 }}>{item.title}</h5>
                  <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {item.region}</div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {item.date}</span>
                      <span className={`px-1.5 py-0.5 rounded ${item.priority === "高" ? "bg-red-50 text-red-600 border border-red-100" : item.priority === "中" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-gray-50 text-gray-600 border border-gray-100"}`}>{item.priority}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex -space-x-1">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] text-indigo-700" style={{ fontWeight: 700 }}>A</div>
                      <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] text-emerald-700" style={{ fontWeight: 700 }}>U</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400"><AlertCircle className="w-3 h-3" /><span>0/3</span></div>
                  </div>
                </div>
              ))}
              <button className="flex items-center justify-center gap-1.5 py-2 mt-1 text-xs text-gray-500 hover:text-indigo-600 hover:bg-white rounded border border-dashed border-transparent hover:border-indigo-200 transition-colors">
                <Plus className="w-3.5 h-3.5" /> 添加任务
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogTab() {
  const logs = [
    { time: "2026-03-12 14:30:22", action: "完成签核，状态变更为「已签核」", user: "System Auto", color: "bg-emerald-500", ring: "ring-emerald-100" },
    { time: "2026-03-11 09:15:00", action: "更新扩展元数据", user: "Admin User", color: "bg-indigo-500", ring: "ring-indigo-100", detail: "[修改] 发行年份: 2024 → 2025" },
    { time: "2026-03-10 16:45:11", action: "导入素材资源：横版海报.jpg, 预告片.mp4", user: "Content Provider (API)", color: "bg-gray-300", ring: "" },
    { time: "2026-03-10 16:40:00", action: "创建内容对象，生成 UUID", user: "Content Provider (API)", color: "bg-gray-300", ring: "" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm text-gray-900 mb-6 border-l-4 border-indigo-500 pl-2 flex items-center gap-2" style={{ fontWeight: 700 }}>
          <History className="w-4 h-4 text-indigo-500" /> 变更时间线
        </h4>
        <div className="relative pl-4 border-l-2 border-gray-100 space-y-6 pb-2 ml-2">
          {logs.map((log, i) => (
            <div key={i} className="relative">
              <div className={`absolute -left-[23px] top-1 w-3 h-3 ${log.color} rounded-full border-2 border-white ${log.ring ? `ring-2 ${log.ring}` : ""}`} />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-mono">{log.time}</span>
                <span className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{log.action}</span>
                <span className="text-xs text-gray-500">操作人: {log.user}</span>
                {log.detail && (
                  <div className="mt-1 p-2 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 font-mono">{log.detail}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shared Components ───
function StatChip({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: number; color: string; bg: string }) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border border-gray-100 ${bg}`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-sm ${color}`} style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex items-center text-sm border border-gray-300 rounded overflow-hidden group hover:border-indigo-400 transition-colors bg-white h-9 relative">
      <span className="px-3 py-1.5 bg-gray-50 border-r border-gray-300 text-gray-600 shrink-0" style={{ fontWeight: 500 }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="pl-3 pr-8 py-1.5 bg-transparent outline-none text-gray-800 cursor-pointer min-w-24 w-full appearance-none">
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 pointer-events-none group-hover:text-indigo-400" />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
