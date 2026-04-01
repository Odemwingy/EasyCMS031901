import { Settings } from "lucide-react";

/** 无后端接口时的静态占位，与 v2 PlaceholderView 文案一致 */
export function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div className="p-6 h-full min-h-[320px] flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Settings className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">
        此模块正在开发中，将根据《品功能结构图与信息结构图 PRD》规范逐步完善相关业务功能。
      </p>
    </div>
  );
}
