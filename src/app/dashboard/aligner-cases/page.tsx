'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlignerCaseService, AlignerCase, AlignerCaseQuery } from '@/services/alignercase.service';
import { UserService } from '@/services/user.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/input';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Filter,
    Users,
    Smile,
    TrendingUp,
    Calendar,
    MoreVertical,
    UserCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const AlignerCasesPage: React.FC = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [caseToDelete, setCaseToDelete] = useState<string>('');

    // Fetch aligner cases
    const { data: casesData, isLoading } = useQuery({
        queryKey: ['aligner-cases', {
            page: currentPage,
            search: searchQuery,
            userId: selectedUserId,
            limit: 10
        }],
        queryFn: () => AlignerCaseService.getAllAlignerCases({
            page: currentPage,
            limit: 10,
            search: searchQuery || undefined,
            userId: selectedUserId || undefined,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        }),
    });

    // Fetch statistics
    const { data: statsData } = useQuery({
        queryKey: ['aligner-case-statistics'],
        queryFn: AlignerCaseService.getAlignerCaseStatistics,
    });

    // Fetch users for filter dropdown
    const { data: usersData } = useQuery({
        queryKey: ['users-list'],
        queryFn: () => UserService.getAllUsers(1, 100),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => AlignerCaseService.deleteAlignerCase(id),
        onSuccess: () => {
            toast.success('Aligner case deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['aligner-cases'] });
            queryClient.invalidateQueries({ queryKey: ['aligner-case-statistics'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete aligner case');
        },
    });

    const alignerCases = casesData?.data || [];
    const pagination = casesData?.pagination;
    const stats = statsData?.data;
    const users = usersData?.users || [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedUserId('');
        setCurrentPage(1);
    };

    const handleDeleteCase = (caseId: string) => {
        setCaseToDelete(caseId);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (caseToDelete) {
            deleteMutation.mutate(caseToDelete);
            setShowDeleteDialog(false);
            setCaseToDelete('');
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
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="p-6 space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Aligner Cases</h1>
                    <p className="text-gray-600 mt-1">Manage and track aligner case allocations</p>
                </div>
                <Link
                    href="/dashboard/aligner-cases/create"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Allocate Case
                </Link>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                            <Smile className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCases}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Users with Cases</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.usersWithCases}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Cases/User</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.averageCasesPerUser}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        type="text"
                                        placeholder="Search by case name, quantity, or user..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 border-blue-200 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-64">
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Users</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    <Search className="w-4 h-4 mr-2" />
                                    Search
                                </Button>
                                <Button type="button" variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Aligner Cases Table */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-0">
                    {alignerCases.length === 0 ? (
                        <div className="text-center py-12">
                            <Smile className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No aligner cases</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by allocating your first aligner case.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/dashboard/aligner-cases/create"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Allocate Case
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Case Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Allocated To
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date Created
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {alignerCases.map((alignerCase) => (
                                        <tr key={alignerCase.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                            <Smile className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {alignerCase.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {alignerCase.id.slice(-8)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                                            <span className="text-xs font-medium text-green-600">
                                                                {alignerCase.user.firstName.charAt(0)}{alignerCase.user.lastName.charAt(0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {alignerCase.user.firstName} {alignerCase.user.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {alignerCase.user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                                    {alignerCase.quantity}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {formatDate(alignerCase.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={`/dashboard/aligner-cases/${alignerCase.id}`}
                                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/dashboard/aligner-cases/${alignerCase.id}/edit`}
                                                        className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors"
                                                        title="Edit Case"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteCase(alignerCase.id)}
                                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete Case"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
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
                        <div className="flex justify-center items-center mt-6 space-x-2 px-6 pb-6">
                            <Button
                                variant="outline"
                                disabled={!pagination.hasPrevPage}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                Previous
                            </Button>

                            <span className="text-sm text-gray-600">
                                Page {pagination.currentPage} of {pagination.totalPages}
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
                <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Confirm Deletion
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to delete this aligner case? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
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
                                className="!bg-red-600 hover:bg-red-700 !text-white"
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

export default AlignerCasesPage;
