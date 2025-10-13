'use client';

import React from 'react';
import { useUserStatistics } from '@/hooks/useUsers';
import { Users, UserCheck, UserX, Stethoscope, Activity } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, loading, color }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
                <div className={`flex-shrink-0 `}>
                    <div className={`p-3 rounded-lg bg-opacity-20 ${color}`}>
                        {icon}
                    </div>
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    {loading ? (
                        <div className="mt-1">
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ) : (
                        <p className="text-2xl font-semibold text-gray-900">
                            {value.toLocaleString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const UserStatistics: React.FC = () => {
    const { data, isLoading, error } = useUserStatistics();

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm">
                    Failed to load statistics: {error instanceof Error ? error.message : 'Unknown error'}
                </p>
            </div>
        );
    }

    const stats = data?.data;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <StatCard
                title="Total Users"
                value={stats?.totalUsers || 0}
                icon={<Users className="h-6 w-6 text-white" />}
                color='bg-blue-600'
                loading={isLoading}
            />
            <StatCard
                title="Verified Users"
                value={stats?.totalVerifiedUsers || 0}
                icon={<UserCheck className="h-6 w-6 text-white" />}
                loading={isLoading}
                color='bg-green-600'
            />
            <StatCard
                title="Unverified Users"
                value={stats?.totalUnverifiedUsers || 0}
                icon={<UserX className="h-6 w-6 text-white" />}
                loading={isLoading}
                color='bg-red-600'
            />
            <StatCard
                title="Dentists"
                value={stats?.totalDentists || 0}
                icon={<Stethoscope className="h-6 w-6 text-white" />}
                loading={isLoading}
                color='bg-purple-600'
            />
            <StatCard
                title="Orthodontists"
                value={stats?.totalOrthodontists || 0}
                icon={<Activity className="h-6 w-6 text-white" />}
                loading={isLoading}
                color='bg-indigo-600'
            />
        </div>
    );
};

export default UserStatistics;
