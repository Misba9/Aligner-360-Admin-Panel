'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BlogService } from '@/services/blog.service';
import BlogForm from '@/components/blog/BlogForm';

export default function EditBlogPage() {
    const params = useParams();
    const blogId = params.id as string;

    const { data: blogData, isLoading, error } = useQuery({
        queryKey: ['blog', blogId],
        queryFn: () => BlogService.getBlogById(blogId),
        enabled: !!blogId,
    });

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

    return <BlogForm blog={blogData.data} mode="edit" />;
}
