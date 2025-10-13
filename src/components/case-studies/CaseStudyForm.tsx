'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { AdminCaseStudyService, CreateCaseStudyData, UpdateCaseStudyData } from '@/services/casestudy.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Save,
    Upload,
    User,
    Stethoscope,
    Camera,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface CaseStudyFormProps {
    mode: 'create' | 'edit';
}

const CaseStudyForm: React.FC<CaseStudyFormProps> = ({ mode }) => {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const caseStudyId = mode === 'edit' ? params.id as string : null;

    const [formData, setFormData] = useState<CreateCaseStudyData>({
        name: '',
        age: '',
        case: '',
        gender: 'M',
        upper: '',
        lower: '',
    });

    const [files, setFiles] = useState<{
        imageBefore?: File;
        imageAfter?: File;
    }>({});

    const [imagePreview, setImagePreview] = useState<{
        imageBefore?: string;
        imageAfter?: string;
    }>({});

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch existing data for edit mode
    const { data: existingData, isLoading } = useQuery({
        queryKey: ['case-study', caseStudyId],
        queryFn: () => caseStudyId ? AdminCaseStudyService.getCaseStudyById(caseStudyId) : null,
        enabled: mode === 'edit' && !!caseStudyId,
    });

    // Load existing data when in edit mode
    useEffect(() => {
        if (mode === 'edit' && existingData?.data) {
            const data = existingData.data;
            setFormData({
                name: data.name,
                age: data.age,
                case: data.case,
                gender: data.gender,
                upper: data.upper,
                lower: data.lower,
            });
            setImagePreview({
                imageBefore: data.imageBefore,
                imageAfter: data.imageAfter,
            });
        }
    }, [mode, existingData]);

    const createMutation = useMutation({
        mutationFn: (data: { formData: CreateCaseStudyData; files: any }) =>
            AdminCaseStudyService.createCaseStudy(data.formData, data.files),
        onSuccess: () => {
            toast.success('Case study created successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-case-studies'] });
            router.push('/dashboard/case-studies');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create case study');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: string; formData: UpdateCaseStudyData; files: any }) =>
            AdminCaseStudyService.updateCaseStudy(data.id, data.formData, data.files),
        onSuccess: () => {
            toast.success('Case study updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-case-studies'] });
            queryClient.invalidateQueries({ queryKey: ['case-study', caseStudyId] });
            router.push('/dashboard/case-studies');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update case study');
        },
    });

    const handleInputChange = (field: keyof CreateCaseStudyData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileChange = (field: 'imageBefore' | 'imageAfter', file: File | null) => {
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please select a valid image file (JPEG, PNG, WebP)');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            setFiles(prev => ({
                ...prev,
                [field]: file
            }));

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(prev => ({
                ...prev,
                [field]: previewUrl
            }));
        } else {
            setFiles(prev => ({
                ...prev,
                [field]: undefined
            }));
            setImagePreview(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Validation
        if (!formData.name.trim()) {
            toast.error('Patient name is required');
            return;
        }
        if (!formData.age.trim()) {
            toast.error('Patient age is required');
            return;
        }
        if (!formData.case.trim()) {
            toast.error('Case description is required');
            return;
        }
        if (!formData.upper.trim()) {
            toast.error('Upper treatment is required');
            return;
        }
        if (!formData.lower.trim()) {
            toast.error('Lower treatment is required');
            return;
        }

        // For create mode, both images are required
        if (mode === 'create') {
            if (!files.imageBefore) {
                toast.error('Before image is required');
                return;
            }
            if (!files.imageAfter) {
                toast.error('After image is required');
                return;
            }
        }

        setIsSubmitting(true);

        try {
            if (mode === 'create') {
                createMutation.mutate({ formData, files });
            } else if (caseStudyId) {
                updateMutation.mutate({ id: caseStudyId, formData, files });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeImage = (field: 'imageBefore' | 'imageAfter') => {
        setFiles(prev => ({
            ...prev,
            [field]: undefined
        }));
        setImagePreview(prev => ({
            ...prev,
            [field]: undefined
        }));
    };

    if (mode === 'edit' && isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/dashboard/case-studies"
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {mode === 'create' ? 'Create Case Study' : 'Edit Case Study'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {mode === 'create'
                                ? 'Add a new dental case study to showcase treatment results'
                                : 'Update the case study details and images'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Patient Information */}
                    <Card className="shadow-lg border-gray-200">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                            <CardTitle className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-blue-600" />
                                <span>Patient Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div>
                                <Label htmlFor="name">Patient Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Enter patient name"
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="age">Age *</Label>
                                <Input
                                    id="age"
                                    value={formData.age}
                                    onChange={(e) => handleInputChange('age', e.target.value)}
                                    placeholder="Enter patient age"
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="gender">Gender *</Label>
                                <select
                                    id="gender"
                                    value={formData.gender}
                                    onChange={(e) => handleInputChange('gender', e.target.value as 'M' | 'F')}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Case Details */}
                    <Card className="shadow-lg border-gray-200">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                            <CardTitle className="flex items-center space-x-2">
                                <Stethoscope className="h-5 w-5 text-green-600" />
                                <span>Case Details</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div>
                                <Label htmlFor="case">Case Description *</Label>
                                <Textarea
                                    id="case"
                                    value={formData.case}
                                    onChange={(e) => handleInputChange('case', e.target.value)}
                                    placeholder="Describe the case, condition, and treatment approach..."
                                    rows={4}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="upper">Upper Treatment *</Label>
                                <Textarea
                                    id="upper"
                                    value={formData.upper}
                                    onChange={(e) => handleInputChange('upper', e.target.value)}
                                    placeholder="Describe upper jaw/teeth treatment..."
                                    rows={3}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="lower">Lower Treatment *</Label>
                                <Textarea
                                    id="lower"
                                    value={formData.lower}
                                    onChange={(e) => handleInputChange('lower', e.target.value)}
                                    placeholder="Describe lower jaw/teeth treatment..."
                                    rows={3}
                                    required
                                    className="mt-1"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Images Section */}
                <Card className="shadow-lg border-gray-200">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                        <CardTitle className="flex items-center space-x-2">
                            <Camera className="h-5 w-5 text-purple-600" />
                            <span>Treatment Images</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Before Image */}
                            <div>
                                <Label className="text-base font-semibold text-gray-700">
                                    Before Image {mode === 'create' ? '*' : ''}
                                </Label>
                                <div className="mt-2">
                                    {imagePreview.imageBefore ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview.imageBefore}
                                                alt="Before treatment"
                                                className="w-full h-64 object-cover rounded-lg border border-gray-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage('imageBefore')}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="mt-4">
                                                <label htmlFor="imageBefore" className="cursor-pointer">
                                                    <span className="mt-2 block text-sm font-medium text-gray-900">
                                                        Upload before image
                                                    </span>
                                                    <span className="mt-2 block text-sm text-gray-500">
                                                        PNG, JPG, WebP up to 5MB
                                                    </span>
                                                    <input
                                                        id="imageBefore"
                                                        name="imageBefore"
                                                        type="file"
                                                        className="sr-only"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileChange('imageBefore', e.target.files?.[0] || null)}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* After Image */}
                            <div>
                                <Label className="text-base font-semibold text-gray-700">
                                    After Image {mode === 'create' ? '*' : ''}
                                </Label>
                                <div className="mt-2">
                                    {imagePreview.imageAfter ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview.imageAfter}
                                                alt="After treatment"
                                                className="w-full h-64 object-cover rounded-lg border border-gray-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage('imageAfter')}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="mt-4">
                                                <label htmlFor="imageAfter" className="cursor-pointer">
                                                    <span className="mt-2 block text-sm font-medium text-gray-900">
                                                        Upload after image
                                                    </span>
                                                    <span className="mt-2 block text-sm text-gray-500">
                                                        PNG, JPG, WebP up to 5MB
                                                    </span>
                                                    <input
                                                        id="imageAfter"
                                                        name="imageAfter"
                                                        type="file"
                                                        className="sr-only"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileChange('imageAfter', e.target.files?.[0] || null)}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/dashboard/case-studies')}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting
                            ? (mode === 'create' ? 'Creating...' : 'Updating...')
                            : (mode === 'create' ? 'Create Case Study' : 'Update Case Study')
                        }
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CaseStudyForm;
