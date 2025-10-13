'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Save,
    Upload,
    FileText,
    Tag,
    DollarSign,
    BookOpen,
    Eye,
    EyeOff,
    Settings,
    X,
    Plus,
    ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { AdminEbookService, CreateEbookData, Ebook } from '@/services/ebook.service';

const EditEbookPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const ebookId = params.id as string;

    // Fetch existing ebook data
    const { data: ebookData, isLoading, error } = useQuery({
        queryKey: ['ebook', ebookId],
        queryFn: () => AdminEbookService.getEbookById(ebookId),
        enabled: !!ebookId,
    });

    const ebook: Ebook | undefined = ebookData?.data;

    const [formData, setFormData] = useState<CreateEbookData>({
        title: '',
        description: '',
        shortDescription: '',
        price: 0,
        tags: [],
        isFreeEbook: false,
        thumbnailImage: '',
        video: ""
    });

    const [tagInput, setTagInput] = useState('');
    const [files, setFiles] = useState<{
        thumbnailImage?: File;
        pdf?: File;
    }>({});
    const [imagePreviews, setImagePreviews] = useState<{
        thumbnailImage?: string;
    }>({});

    // Update form data when ebook data is loaded
    useEffect(() => {
        if (ebook) {
            setFormData({
                title: ebook.title || '',
                description: ebook.description || '',
                shortDescription: ebook.shortDescription || '',
                price: ebook.price || 0,
                tags: ebook.tags || [],
                isFreeEbook: ebook.isFreeEbook || false,
                thumbnailImage: ebook.thumbnailImage || '',
                video: ebook.video || ''
            });

            // Set existing image preview
            if (ebook.thumbnailImage) {
                setImagePreviews({ thumbnailImage: ebook.thumbnailImage });
            }
        }
    }, [ebook]);

    const updateEbookMutation = useMutation({
        mutationFn: ({ data, files }: { data: CreateEbookData, files: { thumbnailImage?: File; pdf?: File; } }) =>
            AdminEbookService.updateEbook(ebookId, data, files),
        onSuccess: () => {
            toast.success('Ebook updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['ebooks'] });
            queryClient.invalidateQueries({ queryKey: ['ebook', ebookId] });
            queryClient.invalidateQueries({ queryKey: ['ebook-statistics'] });
            router.push('/dashboard/ebooks');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update ebook');
            setIsSubmitting(false);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        const ebookData = {
            ...formData
        };

        updateEbookMutation.mutate({ data: ebookData, files });
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'file') {
            const fileInput = e.target as HTMLInputElement;
            const file = fileInput.files?.[0];
            if (file) {
                setFiles(prev => ({ ...prev, [name]: file }));

                // Create preview for thumbnail image
                if (name === 'thumbnailImage') {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setImagePreviews(prev => ({
                            ...prev,
                            thumbnailImage: e.target?.result as string
                        }));
                    };
                    reader.readAsDataURL(file);
                }
            }
        } else if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'price') {
            setFormData(prev => ({ ...prev, [name]: Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
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
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    const togglePreview = () => {
        setShowPreview(!showPreview);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (error || !ebook) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Ebook Not Found</h2>
                    <p className="text-gray-600 mb-6">The ebook you're looking for doesn't exist.</p>
                    <Link href="/dashboard/ebooks" className="text-purple-600 hover:text-purple-700">
                        Back to Ebooks
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/dashboard/ebooks"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Ebooks
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Ebook</h1>
                            <p className="text-gray-600">Update your ebook information</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={togglePreview}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                                Ebook Information
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center border-b pb-2">
                                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
                                    Basic Information
                                </h3>

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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Enter ebook title"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                                        Short Description
                                    </label>
                                    <input
                                        type="text"
                                        id="shortDescription"
                                        name="shortDescription"
                                        value={formData.shortDescription}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Brief description for ebook cards"
                                        maxLength={200}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Brief description for ebook cards (max 200 characters)
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Detailed description of your ebook"
                                    />
                                </div>

                               
                            </div>

                            {/* Media Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center border-b pb-2">
                                    <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
                                    Media Files
                                </h3>

                                <div>
                                    <label htmlFor="thumbnailImage" className="block text-sm font-medium text-gray-700 mb-2">
                                        Thumbnail Image
                                    </label>
                                    <div className="space-y-4">
                                        {imagePreviews.thumbnailImage && (
                                            <div className="relative inline-block">
                                                <img
                                                    src={imagePreviews.thumbnailImage}
                                                    alt="Thumbnail preview"
                                                    className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImagePreviews(prev => ({ ...prev, thumbnailImage: undefined }));
                                                        setFiles(prev => ({ ...prev, thumbnailImage: undefined }));
                                                        setFormData(prev => ({ ...prev, thumbnailImage: '' }));
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            id="thumbnailImage"
                                            name="thumbnailImage"
                                            onChange={handleInputChange}
                                            accept="image/*"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        <p className="text-sm text-gray-500">
                                            Upload a thumbnail image for your ebook (recommended: 400x300px)
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="pdf" className="block text-sm font-medium text-gray-700 mb-2">
                                        PDF File
                                    </label>
                                    <input
                                        type="file"
                                        id="pdf"
                                        name="pdf"
                                        onChange={handleInputChange}
                                        accept=".pdf"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Upload the PDF file for your ebook (max 50MB)
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-2">
                                        Video URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        id="video"
                                        name="video"
                                        value={formData.video}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center border-b pb-2">
                                    <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                                    Pricing
                                </h3>

                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isFreeEbook"
                                            checked={formData.isFreeEbook}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">This is a free ebook</span>
                                    </label>
                                </div>

                                {!formData.isFreeEbook && (
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                            Price (USD) *
                                        </label>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="0.00"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Tags Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center border-b pb-2">
                                    <Tag className="w-5 h-5 mr-2 text-purple-600" />
                                    Tags
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tags
                                    </label>
                                    <div className="flex space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={handleTagInputKeyPress}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Enter a tag"
                                        />
                                        <button
                                            type="button"
                                            onClick={addTag}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="ml-2 text-purple-600 hover:text-purple-800"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Update Ebook
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Preview Section */}
                {showPreview && (
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow-lg rounded-lg overflow-hidden sticky top-6">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Eye className="w-5 h-5 mr-2 text-gray-600" />
                                    Preview
                                </h3>
                            </div>
                            <div className="p-6">
                                {imagePreviews.thumbnailImage && (
                                    <div className="mb-4">
                                        <img
                                            src={imagePreviews.thumbnailImage}
                                            alt="Ebook thumbnail"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                                <h4 className="text-xl font-bold text-gray-900 mb-2">
                                    {formData.title || 'Ebook Title'}
                                </h4>
                                {formData.shortDescription && (
                                    <p className="text-sm text-gray-600 mb-3">{formData.shortDescription}</p>
                                )}
                         
                                <p className="text-gray-700 mb-4 text-sm">
                                    {formData.description || 'Ebook description will appear here...'}
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-purple-600">
                                        {formData.isFreeEbook ? 'Free' : `$${formData.price}`}
                                    </span>
                                </div>
                                {formData.tags.length > 0 && (
                                    <div className="mt-4">
                                        <div className="flex flex-wrap gap-1">
                                            {formData.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditEbookPage;
