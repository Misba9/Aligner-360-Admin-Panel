'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AdminCourseService, CreateCourseData } from '@/services/course.service';

import {
    ArrowLeft,
    Save,
    Eye,
    Upload,
    X,
    Plus,
    BookOpen,
    FileText,
    DollarSign,
    Tag,
    Settings,
    Clock,
    Users,
    Play,
    Image as ImageIcon,
    Globe,
    EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { convertEditorJSToHTML, convertHTMLToEditorJS } from '@/utils/editorjs';
import type { EditorJSRef } from '@/components/editor/EditorJS';

interface OutputData {
    time: number;
    blocks: any[];
    version: string;
}

// Dynamically import Editor.js to avoid SSR issues
const EditorJSComponent = dynamic(() => import('@/components/editor/EditorJS'), {
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-md"></div>
});

const CreateCoursePage: React.FC = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const editorRef = useRef<EditorJSRef>(null); 
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

    const [editorData, setEditorData] = useState<OutputData>({
        time: Date.now(),
        blocks: [],
        version: '2.28.2',
    });

    const [tagInput, setTagInput] = useState('');
    const [videoUploadType, setVideoUploadType] = useState<'url' | 'file'>('url');
    const [files, setFiles] = useState<{
        thumbnailImage?: File;
        videoFile?: File;
    }>({});    // Create course mutation
    const createMutation = useMutation({
        mutationFn: (data: { courseData: CreateCourseData; files?: { thumbnailImage?: File; videoFile?: File } }) =>
            AdminCourseService.createCourse(data.courseData, data.files),
        onSuccess: () => {
            toast.success('Course created successfully! Files are being processed in the background.');
            router.push('/dashboard/courses');
            setIsSubmitting(false);
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to create course';
            if (message.includes('timeout')) {
                toast.error('Course creation is taking longer than expected. Please check your internet connection and try with smaller files.');
            } else {
                toast.error(message);
            }
            setIsSubmitting(false);
        },
    });

    const handleInputChange = (field: keyof CreateCourseData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files: inputFiles } = e.target;
        if (inputFiles && inputFiles[0]) {
            setFiles(prev => ({
                ...prev,
                [name]: inputFiles[0]
            }));
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    }; const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleEditorChange = (data: OutputData) => {
        setEditorData(data);
        // Update formData.content for preview
        const htmlContent = convertEditorJSToHTML(data);
        setFormData(prev => ({
            ...prev,
            content: htmlContent
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Get content from Editor.js
        let contentHtml = '';
        if (editorRef.current) {
            try {
                const outputData = await editorRef.current.save();
                contentHtml = convertEditorJSToHTML(outputData);
            } catch (error) {
                toast.error('Failed to save editor content');
                return;
            }
        }

        // Validation
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('Description is required');
            return;
        } if (!contentHtml.trim()) {
            toast.error('Course content is required');
            return;
        }

        if (!formData.isFreeCourse && formData.price <= 0) {
            toast.error('Price must be greater than 0 for paid courses');
            return;
        } setIsSubmitting(true);

        // Show specific message if files are being uploaded
        if (files.thumbnailImage || files.videoFile) {
            toast.info('Uploading files and creating course... This may take a few minutes.');
        } else {
            toast.info('Creating course...');
        }

        const courseData = {
            ...formData,
            content: contentHtml
        };

        createMutation.mutate({ courseData, files });
    }; return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header Section */}
                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl mb-8 p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                            <button
                                onClick={() => router.back()}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 group"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                                Back to Courses
                            </button>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="hidden sm:block w-2 h-2 bg-gray-300 rounded-full"></div>
                            <span className="text-sm text-gray-500 font-medium">Create New Course</span>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Create New Course
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">Design and publish your dental course for professionals</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section - Takes 2/3 width on large screens */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information Card */}
                            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <FileText className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                                    </div>
                                    <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Course Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400"
                                            required
                                            placeholder="Enter a compelling course title..."
                                            maxLength={100}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-500">This will be the main title displayed to students</p>
                                            <span className={`text-xs ${formData.title.length > 80 ? 'text-orange-500' : formData.title.length > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                                                {formData.title.length}/100
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Short Description
                                        </label>
                                        <textarea
                                            value={formData.shortDescription}
                                            onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 resize-none"
                                            placeholder="Brief overview for course cards and previews..."
                                            maxLength={200}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-500">This will appear on course cards and search results</p>
                                            <span className={`text-xs ${(formData.shortDescription?.length || 0) > 150 ? 'text-orange-500' : (formData.shortDescription?.length || 0) > 100 ? 'text-yellow-500' : 'text-green-500'}`}>
                                                {formData.shortDescription?.length || 0}/200
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Description *
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            rows={5}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 resize-none"
                                            required
                                            placeholder="Detailed course description. What will students learn? What are the benefits?"
                                            maxLength={1000}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-500">Detailed description of your course content and learning outcomes</p>
                                            <span className={`text-xs ${formData.description.length > 800 ? 'text-orange-500' : formData.description.length > 500 ? 'text-yellow-500' : 'text-green-500'}`}>
                                                {formData.description.length}/1000
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Course Content Card */}
                            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <BookOpen className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Course Content</h2>
                                    </div>
                                    <div className="w-8 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
                                </div>

                                <div className="space-y-6">                                    <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Course Content *
                                    </label>
                                    <EditorJSComponent
                                        ref={editorRef}
                                        data={editorData}
                                        onChange={handleEditorChange}
                                        placeholder="Write your course content here..."
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Rich text editor with support for headers, lists, images, and more</p>
                                </div>                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Course Video
                                        </label>

                                        {/* Video Upload Type Toggle */}
                                        <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                                            <button
                                                type="button"
                                                onClick={() => setVideoUploadType('url')}
                                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${videoUploadType === 'url'
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                <Globe className="w-4 h-4 mr-2 inline" />
                                                Video URL
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setVideoUploadType('file')}
                                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${videoUploadType === 'file'
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                <Upload className="w-4 h-4 mr-2 inline" />
                                                Upload File
                                            </button>
                                        </div>

                                        {/* Video URL Input */}
                                        {videoUploadType === 'url' && (
                                            <div className="relative">
                                                <Play className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="url"
                                                    value={formData.videoUrl}
                                                    onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400"
                                                    placeholder="https://example.com/video.mp4"
                                                />
                                            </div>
                                        )}

                                        {/* Video File Upload */}
                                        {videoUploadType === 'file' && (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    name="videoFile"
                                                    accept="video/*"
                                                    onChange={handleFileChange}
                                                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                                />
                                                <p className="text-xs text-gray-500 mt-2">Max: 100MB. Supported formats: MP4, AVI, MOV, WebM</p>
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-500 mt-2">Optional: Add a video introduction or main course video</p>
                                    </div>
                                </div>
                            </div>


                        </form>
                    </div>

                    {/* Sidebar - Takes 1/3 width on large screens */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Course Settings Card */}
                        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 ">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Settings className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Course Settings</h2>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Max Enrollments
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.maxEnrollments || ''}
                                            onChange={(e) => handleInputChange('maxEnrollments', e.target.value ? parseInt(e.target.value) : undefined)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400"
                                            placeholder="Leave empty for unlimited"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing Card */}
                        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <DollarSign className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Pricing</h2>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.isFreeCourse}
                                            onChange={(e) => handleInputChange('isFreeCourse', e.target.checked)}
                                            className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded-md"
                                        />
                                        <div>
                                            <label className="text-sm font-semibold text-gray-900">
                                                Free Course
                                            </label>
                                            <p className="text-xs text-gray-600">Make this course free for all students</p>
                                        </div>
                                    </div>
                                </div>

                                {!formData.isFreeCourse && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Price *
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.price}
                                                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400"
                                                    required={!formData.isFreeCourse}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Currency
                                            </label>
                                            <select
                                                value={formData.currency}
                                                onChange={(e) => handleInputChange('currency', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400"
                                            >
                                                <option value="INR">INR (₹)</option>
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                                <option value="GBP">GBP (£)</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Media & Tags Card */}
                        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Tag className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Media & Tags</h2>
                                </div>
                            </div>

                            <div className="space-y-6">                                <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Thumbnail Image
                                </label>
                                <input
                                    type="file"
                                    name="thumbnailImage"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                />
                                <p className="text-xs text-gray-500 mt-2">Recommended: 1280x720px, JPG/PNG/WebP (Max: 5MB)</p>
                            </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Tags
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            className="flex-1 px-4 w-full py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400"
                                            placeholder="Add relevant tags..."
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        />
                                        <button
                                            type="button"
                                            onClick={addTag}
                                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Add</span>
                                        </button>
                                    </div>
                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-3 mt-4">
                                            {formData.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200 group"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="ml-2 text-orange-600 hover:text-orange-800 transition-colors duration-200"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons Card */}
                        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    {showPreview ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
                                    {showPreview ? 'Hide Preview' : 'Preview Course'}
                                </button>

                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                    <Save className="w-5 h-5 mr-2" />
                                    {isSubmitting ? 'Creating...' : 'Create Course'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => router.push('/dashboard/courses')}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats Card */}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCoursePage;
