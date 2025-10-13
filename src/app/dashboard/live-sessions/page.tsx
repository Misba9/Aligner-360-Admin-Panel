'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
    Plus,
    Search,
    Filter,
    Play,
    Square,
    X,
    Edit,
    Trash2,
    Eye,
    Calendar,
    Clock,
    Users,
    DollarSign,
    MoreHorizontal
} from 'lucide-react';
import { LiveSessionService, type LiveSession, type LiveSessionQuery } from '@/services/live-session.service';

const LiveSessionsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const queryParams: LiveSessionQuery = {
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        page: currentPage.toString(),
        limit: '10',
        sortBy: 'scheduledAt',
        sortOrder: 'desc'
    };

    const { data: liveSessions, isLoading, error } = useQuery({
        queryKey: ['live-sessions', queryParams],
        queryFn: () => LiveSessionService.getAllLiveSessions(queryParams),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => LiveSessionService.deleteLiveSession(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
            setShowDeleteConfirm(null);
        },
        onError: (error) => {
            console.error('Error deleting live session:', error);
        }
    });

    const startMutation = useMutation({
        mutationFn: (id: string) => LiveSessionService.startLiveSession(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
        },
    });

    const endMutation = useMutation({
        mutationFn: (id: string) => LiveSessionService.endLiveSession(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
        },
    });


    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Scheduled' },
            LIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Live' },
            COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
            CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
            POSTPONED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Postponed' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString: string, timeZone: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timeZone,
        });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Error loading live sessions. Please try again.</p>
            </div>
        );
    }

    const sessions = liveSessions?.data || [];
    const pagination = liveSessions?.pagination;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Live Sessions</h1>
                    <p className="text-gray-600 mt-1">Manage and monitor live sessions</p>
                </div>
                <Link
                    href="/dashboard/live-sessions/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Session
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search live sessions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="LIVE">Live</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="POSTPONED">Postponed</option>
                        </select>
                    </div>
                    {(searchTerm || statusFilter) && (
                        <button
                            onClick={resetFilters}
                            className="inline-flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Sessions Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {sessions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No live sessions found.</p>
                        <Link
                            href="/dashboard/live-sessions/create"
                            className="inline-flex items-center px-4 py-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Create Your First Session
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Session Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Schedule
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Participants
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pricing
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sessions.map((session: LiveSession) => (
                                        <tr key={session.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0">
                                                        {session.thumbnailImage ? (
                                                            <img
                                                                src={session.thumbnailImage}
                                                                alt={session.title}
                                                                className="h-12 w-12 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                                <Calendar className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-900 max-w-sm truncate">
                                                            {session.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {session.topic}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            By {session.createdBy.firstName} {session.createdBy.lastName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                        {formatDate(session.scheduledAt,session.timezone)}
                                                    </div>
                                                    <div className="flex items-center mt-1">
                                                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                                        {session.duration} minutes
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(session.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                                                        {session.registrationCount} registered
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {session.attendanceCount} attended
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {session.isFree ? (
                                                        <span className="text-green-600 font-medium">Free</span>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                                                            {session.price} {session.currency}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    {session.status === 'SCHEDULED' && (
                                                        <button
                                                            onClick={() => startMutation.mutate(session.id)}
                                                            disabled={startMutation.isPending}
                                                            className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                                                            title="Start Session"
                                                        >
                                                            <Play className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {session.status === 'LIVE' && (
                                                        <button
                                                            onClick={() => endMutation.mutate(session.id)}
                                                            disabled={endMutation.isPending}
                                                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                                            title="End Session"
                                                        >
                                                            <Square className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/dashboard/live-sessions/${session.id}`}
                                                        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/dashboard/live-sessions/${session.id}/edit`}
                                                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(session.id)}
                                                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                        {pagination.total} sessions
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(pagination.page - 1)}
                                            disabled={!pagination.hasPrevPage}
                                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(pagination.page + 1)}
                                            disabled={!pagination.hasNextPage}
                                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Delete Live Session
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this live session? This action cannot be undone.
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                disabled={deleteMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                disabled={deleteMutation.isPending}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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

export default LiveSessionsPage;
