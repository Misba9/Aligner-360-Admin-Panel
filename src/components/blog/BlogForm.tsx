'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Save, Eye, X, Plus, Tag, Upload, Trash2 } from 'lucide-react';
import { BlogService } from '@/services/blog.service';
import { Blog, CreateBlogRequest, UpdateBlogRequest } from '@/types/blog';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { convertEditorJSToHTML, convertHTMLToEditorJS } from '@/utils/editorjs';
import type { EditorJSRef } from '@/components/editor/EditorJS';
import { FileUploadService } from '@/services/file-upload.service';

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

interface BlogFormProps {
    blog?: Blog;
    mode: 'create' | 'edit';
}

const BlogForm: React.FC<BlogFormProps> = ({ blog, mode }) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        title: blog?.title || '',
        content: blog?.content || '',
        excerpt: blog?.excerpt || '',
        category: blog?.category || '',
        featuredImage: blog?.featuredImage || '',
        status: blog?.status || 'DRAFT' as const,
        tags: blog?.tags || [],
        isForDentist: blog?.isForDentist || false,
    });
    const [editorData, setEditorData] = useState<OutputData>(() => {
        if (blog?.content) {
            return convertHTMLToEditorJS(blog.content);
        }
        return {
            time: Date.now(),
            blocks: [],
            version: '2.28.2',
        };
    });
    const editorRef = useRef<EditorJSRef>(null);
    const [newTag, setNewTag] = useState('');
    const [preview, setPreview] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
    const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // Fetch available categories
    const { data: categoriesData } = useQuery({
        queryKey: ['blog-categories'],
        queryFn: () => BlogService.getBlogCategories(),
    });

    const categories = categoriesData?.data || [];

    // Initialize featured image preview for edit mode
    useEffect(() => {
        if (blog?.featuredImage && formData.featuredImage) {
            setFeaturedImagePreview(null); // Use the actual URL, not a preview
        }
    }, [blog?.featuredImage, formData.featuredImage]);

    const createMutation = useMutation({
        mutationFn: async (data: CreateBlogRequest) => await BlogService.createBlog(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            router.push('/dashboard/blogs');
        },
        onError: (error: any) => {
            console.log(error);
            setError(error.response?.data?.message || 'Failed to create blog');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: UpdateBlogRequest) => BlogService.updateBlog(blog!.id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['blogs'] });
            await queryClient.invalidateQueries({ queryKey: ['blog', blog!.id] });
            router.push('/dashboard/blogs');
        },
        onError: (error: any) => {
            setError(error.response?.data?.message || 'Failed to update blog');
        },
    });
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }

        // Get content from Editor.js
        let contentHtml = '';
        if (editorRef.current) {
            try {
                const outputData = await editorRef.current.save();
                contentHtml = convertEditorJSToHTML(outputData);
            } catch (error) {
                setError('Failed to save editor content');
                return;
            }
        }

        if (!contentHtml.trim()) {
            setError('Content is required');
            return;
        }        // If there's a pending image file, upload it first
        let featuredImageUrl = formData.featuredImage;
        if (featuredImageFile) {
            try {
                const uploadedUrl = await uploadFeaturedImage();
                featuredImageUrl = uploadedUrl || '';
            } catch (error) {
                setError('Failed to upload featured image. Please try again.');
                return;
            }
        }

        const blogData = {
            title: formData.title.trim(),
            content: contentHtml,
            excerpt: formData.excerpt.trim() || undefined,
            category: formData.category.trim() || undefined,
            featuredImage: featuredImageUrl.trim() || undefined,
            status: formData.status === 'ARCHIVED' ? 'DRAFT' as const : formData.status,
            tags: formData.tags.length > 0 ? formData.tags : undefined,
            isForDentist: formData.isForDentist || false,
        };

        if (mode === 'create') {
            createMutation.mutate(blogData);
        } else {
            updateMutation.mutate(blogData);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'isForDentist') {
            const isChecked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, isForDentist: isChecked }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()],
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove),
        }));
    };
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
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

    const handleClosePreview = () => {
        setPreview(false);
    };

    const handleShowPreview = () => {
        setPreview(true);
    };

    const handleCancel = () => {
        router.push('/dashboard/blogs');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        removeTag(tagToRemove);
    };

    const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImageFile(file);
        }
    };

    const processImageFile = (file: File) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image file size must be less than 5MB');
            return;
        }

        setFeaturedImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setFeaturedImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Clear any existing URL
        setFormData(prev => ({
            ...prev,
            featuredImage: ''
        }));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processImageFile(files[0]);
        }
    };
    const uploadFeaturedImage = async () => {
        if (!featuredImageFile) return null;

        setIsUploadingImage(true);
        setError(null);

        try {
            const response = await FileUploadService.uploadFile({
                file: featuredImageFile,
                folder: "blog-featured-images",
                tags: ["blog", "featured"]
            });

            // Update form data with the uploaded image URL
            setFormData(prev => ({
                ...prev,
                featuredImage: response.url
            }));

            // Clear the file and preview since it's now uploaded
            setFeaturedImageFile(null);
            setFeaturedImagePreview(null);

            return response.url;

        } catch (error: any) {
            console.error('Upload error:', error);

            // Provide more specific error messages
            let errorMessage = 'Failed to upload image. Please try again.';

            if (error.response?.status === 400) {
                errorMessage = error.response?.data?.message || 'Invalid file or missing required fields.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Please log in to upload images.';
            } else if (error.response?.status === 403) {
                errorMessage = 'You do not have permission to upload images.';
            } else if (error.response?.status === 413) {
                errorMessage = 'File is too large. Please select a smaller image.';
            } else if (error.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error. Please check your connection and try again.';
            }

            setError(errorMessage);
            throw error; // Re-throw to handle in calling function
        } finally {
            setIsUploadingImage(false);
        }
    }; const removeFeaturedImage = () => {
        setFeaturedImageFile(null);
        setFeaturedImagePreview(null);
        setFormData(prev => ({
            ...prev,
            featuredImage: ''
        }));
    };

    const handleUploadClick = async () => {
        if (!featuredImageFile) return;

        try {
            await uploadFeaturedImage();
        } catch (error) {
            // Error is already handled in uploadFeaturedImage
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    if (preview) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900">Preview</h2>                        <button
                            onClick={handleClosePreview}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6">
                        {formData.featuredImage && (
                            <img
                                src={formData.featuredImage}
                                alt={formData.title}
                                className="w-full h-64 object-cover rounded-lg mb-6"
                            />
                        )}                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title}</h1>
                        {formData.category && (
                            <div className="mb-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {formData.category}
                                </span>
                            </div>
                        )}
                        {formData.excerpt && (
                            <p className="text-xl text-gray-600 mb-6">{formData.excerpt}</p>
                        )}
                        <div className="prose max-w-none">
                            <div
                                dangerouslySetInnerHTML={{ __html: formData.content }}
                                className="editor-content"
                            />
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                        >
                                            <Tag className="w-3 h-3 mr-1" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {mode === 'create' ? 'Create New Blog' : 'Edit Blog'}
                    </h2>
                </div>

                {error && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter blog title"
                        />
                    </div>                    <div>
                        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                            Excerpt
                        </label>
                        <textarea
                            id="excerpt"
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Brief description of the blog (optional)"
                        />
                    </div>                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            list="category-suggestions"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter or select a category (optional)"
                        />
                        <datalist id="category-suggestions">
                            {categories.map((category) => (
                                <option key={category} value={category} />
                            ))}
                        </datalist>
                        <p className="mt-1 text-sm text-gray-500">
                            Choose from existing categories or enter a new one.
                        </p>
                    </div><div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Featured Image
                        </label>                        {/* Current featured image or preview */}
                        {(formData.featuredImage || featuredImagePreview) && (
                            <div className="mb-4">
                                <div className="relative inline-block">
                                    <img
                                        src={featuredImagePreview || formData.featuredImage}
                                        alt="Featured image preview"
                                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                                    />
                                    {/* Status indicator */}
                                    {formData.featuredImage && !featuredImageFile && (
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-md">
                                            Uploaded
                                        </div>
                                    )}
                                    {featuredImageFile && (
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-md">
                                            Pending Upload
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={removeFeaturedImage}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>                                {featuredImageFile && (
                                    <div className="mt-2">
                                        <div className="flex gap-2 mb-2">
                                            <button
                                                type="button"
                                                onClick={handleUploadClick}
                                                disabled={isUploadingImage}
                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                            >
                                                <Upload className="w-3 h-3" />
                                                {isUploadingImage ? 'Uploading...' : 'Upload Now'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={removeFeaturedImage}
                                                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Remove
                                            </button>
                                        </div>
                                        <p className="text-xs text-amber-600">
                                            Image selected but not uploaded yet. Click "Upload Now" or it will be uploaded automatically when saving the blog.
                                        </p>
                                    </div>
                                )}
                                {formData.featuredImage && !featuredImageFile && (
                                    <div className="mt-2">
                                        <p className="text-xs text-green-600">
                                            ✓ Image uploaded successfully
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}                        {/* Upload options */}
                        <div className="space-y-4">
                            {/* Drag and drop area */}
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Upload Image</label>
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={cn(
                                        "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                                        isDragOver
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-300 hover:border-gray-400"
                                    )}
                                >
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-4">
                                        <label htmlFor="featured-image-upload" className="cursor-pointer">
                                            <span className="mt-2 block text-sm font-medium text-gray-900">
                                                Drop an image here, or{' '}
                                                <span className="text-blue-600 hover:text-blue-500">browse</span>
                                            </span>
                                        </label>
                                        <input
                                            id="featured-image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFeaturedImageChange}
                                            className="hidden"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        PNG, JPG, GIF, WebP up to 5MB
                                    </p>
                                </div>
                            </div>

                            {/* URL input as alternative */}
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Or use image URL</label>
                                <input
                                    type="url"
                                    name="featuredImage"
                                    value={formData.featuredImage}
                                    onChange={handleInputChange}
                                    disabled={!!featuredImageFile}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                            Content *
                        </label>
                        <EditorJSComponent
                            ref={editorRef}
                            data={editorData}
                            onChange={handleEditorChange}
                            placeholder="Write your blog content here..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {formData.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Add a tag"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                            {mode === 'edit' && <option value="ARCHIVED">Archived</option>}
                        </select>
                    </div>
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            name="isForDentist"
                            checked={formData.isForDentist}
                            onChange={handleInputChange}
                            className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded-md"
                        />
                        <div>
                            <p className="text-sm !font-medium text-gray-600">Only For Dentist?</p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                                isLoading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <Save className="w-4 h-4" />
                            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Blog' : 'Update Blog'}
                        </button>
                        <button
                            type="button"
                            onClick={handleShowPreview}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            Preview
                        </button>                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogForm;
