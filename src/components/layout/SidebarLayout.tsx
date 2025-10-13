'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    Users,
    UserCheck,
    Settings,
    LogOut,
    Menu,
    X,
    GraduationCap,
    BookOpen,
    Video,
    MessageCircleIcon,
    Stethoscope,
    UsersRound,
    Smile,
    Play,
    MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthService } from '@/services/auth.service';

interface SidebarLayoutProps {
    children: React.ReactNode;
}

const navigationItems = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        name: 'Blogs',
        href: '/dashboard/blogs',
        icon: FileText,
    },
    {
        name: 'Courses',
        href: '/dashboard/courses',
        icon: GraduationCap,
    },
    {
        name: 'Ebooks',
        href: '/dashboard/ebooks',
        icon: BookOpen,
    },
    {
        name: 'Live Sessions',
        href: '/dashboard/live-sessions',
        icon: Video,
    }, {
        name: 'Case Studies',
        href: '/dashboard/case-studies',
        icon: Stethoscope,
    }, {
        name: 'Aligner Cases',
        href: '/dashboard/aligner-cases',
        icon: Smile,
    },
    {
        name: 'Process',
        href: '/dashboard/process',
        icon: Play,
    },
    {
        name: "Contacts",
        href: "/dashboard/contacts",
        icon: MessageCircleIcon
    }, {
        name: "Testimonials",
        href: "/dashboard/testimonials",
        icon: UsersRound
    },
    {
        name: "Map Users",
        href: "/dashboard/map-users",
        icon: MapPin
    },
    {
        name: "Users",
        href: "/dashboard/users",
        icon: Users
    }

];

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await AuthService.logout()
            router.push('/')
            window.location.href = '/'
        } catch (error) {
            // Handle error silently
        }
        finally {
            window.location.href = '/'
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Sidebar for desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col">
                <div className="flex flex-col flex-grow pt-5 bg-white/95 backdrop-blur-sm overflow-y-auto border-r border-gray-200 shadow-lg">
                    <div className="flex items-center flex-shrink-0 px-4">
                        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                    </div>
                    <div className="mt-5 flex-grow flex flex-col">
                        <nav className="flex-1 px-2 pb-4 space-y-1">
                            {navigationItems.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                                            isActive
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                'mr-3 flex-shrink-0 h-5 w-5',
                                                isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                            )}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="flex-shrink-0 px-2 pb-4">
                            <button
                                onClick={handleLogout}
                                className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            >
                                <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar for mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white/95 backdrop-blur-sm shadow-xl">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-4">
                                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                            </div>
                            <nav className="mt-5 px-2 space-y-1">
                                {navigationItems.map((item) => {
                                    const isActive = pathname === item.href ||
                                        (item.href !== '/dashboard' && pathname.startsWith(item.href));

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                                                isActive
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            )}
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <item.icon
                                                className={cn(
                                                    'mr-3 flex-shrink-0 h-5 w-5',
                                                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                                )}
                                            />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                        <div className="flex-shrink-0 px-2 pb-4">
                            <button
                                onClick={handleLogout}
                                className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                            >
                                <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">                {/* Top navigation */}
                <div className="relative z-10 flex-shrink-0 flex h-16 bg-white/95 backdrop-blur-sm shadow-md md:hidden">
                    <button
                        type="button"
                        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex-1 px-4 flex justify-between items-center">
                        <h1 className="text-lg font-medium text-gray-900">Admin Panel</h1>
                        <button
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>                {/* Page content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gradient-to-br from-white/50 to-slate-50/80">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SidebarLayout;
