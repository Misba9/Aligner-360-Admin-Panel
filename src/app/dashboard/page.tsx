'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    Users,
    FileText,
    TrendingUp,
    Plus,
    GraduationCap,
    BookOpen,
    Stethoscope,
    User,
    GroupIcon,
    Smile,
    MapPin
} from 'lucide-react';
import { BlogService } from '@/services/blog.service';
import { AdminCourseService } from '@/services/course.service';
import { AdminEbookService } from '@/services/ebook.service';
import { AlignerCaseService } from '@/services/alignercase.service';
import { AdminMapUserService } from '@/services/mapuser.service';
import axiosInstance from '@/lib/axios';

const DashboardPage: React.FC = () => {
    const { data: blogStats } = useQuery({
        queryKey: ['blog-statistics'],
        queryFn: () => BlogService.getBlogStatistics(),
    });

    const { data: courseStats } = useQuery({
        queryKey: ['course-statistics'],
        queryFn: () => AdminCourseService.getCourseStatistics(),
    }); const { data: ebookStats } = useQuery({
        queryKey: ['ebook-statistics'],
        queryFn: () => AdminEbookService.getEbookStatistics(),
    }); const { data: alignerCaseStats } = useQuery({
        queryKey: ['aligner-case-statistics'],
        queryFn: () => AlignerCaseService.getAlignerCaseStatistics(),
    });

    const { data: mapUserStats } = useQuery({
        queryKey: ['map-user-statistics'],
        queryFn: () => AdminMapUserService.getMapUserStatistics(),
    });

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: async () => await axiosInstance.get('/users')
    }); const { data: testimonials } = useQuery({
        queryKey: ['testimonials'],
        queryFn: async () => await axiosInstance.get('/testimonial')
    }); const totalTestimonials = testimonials?.data?.data?.length || 0;
    const totalUsers = users?.data.users.length || 0; const stats = blogStats?.data;
    const courseStatsData = courseStats?.data;
    const ebookStatsData = ebookStats?.data;
    const alignerCaseStatsData = alignerCaseStats?.data;
    const mapUserStatsData = mapUserStats?.data;
    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">Welcome to your admin dashboard</p>
            </div>            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"><div className="bg-gradient-to-br from-blue-50 to-indigo-100 backdrop-blur-sm border border-blue-200/30 overflow-hidden shadow-lg rounded-lg">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md flex items-center justify-center shadow-sm">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-blue-700 truncate">
                                    Total Users
                                </dt>
                                <dd className="text-lg font-bold text-blue-900">
                                    {totalUsers}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>


                <div className="bg-gradient-to-br from-purple-50 to-violet-100 backdrop-blur-sm border border-purple-200/30 overflow-hidden shadow-lg rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md flex items-center justify-center shadow-sm">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-purple-700 truncate">
                                        Total Blogs
                                    </dt>
                                    <dd className="text-lg font-bold text-purple-900">
                                        {stats?.totalBlogs || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-100 backdrop-blur-sm border border-indigo-200/30 overflow-hidden shadow-lg rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-md flex items-center justify-center shadow-sm">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-indigo-700 truncate">
                                        Published Blogs
                                    </dt>
                                    <dd className="text-lg font-bold text-indigo-900">
                                        {stats?.publishedBlogs || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-100 backdrop-blur-sm border border-orange-200/30 overflow-hidden shadow-lg rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md flex items-center justify-center shadow-sm">
                                    <GraduationCap className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-orange-700 truncate">
                                        Total Courses
                                    </dt>
                                    <dd className="text-lg font-bold text-orange-900">
                                        {courseStatsData?.totalCourses || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-cyan-100 backdrop-blur-sm border border-teal-200/30 overflow-hidden shadow-lg rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-md flex items-center justify-center shadow-sm">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-teal-700 truncate">
                                        Total Ebooks
                                    </dt>
                                    <dd className="text-lg font-bold text-teal-900">
                                        {ebookStatsData?.totalEbooks || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>                <div className="bg-gradient-to-br from-red-50 to-pink-100 backdrop-blur-sm border border-teal-200/30 overflow-hidden shadow-lg rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-md flex items-center justify-center shadow-sm">
                                    <GroupIcon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-red-700 truncate">
                                        Total Testimonials
                                    </dt>
                                    <dd className="text-lg font-bold text-red-900">
                                        {totalTestimonials}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>                <div className="bg-gradient-to-br from-emerald-50 to-green-100 backdrop-blur-sm border border-emerald-200/30 overflow-hidden shadow-lg rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-md flex items-center justify-center shadow-sm">
                                    <Smile className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-emerald-700 truncate">
                                        Aligner Cases
                                    </dt>
                                    <dd className="text-lg font-bold text-emerald-900">
                                        {alignerCaseStatsData?.totalCases || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-pink-100 backdrop-blur-sm border border-rose-200/30 overflow-hidden shadow-lg rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-rose-600 rounded-md flex items-center justify-center shadow-sm">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-rose-700 truncate">
                                        Map Users
                                    </dt>
                                    <dd className="text-lg font-bold text-rose-900">
                                        {mapUserStatsData?.visibleMapUsers || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

            </div>{/* Quick Actions */}
            <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm border border-gray-200/30 shadow-lg rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-slate-50 to-gray-100">
                    <h3 className="text-lg leading-6 font-semibold text-gray-900">Quick Actions</h3>
                    <p className="text-sm text-gray-600 mt-1">Create and manage your content</p>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <Link
                            href="/dashboard/blogs/new"
                            className="flex items-center justify-center px-4 py-3 border border-purple-200 rounded-lg shadow-sm bg-gradient-to-r from-purple-50 to-violet-50 text-sm font-medium text-purple-700 hover:from-purple-100 hover:to-violet-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        >
                            <Plus className="w-5 h-5 mr-2 text-purple-600" />
                            New Blog
                        </Link>

                        <Link
                            href="/dashboard/blogs"
                            className="flex items-center justify-center px-4 py-3 border border-purple-200 rounded-lg shadow-sm bg-gradient-to-r from-purple-50 to-violet-50 text-sm font-medium text-purple-700 hover:from-purple-100 hover:to-violet-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        >
                            <FileText className="w-5 h-5 mr-2 text-purple-600" />
                            Manage Blogs
                        </Link>
                        <Link
                            href="/dashboard/courses/create"
                            className="flex items-center justify-center px-4 py-3 border border-orange-200 rounded-lg shadow-sm bg-gradient-to-r from-orange-50 to-amber-50 text-sm font-medium text-orange-700 hover:from-orange-100 hover:to-amber-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                        >
                            <Plus className="w-5 h-5 mr-2 text-orange-600" />
                            New Course
                        </Link>

                        <Link
                            href="/dashboard/courses"
                            className="flex items-center justify-center px-4 py-3 border border-orange-200 rounded-lg shadow-sm bg-gradient-to-r from-orange-50 to-amber-50 text-sm font-medium text-orange-700 hover:from-orange-100 hover:to-amber-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                        >
                            <GraduationCap className="w-5 h-5 mr-2 text-orange-600" />
                            Manage Courses
                        </Link>
                        <Link
                            href="/dashboard/ebooks/create"
                            className="flex items-center justify-center px-4 py-3 border border-teal-200 rounded-lg shadow-sm bg-gradient-to-r from-teal-50 to-cyan-50 text-sm font-medium text-teal-700 hover:from-teal-100 hover:to-cyan-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        >
                            <Plus className="w-5 h-5 mr-2 text-teal-600" />
                            New Ebook
                        </Link>
                        <Link
                            href="/dashboard/ebooks"
                            className="flex items-center justify-center px-4 py-3 border border-teal-200 rounded-lg shadow-sm bg-gradient-to-r from-teal-50 to-cyan-50 text-sm font-medium text-teal-700 hover:from-teal-100 hover:to-cyan-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        >
                            <BookOpen className="w-5 h-5 mr-2 text-teal-600" />
                            Manage Ebooks
                        </Link>

                        <Link
                            href="/dashboard/case-studies/create"
                            className="flex items-center justify-center px-4 py-3 border border-indigo-200 rounded-lg shadow-sm bg-gradient-to-r from-indigo-50 to-blue-50 text-sm font-medium text-indigo-700 hover:from-indigo-100 hover:to-blue-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                            <Plus className="w-5 h-5 mr-2 text-indigo-600" />
                            New Case Study
                        </Link>                        <Link
                            href="/dashboard/case-studies"
                            className="flex items-center justify-center px-4 py-3 border border-indigo-200 rounded-lg shadow-sm bg-gradient-to-r from-indigo-50 to-blue-50 text-sm font-medium text-indigo-700 hover:from-indigo-100 hover:to-blue-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                            <Stethoscope className="w-5 h-5 mr-2 text-indigo-600" />
                            Manage Case Studies
                        </Link>

                        <Link
                            href="/dashboard/aligner-cases/create"
                            className="flex items-center justify-center px-4 py-3 border border-emerald-200 rounded-lg shadow-sm bg-gradient-to-r from-emerald-50 to-green-50 text-sm font-medium text-emerald-700 hover:from-emerald-100 hover:to-green-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                        >
                            <Plus className="w-5 h-5 mr-2 text-emerald-600" />
                            Allocate Aligner Case
                        </Link>

                        <Link
                            href="/dashboard/aligner-cases"
                            className="flex items-center justify-center px-4 py-3 border border-emerald-200 rounded-lg shadow-sm bg-gradient-to-r from-emerald-50 to-green-50 text-sm font-medium text-emerald-700 hover:from-emerald-100 hover:to-green-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                        >
                            <Stethoscope className="w-5 h-5 mr-2 text-emerald-600" />
                            Manage Aligner Cases
                        </Link>                        <Link
                            href="/dashboard/testimonials"
                            className="flex items-center justify-center px-4 py-3 border border-red-200 rounded-lg shadow-sm bg-gradient-to-r from-red-50 to-pink-50 text-sm font-medium text-red-700 hover:from-red-100 hover:to-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        >
                            <Stethoscope className="w-5 h-5 mr-2 text-red-600" />
                            Manage Testimonials
                        </Link>

                        <Link
                            href="/dashboard/map-users/create"
                            className="flex items-center justify-center px-4 py-3 border border-rose-200 rounded-lg shadow-sm bg-gradient-to-r from-rose-50 to-pink-50 text-sm font-medium text-rose-700 hover:from-rose-100 hover:to-pink-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200"
                        >
                            <Plus className="w-5 h-5 mr-2 text-rose-600" />
                            New Map User
                        </Link>

                        <Link
                            href="/dashboard/map-users"
                            className="flex items-center justify-center px-4 py-3 border border-rose-200 rounded-lg shadow-sm bg-gradient-to-r from-rose-50 to-pink-50 text-sm font-medium text-rose-700 hover:from-rose-100 hover:to-pink-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200"
                        >
                            <MapPin className="w-5 h-5 mr-2 text-rose-600" />
                            Manage Map Users
                        </Link>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
