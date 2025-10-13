'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { AdminCaseStudyService } from '@/services/casestudy.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Edit,
    Trash2,
    User,
    Calendar,
    Stethoscope,
    Camera,
    Info
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CaseStudyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const caseStudyId = params.id as string;

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { data: caseStudyResponse, isLoading, error } = useQuery({
        queryKey: ['case-study', caseStudyId],
        queryFn: () => AdminCaseStudyService.getCaseStudyById(caseStudyId),
    });

    const deleteMutation = useMutation({
        mutationFn: () => AdminCaseStudyService.deleteCaseStudy(caseStudyId),
        onSuccess: () => {
            toast.success('Case study deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-case-studies'] });
            router.push('/dashboard/case-studies');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete case study');
        },
    });

    const handleDelete = () => {
        deleteMutation.mutate();
        setShowDeleteDialog(false);
    };

    const getGenderBadge = (gender: string) => {
        return gender === 'M' ? (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Male
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                Female
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-64 bg-gray-200 rounded-lg"></div>
                            <div className="h-48 bg-gray-200 rounded-lg"></div>
                        </div>
                        <div className="space-y-6">
                            <div className="h-32 bg-gray-200 rounded-lg"></div>
                            <div className="h-48 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !caseStudyResponse?.data) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Error loading case study. Please try again.</p>
                <Link
                    href="/dashboard/case-studies"
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Back to Case Studies
                </Link>
            </div>
        );
    }

    const caseStudy = caseStudyResponse.data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/dashboard/case-studies"
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Case Study Details</h1>
                        <p className="text-gray-600 mt-1">Patient: {caseStudy.name}</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Link
                        href={`/dashboard/case-studies/${caseStudy.id}/edit`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Link>
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Treatment Images */}
                    <Card className="shadow-lg border-gray-200">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                            <CardTitle className="flex items-center space-x-2">
                                <Camera className="h-5 w-5 text-purple-600" />
                                <span>Treatment Results</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Before Treatment</h3>
                                    <img
                                        src={caseStudy.imageBefore}
                                        alt="Before treatment"
                                        className="w-full h-64 object-cover rounded-lg border border-gray-300 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">After Treatment</h3>
                                    <img
                                        src={caseStudy.imageAfter}
                                        alt="After treatment"
                                        className="w-full h-64 object-cover rounded-lg border border-gray-300 shadow-sm"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Case Description */}
                    <Card className="shadow-lg border-gray-200">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                            <CardTitle className="flex items-center space-x-2">
                                <Info className="h-5 w-5 text-green-600" />
                                <span>Case Description</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {caseStudy.case}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Treatment Details */}
                    <Card className="shadow-lg border-gray-200">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                            <CardTitle className="flex items-center space-x-2">
                                <Stethoscope className="h-5 w-5 text-blue-600" />
                                <span>Treatment Details</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <h4 className="text-base font-semibold text-gray-900 mb-2">Upper Jaw Treatment</h4>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {caseStudy.upper}
                                </p>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-base font-semibold text-gray-900 mb-2">Lower Jaw Treatment</h4>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {caseStudy.lower}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Patient Info & Metadata */}
                <div className="space-y-6">
                    {/* Patient Information */}
                    <Card className="shadow-lg border-gray-200">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                            <CardTitle className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-blue-600" />
                                <span>Patient Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">Name</span>
                                <span className="text-sm text-gray-900">{caseStudy.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">Age</span>
                                <span className="text-sm text-gray-900">{caseStudy.age}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">Gender</span>
                                {getGenderBadge(caseStudy.gender)}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metadata */}
                    <Card className="shadow-lg border-gray-200">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-gray-600" />
                                <span>Case Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <span className="text-sm font-medium text-gray-500 block mb-1">Created Date</span>
                                <span className="text-sm text-gray-900">{formatDate(caseStudy.createdAt)}</span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500 block mb-1">Last Updated</span>
                                <span className="text-sm text-gray-900">{formatDate(caseStudy.updatedAt)}</span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500 block mb-1">Case ID</span>
                                <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                    {caseStudy.id}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this case study for patient "{caseStudy.name}"?
                            This action cannot be undone and will permanently remove all associated data and images.
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
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete Case Study'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
