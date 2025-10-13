'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AlignerCaseService, CreateAlignerCaseDto } from '@/services/alignercase.service';
import { UserService } from '@/services/user.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft,
    Save,
    User,
    FileText,
    Smile,
    Users
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const CreateAlignerCasePage: React.FC = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState<CreateAlignerCaseDto>({
        name: '',
        quantity: '',
        userId: '',
    });

    // Fetch users for dropdown
    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['users-list'],
        queryFn: () => UserService.getAllUsers(1, 100),
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateAlignerCaseDto) => AlignerCaseService.createAlignerCase(data),
        onSuccess: (response) => {
            toast.success('Aligner case allocated successfully!');
            queryClient.invalidateQueries({ queryKey: ['aligner-cases'] })
            queryClient.invalidateQueries({ queryKey: ['aligner-case-statistics'] })
            router.push('/dashboard/aligner-cases');
        },
        onError: (error: any) => {
            console.error('Create aligner case error:', error);
            const message = error.response?.data?.message || 'Failed to allocate aligner case';
            toast.error(message);
        },
        onSettled: () => {
            setIsSubmitting(false);
        },
    });

    const users = usersData?.users || [];

    const handleInputChange = (field: keyof CreateAlignerCaseDto, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error('Case name is required');
            return;
        }

        if (!formData.quantity.trim()) {
            toast.error('Quantity is required');
            return;
        }

        if (!formData.userId) {
            toast.error('Please select a user to allocate this case to');
            return;
        }

        setIsSubmitting(true);
        createMutation.mutate(formData);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/dashboard/aligner-cases"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                        Back to Aligner Cases
                    </Link>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Smile className="w-5 h-5 text-white" />
                    </div>
                    <div className="hidden sm:block w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500 font-medium">Allocate New Case</span>
                </div>
            </div>

            <div className="mt-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Allocate Aligner Case
                </h1>
                <p className="text-gray-600 mt-2 text-lg">Assign a new aligner case to a user</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Case Information Card */}
                <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-100">
                        <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            Case Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                    Case Name *
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="e.g., Upper Arch Alignment"
                                    className="border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg text-base"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700">
                                    Quantity *
                                </Label>
                                <Input
                                    id="quantity"
                                    type="text"
                                    value={formData.quantity}
                                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                                    placeholder="e.g., 20 aligners, 1 set"
                                    className="border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg text-base"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* User Assignment Card */}
                <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl border-b border-gray-100">
                        <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            User Assignment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="userId" className="text-sm font-semibold text-gray-700">
                                Allocate to User *
                            </Label>
                            <select
                                id="userId"
                                value={formData.userId}
                                onChange={(e) => handleInputChange('userId', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                required
                                disabled={usersLoading}
                            >
                                <option value="">
                                    {usersLoading ? 'Loading users...' : 'Select a user'}
                                </option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName} ({user.email})
                                        {user.type && ` - ${user.type}`}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-gray-500 mt-1">
                                Select the dentist or orthodontist to allocate this case to
                            </p>
                        </div>

                        {formData.userId && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-800">
                                        Selected User
                                    </span>
                                </div>
                                {(() => {
                                    const selectedUser = users.find(u => u.id === formData.userId);
                                    return selectedUser ? (
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p className="font-medium">
                                                {selectedUser.firstName} {selectedUser.lastName}
                                            </p>
                                            <p>{selectedUser.email}</p>
                                            {selectedUser.type && (
                                                <p className="text-blue-600">Type: {selectedUser.type}</p>
                                            )}
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons Card */}
                <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-2xl">
                    <CardContent className="p-8">
                        <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/aligner-cases')}
                                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {isSubmitting ? 'Allocating...' : 'Allocate Case'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

export default CreateAlignerCasePage;
