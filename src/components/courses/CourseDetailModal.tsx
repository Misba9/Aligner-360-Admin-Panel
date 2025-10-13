import React from 'react';
import { Course } from '@/services/course.service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Calendar,
    Clock,
    DollarSign,
    Eye,
    Users,
    Star,
    BookOpen,
    Tag,
    User,
    Edit,
    Trash2,
    EyeOff
} from 'lucide-react';

interface CourseDetailModalProps {
    course: Course;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (course: Course) => void;
    onDelete: (courseId: string) => void;
    onToggleVisibility: (courseId: string, action: 'publish' | 'unpublish') => void;
}

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
    course,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    onToggleVisibility
}) => {
    if (!isOpen) return null;

    const getStatusColor = (status: string) => {
        const statusStyles = {
            DRAFT: 'bg-yellow-100 text-yellow-800',
            PUBLISHED: 'bg-green-100 text-green-800',
            ARCHIVED: 'bg-gray-100 text-gray-800',
            UNDER_REVIEW: 'bg-blue-100 text-blue-800',
        };
        return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800';
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'BEGINNER': return 'bg-green-100 text-green-800';
            case 'INTERMEDIATE': return 'bg-blue-100 text-blue-800';
            case 'ADVANCED': return 'bg-orange-100 text-orange-800';
            case 'EXPERT': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
                            <div className="flex items-center space-x-3">
                                <Badge className={getStatusColor(course.status)}>
                                    {course.status}
                                </Badge>

                                {course.isFreeCourse && (
                                    <Badge className="bg-blue-100 text-blue-800">FREE</Badge>
                                )}
                            </div>
                        </div>
                        <Button variant="outline" onClick={onClose}>
                            ×
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 mb-6">
                        <Button onClick={() => onEdit(course)} className="flex items-center">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Course
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onToggleVisibility(
                                course.id,
                                course.status === 'PUBLISHED' ? 'unpublish' : 'publish'
                            )}
                            className="flex items-center"
                        >
                            {course.status === 'PUBLISHED' ? (
                                <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Unpublish
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Publish
                                </>
                            )}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => onDelete(course.id)}
                            className="flex items-center"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>

                    {/* Course Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Course Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Duration
                                    </span>
                                    <span className="font-medium">{course.duration} hours</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 flex items-center">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Price
                                    </span>
                                    <span className="font-medium">
                                        {course.isFreeCourse ? 'Free' : `${course.currency} ${course.price}`}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        Created By
                                    </span>
                                    <span className="font-medium">
                                        {course.createdBy.firstName} {course.createdBy.lastName}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 flex items-center">
                                        <Users className="w-4 h-4 mr-2" />
                                        Enrollments
                                    </span>
                                    <span className="font-medium">{course.enrollmentCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 flex items-center">
                                        <Eye className="w-4 h-4 mr-2" />
                                        Views
                                    </span>
                                    <span className="font-medium">{course.viewCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 flex items-center">
                                        <Star className="w-4 h-4 mr-2" />
                                        Rating
                                    </span>
                                    <span className="font-medium">
                                        {course.rating ? `${course.rating}/5 (${course.reviewCount} reviews)` : 'No ratings yet'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Created
                                    </span>
                                    <span className="font-medium">
                                        {new Date(course.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Description */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 leading-relaxed">
                                {course.description}
                            </p>
                            {course.shortDescription && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Short Description</h4>
                                    <p className="text-gray-600">{course.shortDescription}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <Tag className="w-5 h-5 mr-2" />
                                    Tags
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {course.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Course Content Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Course Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="prose max-w-none text-gray-600"
                                dangerouslySetInnerHTML={{
                                    __html: course.content.substring(0, 500) + '...'
                                }}
                            />
                            <Button variant="link" className="p-0 mt-2">
                                View Full Content
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailModal;
