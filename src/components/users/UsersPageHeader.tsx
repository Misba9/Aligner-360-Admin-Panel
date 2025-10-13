'use client';

import React from 'react';
import { Users } from 'lucide-react';

interface UsersPageHeaderProps {
    totalUsers: number;
}

export const UsersPageHeader: React.FC<UsersPageHeaderProps> = ({ totalUsers }) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    Users Management
                </h1>
                <p className="text-gray-600 mt-1">
                    Manage and view all registered users
                </p>
            </div>
            <div className="text-sm text-gray-500">
                Total Users: {totalUsers}
            </div>
        </div>
    );
};
