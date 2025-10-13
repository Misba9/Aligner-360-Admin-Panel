'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { AdminEbookService, CreateEbookData } from '@/services/ebook.service';

const CreateEbookPage: React.FC = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false); const [formData, setFormData] = useState<CreateEbookData>({
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
    }>({}); const createEbookMutation = useMutation({
        mutationFn: ({ data, files }: { data: CreateEbookData, files: { thumbnailImage?: File; pdf?: File; } }) =>
            AdminEbookService.createEbook(data, files),
        onSuccess: () => {
            toast.success('Ebook created successfully!');
            queryClient.invalidateQueries({ queryKey: ['ebooks'] });
            queryClient.invalidateQueries({ queryKey: ['ebook-statistics'] });
            router.push('/dashboard/ebooks');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create ebook');
            setIsSubmitting(false);
        },
    }); const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        const ebookData = {
            ...formData
        };

        createEbookMutation.mutate({ data: ebookData, files });
    }; const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'file') {
            const fileInput = e.target as HTMLInputElement;
            const file = fileInput.files?.[0];
            if (file) {
                setFiles(prev => ({ ...prev, [name]: file }));
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
    }; const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header Section */}
                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl mb-8 p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                            <Link
                                href="/dashboard/ebooks"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 group"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                                Back to Ebooks
                            </Link>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="hidden sm:block w-2 h-2 bg-gray-300 rounded-full"></div>
                            <span className="text-sm text-gray-500 font-medium">Create New Ebook</span>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Create New Ebook
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">Build and publish your digital book with our intuitive editor</p>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Ebook Title *
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400"
                                                required
                                                placeholder="Enter a compelling ebook title..."
                                                maxLength={100}
                                            />
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-xs text-gray-500">This will be the main title displayed to users</p>
                                                <span className={`text-xs ${formData.title.length > 80 ? 'text-orange-500' : formData.title.length > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                                                    {formData.title.length}/100
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={5}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 resize-none"
                                            required
                                            placeholder="Describe your ebook in detail. What will readers learn? What makes it valuable?"
                                            maxLength={1000}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-500">Detailed description of your ebook content and benefits</p>
                                            <span className={`text-xs ${formData.description.length > 800 ? 'text-orange-500' : formData.description.length > 500 ? 'text-yellow-500' : 'text-green-500'}`}>
                                                {formData.description.length}/1000
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Short Description
                                        </label>
                                        <textarea
                                            name="shortDescription"
                                            value={formData.shortDescription}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 resize-none"
                                            placeholder="Brief summary for cards and previews (max 150 characters)"
                                            maxLength={200}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-500">This will appear on preview cards and search results</p>                                            <span className={`text-xs ${(formData.shortDescription?.length || 0) > 150 ? 'text-orange-500' : (formData.shortDescription?.length || 0) > 100 ? 'text-yellow-500' : 'text-green-500'}`}>
                                                {formData.shortDescription?.length || 0}/200
                                            </span>
                                        </div>                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Details Card */}
                            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <DollarSign className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Pricing & Details</h2>
                                    </div>
                                    <div className="w-8 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Price (INR)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400"
                                                placeholder="0.00"
                                            />
                                        </div>                                    </div>
                                </div>
                            </div>

                            {/* Files & Media Card */}
                            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <Upload className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Files & Media</h2>
                                    </div>
                                    <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                                    <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        PDF File *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            name="pdf"
                                            accept=".pdf"
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Upload your PDF file (Max: 50MB)</p>
                                </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Thumbnail Image *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                name="thumbnailImage"
                                                accept="image/*"
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Recommended: 400x600px, JPG/PNG (Max: 5MB)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tags Card */}
                            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <Tag className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Tags</h2>
                                    </div>
                                    <div className="w-8 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-gray-400"
                                            placeholder="Add relevant tags (e.g., health, dentistry, education)..."
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
                                        <div className="flex flex-wrap gap-3">
                                            {formData.tags.map((tag, index) => (
                                                <span
                                                    key={index}
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
                        </form>
                    </div>

                    {/* Sidebar - Takes 1/3 width on large screens */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Settings Card */}
                        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 sticky top-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Settings className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Settings</h2>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-200">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            name="isFreeEbook"
                                            checked={formData.isFreeEbook}
                                            onChange={handleInputChange}
                                            className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded-md"
                                        />
                                        <div>
                                            <label className="text-sm font-semibold text-gray-900">
                                                Free Ebook
                                            </label>
                                            <p className="text-xs text-gray-600">Make this ebook free for all users</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        {showPreview ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
                                        {showPreview ? 'Hide Preview' : 'Preview Ebook'}
                                    </button>

                                    <button
                                        type="submit"
                                        form="ebook-form"
                                        disabled={isSubmitting}
                                        onClick={handleSubmit}
                                        className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                    >
                                        <Save className="w-5 h-5 mr-2" />
                                        {isSubmitting ? 'Creating...' : 'Create Ebook'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Card */}
                        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Title Length:</span>
                                    <span className={`text-sm font-medium ${formData.title.length > 80 ? 'text-orange-600' : formData.title.length > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {formData.title.length}/100
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Description:</span>
                                    <span className={`text-sm font-medium ${formData.description.length > 800 ? 'text-orange-600' : formData.description.length > 500 ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {formData.description.length}/1000
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Tags:</span>
                                    <span className={`text-sm font-medium ${formData.tags.length > 8 ? 'text-orange-600' : formData.tags.length > 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {formData.tags.length}/10
                                    </span>
                                </div>                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Price:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formData.isFreeEbook ? 'Free' : `₹${formData.price}`}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-teal-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Completion:</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${Math.min(100, (
                                                            (formData.title ? 33 : 0) +
                                                            (formData.description ? 33 : 0) +
                                                            (formData.price > 0 || formData.isFreeEbook ? 34 : 0)
                                                        ))}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-700">
                                                {Math.min(100, (
                                                    (formData.title ? 33 : 0) +
                                                    (formData.description ? 33 : 0) +
                                                    (formData.price > 0 || formData.isFreeEbook ? 34 : 0)
                                                ))}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEbookPage;
