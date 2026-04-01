import React, { useState } from 'react';
import { 
  Search, Plus, MoreHorizontal, Shield, Users, 
  Settings, Key, Ban, CheckCircle2, FileText,
  Filter, Download, ChevronRight, History, 
  UserPlus, UserCog, UserX, AlertCircle, Eye,
  Lock, Unlock
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// ---- User Management View ----
export function UserManagementView() {
  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">用户管理</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2">
              批量停用
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
              <UserPlus className="w-4 h-4" /> 新建用户
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative min-w-[280px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索用户名 / 姓名" 
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 outline-none transition-colors"
            />
          </div>
          <FilterSelect label="所属组织" options={["全部", "Global Org", "APAC Region", "内容服务商A"]} />
          <FilterSelect label="用户类型" options={["全部", "内部员工", "企业客户"]} />
          <FilterSelect label="角色" options={["全部", "系统管理员", "内容运营", "只读用户"]} />
          <FilterSelect label="状态" options={["全部", "启用", "停用", "锁定"]} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium w-10">
                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              </th>
              <th className="px-4 py-3 font-medium">用户名 / 姓名</th>
              <th className="px-4 py-3 font-medium">所属组织</th>
              <th className="px-4 py-3 font-medium">用户类型</th>
              <th className="px-4 py-3 font-medium">绑定角色</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">最近登录</th>
              <th className="px-4 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{`user_${100+i}`}</span>
                    <span className="text-xs text-gray-500">{`测试用户 ${i+1}`}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">Global Org</td>
                <td className="px-4 py-3 text-gray-600">
                  {i % 3 === 0 ? "企业客户" : "内部员工"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs border border-indigo-100">系统管理员</span>
                    {i % 2 === 0 && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200">内容运营</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {i === 2 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                      <Ban className="w-3 h-3" /> 锁定
                    </span>
                  ) : i === 3 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      停用
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> 启用
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                  2026-03-23 10:24
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2 text-gray-400">
                    <button className="p-1 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="编辑">
                      <UserCog className="w-4 h-4" />
                    </button>
                    {i === 2 ? (
                      <button className="p-1 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="解锁">
                        <Unlock className="w-4 h-4" />
                      </button>
                    ) : (
                      <button className="p-1 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="停用">
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="重置密码">
                      <Key className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationFooter />
    </div>
  );
}

// ---- Role Management View ----
export function RoleManagementView() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  if (selectedRole) {
    return <PermissionConfigView roleName={selectedRole} onBack={() => setSelectedRole(null)} />;
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">角色管理</h2>
          <button className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> 新建角色
          </button>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative min-w-[280px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索角色名称 / 编码" 
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 outline-none transition-colors"
            />
          </div>
          <FilterSelect label="状态" options={["全部", "启用", "停用"]} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[
            { name: '系统管理员', code: 'system_admin', preset: true, users: 5, status: 'active', desc: '平台最高权限，负责用户、角色、权限、审计管理' },
            { name: '项目管理员', code: 'project_admin', preset: true, users: 12, status: 'active', desc: '负责项目范围内的用户和日志查看' },
            { name: '内容运营', code: 'content_operator', preset: true, users: 45, status: 'active', desc: '负责内容录入、编辑、分类、状态检查' },
            { name: '内容服务商', code: 'content_provider', preset: true, users: 120, status: 'active', desc: '负责按分配任务批量导入内容、处理素材' },
            { name: '审核人员', code: 'auditor', preset: true, users: 18, status: 'active', desc: '负责技术审核、全量审核、变更审批' },
            { name: '发布人员', code: 'publisher', preset: true, users: 8, status: 'active', desc: '负责周期管理、完整性校验、导出发布' },
            { name: '配置管理员', code: 'config_admin', preset: true, users: 3, status: 'active', desc: '负责配置档、分类集、适配规则等配置维护' },
            { name: '外包只读用户', code: 'custom_readonly', preset: false, users: 0, status: 'inactive', desc: '外包团队临时查看权限' },
          ].map((role, i) => (
            <div key={i} className="flex flex-col bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{role.name}</h3>
                    {role.preset && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded border border-blue-100">预置</span>}
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{role.code}</span>
                </div>
                <div className="relative">
                  <button className="p-1 text-gray-400 hover:text-gray-900 rounded hover:bg-gray-100">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{role.desc}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{role.users}</span> 人
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5",
                    role.status === 'active' ? "text-emerald-600" : "text-gray-400"
                  )}>
                    <div className={cn("w-2 h-2 rounded-full", role.status === 'active' ? "bg-emerald-500" : "bg-gray-300")}></div>
                    {role.status === 'active' ? '启用' : '停用'}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRole(role.name)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Shield className="w-4 h-4" /> 权限配置
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PaginationFooter />
    </div>
  );
}

// ---- Permission Config View (Left Tree, Right Matrix) ----
function PermissionConfigView({ roleName, onBack }: { roleName: string, onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-white relative animate-in slide-in-from-right-8 duration-200">
      <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="h-4 w-[1px] bg-gray-300"></div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            配置权限 <span className="text-gray-400 font-normal">/</span> <span className="text-indigo-700">{roleName}</span>
          </h2>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
            重置
          </button>
          <button className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded hover:bg-indigo-700 shadow-sm">
            保存配置
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Module Tree */}
        <div className="w-72 border-r border-gray-200 bg-gray-50/50 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200 font-medium text-sm text-gray-700 bg-gray-50">
            选择功能模块
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {['后台管理', '工作台', '内容中心', '周期管理', '分类与质量', '报表中心'].map((mod, i) => (
              <div key={mod} className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm",
                i === 0 ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700 hover:bg-gray-100"
              )}>
                <div className="flex items-center gap-2">
                  <ChevronRight className={cn("w-4 h-4", i === 0 && "rotate-90")} />
                  {mod}
                </div>
                {i === 0 && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Permission Matrix */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
            <h3 className="font-bold text-gray-800">后台管理 权限明细</h3>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              全选本模块
            </label>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Menu Item Group */}
            {[
              { 
                menu: '用户管理', 
                desc: '管理系统登录账号，包含增删改查及重置密码', 
                actions: ['查看列表 (list)', '新建用户 (create)', '编辑用户 (edit)', '停用/启用 (toggle-status)', '重置密码 (reset-password)']
              },
              { 
                menu: '角色管理', 
                desc: '定义系统岗位角色及权限集', 
                actions: ['查看列表 (list)', '新建角色 (create)', '编辑角色 (edit)', '删除角色 (delete)', '配置权限 (assign-permissions)']
              },
              { 
                menu: '菜单管理', 
                desc: '系统菜单树及权限节点注册维护', 
                actions: ['查看列表 (list)', '新建菜单 (create)', '编辑菜单 (edit)', '删除菜单 (delete)']
              },
              { 
                menu: '审计日志', 
                desc: '查看系统关键操作轨迹', 
                actions: ['查看日志 (list)', '导出日志 (export)']
              }
            ].map((group, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" defaultChecked={i < 2} />
                      {group.menu}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 pl-6">{group.desc}</p>
                  </div>
                </div>
                <div className="p-5 pl-11 flex flex-wrap gap-4">
                  {group.actions.map((act, j) => (
                    <label key={j} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-indigo-600">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                        defaultChecked={i < 2 && j % 2 === 0}
                      />
                      {act}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Audit Log View ----
export function AuditLogView() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">审计日志</h2>
          <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" /> 导出结果
          </button>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <FilterSelect label="日志类型" options={["全部", "用户权限", "角色权限", "内容编辑", "签核变更"]} />
          <FilterSelect label="对象类型" options={["全部", "用户", "角色", "内容", "分类集"]} />
          <FilterSelect label="操作人" options={["全部", "admin", "zhangsan", "system"]} />
          
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索操作对象名称或ID..." 
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 outline-none transition-colors"
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
            {Array.from({ length: 15 }).map((_, i) => (
              <tr key={i} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer" onClick={() => setDrawerOpen(true)}>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                  2026-03-23 10:24:{59 - i}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">用户权限</span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {i % 2 === 0 ? "admin (系统管理员)" : "zhangsan (项目管理员)"}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {i % 3 === 0 ? "更新权限配置" : i % 2 === 0 ? "新建用户" : "重置密码"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-medium text-xs">内容运营 (r_001)</span>
                    <span className="text-xs text-gray-400">对象类型: 角色</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {i === 4 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                      失败
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      成功
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">查看</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationFooter />

      {/* Audit Log Drawer */}
      {drawerOpen && (
        <>
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm z-20 transition-opacity" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-30 flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-200">
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> 日志详情
              </h3>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" onClick={() => setDrawerOpen(false)}>
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">基础信息</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs mb-1">日志编号</div>
                    <div className="font-mono text-gray-900">LOG-20260323-09882</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">操作时间</div>
                    <div className="font-mono text-gray-900">2026-03-23 10:24:59</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">操作人</div>
                    <div className="text-gray-900 font-medium">admin (张三)</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">操作结果</div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      成功
                    </span>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">请求 IP</div>
                    <div className="font-mono text-gray-600">192.168.1.100</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">请求来源</div>
                    <div className="text-gray-600 text-xs truncate">/admin/roles/r_001/permissions</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">操作内容</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm mb-4">
                  <div>
                    <div className="text-gray-500 text-xs mb-1">动作 (Action)</div>
                    <div className="font-medium text-gray-900">更新权限配置 (update_permissions)</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">对象 (Object)</div>
                    <div className="font-medium text-gray-900">角色：内容运营 (r_001)</div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">数据变更内容：</span>
                    <button className="text-xs text-indigo-600 hover:text-indigo-800">格式化 JSON</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div> 变更前
                      </span>
                      <pre className="bg-gray-50 border border-gray-200 rounded-md p-3 text-xs text-gray-600 overflow-x-auto font-mono">
{`{
  "permissions": [
    "admin:users:list",
    "content:list"
  ]
}`}
                      </pre>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div> 变更后
                      </span>
                      <pre className="bg-emerald-50/30 border border-emerald-100 rounded-md p-3 text-xs text-gray-800 overflow-x-auto font-mono">
{`{
  "permissions": [
    "admin:users:list",
    "admin:users:create",
    "content:list",
    "content:edit"
  ]
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---- Helpers ----
function FilterSelect({ label, options }: { label: string, options: string[] }) {
  return (
    <div className="flex items-center text-sm border border-gray-300 rounded overflow-hidden group hover:border-indigo-400 transition-colors bg-white h-9 relative">
      <span className="px-3 py-1.5 bg-gray-50 border-r border-gray-300 text-gray-600 font-medium shrink-0">{label}</span>
      <select className="pl-3 pr-8 py-1.5 bg-transparent outline-none text-gray-800 cursor-pointer min-w-24 w-full appearance-none">
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
      <ChevronRight className="w-3.5 h-3.5 text-gray-400 absolute right-2 pointer-events-none group-hover:text-indigo-400 rotate-90" />
    </div>
  );
}

function PaginationFooter() {
  return (
    <div className="p-3 border-t border-gray-200 flex items-center justify-between text-sm bg-white shrink-0">
      <span className="text-gray-500">共 150 条记录，当前显示 1-8 条</span>
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
  );
}

function XIcon(props: any) {
  return (
    <svg xmlns="http://www.w0.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
