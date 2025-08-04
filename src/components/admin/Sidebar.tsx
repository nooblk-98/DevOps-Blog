import { NavLink } from "react-router-dom";
import { Home, Package, Users, Settings, LayoutDashboard, MessageSquare, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Sidebar = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
      isActive ? "bg-muted text-primary" : "text-muted-foreground"
    }`;

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <NavLink to="/admin" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-6 w-6" />
            <span className="">Admin Panel</span>
          </NavLink>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <NavLink to="/admin" end className={navLinkClasses}>
              <Home className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to="/admin/posts" className={navLinkClasses}>
              <Package className="h-4 w-4" />
              Posts
            </NavLink>
            <NavLink to="/admin/categories" className={navLinkClasses}>
              <Users className="h-4 w-4" />
              Categories
            </NavLink>
            <NavLink to="/admin/comments" className={navLinkClasses}>
              <MessageSquare className="h-4 w-4" />
              Comments
            </NavLink>
            <NavLink to="/admin/settings" className={navLinkClasses}>
              <Settings className="h-4 w-4" />
              Settings
            </NavLink>
            <NavLink to="/admin/backup" className={navLinkClasses}>
              <Archive className="h-4 w-4" />
              Backup/Restore
            </NavLink>
          </nav>
        </div>
        {/* Removed the "Upgrade to Pro" card */}
      </div>
    </div>
  );
};