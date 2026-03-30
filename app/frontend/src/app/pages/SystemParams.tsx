import { Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";

export default function SystemParams() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-bold text-gray-900">系统参数</h2>
        <p className="text-sm text-gray-500 mt-1">
          管理平台公共参数和后台默认策略（阶段一原型，保存未对接接口）
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* 密码策略 */}
        <div>
          <h3 className="text-base font-medium text-[#000000d9] mb-4">
            密码策略
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pwd-length">最小密码长度</Label>
              <Input
                id="pwd-length"
                type="number"
                defaultValue="8"
                className="border-[#d9d9d9]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd-complexity">密码复杂度要求</Label>
              <Select defaultValue="medium">
                <SelectTrigger
                  id="pwd-complexity"
                  className="border-[#d9d9d9]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低（仅字母数字）</SelectItem>
                  <SelectItem value="medium">中（字母+数字）</SelectItem>
                  <SelectItem value="high">
                    高（字母+数字+特殊字符）
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd-expiry">密码有效期（天）</Label>
              <Input
                id="pwd-expiry"
                type="number"
                defaultValue="90"
                className="border-[#d9d9d9]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd-history">密码历史记录数</Label>
              <Input
                id="pwd-history"
                type="number"
                defaultValue="5"
                className="border-[#d9d9d9]"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* 登录安全 */}
        <div>
          <h3 className="text-base font-medium text-[#000000d9] mb-4">
            登录安全
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="login-attempts">登录失败锁定阈值</Label>
              <Input
                id="login-attempts"
                type="number"
                defaultValue="5"
                className="border-[#d9d9d9]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lock-duration">账号锁定时长（分钟）</Label>
              <Input
                id="lock-duration"
                type="number"
                defaultValue="30"
                className="border-[#d9d9d9]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">会话超时时间（分钟）</Label>
              <Input
                id="session-timeout"
                type="number"
                defaultValue="120"
                className="border-[#d9d9d9]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="concurrent-sessions">最大并发会话数</Label>
              <Input
                id="concurrent-sessions"
                type="number"
                defaultValue="3"
                className="border-[#d9d9d9]"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* 日志策略 */}
        <div>
          <h3 className="text-base font-medium text-[#000000d9] mb-4">
            日志策略
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="log-retention">日志保留时长（天）</Label>
              <Input
                id="log-retention"
                type="number"
                defaultValue="365"
                className="border-[#d9d9d9]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="log-level">日志记录级别</Label>
              <Select defaultValue="info">
                <SelectTrigger id="log-level" className="border-[#d9d9d9]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* 通知策略 */}
        <div>
          <h3 className="text-base font-medium text-[#000000d9] mb-4">
            通知策略
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="notify-retry">通知重试次数</Label>
              <Input
                id="notify-retry"
                type="number"
                defaultValue="3"
                className="border-[#d9d9d9]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notify-interval">重试间隔（分钟）</Label>
              <Input
                id="notify-interval"
                type="number"
                defaultValue="5"
                className="border-[#d9d9d9]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-notify">批量通知合并时间（分钟）</Label>
              <Input
                id="batch-notify"
                type="number"
                defaultValue="15"
                className="border-[#d9d9d9]"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* 导出策略 */}
        <div>
          <h3 className="text-base font-medium text-[#000000d9] mb-4">
            导出策略
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="export-cooldown">
                导出重复提交冷却时间（分钟）
              </Label>
              <Input
                id="export-cooldown"
                type="number"
                defaultValue="30"
                className="border-[#d9d9d9]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-retention">导出文件保留时长（天）</Label>
              <Input
                id="export-retention"
                type="number"
                defaultValue="7"
                className="border-[#d9d9d9]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3">
        <Button variant="outline" className="border-gray-300 text-gray-700">
          重置
        </Button>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
          <Save className="h-4 w-4 mr-2" />
          保存配置
        </Button>
      </div>
    </div>
  );
}