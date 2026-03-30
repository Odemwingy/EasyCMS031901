import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { adminRoutes } from "../lib/admin-routes";

export default function NoPermission() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-10 text-center">
      <h2 className="text-xl font-medium text-[#000000d9]">无权限访问</h2>
      <p className="mt-3 text-sm text-[#00000073]">
        当前账号没有此页面权限，请联系管理员分配后重试。
      </p>
      <Button asChild className="mt-6 bg-indigo-600 hover:bg-indigo-700">
        <Link to={adminRoutes.user}>返回用户管理</Link>
      </Button>
    </div>
  );
}
