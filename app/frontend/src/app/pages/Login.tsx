import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Library,
  Lock,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { login } from "../api/auth";
import { ApiError } from "../lib/http";

const REMEMBER_USERNAME_KEY = "easycms_login_remember_username";

function resolveLoginErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : "登录失败，请稍后重试";
  }

  if (error.code === 1002) {
    return "Token 失效，请重新登录";
  }

  const message = error.message || "";
  if (message.includes("锁定")) {
    return "账号已锁定，请联系管理员或稍后重试";
  }
  if (message.includes("用户名或密码错误")) {
    return "用户名或密码错误，请重新输入";
  }

  return message || "登录失败，请稍后重试";
}

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_USERNAME_KEY);
    if (saved) {
      setUsername(saved);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    setFormError("");
  }, [username, password]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!username.trim() || !password) {
      setFormError("请输入用户名和密码");
      return;
    }

    try {
      setSubmitting(true);
      const result = await login(username.trim(), password);
      if (rememberMe) {
        localStorage.setItem(REMEMBER_USERNAME_KEY, username.trim());
      } else {
        localStorage.removeItem(REMEMBER_USERNAME_KEY);
      }
      if (result.user.must_change_password) {
        toast.warning("该账号需修改密码，改密页面暂未接入");
      }
      toast.success("登录成功");
      navigate("/", { replace: true });
    } catch (error) {
      const msg = resolveLoginErrorMessage(error);
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* 左侧品牌区 — 对齐 ui/Content Management Platform */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full bg-purple-300/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-indigo-300/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Library className="h-5 w-5 text-white" />
            </div>
            <span className="text-white/90 text-lg tracking-wide font-medium">Ground CMS</span>
          </div>

          <div className="max-w-lg">
            <h1 className="text-4xl text-white mb-6 leading-tight font-bold">地面内容管理平台</h1>
            <p className="text-indigo-100/80 text-lg leading-relaxed mb-10">
              面向多媒体内容生命周期的一体化管理平台，覆盖内容采集、分类编排、质量校验、
              周期发布与权限管控的完整业务闭环。
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "内容中心", desc: "多维度内容对象管理" },
                { label: "分类与质量", desc: "智能分类树与校验" },
                { label: "周期与发布", desc: "全流程发布管控" },
                { label: "后台管理", desc: "用户角色权限体系" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                >
                  <div className="text-white text-sm mb-1 font-semibold">{item.label}</div>
                  <div className="text-indigo-200/70 text-xs">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-indigo-200/50 text-xs">
            © 2026 Ground Content Management Platform · v0.1.0
          </div>
        </div>
      </div>

      {/* 右侧表单 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Library className="h-5 w-5 text-white" />
            </div>
            <span className="text-gray-900 text-lg font-bold">地面内容管理平台</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl text-gray-900 mb-2 font-bold">登录系统</h2>
            <p className="text-gray-500 text-sm">请输入您的账号信息以访问管理平台</p>
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-username" className="block text-sm text-gray-700 mb-1.5 font-medium">
                用户名
              </label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="login-username"
                  type="text"
                  placeholder="请输入用户名或邮箱"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm text-gray-700 mb-1.5 font-medium">
                密码
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full h-11 pl-10 pr-11 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "隐藏密码" : "显示密码"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">记住我</span>
              </label>
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors font-medium shrink-0"
                onClick={() => toast.info("忘记密码功能请联系管理员或通过组织流程重置")}
              >
                忘记密码？
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors font-semibold"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden />
              ) : (
                <>
                  登录
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">其他登录方式</p>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 h-10 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={() => toast.info("SSO 单点登录尚未接入")}
              >
                <ShieldCheck className="h-4 w-4" />
                SSO 单点登录
              </button>
              <button
                type="button"
                className="flex-1 h-10 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={() => toast.info("LDAP 认证尚未接入")}
              >
                <Lock className="h-4 w-4" />
                LDAP 认证
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-8">
            请使用管理员分配的账号登录；如有问题请联系系统管理员。
          </p>
        </div>
      </div>
    </div>
  );
}
