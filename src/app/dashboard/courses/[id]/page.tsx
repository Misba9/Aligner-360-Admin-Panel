'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { AdminCourseService, CreateCourseData } from '@/services/course.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Upload,
  X,
  Plus,
  Trash2,
  Users
} from 'lucide-react';
import { toast } from 'sonner'

const EditCoursePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = params.id as string;
  const [formData, setFormData] = useState<CreateCourseData>({
    title: '',
    description: '',
    shortDescription: '',
    content: '',
    tags: [],
    thumbnailImage: '',
    videoUrl: '',
    videoFile: '',
    price: 0,
    currency: 'INR',
    isFreeCourse: true,
    maxEnrollments: undefined,
    metaTitle: '',
    metaDescription: '',
  }); 
  const [tagInput, setTagInput] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch course details
  const { data: courseData, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => AdminCourseService.getCourseById(courseId),
    enabled: !!courseId,
  });
  // Fetch course enrollments
  const { data: enrollmentsData } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: () => AdminCourseService.getCourseEnrollments(courseId, { limit: 5 }),
    enabled: !!courseId,
  });

  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateCourseData>) => AdminCourseService.updateCourse(courseId, data),
    onSuccess: () => {
      toast.success('Course updated successfully');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update course');
    },
  });

  // Publish/Unpublish mutation
  const publishMutation = useMutation({
    mutationFn: (action: 'publish' | 'unpublish') => {
      return action === 'publish'
        ? AdminCourseService.publishCourse(courseId)
        : AdminCourseService.unpublishCourse(courseId);
    },
    onSuccess: (_, action) => {
      toast.success(`Course ${action}ed successfully`);
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update course');
    },
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: () => AdminCourseService.deleteCourse(courseId),
    onSuccess: () => {
      toast.success('Course deleted successfully');
      router.push('/dashboard/courses');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    },
  });

  // Load course data into form
  useEffect(() => {
    if (courseData?.data && !isLoaded) {
      const course = courseData.data; setFormData({
        title: course.title || '',
        description: course.description || '',
        shortDescription: course.shortDescription || '',
        content: course.content || '',
        tags: course.tags || [],
        thumbnailImage: course.thumbnailImage || '',
        videoUrl: course.videoUrl || '',
        videoFile: course.videoFile || '',
        price: course.price || 0,
        currency: course.currency || 'INR',
        isFreeCourse: course.isFreeCourse ?? true,
        maxEnrollments: course.maxEnrollments,
        metaTitle: course.metaTitle || '',
        metaDescription: course.metaDescription || '',
      });
      setIsLoaded(true);
    }
  }, [courseData, isLoaded]);

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

  if (!courseData?.data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Course not found</h2>
        <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/dashboard/courses')}>
          Back to Courses
        </Button>
      </div>
    );
  }
  const course = courseData.data;
  const enrollments = enrollmentsData?.data || [];

  const handleInputChange = (field: keyof CreateCourseData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    } if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }
    if (!formData.isFreeCourse && formData.price <= 0) {
      toast.error('Price must be greater than 0 for paid courses');
      return;
    }

    updateMutation.mutate(formData);
  };

  const handlePublishToggle = () => {
    const action = course.status === 'PUBLISHED' ? 'unpublish' : 'publish';
    publishMutation.mutate(action);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
              <div className={getStatusBadge(course.status)}>
                {course.status}
              </div>
            </div>
            <p className="text-gray-600">{course.title}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handlePublishToggle}
            disabled={publishMutation.isPending}
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
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter course title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    placeholder="Brief overview for course cards (optional)"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detailed course description"
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content">Course Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Detailed course curriculum and content"
                    rows={8}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    You can use HTML formatting here
                  </p>
                </div>                <div>
                  <Label htmlFor="videoUrl">Course Video URL</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Course Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Course Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{course.enrollmentCount}</div>
                    <div className="text-sm text-gray-600">Enrollments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{course.viewCount}</div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{course.rating?.toFixed(1) || 'N/A'}</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{course.reviewCount}</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Enrollments */}
            {enrollments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Recent Enrollments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {enrollments.slice(0, 5).map((enrollment: any) => (
                      <div key={enrollment.id} className="flex items-center justify-between py-2 border-b">
                        <div>
                          <div className="font-medium">
                            {enrollment.user.firstName} {enrollment.user.lastName}
                          </div>
                          <div className="text-sm text-gray-600">{enrollment.user.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{enrollment.progress}% complete</div>
                          <div className="text-sm text-gray-600">
                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maxEnrollments">Max Enrollments</Label>
                  <Input
                    id="maxEnrollments"
                    type="number"
                    min="1"
                    value={formData.maxEnrollments || ''}
                    onChange={(e) => handleInputChange('maxEnrollments', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFreeCourse"
                    checked={formData.isFreeCourse}
                    onChange={(e) => handleInputChange('isFreeCourse', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isFreeCourse">Free Course</Label>
                </div>

                {!formData.isFreeCourse && (
                  <>
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        required={!formData.isFreeCourse}
                      />
                    </div>

                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="thumbnailImage">Thumbnail Image URL</Label>
                  <Input
                    id="thumbnailImage"
                    type="url"
                    value={formData.thumbnailImage}
                    onChange={(e) => handleInputChange('thumbnailImage', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Enter a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <div key={tag} className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1">
                          <span className="text-sm">{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/dashboard/courses')}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCoursePage;
