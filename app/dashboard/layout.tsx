"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { DASHBOARD_NAV_ITEMS } from "@/lib/constants";

/** Icon mapping for sidebar navigation (SVG) */
const icons: Record<string, React.ReactNode> = {
  home: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  sparkles: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  calendar: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  cart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  activity: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  user: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  /* Redirect to login if not authenticated */
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)]">
        <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[var(--bg-canvas)] p-4 lg:p-6 gap-5 overflow-hidden font-sans">
      {/* ─── Sidebar (Persistent, Icons Only, Black) ──────────── */}
      <aside
        className="hidden sm:flex flex-col w-[76px] rounded-[1.75rem] items-center py-7 shrink-0 shadow-2xl h-full relative z-20"
        style={{ background: "var(--bg-sidebar)" }}
      >
        {/* Logo / Hamburger minimal icon */}
        <Link href="/" className="mb-10 cursor-pointer" title="NutriSync">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </Link>

        {/* Navigation Icons */}
        <nav className="flex-1 flex flex-col gap-5 w-full px-4 mt-2">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-12 h-12 flex items-center justify-center rounded-full mx-auto transition-all duration-200 ${
                  isActive ? "bg-white text-black shadow-md scale-105" : "bg-transparent text-gray-400 hover:text-white"
                }`}
                title={item.label}
                aria-label={item.label}
              >
                <span className="flex items-center justify-center">
                  {icons[item.icon] || <span className="text-sm">{item.label[0]}</span>}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ─── Main Content Area ───────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto pb-10 relative z-10 custom-scrollbar">
        
        {/* ─── Top Bar (Global Controls) ─────────────────────── */}
        <header className="app-shell grid grid-cols-[auto_minmax(240px,520px)_auto] items-center gap-5 mb-6 min-h-[3rem] shrink-0 max-lg:grid-cols-[1fr_auto]">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 hidden md:block">
            Dashboard
          </h1>

          <div className="relative hidden sm:block max-lg:order-3 max-lg:col-span-2 max-lg:max-w-none">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full py-2.5 pl-10 pr-4 bg-white border border-white/80 rounded-full text-sm shadow-sm outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>

          <div className="flex items-center gap-3 justify-self-end shrink-0">
            {/* Add action (Start Consultation) */}
            <Link 
              href="/dashboard/consult"
              className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all"
              title="New Consultation"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </Link>
            {/* Notification (Symptom Log) */}
            <Link 
              href="/dashboard/symptoms"
              className="relative w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors bg-white rounded-full shadow-sm"
              title="Symptom Logs"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Link>
            {/* User Profile */}
            <Link href="/dashboard/profile" className="flex items-center gap-2 bg-white pl-1.5 pr-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all border border-gray-50 max-w-[170px]">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center text-sm font-bold">
                  {user.displayName?.charAt(0) || "U"}
                </div>
              )}
              <span className="text-sm font-semibold text-gray-700 hidden md:block truncate">
                {user.displayName?.split(" ")[0] || "User"}
              </span>
            </Link>
          </div>
        </header>

        {/* ─── Page Content ──────── */}
        <div className="flex-1 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
