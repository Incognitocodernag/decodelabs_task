"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  Users, 
  Layers, 
  Bell,
  LogOut,
  ChevronRight,
  FileText,
  Moon,
  Sun,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "STUDENT" | "ADMIN" | "MENTOR";
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ firstName: string, lastName: string, id: string } | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Notification State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUser(u);
        fetchNotifications(u.id);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  const fetchNotifications = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:4000/api/notifications/${id}/read`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:4000/api/notifications/mark-read`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const studentLinks = [
    { name: "Overview", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "My Internship", href: "/student/internship", icon: Briefcase },
    { name: "Chat", href: "/chat", icon: MessageSquare },
  ];

  const adminLinks = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Groups", href: "/admin/groups", icon: Layers },
    { name: "Assignments", href: "/admin/assignments", icon: Briefcase },
    { name: "Submissions", href: "/admin/submissions", icon: FileText },
    { name: "Chat Admin", href: "/chat", icon: MessageSquare },
  ];

  const mentorLinks = [
    { name: "Overview", href: "/mentor/dashboard", icon: LayoutDashboard },
    { name: "My Students", href: "/mentor/students", icon: Users },
    { name: "Assignments", href: "/admin/assignments", icon: Briefcase },
    { name: "Submissions", href: "/admin/submissions", icon: FileText },
    { name: "Chat", href: "/chat", icon: MessageSquare },
  ];

  const links = role === "STUDENT" ? studentLinks : role === "ADMIN" ? adminLinks : mentorLinks;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col shadow-[4px_0_24px_rgb(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgb(0,0,0,0.4)] z-30 relative transition-colors duration-300"
      >
        <div className="p-6 pb-4 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mr-3">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">NexusTech</h2>
            <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">InternConnect</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className="relative group block"
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/20 rounded-xl z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className={cn(
                  "relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all z-10",
                  isActive 
                    ? "text-indigo-700 dark:text-indigo-300" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}>
                  <Icon className={cn("w-5 h-5 mr-3 transition-colors", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                  {link.name}
                  
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-indigo-400 dark:text-indigo-500" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile Card in Sidebar (Redesigned & Industry Standard) */}
        <div className="p-4 mx-4 mb-4 mt-auto rounded-[1.25rem] bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200/80 dark:border-slate-700/50 shadow-sm overflow-hidden relative">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-500/30">
              {user ? user.firstName.charAt(0) : role.charAt(0)}
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate tracking-wider">{role}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-white dark:bg-slate-900/50 rounded-xl p-1.5 border border-slate-100 dark:border-slate-700/50">
            {mounted && (
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-center w-1/2 py-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button 
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              className="flex items-center justify-center w-1/2 py-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative transition-colors duration-300">
        {/* Background glow effects */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-50 dark:bg-indigo-900/20 blur-[120px] pointer-events-none z-0 transition-colors duration-1000" />
        
        {/* Top Header */}
        <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 z-20 sticky top-0 transition-colors duration-300">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {links.find(l => l.href === pathname)?.name || "Dashboard"}
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Notifications Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={cn(
                    "relative p-2.5 rounded-full transition-all duration-200",
                    showNotifications 
                      ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" 
                      : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                  )}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                            <Bell className="w-8 h-8 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                            No notifications yet.
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {notifications.map(notification => (
                              <div 
                                key={notification.id} 
                                onClick={() => !notification.isRead && markAsRead(notification.id)}
                                className={cn(
                                  "p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer relative",
                                  !notification.isRead ? "bg-indigo-50/30 dark:bg-indigo-500/5" : ""
                                )}
                              >
                                {!notification.isRead && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                                )}
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className={cn("text-sm", !notification.isRead ? "font-bold text-slate-900 dark:text-white" : "font-semibold text-slate-700 dark:text-slate-300")}>
                                    {notification.title}
                                  </h4>
                                  <span className="text-[10px] font-medium text-slate-400">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-center">
                        <button className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}