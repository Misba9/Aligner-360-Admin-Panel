'use client';

import React, { useState } from 'react';
import { useUsers, useDeleteUser, useUpdateUserStatus, useToggleShowOnMap } from '@/hooks/useUsers';
import { UsersTable } from '@/components/users/UsersTable';
import { UsersSearch } from '@/components/users/UsersSearch';
import { UsersPageHeader } from '@/components/users/UsersPageHeader';
import UserStatistics from '@/components/users/UserStatistics';
import { UserActionDialog } from '@/components/users/UserActionDialog';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const UsersPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [limit] = useState(10);    // Dialog states
    const [showDialog, setShowDialog] = useState(false);
    const [dialogAction, setDialogAction] = useState<'delete' | 'activate' | 'deactivate' | 'showOnMap' | 'hideFromMap'>('delete');
    const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);

    // React Query hooks
    const { data, isLoading, error } = useUsers({
        page: currentPage,
        limit,
        search: searchTerm || undefined
    });

    const deleteUserMutation = useDeleteUser();
    const updateStatusMutation = useUpdateUserStatus();
    const toggleShowOnMapMutation = useToggleShowOnMap();

    const users = data?.users || [];
    const totalUsers = data?.total || 0;
    const totalPages = data?.totalPages || 0;

    // Handlers
    const handleSearch = () => {
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        setSelectedUser({
            id: userId,
            name: `${user.firstName} ${user.lastName}`
        });
        setDialogAction(currentStatus ? 'deactivate' : 'activate');
        setShowDialog(true);
    };
    const handleDeleteUser = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        setSelectedUser({
            id: userId,
            name: `${user.firstName} ${user.lastName}`
        });
        setDialogAction('delete');
        setShowDialog(true);
    };

    const handleToggleShowOnMap = (userId: string, currentShowOnMap: boolean) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        setSelectedUser({
            id: userId,
            name: `${user.firstName} ${user.lastName}`
        });
        setDialogAction(currentShowOnMap ? 'hideFromMap' : 'showOnMap');
        setShowDialog(true);
    };
    const handleConfirmAction = () => {
        if (!selectedUser) return;

        if (dialogAction === 'delete') {
            deleteUserMutation.mutate(selectedUser.id);
        } else if (dialogAction === 'showOnMap' || dialogAction === 'hideFromMap') {
            const showOnMap = dialogAction === 'showOnMap';
            toggleShowOnMapMutation.mutate({
                userId: selectedUser.id,
                showOnMap: showOnMap
            });
        } else {
            const isActivating = dialogAction === 'activate';
            updateStatusMutation.mutate({
                userId: selectedUser.id,
                isActive: isActivating
            });
        }

        setShowDialog(false);
        setSelectedUser(null);
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
        setSelectedUser(null);
    };

    // Loading state
    if (isLoading && currentPage === 1 && !searchTerm) {
        return (
            <div className="space-y-6">
                <UsersPageHeader totalUsers={0} />
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" text="Loading users..." />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6">
                <UsersPageHeader totalUsers={0} />
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">
                        Error loading users: {error instanceof Error ? error.message : 'Unknown error'}
                    </p>
                </div>
            </div>
        );
    } return (
        <div className="space-y-6">
            <UsersPageHeader totalUsers={totalUsers} />

            <UserStatistics />

            <UsersSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSearch={handleSearch}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <UsersTable
                    users={users}
                    onToggleStatus={handleToggleUserStatus}
                    onDeleteUser={handleDeleteUser}
                    onToggleShowOnMap={handleToggleShowOnMap}
                    loading={isLoading}
                />

                {!isLoading && users.length > 0 && (
                    <div className="border-t border-gray-200">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalUsers}
                            itemsPerPage={limit}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}                {!isLoading && users.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                        </p>
                    </div>
                )}
            </div>
            <UserActionDialog
                isOpen={showDialog}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmAction}
                action={dialogAction}
                userName={selectedUser?.name || ''}
                loading={deleteUserMutation.isPending || updateStatusMutation.isPending || toggleShowOnMapMutation.isPending}
            />
        </div>
    );
};

export default UsersPage;
