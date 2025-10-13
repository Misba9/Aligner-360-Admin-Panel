'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminCourseService, Course, CourseQuery } from '@/services/course.service';
import CourseDetailModal from '@/components/courses/CourseDetailModal';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

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
    Clock,
    DollarSign,
    TrendingUp,
    Calendar,
    MoreVertical
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const AdminCoursesPage: React.FC = () => {
    const router = useRouter();
    const queryClient = useQueryClient(); const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<string>('');

    // Fetch courses
    const { data: coursesData, isLoading } = useQuery({
        queryKey: ['admin-courses', {
            page: currentPage,
            search: searchQuery,
            status: selectedStatus,
            limit: 10
        }],
        queryFn: () => AdminCourseService.getAllCourses({
            page: currentPage,
            limit: 10,
            search: searchQuery || undefined,
            status: selectedStatus || undefined,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        }),
    });

    // Fetch course statistics
    const { data: statsData } = useQuery({
        queryKey: ['course-statistics'],
        queryFn: AdminCourseService.getCourseStatistics,
    });

    // Fetch categories
    const { data: categoriesData } = useQuery({
        queryKey: ['courseCategories'],
        queryFn: AdminCourseService.getCourseCategories,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => AdminCourseService.deleteCourse(id),
        onSuccess: () => {
            toast.success('Course deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            queryClient.invalidateQueries({ queryKey: ['course-statistics'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete course');
        },
    });

    // Publish/Unpublish mutation
    const publishMutation = useMutation({
        mutationFn: ({ id, action }: { id: string; action: 'publish' | 'unpublish' }) => {
            return action === 'publish'
                ? AdminCourseService.publishCourse(id)
                : AdminCourseService.unpublishCourse(id);
        },
        onSuccess: (_, variables) => {
            toast.success(`Course ${variables.action}ed successfully`);
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            queryClient.invalidateQueries({ queryKey: ['course-statistics'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update course');
        },
    });

    const courses = coursesData?.data || [];
    const pagination = coursesData?.pagination;
    const stats = statsData?.data;

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
        setCurrentPage(1);
    };

    const handleViewCourse = (course: Course) => {
        setSelectedCourse(course);
        setShowDetailModal(true);
    };

    const handleEditCourse = (course: Course) => {
        router.push(`/dashboard/courses/${course.id}`);
    };

    const handleDeleteCourse = (courseId: string) => {
        setCourseToDelete(courseId);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (courseToDelete) {
            deleteMutation.mutate(courseToDelete);
            setShowDeleteDialog(false);
            setCourseToDelete('');
        }
    };

    const handleToggleVisibility = (courseId: string, action: 'publish' | 'unpublish') => {
        publishMutation.mutate({ id: courseId, action });
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

    return (
        <div className="space-y-6 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
                    <p className="text-gray-600">Manage your dental courses and track enrollments</p>
                </div>                <Button onClick={() => router.push('/dashboard/courses/create')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                </Button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCourses}</div>
                            <p className="text-xs text-muted-foreground">
                                +{stats.publishedCourses} published
                            </p>
                        </CardContent>
                    </Card>                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
                            <p className="text-xs text-muted-foreground">
                                Across all courses
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalViews}</div>
                            <p className="text-xs text-muted-foreground">
                                Course page views
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.publishedCourses}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.draftCourses} drafts pending
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}            {/* Search and Filters */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-lg border border-white/20">
                <CardContent className="p-6">
                    <form onSubmit={handleSearch} className="flex gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>                        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                            Search
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="border-blue-200 hover:bg-blue-50"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </form>
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
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
            </Card>            {/* Courses Table */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-lg border border-white/20">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardTitle>Courses</CardTitle>
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
                    ) : courses.length === 0 ? (
                        <div className="text-center py-8">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
                            <p className="text-gray-600 mb-4">Get started by creating your first course</p>
                            <Button onClick={() => router.push('/dashboard/courses/create')}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Course
                            </Button>
                        </div>
                    ) : (<div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-gray-50/50">
                                    <th className="text-left p-4 font-medium text-gray-700">Course</th>
                                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                                    <th className="text-left p-4 font-medium text-gray-700">Enrollments</th>
                                    <th className="text-left p-4 font-medium text-gray-700">Views</th>
                                    <th className="text-left p-4 font-medium text-gray-700">Created</th>
                                    <th className="text-left p-4 font-medium text-gray-700 w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course: Course) => (
                                    <tr
                                        key={course.id}
                                        className="border-b hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 group"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                                    {course.thumbnailImage ? (
                                                        <img
                                                            src={course.thumbnailImage}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <BookOpen className="w-6 h-6 text-white" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1 max-w-sm">
                                                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {course.shortDescription || course.description}
                                                    </p>
                                                    <div className="flex items-center mt-1 space-x-3">
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-500">{course.duration}h</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <DollarSign className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-500">
                                                                {course.isFreeCourse ? 'Free' : `$${course.price}`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge className={getStatusBadge(course.status)}>
                                                {course.status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="font-medium text-gray-700">{course.enrollmentCount}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <Eye className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="font-medium text-gray-700">{course.viewCount}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-600">
                                                {new Date(course.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4 relative">
                                            {/* Always visible quick action */}
                                            <div className="flex items-center justify-center">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="opacity-60 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Hover overlay with action buttons */}
                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out scale-95 group-hover:scale-100">
                                                <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleViewCourse(course)}
                                                        title="View Details"
                                                        className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                                                        title="Edit Course"
                                                        className="hover:bg-green-50 hover:text-green-600 transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleToggleVisibility(
                                                            course.id,
                                                            course.status === 'PUBLISHED' ? 'unpublish' : 'publish'
                                                        )}
                                                        disabled={publishMutation.isPending}
                                                        title={course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                                                        className={`transition-colors ${course.status === 'PUBLISHED'
                                                            ? 'hover:bg-orange-50 hover:text-orange-600'
                                                            : 'hover:bg-blue-50 hover:text-blue-600'
                                                            }`}
                                                    >
                                                        {course.status === 'PUBLISHED' ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setCourseToDelete(course.id);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                        disabled={deleteMutation.isPending}
                                                        title="Delete Course"
                                                        className="hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
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
            </Card>            {/* Course Detail Modal */}
            {selectedCourse && (
                <CourseDetailModal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    course={selectedCourse}
                    onEdit={handleEditCourse}
                    onDelete={handleDeleteCourse}
                    onToggleVisibility={handleToggleVisibility}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this course? This action cannot be undone."
                variant="danger"
                loading={deleteMutation.isPending}
            />
        </div>
    );
};

export default AdminCoursesPage;
