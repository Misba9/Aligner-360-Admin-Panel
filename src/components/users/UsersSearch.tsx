'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UsersSearchProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onSearch: () => void;
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const UsersSearch: React.FC<UsersSearchProps> = ({
    searchTerm,
    onSearchChange,
    onSearch,
    onKeyPress
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search users by name, email..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                        onKeyPress={onKeyPress}
                    />
                </div>
                <Button onClick={onSearch} className="bg-blue-600 hover:bg-blue-700">
                    Search
                </Button>
            </div>
        </div>
    );
};
