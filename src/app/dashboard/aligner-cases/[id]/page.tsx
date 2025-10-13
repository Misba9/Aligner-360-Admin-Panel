'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { AlignerCaseService } from '@/services/alignercase.service';
import { ArrowLeft, Edit, Calendar, User, Package, Smile, Mail, Phone } from 'lucide-react';

const AlignerCaseDetailsPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const caseId = params.id as string;

    const { data: caseData, isLoading, error } = useQuery({
        queryKey: ['aligner-case', caseId],
        queryFn: () => AlignerCaseService.getAlignerCaseById(caseId),
        enabled: !!caseId,
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !caseData?.success) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">Failed to load aligner case. Please try again.</p>
            </div>
        );
    }

    const alignerCase = caseData.data;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Aligner Cases
                </button>
                <Link
                    href={`/dashboard/aligner-cases/${alignerCase.id}/edit`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                >
                    <Edit className="w-4 h-4" />
                    Edit Case
                </Link>
            </div>

            {/* Case Content */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Case Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Smile className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{alignerCase.name}</h1>
                                    <p className="text-gray-600">Case ID: {alignerCase.id}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Package className="w-4 h-4" />
                                    <span>Quantity: {alignerCase.quantity}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Created: {formatDate(alignerCase.createdAt)}</span>
                                </div>
                                {alignerCase.updatedAt !== alignerCase.createdAt && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Updated: {formatDate(alignerCase.updatedAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Assignment Section */}
                <div className="px-6 py-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Allocated To
                    </h2>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-medium text-green-600">
                                    {alignerCase.user.firstName.charAt(0)}{alignerCase.user.lastName.charAt(0)}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {alignerCase.user.firstName} {alignerCase.user.lastName}
                                </h3>
                                <div className="flex items-center gap-1 text-gray-600 mt-1">
                                    <Mail className="w-4 h-4" />
                                    <span>{alignerCase.user.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Case Details */}
                <div className="px-6 py-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Case Name</p>
                                <p className="text-gray-900 text-lg">{alignerCase.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Quantity</p>
                                <p className="text-gray-900 text-lg">{alignerCase.quantity}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Created Date</p>
                                <p className="text-gray-900">{formatDate(alignerCase.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Last Updated</p>
                                <p className="text-gray-900">{formatDate(alignerCase.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
                <Link
                    href="/dashboard/aligner-cases"
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to all cases
                </Link>
                <div className="flex gap-3">
                    <Link
                        href={`/dashboard/aligner-cases/${alignerCase.id}/edit`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Case
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AlignerCaseDetailsPage;
