'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ProcessService, AlignerProcess } from '@/services/process.service';
import { Upload, Link as LinkIcon, Video, Clock, Calendar } from 'lucide-react';

const ProcessPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [currentProcess, setCurrentProcess] = useState<AlignerProcess | null>(null);
    const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        fetchCurrentProcess();
    }, []);

    const fetchCurrentProcess = async () => {
        try {
            const response = await ProcessService.getProcess();
            if (response.success && response.data) {
                setCurrentProcess(response.data);
            }
        } catch (error: any) {
            console.error('Error fetching process:', error);
            if (error.response?.status !== 404) {
                toast.error('Failed to fetch current process');
            }
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const validateAndSetFile = (file: File) => {
        const allowedTypes = ['video/mp4', 'video/mpeg', 'video/webm'];
        const maxSize = 200 * 1024 * 1024; 

        if (!allowedTypes.includes(file.type)) {
            toast.error('Please select a valid video file (MP4, MPEG, or WebM)');
            return;
        }

        if (file.size > maxSize) {
            toast.error('File size must be less than 100MB');
            return;
        }

        setVideoFile(file);
        toast.success(`File selected: ${file.name}`);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const validateYouTubeUrl = (url: string): boolean => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        return youtubeRegex.test(url);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (uploadMethod === 'file' && !videoFile) {
            toast.error('Please select a video file');
            return;
        }

        if (uploadMethod === 'url' && !videoUrl) {
            toast.error('Please enter a video URL');
            return;
        }

        if (uploadMethod === 'url' && !validateYouTubeUrl(videoUrl)) {
            toast.error('Please enter a valid YouTube URL');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            if (uploadMethod === 'file' && videoFile) {
                formData.append('videoFile', videoFile);
            } else {
                formData.append('videoUrl', videoUrl);
            }

            const response = await ProcessService.updateProcess(formData);

            if (response.success) {
                toast.success(response.message);
                await fetchCurrentProcess();

                // Reset form
                setVideoFile(null);
                setVideoUrl('');
                const fileInput = document.getElementById('videoFile') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to upload video';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
                        <div className="flex items-center">
                            <Video className="w-8 h-8 text-white mr-3" />
                            <div>
                                <h1 className="text-2xl font-bold text-white">Process Management</h1>
                                <p className="text-blue-100 text-sm">
                                    Upload videos or YouTube links for the aligner process
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Current Process Info */}
                        {currentProcess && (
                            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                                <div className="flex items-center mb-4">
                                    <Video className="w-6 h-6 text-blue-600 mr-2" />
                                    <h3 className="text-lg font-semibold text-blue-900">Current Process</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-blue-700">
                                            <LinkIcon className="w-4 h-4 mr-2" />
                                            <span className="font-medium">Video URL:</span>
                                        </div>
                                        <p className="text-sm text-blue-600 break-all bg-white p-2 rounded border">
                                            {currentProcess.videoUrl}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* Upload Method Selection */}
                        <div className="mb-6">
                            <label className="text-base font-medium text-gray-900 mb-4 block">
                                Choose Upload Method
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    className={`relative rounded-lg border-2 cursor-pointer transition-all ${uploadMethod === 'file'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    onClick={() => setUploadMethod('file')}
                                >
                                    <div className="p-4">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="upload-method"
                                                value="file"
                                                checked={uploadMethod === 'file'}
                                                onChange={() => setUploadMethod('file')}
                                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <Upload className="w-5 h-5 ml-3 mr-2 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Upload Video File</p>
                                                <p className="text-xs text-gray-500">MP4, MPEG, or WebM (max 200MB)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`relative rounded-lg border-2 cursor-pointer transition-all ${uploadMethod === 'url'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    onClick={() => setUploadMethod('url')}
                                >
                                    <div className="p-4">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="upload-method"
                                                value="url"
                                                checked={uploadMethod === 'url'}
                                                onChange={() => setUploadMethod('url')}
                                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <LinkIcon className="w-5 h-5 ml-3 mr-2 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">YouTube Video URL</p>
                                                <p className="text-xs text-gray-500">Paste a YouTube video link</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* File Upload */}
                            {uploadMethod === 'file' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Video File
                                    </label>
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragActive
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            id="videoFile"
                                            type="file"
                                            accept="video/mp4,video/mpeg,video/webm"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        <div className="space-y-4">
                                            <div className="flex justify-center">
                                                <Upload className="h-12 w-12 text-gray-400" />
                                            </div>
                                            {videoFile ? (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Selected: {videoFile.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Size: {formatFileSize(videoFile.size)}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => document.getElementById('videoFile')?.click()}
                                                        className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                                                    >
                                                        Choose a different file
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <p className="text-sm text-gray-600">
                                                        <button
                                                            type="button"
                                                            onClick={() => document.getElementById('videoFile')?.click()}
                                                            className="font-medium text-blue-600 hover:text-blue-500"
                                                        >
                                                            Click to upload
                                                        </button>{' '}
                                                        or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        MP4, MPEG, or WebM files up to 100MB
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* URL Upload */}
                            {uploadMethod === 'url' && (
                                <div>
                                    <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                        YouTube Video URL
                                    </label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="url"
                                            id="videoUrl"
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Enter a valid YouTube video URL
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5 mr-2" />
                                            {currentProcess ? 'Update Process' : 'Create Process'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessPage;
