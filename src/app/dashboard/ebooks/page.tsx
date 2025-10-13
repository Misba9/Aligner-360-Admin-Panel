'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminEbookService, Ebook, EbookQuery } from '@/services/ebook.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/input';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Filter,
    BookOpen,
    Users,
    Download,
    TrendingUp,
    FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const AdminEbooksPage: React.FC = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [ebookToDelete, setEbookToDelete] = useState<string>('');

    // Fetch ebooks
    const { data: ebooksData, isLoading } = useQuery({
        queryKey: ['admin-ebooks', {
            page: currentPage,
            search: searchQuery,
            status: selectedStatus,
        }],
        queryFn: () => AdminEbookService.getAllEbooks({
            page: currentPage,
            limit: 10,
            search: searchQuery || undefined,
            status: selectedStatus || undefined,
        }),
    });

    // Fetch statistics
    const { data: statsData } = useQuery({
        queryKey: ['ebook-statistics'],
        queryFn: AdminEbookService.getEbookStatistics,
    });

    // Fetch categories
    const { data: categoriesData } = useQuery({
        queryKey: ['ebookCategories'],
        queryFn: AdminEbookService.getEbookCategories,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => AdminEbookService.deleteEbook(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ebooks'] });
            queryClient.invalidateQueries({ queryKey: ['ebook-statistics'] });
            setShowDeleteDialog(false);
            setEbookToDelete('');
            toast.success('Ebook deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete ebook');
        },
    });

    // Publish/Unpublish mutation
    const publishMutation = useMutation({
        mutationFn: ({ id, action }: { id: string; action: 'publish' | 'unpublish' }) => {
            return action === 'publish'
                ? AdminEbookService.publishEbook(id)
                : AdminEbookService.unpublishEbook(id);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin-ebooks'] });
            queryClient.invalidateQueries({ queryKey: ['ebook-statistics'] });
            toast.success(
                `Ebook ${variables.action === 'publish' ? 'published' : 'unpublished'} successfully`
            );
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update ebook status');
        },
    });

    const ebooks = ebooksData?.data || [];
    const pagination = ebooksData?.pagination;
    const stats = statsData?.data;
    const categories = categoriesData?.data || [];

    const statuses = [
        { value: 'DRAFT', label: 'Draft' },
        { value: 'PUBLISHED', label: 'Published' },
        { value: 'ARCHIVED', label: 'Archived' },
        { value: 'UNDER_REVIEW', label: 'Under Review' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedStatus('');
        setCurrentPage(1);
    };

    const confirmDelete = () => {
        if (ebookToDelete) {
            deleteMutation.mutate(ebookToDelete);
        }
    };

    const handleToggleVisibility = (ebookId: string, action: 'publish' | 'unpublish') => {
        publishMutation.mutate({ id: ebookId, action });
    };

    const getStatusBadge = (status: string) => {
        const statusStyles = {
            DRAFT: 'bg-yellow-100 text-yellow-800',
            PUBLISHED: 'bg-green-100 text-green-800',
            ARCHIVED: 'bg-gray-100 text-gray-800',
            UNDER_REVIEW: 'bg-blue-100 text-blue-800',
        };
        return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800';
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Ebooks</h1>
                    <p className="text-gray-600">Manage your dental ebooks and track downloads</p>
                </div>
                <Button onClick={() => router.push('/dashboard/ebooks/create')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Ebook
                </Button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Ebooks</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalEbooks}</div>
                            <p className="text-xs text-muted-foreground">
                                +{stats.publishedEbooks} published
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                            <Download className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
                            <p className="text-xs text-muted-foreground">
                                Across all ebooks
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalViews}</div>
                            <p className="text-xs text-muted-foreground">
                                Ebook page views
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Published Ebooks</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.publishedEbooks}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.draftEbooks} drafts pending
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Search and Filters */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-lg border border-white/20">
                <CardContent className="p-6">
                    <form onSubmit={handleSearch} className="flex gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search ebooks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                            Search
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="border-purple-200 hover:bg-purple-50"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </form>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">All Statuses</option>
                                    {statuses.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={clearFilters} variant="outline" className="w-full">
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Ebooks Table */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-lg border border-white/20">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle>Ebooks</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array(5).fill(0).map((_, index) => (
                                <div key={index} className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : ebooks.length === 0 ? (
                        <div className="text-center py-8">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No ebooks found</h3>
                            <p className="text-gray-600 mb-4">Get started by creating your first ebook</p>
                            <Button onClick={() => router.push('/dashboard/ebooks/create')}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Ebook
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Ebook</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Downloads</th>
                                        <th className="text-left p-4 font-medium">Views</th>
                                        <th className="text-left p-4 font-medium">Created</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ebooks.map((ebook: Ebook) => (
                                        <tr key={ebook.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        {ebook.thumbnailImage ? (
                                                            <img
                                                                src={ebook.thumbnailImage}
                                                                alt={ebook.title}
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <FileText className="w-6 h-6 text-white" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 max-w-sm flex-1">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {ebook.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 truncate">
                                                            {ebook.shortDescription || ebook.description}
                                                        </p>
                                                        <div className="flex items-center mt-1 space-x-2">
                                                            <FileText className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-500">
                                                                {ebook.isFreeEbook ? 'Free' : `$${ebook.price}`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={getStatusBadge(ebook.status)}>
                                                    {ebook.status}
                                                </Badge>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center">
                                                    <Download className="w-4 h-4 text-gray-400 mr-1" />
                                                    {ebook.downloadCount}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center">
                                                    <Eye className="w-4 h-4 text-gray-400 mr-1" />
                                                    {ebook.viewCount}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-gray-600">
                                                    {new Date(ebook.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">                                                    <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => router.push(`/dashboard/ebooks/${ebook.id}`)}
                                                    title="Edit Ebook"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleToggleVisibility(
                                                            ebook.id,
                                                            ebook.status === 'PUBLISHED' ? 'unpublish' : 'publish'
                                                        )}
                                                        disabled={publishMutation.isPending}
                                                        title={ebook.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                                                    >
                                                        {ebook.status === 'PUBLISHED' ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEbookToDelete(ebook.id);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                        disabled={deleteMutation.isPending}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6 space-x-2">
                            <Button
                                variant="outline"
                                disabled={!pagination.hasPrevPage}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                Previous
                            </Button>

                            <span className="text-sm text-gray-600">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>

                            <Button
                                variant="outline"
                                disabled={!pagination.hasNextPage}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this ebook? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(false)}
                                disabled={deleteMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmDelete}
                                disabled={deleteMutation.isPending}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEbooksPage;
