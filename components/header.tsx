'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Stethoscope, Menu, X, User as UserIcon, LogOut, LayoutDashboard, Calendar, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Doctors', href: '/doctors' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-lg border-b shadow-sm py-2' : 'bg-transparent py-4'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-foreground">
            Medi<span className="text-primary text-3xl">.</span>Care
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/50">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${isActive(link.href)
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth/User Section */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold px-6">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="font-bold px-6 shadow-lg shadow-primary/20 rounded-full">
                  Get Started
                </Button>
              </Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.email} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-2 p-2" align="end">
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{user.firstName} {user.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <Badge variant="outline" className="w-fit mt-1 px-1 py-0 text-[10px] uppercase font-bold tracking-wider">
                      {user.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={user.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard'} className="cursor-pointer gap-2 p-2">
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 p-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Appointments</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 p-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 p-3 text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="w-4 h-4" />
                  <span className="font-bold">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-xl bg-muted/50 border border-border"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-2xl p-4 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`p-4 rounded-xl font-bold flex items-center justify-between ${isActive(link.href) ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-px bg-border my-2" />

            {user ? (
              <>
                <Link
                  href={user.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard'}
                  onClick={() => setIsMenuOpen(false)}
                  className="p-4 rounded-xl font-bold flex items-center gap-3 hover:bg-muted"
                >
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                  Dashboard
                </Link>
                <Button
                  variant="destructive"
                  className="mt-4 font-bold rounded-xl py-6"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-bold rounded-xl py-6 underline-offset-4">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full font-bold rounded-xl py-6 shadow-lg shadow-primary/20 border-border border">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

// Internal Badge component (mimicking shadcn UI)
function Badge({ children, variant, className }: any) {
  const styles = variant === 'outline' ? 'border border-border text-foreground' : 'bg-primary text-primary-foreground';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles} ${className}`}>
      {children}
    </span>
  );
}

