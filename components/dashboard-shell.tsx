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
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard, role: 'admin' },
    { name: 'Doctors', href: '/admin/doctors', icon: Stethoscope, role: 'admin' },
    { name: 'Patients', href: '/admin/patients', icon: Users, role: 'admin' },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar, role: 'admin' },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard, role: 'admin' },

    // Patient Links
    { name: 'Health Center', href: '/patient/dashboard', icon: Activity, role: 'patient' },
    { name: 'My Appointments', href: '/patient/appointments', icon: History, role: 'patient' },
    { name: 'Find Doctors', href: '/doctors', icon: Stethoscope, role: 'patient' },
    // { name: 'Payments', href: '/patient/payments', icon: CreditCard, role: 'patient' },

    // Common Links
    // { name: 'Account Settings', href: '/settings', icon: Settings },
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
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-8 pb-4">
                        <Link href="/" className="flex items-center gap-3 mb-10 group">
                            <div className="bg-primary p-2.5 rounded-2xl shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
                                <Stethoscope className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-slate-900 flex items-baseline gap-1">
                                MediCare<span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
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
                      flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-sm transition-all duration-200 group
                      ${active
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                                            {link.name}
                                        </div>
                                        {active && <div className="h-5 w-1 bg-white/40 rounded-full"></div>}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* User Profile Summary (Sidebar Footer) */}
                    <div className="mt-auto p-6 border-t border-slate-100">
                        <div className="bg-slate-50 p-4 rounded-3xl group cursor-pointer hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 ring-2 ring-white">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {user?.firstName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-grow min-w-0">
                                    <p className="text-xs font-black text-slate-900 truncate uppercase tracking-wider">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 truncate tracking-tight">{user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 transition-colors"
                            >
                                <LogOut className="w-3 h-3" />
                                Terminate Session
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-30">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden rounded-xl"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="uppercase tracking-[0.2em]">Encrypted Connection</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                            <span className="text-slate-900">{role === 'admin' ? 'Command Center v2.0' : 'Health Intelligence Interface'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search clinical records..."
                                className="bg-slate-100 border-none rounded-2xl pl-11 pr-4 py-2.5 text-xs font-bold w-64 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-2xl h-11 w-11 relative bg-white border-slate-200/60"
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        >
                            <Bell className="w-5 h-5 text-slate-600" />
                            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full ring-2 ring-white"></span>
                        </Button>

                        <Link href="/settings">
                            <Button variant="outline" className="hidden lg:flex items-center gap-3 rounded-2xl h-11 px-6 border-slate-200/60 bg-white font-black text-xs text-slate-600">
                                <Settings className="w-4 h-4" />
                                Configure
                            </Button>
                        </Link>

                        <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block"></div>

                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{role} Account</p>
                                <p className="text-sm font-black text-slate-900 leading-none">{user?.firstName}</p>
                            </div>
                            <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                                <AvatarFallback className="bg-primary text-white font-bold">{user?.firstName?.[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
