'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Edit, Calendar, User, Tag, Eye } from 'lucide-react';
import { BlogService } from '@/services/blog.service';
import { cn } from '@/lib/utils';

export default function BlogDetailPage() {
    const params = useParams();
    const router = useRouter();
    const blogId = params.id as string;

    const { data: blogData, isLoading, error } = useQuery({
        queryKey: ['blog', blogId],
        queryFn: () => BlogService.getBlogById(blogId),
        enabled: !!blogId,
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'archived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !blogData?.success) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">Failed to load blog. Please try again.</p>
            </div>
        );
    }

    const blog = blogData.data;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blogs
                </button>
                <Link
                    href={`/dashboard/blogs/${blog.id}/edit`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                >
                    <Edit className="w-4 h-4" />
                    Edit Blog
                </Link>
            </div>

            {/* Blog Content */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Blog Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{blog.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span
                                    className={cn(
                                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                        getStatusColor(blog.status)
                                    )}
                                >
                                    {blog.status}
                                </span>
                                <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    <span>{blog.author.firstName} {blog.author.lastName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Created: {formatDate(blog.createdAt)}</span>
                                </div>
                                {blog.updatedAt !== blog.createdAt && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Updated: {formatDate(blog.updatedAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {blog.excerpt && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Excerpt</h3>
                            <p className="text-gray-700">{blog.excerpt}</p>
                        </div>
                    )}

                    {blog.tags && blog.tags.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {blog.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                    >
                                        <Tag className="w-3 h-3 mr-1" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Featured Image */}
                {blog.featuredImage && (
                    <div className="px-6 py-4">
                        <img
                            src={blog.featuredImage}
                            alt={blog.title}
                            className="w-full h-64 object-cover rounded-lg"
                        />
                    </div>
                )}

                {/* Blog Content */}
                <div className="px-6 py-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Content</h3>
                    <div className="prose max-w-none">
                        <div
                            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                                __html: blog.content.replace(/\n/g, '<br />')
                            }}
                        />
                    </div>
                </div>

                {/* Blog Stats */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Status:</span>
                            <span className="ml-2 font-medium text-gray-900 capitalize">{blog.status}</span>
                        </div>
                        {blog.publishedAt && (
                            <div>
                                <span className="text-gray-600">Published:</span>
                                <span className="ml-2 font-medium text-gray-900">{formatDate(blog.publishedAt)}</span>
                            </div>
                        )}
                        {blog.readingTime && (
                            <div>
                                <span className="text-gray-600">Reading Time:</span>
                                <span className="ml-2 font-medium text-gray-900">{blog.readingTime} min</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
                <Link
                    href="/dashboard/blogs"
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to all blogs
                </Link>
                <div className="flex gap-3">
                    {blog.status === 'PUBLISHED' && (
                        <a
                            href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/blogs/${blog.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            View Live
                        </a>
                    )}
                    <Link
                        href={`/dashboard/blogs/${blog.id}/edit`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Blog
                    </Link>
                </div>
            </div>
        </div>
    );
}
