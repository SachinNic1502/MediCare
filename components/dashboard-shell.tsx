'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Stethoscope,
    Settings,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    ChevronRight,
    User as UserIcon,
    Activity,
    ShieldCheck,
    CreditCard,
    History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SidebarLink {
    name: string;
    href: string;
    icon: any;
    role?: 'admin' | 'patient';
}

const sidebarLinks: SidebarLink[] = [
    // Admin Links
    // Admin Links
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, role: 'admin' },
    { name: 'Doctors', href: '/admin/doctors', icon: Stethoscope, role: 'admin' },
    { name: 'Patients', href: '/admin/patients', icon: Users, role: 'admin' },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar, role: 'admin' },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard, role: 'admin' },

    // Patient Links
    { name: 'Patient Portal', href: '/patient/dashboard', icon: Activity, role: 'patient' },
    { name: 'Appointments', href: '/patient/appointments', icon: History, role: 'patient' },
    { name: 'Find Doctors', href: '/doctors', icon: Stethoscope, role: 'patient' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const role = user?.role as 'admin' | 'patient';
    const filteredLinks = sidebarLinks.filter(link => !link.role || link.role === role);

    const handleLogout = () => {
        logout();
        router.push('/');
        toast.success('Securely signed out');
    };

    const isActive = (href: string) => pathname === href;

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/50 transform transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-8 pb-4">
                        <Link href="/" className="flex items-center gap-3 mb-10 group">
                            <div className="bg-primary p-3 rounded-2xl shadow-[0_8px_30px_rgb(59,130,246,0.2)] rotate-3 group-hover:rotate-0 transition-all duration-500">
                                <Stethoscope className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-slate-900 flex items-baseline gap-1">
                                MediCare<span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                            </span>
                        </Link>

                        <div className="space-y-1">
                            {filteredLinks.map((link) => {
                                const Icon = link.icon;
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`
                      flex items-center justify-between px-5 py-4 rounded-2xl font-black text-sm transition-all duration-300 group
                      ${active
                                                ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200/50 scale-[1.02]'
                                                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Icon className={`w-5 h-5 transition-colors duration-300 ${active ? 'text-white' : 'text-slate-300 group-hover:text-primary'}`} />
                                            {link.name}
                                        </div>
                                        {active && <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* User Profile Summary (Sidebar Footer) */}
                    <div className="mt-auto p-6">
                        <div className="bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100 group transition-all duration-500 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 ring-4 ring-white shadow-sm">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                                    <AvatarFallback className="bg-primary text-white font-black">
                                        {user?.firstName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-grow min-w-0">
                                    <p className="text-xs font-black text-slate-900 truncate uppercase tracking-widest">{user?.firstName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 truncate tracking-tight opacity-70">Administrator Access</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 bg-rose-50 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all duration-500 active:scale-95"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200/40 flex items-center justify-between px-8 sm:px-12 shrink-0 relative z-30">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden rounded-2xl h-12 w-12 bg-slate-50"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                        <div className="hidden sm:flex items-center gap-4 bg-slate-50/50 px-6 py-3 rounded-full border border-slate-100/50">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.15em] text-slate-400">
                                <span className="uppercase">Secure Core</span>
                                <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                <span className="text-slate-900 uppercase">Operational</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden xl:block group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search clinical records..."
                                className="bg-slate-50 border-none rounded-2xl pl-12 pr-6 h-12 text-xs font-bold w-72 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-400 outline-none"
                            />
                        </div>

                        <div className="h-10 w-px bg-slate-100 mx-2 hidden lg:block"></div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-2xl h-12 w-12 relative bg-white border-slate-100 hover:bg-slate-50 transition-all"
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        >
                            <Bell className="w-5 h-5 text-slate-400" />
                            <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-primary rounded-full ring-4 ring-white animate-pulse"></span>
                        </Button>

                        <Link href="/settings">
                            <Button variant="outline" className="hidden lg:flex items-center gap-3 rounded-2xl h-12 px-6 border-slate-100 bg-white font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                                <Settings className="w-4 h-4" />
                                Setting
                            </Button>
                        </Link>

                        <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">Identity</p>
                                <p className="text-sm font-black text-slate-900 leading-none">{user?.firstName} {user?.lastName?.[0]}.</p>
                            </div>
                            <div className="h-12 w-12 p-0.5 rounded-2xl bg-gradient-to-tr from-primary to-blue-400 shadow-lg shadow-primary/20">
                                <Avatar className="h-full w-full rounded-[0.9rem] ring-2 ring-white">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                                    <AvatarFallback className="bg-primary text-white font-black">{user?.firstName?.[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-10 lg:p-12 custom-scrollbar bg-[#F8FAFC]">
                    {children}
                </main>
            </div>
        </div>
    );
}
