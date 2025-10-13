'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Play,
    Square,
    X,
    Calendar,
    Clock,
    Users,
    DollarSign,
    Globe,
    Video,
    FileText,
    Tag,
    Eye,
    EyeOff,
    ExternalLink
} from 'lucide-react';
import { LiveSessionService, type LiveSession } from '@/services/live-session.service';

const LiveSessionDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const sessionId = params.id as string;

    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

    const { data: sessionResponse, isLoading, error } = useQuery({
        queryKey: ['live-session', sessionId],
        queryFn: () => LiveSessionService.getLiveSessionById(sessionId),
        enabled: !!sessionId,
    });

    const deleteMutation = useMutation({
        mutationFn: () => LiveSessionService.deleteLiveSession(sessionId),
        onSuccess: () => {
            router.push('/dashboard/live-sessions');
        },
    });

    const startMutation = useMutation({
        mutationFn: () => LiveSessionService.startLiveSession(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['live-session', sessionId] });
        },
    });

    const endMutation = useMutation({
        mutationFn: () => LiveSessionService.endLiveSession(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['live-session', sessionId] });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: () => LiveSessionService.cancelLiveSession(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['live-session', sessionId] });
        },
    });

    const handleDelete = () => {
        deleteMutation.mutate();
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
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString: string, timeZone: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone,
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !sessionResponse?.data) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Error loading session data. Please try again.</p>
                <Link
                    href="/dashboard/live-sessions"
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Back to Sessions
                </Link>
            </div>
        );
    }

    const session: LiveSession = sessionResponse.data;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/dashboard/live-sessions"
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
                        <p className="text-gray-600 mt-1">Live session details and management</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    {session.status === 'SCHEDULED' && (
                        <button
                            onClick={() => startMutation.mutate()}
                            disabled={startMutation.isPending}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-nowrap"
                        >
                            <Play className="h-4 w-4 mr-2" />
                            Start Session
                        </button>
                    )}
                    {session.status === 'LIVE' && (
                        <button
                            onClick={() => endMutation.mutate()}
                            disabled={endMutation.isPending}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            <Square className="h-4 w-4 mr-2" />
                            End Session
                        </button>
                    )}
                    <Link
                        href={`/dashboard/live-sessions/${sessionId}/edit`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Link>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Status and Quick Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {getStatusBadge(session.status)}
                        <div className="flex items-center text-gray-600">
                            {session.isActive ? (
                                <><Eye className="h-4 w-4 mr-1" /> Public</>
                            ) : (
                                <><EyeOff className="h-4 w-4 mr-1" /> Draft</>
                            )}
                        </div>
                        <div className="flex items-center text-gray-600">
                            {session.isFree ? (
                                <span className="text-green-600 font-medium">Free</span>
                            ) : (
                                <>
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    {session.price} {session.currency}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        Created on {formatDate(session.createdAt, session.timezone)}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Thumbnail */}
                    {session.thumbnailImage && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thumbnail</h2>
                            <img
                                src={session.thumbnailImage}
                                alt={session.title}
                                className="w-full h-48 object-cover rounded-lg"
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                        <div className="prose max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap">{session.description}</p>
                        </div>
                    </div>

                    {/* Topic and Tags */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Topic & Tags</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Main Topic</h3>
                                <p className="text-gray-900">{session.topic}</p>
                            </div>
                            {session.tags && session.tags.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {session.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                            >
                                                <Tag className="h-3 w-3 mr-1" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Materials */}
                    {session.materials && session.materials.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Materials</h2>
                            <div className="space-y-3">
                                {session.materials.map((material, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                            <span className="text-sm text-gray-700 truncate">{material}</span>
                                        </div>
                                        <a
                                            href={material}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}                    {/* Recording */}
                    {session.recordingUrl && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recording</h2>
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center">
                                    <Video className="h-5 w-5 text-blue-600 mr-3" />
                                    <span className="text-blue-900 font-medium">
                                        {session.recordingUrl.includes('youtube.com') || session.recordingUrl.includes('youtu.be')
                                            ? 'YouTube Recording Available'
                                            : 'Session Recording Available'}
                                    </span>
                                </div>
                                <a
                                    href={session.recordingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Watch <ExternalLink className="h-4 w-4 ml-2" />
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Session Info */}
                <div className="space-y-6">
                    {/* Schedule Info */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule</h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Date & Time</p>
                                    <p className="text-gray-900">{formatDate(session.scheduledAt, session.timezone)}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Duration</p>
                                    <p className="text-gray-900">{session.duration} minutes</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Globe className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Timezone</p>
                                    <p className="text-gray-900">{session.timezone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meeting Info */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Meeting</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Meeting Link</p>
                                <a
                                    href={session.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                >
                                    <Video className="h-4 w-4 mr-2" />
                                    Join Meeting
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                </a>
                            </div>
                            {session.meetId && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Meeting ID</p>
                                    <p className="text-gray-900 font-mono">{session.meetId}</p>
                                </div>
                            )}
                            {session.maxParticipants && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Max Participants</p>
                                    <p className="text-gray-900">{session.maxParticipants}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                                    <span className="text-sm text-gray-700">Registered</span>
                                </div>
                                <span className="text-lg font-semibold text-gray-900">{session.registrationCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Users className="h-5 w-5 text-green-600 mr-2" />
                                    <span className="text-sm text-gray-700">Attended</span>
                                </div>
                                <span className="text-lg font-semibold text-gray-900">{session.attendanceCount}</span>
                            </div>
                            {session.registrationCount > 0 && (
                                <div className="pt-2 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Attendance Rate</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {Math.round((session.attendanceCount / session.registrationCount) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Creator Info */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Created By</h2>
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                    {session.createdBy.firstName[0]}{session.createdBy.lastName[0]}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {session.createdBy.firstName} {session.createdBy.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{session.createdBy.email}</p>
                                <p className="text-xs text-gray-500 uppercase">{session.createdBy.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* SEO Info */}
                    {(session.metaTitle || session.metaDescription) && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO</h2>
                            <div className="space-y-4">
                                {session.metaTitle && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Meta Title</p>
                                        <p className="text-gray-900 text-sm">{session.metaTitle}</p>
                                    </div>
                                )}
                                {session.metaDescription && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Meta Description</p>
                                        <p className="text-gray-900 text-sm">{session.metaDescription}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Delete Live Session
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{session.title}"? This action cannot be undone.
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                disabled={deleteMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
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

export default LiveSessionDetailsPage;
