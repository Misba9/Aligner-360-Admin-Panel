'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';
import { LiveSessionService, type CreateLiveSessionDto } from '@/services/live-session.service';

const CreateLiveSessionPage = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<CreateLiveSessionDto>({
        title: '',
        description: '',
        topic: '',
        tags: [],
        scheduledAt: '',
        duration: 60,
        timezone: 'IST',
        meetLink: '',
        meetId: '',
        status: 'SCHEDULED',
        isActive: true,
        maxParticipants: undefined,
        isRecorded: false,
        recordingUrl: '',
        isFree: true,
        price: 0,
        currency: 'INR',
        thumbnailImage: '',
        materials: [],
        metaTitle: '',
        metaDescription: '',
    });

    const [currentTag, setCurrentTag] = useState('');
    const [currentMaterial, setCurrentMaterial] = useState('');
    const queryClient = useQueryClient()
    const createMutation = useMutation({
        mutationFn: (data: CreateLiveSessionDto) => LiveSessionService.createLiveSession(data),
        onSuccess: (response) => {
            router.push('/dashboard/live-sessions');
            queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
        },
        onError: (error: any) => {
            console.error('Error creating live session:', error);
            setErrors({ general: 'Failed to create live session. Please try again.' });
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                type === 'number' ? (value ? Number(value) : 0) :
                    value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const addTag = () => {
        if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), currentTag.trim()]
            }));
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
        }));
    };

    const addMaterial = () => {
        if (currentMaterial.trim() && !formData.materials?.includes(currentMaterial.trim())) {
            setFormData(prev => ({
                ...prev,
                materials: [...(prev.materials || []), currentMaterial.trim()]
            }));
            setCurrentMaterial('');
        }
    };

    const removeMaterial = (materialToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials?.filter(material => material !== materialToRemove) || []
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 50) {
            newErrors.description = 'Description must be at least 50 characters';
        }

        if (!formData.topic.trim()) {
            newErrors.topic = 'Topic is required';
        }

        if (!formData.scheduledAt) {
            newErrors.scheduledAt = 'Scheduled date and time is required';
        } else {
            const scheduledDate = new Date(formData.scheduledAt);
            if (scheduledDate <= new Date()) {
                newErrors.scheduledAt = 'Scheduled time must be in the future';
            }
        }

        if (!formData.duration || formData.duration < 15) {
            newErrors.duration = 'Duration must be at least 15 minutes';
        }

        if (!formData.meetLink.trim()) {
            newErrors.meetLink = 'Meet link is required';
        }

        if (!formData.isFree && (!formData.price || formData.price <= 0)) {
            newErrors.price = 'Price must be greater than 0 for paid sessions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Clean up the data before sending
            const cleanedData = {
                ...formData,
                maxParticipants: formData.maxParticipants || undefined,
                recordingUrl: formData.recordingUrl || undefined,
                thumbnailImage: formData.thumbnailImage || undefined,
                metaTitle: formData.metaTitle || undefined,
                metaDescription: formData.metaDescription || undefined,
                price: formData.isFree ? 0 : formData.price,
            };

            await createMutation.mutateAsync(cleanedData);
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/dashboard/live-sessions"
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create Live Session</h1>
                        <p className="text-gray-600 mt-1">Set up a new live session for your audience</p>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{errors.general}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Session Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Enter session title"
                            />
                            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Provide a detailed description of the session"
                            />
                            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                        </div>

                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                                Topic *
                            </label>
                            <input
                                type="text"
                                id="topic"
                                name="topic"
                                value={formData.topic}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.topic ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Main topic of the session"
                            />
                            {errors.topic && <p className="text-red-600 text-sm mt-1">{errors.topic}</p>}
                        </div>

                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                                URL Slug (Optional)
                            </label>
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                value={formData.slug || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="custom-url-slug"
                            />
                            <p className="text-gray-500 text-sm mt-1">Leave blank to auto-generate from title</p>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags
                        </label>
                        <div className="flex items-center space-x-2 mb-2">
                            <input
                                type="text"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                    }
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Add a tag"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.tags?.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Schedule & Settings */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule & Settings</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-2">
                                Scheduled Date & Time *
                            </label>
                            <input
                                type="datetime-local"
                                id="scheduledAt"
                                name="scheduledAt"
                                min={new Date().toISOString().slice(0, 16)}
                                value={(formData.scheduledAt)}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.scheduledAt ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                            {errors.scheduledAt && <p className="text-red-600 text-sm mt-1">{errors.scheduledAt}</p>}
                        </div>

                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (minutes) *
                            </label>
                            <input
                                type="number"
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                min="15"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.duration ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="60"
                            />
                            {errors.duration && <p className="text-red-600 text-sm mt-1">{errors.duration}</p>}
                        </div>

                        <div>
                            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                                Timezone
                            </label>
                            <select
                                id="timezone"
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Asia/Kolkata">India Standard Time</option>
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">Eastern Time</option>
                                <option value="America/Chicago">Central Time</option>
                                <option value="America/Denver">Mountain Time</option>
                                <option value="America/Los_Angeles">Pacific Time</option>
                                <option value="Europe/London">London</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                                Max Participants (Optional)
                            </label>
                            <input
                                type="number"
                                id="maxParticipants"
                                name="maxParticipants"
                                value={formData.maxParticipants || ''}
                                onChange={handleInputChange}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Leave blank for unlimited"
                            />
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                                Active (visible to public)
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isRecorded"
                                name="isRecorded"
                                checked={formData.isRecorded}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isRecorded" className="ml-2 text-sm text-gray-700">
                                Record session
                            </label>
                        </div>
                    </div>
                </div>

                {/* Meeting Details */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Meeting Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="meetLink" className="block text-sm font-medium text-gray-700 mb-2">
                                Meeting Link *
                            </label>
                            <input
                                type="url"
                                id="meetLink"
                                name="meetLink"
                                value={formData.meetLink}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.meetLink ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="https://meet.google.com/abc-def-ghi"
                            />
                            {errors.meetLink && <p className="text-red-600 text-sm mt-1">{errors.meetLink}</p>}
                        </div>

                        <div>
                            <label htmlFor="meetId" className="block text-sm font-medium text-gray-700 mb-2">
                                Meeting ID (Optional)
                            </label>
                            <input
                                type="text"
                                id="meetId"
                                name="meetId"
                                value={formData.meetId || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="abc-def-ghi"
                            />
                        </div>

                        {formData.isRecorded && (
                            <div>
                                <label htmlFor="recordingUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                    Recording URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    id="recordingUrl"
                                    name="recordingUrl"
                                    value={formData.recordingUrl || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing</h2>

                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isFree"
                                name="isFree"
                                checked={formData.isFree}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isFree" className="ml-2 text-sm text-gray-700">
                                Free session
                            </label>
                        </div>

                        {!formData.isFree && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.price ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="0.00"
                                    />
                                    {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                                </div>

                                <div>
                                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                                        Currency
                                    </label>
                                    <select
                                        id="currency"
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="INR">INR</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Media & Materials */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Media & Materials</h2>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="thumbnailImage" className="block text-sm font-medium text-gray-700 mb-2">
                                Thumbnail Image URL (Optional)
                            </label>
                            <input
                                type="url"
                                id="thumbnailImage"
                                name="thumbnailImage"
                                value={formData.thumbnailImage || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {/* Materials */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Session Materials
                            </label>
                            <div className="flex items-center space-x-2 mb-2">
                                <input
                                    type="url"
                                    value={currentMaterial}
                                    onChange={(e) => setCurrentMaterial(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addMaterial();
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://example.com/material.pdf"
                                />
                                <button
                                    type="button"
                                    onClick={addMaterial}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {formData.materials?.map((material, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <span className="text-sm text-gray-700 truncate">{material}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeMaterial(material)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">SEO Settings</h2>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                                Meta Title (Optional)
                            </label>
                            <input
                                type="text"
                                id="metaTitle"
                                name="metaTitle"
                                value={formData.metaTitle || ''}
                                onChange={handleInputChange}
                                maxLength={200}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="SEO title for the session"
                            />
                        </div>

                        <div>
                            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                                Meta Description (Optional)
                            </label>
                            <textarea
                                id="metaDescription"
                                name="metaDescription"
                                value={formData.metaDescription || ''}
                                onChange={handleInputChange}
                                maxLength={300}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="SEO description for the session"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <Link
                        href="/dashboard/live-sessions"
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Create Session
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateLiveSessionPage;
