'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminCaseStudyService, CaseStudy, CaseStudyQuery } from '@/services/casestudy.service';
import { useDebounce } from '@/hooks/useDebounce';
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
    Stethoscope,
    Users,
    Calendar,
    User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';


const AdminCaseStudiesPage: React.FC = () => {
    const router = useRouter();
    const queryClient = useQueryClient(); const [searchQuery, setSearchQuery] = useState('');
    const [selectedGender, setSelectedGender] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [caseStudyToDelete, setCaseStudyToDelete] = useState<string>('');

    // Debounce search query to avoid calling API on every keystroke
    const debouncedSearchQuery = useDebounce(searchQuery, 500);    // Fetch case studies
    const { data: caseStudiesData, isLoading } = useQuery({
        queryKey: ['admin-case-studies', {
            page: currentPage,
            search: debouncedSearchQuery,
            gender: selectedGender,
            limit: 10
        }],
        queryFn: () => AdminCaseStudyService.getAllCaseStudies({
            page: currentPage,
            limit: 10,
            search: debouncedSearchQuery || undefined,
            gender: selectedGender as 'M' | 'F' || undefined,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        }),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => AdminCaseStudyService.deleteCaseStudy(id),
        onSuccess: () => {
            toast.success('Case study deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-case-studies'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete case study');
        },
    });

    const caseStudies = caseStudiesData?.data || [];
    const pagination = caseStudiesData?.pagination;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    }; const clearFilters = () => {
        setSearchQuery('');
        setSelectedGender('');
        setCurrentPage(1);
    };

    const handleEditCaseStudy = (caseStudy: CaseStudy) => {
        router.push(`/dashboard/case-studies/${caseStudy.id}/edit`);
    };

    const handleViewCaseStudy = (caseStudy: CaseStudy) => {
        router.push(`/dashboard/case-studies/${caseStudy.id}`);
    };

    const handleDeleteCaseStudy = (caseStudyId: string) => {
        setCaseStudyToDelete(caseStudyId);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (caseStudyToDelete) {
            deleteMutation.mutate(caseStudyToDelete);
            setShowDeleteDialog(false);
            setCaseStudyToDelete('');
        }
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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
                    <h1 className="text-3xl font-bold text-gray-900">Case Studies</h1>
                    <p className="text-gray-600 mt-1">Manage dental case studies</p>
                </div>
                <Button onClick={() => router.push('/dashboard/case-studies/create')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Case Study
                </Button>
            </div>

            {/* Filters */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, case description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                                />
                            </div>
                        </div>
                        <div className="lg:w-48">
                            <select
                                value={selectedGender}
                                onChange={(e) => setSelectedGender(e.target.value)}
                                className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                            >
                                <option value="">All Genders</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" className="!bg-blue-600 hover:!bg-blue-700 text-white">
                                Search
                            </Button>                            {(searchQuery || selectedGender) && (
                                <Button type="button" variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Case Studies Table */}
            <Card className="shadow-lg border-gray-200">
                <CardContent className="p-0">
                    {caseStudies.length === 0 ? (
                        <div className="text-center py-12">
                            <Stethoscope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No case studies found</h3>
                            <p className="text-gray-500 mb-4">Get started by creating your first case study.</p>
                            <Button onClick={() => router.push('/dashboard/case-studies/create')}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Case Study
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Patient
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Case Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Treatment
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Images
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {caseStudies.map((caseStudy: CaseStudy) => (
                                        <tr key={caseStudy.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {caseStudy.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Age: {caseStudy.age} • {getGenderBadge(caseStudy.gender)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs">
                                                    <div className="line-clamp-2 font-medium">{caseStudy.case}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    <div className="mb-1">
                                                        <span className="font-medium">Upper:</span> {caseStudy.upper}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Lower:</span> {caseStudy.lower}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <div className="text-xs text-center">
                                                        <img
                                                            src={caseStudy.imageBefore}
                                                            alt="Before"
                                                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                                        />
                                                        <div className="text-gray-500 mt-1">Before</div>
                                                    </div>
                                                    <div className="text-xs text-center">
                                                        <img
                                                            src={caseStudy.imageAfter}
                                                            alt="After"
                                                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                                        />
                                                        <div className="text-gray-500 mt-1">After</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(caseStudy.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleViewCaseStudy(caseStudy)}
                                                        title="View Details"
                                                        className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEditCaseStudy(caseStudy)}
                                                        title="Edit Case Study"
                                                        className="hover:bg-green-50 hover:text-green-600 transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteCaseStudy(caseStudy.id)}
                                                        disabled={deleteMutation.isPending}
                                                        title="Delete Case Study"
                                                        className="hover:bg-red-50 hover:text-red-600 transition-colors"
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
                        <div className="flex justify-center items-center mt-6 space-x-2 px-6 pb-6">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this case study? This action cannot be undone.
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
                                onClick={confirmDelete}
                                disabled={deleteMutation.isPending}
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

export default AdminCaseStudiesPage;
