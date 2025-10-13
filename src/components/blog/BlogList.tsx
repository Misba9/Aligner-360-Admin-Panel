'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    MoreVertical,
    Calendar,
    User,
    Tag,
    Filter
} from 'lucide-react';
import { BlogService } from '@/services/blog.service';
import { Blog } from '@/types/blog';
import { cn } from '@/lib/utils';

const BlogList: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const { data: blogsData, isLoading, error } = useQuery({
        queryKey: ['blogs', currentPage, statusFilter, searchTerm],
        queryFn: () => BlogService.getAllBlogs({
            page: currentPage,
            limit: 10,
            status: statusFilter === 'all' ? undefined : statusFilter,
            search: searchTerm || undefined,
        }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => BlogService.deleteBlog(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            setShowDeleteConfirm(null);
        },
    });

    const publishMutation = useMutation({
        mutationFn: (id: string) => BlogService.publishBlog(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
        },
    });

    const unpublishMutation = useMutation({
        mutationFn: (id: string) => BlogService.unpublishBlog(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
        },
    });

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    const handleStatusToggle = (blog: Blog) => {
        if (blog.status === 'PUBLISHED') {
            unpublishMutation.mutate(blog.id);
        } else {
            publishMutation.mutate(blog.id);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return 'bg-green-100 text-green-800';
            case 'DRAFT':
                return 'bg-yellow-100 text-yellow-800';
            case 'ARCHIVED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">Failed to load blogs. Please try again.</p>
            </div>
        );
    }

    const blogs = blogsData?.data || [];
    const pagination = blogsData?.pagination;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
                    <p className="text-gray-600">Manage your blog posts</p>
                </div>
                <Link
                    href="/dashboard/blogs/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Blog
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search blogs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Blog List */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                {blogs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 mb-4">
                            <Filter className="w-12 h-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
                        <p className="text-gray-600">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Get started by creating your first blog post.'}
                        </p>
                        {!searchTerm && statusFilter === 'all' && (
                            <Link
                                href="/dashboard/blogs/new"
                                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create your first blog
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {blogs.map((blog) => (
                            <div key={blog.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                                {blog.title}
                                            </h3>
                                            <span
                                                className={cn(
                                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                                    getStatusColor(blog.status)
                                                )}
                                            >
                                                {blog.status}
                                            </span>
                                        </div>

                                        {blog.excerpt && (
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{blog.excerpt}</p>
                                        )}

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(blog.updatedAt)}</span>
                                            </div>
                                            {blog.tags && blog.tags.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Tag className="w-4 h-4" />
                                                    <span>{blog.tags.length} tags</span>
                                                </div>
                                            )}
                                        </div>

                                        {blog.tags && blog.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {blog.tags.slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {blog.tags.length > 3 && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        +{blog.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <Link
                                            href={`/dashboard/blogs/${blog.id}`}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                                            title="View blog"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href={`/dashboard/blogs/${blog.id}/edit`}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                            title="Edit blog"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleStatusToggle(blog)}
                                            className={cn(
                                                'px-3 py-1 text-xs font-medium rounded-md',
                                                blog.status === 'PUBLISHED'
                                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                            )}
                                            title={blog.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                                        >
                                            {blog.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(blog.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                            title="Delete blog"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} results
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={pagination.page === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-md border-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Blog</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this blog? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                disabled={deleteMutation.isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogList;
